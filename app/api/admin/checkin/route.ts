import { NextRequest, NextResponse } from "next/server";
import { performCheckIn, undoCheckIn } from "@/lib/supabase/service";
import { AdminRole } from "@/lib/types/registration";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, type, id, scannedBy = "Admin/Volunteer", userRole = "volunteer" as AdminRole } = body;

    if (!type || !id) {
      return NextResponse.json({ success: false, error: "Type and ID are required" }, { status: 400 });
    }

    if (action === "undo") {
      // Role enforcement: strictly restricted to Admin
      if (userRole !== "admin") {
        return NextResponse.json(
          { success: false, error: "Permission Denied: Only Admins can undo check-ins." },
          { status: 403 }
        );
      }
      const result = await undoCheckIn(type, id, userRole);
      return NextResponse.json(result);
    }

    // Default: Check-in
    const result = await performCheckIn(type, id, scannedBy, "qr_scan");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to process check-in" }, { status: 500 });
  }
}
