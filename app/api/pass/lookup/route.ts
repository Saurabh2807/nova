import { NextRequest, NextResponse } from "next/server";
import { findPassByQuery } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Please provide a Mobile Number, Email, College ID, or Pass ID." },
        { status: 400 }
      );
    }

    const result = await findPassByQuery(query);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to search pass." },
      { status: 500 }
    );
  }
}
