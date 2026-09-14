import { NextRequest, NextResponse } from "next/server";
import { searchRegistrations, searchRegistrationsByPhoneMinimized, logAdminAudit } from "@/lib/supabase/service";
import { requireOperationalStaff } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Helper to mask phone numbers for privacy in audit trails (e.g. "98******42")
 */
function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length <= 4) return "****";
  const start = digits.slice(0, 2);
  const end = digits.slice(-2);
  const stars = "*".repeat(Math.max(2, digits.length - 4));
  return `${start}${stars}${end}`;
}

export async function GET(req: NextRequest) {
  const auth = await requireOperationalStaff(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ success: true, results: [] });
    }

    // 1. VOLUNTEER ROLE: Strictly Phone-Number-Only Lookup
    // Any search with letters or symbols other than phone numbers is strictly rejected with 400
    if (auth.user.role === "volunteer") {
      const isPhoneNumber = /^[0-9+\s-]{7,15}$/.test(q);
      const digitsOnly = q.replace(/[^0-9]/g, "");

      if (!isPhoneNumber || digitsOnly.length < 10) {
        return NextResponse.json(
          {
            success: false,
            error: "Volunteers can only search by attendee 10-digit mobile number.",
            code: "PHONE_REQUIRED",
          },
          { status: 400 }
        );
      }

      // Perform phone-only minimized lookup (never returns phone, email, college_id, or partner PII)
      const minimizedResults = await searchRegistrationsByPhoneMinimized(digitsOnly);

      // Auditable log with masked phone identifier
      await logAdminAudit({
        action: "manual_search",
        reference_id: maskPhoneNumber(digitsOnly),
        scanned_by: auth.user.fullName || auth.user.email,
        actor_role: auth.user.role,
        reason: `Volunteer phone lookup (${minimizedResults.length} match)`,
      });

      return NextResponse.json({
        success: true,
        mode: "volunteer_minimized",
        results: minimizedResults,
      });
    }

    // 2. SUPER ADMIN & CORE MEMBER: Operational Lookup
    const results = await searchRegistrations(q);

    // Audit log
    const maskedRef = /^[0-9+\s-]{7,15}$/.test(q) ? maskPhoneNumber(q) : q.slice(0, 15);
    await logAdminAudit({
      action: "manual_search",
      reference_id: maskedRef,
      scanned_by: auth.user.fullName || auth.user.email,
      actor_role: auth.user.role,
      reason: `Operational search query`,
    });

    return NextResponse.json({ success: true, mode: "operational", results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to search registrations";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
