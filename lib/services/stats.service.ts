import { getSupabaseServerClient } from "@/lib/supabase/server";
import { devStore } from "@/lib/dev/dev-store";
import { getEventSettings } from "@/lib/services/event-settings.service";

// ==============================================================================
// 5. DASHBOARD STATS & MANAGEMENT QUERIES
// ==============================================================================
export async function getDashboardStats() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const totalTeams = devStore.teams.length;
    const confirmedTeams = devStore.teams.filter((t) => t.registration_status === "confirmed").length;
    const cancelledTeams = devStore.teams.filter((t) => t.registration_status === "cancelled").length;
    const checkedInTeams = devStore.teams.filter((t) => t.check_in_status === "checked_in").length;
    const totalParticipants = devStore.participants.length;

    const totalAudience = devStore.audience.length;
    const confirmedAudience = devStore.audience.filter((a) => a.registration_status === "confirmed").length;
    const cancelledAudience = devStore.audience.filter((a) => a.registration_status === "cancelled").length;
    const checkedInAudience = devStore.audience.filter((a) => a.check_in_status === "checked_in").length;

    const totalCheckedIn = checkedInTeams + checkedInAudience;
    const totalRegistrations = confirmedTeams + confirmedAudience;
    const settings = devStore.settings;

    const remainingTeamCapacity = Math.max(0, settings.participant_limit - confirmedTeams);
    const remainingAudienceCapacity = Math.max(0, settings.audience_limit - confirmedAudience);

    return {
      participant: {
        totalTeams,
        confirmedTeams,
        cancelledTeams,
        checkedInTeams,
        remainingCapacity: remainingTeamCapacity,
        limit: settings.participant_limit,
      },
      audience: {
        totalAudience,
        confirmedAudience,
        cancelledAudience,
        checkedInAudience,
        remainingCapacity: remainingAudienceCapacity,
        limit: settings.audience_limit,
      },
      // Backward-compatible fields
      totalTeams,
      totalParticipants,
      totalAudience,
      teamsCheckedIn: checkedInTeams,
      checkedInParticipants: checkedInTeams * 2,
      checkedInAudience,
      audienceCheckedIn: checkedInAudience,
      totalCheckedIn,
      pendingCheckIn: Math.max(0, totalRegistrations - totalCheckedIn),
      checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      participantCapacity: `${confirmedTeams} / ${settings.participant_limit} Teams`,
      audienceCapacity: `${confirmedAudience} / ${settings.audience_limit}`,
      settings,
    };
  }

  try {
    const [teamsRes, partsRes, audRes, settingsRes] = await Promise.all([
      supabase.from("teams").select("id, check_in_status, registration_status"),
      supabase.from("participants").select("id", { count: "exact", head: true }),
      supabase.from("audience_registrations").select("id, check_in_status, registration_status"),
      getEventSettings(),
    ]);

    const allTeams = teamsRes.data || [];
    const allAud = audRes.data || [];

    const totalTeams = allTeams.length;
    const confirmedTeams = allTeams.filter((t) => t.registration_status === "confirmed").length;
    const cancelledTeams = allTeams.filter((t) => t.registration_status === "cancelled").length;
    const checkedInTeams = allTeams.filter((t) => t.check_in_status === "checked_in").length;
    const totalParticipants = partsRes.count || confirmedTeams * 2;

    const totalAudience = allAud.length;
    const confirmedAudience = allAud.filter((a) => a.registration_status === "confirmed").length;
    const cancelledAudience = allAud.filter((a) => a.registration_status === "cancelled").length;
    const checkedInAudience = allAud.filter((a) => a.check_in_status === "checked_in").length;

    const totalCheckedIn = checkedInTeams + checkedInAudience;
    const totalRegistrations = confirmedTeams + confirmedAudience;
    const settings = settingsRes;

    const remainingTeamCapacity = Math.max(0, settings.participant_limit - confirmedTeams);
    const remainingAudienceCapacity = Math.max(0, settings.audience_limit - confirmedAudience);

    return {
      participant: {
        totalTeams,
        confirmedTeams,
        cancelledTeams,
        checkedInTeams,
        remainingCapacity: remainingTeamCapacity,
        limit: settings.participant_limit,
      },
      audience: {
        totalAudience,
        confirmedAudience,
        cancelledAudience,
        checkedInAudience,
        remainingCapacity: remainingAudienceCapacity,
        limit: settings.audience_limit,
      },
      // Backward-compatible fields
      totalTeams,
      totalParticipants,
      totalAudience,
      teamsCheckedIn: checkedInTeams,
      checkedInParticipants: checkedInTeams * 2,
      checkedInAudience,
      audienceCheckedIn: checkedInAudience,
      totalCheckedIn,
      pendingCheckIn: Math.max(0, totalRegistrations - totalCheckedIn),
      checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      participantCapacity: `${confirmedTeams} / ${settings.participant_limit} Teams`,
      audienceCapacity: `${confirmedAudience} / ${settings.audience_limit}`,
      settings,
    };
  } catch (err) {
    return {
      participant: { totalTeams: 0, confirmedTeams: 0, cancelledTeams: 0, checkedInTeams: 0, remainingCapacity: 0, limit: 250 },
      audience: { totalAudience: 0, confirmedAudience: 0, cancelledAudience: 0, checkedInAudience: 0, remainingCapacity: 0, limit: 1000 },
      totalTeams: 0,
      totalParticipants: 0,
      totalAudience: 0,
      teamsCheckedIn: 0,
      checkedInParticipants: 0,
      checkedInAudience: 0,
      audienceCheckedIn: 0,
      totalCheckedIn: 0,
      pendingCheckIn: 0,
      checkInRate: 0,
      participantCapacity: `0 / ${devStore.settings.participant_limit} Teams`,
      audienceCapacity: `0 / ${devStore.settings.audience_limit}`,
      settings: devStore.settings,
    };
  }
}
