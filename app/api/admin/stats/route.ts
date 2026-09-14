import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats, updateEventSettings, logAdminAudit } from "@/lib/supabase/service";
import { requireCoreMember, requireSuperAdmin } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats
 * Operational Dashboard Overview. Allowed for SUPER ADMIN & CORE MEMBER.
 * Volunteers do NOT have access to dashboard attendee data (403).
 */
export async function GET(req: NextRequest) {
  const auth = await requireCoreMember(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, stats, currentUser: auth.user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load dashboard stats";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/stats
 * Modify event settings, toggle registrations & adjust capacities.
 * STRICTLY SUPER ADMIN ONLY. Core members and volunteers receive 403.
 */
export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { registration_open, participant_limit, audience_limit, event_name, event_date, venue, reporting_time } = body;

    const ok = await updateEventSettings({
      registration_open,
      participant_limit,
      audience_limit,
      event_name,
      event_date,
      venue,
      reporting_time,
    });

    if (ok) {
      await logAdminAudit({
        action: "staff_started", // reuse or general admin action
        reference_id: "event_settings",
        scanned_by: auth.user.fullName || auth.user.email,
        actor_role: auth.user.role,
        reason: `Updated settings: registration_open=${registration_open}, limits=[${participant_limit}, ${audience_limit}]`,
      });
    }

    return NextResponse.json({ success: ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update event settings";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
