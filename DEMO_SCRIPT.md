# DEMO_SCRIPT.md — 5 minutes, honest, rehearsed

## 0. Setup before you walk in

- Worker running: `node worker/run.mjs --watch` on a laptop in India.
- Two browsers: **Admin** (reviewer) on the laptop, **Farmer** on a phone or second window (demo farmer already logged in, profile filled).
- Demo farmer profile: Rabi 2026-27, grows wheat/gram, owns land, land on/before 1 Feb 2019 = yes, e-KYC = unsure, loanee = no.
- Replay data ready: one **real** pair if you have it; otherwise one **synthetic** pair (it will display a visible SIMULATION tag — keep it).
- Backup: screen recording of the full golden path; offline replay works with network off.
- Have the competitor-test screenshots open in a tab.

## 1. Script

| Time | Say / do |
|---|---|
| **0:00** | "Farmers don't lose out because schemes don't exist; they lose out because a date or requirement changes and they hear late, or from a source that's out of date. It's Rabi insurance enrolment season, the binding cut-off is whatever the state notifies, and websites disagree with each other. (Show the conflict ledger from `DATA_SOURCES.md`.)" |
| **0:30** | "Discovery and advice already exist: myScheme, MahaVISTAAR-AI, Bharat-VISTAAR. (Show competitor-test screenshots: what each said when asked about a recent change.) We built one thing: **a monitor for official notices that shows what changed, with proof, after a human checks it — and measures its own accuracy.**" |
| **1:00** | **Schemes page.** Open PM-KISAN. Point at the badges: "Green = a person opened the official page and recorded the date. Grey = unverified. Red = our sources disagree." Click **Open official source**. |
| **1:45** | **Farmer profile + matches.** "Wheat, owns land. PM-KISAN: *may apply*. Crop insurance: *may apply*, with the note that the village and crop must be notified. We never say 'eligible'. Where we aren't sure we say *need more info*." |
| **2:15** | **Source Health.** "<N> sources are checked automatically (whatever the probe gave you), the rest are manual — and we show that. This one is red: blocked, and that's displayed rather than hidden." |
| **2:45** | **Trigger the change.** In the terminal run the replay (or let the live pass run). Switch to **Admin → Review queue**. "The pipeline found a changed line with a date in it. Here's the diff, the extracted field, and the check that the quoted text really exists in the page. If the model had invented it, this would be red." **Approve.** |
| **3:30** | **Farmer phone.** "Within seconds: what changed, the exact published wording, when it was published vs checked, what to do next, and the official link." Point at the **SIMULATION** tag if synthetic: "This one is a simulated edit; it's tagged so nobody mistakes it for real." |
| **4:00** | **Evaluation page.** Read three numbers *with their n*: extraction accuracy, detection precision/recall (real vs synthetic separately), matching agreement. "Small corpus, so wide intervals; here's the interval." |
| **4:40** | **Limits.** "Not real-time — hourly at best. Not all schemes. No SMS yet. No farmer outcome data. Next step is a pilot with an agriculture office and a sanctioned feed." |
| **5:00** | Stop. |

## 2. If something breaks

| Failure | Do this |
|---|---|
| Source blocked / site down | Switch to replay: `node worker/run.mjs --replay data/eval/corpus/pmkisan-home`. Say: "Live sites are flaky, which is why replay exists." |
| Alert doesn't appear | Check `--watch` is running; refresh; else play the screen recording |
| Wi-Fi dead | Offline replay + local dev build |
| Eval page empty | `node eval/run-eval.mjs` then refresh; if still empty, show last screenshot and say so |

## 3. Judge Q&A (answers you can defend)

| Question | Answer |
|---|---|
| **How is this different from myScheme / MahaVISTAAR?** | "They're built for discovery, advice and chat. We don't compete there. We detect changes in official notices and deliver a reviewed, source-linked diff, and we publish our accuracy. We can't prove they have no alerts; here's what we saw when we tested them." |
| **Is it real-time?** | "No. Scheduled checks, at best hourly; every alert shows *published* and *checked* times." |
| **Where's the AI?** | "In extraction and summarisation, behind a grounding check. Matching is rules on purpose, so it's explainable." |
| **Why no chatbot?** | "Chat is already covered. A chatbot would add hallucination risk without adding what we're testing." |
| **Why no blockchain?** | "A normal database with timestamps and version history solves our problem. Blockchain only makes sense with multiple parties who don't trust each other." |
| **What if the model invents a date?** | "It can't pass: every extracted value must appear verbatim in the fetched page, and a human approves." |
| **What if a page redesign breaks you?** | "We detect shrinking or empty content and mark the source `structure-changed` instead of guessing." |
| **Are you allowed to scrape?** | "We fetch public pages politely, hourly or slower, honour robots.txt, never log in or bypass CAPTCHAs. We don't touch myScheme because its terms restrict automation; we link out. The real solution is a sanctioned feed." |
| **How accurate is it?** | "On N real and M synthetic items: <numbers from the page>, with intervals. That says nothing about farmers' outcomes." |
| **Have farmers used it?** | "No. We spoke to <n> people; here's what they said. A pilot is the next step." |
| **Who maintains the selectors?** | "Today, us. Source Health shows breakages; long-term, a department feed removes the need." |
| **Marathi / low literacy?** | "UI labels in Marathi; scheme text only after native-speaker review. Voice and SMS are next — MahaVISTAAR already does voice, so we'd integrate rather than rebuild." |
| **How would it scale?** | "Add a source config and labelled cases per source; the evaluation harness tells you whether the new source is good enough to switch to automatic." |
| **What's wrong with this project?** | "Small corpus, a handful of sources, manual review, no users yet. The design is built to expose those limits." |

## 4. Never say

"real-time" · "eligible" (as a determination) · "AI verifies" · "95%" (unless produced by `run-eval`) · "farmers benefited" · "covers all schemes" · "official" about our own app · anything about myScheme integration.

## 5. Slide order (if slides are required)

1. Problem + conflict ledger (1 slide)
2. What exists / what we do (competitor evidence)
3. Pipeline diagram (fetch → diff → classify → extract → ground → human → alert)
4. Golden-path screenshots
5. Evaluation (3 charts, with n and labels)
6. Limits and next steps
