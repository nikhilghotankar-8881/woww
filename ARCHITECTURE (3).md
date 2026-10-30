# ARCHITECTURE.md

## 1. Shape

```
 Farmer / Reviewer / Judge (browser)
        │  React + Vite (Firebase Hosting)
        │  Auth (email/Google)  ·  Firestore client SDK
        ▼
 ┌──────────────────────────── Firestore ────────────────────────────┐
 │ profiles · schemes · sources · snapshots · changes · alerts · evalRuns │
 └──────────────────────────▲────────────────────────────────────────┘
                            │ Admin SDK (service account, never in the browser)
                   ┌────────┴─────────┐
                   │  Worker (Node)   │  runs on a laptop/VM in India, or CI if reachable
                   │  fetch→diff→     │
                   │  classify→extract│──► optional LLM (key only in worker env)
                   │  →ground→fanout  │
                   └────────┬─────────┘
                            ▼
                Official pages / PDFs / RSS (polite, scheduled)
```

**Why no Cloud Functions:** they need the Blaze plan, add deploy time, and nothing in the MVP needs them. The worker is a plain Node script that can later be wrapped as a scheduled function. **Why no interactive LLM endpoint:** explanations are generated at detection time and stored, so no key is exposed and no chatbot is needed.

## 2. Components

| Component | Responsibility | Notes |
|---|---|---|
| `web/` | Login, profile, schemes, alerts, admin review, source health, evaluation | Reads Firestore directly; writes only `profiles/{uid}`, `alerts/{uid}/items/{id}.readAt`, and (admin) `changes/{id}` review fields |
| `worker/run.mjs` | One pass over due sources; `--watch` also fans out approved changes every ~10 s; `--replay <dir>` runs offline | Same code path for live and replay |
| `worker/lib/*` | Pure functions: `fetch`, `normalize`, `diff`, `classify`, `extract`, `ground`, `match`, `fanout` | Imported by `eval/run-eval.mjs` so evaluation tests the real code |
| `eval/run-eval.mjs` | Runs E1–E4 on `data/eval/*`, writes `evalRuns/*` | Output is what the Evaluation page charts |
| `firestore.rules` | Access control | Section 4 |

## 3. Firestore schema

### `sources/{id}` (public read)
```
name, url, type: "page"|"listing"|"pdf"|"rss", selector, ignorePatterns[],
schemeIds[], schemeAliases{schemeId:[regex]}, intervalMin, mode: "auto"|"manual",
status: "ok"|"blocked"|"js-rendered"|"structure-changed"|"error"|"manual",
lastCheckedAt, lastChangedAt, lastError, robotsOk, tosNote
```

### `snapshots/{id}` (admin read)
```
sourceId, fetchedAt, httpStatus, durationMs, bytes, contentHash, text (≤200 KB), etag, lastModified
```
Keep the latest 20 per source.

### `changes/{id}` (approved: public read; all: admin read)
```
sourceId, schemeIds[], fromSnapshotId, toSnapshotId, detectedAt, fetchStartedAt,
materiality: "material"|"cosmetic",
diff: [{type:"add"|"del", line}],
fields: [{name, value, evidence, method:"regex"|"llm"}],
grounding: "grounded"|"ungrounded"|"conflict", groundingNotes[],
summary (≤240 chars, generated at detection), summaryMethod: "template"|"llm",
reviewStatus: "pending"|"approved"|"rejected", reviewedBy, reviewedAt, reviewNote,
fannedOutAt, synthetic: boolean
```

### `schemes/{id}` (public read)
```
name, nameMr?, category, level: "central"|"state", nodalBody,
facts: { <key>: { value, sourceUrl, verifiedOn, verifiedBy, status } },
documents[], steps[], officialLinks[], ruleSet: "pm-kisan"|"nsmny"|"pmfby"|null,
summaryMr?: { text, reviewedBy, reviewedOn }
```

### `profiles/{uid}` (owner only)
```
district, crops[], landStatus, landOnOrBefore2019, loanee, ekycDone, farmerId,
exclusionApplies, season, follows[], lang, createdAt, updatedAt
```

### `alerts/{uid}/items/{id}` (owner read; owner may set `readAt` only)
```
changeId, schemeId, matchState, reasons[], headline, createdAt, readAt
```

### `evalRuns/{id}` (public read)
```
type: "extraction"|"detection"|"matching"|"latency"|"usability",
corpusVersion, n, synthetic: boolean, metrics{}, notes, createdAt, gitSha
```

## 4. Security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function signedIn() { return request.auth != null; }
    function isAdmin()  { return signedIn() && request.auth.token.admin == true; }

    match /profiles/{uid} {
      allow read, write: if signedIn() && request.auth.uid == uid;
    }

    match /alerts/{uid}/items/{id} {
      allow read: if signedIn() && request.auth.uid == uid;
      allow update: if signedIn() && request.auth.uid == uid
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['readAt']);
    }

    match /schemes/{id}   { allow read: if true; }
    match /sources/{id}   { allow read: if true; }
    match /evalRuns/{id}  { allow read: if true; }

    match /changes/{id} {
      allow read: if (resource.data.reviewStatus == 'approved') || isAdmin();
      allow update: if isAdmin()
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['reviewStatus','reviewedBy','reviewedAt','reviewNote']);
    }

    match /snapshots/{id} { allow read: if isAdmin(); }
  }
}
```
Grant admin: `admin.auth().setCustomUserClaims(uid, { admin: true })` from a one-off worker script. All other writes come from the worker via Admin SDK (bypasses rules).

**Test with two accounts** before demo: user A must not read user B's profile or alerts; a non-admin must not read `snapshots` or write `changes`.

## 5. Golden path (the demo)

1. Worker fetches `pmkisan-home` (or replays a snapshot pair). Normalised hash differs.
2. Diff has a line with a date/keyword → `material`. Extraction finds `{name:"instalment_release_date", value:"…", evidence:"…"}`.
3. `ground()` confirms evidence text exists verbatim in the new snapshot → `grounded`. Change stored as `pending`.
4. Admin opens review queue, sees before/after diff + source link + grounding result → **Approve**.
5. Worker (`--watch`) sees `approved && !fannedOutAt` → runs `match()` for each profile → writes alerts.
6. Farmer's inbox updates live (Firestore `onSnapshot`) with headline, diff, "published/checked" times, official link.

## 6. Failure handling

| Failure | Behaviour |
|---|---|
| HTTP 403/429/5xx, timeout, CAPTCHA page | Source `status` set accordingly; `lastError` recorded; **no change** generated; Source Health goes red |
| Selector returns empty / text shrinks >70% | `structure-changed`; no change; admin notified in Source Health |
| PDF without extractable text | `manual` flag: "needs human reading"; counted in evaluation as a limitation |
| LLM error / invalid JSON | Fall back to regex-only fields; `summaryMethod: "template"` |
| Grounding fails | `ungrounded`; shown in review queue in red; cannot be approved without an override note |
| Worker offline | Source Health shows growing "minutes since last check" — visible, not hidden |

## 7. Privacy and security

- Collect the minimum in `profiles`; no Aadhaar/bank/OTP/phone/caste. Provide "Delete my data" (deletes profile and alerts).
- Service account JSON and LLM key live only in `worker/.env` (git-ignored) or CI secrets.
- `web/.env` holds Firebase **web** config only (public by design; protection comes from rules).
- Worker identifies itself with a descriptive `User-Agent` and contact email; ≥ 60 min between checks per source; honours robots.txt; no login, no CAPTCHA bypass.

## 8. i18n

`web/src/i18n/{en,mr}.json` for UI chrome. `t(key)`; language stored in profile and `localStorage`. Scheme content stays English unless `summaryMr.reviewedBy` is set.

## 9. Performance and cost

Free tier is enough: a handful of sources × hourly × text-only snapshots; reads dominated by demo traffic. LLM cost (optional) is a few short calls per detected change.

## 10. Later (not now)

Wrap worker as scheduled Cloud Function; FCM push; SMS/WhatsApp via an approved provider; per-district notice scoping from PDFs; OCR for scanned GRs; partnership with a state department for a sanctioned feed.
