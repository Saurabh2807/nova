import { NextRequest, NextResponse } from "next/server";
import { searchRegistrations } from "@/lib/supabase/service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    const results = await searchRegistrations(q);
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
