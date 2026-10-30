# CLAUDE.md — instructions for an AI coding assistant working in this repo

## Project
Shetkari SuchnaSetu: monitors official agriculture notices, detects material changes, reviewed alerts, measured accuracy. Read `PRD.md` first, then `ARCHITECTURE.md` and `MONITORING_SPEC.md`.

## Hard rules
1. **Never invent scheme facts.** Dates, amounts, eligibility, URLs and helpline numbers come only from `data/schemes.seed.json`, which is filled by humans from primary sources. If a value is missing, render "Not verified" — do not fill it from memory.
2. **Never write the word "eligible"** in UI strings. Use `May apply`, `Doesn't meet stated criteria`, `Need more info`.
3. **Never put API keys or service-account JSON in `web/`.** The LLM is called only from `worker/`.
4. **Never call myScheme programmatically.** Link out only.
5. **Never collect** Aadhaar, bank details, OTP, caste/category, phone number.
6. A failed fetch is an error record, never "no change".
7. Metrics shown in the UI must come from `evalRuns/*`. No hardcoded percentages, no placeholder numbers, no fake charts. If there is no data, show an empty state.
8. Synthetic test data must carry `synthetic: true` and be charted separately.

## Stack and commands
- Web: React + Vite, `react-router-dom`, `recharts`, Firebase Web SDK. `cd web && npm run dev`
- Worker: Node 20+ ESM, `firebase-admin`, `cheerio`, `diff`, `pdf-parse`, `fast-xml-parser`.
  - `node worker/probe.mjs` · `node worker/seed.mjs` · `node worker/run.mjs [--watch] [--replay <dir>]`
- Eval: `node eval/run-eval.mjs`
- Deploy: `firebase deploy --only hosting,firestore:rules`

## Conventions
- IDs: schemes `pm-kisan | nsmny | pmfby | pdmc-mh | smam-mh`; sources `pmkisan-home | pib-agri | pmfby-portal | mh-agri-gr | nsmny-portal | mahadbt-public`.
- Match states: `MAY_APPLY | NOT_MATCHING | NEED_INFO`.
- Change review: `pending | approved | rejected`. Grounding: `grounded | ungrounded | conflict`. Materiality: `material | cosmetic`.
- Field provenance object: `{ value, sourceUrl, verifiedOn, verifiedBy, status }`, status ∈ `verified | unverified | conflict`.
- Timestamps are Firestore `Timestamp`; display in Asia/Kolkata.
- UI strings go through `t('key')`; dictionaries in `web/src/i18n/{en,mr}.json`. Do not machine-translate scheme content.
- Keep functions small and pure in `worker/lib/*` so `eval/run-eval.mjs` can import them.

## Done means
A change is done when: it works in replay mode with no network, has a unit-level check in `eval/` where it affects a metric, and any new user-visible fact has a source link.

## When unsure
Prefer returning `NEED_INFO`, `unverified` or an explicit error over a confident guess. Ask the human to open the primary source.
