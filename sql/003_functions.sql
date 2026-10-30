-- 003_functions.sql
-- Triggers and utility functions for Shetkari SuchnaSetu

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger on schemes
DROP TRIGGER IF EXISTS set_schemes_updated_at ON public.schemes;
CREATE TRIGGER set_schemes_updated_at
  BEFORE UPDATE ON public.schemes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Automatically create profile row when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, lang, created_at, updated_at)
  VALUES (NEW.id, 'en', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user role record
  INSERT INTO public.user_roles (user_id, is_admin, created_at)
  VALUES (NEW.id, FALSE, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper function to make a user admin by email
CREATE OR REPLACE FUNCTION public.set_admin_by_email(target_email TEXT, make_admin BOOLEAN DEFAULT TRUE)
RETURNS VOID AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;
  IF target_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, is_admin, created_at)
    VALUES (target_id, make_admin, NOW())
    ON CONFLICT (user_id) DO UPDATE SET is_admin = make_admin;
  ELSE
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

