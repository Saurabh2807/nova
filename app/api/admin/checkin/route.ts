import { NextRequest, NextResponse } from "next/server";
import { performCheckIn, undoCheckIn, logAdminAudit } from "@/lib/supabase/service";
import { requireOperationalStaff, requireUndoPermission } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "check_in", type, id, method = "qr_scan", reason } = body;

    if (!type || !id) {
      return NextResponse.json({ success: false, error: "Type and ID are required" }, { status: 400 });
    }

    if (action === "undo") {
      // Role enforcement: Strictly restricted to Super Admin and Core Member server-side
      // Volunteers receive 403 Forbidden
      const auth = await requireUndoPermission(req);
      if (!auth.success) {
        return NextResponse.json(
          { success: false, error: auth.error, code: auth.code },
          { status: auth.status }
        );
      }

      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { success: false, error: "A mandatory reason is required to revert a check-in." },
          { status: 400 }
        );
      }

      const undoReason = reason.trim();
      const result = await undoCheckIn(type, id, auth.user.role);

      if (result.success) {
        await logAdminAudit({
          action: "undo_check_in",
          reference_id: id,
          scanned_by: auth.user.fullName || auth.user.email,
          actor_role: auth.user.role,
          type,
          reason: undoReason,
        });
      }

      return NextResponse.json(result);
    }

    // Default: Check-in (Accessible to Super Admin, Core Member & Volunteer)
    const auth = await requireOperationalStaff(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error, code: auth.code },
        { status: auth.status }
      );
    }

    const scannedBy = `${auth.user.fullName} (${auth.user.role})`;
    const result = await performCheckIn(type, id, scannedBy, method === "manual_search" ? "manual_search" : "qr_scan");
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process check-in";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
