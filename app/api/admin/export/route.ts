import { NextRequest, NextResponse } from "next/server";
import { getTeamsCsv, getAudienceCsv } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Export is allowed for Admin and Super Admin roles
  const auth = await requireAdmin(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "teams";

    if (type === "audience") {
      const csv = await getAudienceCsv();
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="novaforge_audience_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const csv = await getTeamsCsv();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="novaforge_bgmi_teams_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export CSV";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
