-- 001_schema.sql
-- Shetkari SuchnaSetu Database Schema for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (Farmer profile, linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  district TEXT,
  crops TEXT[] DEFAULT '{}',
  land_status TEXT CHECK (land_status IN ('owner', 'tenant', 'landless', NULL)),
  land_on_or_before_2019 BOOLEAN,
  loanee BOOLEAN,
  ekyc_done TEXT CHECK (ekyc_done IN ('yes', 'no', 'unsure', NULL)),
  farmer_id TEXT,
  exclusion_applies BOOLEAN DEFAULT FALSE,
  season TEXT,
  follows TEXT[] DEFAULT '{}',
  lang TEXT DEFAULT 'en' CHECK (lang IN ('en', 'mr', 'hi')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHEMES (Verified government schemes)
CREATE TABLE IF NOT EXISTS public.schemes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_mr TEXT,
  name_hi TEXT,
  category TEXT,
  level TEXT CHECK (level IN ('central', 'state')),
  nodal_body TEXT,
  facts JSONB DEFAULT '{}',
  documents JSONB DEFAULT '[]',
  steps JSONB DEFAULT '[]',
  official_links JSONB DEFAULT '[]',
  rule_set TEXT,
  summary_mr JSONB,
  summary_hi JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SOURCES (Monitored official notice pages/listings/PDFs)
CREATE TABLE IF NOT EXISTS public.sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('page', 'listing', 'pdf', 'rss')),
  selector TEXT,
  ignore_patterns TEXT[] DEFAULT '{}',
  scheme_ids TEXT[] DEFAULT '{}',
  scheme_aliases JSONB DEFAULT '{}',
  interval_min INTEGER DEFAULT 60,
  mode TEXT DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
  status TEXT DEFAULT 'ok' CHECK (status IN (
    'ok', 'blocked', 'js-rendered', 'structure-changed', 'error', 'manual'
  )),
  last_checked_at TIMESTAMPTZ,
  last_changed_at TIMESTAMPTZ,
  last_error TEXT,
  robots_ok BOOLEAN DEFAULT TRUE,
  tos_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SNAPSHOTS (Raw captured texts for diffing)
CREATE TABLE IF NOT EXISTS public.snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT REFERENCES public.sources(id) ON DELETE CASCADE,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  http_status INTEGER,
  duration_ms INTEGER,
  bytes INTEGER,
  content_hash TEXT,
  text TEXT,
  etag TEXT,
  last_modified TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snapshots_source ON public.snapshots(source_id, fetched_at DESC);

-- 5. CHANGES (Detected changes between snapshots)
CREATE TABLE IF NOT EXISTS public.changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT REFERENCES public.sources(id) ON DELETE SET NULL,
  scheme_ids TEXT[] DEFAULT '{}',
  from_snapshot_id UUID REFERENCES public.snapshots(id) ON DELETE SET NULL,
  to_snapshot_id UUID REFERENCES public.snapshots(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  fetch_started_at TIMESTAMPTZ,
  materiality TEXT CHECK (materiality IN ('material', 'cosmetic')),
  diff JSONB DEFAULT '[]',
  fields JSONB DEFAULT '[]',
  grounding TEXT CHECK (grounding IN ('grounded', 'ungrounded', 'conflict')),
  grounding_notes TEXT[] DEFAULT '{}',
  summary TEXT,
  summary_method TEXT CHECK (summary_method IN ('template', 'llm')),
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  fanned_out_at TIMESTAMPTZ,
  synthetic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_changes_review ON public.changes(review_status, fanned_out_at);

-- 6. ALERTS (Targeted notices for farmers based on rule matching)
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_id UUID REFERENCES public.changes(id) ON DELETE CASCADE,
  scheme_id TEXT REFERENCES public.schemes(id) ON DELETE SET NULL,
  match_state TEXT CHECK (match_state IN ('MAY_APPLY', 'NOT_MATCHING', 'NEED_INFO')),
  reasons TEXT[] DEFAULT '{}',
  headline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.alerts(user_id, created_at DESC);

-- 7. EVAL_RUNS (Empirical evaluation results from eval/run-eval.mjs)
CREATE TABLE IF NOT EXISTS public.eval_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('extraction', 'detection', 'matching', 'latency', 'usability')),
  corpus_version TEXT,
  n INTEGER,
  synthetic BOOLEAN DEFAULT FALSE,
  metrics JSONB DEFAULT '{}',
  notes TEXT,
  git_sha TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. USER_ROLES (Admin access control flag)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for alerts and changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.changes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sources;

