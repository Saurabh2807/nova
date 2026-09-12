import { NextRequest, NextResponse } from "next/server";
import { getRecentAuditLogs } from "@/lib/supabase/service";
import { authenticateAdminRequest } from "@/lib/supabase/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRequest(req, "volunteer");
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const logs = await getRecentAuditLogs(100);
    return NextResponse.json({ success: true, logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load audit logs";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
