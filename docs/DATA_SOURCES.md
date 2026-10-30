# DATA_SOURCES.md — sources, scheme records, and what is actually verified

**Rule 1:** a fact enters `schemes.seed.json` only after a human opens the **primary** source (official portal, GR, notification, PIB) and records `sourceUrl`, `verifiedOn`, `verifiedBy`.
**Rule 2:** anything learned from an aggregator, news site or blog is `unverified` and displayed as such.
**Rule 3:** when two sources disagree, store `status: "conflict"` with both values — that is a feature, not an embarrassment.

Legend: ✔ seen on an official page during research tonight · ◐ secondary source only · ✖ sources conflict · ☐ not checked

---

## 1. Source registry (what the worker may watch)

| ID | Candidate | Mode | Why it is useful | Known issues / to probe |
|---|---|---|---|---|
| `pmkisan-home` | `https://pmkisan.gov.in/` | `page`, selector for banner/notice area | Official instalment notices, e-KYC and withheld-case notes appear as text on the home page. | Retrieved URL had an ASP.NET **session token in the path** → always fetch the canonical URL. Page has live counters ("period-wise farmers benefited") → needs `ignorePatterns`. |
| `pib-agri` | PIB: Ministry of Agriculture & Farmers Welfare releases (locate listing or RSS during probe) | `listing` (new-item detection) | Carries **publication timestamps** → only source where true detection lag can be computed. Stable. | National news is noisy → keep only items matching scheme aliases. |
| `pmfby-portal` | `https://pmfby.gov.in/` | `page` or manual | Authoritative for insurance notices and state cut-off references. | Likely JS-rendered/dynamic; state notifications may be PDFs. Probe. |
| `mh-agri-gr` | Maharashtra Agriculture Dept. circulars / GR listing (department site and state GR portal — **URLs unverified**) | `listing` / `pdf` | Where state-level changes (premium, instalment GRs) are published. | Marathi PDFs may be scanned or use legacy fonts → mark `manual` if text not extractable. |
| `nsmny-portal` | Namo Shetkari portal — two domains seen in sources (`nsmny.mahait.org`, `nsmny.mahaonline.gov.in`) → **confirm which is official** | `page` | Instalment news and beneficiary notices. | Domain ambiguity; may be login-gated. |
| `mahadbt-public` | `https://mahadbt.maharashtra.gov.in/` | **link-only** | Application route for PDMC / SMAM. | Login-gated; do not scrape. |
| *(excluded)* | myScheme | **link-only** | Discovery portal. | Terms of use (Hindi version read) restrict bots/scrapers without written permission. Read the English terms; do not automate. |

**Target:** at least 3 sources with `mode: "auto"` that return stable, readable text. The rest stay `manual` with a human "last checked by" date. Do not hide the manual ones — the Source Health page should show them as manual.

## 2. Source probe (Phase 0, ≤ 30 min) — `worker/probe.mjs`

For each candidate, from an **Indian network**, record:

| Check | How |
|---|---|
| Reachable | HTTP status, redirect chain, response time |
| Content type | `text/html`, `application/pdf`, RSS/XML |
| Text present without JS? | Does the fetched HTML contain the notice text you can see in a browser? |
| Dynamic noise | Fetch twice 2 minutes apart; list lines that differ (counters, "today's date", tokens) |
| Robots / terms | Fetch `/robots.txt`; open the site's terms/policy page; note anything restricting automated access |
| Blocking | 403, 429, CAPTCHA page, geo-block (try once from CI too if you plan to use it) |
| Selector | CSS selector that isolates the notice area; confirm it is non-empty |

Write results back to `sources/{id}` (`status`, `robotsOk`, `tosNote`) and into `data/eval/probe-report.json`. **Keep that file — it is evidence for the judges and for `EVALUATION.md`.**

Decision: `auto` if text present + stable after ignore patterns + not restricted; otherwise `manual`.

---

## 3. Scheme records (5)

### 3.1 `pm-kisan` — PM-KISAN (central income support)

| Fact | Value (to confirm) | Status |
|---|---|---|
| Benefit | ₹6,000 per year in three instalments of ₹2,000 | ◐ |
| e-KYC mandatory; OTP e-KYC on portal, biometric at CSC | as stated on the home page | ✔ |
| Benefits withheld pending physical verification for suspected exclusions, e.g. land acquired after 01-02-2019, or more than one family member receiving benefits | as stated on the home page | ✔ |
| Farmer ID required for payments | reported by several news outlets; official statement not seen | ◐ |
| Latest instalment | 22nd: 13 Mar 2026 (home page copy retrieved) ✔; 23rd: 20 Jun 2026 (secondary source citing PIB) ◐ | ✔ / ◐ |
| Annual e-KYC for FY 2026-27 | one notice seen came from a different state's department → do not generalise | ◐ |
| Helpline | 155261 (one aggregator) | ◐ |
| Landholding farmer families are the beneficiaries (landless → `NOT_MATCHING` rule) | widely reported; not read from the guidelines tonight | ◐ **verify before enabling the `NOT_MATCHING` branch** |
| Exclusion categories; inheritance exception for post-2019 land | — | ☐ read the official guidelines before encoding rules |

⚠ The copy of the home page I retrieved still showed the 22nd-instalment banner while a secondary source dates the 23rd instalment to 20 June 2026. Either my copy was cached or the secondary source is wrong. **Check live.** This is exactly why every fact carries `verifiedOn`.

### 3.2 `nsmny` — Namo Shetkari Mahasanman Nidhi Yojana (Maharashtra)

| Fact | Value (to confirm) | Status |
|---|---|---|
| Benefit | ₹6,000 per year, three ₹2,000 instalments | ◐ |
| Amount change | A wire report mentions an increase to ₹9,000 (year not visible); 2026 explainers still say ₹6,000 | ✖ |
| Link to PM-KISAN | PM-KISAN-registered farmers reported as automatically covered (Vikaspedia) | ◐ |
| Instalments | 8th instalment reported March 2026 (approx. ₹1,774 crore, ~90 lakh farmers) | ◐ |
| Possible exclusion for farmers receiving the state's loan-waiver benefit (for one year) | **"under consideration"** per a July 2026 explainer | ◐ — high-value monitoring target |
| Official portal domain | two variants seen | ✖ |
| Helpline | 1800-233-4000 (one aggregator) | ◐ |

### 3.3 `pmfby` — Pradhan Mantri Fasal Bima Yojana

| Fact | Value (to confirm) | Status |
|---|---|---|
| Farmer share | Kharif 2%, Rabi food/oilseed 1.5%, annual commercial/horticultural 5% of sum insured | ◐ (one source inverts Kharif/Rabi) |
| Maharashtra model | ₹1 model wound up in 2025; standard farmer share restored | ◐ |
| Rabi 2026-27 enrolment cut-off | **Set by state notification.** Sources cite 15 Dec (guideline indicative), 31 Dec (most states), Oct–Nov (typical window). Maharashtra's crop/district-specific date: **not found** | ☐ **top priority to read from the primary source** |
| Crop and village must be notified | yes (several sources) | ◐ |
| Tenant / sharecropper farmers can enrol (with required documents) | not read from the guidelines tonight | ☐ **verify before enabling the `NOT_MATCHING` branch for landless** |
| Crop-loss reporting | helpline 14447 and Crop Insurance app; report localized calamities within 72 hours | ◐ |
| Enrolment routes | bank (loanee), CSC, portal, insurer agent | ◐ |

### 3.4 `pdmc-mh` — Per Drop More Crop (micro-irrigation), Maharashtra

| Fact | Value | Status |
|---|---|---|
| Parent scheme | PMKSY-PDMC (older label) vs PM-RKVY-PDMC (2022-23 onwards per 2026 guidelines found) | ✖ |
| Supports drip and sprinkler systems | ◐ |
| Application route in Maharashtra | via MahaDBT (from earlier thread — verify) | ◐ |
| Subsidy %, eligibility, documents, ceiling | — | ☐ do not seed numbers until read from Maharashtra guidelines |

### 3.5 `smam-mh` — Sub-Mission on Agricultural Mechanization, Maharashtra

Nothing verified tonight. Seed as name + official link + "details not yet verified". **Info-only; no rules.**

### Dropped from MVP
Dr. Babasaheb Ambedkar Krushi Swavalamban Yojana and Birsa Munda Krishi Kranti Yojana — need social-category data; revisit with a consent design.

---

## 4. Conflict ledger (keep updating; show it on the Source Health page)

| Topic | Value A | Value B | Owner | Resolved? |
|---|---|---|---|---|
| PMFBY Rabi/Kharif farmer share | Kharif 2 / Rabi 1.5 | Kharif 1.5 / Rabi 2 | — | ☐ |
| NSMNY annual amount | ₹6,000 | ₹9,000 | — | ☐ |
| PDMC parent scheme | PMKSY | PM-RKVY | — | ☐ |
| NSMNY official domain | nsmny.mahait.org | nsmny.mahaonline.gov.in | — | ☐ |
| PM-KISAN latest instalment | 22nd (13 Mar 2026) | 23rd (20 Jun 2026) | — | ☐ |
| PMFBY Rabi cut-off (MH) | 15 Dec | 31 Dec | — | ☐ |

---

## 5. Watch-list (events the monitor should be able to catch)

| Event | Source type | Why it matters |
|---|---|---|
| Maharashtra Rabi 2026-27 PMFBY cut-off notification or extension | state notification / PMFBY portal | Missing it means no cover for the season |
| PM-KISAN next instalment announcement, e-KYC / Farmer ID notices | `pmkisan-home`, PIB | Payment blockers |
| NSMNY instalment GR or rule change (e.g. exclusion) | `mh-agri-gr`, `nsmny-portal` | Amount and who receives it |
| Wording changes to withheld-case criteria | `pmkisan-home` | Who is blocked |

---

## 6. Seed file shape (`data/schemes.seed.json`)

```json
{
  "id": "pm-kisan",
  "name": "PM-KISAN",
  "level": "central",
  "category": "income-support",
  "ruleSet": "pm-kisan",
  "facts": {
    "ekyc_mandatory": {
      "value": "e-KYC is mandatory; OTP e-KYC on the portal or biometric at a CSC.",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": "2026-10-30",
      "verifiedBy": "<your name>",
      "status": "verified"
    },
    "annual_benefit": {
      "value": "₹6,000 per year in three instalments of ₹2,000",
      "sourceUrl": "https://pmkisan.gov.in/",
      "verifiedOn": null,
      "verifiedBy": null,
      "status": "unverified"
    }
  },
  "officialLinks": [{ "label": "PM-KISAN portal", "url": "https://pmkisan.gov.in/" }],
  "documents": [],
  "steps": []
}
```

## 7. Sources consulted while writing this pack (all secondary unless noted)

- myScheme FAQ (official, MeitY/Digital India Corp.): https://www.myscheme.gov.in/faqs
- myScheme terms of use (Hindi): https://www.myscheme.gov.in/hi/terms-of-use
- PM-KISAN portal home (official): https://pmkisan.gov.in/
- MahaVISTAAR-AI coverage: AgroSpectrum AI4Agri2026 reports; All India Radio/PIB-derived news (Feb 2026)
- Bharat-VISTAAR: NITI Aayog Frontier Tech story; trade press
- PMFBY Rabi 2026-27 explainers: several (they disagree — see ledger)
- Maharashtra ₹1 insurance wind-up: PTI via The Week (Apr 2025)
- Namo Shetkari: Vikaspedia; trade explainers; Drishti IAS (Jul 2026); UNI
- PDMC under PM-RKVY: Drishti IAS (Sep 2026); a state guideline PDF (2026-27)
