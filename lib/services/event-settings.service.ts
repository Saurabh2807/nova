import { getSupabaseServerClient, isProduction } from "@/lib/supabase/server";
import { EventSettings } from "@/lib/types/registration";
import { devStore } from "@/lib/dev/dev-store";

// ==============================================================================
// 1. EVENT SETTINGS (Database Single Source of Truth)
// ==============================================================================
export async function getEventSettings(): Promise<EventSettings> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    if (isProduction) {
      throw new Error("Database service unavailable in production.");
    }
    return devStore.settings;
  }
  try {
    const { data, error } = await supabase.from("event_settings").select("*").limit(1).single();
    if (error || !data) {
      if (isProduction) {
        throw new Error(error?.message || "Failed to load event settings from Supabase.");
      }
      return devStore.settings;
    }
    return data as EventSettings;
  } catch (err) {
    if (isProduction) {
      throw err;
    }
    console.warn("Supabase getEventSettings fallback:", err);
    return devStore.settings;
  }
}

export async function updateEventSettings(newSettings: Partial<EventSettings>): Promise<boolean> {
  const cleanSettings: Partial<EventSettings> = {};
  if (newSettings.registration_open !== undefined) cleanSettings.registration_open = newSettings.registration_open;
  if (newSettings.participant_limit !== undefined) cleanSettings.participant_limit = Number(newSettings.participant_limit);
  if (newSettings.audience_limit !== undefined) cleanSettings.audience_limit = Number(newSettings.audience_limit);
  if (newSettings.event_name !== undefined) cleanSettings.event_name = newSettings.event_name;
  if (newSettings.event_date !== undefined) cleanSettings.event_date = newSettings.event_date;
  if (newSettings.venue !== undefined) cleanSettings.venue = newSettings.venue;
  if (newSettings.reporting_time !== undefined) cleanSettings.reporting_time = newSettings.reporting_time;

  // Always update in-memory devStore so local state is instantly updated
  Object.assign(devStore.settings, cleanSettings);

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return true;
  }
  try {
    const { data: existing } = await supabase.from("event_settings").select("id").limit(1).maybeSingle();
    if (existing?.id) {
      let { error } = await supabase.from("event_settings").update(cleanSettings).eq("id", existing.id);
      if (error && error.message.includes("column")) {
        // Fallback to core columns only
        const coreSettings: Partial<EventSettings> = {};
        if (cleanSettings.registration_open !== undefined) coreSettings.registration_open = cleanSettings.registration_open;
        if (cleanSettings.participant_limit !== undefined) coreSettings.participant_limit = cleanSettings.participant_limit;
        if (cleanSettings.audience_limit !== undefined) coreSettings.audience_limit = cleanSettings.audience_limit;
        
        const retryRes = await supabase.from("event_settings").update(coreSettings).eq("id", existing.id);
        error = retryRes.error;
      }

      if (error) {
        console.warn("Supabase update error:", error.message);
        return false;
      }
      return true;
    } else {
      let { error } = await supabase.from("event_settings").insert(cleanSettings);
      if (error && error.message.includes("column")) {
        const coreSettings: Partial<EventSettings> = {};
        if (cleanSettings.registration_open !== undefined) coreSettings.registration_open = cleanSettings.registration_open;
        if (cleanSettings.participant_limit !== undefined) coreSettings.participant_limit = cleanSettings.participant_limit;
        if (cleanSettings.audience_limit !== undefined) coreSettings.audience_limit = cleanSettings.audience_limit;
        const retryRes = await supabase.from("event_settings").insert(coreSettings);
        error = retryRes.error;
      }
      if (error) {
        console.warn("Supabase insert error:", error.message);
        return false;
      }
      return true;
    }
  } catch (err) {
    console.warn("Supabase updateEventSettings fallback:", err);
    return true;
  }
}
