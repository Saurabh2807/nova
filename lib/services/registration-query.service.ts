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
