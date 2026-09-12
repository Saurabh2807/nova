import { getSupabaseServerClient } from "@/lib/supabase/server";
import { devStore } from "@/lib/dev/dev-store";
import { Team, AudienceRegistration, TeamMember } from "@/lib/types/registration";

// ==============================================================================
// 6. CSV EXPORT FOR PHYSICAL PEN-AND-PAPER CHECK-IN SHEETS (NO QR TOKEN)
// ==============================================================================
export async function getTeamsCsv(): Promise<string> {
  const supabase = getSupabaseServerClient();
  let teams: Team[] = [];

  if (!supabase) {
    teams = devStore.teams;
  } else {
    const { data } = await supabase.from("teams").select("*, participants(*)").order("created_at", { ascending: true });
    teams = (data || []) as Team[];
  }

  const headers = [
    "Team ID",
    "Team Name",
    "Player 1 Name",
    "Player 1 Email",
    "Player 1 Mobile",
    "Player 1 College ID",
    "Player 2 Name",
    "Player 2 Email",
    "Player 2 Mobile",
    "Player 2 College ID",
    "Registration Status",
    "Check-in Status",
    "Created At",
  ];

  const rows = teams.map((t) => {
    const members = t.members || t.participants || [];
    const leader = members.find((m) => m.role === "leader") || members[0] || {} as Partial<TeamMember>;
    const p2 = members.find((m) => m.role === "member") || members[1] || {} as Partial<TeamMember>;

    return [
      `"${t.team_id}"`,
      `"${t.name?.replace(/"/g, '""')}"`,
      `"${leader.full_name?.replace(/"/g, '""') || ""}"`,
      `"${leader.email || ""}"`,
      `"${leader.phone || ""}"`,
      `"${leader.college_id || ""}"`,
      `"${p2.full_name?.replace(/"/g, '""') || ""}"`,
      `"${p2.email || ""}"`,
      `"${p2.phone || ""}"`,
      `"${p2.college_id || ""}"`,
      `"${t.registration_status}"`,
      `"${t.check_in_status}"`,
      `"${new Date(t.created_at || Date.now()).toISOString()}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export async function getAudienceCsv(): Promise<string> {
  const supabase = getSupabaseServerClient();
  let audience: AudienceRegistration[] = [];

  if (!supabase) {
    audience = devStore.audience;
  } else {
    const { data } = await supabase.from("audience_registrations").select("*").order("created_at", { ascending: true });
    audience = (data || []) as AudienceRegistration[];
  }

  const headers = [
    "Pass ID",
    "Name",
    "Email",
    "Mobile",
    "College ID",
    "Registration Status",
    "Check-in Status",
    "Created At",
  ];

  const rows = audience.map((a) => {
    return [
      `"${a.pass_id}"`,
      `"${a.full_name?.replace(/"/g, '""')}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.college_id}"`,
      `"${a.registration_status}"`,
      `"${a.check_in_status}"`,
      `"${new Date(a.created_at || Date.now()).toISOString()}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
