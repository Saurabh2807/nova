import { NextRequest, NextResponse } from "next/server";
import { searchRegistrations } from "@/lib/supabase/service";
import { authenticateAdminRequest } from "@/lib/supabase/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRequest(req, "volunteer");
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const results = await searchRegistrations(q);
    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to search registrations";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
