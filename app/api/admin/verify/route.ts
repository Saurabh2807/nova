import { NextRequest, NextResponse } from "next/server";
import { verifyTokenOrId } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ status: "INVALID", message: "Token or ID is required" }, { status: 400 });
    }

    const result = await verifyTokenOrId(token);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ status: "INVALID", message: err.message || "Verification failed" }, { status: 500 });
  }
}
