import { NextRequest, NextResponse } from "next/server";
import { resendConfirmationEmail } from "@/lib/supabase/service";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > 5000) {
      return NextResponse.json({ success: false, error: "Invalid payload size." }, { status: 413 });
    }

    const body = JSON.parse(rawBody);
    const { type, id, email } = body;

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: "Type and ID are required." },
        { status: 400 }
      );
    }

    if (type !== "participant" && type !== "audience") {
      return NextResponse.json(
        { success: false, error: "Invalid pass type." },
        { status: 400 }
      );
    }

    const cleanId = String(id).trim().toUpperCase();

    // 1. Per-IP Rate Limiting (Max 3 resends per 15 minutes per IP)
    const ipRl = checkRateLimit(req, {
      limit: 3,
      windowMs: 15 * 60 * 1000,
      keyPrefix: "resend_ip",
    });

    if (!ipRl.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Resend limit reached for this device. Please wait ${ipRl.retryAfterSeconds} seconds or check your Spam folder.`,
        },
        { status: 429, headers: { "Retry-After": String(ipRl.retryAfterSeconds || 60) } }
      );
    }

    // 2. Per-Pass-ID Rate Limiting (Max 3 resends per 15 minutes per pass/team to prevent SMTP bombardment)
    const idRl = checkRateLimit(
      req,
      {
        limit: 3,
        windowMs: 15 * 60 * 1000,
        keyPrefix: "resend_id",
      },
      cleanId
    );

    if (!idRl.success) {
      return NextResponse.json(
        {
          success: false,
          error: "This pass confirmation email was already dispatched recently. Please check your inbox and Spam folder.",
        },
        { status: 429, headers: { "Retry-After": String(idRl.retryAfterSeconds || 60) } }
      );
    }

    const result = await resendConfirmationEmail(type, cleanId, email?.trim());

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to resend confirmation email.";
    console.error("[Pass Resend Route Error]:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
