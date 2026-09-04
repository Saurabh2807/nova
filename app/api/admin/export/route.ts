import { NextRequest, NextResponse } from "next/server";
import { getTeamsCsv, getAudienceCsv } from "@/lib/supabase/service";
import { authenticateAdminRequest } from "@/lib/supabase/admin-auth";

export async function GET(req: NextRequest) {
  // Export is strictly restricted to Admin role
  const auth = await authenticateAdminRequest(req, "admin");
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
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
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
