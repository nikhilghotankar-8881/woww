# BUILD_PLAN.md — 6 hours, with gates and cut rules

Times are relative to the moment you start (T+0:00). Re-plan only at a gate.

## 0. Priorities

| P | Items |
|---|---|
| **P0 (must work)** | Auth + profile · 5 scheme records with provenance badges · matching for 3 rule sets · worker (fetch→diff→classify→extract→ground) with **replay mode** · admin review · alerts inbox · Source Health · Evaluation page with real numbers from `eval/run-eval.mjs` |
| **P1 (should)** | Marathi UI labels · LLM extraction/summary variant · live capture loop feeding E2 · usability test (E5) · "Delete my data" |
| **P2 (only if everything else is green)** | GitHub Actions schedule · PIB true-lag measurement · extra source |

## 1. Timeline

| Time | Phase | Output | Done when |
|---|---|---|---|
| **0:00–0:30** | **Phase 0 — decide** | Source probe report; competitor test screenshots; billing check; 5 short interviews started | ≥ 3 sources `auto`, or fallback chosen (see Gate G1) |
| 0:00 (parallel) | **Start capture loop** | `while true; do node worker/capture.mjs; sleep 1800; done` saving raw pages for E2 | files appearing in `data/eval/corpus/*` |
| **0:30–1:15** | Foundation | Vite app, Firebase project (Auth, Firestore, Hosting), rules deployed, routing, i18n skeleton, admin-claim script | sign-up/in works; rules deployed |
| **1:15–2:30** | Farmer side | `seed.mjs` + `schemes.seed.json` (verified facts only), Schemes list/detail with badges, Profile form, `match.mjs` (pure) | **G2:** log in → fill profile → see match chips + sources |
| **2:30–3:45** | Worker core | `fetch`, `normalize`, `diff`, `classify`, regex `extract`, `ground`, replay mode, writes `changes/*` | replay of a snapshot pair yields a `pending` change |
| **3:45–4:30** | Golden path | Admin review queue, approve/reject, `--watch` fan-out, alerts inbox with diff and links | **G3:** approve → alert appears on a second browser in ≤ 15 s |
| **4:30–5:10** | Evidence | `run-eval.mjs` (E1–E4), `evalRuns/*`, Evaluation page (C1–C6), Source Health page | **G4:** charts show real n and labels |
| **5:10–5:40** | Ship | Deploy; phone test; two-account rules test; footer honesty statement; README | public URL works on a phone |
| **5:40–6:00** | Rehearse | Two full demo runs; record a fallback screen recording | **Freeze** at 5:40: bug fixes only |

## 2. Gates and cut rules

| Gate | Check | If it fails |
|---|---|---|
| **G1 @0:30** | ≥ 3 sources return stable readable text from an Indian network | Switch monitored set to PIB listing + any source that passes; mark others `manual`; say so on Source Health. Do **not** fake auto monitoring. |
| **G2 @2:30** | Farmer flow works end to end | Drop Marathi labels and LLM; keep English only |
| **G3 @4:00** | Golden path works once in replay | **Stop all features.** Fix the path. Cut Source Health charts, E4, usability |
| **G4 @5:00** | Evaluation page shows real numbers | Show whatever real E1/E2 you have with small n; delete empty charts; never fill gaps with placeholders |
| **Freeze @5:40** | — | Nothing new ships after this |

Cut order when behind: E5 → LLM → Marathi labels → extra sources → Source Health chart → E4. **Never cut:** grounding check, review queue, provenance badges, honesty statement, eval n/labels.

## 3. Team split

| People | Split |
|---|---|
| **1** | Follow timeline strictly; skip P1; do E1/E2 with ≤ 8 pairs |
| **2** | A: web (auth, profile, schemes, alerts, admin, eval page). B: worker + eval + data (probe, seed facts, corpus, labels) |
| **3** | A: web. B: worker + eval harness. C: data/verification (read primary sources, seed facts, labels, interviews, competitor test), then demo script |

The data/verification role is not optional: wrong seed facts are the biggest credibility risk.

## 4. Setup commands (condensed)

```bash
# Firebase
firebase login
firebase init firestore hosting     # choose existing project; public dir = web/dist; SPA rewrite = yes
firebase deploy --only firestore:rules

# Admin claim (one-off): sign up in the app first, copy your UID from the Firebase console
node worker/set-admin.mjs <UID>      # calls auth().setCustomUserClaims(uid, { admin: true }); sign out/in afterwards

# Run
node worker/seed.mjs
node worker/run.mjs --watch          # keep running during demo
cd web && npm run dev
```

`firebase.json` (hosting excerpt):
```json
{ "hosting": { "public": "web/dist",
  "rewrites": [{ "source": "**", "destination": "/index.html" }] },
  "firestore": { "rules": "firestore.rules" } }
```

## 5. Optional CI schedule (P2)

```yaml
name: monitor
on:
  schedule: [{ cron: '0 * * * *' }]
  workflow_dispatch:
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd worker && npm ci && node run.mjs
        env:
          FIREBASE_SERVICE_ACCOUNT_JSON: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_JSON }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
```
**Warning:** GitHub runners are outside India; many `.gov.in` sites block foreign IPs. Verify in Phase 0 by running the probe from a workflow. If blocked, run the worker from your laptop for the demo and state that.

## 6. Test checklist (run before freezing)

**Auth/data**
- [ ] New user can sign up, save profile, reload and see it
- [ ] User B cannot read user A's profile or alerts (try in console)
- [ ] Non-admin cannot read `snapshots` or update `changes`
- [ ] "Delete my data" removes profile and alerts

**Monitoring**
- [ ] Replay pair with only a counter change → `cosmetic`, no alert
- [ ] Replay pair with a date change → `material`, grounded, pending
- [ ] Forced fetch failure → source red, **no** change created
- [ ] Selector broken → `structure-changed`
- [ ] Ungrounded LLM output → flagged red, cannot approve without note

**Alerts**
- [ ] Approve → alert appears within ~15 s on another browser
- [ ] Alert shows source link, published vs checked time, match state, footer disclaimer
- [ ] Synthetic change shows a visible **SIMULATION** tag in admin and alert

**UI**
- [ ] Mobile width (360 px) usable; Marathi labels render (font supports Devanagari)
- [ ] Every scheme fact shows a badge and source link
- [ ] Evaluation page: every chart has n and origin label; empty state works
- [ ] Footer honesty statement present

**Ops**
- [ ] No secrets in git (`git log -p | grep -i key`)
- [ ] Deployed URL opens without login for schemes/sources/evaluation
- [ ] Replay works with network off

## 7. Definition of done for submission

A judge can: open the URL → browse verified schemes with sources → log in as the demo farmer → see a match state with reasons → see an alert with diff and source → open Source Health and Evaluation → read exactly what is and isn't claimed.
