import { getSupabaseServerClient, isProduction } from "@/lib/supabase/server";
import { AudienceRegistration } from "@/lib/types/registration";
import { devStore } from "@/lib/dev/dev-store";
import { getEventSettings } from "@/lib/services/event-settings.service";
import { generateAudiencePassId, generateQrToken, generateQrDataUrl } from "@/lib/utils/id-generator";

// ==============================================================================
// 3. AUDIENCE REGISTRATION (Atomic)
// ==============================================================================
export interface RegisterAudienceInput {
  fullName: string;
  email: string;
  phone: string;
  collegeId: string;
}

export async function registerAudience(input: RegisterAudienceInput): Promise<{
  success: boolean;
  audience?: AudienceRegistration;
  qrDataUrl?: string;
  error?: string;
  statusCode?: number;
}> {
  const settings = await getEventSettings();

  // 1. Check if registration is open
  if (!settings.registration_open) {
    return { success: false, error: "Registration is currently closed." };
  }

  // 2. Validate 10-digit mobile number
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(input.phone.trim())) {
    return { success: false, error: "Mobile number must be exactly 10 digits." };
  }

  const passId = generateAudiencePassId();
  const qrToken = generateQrToken("audience", passId);
  const qrDataUrl = await generateQrDataUrl(qrToken);

  const supabase = getSupabaseServerClient();

  const registerAudienceInDevStore = () => {
    // Check audience capacity limit
    const activeAudCount = devStore.audience.filter((a) => a.registration_status !== "cancelled").length;
    if (activeAudCount >= settings.audience_limit) {
      return { success: false, error: "Audience registrations are full." };
    }

    const lowerEmail = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const lowerCollege = input.collegeId.trim().toLowerCase();

    if (devStore.audience.some((a) => a.email.toLowerCase() === lowerEmail && a.registration_status !== "cancelled")) {
      return { success: false, error: "Email, Mobile number, or College ID is already registered." };
    }
    if (devStore.audience.some((a) => a.phone === phone && a.registration_status !== "cancelled")) {
      return { success: false, error: "Email, Mobile number, or College ID is already registered." };
    }
    if (devStore.audience.some((a) => a.college_id.toLowerCase() === lowerCollege && a.registration_status !== "cancelled")) {
      return { success: false, error: "Email, Mobile number, or College ID is already registered." };
    }

    const passId = generateAudiencePassId();
    const qrToken = generateQrToken("audience", passId);

    const newAud: AudienceRegistration = {
      id: `aud-${Date.now()}`,
      pass_id: passId,
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      college_id: input.collegeId.trim(),
      qr_token: qrToken,
      registration_status: "confirmed",
      check_in_status: "not_checked_in",
      created_at: new Date().toISOString(),
    };

    devStore.audience.unshift(newAud);

    // Audience registration emails are disabled to preserve Google SMTP quota for tournament participants
    return { success: true, audience: newAud };
  };

  if (!supabase) {
    if (isProduction) {
      return { success: false, error: "Database service unavailable in production.", statusCode: 503 };
    }
    return registerAudienceInDevStore();
  }

  try {
    // 1. Check audience capacity limit dynamically from DB settings
    const { count: audCount, error: countErr } = await supabase
      .from("audience_registrations")
      .select("id", { count: "exact", head: true })
      .neq("registration_status", "cancelled");

    if (!countErr && typeof audCount === "number" && audCount >= settings.audience_limit) {
      return { success: false, error: "Audience registrations are full." };
    }

    // 2. Collision-safe generation and insertion loop (up to 3 retries on pass_id collision)
    let createdAudience: AudienceRegistration | null = null;
    let finalPassId = "";
    let finalQrToken = "";
    let finalQrDataUrl = "";
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      finalPassId = generateAudiencePassId();
      finalQrToken = generateQrToken("audience", finalPassId);
      finalQrDataUrl = await generateQrDataUrl(finalQrToken);

      // Try atomic RPC first
      const { data: rpcData, error: rpcErr } = await supabase.rpc("register_audience_atomic", {
        p_pass_id: finalPassId,
        p_full_name: input.fullName.trim(),
        p_email: input.email.trim().toLowerCase(),
        p_phone: input.phone.trim(),
        p_college_id: input.collegeId.trim(),
        p_qr_token: finalQrToken,
      });

      if (!rpcErr && rpcData) {
        createdAudience = rpcData;
        break;
      }

      if (rpcErr) {
        // If it's a pass_id unique collision, retry with a fresh random ID
        const isPassIdCollision =
          rpcErr.code === "23505" && (rpcErr.message?.includes("pass_id") || rpcErr.details?.includes("pass_id"));
        if (isPassIdCollision && attempt < maxRetries) {
          console.warn(`[Audience ID Collision] Retrying with fresh pass_id (attempt ${attempt}/${maxRetries})...`);
          continue;
        }

        // If RPC threw a real validation error or duplicate user conflict, return immediately
        if (rpcErr.message && !rpcErr.message.includes("does not exist") && !rpcErr.message.includes("function") && rpcErr.code !== "42883") {
          return { success: false, error: rpcErr.message };
        }

        // Fallback: Standard insert
        const { data, error } = await supabase
          .from("audience_registrations")
          .insert({
            pass_id: finalPassId,
            full_name: input.fullName.trim(),
            email: input.email.trim().toLowerCase(),
            phone: input.phone.trim(),
            college_id: input.collegeId.trim(),
            qr_token: finalQrToken,
            registration_status: "confirmed",
            check_in_status: "not_checked_in",
            email_notification_status: "pending",
          })
          .select()
          .single();

        if (error) {
          const isInsertPassCollision =
            error.code === "23505" && (error.message?.includes("pass_id") || error.details?.includes("pass_id"));
          if (isInsertPassCollision && attempt < maxRetries) {
            console.warn(`[Audience ID Collision] Retrying insert with fresh pass_id (attempt ${attempt}/${maxRetries})...`);
            continue;
          }
          if (error.code === "23505") {
            return { success: false, error: "Email, Mobile number, or College ID is already registered." };
          }
          return { success: false, error: error.message || "Failed to save audience registration." };
        }

        createdAudience = data;
        break;
      }
    }

    if (!createdAudience) {
      return { success: false, error: "Failed to generate a unique pass ID. Please try again." };
    }

    // 3. Email Delivery: Skipped for audience registrations to preserve Google SMTP quota exclusively for tournament participants.
    // Audience members download or take a screenshot of their pass QR code directly on the confirmation screen.

    return { success: true, audience: createdAudience as AudienceRegistration, qrDataUrl: finalQrDataUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete audience registration.";
    console.error("Supabase audience register network error:", err);
    return { success: false, error: message };
  }
}

/**
 * Delete an audience pass registration.
 */
export async function deleteAudiencePass(passId: string): Promise<{ success: boolean; error?: string }> {
  const cleanId = passId.trim();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    devStore.audience = devStore.audience.filter((a) => a.pass_id !== cleanId && a.id !== cleanId);
    return { success: true };
  }

  try {
    const { error } = await supabase.from("audience_registrations").delete().eq("pass_id", cleanId);
    if (error) {
      const retry = await supabase.from("audience_registrations").delete().eq("id", cleanId);
      if (retry.error) throw retry.error;
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete audience pass";
    console.error("Failed to delete audience pass:", err);
    return { success: false, error: message };
  }
}

