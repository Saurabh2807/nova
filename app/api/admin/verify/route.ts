import { NextRequest, NextResponse } from "next/server";
import { verifyTokenOrId } from "@/lib/supabase/service";
import { requireOperationalStaff } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireOperationalStaff(req);
  if (!auth.success) {
    return NextResponse.json(
      { status: "INVALID", message: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ status: "INVALID", message: "Token or ID is required" }, { status: 400 });
    }

    const result = await verifyTokenOrId(token);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ status: "INVALID", message }, { status: 500 });
  }
}
