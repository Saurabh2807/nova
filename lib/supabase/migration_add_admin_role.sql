-- ==============================================================================
-- NOVA FORGE: Add 'admin' to 4-Tier Staff Hierarchy
-- Updates admin_profiles CHECK constraint to allow 'admin' role:
-- super_admin, admin, core_member, volunteer
-- ==============================================================================

-- 1. DROP EXISTING ROLE CONSTRAINT
ALTER TABLE public.admin_profiles DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

-- 2. ADD UPDATED 4-TIER ROLE CONSTRAINT
ALTER TABLE public.admin_profiles 
  ADD CONSTRAINT admin_profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'core_member', 'volunteer'));
