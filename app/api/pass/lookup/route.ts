import { NextRequest, NextResponse } from "next/server";
import { findPassSecurely } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

export async function POST(req: NextRequest) {
  // 1. Strict Rate Limiting: 10 queries per 5 minutes per IP to block enumeration attacks
  const rl = checkRateLimit(req, {
    limit: 10,
    windowMs: 5 * 60 * 1000,
    keyPrefix: "pass_lookup",
  });

  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many lookup attempts. For security, please wait ${rl.retryAfterSeconds} seconds before trying again.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds || 60) } }
    );
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > 5000) {
      return NextResponse.json({ success: false, error: "Invalid payload size." }, { status: 413 });
    }

    const body = JSON.parse(rawBody);
    const email = body.email?.trim();
    // Allow query or passId or phone
    const query = (body.query || body.passId || body.phone || "").trim();

    if (!email || !query) {
      return NextResponse.json(
        {
          success: false,
          error: "To verify your identity, both your registered Email and your Pass ID or Mobile Number are required.",
        },
        { status: 400 }
      );
    }

    const result = await findPassSecurely({ email, query });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to search pass.";
    console.error("[Pass Lookup Route Error]:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
