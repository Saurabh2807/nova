import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats, updateEventSettings } from "@/lib/supabase/service";
import { authenticateAdminRequest } from "@/lib/supabase/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRequest(req, "volunteer");
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, stats, currentUser: auth.user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Only ADMIN can modify event settings & capacities
  const auth = await authenticateAdminRequest(req, "admin");
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
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

    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
