import { NextRequest, NextResponse } from "next/server";
import { registerAudience } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, collegeId } = body;

    if (!fullName || !email || !phone || !collegeId) {
      return NextResponse.json({ success: false, error: "All fields are mandatory." }, { status: 400 });
    }

    const result = await registerAudience({
      fullName,
      email,
      phone,
      collegeId,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      audience: result.audience,
      qrDataUrl: result.qrDataUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
