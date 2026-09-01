import { NextResponse } from "next/server";
import { getEventSettings, getDashboardStats } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settings, stats] = await Promise.all([
      getEventSettings(),
      getDashboardStats(),
    ]);

    const totalTeams = stats.totalTeams || 0;
    const totalAudience = stats.totalAudience || 0;
    const participantLimit = settings.participant_limit || 250;
    const audienceLimit = settings.audience_limit || 1000;

    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        totalTeams,
        totalAudience,
        remainingTeamSlots: Math.max(0, participantLimit - totalTeams),
        remainingAudienceSlots: Math.max(0, audienceLimit - totalAudience),
        isTeamFull: totalTeams >= participantLimit,
        isAudienceFull: totalAudience >= audienceLimit,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch event settings",
        settings: {
          id: "default",
          registration_open: true,
          participant_limit: 250,
          audience_limit: 1000,
          event_date: "18–19 September 2026",
          venue: "LNCT Bhopal",
          reporting_time: "09:00 AM IST",
          totalTeams: 0,
          totalAudience: 0,
          remainingTeamSlots: 250,
          remainingAudienceSlots: 1000,
          isTeamFull: false,
          isAudienceFull: false,
        },
      },
      { status: 200 }
    );
  }
}
