// worker/probe.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { politeFetch } from './lib/fetch.mjs';
import { normalize } from './lib/normalize.mjs';
import { supabaseAdmin } from './lib/supabase.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function probe() {
  console.log('=== Shetkari SuchnaSetu: Phase 0 Source Probe ===\n');

  const sourcesPath = path.resolve(__dirname, '../data/sources.seed.json');
  const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

  const report = [];

  for (const source of sources) {
    console.log(`Probing: [${source.id}] ${source.name} (${source.url})`);

    const result = {
      id: source.id,
      name: source.name,
      url: source.url,
      type: source.type,
      mode: source.mode,
      checkedAt: new Date().toISOString()
    };

    if (source.mode === 'manual' || source.type === 'pdf') {
      console.log(`  -> Source flagged as ${source.mode} / ${source.type}. Recorded.`);
      result.status = source.status;
      result.note = source.tos_note || 'Manual review required';
      report.push(result);
      continue;
    }

    try {
      const fetchRes = await politeFetch(source.url, { retries: 1 });
      result.httpStatus = fetchRes.status;
      result.durationMs = fetchRes.durationMs;
      result.contentType = fetchRes.contentType;
      result.bytes = fetchRes.bytes;

      if (!fetchRes.ok) {
        result.status = fetchRes.status === 403 || fetchRes.status === 429 ? 'blocked' : 'error';
        result.error = fetchRes.error || `HTTP ${fetchRes.status}`;
        console.warn(`  -> FAILED: HTTP ${fetchRes.status}`);
      } else {
        const normalized = normalize(fetchRes.body, {
          selector: source.selector,
          ignorePatterns: source.ignore_patterns || []
        });

        result.normalizedLength = normalized.length;
        result.selectorWorked = normalized.length > 50;
        result.status = result.selectorWorked ? 'ok' : 'structure-changed';

        console.log(`  -> OK: HTTP ${fetchRes.status}, ${fetchRes.durationMs}ms, ${fetchRes.bytes} bytes, Selector extracted: ${normalized.length} chars`);
      }
    } catch (err) {
      result.status = 'error';
      result.error = err.message;
      console.error(`  -> ERROR: ${err.message}`);
    }

    report.push(result);
  }

  // Save probe report to data/eval/probe-report.json
  const reportPath = path.resolve(__dirname, '../data/eval/probe-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nProbe complete. Report saved to: ${reportPath}`);

  // If supabase is connected, update sources table with probe results
  if (supabaseAdmin) {
    for (const r of report) {
      await supabaseAdmin
        .from('sources')
        .update({
          status: r.status,
          last_error: r.error || null,
          last_checked_at: r.checkedAt
        })
        .eq('id', r.id);
    }
    console.log('Source statuses updated in Supabase database.');
  }
}

probe().catch(err => {
  console.error('[Probe Fatal Error]:', err);
  process.exit(1);
});

