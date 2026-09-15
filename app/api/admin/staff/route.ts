import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/supabase/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { devStore } from "@/lib/dev/dev-store";
import { logAdminAudit } from "@/lib/supabase/service";
import { StaffRole } from "@/lib/types/registration";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/staff
 * Lists all staff profiles. STRICTLY SUPER ADMIN ONLY.
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({
      success: true,
      staff: devStore.adminProfiles,
      currentUser: auth.user,
    });
  }

  try {
    const { data: rawStaff, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const staff = (rawStaff || []).map((s: Record<string, unknown>) => ({
      ...s,
      is_active: s.is_active !== undefined ? s.is_active : true,
      role: s.role === "admin" && String(s.email).toLowerCase() === "saurabhsinghkarmwarrajput@gmail.com"
        ? "super_admin"
        : s.role,
    }));

    return NextResponse.json({
      success: true,
      staff,
      currentUser: auth.user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load staff accounts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/staff
 * Creates a new staff account (Core Member or Volunteer) with Email & Password.
 * STRICTLY SUPER ADMIN ONLY.
 */
export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { email, password, full_name, role } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedName = (full_name || "").trim();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedName) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Role must be admin, core_member or volunteer (Super Admin accounts cannot be created via this route)
    if (role !== "admin" && role !== "core_member" && role !== "volunteer") {
      return NextResponse.json(
        { success: false, error: "Role must be 'admin', 'core_member', or 'volunteer'." },
        { status: 400 }
      );
    }

    const targetRole = role as StaffRole;
    const supabase = getSupabaseServerClient();
    const isDevSession = !supabase || auth.user.userId.startsWith("dev-") || auth.user.userId === "super-admin-dev-1";

    // Local Dev Store Fallback
    if (isDevSession) {
      if (devStore.adminProfiles.some((p) => p.email === trimmedEmail)) {
        return NextResponse.json(
          { success: false, error: "A staff member with this email already exists." },
          { status: 400 }
        );
      }

      const newDevProfile = {
        id: `dev-${targetRole}-${Date.now()}`,
        user_id: `dev-user-${Date.now()}`,
        email: trimmedEmail,
        full_name: trimmedName,
        role: targetRole,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      devStore.adminProfiles.push(newDevProfile);

      await logAdminAudit({
        action: "staff_created",
        reference_id: trimmedEmail,
        scanned_by: auth.user.fullName || auth.user.email,
        actor_role: auth.user.role,
        reason: `Created ${targetRole} account for ${trimmedName}`,
      });

      return NextResponse.json({ success: true, profile: newDevProfile });
    }

    // Production / Supabase Flow: Use service role client to create auth user
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: trimmedEmail,
      password: trimmedPassword,
      email_confirm: true, // Auto-confirm so no email verification hurdles
      user_metadata: { full_name: trimmedName, role: targetRole },
    });

    if (authError || !newUser?.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || "Failed to create authentication user." },
        { status: 400 }
      );
    }

    // Insert or update profile in admin_profiles
    const { data: profile, error: profError } = await supabase
      .from("admin_profiles")
      .upsert(
        {
          id: newUser.user.id,
          user_id: newUser.user.id,
          email: trimmedEmail,
          full_name: trimmedName,
          role: targetRole,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (profError) {
      return NextResponse.json(
        { success: false, error: profError.message || "Failed to initialize staff profile." },
        { status: 500 }
      );
    }

    await logAdminAudit({
      action: "staff_created",
      reference_id: trimmedEmail,
      scanned_by: auth.user.fullName || auth.user.email,
      actor_role: auth.user.role,
      reason: `Created ${targetRole} account for ${trimmedName}`,
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error creating staff";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/staff
 * Start / Stop an individual staff member account.
 * STRICTLY SUPER ADMIN ONLY.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();
    const { staffId, is_active } = body;

    if (!staffId || typeof is_active !== "boolean") {
      return NextResponse.json(
        { success: false, error: "staffId and boolean is_active status are required." },
        { status: 400 }
      );
    }

    // CRITICAL PROTECTION: Super Admin cannot stop themselves!
    if (auth.user.userId === staffId || auth.user.profileId === staffId) {
      return NextResponse.json(
        { success: false, error: "Safety Violation: Super Admin cannot stop their own account." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const isDevSession = !supabase || auth.user.userId.startsWith("dev-") || auth.user.userId === "super-admin-dev-1";

    // Local Dev Store Fallback
    if (isDevSession) {
      const profile = devStore.adminProfiles.find(
        (p) => p.id === staffId || p.user_id === staffId || p.email === staffId
      );

      if (!profile) {
        return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
      }

      if (profile.role === "super_admin" && !is_active) {
        return NextResponse.json(
          { success: false, error: "Super Admin accounts cannot be stopped." },
          { status: 400 }
        );
      }

      profile.is_active = is_active;

      const action = is_active ? "staff_started" : "staff_stopped";
      await logAdminAudit({
        action,
        reference_id: profile.email,
        scanned_by: auth.user.fullName || auth.user.email,
        actor_role: auth.user.role,
        reason: `${is_active ? "Started" : "Stopped"} account for ${profile.full_name} (${profile.role})`,
      });

      return NextResponse.json({ success: true, profile });
    }

    // Production / Supabase Flow
    // 1. Fetch target profile
    const { data: targetProfile, error: fetchErr } = await supabase
      .from("admin_profiles")
      .select("id, email, full_name, role, is_active")
      .or(`id.eq.${staffId},user_id.eq.${staffId}`)
      .single();

    if (fetchErr || !targetProfile) {
      return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
    }

    // Protect Super Admin accounts from being disabled
    if (targetProfile.role === "super_admin" && !is_active) {
      return NextResponse.json(
        { success: false, error: "Safety Violation: Super Admin accounts cannot be stopped." },
        { status: 400 }
      );
    }

    // 2. Update is_active in admin_profiles
    const { data: updatedProfile, error: updateErr } = await supabase
      .from("admin_profiles")
      .update({
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetProfile.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    // 3. Record Audit Log
    const action = is_active ? "staff_started" : "staff_stopped";
    await logAdminAudit({
      action,
      reference_id: targetProfile.email,
      scanned_by: auth.user.fullName || auth.user.email,
      actor_role: auth.user.role,
      reason: `${is_active ? "Started" : "Stopped"} account for ${targetProfile.full_name} (${targetProfile.role})`,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error updating staff status";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/staff
 * Permanently deletes a staff account. STRICTLY SUPER ADMIN ONLY.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.success) {
    return NextResponse.json(
      { success: false, error: auth.error, code: auth.code },
      { status: auth.status }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    let staffId = searchParams.get("staffId") || searchParams.get("id");

    if (!staffId) {
      try {
        const body = await req.json();
        staffId = body.staffId || body.id;
      } catch {
        // query param fallback
      }
    }

    if (!staffId) {
      return NextResponse.json(
        { success: false, error: "Staff ID is required." },
        { status: 400 }
      );
    }

    // CRITICAL PROTECTION: Super Admin cannot delete themselves!
    if (
      auth.user.userId === staffId ||
      auth.user.profileId === staffId ||
      auth.user.email.toLowerCase() === staffId.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: "Safety Violation: Super Admin cannot delete their own account." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const isDevSession =
      !supabase || auth.user.userId.startsWith("dev-") || auth.user.userId === "super-admin-dev-1";

    // Local Dev Store Fallback
    if (isDevSession) {
      const index = devStore.adminProfiles.findIndex(
        (p) => p.id === staffId || p.user_id === staffId || p.email.toLowerCase() === staffId.toLowerCase()
      );

      if (index === -1) {
        return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
      }

      const profile = devStore.adminProfiles[index];

      if (profile.role === "super_admin") {
        return NextResponse.json(
          { success: false, error: "Super Admin accounts cannot be deleted." },
          { status: 400 }
        );
      }

      devStore.adminProfiles.splice(index, 1);

      await logAdminAudit({
        action: "staff_deleted",
        reference_id: profile.email,
        scanned_by: auth.user.fullName || auth.user.email,
        actor_role: auth.user.role,
        reason: `Permanently deleted staff account for ${profile.full_name} (${profile.role})`,
      });

      return NextResponse.json({
        success: true,
        message: `Staff account for ${profile.full_name} deleted successfully.`,
      });
    }

    // Production / Supabase Flow
    // 1. Fetch target profile
    const { data: targetProfile, error: fetchErr } = await supabase
      .from("admin_profiles")
      .select("id, user_id, email, full_name, role")
      .or(`id.eq.${staffId},user_id.eq.${staffId},email.eq.${staffId.toLowerCase()}`)
      .single();

    if (fetchErr || !targetProfile) {
      return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
    }

    // Protect Super Admin accounts from deletion
    if (
      targetProfile.role === "super_admin" ||
      targetProfile.email.toLowerCase() === "saurabhsinghkarmwarrajput@gmail.com"
    ) {
      return NextResponse.json(
        { success: false, error: "Safety Violation: Super Admin accounts cannot be deleted." },
        { status: 400 }
      );
    }

    // 2. Delete from auth.users (if user_id or id is valid auth user)
    const authUserId = targetProfile.user_id || targetProfile.id;
    if (authUserId) {
      try {
        await supabase.auth.admin.deleteUser(authUserId);
      } catch (authDelErr) {
        console.warn("Auth user deletion warning:", authDelErr);
      }
    }

    // 3. Delete from admin_profiles explicitly
    const { error: delErr } = await supabase
      .from("admin_profiles")
      .delete()
      .or(`id.eq.${targetProfile.id},email.eq.${targetProfile.email}`);

    if (delErr) {
      return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
    }

    // 4. Record Audit Log
    await logAdminAudit({
      action: "staff_deleted",
      reference_id: targetProfile.email,
      scanned_by: auth.user.fullName || auth.user.email,
      actor_role: auth.user.role,
      reason: `Permanently deleted staff account for ${targetProfile.full_name} (${targetProfile.role})`,
    });

    return NextResponse.json({
      success: true,
      message: `Staff account for ${targetProfile.full_name} deleted successfully.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error deleting staff account";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
