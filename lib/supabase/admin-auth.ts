import { NextRequest } from "next/server";
import { getSupabaseServerClient, isServerSupabaseConfigured } from "./server";
import { AdminRole } from "@/lib/types/registration";

export interface AuthenticatedAdminUser {
  userId: string;
  email: string;
  fullName: string;
  role: AdminRole;
}

export type AuthResult =
  | { success: true; user: AuthenticatedAdminUser }
  | { success: false; error: string; status: number };

/**
 * Server-side verification of Supabase Auth session and admin_profiles role.
 * Strictly verifies real Supabase Bearer JWT token against the admin_profiles database table.
 * NEVER trusts client-supplied roles or custom dev headers.
 *
 * @param req NextRequest
 * @param requiredRole 'admin' | 'volunteer' (default 'volunteer' - allows both admin and volunteer)
 */
export async function authenticateAdminRequest(
  req: NextRequest,
  requiredRole: "admin" | "volunteer" = "volunteer"
): Promise<AuthResult> {
  const supabase = getSupabaseServerClient();

  if (!supabase || !isServerSupabaseConfigured) {
    return {
      success: false,
      error: "Authentication service unavailable: Supabase server is not configured",
      status: 503,
    };
  }

  // 1. Extract Bearer token from Authorization header
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return {
      success: false,
      error: "Unauthorized: Missing authentication token",
      status: 401,
    };
  }

  try {
    // 2. Verify token with Supabase Auth
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser(token);

    if (authErr || !user) {
      return {
        success: false,
        error: "Unauthorized: Invalid or expired session",
        status: 401,
      };
    }

    // 3. Query admin_profiles table in Supabase by authenticated user's ID
    let profile: { role?: string; full_name?: string; email?: string } | null = null;

    // Check by id
    const { data: byId, error: errById } = await supabase
      .from("admin_profiles")
      .select("role, full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (byId) {
      profile = byId;
    } else if (!errById) {
      // Fallback check by user_id column if schema uses user_id
      const { data: byUserId } = await supabase
        .from("admin_profiles")
        .select("role, full_name, email")
        .eq("user_id", user.id)
        .maybeSingle();
      profile = byUserId;
    }

    // 4. If user is authenticated in Supabase but not present in admin_profiles
    if (!profile || !profile.role) {
      return {
        success: false,
        error: "Forbidden: Account is not authorized in admin_profiles",
        status: 403,
      };
    }

    const role = profile.role as AdminRole;

    // Validate role value
    if (role !== "admin" && role !== "volunteer") {
      return {
        success: false,
        error: "Forbidden: Invalid role assignment in admin_profiles",
        status: 403,
      };
    }

    // 5. Enforce role permissions server-side
    // If 'admin' is required, volunteers must be strictly rejected
    if (requiredRole === "admin" && role !== "admin") {
      return {
        success: false,
        error: "Forbidden: Only Admin role can perform this operation",
        status: 403,
      };
    }

    return {
      success: true,
      user: {
        userId: user.id,
        email: profile.email || user.email || "",
        fullName: profile.full_name || user.email?.split("@")[0] || "Organizer",
        role,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Authentication service error",
      status: 500,
    };
  }
}
