-- 002_rls_policies.sql
-- Row-Level Security (RLS) for Shetkari SuchnaSetu

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eval_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users delete own profile" ON public.profiles;
CREATE POLICY "Users delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- 2. SCHEMES (public read)
DROP POLICY IF EXISTS "Public read schemes" ON public.schemes;
CREATE POLICY "Public read schemes" ON public.schemes
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin modify schemes" ON public.schemes;
CREATE POLICY "Admin modify schemes" ON public.schemes
  FOR ALL USING (public.is_admin());

-- 3. SOURCES (public read)
DROP POLICY IF EXISTS "Public read sources" ON public.sources;
CREATE POLICY "Public read sources" ON public.sources
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin modify sources" ON public.sources;
CREATE POLICY "Admin modify sources" ON public.sources
  FOR ALL USING (public.is_admin());

-- 4. SNAPSHOTS (admin only)
DROP POLICY IF EXISTS "Admin read snapshots" ON public.snapshots;
CREATE POLICY "Admin read snapshots" ON public.snapshots
  FOR SELECT USING (public.is_admin());

-- 5. CHANGES (approved are public, pending/rejected are admin only)
DROP POLICY IF EXISTS "Public read approved changes" ON public.changes;
CREATE POLICY "Public read approved changes" ON public.changes
  FOR SELECT USING (review_status = 'approved' OR public.is_admin());

DROP POLICY IF EXISTS "Admin modify changes" ON public.changes;
CREATE POLICY "Admin modify changes" ON public.changes
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. ALERTS (owner only)
DROP POLICY IF EXISTS "Users read own alerts" ON public.alerts;
CREATE POLICY "Users read own alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own alerts" ON public.alerts;
CREATE POLICY "Users update own alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own alerts" ON public.alerts;
CREATE POLICY "Users delete own alerts" ON public.alerts
  FOR DELETE USING (auth.uid() = user_id);

-- 7. EVAL_RUNS (public read)
DROP POLICY IF EXISTS "Public read eval_runs" ON public.eval_runs;
CREATE POLICY "Public read eval_runs" ON public.eval_runs
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admin modify eval_runs" ON public.eval_runs;
CREATE POLICY "Admin modify eval_runs" ON public.eval_runs
  FOR ALL USING (public.is_admin());

-- 8. USER_ROLES (users read own role or admin reads all)
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

