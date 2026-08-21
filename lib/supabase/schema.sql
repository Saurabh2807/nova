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
  event_date TEXT NOT NULL DEFAULT '18–19 September 2026',
  venue TEXT NOT NULL DEFAULT 'LNCT Bhopal',
  reporting_time TEXT NOT NULL DEFAULT '09:00 AM IST',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default event settings if empty
INSERT INTO event_settings (registration_open, participant_limit, audience_limit, event_date, venue, reporting_time)
SELECT true, 250, 1000, '18–19 September 2026', 'LNCT Bhopal', '09:00 AM IST'
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
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
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
