import { getSupabaseServerClient, isProduction } from "@/lib/supabase/server";
import { devStore } from "@/lib/dev/dev-store";
import { Team } from "@/lib/types/registration";

export async function getAllTeams(page?: number, pageSize: number = 25) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isProduction) throw new Error("Supabase is not configured in production");
    if (page && page > 0) {
      const from = (page - 1) * pageSize;
      return {
        teams: devStore.teams.slice(from, from + pageSize),
        total: devStore.teams.length,
        page,
        pageSize,
      };
    }
    return devStore.teams;
  }
  try {
    if (page && page > 0) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await supabase
        .from("teams")
        .select("*, participants(*)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        teams: data || [],
        total: count || 0,
        page,
        pageSize,
      };
    }

    const { data, error } = await supabase
      .from("teams")
      .select("*, participants(*)")
      .order("created_at", { ascending: false });
    if (error || !data) return devStore.teams;
    return data;
  } catch (err) {
    return page ? { teams: [], total: 0, page, pageSize } : [];
  }
}

export async function getAllAudience(page?: number, pageSize: number = 25) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isProduction) throw new Error("Supabase is not configured in production");
    if (page && page > 0) {
      const from = (page - 1) * pageSize;
      return {
        audience: devStore.audience.slice(from, from + pageSize),
        total: devStore.audience.length,
        page,
        pageSize,
      };
    }
    return devStore.audience;
  }
  try {
    if (page && page > 0) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, count, error } = await supabase
        .from("audience_registrations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return {
        audience: data || [],
        total: count || 0,
        page,
        pageSize,
      };
    }

    const { data, error } = await supabase
      .from("audience_registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return devStore.audience;
    return data;
  } catch (err) {
    return page ? { audience: [], total: 0, page, pageSize } : [];
  }
}

export async function getRecentAuditLogs(limit: number = 50) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return devStore.logs.slice(0, limit);
  }
  try {
    const { data, error } = await supabase
      .from("check_in_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (error || !data) return devStore.logs.slice(0, limit);
    return data;
  } catch (err) {
    return devStore.logs.slice(0, limit);
  }
}

/**
 * Admin Database-Side Search: Executes targeted queries in PostgreSQL/Supabase
 * instead of loading all registrations into Node.js memory.
 */
export async function searchRegistrations(query: string) {
  const q = query.trim();
  if (!q) return { teams: [], audience: [] };
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const lowerQ = q.toLowerCase();
    const matchedTeams = devStore.teams.filter((t) => {
      const matchId = t.team_id.toLowerCase().includes(lowerQ);
      const matchName = t.name.toLowerCase().includes(lowerQ);
      const matchMember = t.members?.some(
        (m) =>
          m.full_name.toLowerCase().includes(lowerQ) ||
          m.phone.includes(lowerQ) ||
          m.college_id.toLowerCase().includes(lowerQ) ||
          m.email.toLowerCase().includes(lowerQ)
      );
      return matchId || matchName || matchMember;
    });

    const matchedAudience = devStore.audience.filter((a) => {
      return (
        a.pass_id.toLowerCase().includes(lowerQ) ||
        a.full_name.toLowerCase().includes(lowerQ) ||
        a.phone.includes(lowerQ) ||
        a.college_id.toLowerCase().includes(lowerQ) ||
        a.email.toLowerCase().includes(lowerQ)
      );
    });

    return { teams: matchedTeams, audience: matchedAudience };
  }

  try {
    // 1. Search audience registrations directly on database
    const { data: matchedAudience } = await supabase
      .from("audience_registrations")
      .select("*")
      .or(`pass_id.ilike.%${q}%,full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,college_id.ilike.%${q}%`)
      .limit(50);

    // 2. Search teams by team_id or team name on database
    const { data: teamsByNameOrId } = await supabase
      .from("teams")
      .select("*, participants(*)")
      .or(`team_id.ilike.%${q}%,name.ilike.%${q}%`)
      .limit(50);

    // 3. Search participants by name, email, phone, college_id on database
    const { data: matchingParticipants } = await supabase
      .from("participants")
      .select("team_id")
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,college_id.ilike.%${q}%`)
      .limit(50);

    const participantTeamIds = (matchingParticipants || []).map((p: { team_id: string }) => p.team_id);
    let teamsByParticipant: Team[] = [];
    if (participantTeamIds.length > 0) {
      const { data: teamsFromParts } = await supabase
        .from("teams")
        .select("*, participants(*)")
        .in("team_id", participantTeamIds);
      teamsByParticipant = (teamsFromParts || []) as Team[];
    }

    // Combine and deduplicate teams
    const allMatchedTeamsMap = new Map<string, Team>();
    for (const t of (teamsByNameOrId || []) as Team[]) {
      allMatchedTeamsMap.set(t.team_id, t);
    }
    for (const t of teamsByParticipant) {
      allMatchedTeamsMap.set(t.team_id, t);
    }

    return {
      teams: Array.from(allMatchedTeamsMap.values()),
      audience: matchedAudience || [],
    };
  } catch (err) {
    console.error("Database search error:", err);
    return { teams: [], audience: [] };
  }
}

/**
 * Volunteer Data-Minimized Search: Phone Number ONLY.
 * Strips all unnecessary PII (phone, email, college ID, partner contact).
 * Returns ONLY operational fields needed for check-in:
 * Name, ID (Team ID or Pass ID), Registration Status, Check-in Status.
 */
export async function searchRegistrationsByPhoneMinimized(phone: string) {
  const digits = phone.replace(/[^0-9]/g, "").slice(-10);
  if (!digits || digits.length < 10) {
    return [];
  }

  const supabase = getSupabaseServerClient();

  // Local Dev Store Fallback
  if (!supabase) {
    const results: Array<{
      type: "participant" | "audience";
      id: string;
      name: string;
      registration_status: string;
      check_in_status: string;
      checked_in_at?: string | null;
    }> = [];

    // Check participants
    const matchedParticipants = devStore.participants.filter((p) => p.phone.endsWith(digits));
    for (const p of matchedParticipants) {
      const team = devStore.teams.find((t) => t.team_id === p.team_id);
      if (team && !results.some((r) => r.id === team.team_id)) {
        results.push({
          type: "participant",
          id: team.team_id,
          name: team.name,
          registration_status: team.registration_status,
          check_in_status: team.check_in_status,
          checked_in_at: team.checked_in_at,
        });
      }
    }

    // Check audience
    const matchedAudience = devStore.audience.filter((a) => a.phone.endsWith(digits));
    for (const a of matchedAudience) {
      if (!results.some((r) => r.id === a.pass_id)) {
        results.push({
          type: "audience",
          id: a.pass_id,
          name: a.full_name,
          registration_status: a.registration_status,
          check_in_status: a.check_in_status,
          checked_in_at: a.checked_in_at,
        });
      }
    }

    return results;
  }

  try {
    const results: Array<{
      type: "participant" | "audience";
      id: string;
      name: string;
      registration_status: string;
      check_in_status: string;
      checked_in_at?: string | null;
    }> = [];

    // 1. Query participants by phone to find team_id
    const { data: matchedParticipants } = await supabase
      .from("participants")
      .select("team_id")
      .ilike("phone", `%${digits}%`)
      .limit(10);

    const teamIds = (matchedParticipants || []).map((p: { team_id: string }) => p.team_id);
    if (teamIds.length > 0) {
      const { data: teams } = await supabase
        .from("teams")
        .select("team_id, name, registration_status, check_in_status, checked_in_at")
        .in("team_id", teamIds);

      for (const t of teams || []) {
        if (!results.some((r) => r.id === t.team_id)) {
          results.push({
            type: "participant",
            id: t.team_id,
            name: t.name,
            registration_status: t.registration_status,
            check_in_status: t.check_in_status,
            checked_in_at: t.checked_in_at,
          });
        }
      }
    }

    // 2. Query audience by phone
    const { data: audience } = await supabase
      .from("audience_registrations")
      .select("pass_id, full_name, registration_status, check_in_status, checked_in_at")
      .ilike("phone", `%${digits}%`)
      .limit(10);

    for (const a of audience || []) {
      if (!results.some((r) => r.id === a.pass_id)) {
        results.push({
          type: "audience",
          id: a.pass_id,
          name: a.full_name,
          registration_status: a.registration_status,
          check_in_status: a.check_in_status,
          checked_in_at: a.checked_in_at,
        });
      }
    }

    return results;
  } catch (err) {
    console.error("Minimized phone search error:", err);
    return [];
  }
}

/**
 * Log administrative or staff action to audit logs.
 */
export async function logAdminAudit(log: {
  action: "check_in" | "undo_check_in" | "staff_created" | "staff_started" | "staff_stopped" | "manual_search";
  reference_id: string;
  scanned_by: string;
  actor_role?: string;
  method?: string;
  type?: string;
  reason?: string;
}) {
  const supabase = getSupabaseServerClient();
  const entry = {
    action: log.action,
    reference_id: log.reference_id,
    scanned_by: log.scanned_by,
    actor_role: log.actor_role,
    method: log.method || "admin_portal",
    type: log.type || "staff",
    reason: log.reason,
    timestamp: new Date().toISOString(),
  };

  if (!supabase) {
    devStore.logs.unshift(entry as any);
    return;
  }

  try {
    await supabase.from("check_in_logs").insert(entry);
  } catch (err) {
    console.warn("Failed to record audit log:", err);
  }
}
