# RISKS.md — risk register, privacy, legal, safety

Likelihood (L) and Impact (I): H / M / L.

## 1. Delivery and technical risks

| # | Risk | L | I | Early signal | Mitigation |
|---|---|---|---|---|---|
| R1 | Sources can't be fetched from your network or CI (geo-block, CAPTCHA, JS-only pages) | H | H | Probe shows 403/short pages | Phase 0 probe; Indian network; mark `manual`; fall back to PIB listing; replay mode |
| R2 | Dynamic page noise causes false positives (counters, session tokens) | H | M | Every fetch "changes" | Canonical URLs, `ignorePatterns`, normalisation tests |
| R3 | Hardly any real changes occur during the build window | H | M | Corpus has few material pairs | Archived captures + clearly labelled synthetic edits; negatives from live captures |
| R4 | Seed facts wrong or stale | M | H | Conflict ledger grows | Primary-source-only rule; `verifiedOn`; `conflict` status; reviewer |
| R5 | LLM hallucinates dates/amounts | M | H | Ungrounded count > 0 | Grounding check, regex-first, template summaries, human approval |
| R6 | Firebase Blaze/billing unavailable | M | M | Deploy of functions blocked | Design uses no functions |
| R7 | Worker leaks secrets | L | H | Keys in git history | `.env` ignored; CI secrets; grep check before submit |
| R8 | Firestore rules too open/closed | M | H | Judge can read others' alerts / can't read schemes | Two-account test; rules in repo |
| R9 | Scope creep | H | H | Gate missed | Gates G1–G4, cut order in `BUILD_PLAN.md` |
| R10 | Live demo fails | M | H | Flaky Wi-Fi/site | Replay mode, screen recording, offline build |
| R11 | Scanned/legacy-font Marathi PDFs can't be read | H | M | Garbage text | Flag `manual`; state as limitation |
| R12 | Small evaluation sets give wide intervals | H | M | n < 30 | Report n and Wilson interval; don't overclaim |
| R13 | Devanagari rendering issues | M | L | Boxes instead of letters | Use a font with Devanagari support; test on a phone |

## 2. Product-safety risks

| Risk | Why it matters | Control |
|---|---|---|
| Wrong or late date in an alert | Farmer may miss a deadline or act on bad info | Human approval; verbatim evidence; link to source; "published" vs "checked" times; disclaimer |
| Over-confident wording ("eligible", "approved") | May lead to false expectations | Tri-state wording; `NOT_MATCHING` only for verified rules |
| Stale scheme facts shown as current | Same harm as above | `verifiedOn` displayed; stale badge after N days (e.g. 14) |
| Phishing look-alike confusion | Farmers may confuse our site with an official one | Footer: "Not an official government website"; links only to official domains; never ask for OTP/Aadhaar/bank details |
| Alert fatigue | Users ignore alerts | Only `material` + approved changes; per-scheme follow settings |

## 3. Privacy

- **Collected:** district, crops, land status, a few yes/no answers, language, email (auth). **Not collected:** Aadhaar, bank, OTP, phone, caste/category, location coordinates.
- **Purpose limitation:** profile used only to decide which approved changes to show.
- **Controls:** owner-only reads via rules; "Delete my data"; no analytics SDKs that profile users; no third-party sharing.
- **Retention:** profiles until deleted; snapshots: last 20 per source.
- **Note:** if you later add phone numbers/SMS, you need an explicit consent flow and a privacy notice reviewed by someone qualified. India's data-protection obligations may apply — I'm not a lawyer; get this checked before any real deployment.

## 4. Legal / terms-of-use

| Topic | Position |
|---|---|
| Fetching public government pages | Polite, low frequency, descriptive User-Agent, honour robots.txt, no login, no CAPTCHA bypass |
| myScheme | Terms (Hindi version read) restrict bots/scrapers without written permission → **link-out only**; read the English terms yourself |
| Republishing text | Quote short evidence lines with attribution and link; do not mirror whole pages |
| Archived captures | Third-party copies; label as `archived` |
| Using the word "official" | Never describe our app as official; use "monitors official sources" |
| Best long-term route | Ask the department for a sanctioned notification feed or API |

## 5. Known limitations (state these openly)

1. Hourly at best; not real-time.
2. A handful of sources; others manual.
3. Detects **text** changes; it cannot judge whether a change is legally significant — hence the reviewer.
4. Rules cover three scheme sets; the rest are info-only.
5. Evaluation corpus is small; synthetic items are separated.
6. No deployed farmers, no outcome data.
7. English content with Marathi UI labels only.

## 6. Pre-submission safety review (10 minutes)

- [ ] Search UI strings for "eligible", "approved", "guaranteed"
- [ ] Every number on the Evaluation page traces to an `evalRuns` document
- [ ] Every fact has a source link and status badge; no unlabeled aggregator facts
- [ ] Synthetic items visibly tagged everywhere they appear
- [ ] No secrets in repo; `.env*` in `.gitignore`
- [ ] Footer honesty statement and "not an official website" notice on every page
