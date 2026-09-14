-- ==============================================================================
-- NOVA FORGE: Staff Role Architecture Migration Script
-- Updates admin_profiles to 3-tier hierarchy: super_admin, core_member, volunteer
-- Adds is_active, user_id, updated_at, last_login_at
-- Migrates ONLY Saurabh Kumar Singh (saurabhsinghkarmwarrajput@gmail.com) to super_admin
-- Any other accounts with legacy 'admin' or 'volunteer' become 'volunteer' by default unless updated
-- ==============================================================================

-- 1. ADD NEW COLUMNS TO admin_profiles
ALTER TABLE public.admin_profiles 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. BACKFILL user_id FROM id
UPDATE public.admin_profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- 3. DROP OLD ROLE CONSTRAINT & UPDATE VALUES SAFELY
ALTER TABLE public.admin_profiles DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

-- Ensure Saurabh Kumar Singh (only Super Admin) has role = 'super_admin'
UPDATE public.admin_profiles 
SET 
  role = 'super_admin',
  full_name = 'Saurabh Kumar Singh',
  is_active = true,
  updated_at = now()
WHERE lower(email) = 'saurabhsinghkarmwarrajput@gmail.com';

-- Ensure any other legacy accounts are mapped to safe non-super-admin roles
UPDATE public.admin_profiles 
SET 
  role = 'volunteer',
  updated_at = now()
WHERE lower(email) != 'saurabhsinghkarmwarrajput@gmail.com' 
  AND role NOT IN ('core_member', 'volunteer');

-- 4. ENFORCE NEW THREE-TIER ROLE CONSTRAINT
ALTER TABLE public.admin_profiles 
  ADD CONSTRAINT admin_profiles_role_check 
  CHECK (role IN ('super_admin', 'core_member', 'volunteer'));

-- 5. UPDATE AUDIT LOGS TABLE FOR STAFF ACTIONS
ALTER TABLE public.check_in_logs
  ADD COLUMN IF NOT EXISTS actor_role TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;

-- 6. ROW LEVEL SECURITY
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read admin profile" ON public.admin_profiles;
CREATE POLICY "Read admin profile" ON public.admin_profiles FOR SELECT TO authenticated USING (true);
