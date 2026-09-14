import { getSupabaseServerClient } from "@/lib/supabase/server";
import { VerificationResult, AdminRole, TeamMember } from "@/lib/types/registration";
import { devStore } from "@/lib/dev/dev-store";

// ==============================================================================
// 4. QR VERIFICATION & CHECK-IN ENGINE
// ==============================================================================
export async function verifyTokenOrId(tokenOrId: string): Promise<VerificationResult> {
  const query = tokenOrId.trim();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    // 1. Check in Teams
    const team = devStore.teams.find((t) => t.qr_token === query || t.team_id.toLowerCase() === query.toLowerCase());
    if (team) {
      if (team.registration_status === "cancelled") {
        return {
          status: "REGISTRATION_CANCELLED",
          type: "participant",
          message: "Registration has been cancelled.",
          data: {
            id: team.team_id,
            name: team.name,
            title: `Team: ${team.name}`,
            roleOrGame: "BGMI Squad",
            phone: team.members?.[0]?.phone || "",
            collegeId: team.members?.[0]?.college_id || "",
            members: team.members?.map((m) => ({
              role: m.role === "leader" ? "Team Leader" : "Team Member",
              name: m.full_name,
              phone: m.phone,
              collegeId: m.college_id,
              email: m.email,
            })),
          },
        };
      }

      if (team.check_in_status === "checked_in") {
        return {
          status: "ALREADY_CHECKED_IN",
          type: "participant",
          message: `Already checked in at ${new Date(team.checked_in_at || Date.now()).toLocaleTimeString()}`,
          data: {
            id: team.team_id,
            name: team.name,
            title: `Team: ${team.name}`,
            roleOrGame: "BGMI Squad",
            phone: team.members?.[0]?.phone || "",
            collegeId: team.members?.[0]?.college_id || "",
            checkedInAt: team.checked_in_at,
            members: team.members?.map((m) => ({
              role: m.role === "leader" ? "Team Leader" : "Team Member",
              name: m.full_name,
              phone: m.phone,
              collegeId: m.college_id,
              email: m.email,
            })),
          },
        };
      }

      return {
        status: "APPROVED",
        type: "participant",
        message: "Valid BGMI Team Pass. Ready for check-in.",
        data: {
          id: team.team_id,
          name: team.name,
          title: `Team: ${team.name}`,
          roleOrGame: "BGMI Squad (2 Players)",
          phone: team.members?.[0]?.phone || "",
          collegeId: team.members?.[0]?.college_id || "",
          members: team.members?.map((m) => ({
            role: m.role === "leader" ? "Team Leader" : "Team Member",
            name: m.full_name,
            phone: m.phone,
            collegeId: m.college_id,
            email: m.email,
          })),
        },
      };
    }

    // 2. Check in Audience
    const aud = devStore.audience.find((a) => a.qr_token === query || a.pass_id.toLowerCase() === query.toLowerCase());
    if (aud) {
      if (aud.registration_status === "cancelled") {
        return {
          status: "REGISTRATION_CANCELLED",
          type: "audience",
          message: "Audience pass has been cancelled.",
          data: {
            id: aud.pass_id,
            name: aud.full_name,
            title: aud.full_name,
            roleOrGame: "Audience Pass",
            phone: aud.phone,
            collegeId: aud.college_id,
          },
        };
      }

      if (aud.check_in_status === "checked_in") {
        return {
          status: "ALREADY_CHECKED_IN",
          type: "audience",
          message: `Already checked in at ${new Date(aud.checked_in_at || Date.now()).toLocaleTimeString()}`,
          data: {
            id: aud.pass_id,
            name: aud.full_name,
            title: aud.full_name,
            roleOrGame: "Audience Pass",
            phone: aud.phone,
            collegeId: aud.college_id,
            checkedInAt: aud.checked_in_at,
          },
        };
      }

      return {
        status: "APPROVED",
        type: "audience",
        message: "Valid Audience Entry Pass.",
        data: {
          id: aud.pass_id,
          name: aud.full_name,
          title: aud.full_name,
          roleOrGame: "Audience Pass",
          phone: aud.phone,
          collegeId: aud.college_id,
        },
      };
    }

    return { status: "INVALID", message: "Invalid or unrecognized QR token / Pass ID." };
  }

  // --- Production Supabase Verification ---
  try {
    // Check teams
    const { data: team } = await supabase
      .from("teams")
      .select("*, participants(*)")
      .or(`qr_token.eq.${query},team_id.eq.${query}`)
      .maybeSingle();

    if (team) {
      if (team.registration_status === "cancelled") {
        return {
          status: "REGISTRATION_CANCELLED",
          type: "participant",
          message: "Registration has been cancelled.",
          data: {
            id: team.team_id,
            name: team.name,
            title: `Team: ${team.name}`,
            roleOrGame: "BGMI Squad",
            phone: team.participants?.[0]?.phone || "",
            collegeId: team.participants?.[0]?.college_id || "",
          },
        };
      }

      if (team.check_in_status === "checked_in") {
        return {
          status: "ALREADY_CHECKED_IN",
          type: "participant",
          message: `Already checked in at ${new Date(team.checked_in_at).toLocaleTimeString()}`,
          data: {
            id: team.team_id,
            name: team.name,
            title: `Team: ${team.name}`,
            roleOrGame: "BGMI Squad",
            phone: team.participants?.[0]?.phone || "",
            collegeId: team.participants?.[0]?.college_id || "",
            checkedInAt: team.checked_in_at,
          },
        };
      }

      return {
        status: "APPROVED",
        type: "participant",
        message: "Valid BGMI Team Pass.",
        data: {
          id: team.team_id,
          name: team.name,
          title: `Team: ${team.name}`,
          roleOrGame: "BGMI Squad",
          phone: team.participants?.[0]?.phone || "",
          collegeId: team.participants?.[0]?.college_id || "",
          members: team.participants?.map((p: TeamMember) => ({
            role: p.role === "leader" ? "Team Leader" : "Team Member",
            name: p.full_name,
            phone: p.phone,
            collegeId: p.college_id,
            email: p.email,
          })),
        },
      };
    }

    // Check audience
    const { data: aud } = await supabase
      .from("audience_registrations")
      .select("*")
      .or(`qr_token.eq.${query},pass_id.eq.${query}`)
      .maybeSingle();

    if (aud) {
      if (aud.registration_status === "cancelled") {
        return {
          status: "REGISTRATION_CANCELLED",
          type: "audience",
          message: "Audience pass has been cancelled.",
        };
      }

      if (aud.check_in_status === "checked_in") {
        return {
          status: "ALREADY_CHECKED_IN",
          type: "audience",
          message: `Already checked in at ${new Date(aud.checked_in_at).toLocaleTimeString()}`,
          data: {
            id: aud.pass_id,
            name: aud.full_name,
            title: aud.full_name,
            roleOrGame: "Audience Pass",
            phone: aud.phone,
            collegeId: aud.college_id,
            checkedInAt: aud.checked_in_at,
          },
        };
      }

      return {
        status: "APPROVED",
        type: "audience",
        message: "Valid Audience Entry Pass.",
        data: {
          id: aud.pass_id,
          name: aud.full_name,
          title: aud.full_name,
          roleOrGame: "Audience Pass",
          phone: aud.phone,
          collegeId: aud.college_id,
        },
      };
    }

    return { status: "INVALID", message: "Invalid or unrecognized QR token / Pass ID." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return { status: "INVALID", message };
  }
}

export async function performCheckIn(
  type: "participant" | "audience",
  id: string,
  scannedBy: string = "Admin/Volunteer",
  method: "qr_scan" | "manual_search" = "qr_scan"
): Promise<{ success: boolean; error?: string }> {
  const timestamp = new Date().toISOString();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    if (type === "participant") {
      const team = devStore.teams.find((t) => t.team_id === id);
      if (team) {
        team.check_in_status = "checked_in";
        team.checked_in_at = timestamp;
        team.checked_in_by = scannedBy;
      }
    } else {
      const aud = devStore.audience.find((a) => a.pass_id === id);
      if (aud) {
        aud.check_in_status = "checked_in";
        aud.checked_in_at = timestamp;
        aud.checked_in_by = scannedBy;
      }
    }
    devStore.logs.unshift({ type, reference_id: id, action: "check_in", method, scanned_by: scannedBy, timestamp });
    return { success: true };
  }

  try {
    if (type === "participant") {
      await supabase
        .from("teams")
        .update({ check_in_status: "checked_in", checked_in_at: timestamp, checked_in_by: null })
        .eq("team_id", id);
    } else {
      await supabase
        .from("audience_registrations")
        .update({ check_in_status: "checked_in", checked_in_at: timestamp, checked_in_by: null })
        .eq("pass_id", id);
    }

    await supabase.from("check_in_logs").insert({
      type,
      reference_id: id,
      action: "check_in",
      method,
      scanned_by: scannedBy,
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Check-in failed";
    return { success: false, error: message };
  }
}

/**
 * Undo Check-in (Strictly restricted to Admin role)
 */
export async function undoCheckIn(
  type: "participant" | "audience",
  id: string,
  userRole: AdminRole = "super_admin"
): Promise<{ success: boolean; error?: string }> {
  if (userRole === "volunteer") {
    return { success: false, error: "Permission Denied: Volunteers cannot undo check-ins." };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (type === "participant") {
      const team = devStore.teams.find((t) => t.team_id === id);
      if (team) {
        team.check_in_status = "not_checked_in";
        team.checked_in_at = null;
      }
    } else {
      const aud = devStore.audience.find((a) => a.pass_id === id);
      if (aud) {
        aud.check_in_status = "not_checked_in";
        aud.checked_in_at = null;
      }
    }
    devStore.logs.unshift({ type, reference_id: id, action: "undo_check_in", method: "manual_search", scanned_by: "Admin", timestamp: new Date().toISOString() });
    return { success: true };
  }

  try {
    if (type === "participant") {
      await supabase.from("teams").update({ check_in_status: "not_checked_in", checked_in_at: null }).eq("team_id", id);
    } else {
      await supabase.from("audience_registrations").update({ check_in_status: "not_checked_in", checked_in_at: null }).eq("pass_id", id);
    }

    await supabase.from("check_in_logs").insert({
      type,
      reference_id: id,
      action: "undo_check_in",
      method: "manual_search",
      scanned_by: "Admin",
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Undo check-in failed";
    return { success: false, error: message };
  }
}
