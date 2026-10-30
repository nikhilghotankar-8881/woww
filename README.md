# Shetkari SuchnaSetu — Official Notice Change Monitor for Farmers

An intelligent web application and scheduled monitoring engine that watches official agricultural government portals (**PM-KISAN**, **PMFBY**, **Namo Shetkari (NSMNY)**, **MahaDBT**, **PIB Agriculture**), detects when notices or deadlines change in ways that affect farmers, shows the exact source-grounded diff, requires human approval before dispatch, and delivers verified alerts to farmers matching their profile.

It also publishes its own measured accuracy and Wilson confidence intervals on an empirical Evaluation page.

---

## Architecture Overview

```
                      Farmer / Reviewer / Judge (Browser)
                                      │
                         React + Vite + Tailwind CSS
                    (Supabase Auth & Realtime Subscriptions)
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
  ┌────────────────────────┐                    ┌────────────────────────┐
  │  Supabase PostgreSQL   │                    │      Node.js Worker    │
  │                        │◄─── Service Role ──│  fetch → diff →        │
  │ • profiles  • schemes  │     (Bypasses RLS) │  classify → extract →  │
  │ • sources   • alerts   │                    │  ground → fanout       │
  │ • changes   • eval_runs│                    └───────────┬────────────┘
  │ • snapshots • user_roles│                                │ (Polite fetch)
  └────────────────────────┘                                ▼
                                                Official Government Portals
                                                (pmkisan.gov.in, pmfby.gov.in, PIB)
```

---

## Key Principles & Hard Rules

1. **Never state "eligible"**: Determinations are rule-guided indicators: `May apply`, `Doesn't meet stated criteria`, or `Need more info`.
2. **Grounded extraction**: Every extracted field (dates, amounts, requirements) is verified to appear **verbatim** in the fetched source text.
3. **Human-in-the-loop review**: Crawler detections are held in a pending queue until a human reviewer inspects the diff and approves it.
4. **Transparent Conflict Ledger**: Contradictory information across portals is openly catalogued rather than guessed.
5. **Empirical accuracy**: Evaluation metrics come directly from `eval/run-eval.mjs` with honest sample sizes ($n$) and Wilson intervals.

---

## Project Structure

```
d:\woww\
├── web/                       # React 18 + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/        # SchemeCard, ProvenanceBadge, AlertCard, DiffView, ReviewCard
│   │   ├── pages/             # Schemes, SchemeDetail, Profile, Matches, Alerts, AdminReview, SourceHealth, Evaluation, Login
│   │   ├── hooks/             # useAuth (Supabase auth + demo mode)
│   │   ├── i18n/              # English, Marathi, Hindi dictionaries
│   │   └── lib/               # Supabase client configuration
├── worker/                    # Node.js ESM crawler and detection worker
│   ├── run.mjs                # Worker entry: --watch, --replay <dir>, live pass
│   ├── probe.mjs              # Phase 0 source probe utility
│   ├── seed.mjs               # Seeds Supabase from data/*.seed.json
│   ├── set-admin.mjs          # Grants admin/reviewer privileges
│   └── lib/                   # Pure functions: fetch, normalize, diff, classify, ground, extract, match, fanout
├── eval/                      # Evaluation suite (E1–E4)
│   └── run-eval.mjs           # Benchmarks extraction accuracy, precision, recall, latency, rule fidelity
├── sql/                       # Supabase PostgreSQL migrations
│   ├── 001_schema.sql         # Table DDL
│   ├── 002_rls_policies.sql   # Row-Level Security policies
│   ├── 003_functions.sql      # Database triggers and admin functions
│   └── 004_seed.sql           # Initial schemes and sources seed data
├── data/                      # Verified schemes, sources, and eval corpus
│   ├── schemes.seed.json
│   ├── sources.seed.json
│   └── eval/                  # Hand-labelled ground truth and replay snapshots
```

---

## Quick Start (Local Development)

### 1. Run Evaluation Suite (Offline Verification)

Test the extraction, classification, grounding, and rule matching pipeline:

```bash
node eval/run-eval.mjs
```

### 2. Run Worker in Replay Mode

Replay baseline vs changed notice snapshots:

```bash
node worker/run.mjs --replay data/eval/corpus/pmkisan-home
```

### 3. Start Frontend Dev Server

```bash
cd web
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Supabase Setup (Free Tier)

1. Create a free project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the SQL scripts in this exact order:
   - `sql/001_schema.sql` (Creates all tables and enables Realtime publication)
   - `sql/002_rls_policies.sql` (Configures Row-Level Security)
   - `sql/003_functions.sql` (Adds automatic profile triggers and admin helper)
   - `sql/004_seed.sql` (Populates verified schemes and monitored sources)
4. Copy your project URL and keys:
   - In `web/.env`:
     ```env
     VITE_SUPABASE_URL=https://<your-project>.supabase.co
     VITE_SUPABASE_ANON_KEY=<your-anon-key>
     ```
   - In `worker/.env`:
     ```env
     SUPABASE_URL=https://<your-project>.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
     GEMINI_API_KEY=<your-gemini-key-optional>
     ```
5. Grant yourself admin reviewer privileges:
   ```bash
   node worker/set-admin.mjs <your-email-or-uid>
   ```

---

## 5-Minute Golden Path Demo

1. **Open Frontend**: Open [http://localhost:5173](http://localhost:5173).
2. **Schemes Directory**:
   - Inspect **PM-KISAN**, **PMFBY**, and **NSMNY**.
   - Point out **Provenance Badges**: Green = Primary Source Verified, Red = Discrepancy Recorded.
   - Click to open the official government portal.
3. **Log in as Farmer**:
   - Use the **Demo Farmer** shortcut button.
   - Go to **My Profile** → District: Pune, Crops: Wheat & Gram, Land: Owner.
   - Navigate to **My Matches**: See rule-based determinations (`May apply`, with explicit criteria). Notice the word "eligible" is strictly avoided.
4. **Inspect Source Health**:
   - See live crawler status, polling intervals, and the **Public Conflict Ledger**.
5. **Trigger Notice Change (Admin Flow)**:
   - Run replay in terminal: `node worker/run.mjs --replay data/eval/corpus/pmkisan-home`.
   - Log in as **Demo Reviewer** → Open **Review Queue**.
   - Review the newly detected change: examine the **Line Diff**, the verbatim **Grounding Verification**, and click **Approve & Fan Out**.
6. **Farmer Real-Time Alert**:
   - Switch back to Farmer view → Open **Alerts**.
   - Notice the real-time arrival of the personalized alert showing the exact wording difference, check timestamp, and official portal link.
7. **Evaluation Page**:
   - Open **Evaluation** to show empirical precision, recall, extraction accuracy (with Wilson 95% confidence intervals), and matching rule fidelity.

