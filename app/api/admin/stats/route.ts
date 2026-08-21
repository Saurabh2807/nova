import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats, updateEventSettings } from "@/lib/supabase/service";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registration_open, participant_limit, audience_limit, event_date, venue, reporting_time } = body;

    const ok = await updateEventSettings({
      registration_open,
      participant_limit,
      audience_limit,
      event_date,
      venue,
      reporting_time,
    });

    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
