import { NextRequest, NextResponse } from "next/server";
import { registerBgmiTeam } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, leader, member } = body;

    if (!teamName || !leader || !member) {
      return NextResponse.json({ success: false, error: "All team and player fields are required." }, { status: 400 });
    }

    if (
      !leader.fullName ||
      !leader.email ||
      !leader.phone ||
      !leader.collegeId ||
      !member.fullName ||
      !member.email ||
      !member.phone ||
      !member.collegeId
    ) {
      return NextResponse.json({ success: false, error: "All fields for Player 1 and Player 2 are mandatory." }, { status: 400 });
    }

    const result = await registerBgmiTeam({
      teamName,
      leader,
      member,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      team: result.team,
      qrDataUrl: result.qrDataUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
