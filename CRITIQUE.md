# CRITIQUE.md — Kill-critic review of Shetkari SuchnaSetu

Reviewed: both project documents, the six-hour plan from earlier in this chat, and the PS-07 brief.
Date of review: 29 Oct 2026. Facts below were checked against public pages tonight; anything I could not verify is marked **unverified**.

---

## 0. Verdict

**Right problem, wrong shape.** The documents are careful in tone but 80% promise language. The six-hour plan from earlier in this chat would have produced a scheme directory with a chatbot, which is precisely what PS-07 says already exists.

The only part worth building is the part nobody can copy in an afternoon: **a monitor that detects changes in real official pages, shows a source-linked diff, is reviewed before it reaches a farmer, and publishes its own measured accuracy.** Everything else is either already done by someone with a bigger budget, or is a distraction.

---

## 1. Competitor reality (this is where you lose first)

| Platform | What its public pages say it does | What I could not confirm |
|---|---|---|
| **myScheme** (MeitY / Digital India Corp.) | 4,700+ central and state schemes; personalised search from a profile; scheme-level Yes/No eligibility questionnaire; voice + text AI chatbot (Hindi/English); sign-in saves profile, bookmarks, personalised recommendations; redirects to the department portal to apply. | Whether it alerts users when a notice changes. Its FAQ does not describe this. **Install it and test for 20 minutes.** |
| **MahaVISTAAR-AI** (Maharashtra Agriculture Dept.) | Marathi / local-language voice and text advisory on weather, irrigation, fertiliser, prices and scheme guidance; reported at 2.5–3 million+ farmers; voice-telephony service launched. | Whether scheme deadline changes trigger proactive alerts. |
| **Bharat-VISTAAR** (national) | Phase I launched Feb 2026 (Hindi/English); integrates ten central schemes for eligibility, application, benefit status and grievances; more schemes and languages announced as phased. | State-scheme coverage; whether "all central schemes by May 2026" was actually delivered. |
| **PM-KISAN portal** | Its own chatbot ("Kisan eMitra"), Know-Your-Status. | — |

**Implication.** Discovery, personalisation, chat and Marathi voice are taken. If your pitch contains "AI chatbot answers farmers' scheme questions", you have pitched a worse MahaVISTAAR.

**What remains open (and is defensible):** change detection on official notices, with a visible diff, source and timestamps, human review before sending, and *published* precision/recall. Phrase it as "our contribution", not "nobody else does this" — you cannot prove a negative from FAQ pages.

---

## 2. Fatal flaws (fix or you fail)

### F1. Differentiation is asserted, not shown
Your own document says uniqueness "must be compared before any claim". The comparison was never done. Do the 20-minute competitor test (Section 8) and put the observed result in the demo.

### F2. "Real-time" and "verified" are undefined
- **Real-time:** government portals expose almost no feeds. You can do scheduled polling (e.g. hourly). Say "scheduled monitoring, last checked at HH:MM", never "real-time".
- **Verified:** currently means nothing testable. Define it as three concrete checks (see `MONITORING_SPEC.md`): (1) every extracted value appears verbatim in the fetched source text, (2) it does not contradict the stored scheme record or a second source without being flagged, (3) a human reviewer approved it before any farmer sees it.

### F3. Your seed data will be wrong if copied from the web
Tonight's searches returned third-party sites that **contradict each other**:

| Item | Conflict seen | Resolution |
|---|---|---|
| PMFBY farmer premium | Most sources: Kharif 2%, Rabi 1.5%, commercial/horticulture 5%. One explainer lists Kharif 1.5% / Rabi 2%. | Read the PMFBY operational guidelines / state notification. |
| PMFBY Rabi 2026-27 cut-off | Sources say "15 Dec per guidelines", "31 Dec in most states", "Oct–Nov", and one says states notify their own. | The **state notification is binding**. Maharashtra's date for your crop was **not found** in a primary source tonight. Do not hardcode either date. |
| Maharashtra "₹1 crop insurance" | Maharashtra wound it up in 2025 and reverted to the standard farmer-share rates, yet pages still cite the ₹1 model. | Use only current notification. This is your best live example of *stale information*. |
| Namo Shetkari amount | Most 2026 pages: ₹6,000/yr in three ₹2,000 instalments. A UNI wire result reports an increase to ₹9,000 (year not visible in the snippet). | **Unresolved.** Read the latest GR. |
| Per Drop More Crop parent scheme | Many sites say "PMKSY–PDMC". 2026 guidelines found say PDMC has been under PM-RKVY since 2022-23. | Check the Maharashtra/MahaDBT page. |

A directory built from aggregator pages inherits all of this. **Primary sources only** (official portals, GRs, PIB). Anything else is flagged `unverified`.

### F4. You do not know what you can actually monitor
You have not probed a single source. Real problems visible tonight:
- The PM-KISAN home page URL carries an ASP.NET session token in the path, and the page contains live counters ("period-wise number of farmers benefited"). A naive hash of that page changes on every fetch → **100% false positives** until you normalise.
- Indian government sites commonly block non-Indian IPs, use CAPTCHAs, load content via JavaScript, or publish scanned PDFs. GitHub-hosted runners are not in India.
- myScheme's terms of use (the Hindi version I read) prohibit bots/scrapers without written permission. **The earlier suggestion to "connect your directory to myScheme" must become a plain outbound link.** Read the English terms yourself.

Spend the first 30 minutes on a source probe (`DATA_SOURCES.md`). It decides the whole build.

### F5. "Real-world evaluation graphs" cannot come from real-world outcomes in six hours
You have no deployed users and no ground-truth benefit data. What you *can* honestly measure:
1. Extraction accuracy on hand-labelled real notices.
2. Change-detection precision/recall on a replay corpus of real before/after snapshots (e.g. archived captures), with synthetic edits reported separately.
3. Matching agreement against hand-computed expected results on synthetic profiles.
4. Pipeline latency and source freshness from your own runs.
5. (Optional) a small usability test, labelled with n.

Those are real graphs. They are not "impact". Never show a percentage that did not come out of `npm run eval`.

### F6. Scope is five projects in one
Six schemes + auth + chatbot + Marathi + alerts + monitoring + charts + AI + (SMS/WhatsApp "later"). A judge can test about three things. See the cut list in Section 6.

### F7. Platform constraints were ignored
- Firebase **Cloud Functions (and scheduled functions) require the Blaze (pay-as-you-go) plan.** A billing card problem at hour 3 would kill the plan. The design in this repo does not depend on it.
- Putting an LLM key in React code leaks it. Keep it in the worker only.
- Earlier thread said "authentication already exists" and also "starting from scratch". Assume nothing exists; budget 20 minutes for auth.

---

## 3. Serious flaws

| # | Flaw | Fix |
|---|---|---|
| S1 | **No user evidence.** The "problem is real" claim rests on nothing. | Ask 5 people (farmers or farming families) three questions tonight; report as "n=5, anecdotal" or drop the claim. |
| S2 | **Targeted schemes (Ambedkar, Birsa Munda) need social category.** Collecting caste/tribal status is sensitive and the eligibility logic is hard. | Out of MVP. List as "future work". |
| S3 | **Machine-translated eligibility in Marathi.** A wrong translation of a condition is worse than English. | Marathi UI labels only; Marathi scheme summaries only if reviewed by a Marathi speaker (`reviewedBy` field). |
| S4 | **No harm model.** A wrong date in an alert can make someone miss a deadline. | Human approval, source link, "checked at", "not an official determination" on every alert. |
| S5 | **Latency claim without timestamps.** Most pages have no publication time. | Report check interval (upper bound on lag) and measured pipeline time. Compute true lag only for sources that expose dates (e.g. PIB). |
| S6 | **"AI" role muddled.** Matching is rules; AI is only extraction/summary. | Say so. Judges respect the honesty; they punish buzzwords. |
| S7 | **Blockchain in the sector name.** You are not using it. | Say "AI" only; do not force blockchain. |
| S8 | **Stray "kisantak.in" in the second document.** Looks like a copied site header. | Remove unless it is yours. |

---

## 4. Errors in the earlier plan (corrections)

| Earlier statement | Problem | Correction |
|---|---|---|
| "PMKSY — Per Drop More Crop" | Parent scheme label appears outdated (PM-RKVY since 2022-23 per guidelines found). | Verify on MahaDBT; record the discrepancy in `DATA_SOURCES.md`. |
| "Connect to myScheme as a discovery source" | ToU restricts automated access. | Link-out only. |
| "Cloud Functions for AI and scheduled checks" | Needs Blaze plan. | Worker script (local or CI) + optional functions later. |
| "Q&A assistant over scheme records" as a headline | Duplicates MahaVISTAAR, myScheme, PM-KISAN chatbot. | Cut. Keep only "explain this alert" generated at detection time. |
| Six schemes at "priority" | Too many facts to verify honestly. | Five records, three with encoded rules. |
| Evaluation graphs "of user-task performance" | No users yet. | Optional E5 with real n, or omit. |

---

## 5. Language audit (words to delete or define)

| Word | Rule |
|---|---|
| "real-time" | → "scheduled, last checked at …" |
| "AI-powered" | → name the step: "LLM-assisted field extraction, grounded against source text" |
| "verified" | → only when all three checks in `MONITORING_SPEC.md` passed |
| "farmer-focused" | → only claim what you tested with farmers |
| "eligible" | → "may apply" / "doesn't meet the stated criteria" / "need more info" |
| "pilot" | → "prototype tested with N testers" unless a partner exists |

---

## 6. Cut list (decide now, not at hour 5)

**Cut:** blockchain, SMS/WhatsApp, general chatbot, myScheme automation, MahaDBT login/scraping, tribal/targeted schemes, application submission, Aadhaar/OTP anything, voice, machine-translated scheme text, push notifications.

**Keep:** Firebase Auth (email/Google), profile, 5 scheme records with provenance badges, 3 encoded rule sets, monitor worker with diff + material-change classifier, grounded extraction, admin review queue, in-app alerts, evaluation page with charts from `npm run eval`.

---

## 7. The defensible core (what survives)

> For a small set of official sources, detect when a notice changes in a way that matters, show the farmer exactly what changed with the source and check time, only after a human reviewer approves it, and report how accurate that detection actually is.

Three properties judges can test live: **traceability** (click to source), **reviewability** (approve/reject queue), **measurability** (eval page with n and caveats).

---

## 8. Go / no-go checks for the first 30 minutes

1. **Source probe:** fetch each candidate source from an Indian network; record status, content type, whether text is in the HTML, robots.txt, any CAPTCHA. Keep ≥3 sources that return stable readable text.
2. **Competitor test:** install MahaVISTAAR-AI and open myScheme. Ask both: "What changed for PM-KISAN / crop insurance recently?" Screenshot what happens. This is your evidence slide.
3. **Firebase billing:** check whether Blaze is available. If not, nothing in this plan breaks.
4. **Replay material:** check whether archived captures exist for your chosen pages (see `EVALUATION.md`). If none, E2 uses only labelled live captures plus clearly labelled synthetic edits.
5. **Five questions to five people** (3 minutes each). Write down the answers verbatim.

If checks 1 and 4 both fail, switch the monitored set to PIB Agriculture releases (they carry timestamps and are stable) and say so honestly.
