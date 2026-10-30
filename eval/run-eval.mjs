

// eval/run-eval.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractFieldsWithRegex } from '../worker/lib/extract.mjs';
import { ground } from '../worker/lib/ground.mjs';
import { computeDiff } from '../worker/lib/diff.mjs';
import { classify } from '../worker/lib/classify.mjs';
import { normalize } from '../worker/lib/normalize.mjs';
import { matchProfileToScheme } from '../worker/lib/match.mjs';
import { supabaseAdmin } from '../worker/lib/supabase.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function wilson(k, n, z = 1.96) {
  if (!n) return [null, null];
  const p = k / n, d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n), m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)];
}

async function runEval() {
  console.log('=== Shetkari SuchnaSetu: Empirical Evaluation Pipeline (E1 - E4) ===\n');

  const evalRuns = [];

  // ==========================================
  // E1: EXTRACTION ACCURACY & GROUNDING
  // ==========================================
  console.log('--- E1: Evaluating Field Extraction & Grounding Pass Rate ---');
  const labelsPath = path.resolve(__dirname, '../data/eval/labels.json');
  if (fs.existsSync(labelsPath)) {
    const labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
    let totalTargetFields = 0;
    let exactMatches = 0;
    let totalExtracted = 0;
    let groundedFields = 0;
    const fieldTypeAccuracy = {};

    for (const doc of labels) {
      const extracted = extractFieldsWithRegex([doc.text]);
      totalExtracted += extracted.length;

      const groundRes = ground(extracted, doc.text);
      if (groundRes.status === 'grounded') {
        groundedFields += extracted.length;
      }

      for (const target of doc.fields) {
        totalTargetFields++;
        if (!fieldTypeAccuracy[target.name]) {
          fieldTypeAccuracy[target.name] = { total: 0, matched: 0 };
        }
        fieldTypeAccuracy[target.name].total++;

        const found = extracted.find(e =>
          e.name === target.name &&
          e.value.toLowerCase().replace(/\s+/g, '') === target.value.toLowerCase().replace(/\s+/g, '')
        );

        if (found) {
          exactMatches++;
          fieldTypeAccuracy[target.name].matched++;
        }
      }
    }

    const accuracy = totalTargetFields > 0 ? exactMatches / totalTargetFields : 0;
    const groundingPassRate = totalExtracted > 0 ? groundedFields / totalExtracted : 0;
    const interval = wilson(exactMatches, totalTargetFields);

    console.log(`E1 Result: ${exactMatches}/${totalTargetFields} fields extracted correctly (${(accuracy * 100).toFixed(1)}%). Grounding rate: ${(groundingPassRate * 100).toFixed(1)}%`);
    console.log(`95% Wilson Interval: [${(interval[0] * 100).toFixed(1)}%, ${(interval[1] * 100).toFixed(1)}%]`);

    evalRuns.push({
      type: 'extraction',
      corpus_version: 'v1.0',
      n: totalTargetFields,
      synthetic: false,
      metrics: {
        accuracy: Number(accuracy.toFixed(3)),
        groundingPassRate: Number(groundingPassRate.toFixed(3)),
        interval: [Number(interval[0].toFixed(3)), Number(interval[1].toFixed(3))],
        byField: fieldTypeAccuracy
      },
      notes: 'Hand-labelled primary notice excerpts evaluated with deterministic extractor.',
      git_sha: 'local'
    });
  }

  // ==========================================
  // E2: CHANGE-DETECTION REPLAY
  // ==========================================
  console.log('\n--- E2: Evaluating Change Detection (Material vs Cosmetic) ---');
  const corpusDir = path.resolve(__dirname, '../data/eval/corpus/pmkisan-home');
  const manifestPath = path.join(corpusDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let tp = 0, fp = 0, fn = 0, tn = 0;

    for (const pair of manifest.pairs) {
      const h1 = fs.readFileSync(path.join(corpusDir, pair.from), 'utf8');
      const h2 = fs.readFileSync(path.join(corpusDir, pair.to), 'utf8');

      const norm1 = normalize(h1, { selector: '.notification-box, body' });
      const norm2 = normalize(h2, { selector: '.notification-box, body' });

      const diff = computeDiff(norm1, norm2);
      const predictedMaterial = classify(diff) === 'material';
      const actualMaterial = pair.expectedMaterial;

      if (predictedMaterial && actualMaterial) tp++;
      else if (predictedMaterial && !actualMaterial) fp++;
      else if (!predictedMaterial && actualMaterial) fn++;
      else tn++;
    }

    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 1;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 1;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 1;

    console.log(`E2 Result: TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn} -> Precision: ${(precision * 100).toFixed(1)}%, Recall: ${(recall * 100).toFixed(1)}%, F1: ${(f1 * 100).toFixed(1)}%`);

    evalRuns.push({
      type: 'detection',
      corpus_version: 'v1.0',
      n: manifest.pairs.length,
      synthetic: true,
      metrics: {
        tp, fp, fn, tn,
        precision: Number(precision.toFixed(3)),
        recall: Number(recall.toFixed(3)),
        f1: Number(f1.toFixed(3))
      },
      notes: 'Replay snapshot pair with baseline and simulated material change.',
      git_sha: 'local'
    });
  }

  // ==========================================
  // E3: PIPELINE LATENCY
  // ==========================================
  console.log('\n--- E3: Measuring End-to-End Pipeline Latency ---');
  const latencyRuns = [];
  const testHtml1 = '<html><body><div class="notice">inst 21 released Rs 2000</div></body></html>';
  const testHtml2 = '<html><body><div class="notice">inst 22 released Rs 2000 on 13 March 2026 eKYC mandatory</div></body></html>';

  for (let i = 0; i < 20; i++) {
    const t0 = performance.now();
    const n1 = normalize(testHtml1, { selector: '.notice' });
    const n2 = normalize(testHtml2, { selector: '.notice' });
    const diff = computeDiff(n1, n2);
    const cls = classify(diff);
    const added = diff.filter(d => d.type === 'add').map(d => d.line);
    const fields = extractFieldsWithRegex(added);
    ground(fields, n2);
    const duration = performance.now() - t0;
    latencyRuns.push(duration);
  }

  latencyRuns.sort((a, b) => a - b);
  const medianMs = latencyRuns[Math.floor(latencyRuns.length / 2)];
  const p95Ms = latencyRuns[Math.floor(latencyRuns.length * 0.95)];

  console.log(`E3 Result: 20 iterations. Median: ${medianMs.toFixed(2)}ms, P95: ${p95Ms.toFixed(2)}ms`);

  evalRuns.push({
    type: 'latency',
    corpus_version: 'v1.0',
    n: 20,
    synthetic: true,
    metrics: {
      medianMs: Number(medianMs.toFixed(2)),
      p95Ms: Number(p95Ms.toFixed(2))
    },
    notes: 'In-memory benchmark for normalize->diff->classify->extract->ground pipeline (excludes network I/O).',
    git_sha: 'local'
  });

  // ==========================================
  // E4: MATCHING FIDELITY
  // ==========================================
  console.log('\n--- E4: Evaluating Matching Rule Fidelity on Synthetic Profiles ---');
  const profilesPath = path.resolve(__dirname, '../data/eval/profiles.json');
  const expectedPath = path.resolve(__dirname, '../data/eval/expected.json');

  if (fs.existsSync(profilesPath) && fs.existsSync(expectedPath)) {
    const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));

    let totalChecks = 0;
    let agreementCount = 0;
    const perScheme = {
      'pm-kisan': { total: 0, match: 0 },
      'nsmny': { total: 0, match: 0 },
      'pmfby': { total: 0, match: 0 }
    };

    for (const profile of profiles) {
      const exp = expected[profile.id];
      if (!exp) continue;

      for (const schemeId of ['pm-kisan', 'nsmny', 'pmfby']) {
        totalChecks++;
        perScheme[schemeId].total++;

        const actual = matchProfileToScheme(profile, schemeId);
        if (actual.state === exp[schemeId]) {
          agreementCount++;
          perScheme[schemeId].match++;
        } else {
          console.warn(`Mismatch on ${profile.id} [${schemeId}]: Expected ${exp[schemeId]}, Got ${actual.state}`);
        }
      }
    }

    const overallFidelity = totalChecks > 0 ? agreementCount / totalChecks : 0;
    console.log(`E4 Result: ${agreementCount}/${totalChecks} matching checks agreed (${(overallFidelity * 100).toFixed(1)}%).`);

    evalRuns.push({
      type: 'matching',
      corpus_version: 'v1.0',
      n: totalChecks,
      synthetic: true,
      metrics: {
        agreementRate: Number(overallFidelity.toFixed(3)),
        perScheme: {
          'pm-kisan': Number((perScheme['pm-kisan'].match / perScheme['pm-kisan'].total).toFixed(3)),
          'nsmny': Number((perScheme['nsmny'].match / perScheme['nsmny'].total).toFixed(3)),
          'pmfby': Number((perScheme['pmfby'].match / perScheme['pmfby'].total).toFixed(3))
        }
      },
      notes: 'Synthetic edge-case profiles verified against PRD decision tables.',
      git_sha: 'local'
    });
  }

  // Save results to local JSON cache
  const outPath = path.resolve(__dirname, '../data/eval/eval-results.json');
  fs.writeFileSync(outPath, JSON.stringify(evalRuns, null, 2), 'utf8');
  console.log(`\nEvaluation results saved locally to: ${outPath}`);

  // Write to Supabase eval_runs table if available
  if (supabaseAdmin) {
    console.log('Persisting evaluation runs to Supabase eval_runs table...');
    const { error } = await supabaseAdmin.from('eval_runs').insert(evalRuns);
    if (error) {
      console.error('[Eval] Failed to insert eval_runs into Supabase:', error.message);
    } else {
      console.log('[Eval] Evaluation runs successfully persisted to database.');
    }
  } else {
    console.log('[Eval] Supabase not connected; results saved locally only.');
  }
}

runEval().catch(err => {
  console.error('[Eval Fatal Error]:', err);
  process.exit(1);
});
