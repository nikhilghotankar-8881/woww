# Shetkari SuchnaSetu — Official Notice Change Monitor for Farmers

**PS-07:** Real-Time Government Scheme and Insurance Opportunity Monitor for Farmers
**Stack:** React (Vite) · Firebase Auth / Firestore / Hosting · Node worker · optional LLM (worker-side only)

## What it is (one paragraph)

A web app that watches a small set of **official** agriculture pages (PM-KISAN, PMFBY, Maharashtra agriculture notices, Namo Shetkari, PIB agriculture releases), detects when a notice changes **in a way that matters** (dates, amounts, eligibility, mandatory steps), shows the change as a source-linked diff, lets a human reviewer approve it, and then alerts the farmers whose profile it may concern. It also publishes its own measured accuracy on an evaluation page.

## What it is not

Not a scheme directory, not a chatbot, not an application portal, not real-time, and it never says a farmer is "eligible" or "approved". See `CRITIQUE.md` for why.

## What is built vs. not built

| Built (P0/P1) | Not built (stated openly) |
|---|---|
| Login, farmer profile | SMS / WhatsApp |
| 5 scheme records with provenance badges | Chatbot / voice |
| Matching rules for PM-KISAN, NSMNY, PMFBY (tri-state) | Rules for PDMC, SMAM (info-only) |
| Monitor worker: fetch → normalise → diff → classify → extract → ground | Scanned-PDF OCR |
| Admin review queue, in-app alerts | Application submission, Aadhaar/OTP |
| Source health page | myScheme automation (link-out only) |
| Evaluation page with charts from `npm run eval` | Real-world impact numbers |

## Repository layout

```
shetkari-suchnasetu/
├─ docs/                      # the .md files from this pack
├─ web/                       # React + Vite app
│  └─ src/{pages,components,lib,i18n}
├─ worker/                    # Node 20+ ESM, uses firebase-admin
│  ├─ run.mjs                 # entry: live | --replay <dir> | --watch
│  ├─ lib/{fetch,normalize,diff,classify,extract,ground,match,fanout}.mjs
│  ├─ probe.mjs               # source probe (Phase 0)
│  ├─ capture.mjs             # saves raw page captures for the E2 corpus
│  ├─ seed.mjs                # loads data/*.seed.json into Firestore
│  └─ set-admin.mjs           # `node set-admin.mjs <uid>` grants the admin claim
├─ data/
│  ├─ sources.seed.json
│  ├─ schemes.seed.json
│  └─ eval/{corpus/,labels.json,profiles.json,expected.json}
├─ eval/run-eval.mjs
├─ firestore.rules
├─ firebase.json
└─ .github/workflows/monitor.yml   # optional; see RISKS.md (IP blocking)
```

## Quick start

```bash
# 1. scaffold
npm create vite@latest web -- --template react
cd web && npm i firebase react-router-dom recharts && cd ..
mkdir worker && cd worker && npm init -y \
  && npm i firebase-admin cheerio diff pdf-parse fast-xml-parser && cd ..
npm i -g firebase-tools && firebase login && firebase init   # Firestore + Hosting

# 2. env (never commit)
#   web/.env            VITE_FIREBASE_* (public web config)
#   worker/.env         GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
#                       (or FIREBASE_SERVICE_ACCOUNT_JSON=<json string> in CI; worker accepts either)
#                       LLM_API_KEY=...        (optional)
#                       LLM_MODEL=...          (optional)

# 3. phase 0: decide what is monitorable
node worker/probe.mjs

# 4. seed + run
node worker/seed.mjs                 # loads data/*.seed.json into Firestore
node worker/run.mjs                  # one live pass
node worker/run.mjs --watch          # poll + fan out approved changes every 10 s (demo mode)
node worker/run.mjs --replay data/eval/corpus/pmkisan-home

# 5. evaluate
node eval/run-eval.mjs               # writes evalRuns/* ; Evaluation page reads them

# 6. deploy
cd web && npm run build && cd .. && firebase deploy --only hosting,firestore:rules
```

## Document index

| File | Read it for |
|---|---|
| `CRITIQUE.md` | Harsh review, competitor reality, cut list, go/no-go checks |
| `PRD.md` | The solution as it will actually be built: scope, definitions, matching rules, acceptance criteria |
| `ARCHITECTURE.md` | Components, Firestore schema, security rules, data flow |
| `DATA_SOURCES.md` | Source registry, probe procedure, scheme seed facts and their verification status |
| `MONITORING_SPEC.md` | The pipeline, classifier, grounding check, pseudocode |
| `EVALUATION.md` | Experiments E1–E5, corpus construction, metrics, charts, forbidden claims |
| `BUILD_PLAN.md` | Hour-by-hour plan, priorities, cut rules, deploy steps |
| `DEMO_SCRIPT.md` | 5-minute demo, fallback, judge Q&A |
| `RISKS.md` | Risk register, privacy, legal/ToS, safety |
| `CLAUDE.md` | Instructions for an AI coding assistant working in this repo |

## Honesty statement (put this in the app footer too)

> Information here is monitored from official sources at scheduled intervals and reviewed by a person before it is shown. It can be late or wrong. It is not an official determination of eligibility. Always confirm on the official portal linked in each alert.
