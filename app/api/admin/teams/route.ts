import { NextRequest, NextResponse } from "next/server";
import { getAllTeams } from "@/lib/supabase/service";
import { authenticateAdminRequest } from "@/lib/supabase/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRequest(req, "volunteer");
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize") || searchParams.get("limit");

    if (pageParam) {
      const page = Math.max(1, parseInt(pageParam, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeParam || "25", 10) || 25));
      const paginated = await getAllTeams(page, pageSize);
      return NextResponse.json({ success: true, ...paginated });
    }

    const teams = await getAllTeams();
    return NextResponse.json({ success: true, teams });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load teams";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
