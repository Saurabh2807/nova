import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// In server context, require the dedicated service-role key; never silently substitute the public anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isProduction = process.env.NODE_ENV === "production";
export const isServerSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

let cachedServerClient: SupabaseClient | null = null;

export class SupabaseConfigurationError extends Error {
  statusCode: number;
  constructor(message: string = "Supabase service credentials are not configured in production.") {
    super(message);
    this.name = "SupabaseConfigurationError";
    this.statusCode = 503;
  }
}

/**
 * Returns the authenticated Supabase Server Client.
 * In production: If credentials are missing, throws SupabaseConfigurationError (HTTP 503).
 * In local dev (NODE_ENV !== 'production'): Returns null to allow isolated offline dev testing.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) {
    if (isProduction) {
      throw new SupabaseConfigurationError(
        "Database connection unavailable: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing in production."
      );
    }
    return null;
  }

  if (!cachedServerClient) {
    cachedServerClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedServerClient;
}

