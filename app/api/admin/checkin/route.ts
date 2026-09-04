import { NextRequest, NextResponse } from "next/server";
import { performCheckIn, undoCheckIn } from "@/lib/supabase/service";
import { authenticateAdminRequest } from "@/lib/supabase/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "check_in", type, id, method = "qr_scan" } = body;

    if (!type || !id) {
      return NextResponse.json({ success: false, error: "Type and ID are required" }, { status: 400 });
    }

    if (action === "undo") {
      // Role enforcement: Strictly restricted to Admin role server-side
      const auth = await authenticateAdminRequest(req, "admin");
      if (!auth.success) {
        return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
      }

      const result = await undoCheckIn(type, id, auth.user.role);
      return NextResponse.json(result);
    }

    // Default: Check-in (Accessible to both Volunteer & Admin)
    const auth = await authenticateAdminRequest(req, "volunteer");
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const scannedBy = `${auth.user.fullName} (${auth.user.role})`;
    const result = await performCheckIn(type, id, scannedBy, method === "manual_search" ? "manual_search" : "qr_scan");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to process check-in" }, { status: 500 });
  }
}
