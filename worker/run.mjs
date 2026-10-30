// worker/run.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { supabaseAdmin, requireSupabase } from './lib/supabase.mjs';
import { politeFetch } from './lib/fetch.mjs';
import { normalize } from './lib/normalize.mjs';
import { computeDiff } from './lib/diff.mjs';
import { classify } from './lib/classify.mjs';
import { extractFields } from './lib/extract.mjs';
import { ground } from './lib/ground.mjs';
import { generateSummary } from './lib/summary.mjs';
import { fanoutPendingApproved } from './lib/fanout.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// In-memory snapshot cache for offline and replay modes
const inMemorySnapshots = new Map();

/**
 * Executes change detection for a single source given raw HTML/text
 */
export async function processSourceContent(source, rawBody, options = {}) {
  const {
    supabase = supabaseAdmin,
    isReplay = false,
    synthetic = false,
    fetchedAt = new Date().toISOString(),
    fetchStartedAt = new Date().toISOString()
  } = options;

  console.log(`[Worker] Processing source: ${source.id} (${source.name})`);

  // 1. Normalize
  const normalizedText = normalize(rawBody, {
    selector: source.selector,
    ignorePatterns: source.ignore_patterns || []
  });

  if (!normalizedText || normalizedText.trim().length === 0) {
    console.warn(`[Worker] Normalized text empty for ${source.id}. Flagging structure-changed.`);
    if (supabase) {
      await supabase
        .from('sources')
        .update({
          status: 'structure-changed',
          last_error: 'Selector returned empty text. Website structure may have changed.',
          last_checked_at: fetchedAt
        })
        .eq('id', source.id);
    }
    return { status: 'structure-changed' };
  }

  const currentHash = sha256(normalizedText);

  // 2. Retrieve previous snapshot
  let prevSnapshot = null;
  if (supabase) {
    const { data: latestSnaps } = await supabase
      .from('snapshots')
      .select('*')
      .eq('source_id', source.id)
      .order('fetched_at', { ascending: false })
      .limit(1);

    if (latestSnaps && latestSnaps.length > 0) {
      prevSnapshot = latestSnaps[0];
    }
  }

  // Fallback to in-memory cache for replay or offline runs
  if (!prevSnapshot && inMemorySnapshots.has(source.id)) {
    prevSnapshot = inMemorySnapshots.get(source.id);
  }

  // 3. Compare hash
  if (prevSnapshot && prevSnapshot.content_hash === currentHash) {
    console.log(`[Worker] No change detected for ${source.id} (hash match).`);
    if (supabase) {
      await supabase
        .from('sources')
        .update({
          last_checked_at: fetchedAt,
          status: 'ok',
          last_error: null
        })
        .eq('id', source.id);
    }
    return { status: 'no-change' };
  }

  // 4. Save new snapshot
  let newSnapshotId = 'snap-' + Date.now();
  if (supabase) {
    const { data: snapDoc, error: snapErr } = await supabase
      .from('snapshots')
      .insert({
        source_id: source.id,
        fetched_at: fetchedAt,
        http_status: 200,
        bytes: Buffer.byteLength(normalizedText, 'utf8'),
        content_hash: currentHash,
        text: normalizedText.slice(0, 200000)
      })
      .select('id')
      .single();

    if (!snapErr && snapDoc) {
      newSnapshotId = snapDoc.id;
    }
  }

  // Store in memory for replay/offline continuity
  inMemorySnapshots.set(source.id, {
    id: newSnapshotId,
    source_id: source.id,
    content_hash: currentHash,
    text: normalizedText,
    fetched_at: fetchedAt
  });

  // If this is the initial snapshot, no diff can be computed
  if (!prevSnapshot) {
    console.log(`[Worker] Initial baseline snapshot saved for ${source.id}.`);
    if (supabase) {
      await supabase
        .from('sources')
        .update({
          last_checked_at: fetchedAt,
          last_changed_at: fetchedAt,
          status: 'ok'
        })
        .eq('id', source.id);
    }
    return { status: 'baseline-saved' };
  }

  // 5. Compute diff
  const diff = computeDiff(prevSnapshot.text, normalizedText);
  const materiality = classify(diff);
  console.log(`[Worker] Diff computed for ${source.id}: ${diff.length} diff lines. Classified as: ${materiality.toUpperCase()}`);

  if (materiality === 'cosmetic') {
    if (supabase) {
      await supabase
        .from('sources')
        .update({
          last_checked_at: fetchedAt,
          last_changed_at: fetchedAt,
          status: 'ok'
        })
        .eq('id', source.id);
    }
    return { status: 'cosmetic-change', diff };
  }

  // 6. Material Change: Extract fields
  const addedLines = diff.filter(d => d.type === 'add').map(d => d.line);
  const fields = await extractFields(addedLines, normalizedText, {
    useLLM: Boolean(process.env.GEMINI_API_KEY)
  });

  // 7. Grounding check
  const groundingResult = ground(fields, normalizedText);
  console.log(`[Worker] Grounding check for ${source.id}: ${groundingResult.status} (${groundingResult.notes.length} notes)`);

  // 8. Generate Summary
  const primaryEvidence = fields[0]?.evidence || addedLines[0] || 'Official update notified';
  const { summary, method: summaryMethod } = await generateSummary({
    schemeName: source.name,
    sourceName: source.name,
    evidence: primaryEvidence,
    checkedAt: fetchedAt
  }, {
    useLLM: Boolean(process.env.GEMINI_API_KEY)
  });

  // 9. Insert pending change record
  let changeRecord = null;
  if (supabase) {
    const { data: ch, error: chErr } = await supabase
      .from('changes')
      .insert({
        source_id: source.id,
        scheme_ids: source.scheme_ids || [],
        from_snapshot_id: prevSnapshot.id,
        to_snapshot_id: newSnapshotId,
        detected_at: fetchedAt,
        fetch_started_at: fetchStartedAt,
        materiality,
        diff,
        fields,
        grounding: groundingResult.status,
        grounding_notes: groundingResult.notes,
        summary,
        summary_method: summaryMethod,
        review_status: 'pending',
        synthetic: synthetic
      })
      .select('*')
      .single();

    if (chErr) {
      console.error(`[Worker] Failed to save change record:`, chErr.message);
    } else {
      changeRecord = ch;
      console.log(`[Worker] PENDING change created for review: ${ch.id} (Material: ${materiality}, Grounding: ${groundingResult.status})`);
    }

    await supabase
      .from('sources')
      .update({
        last_checked_at: fetchedAt,
        last_changed_at: fetchedAt,
        status: 'ok'
      })
      .eq('id', source.id);
  }

  return {
    status: 'material-change',
    change: changeRecord,
    diff,
    fields,
    grounding: groundingResult
  };
}

/**
 * Replay mode: reads local corpus HTML pairs and processes them offline
 */
export async function runReplay(corpusDir) {
  const fullPath = path.resolve(corpusDir);
  console.log(`[Worker] Starting REPLAY mode on: ${fullPath}`);

  if (!fs.existsSync(fullPath)) {
    console.error(`[Worker] Corpus directory not found: ${fullPath}`);
    process.exit(1);
  }

  const manifestPath = path.join(fullPath, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`[Worker] manifest.json not found in ${fullPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const sourceId = manifest.sourceId || 'pmkisan-home';

  // Load source config
  let source = {
    id: sourceId,
    name: 'PM-KISAN National Portal',
    selector: '.notification-box, body',
    ignore_patterns: ['period-wise number of farmers', 'visitor count'],
    scheme_ids: ['pm-kisan']
  };

  if (supabaseAdmin) {
    const { data: src } = await supabaseAdmin.from('sources').select('*').eq('id', sourceId).single();
    if (src) source = src;
  }

  for (const pair of manifest.pairs) {
    console.log(`\n--- Replaying pair: ${pair.from} -> ${pair.to} (${pair.origin}) ---`);
    const file1 = path.join(fullPath, pair.from);
    const file2 = path.join(fullPath, pair.to);

    if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
      console.error(`Missing files for pair: ${file1} or ${file2}`);
      continue;
    }

    const html1 = fs.readFileSync(file1, 'utf8');
    const html2 = fs.readFileSync(file2, 'utf8');

    // Simulate baseline
    await processSourceContent(source, html1, {
      isReplay: true,
      synthetic: pair.origin === 'synthetic',
      fetchedAt: '2026-10-30T07:00:00Z'
    });

    // Simulate change
    const result = await processSourceContent(source, html2, {
      isReplay: true,
      synthetic: pair.origin === 'synthetic',
      fetchedAt: pair.capturedAt || '2026-10-30T08:00:00Z'
    });

    console.log(`[Replay Result]:`, result.status);
  }
  console.log('\n[Worker] Replay finished.');
}

/**
 * Live check pass over all due sources
 */
export async function runLivePass() {
  const supabase = requireSupabase();
  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('mode', 'auto');

  if (error || !sources) {
    console.error('[Worker] Could not fetch sources from Supabase:', error?.message);
    return;
  }

  const now = Date.now();
  for (const source of sources) {
    const intervalMs = (source.interval_min || 60) * 60 * 1000;
    const lastChecked = source.last_checked_at ? new Date(source.last_checked_at).getTime() : 0;

    if (now - lastChecked < intervalMs) {
      continue; // Not due yet
    }

    console.log(`[Worker] Checking live source: ${source.id} (${source.url})`);
    const fetchStartedAt = new Date().toISOString();
    const fetchResult = await politeFetch(source.url, {
      etag: null
    });

    if (!fetchResult.ok) {
      console.warn(`[Worker] Source ${source.id} failed to fetch: ${fetchResult.status} ${fetchResult.error || ''}`);
      await supabase
        .from('sources')
        .update({
          status: fetchResult.status === 403 || fetchResult.status === 429 ? 'blocked' : 'error',
          last_error: fetchResult.error || `HTTP ${fetchResult.status}`,
          last_checked_at: new Date().toISOString()
        })
        .eq('id', source.id);
      continue;
    }

    await processSourceContent(source, fetchResult.body, {
      fetchedAt: new Date().toISOString(),
      fetchStartedAt
    });
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--replay')) {
    const dirIdx = args.indexOf('--replay') + 1;
    const corpusDir = args[dirIdx] || '../data/eval/corpus/pmkisan-home';
    await runReplay(corpusDir);
    return;
  }

  if (args.includes('--watch')) {
    console.log('[Worker] Running in --watch mode (polling and fanning out approved changes every 10s)...');
    const loop = async () => {
      try {
        if (supabaseAdmin) {
          // 1. Fan out any changes approved by human reviewer
          await fanoutPendingApproved(supabaseAdmin);
          // 2. Run live pass over due sources
          await runLivePass();
        }
      } catch (err) {
        console.error('[Worker Watch Loop Error]:', err.message);
      }
    };

    await loop();
    setInterval(loop, 10000);
    return;
  }

  // Default: single pass
  console.log('[Worker] Running single check pass...');
  await runLivePass();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error('[Worker Fatal Error]:', err);
    process.exit(1);
  });
}
