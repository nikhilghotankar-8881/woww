# MONITORING_SPEC.md — how detection and verification actually work

Goal: turn "a page changed" into "a **material** change, with evidence, that a human approved". Detecting a change and understanding its meaning are separate problems; this pipeline keeps them separate.

## 1. Pipeline

| # | Step | Output | Failure → |
|---|---|---|---|
| 1 | Select due sources (`now − lastCheckedAt ≥ intervalMin`, `mode=auto`) | list | — |
| 2 | Polite fetch: descriptive `User-Agent`, 20 s timeout, 2 retries with backoff, conditional GET (`ETag` / `If-Modified-Since`) | raw body, status | `status=blocked|error`, no change |
| 3 | Region extract: CSS selector (page), item list (listing/RSS), PDF text | text | empty → `structure-changed` |
| 4 | Normalise | stable text lines | — |
| 5 | Hash; compare to previous snapshot | same / different | same → update `lastCheckedAt` only |
| 6 | Line diff (added / removed) | diff | — |
| 7 | Drop lines matching `ignorePatterns` | filtered diff | empty → cosmetic |
| 8 | Classify each changed line | material / cosmetic | — |
| 9 | Extract fields (regex first, optional LLM) | `{name,value,evidence}[]` | LLM error → regex only |
| 10 | **Ground** every field against the new snapshot text | `grounded|ungrounded|conflict` | — |
| 11 | Compare with `schemes/*` facts → conflict flag | notes | — |
| 12 | Tag schemes (`source.schemeIds` or alias match) | `schemeIds[]` | none → admin triage |
| 13 | Write `changes/{id}` with `reviewStatus=pending` | doc | — |
| 14 | After approval: match profiles and write alerts | alerts | — |

## 2. Normalisation (`normalize.mjs`)

```js
export function normalize(html, { selector, ignorePatterns = [] }) {
  const $ = cheerio.load(html);
  $('script,style,noscript,nav,footer,header,iframe').remove();
  const root = selector ? $(selector) : $('body');
  const lines = root.text()
    .replace(/\u00a0/g, ' ')
    .split(/\n+/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(l => !ignorePatterns.some(p => new RegExp(p, 'i').test(l)));
  return lines.join('\n');
}
export const canonicalUrl = u => u.replace(/\/\(S\([^)]*\)\)/i, ''); // strips ASP.NET session path
```

Per-source `ignorePatterns` (examples to tune during the probe): visitor counters, "last updated: <today>", "period wise number of farmers", rotating banners, timestamps inside the page chrome.

## 3. Materiality classifier (`classify.mjs`)

A changed line is **material** if it contains a date, a money amount, or an obligation/eligibility keyword. Otherwise cosmetic.

```js
const DATE = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+\d{4})\b/i;
const MONEY = /(₹|rs\.?|inr)\s?[\d,]+(\.\d+)?/i;
const KEYWORDS_EN = /(last date|cut-?off|deadline|extended|extension|eligib|exclu|mandatory|e-?kyc|farmer id|instal?lment|withheld|revised|corrigendum|notified|premium)/i;
const KEYWORDS_MR = /(शेवटची तारीख|अंतिम दिनांक|मुदतवाढ|पात्र|हप्ता|ई-केवायसी|शेतकरी ओळख)/; // have a Marathi speaker confirm

export const isMaterial = line => DATE.test(line) || MONEY.test(line) || KEYWORDS_EN.test(line) || KEYWORDS_MR.test(line);
export const classify = diff => diff.some(d => isMaterial(d.line)) ? 'material' : 'cosmetic';
```

This is deliberately simple and testable. Its precision/recall is exactly what E2 measures. Improve it only by adding labelled cases to the corpus.

## 4. Listing sources (new-item detection)

For `listing`/RSS sources (PIB, GR lists): keep the set of `{title, url, publishedAt}`; a **new** item whose title matches a scheme alias becomes a candidate change with `publishedAt` from the source (enables true lag measurement).

```js
const seen = new Set(prev.items.map(i => i.url));
const fresh = items.filter(i => !seen.has(i.url) && aliasMatch(i.title, source.schemeAliases));
```

## 5. Extraction

**Step A — deterministic.** Regex for dates, amounts and keyword sentences from added lines. Each hit stores `{name, value, evidence}` where `evidence` is the full source line.

**Step B — optional LLM (worker only).** Temperature 0. Prompt skeleton:

```
You extract facts from an official Indian government notice. Use ONLY the text below.
Return JSON: {"fields":[{"name": one of [last_date, instalment_date, amount, requirement, scheme_name, applies_to],
"value": string, "evidence": string copied VERBATIM from the text}]}.
If a field is not explicitly stated, omit it. Do not infer, convert, or translate.
TEXT:
<added lines + 3 lines of context>
```

The LLM is never trusted: its output goes through the grounding check.

## 6. Grounding check (`ground.mjs`) — the meaning of "verified"

```js
const n = s => s.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();

export function ground(fields, sourceText) {
  const text = n(sourceText);
  const notes = [];
  for (const f of fields) {
    const ev = n(f.evidence), val = n(f.value);
    if (!text.includes(ev))  notes.push(`evidence not found: ${f.name}`);
    else if (!ev.includes(val)) notes.push(`value not inside evidence: ${f.name}`);
  }
  return { status: notes.length ? 'ungrounded' : 'grounded', notes };
}
```

A change is **verified** only when: (1) grounding = `grounded`; (2) no unflagged conflict against `schemes/*` or a second source (conflicts set `grounding='conflict'` and are shown in red); (3) a reviewer approved it.

**Conflict rule:** if an extracted `amount`/`date` for a scheme differs from the stored fact or from another source's value, flag `conflict`. The reviewer decides; the app never silently overwrites a scheme fact.

## 7. Summaries

Generated at detection time, stored on the change:
- **Template (default):** `"{schemeName}: the official {sourceName} page now says '{evidence}' (checked {time})."` — uses verbatim evidence, no model needed.
- **LLM (optional):** one-sentence plain-language explanation; must pass a check that every date/amount in the summary appears in the evidence. If not, fall back to the template.

## 8. Scheduling and etiquette

- Default `intervalMin = 60`; never below 30. Manual "check now" for demo only (worker CLI).
- Honour `robots.txt`; do not log in; do not solve CAPTCHAs; no parallel hammering (one request per host at a time).
- `User-Agent: ShetkariSuchnaSetu/0.1 (student prototype; contact: <email>)`.
- Prefer running from an Indian network. If using CI, verify the runner can reach each source first (see `RISKS.md`).

## 9. Replay mode

`node worker/run.mjs --replay data/eval/corpus/<source>/` reads `01.html`, `02.html`, … in order, runs the same pipeline with the file's capture time as `fetchedAt`, and writes changes flagged `synthetic` or `archived` per `manifest.json`. No network needed. Used by `eval/run-eval.mjs` and as the demo fallback.

## 10. Edge cases checklist

- Session tokens/query params in URLs → canonicalise.
- Dates like "today" or rotating "last updated" stamps → ignore patterns.
- Same content, different whitespace/entity encoding → normalisation.
- Site redesign → selector empty or text shrinks >70% → `structure-changed`, no change generated.
- HTTP 200 with a CAPTCHA/maintenance page → detect by short length or known phrases → `blocked`.
- PDFs: hash bytes; extract text with `pdf-parse`; no text → `manual`.
- Marathi legacy-font PDFs may extract as garbage → treat as no text.

## 11. Test cases to write first (they become the E2 seed)

1. Identical page, only counter changes → cosmetic.
2. A deadline date changes → material, field extracted, grounded.
3. A paragraph added mentioning "e-KYC mandatory" → material.
4. Nav/menu text changes → cosmetic.
5. Selector breaks → `structure-changed`.
6. LLM returns a value not in the text → `ungrounded`.
7. Extracted amount contradicts the seed record → `conflict`.
