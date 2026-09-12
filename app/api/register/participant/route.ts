import { NextRequest, NextResponse } from "next/server";
import { registerBgmiTeam } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { validateParticipantInput } from "@/lib/validation/registration";

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (15 registrations per 5 minutes per IP: campus Wi-Fi friendly, blocks automated bot spam)
  const rl = checkRateLimit(req, {
    limit: 15,
    windowMs: 5 * 60 * 1000,
    keyPrefix: "reg_part",
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

    // 2. Honeypot check (hidden 'website' field must be empty for human users)
    if (website && String(website).trim().length > 0) {
      console.warn("[Honeypot Triggered] Participant registration bot caught via hidden website field.");
      // Return deceptive 400 to discard bot submission silently
      return NextResponse.json({ success: false, error: "Invalid submission parameters." }, { status: 400 });
    }

    // 3. Validation & Normalization
    const validation = validateParticipantInput(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const { teamName, leader, member } = validation.data;

    // 4. Intra-team duplicate checks
    if (
      leader.email === member.email ||
      leader.phone === member.phone ||
      leader.collegeId.toLowerCase() === member.collegeId.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: "Player 1 and Player 2 cannot have the same Email, Phone, or College ID." },
        { status: 400 }
      );
    }

    const result = await registerBgmiTeam({
      teamName,
      leader,
      member,
    });

    if (!result.success) {
      const status = result.statusCode || 400;
      return NextResponse.json({ success: false, error: result.error }, { status });
    }

    return NextResponse.json({
      success: true,
      team: result.team,
      qrDataUrl: result.qrDataUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Participant Register Route Error]:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
