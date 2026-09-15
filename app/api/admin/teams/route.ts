import { NextRequest, NextResponse } from "next/server";
import { getAllTeams } from "@/lib/supabase/service";
import { requireAdmin, requireCoreMember } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireCoreMember(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
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

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId") || searchParams.get("id");
    const participantIdentifier = searchParams.get("participant");

    if (teamId) {
      const { deleteTeam } = await import("@/lib/supabase/service");
      const res = await deleteTeam(teamId);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Team ${teamId} deleted successfully.` });
    }

    if (participantIdentifier) {
      const { deleteParticipant } = await import("@/lib/supabase/service");
      const res = await deleteParticipant(participantIdentifier);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Participant and team deleted successfully.` });
    }

    return NextResponse.json({ success: false, error: "Missing teamId or participant query parameter." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete team";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

