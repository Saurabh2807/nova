import { isProduction } from "@/lib/supabase/server";
import {
  Team,
  TeamMember,
  AudienceRegistration,
  EventSettings,
  AdminProfile,
  AdminRole,
  CheckInLog,
} from "@/lib/types/registration";
import { generateQrToken } from "@/lib/utils/id-generator";

export interface DevStore {
  settings: EventSettings;
  teams: Team[];
  participants: TeamMember[];
  audience: AudienceRegistration[];
  adminProfiles: AdminProfile[];
  logs: CheckInLog[];
}

/**
 * In-Memory Development Store.
 * Strictly used for local offline development when Supabase credentials are not present.
 * In production (NODE_ENV === 'production'), all operations strictly throw HTTP 503 if credentials are missing.
 */
export const devStore: DevStore = {
  settings: {
    id: "dev-event-settings",
    registration_open: true,
    participant_limit: 250,
    audience_limit: 1000,
    event_name: "Campus Unleashed",
    event_date: "18–19 September 2026",
    venue: "LNCT Bhopal",
    reporting_time: "01:15 PM IST",
  },
  teams: [],
  participants: [],
  audience: [],
  adminProfiles: [
    {
      id: "super-admin-dev-1",
      user_id: "super-admin-dev-1",
      email: "saurabhsinghkarmwarrajput@gmail.com",
      full_name: "Saurabh Kumar Singh",
      role: "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "core-dev-1",
      user_id: "core-dev-1",
      email: "core@novaforge.gg",
      full_name: "Core Coordinator",
      role: "core_member",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "volunteer-dev-1",
      user_id: "volunteer-dev-1",
      email: "volunteer@novaforge.gg",
      full_name: "Arena Volunteer",
      role: "volunteer",
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "stopped-dev-1",
      user_id: "stopped-dev-1",
      email: "stopped@novaforge.gg",
      full_name: "Stopped Staff",
      role: "volunteer",
      is_active: false,
      created_at: new Date().toISOString(),
    },
  ],
  logs: [],
};

// Seed initial mock data for isolated local development only (never in production)
if (!isProduction && devStore.teams.length === 0) {
  const seedTeamId = "NF-BGMI-2026-8X4K7";
  const seedQrToken = generateQrToken("participant", seedTeamId);
  devStore.teams.push({
    id: "seed-team-1",
    team_id: seedTeamId,
    name: "Godlike Arena",
    game: "bgmi",
    qr_token: seedQrToken,
    registration_status: "confirmed",
    check_in_status: "not_checked_in",
    created_at: new Date().toISOString(),
    members: [
      { role: "leader", full_name: "Aman Sharma", email: "aman@example.com", phone: "9876543210", college_id: "0103CS231001" },
      { role: "member", full_name: "Rohit Verma", email: "rohit@example.com", phone: "9876543211", college_id: "0103CS231002" },
    ],
  });
  devStore.participants.push(
    { team_id: seedTeamId, role: "leader", full_name: "Aman Sharma", email: "aman@example.com", phone: "9876543210", college_id: "0103CS231001", created_at: new Date().toISOString() },
    { team_id: seedTeamId, role: "member", full_name: "Rohit Verma", email: "rohit@example.com", phone: "9876543211", college_id: "0103CS231002", created_at: new Date().toISOString() }
  );

  const seedAudienceId = "NF-AUD-SA-Q9PL88";
  const seedAudienceToken = generateQrToken("audience", seedAudienceId);
  devStore.audience.push({
    id: "seed-aud-1",
    pass_id: seedAudienceId,
    full_name: "Priya Patel",
    email: "priya@example.com",
    phone: "9123456789",
    college_id: "0103IT241045",
    qr_token: seedAudienceToken,
    registration_status: "confirmed",
    check_in_status: "not_checked_in",
    created_at: new Date().toISOString(),
  });
}
