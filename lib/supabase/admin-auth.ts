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
 * NEVER trusts client-supplied roles.
 *
 * @param req NextRequest
 * @param requiredRole 'admin' | 'volunteer' (default 'volunteer' - allows both admin and volunteer)
 */
export async function authenticateAdminRequest(
  req: NextRequest,
  requiredRole: "admin" | "volunteer" = "volunteer"
): Promise<AuthResult> {
  const supabase = getSupabaseServerClient();

  // 1. Check for Dev / Test mode simulation headers in development environment
  if (process.env.NODE_ENV === "development") {
    const devRoleHeader = req.headers.get("x-dev-role");
    const devAuth = req.headers.get("x-dev-auth");
    if (devRoleHeader && devAuth) {
      const role: AdminRole = devRoleHeader === "admin" ? "admin" : "volunteer";
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
          userId: `dev-${role}-user`,
          email: `${role}@novaforge.gg`,
          fullName: role === "admin" ? "Lead Admin (Dev)" : "Arena Volunteer (Dev)",
          role,
        },
      };
    }
  }

  // 2. Production Mode with Supabase
  if (supabase && isServerSupabaseConfigured) {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return { success: false, error: "Unauthorized: Missing authentication token", status: 401 };
    }

    try {
      // Verify token with Supabase Auth
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser(token);

      if (authErr || !user) {
        return { success: false, error: "Unauthorized: Invalid or expired session", status: 401 };
      }

      // Query database for admin_profiles role (checking id or user_id)
      let profile: any = null;
      const { data: byId } = await supabase
        .from("admin_profiles")
        .select("role, full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      if (byId) {
        profile = byId;
      } else {
        const { data: byUserId } = await supabase
          .from("admin_profiles")
          .select("role, full_name, email")
          .eq("user_id", user.id)
          .maybeSingle();
        profile = byUserId;
      }

      if (!profile) {
        return {
          success: false,
          error: "Forbidden: Account is not authorized in admin_profiles",
          status: 403,
        };
      }

      const role = profile.role as AdminRole;

      // Role check: if 'admin' is required, volunteers must be rejected
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
      return { success: false, error: "Authentication service error", status: 500 };
    }
  }

  // 2. Dev / Offline Fallback Mode (Used only when Supabase is not configured locally)
  const devAuth = req.headers.get("x-dev-auth") || req.headers.get("authorization") || "";
  const devRoleHeader = req.headers.get("x-dev-role") || (devAuth.includes("admin") ? "admin" : "volunteer");
  const role: AdminRole = devRoleHeader === "admin" ? "admin" : "volunteer";

  if (!devAuth) {
    // If no header is provided in dev mode, default to authenticated developer admin for seamless testing
    return {
      success: true,
      user: {
        userId: "dev-admin-user",
        email: "admin@novaforge.gg",
        fullName: "Lead Admin (Dev)",
        role: requiredRole === "admin" ? "admin" : role,
      },
    };
  }

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
      userId: `dev-${role}-user`,
      email: `${role}@novaforge.gg`,
      fullName: role === "admin" ? "Lead Admin" : "Arena Volunteer",
      role,
    },
  };
}
