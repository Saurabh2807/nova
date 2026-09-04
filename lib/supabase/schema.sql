-- ==============================================================================
-- NOVA FORGE: Production Supabase Schema
-- LNCT Campus Carnival — BGMI Tournament & Audience Registration System
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EVENT SETTINGS TABLE
-- Allows manual opening and closing of registrations without changing code
CREATE TABLE IF NOT EXISTS event_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_open BOOLEAN NOT NULL DEFAULT true,
  participant_limit INTEGER NOT NULL DEFAULT 250,
  audience_limit INTEGER NOT NULL DEFAULT 1000,
  event_name TEXT NOT NULL DEFAULT 'Nova Forge Campus Carnival',
  event_date TEXT NOT NULL DEFAULT '18–19 September 2026',
  venue TEXT NOT NULL DEFAULT 'LNCT Bhopal',
  reporting_time TEXT NOT NULL DEFAULT '09:00 AM IST',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default event settings if empty
INSERT INTO event_settings (registration_open, participant_limit, audience_limit, event_name, event_date, venue, reporting_time)
SELECT true, 250, 1000, 'Nova Forge Campus Carnival', '18–19 September 2026', 'LNCT Bhopal', '09:00 AM IST'
WHERE NOT EXISTS (SELECT 1 FROM event_settings);

-- 2. ADMIN PROFILES & ROLES
-- Role: 'admin' (can undo check-in, export, modify settings) vs 'volunteer' (scanner & check-in only)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'volunteer')) DEFAULT 'volunteer',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TEAMS TABLE (BGMI Squads)
-- ID Format: NF-BGMI-2026-8X4K7
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id VARCHAR(32) UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  game TEXT NOT NULL DEFAULT 'bgmi',
  qr_token VARCHAR(64) UNIQUE NOT NULL,
  registration_status TEXT NOT NULL CHECK (registration_status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'confirmed',
  check_in_status TEXT NOT NULL CHECK (check_in_status IN ('not_checked_in', 'checked_in')) DEFAULT 'not_checked_in',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast scanner and manual search
CREATE INDEX IF NOT EXISTS idx_teams_team_id ON teams(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_qr_token ON teams(qr_token);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(lower(name));

-- 4. PARTICIPANTS TABLE (Team Members)
-- Strictly 2 members per team (Leader + Member)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id VARCHAR(32) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('leader', 'member')),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone VARCHAR(10) UNIQUE NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  college_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants(team_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(lower(email));
CREATE INDEX IF NOT EXISTS idx_participants_phone ON participants(phone);
CREATE INDEX IF NOT EXISTS idx_participants_college_id ON participants(lower(college_id));

-- 5. TRIGGER: DATABASE-LEVEL TEAM SIZE ENFORCEMENT (Strictly 2 Players)
CREATE OR REPLACE FUNCTION check_bgmi_team_size()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM participants
  WHERE team_id = NEW.team_id;

  IF current_count >= 2 THEN
    RAISE EXCEPTION 'Team size limit exceeded: BGMI teams must have exactly 2 players.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_bgmi_team_size ON participants;
CREATE TRIGGER enforce_bgmi_team_size
BEFORE INSERT ON participants
FOR EACH ROW
EXECUTE FUNCTION check_bgmi_team_size();

-- 6. AUDIENCE REGISTRATIONS TABLE
-- ID Format: NF-AUD-SA-Q9PL
CREATE TABLE IF NOT EXISTS audience_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pass_id VARCHAR(32) UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone VARCHAR(10) UNIQUE NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  college_id TEXT UNIQUE NOT NULL,
  qr_token VARCHAR(64) UNIQUE NOT NULL,
  registration_status TEXT NOT NULL CHECK (registration_status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'confirmed',
  check_in_status TEXT NOT NULL CHECK (check_in_status IN ('not_checked_in', 'checked_in')) DEFAULT 'not_checked_in',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audience_pass_id ON audience_registrations(pass_id);
CREATE INDEX IF NOT EXISTS idx_audience_qr_token ON audience_registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_audience_email ON audience_registrations(lower(email));
CREATE INDEX IF NOT EXISTS idx_audience_phone ON audience_registrations(phone);
CREATE INDEX IF NOT EXISTS idx_audience_college_id ON audience_registrations(lower(college_id));

-- 7. CHECK-IN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS check_in_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('participant', 'audience')),
  reference_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('check_in', 'undo_check_in')),
  method TEXT NOT NULL CHECK (method IN ('qr_scan', 'manual_search')),
  scanned_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 8. ATOMIC REGISTRATION POSTGRESQL FUNCTIONS (TRANSACTIONAL)
-- ==============================================================================

-- Atomic Participant Team Registration (Team + Player 1 + Player 2 in 1 transaction)
CREATE OR REPLACE FUNCTION register_team_atomic(
  p_team_id VARCHAR(32),
  p_team_name TEXT,
  p_game TEXT,
  p_qr_token VARCHAR(64),
  p_leader_name TEXT,
  p_leader_email TEXT,
  p_leader_phone VARCHAR(10),
  p_leader_college_id TEXT,
  p_member_name TEXT,
  p_member_email TEXT,
  p_member_phone VARCHAR(10),
  p_member_college_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings RECORD;
  v_current_teams INT;
  v_new_team_id UUID;
BEGIN
  -- 1. Check Event Settings
  SELECT registration_open, participant_limit INTO v_settings FROM event_settings LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event settings not found.';
  END IF;

  IF NOT v_settings.registration_open THEN
    RAISE EXCEPTION 'Registration is currently closed.';
  END IF;

  -- 2. Check Participant Limit (Teams count)
  SELECT COUNT(*) INTO v_current_teams FROM teams WHERE registration_status != 'cancelled';
  IF v_current_teams >= v_settings.participant_limit THEN
    RAISE EXCEPTION 'Participant registrations are full.';
  END IF;

  -- 3. Check Intra-Team conflicts
  IF lower(trim(p_leader_email)) = lower(trim(p_member_email)) OR
     trim(p_leader_phone) = trim(p_member_phone) OR
     lower(trim(p_leader_college_id)) = lower(trim(p_member_college_id)) THEN
    RAISE EXCEPTION 'Player 1 and Player 2 cannot have the same Email, Phone, or College ID.';
  END IF;

  -- 4. Check Phone Regex (10 digits)
  IF NOT (p_leader_phone ~ '^[0-9]{10}$') OR NOT (p_member_phone ~ '^[0-9]{10}$') THEN
    RAISE EXCEPTION 'Mobile number must be exactly 10 digits.';
  END IF;

  -- 5. Insert Team
  INSERT INTO teams (team_id, name, game, qr_token, registration_status, check_in_status)
  VALUES (p_team_id, trim(p_team_name), p_game, p_qr_token, 'confirmed', 'not_checked_in')
  RETURNING id INTO v_new_team_id;

  -- 6. Insert Player 1 (Leader)
  INSERT INTO participants (team_id, role, full_name, email, phone, college_id)
  VALUES (p_team_id, 'leader', trim(p_leader_name), lower(trim(p_leader_email)), trim(p_leader_phone), trim(p_leader_college_id));

  -- 7. Insert Player 2 (Member)
  INSERT INTO participants (team_id, role, full_name, email, phone, college_id)
  VALUES (p_team_id, 'member', trim(p_member_name), lower(trim(p_member_email)), trim(p_member_phone), trim(p_member_college_id));

  RETURN jsonb_build_object(
    'id', v_new_team_id,
    'team_id', p_team_id,
    'name', trim(p_team_name),
    'game', p_game,
    'qr_token', p_qr_token,
    'registration_status', 'confirmed',
    'check_in_status', 'not_checked_in'
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'One of the emails, phone numbers, college IDs, or team name is already registered.';
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Atomic Audience Registration
CREATE OR REPLACE FUNCTION register_audience_atomic(
  p_pass_id VARCHAR(32),
  p_full_name TEXT,
  p_email TEXT,
  p_phone VARCHAR(10),
  p_college_id TEXT,
  p_qr_token VARCHAR(64)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_settings RECORD;
  v_current_audience INT;
  v_new_id UUID;
BEGIN
  -- 1. Check Event Settings
  SELECT registration_open, audience_limit INTO v_settings FROM event_settings LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event settings not found.';
  END IF;

  IF NOT v_settings.registration_open THEN
    RAISE EXCEPTION 'Registration is currently closed.';
  END IF;

  -- 2. Check Audience Limit
  SELECT COUNT(*) INTO v_current_audience FROM audience_registrations WHERE registration_status != 'cancelled';
  IF v_current_audience >= v_settings.audience_limit THEN
    RAISE EXCEPTION 'Audience registrations are full.';
  END IF;

  -- 3. Check Phone Regex (10 digits)
  IF NOT (p_phone ~ '^[0-9]{10}$') THEN
    RAISE EXCEPTION 'Mobile number must be exactly 10 digits.';
  END IF;

  -- 4. Insert Audience registration
  INSERT INTO audience_registrations (pass_id, full_name, email, phone, college_id, qr_token, registration_status, check_in_status)
  VALUES (p_pass_id, trim(p_full_name), lower(trim(p_email)), trim(p_phone), trim(p_college_id), p_qr_token, 'confirmed', 'not_checked_in')
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'id', v_new_id,
    'pass_id', p_pass_id,
    'full_name', trim(p_full_name),
    'email', lower(trim(p_email)),
    'phone', trim(p_phone),
    'college_id', trim(p_college_id),
    'qr_token', p_qr_token,
    'registration_status', 'confirmed',
    'check_in_status', 'not_checked_in'
  );
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Email, Mobile number, or College ID is already registered.';
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION register_team_atomic TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION register_audience_atomic TO anon, authenticated, service_role;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_logs ENABLE ROW LEVEL SECURITY;

-- EVENT SETTINGS: Public can read, only admin can update
CREATE POLICY "Public read event_settings" ON event_settings FOR SELECT USING (true);
CREATE POLICY "Admin update event_settings" ON event_settings FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ADMIN PROFILES: Authenticated can read own profile or admin can read all
CREATE POLICY "Read admin profile" ON admin_profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid() AND role = 'admin'));

-- REGISTRATIONS: Anyone can insert if registration is open
CREATE POLICY "Public insert teams" ON teams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM event_settings WHERE registration_open = true)
);

CREATE POLICY "Public insert participants" ON participants FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM event_settings WHERE registration_open = true)
);

CREATE POLICY "Public insert audience" ON audience_registrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM event_settings WHERE registration_open = true)
);

-- Authenticated volunteers & admins can read and update check-in status
CREATE POLICY "Organizer read teams" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizer update teams" ON teams FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Organizer read participants" ON participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizer update participants" ON participants FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Organizer read audience" ON audience_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizer update audience" ON audience_registrations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Organizer insert logs" ON check_in_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Organizer read logs" ON check_in_logs FOR SELECT TO authenticated USING (true);

