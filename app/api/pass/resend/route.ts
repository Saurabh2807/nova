import { NextRequest, NextResponse } from "next/server";
import { resendConfirmationEmail } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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

    const result = await resendConfirmationEmail(type, id, email);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resend confirmation email." },
      { status: 500 }
    );
  }
}
