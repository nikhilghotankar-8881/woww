# EVALUATION.md — real measurements, honest labels

You cannot measure real-world farmer outcomes in six hours. You **can** measure whether the system extracts correctly, detects changes correctly, matches as specified, and runs fast — and say exactly what each number does and does not prove.

## 1. Rules for every number on the Evaluation page

1. It comes from `node eval/run-eval.mjs` (writes `evalRuns/*`). No hardcoded values.
2. It shows **n** next to the metric.
3. Synthetic and real/archived data are **separate bars**, labelled.
4. It states what it does **not** show.
5. If a result is bad, show it and say what you would fix. A visible 70% is more credible than an unexplained 100%.

**Forbidden claims:** "95% accuracy", "X farmers benefited", "reduced missed deadlines by …", "real-time", "covers all schemes".

## 2. Experiments

### E1 — Extraction accuracy
- **Question:** do extracted fields match what the notice says?
- **Corpus:** ≥ 10 real notice excerpts / page captures from the monitored sources (collect during the probe), containing ≥ 30 labelled field instances (dates, amounts, requirements).
- **Labels:** `data/eval/labels.json` — per document: `[{name, value, evidence}]`, written by a human **before** running the extractor.
- **Metric:** exact-match on normalised `value` per field type; also **grounding pass rate** (share of extracted fields that pass `ground()`).
- **Variants:** regex-only vs regex+LLM (if the LLM is used). Report both.
- **Shows:** extractor quality on this corpus. **Not:** performance on other pages.

### E2 — Change-detection replay
- **Question:** given a before/after pair, does the pipeline label materiality correctly?
- **Corpus layout:** `data/eval/corpus/<sourceId>/{01.html,02.html,…,manifest.json}`; manifest records `origin: "live-capture" | "archived" | "synthetic"`, capture time, and the **human label** (`material: true/false`, `fields[]`).
- **Where pairs come from:**
  1. **Live captures:** save the page at the start and again later (every hour you work, in the background). Real changes may be rare — expect mostly cosmetic/dynamic differences, which are valuable negative cases.
  2. **Archived captures:** Internet Archive captures of the same official pages at different dates (for example via the Wayback CDX API with `collapse=digest`, which returns only captures whose content differs). Third-party copies → label `archived`. If nothing useful exists, say so and drop it.
  3. **Synthetic edits:** copy a real snapshot, change a date/amount/clause by hand. Label `synthetic`. Report separately; these prove the detector works on known edits, not that it finds real ones.
- **Labelling:** two team members label each pair independently, then reconcile; record the raw agreement rate.
- **Size:** ≥ 12 pairs: ≥ 4 real material, ≥ 4 real cosmetic/dynamic, ≥ 4 synthetic.
- **Metrics:** TP, FP, FN, TN → precision, recall, F1; separately for real vs synthetic. Also **field-level recall** (did it surface the changed field?).
- **Interpretation:** FP = false alert risk; FN = missed change risk. State which one you chose to minimise (default: minimise FP because humans review, but report FN loudly).

### E3 — Latency and freshness
- **Pipeline latency:** `fetchStartedAt → alert document written` for replayed changes, ≥ 20 runs; report median and p95 (ms).
- **Freshness:** minutes since last successful check per source (live).
- **Detection delay upper bound:** equals `intervalMin`. Do **not** call it measured lag.
- **True lag:** only for sources with a publication timestamp (e.g. PIB): `detectedAt − publishedAt` for each new item; report n. If n < 5, say "insufficient observations".

### E4 — Matching fidelity
- **Question:** does the code return the states the rule table says it should?
- **Corpus:** `data/eval/profiles.json` — ≥ 24 **synthetic** profiles covering each rule branch (owner/tenant/landless; pre/post-2019; loanee; unknown answers).
- **Expected:** `data/eval/expected.json` — two people compute expected `{scheme → state}` **independently from the PRD rule table**, then reconcile.
- **Metric:** exact-state agreement per scheme; list mismatches.
- **Shows:** implementation fidelity to the rule table. **Not:** whether the rule table matches official policy — that is what verified scheme facts and reviewer checks are for.

### E5 — Usability (optional, only with real participants)
- **Task:** "Find the last date to enrol for Rabi crop insurance for <crop> and say what you must do next." Compare the participant's usual method vs. the app.
- **Measure:** time to correct answer; correctness; ≥ 5 participants. Label **"developer usability test, n=…"** unless they are farmers.
- Skip entirely if time is short; never fabricate.

## 3. Charts (Recharts) and their data

| # | Chart | Source | Annotation shown |
|---|---|---|---|
| C1 | Bar: minutes since last successful check, per source (colour by status) | live `sources` | "auto vs manual", last error |
| C2 | Bar: extraction accuracy by field type (+ grounding pass rate) | `evalRuns[type=extraction]` | n per bar; regex vs LLM |
| C3 | Stacked bar: TP / FP / FN, real vs synthetic | `evalRuns[type=detection]` | n; origin label |
| C4 | Small table: precision / recall / F1 with 95% interval | same | note on small n |
| C5 | Bar: matching agreement per scheme | `evalRuns[type=matching]` | "synthetic profiles" |
| C6 | Bar/line: pipeline latency per run (median, p95) | `evalRuns[type=latency]` | "excludes network wait of live sources" if replay |
| C7 | Optional: task time, app vs usual method | `evalRuns[type=usability]` | n, who the participants were |

Always render an **empty state** ("no data yet — run `npm run eval`") rather than placeholder values.

## 4. Statistics note (small n)

Report the Wilson 95% interval when n is small. Rule of thumb: perfect results still leave wide intervals — **30/30 ⇒ lower bound ≈ 89%; 12/12 ⇒ ≈ 76%**. Say this on the slide; judges trust people who know their sample size.

```js
export function wilson(k, n, z = 1.96) {
  if (!n) return [null, null];
  const p = k / n, d = 1 + z*z/n;
  const c = p + z*z/(2*n), m = z*Math.sqrt(p*(1-p)/n + z*z/(4*n*n));
  return [(c - m)/d, (c + m)/d];
}
```

## 5. `evalRuns` document shape

```json
{
  "type": "detection",
  "corpusVersion": "v1",
  "synthetic": false,
  "n": 8,
  "metrics": { "tp": 3, "fp": 1, "fn": 1, "tn": 3, "precision": 0.75, "recall": 0.75, "f1": 0.75 },
  "notes": "Archived + live captures from 3 sources.",
  "gitSha": "abc1234",
  "createdAt": "<server timestamp>"
}
```
(The numbers above are an example of the **shape**, not results.)

## 6. Time budget (≈ 45–60 min total)

| Task | Time |
|---|---|
| Collect captures + write labels (E1/E2) | 20 min (start in Phase 0 and let the background capture run) |
| Profiles + expected states (E4) | 10 min |
| `run-eval.mjs` + writing `evalRuns` | 15 min |
| Evaluation page (C1–C6) | 15 min |

If you are short on time, cut in this order: E5 → LLM variant in E1 → archived pairs in E2. **Never cut the labels or the n.**

## 7. What to say out loud

> "These are measurements on a small labelled corpus of N real pages plus M synthetic edits. They show the pipeline does what we claim on this data. They don't show farmer outcomes; that needs a pilot with an agriculture office."
