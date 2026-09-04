import { NextRequest, NextResponse } from "next/server";
import { getAllTeams } from "@/lib/supabase/service";
import { authenticateAdminRequest } from "@/lib/supabase/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRequest(req, "volunteer");
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const teams = await getAllTeams();
    return NextResponse.json({ success: true, teams });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
