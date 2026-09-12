import { NextRequest, NextResponse } from "next/server";
import { registerAudience } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { validateAudienceInput } from "@/lib/validation/registration";

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (15 registrations per 5 minutes per IP)
  const rl = checkRateLimit(req, {
    limit: 15,
    windowMs: 5 * 60 * 1000,
    keyPrefix: "reg_aud",
  });

  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many registration requests from this network. Please wait ${rl.retryAfterSeconds} seconds.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds || 60) } }
    );
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > 50000) {
      return NextResponse.json({ success: false, error: "Request payload too large." }, { status: 413 });
    }

    const body = JSON.parse(rawBody);
    const { website } = body;

    // 2. Honeypot check
    if (website && String(website).trim().length > 0) {
      console.warn("[Honeypot Triggered] Audience registration bot caught via hidden website field.");
      return NextResponse.json({ success: false, error: "Invalid submission parameters." }, { status: 400 });
    }

    // 3. Validation & Normalization
    const validation = validateAudienceInput(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const result = await registerAudience(validation.data);

    if (!result.success) {
      const status = result.statusCode || 400;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      audience: result.audience,
      qrDataUrl: result.qrDataUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Audience Register Route Error]:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
