import { getSupabaseServerClient, isServerSupabaseConfigured } from "./server";
import {
  Team,
  TeamMember,
  AudienceRegistration,
  EventSettings,
  VerificationResult,
  AdminProfile,
  AdminRole,
} from "@/lib/types/registration";
import { generateTeamId, generateAudiencePassId, generateQrToken, generateQrDataUrl } from "@/lib/utils/id-generator";
import { getLeaderEmailHtml, getPlayer2EmailHtml, getAudienceEmailHtml } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/sender";

// ==============================================================================
// IN-MEMORY / LOCAL STORAGE DEV STORE (Used when Supabase is not configured)
// ==============================================================================
const devStore = {
  settings: {
    id: "dev-event-settings",
    registration_open: true,
    participant_limit: 250,
    audience_limit: 1000,
    event_name: "Nova Forge Campus Carnival",
    event_date: "18–19 September 2026",
    venue: "LNCT Bhopal",
    reporting_time: "09:00 AM IST",
  } as EventSettings,
  teams: [] as Team[],
  participants: [] as TeamMember[],
  audience: [] as AudienceRegistration[],
  adminProfiles: [
    { id: "admin-dev-1", email: "admin@novaforge.gg", full_name: "Lead Admin", role: "admin" as AdminRole },
    { id: "volunteer-dev-1", email: "volunteer@novaforge.gg", full_name: "Arena Volunteer", role: "volunteer" as AdminRole },
  ] as AdminProfile[],
  logs: [] as any[],
};

// Seed initial mock data for instant developer testing
if (devStore.teams.length === 0) {
  const seedTeamId = "NF-BGMI-2026-8X4K7";
  const seedQrToken = generateQrToken("participant", seedTeamId);
  devStore.teams.push({
    id: "seed-team-1",
    team_id: seedTeamId,
    name: "Godlike Arena",
    game: "bgmi",
    qr_token: seedQrToken,
    registration_status: "confirmed",
    check_in_status: "not_checked_in",
    created_at: new Date().toISOString(),
    members: [
      { role: "leader", full_name: "Aman Sharma", email: "aman@example.com", phone: "9876543210", college_id: "0103CS231001" },
      { role: "member", full_name: "Rohit Verma", email: "rohit@example.com", phone: "9876543211", college_id: "0103CS231002" },
    ],
  });
  devStore.participants.push(
    { team_id: seedTeamId, role: "leader", full_name: "Aman Sharma", email: "aman@example.com", phone: "9876543210", college_id: "0103CS231001", created_at: new Date().toISOString() },
    { team_id: seedTeamId, role: "member", full_name: "Rohit Verma", email: "rohit@example.com", phone: "9876543211", college_id: "0103CS231002", created_at: new Date().toISOString() }
  );

  const seedAudienceId = "NF-AUD-SA-Q9PL";
  const seedAudienceToken = generateQrToken("audience", seedAudienceId);
  devStore.audience.push({
    id: "seed-aud-1",
    pass_id: seedAudienceId,
    full_name: "Priya Patel",
    email: "priya@example.com",
    phone: "9123456789",
    college_id: "0103IT241045",
    qr_token: seedAudienceToken,
    registration_status: "confirmed",
    check_in_status: "not_checked_in",
    created_at: new Date().toISOString(),
  });
}

// ==============================================================================
// 1. EVENT SETTINGS
// ==============================================================================
export async function getEventSettings(): Promise<EventSettings> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return devStore.settings;
  }
  try {
    const { data, error } = await supabase.from("event_settings").select("*").limit(1).single();
    if (error || !data) {
      return devStore.settings;
    }
    return data as EventSettings;
  } catch (err) {
    console.warn("Supabase getEventSettings fallback:", err);
    return devStore.settings;
  }
}

export async function updateEventSettings(newSettings: Partial<EventSettings>): Promise<boolean> {
  const cleanSettings: any = {};
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
        const coreSettings: any = {};
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
        const coreSettings: any = {};
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

// ==============================================================================
// 2. PARTICIPANT TEAM REGISTRATION (Strictly Atomic, 2-Player Transaction)
// ==============================================================================
export interface RegisterTeamInput {
  teamName: string;
  game?: string;
  leader: {
    fullName: string;
    email: string;
    phone: string;
    collegeId: string;
  };
  member: {
    fullName: string;
    email: string;
    phone: string;
    collegeId: string;
  };
}

export async function registerBgmiTeam(input: RegisterTeamInput): Promise<{
  success: boolean;
  team?: Team;
  qrDataUrl?: string;
  error?: string;
}> {
  const settings = await getEventSettings();

  // 1. Check if registration is open
  if (!settings.registration_open) {
    return { success: false, error: "Registration is currently closed." };
  }

  // 2. Validate 10-digit mobile numbers (any 10 digits allowed)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(input.leader.phone.trim()) || !phoneRegex.test(input.member.phone.trim())) {
    return { success: false, error: "Mobile number must be exactly 10 digits." };
  }

  // 3. Validate distinct players within the team
  if (
    input.leader.email.trim().toLowerCase() === input.member.email.trim().toLowerCase() ||
    input.leader.phone.trim() === input.member.phone.trim() ||
    input.leader.collegeId.trim().toLowerCase() === input.member.collegeId.trim().toLowerCase()
  ) {
    return { success: false, error: "Player 1 and Player 2 cannot have the same Email, Phone, or College ID." };
  }

  const selectedGame = input.game || "bgmi";
  const teamId = generateTeamId(selectedGame);
  const qrToken = generateQrToken("participant", teamId);
  const qrDataUrl = await generateQrDataUrl(qrToken);

  const supabase = getSupabaseServerClient();

  // Helper function to register in devStore (Atomic)
  const registerInDevStore = () => {
    // Check participant limit (number of teams)
    const activeTeamsCount = devStore.teams.filter((t) => t.registration_status !== "cancelled").length;
    if (activeTeamsCount >= settings.participant_limit) {
      return { success: false, error: "Participant registrations are full." };
    }

    const lowerName = input.teamName.trim().toLowerCase();
    if (devStore.teams.some((t) => t.name.toLowerCase() === lowerName && t.registration_status !== "cancelled")) {
      return { success: false, error: "Team Name is already taken. Please choose another." };
    }

    const allEmails = [input.leader.email.trim().toLowerCase(), input.member.email.trim().toLowerCase()];
    const allPhones = [input.leader.phone.trim(), input.member.phone.trim()];
    const allColleges = [input.leader.collegeId.trim().toLowerCase(), input.member.collegeId.trim().toLowerCase()];

    if (devStore.participants.some((p) => allEmails.includes(p.email.toLowerCase()))) {
      return { success: false, error: "One of the provided Email addresses is already registered in another team." };
    }
    if (devStore.participants.some((p) => allPhones.includes(p.phone))) {
      return { success: false, error: "One of the provided Mobile numbers is already registered in another team." };
    }
    if (devStore.participants.some((p) => allColleges.includes(p.college_id.toLowerCase()))) {
      return { success: false, error: "One of the provided College IDs (Enrollment/Scholar No) is already registered." };
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      team_id: teamId,
      name: input.teamName.trim(),
      game: selectedGame,
      qr_token: qrToken,
      registration_status: "confirmed",
      check_in_status: "not_checked_in",
      created_at: new Date().toISOString(),
      members: [
        { role: "leader", full_name: input.leader.fullName.trim(), email: input.leader.email.trim(), phone: input.leader.phone.trim(), college_id: input.leader.collegeId.trim() },
        { role: "member", full_name: input.member.fullName.trim(), email: input.member.email.trim(), phone: input.member.phone.trim(), college_id: input.member.collegeId.trim() },
      ],
    };

    // Atomic addition
    devStore.teams.unshift(newTeam);
    devStore.participants.push(
      { team_id: teamId, role: "leader", full_name: input.leader.fullName.trim(), email: input.leader.email.trim(), phone: input.leader.phone.trim(), college_id: input.leader.collegeId.trim(), created_at: new Date().toISOString() },
      { team_id: teamId, role: "member", full_name: input.member.fullName.trim(), email: input.member.email.trim(), phone: input.member.phone.trim(), college_id: input.member.collegeId.trim(), created_at: new Date().toISOString() }
    );

    // Dispatch emails
    sendEmail({
      to: input.leader.email.trim(),
      subject: `Your Registration is Confirmed — Nova Forge ${selectedGame.toUpperCase()} Team Pass`,
      html: getLeaderEmailHtml({
        teamName: input.teamName.trim(),
        teamId,
        leaderName: input.leader.fullName.trim(),
        leaderPhone: input.leader.phone.trim(),
        leaderCollegeId: input.leader.collegeId.trim(),
        player2Name: input.member.fullName.trim(),
        player2Phone: input.member.phone.trim(),
        player2CollegeId: input.member.collegeId.trim(),
        qrDataUrl,
        eventDate: settings.event_date,
        venue: settings.venue,
        reportingTime: settings.reporting_time,
      }),
    });

    sendEmail({
      to: input.member.email.trim(),
      subject: `You're Registered — Nova Forge ${selectedGame.toUpperCase()} Team Confirmed`,
      html: getPlayer2EmailHtml({
        teamName: input.teamName.trim(),
        teamId,
        leaderName: input.leader.fullName.trim(),
        player2Name: input.member.fullName.trim(),
        player2Phone: input.member.phone.trim(),
        player2CollegeId: input.member.collegeId.trim(),
        qrDataUrl,
        eventDate: settings.event_date,
        venue: settings.venue,
        reportingTime: settings.reporting_time,
      }),
    });

    return { success: true, team: newTeam, qrDataUrl };
  };

  if (!supabase) {
    return registerInDevStore();
  }

  // --- Production Supabase execution ---
  try {
    // 1. Check participant team capacity limit first
    const { count: teamCount, error: countErr } = await supabase
      .from("teams")
      .select("id", { count: "exact", head: true })
      .neq("registration_status", "cancelled");

    if (!countErr && typeof teamCount === "number" && teamCount >= settings.participant_limit) {
      return { success: false, error: "Participant registrations are full." };
    }

    // 2. Execute Atomic Registration via Postgres Function / RPC
    const { data: rpcData, error: rpcErr } = await supabase.rpc("register_team_atomic", {
      p_team_id: teamId,
      p_team_name: input.teamName.trim(),
      p_game: selectedGame,
      p_qr_token: qrToken,
      p_leader_name: input.leader.fullName.trim(),
      p_leader_email: input.leader.email.trim().toLowerCase(),
      p_leader_phone: input.leader.phone.trim(),
      p_leader_college_id: input.leader.collegeId.trim(),
      p_member_name: input.member.fullName.trim(),
      p_member_email: input.member.email.trim().toLowerCase(),
      p_member_phone: input.member.phone.trim(),
      p_member_college_id: input.member.collegeId.trim(),
    });

    if (rpcErr) {
      // If RPC is missing or throws an error, handle gracefully
      if (rpcErr.message && !rpcErr.message.includes("does not exist") && !rpcErr.message.includes("function") && rpcErr.code !== "42883") {
        return { success: false, error: rpcErr.message };
      }

      // Fallback: Atomic batch insert with automatic rollback on error
      const { data: teamData, error: teamErr } = await supabase
        .from("teams")
        .insert({
          team_id: teamId,
          name: input.teamName.trim(),
          game: selectedGame,
          qr_token: qrToken,
          registration_status: "confirmed",
          check_in_status: "not_checked_in",
        })
        .select()
        .single();

      if (teamErr) {
        if (teamErr.code === "23505") {
          return { success: false, error: "Team Name is already taken. Please choose another." };
        }
        return { success: false, error: teamErr.message || "Failed to save team registration." };
      }

      // Insert both players atomically
      const { error: partErr } = await supabase.from("participants").insert([
        {
          team_id: teamId,
          role: "leader",
          full_name: input.leader.fullName.trim(),
          email: input.leader.email.trim().toLowerCase(),
          phone: input.leader.phone.trim(),
          college_id: input.leader.collegeId.trim(),
        },
        {
          team_id: teamId,
          role: "member",
          full_name: input.member.fullName.trim(),
          email: input.member.email.trim().toLowerCase(),
          phone: input.member.phone.trim(),
          college_id: input.member.collegeId.trim(),
        },
      ]);

      if (partErr) {
        // Rollback entire team immediately if participants fail
        await supabase.from("teams").delete().eq("team_id", teamId);
        if (partErr.code === "23505") {
          return { success: false, error: "One of the emails, phone numbers, or college IDs is already registered." };
        }
        return { success: false, error: partErr.message };
      }
    }

    // Send emails (awaited for serverless runtime persistence)
    try {
      await Promise.allSettled([
        sendEmail({
          to: input.leader.email.trim(),
          subject: `Your Registration is Confirmed — Nova Forge ${selectedGame.toUpperCase()} Team Pass`,
          html: getLeaderEmailHtml({
            teamName: input.teamName.trim(),
            teamId,
            leaderName: input.leader.fullName.trim(),
            leaderPhone: input.leader.phone.trim(),
            leaderCollegeId: input.leader.collegeId.trim(),
            player2Name: input.member.fullName.trim(),
            player2Phone: input.member.phone.trim(),
            player2CollegeId: input.member.collegeId.trim(),
            qrDataUrl,
            eventDate: settings.event_date,
            venue: settings.venue,
            reportingTime: settings.reporting_time,
          }),
        }),
        sendEmail({
          to: input.member.email.trim(),
          subject: `You're Registered — Nova Forge ${selectedGame.toUpperCase()} Team Confirmed`,
          html: getPlayer2EmailHtml({
            teamName: input.teamName.trim(),
            teamId,
            leaderName: input.leader.fullName.trim(),
            player2Name: input.member.fullName.trim(),
            player2Phone: input.member.phone.trim(),
            player2CollegeId: input.member.collegeId.trim(),
            qrDataUrl,
            eventDate: settings.event_date,
            venue: settings.venue,
            reportingTime: settings.reporting_time,
          }),
        }),
      ]);
    } catch (e) {
      console.error("[Team Email Error]:", e);
    }

    const fullTeam: Team = {
      team_id: teamId,
      name: input.teamName.trim(),
      game: selectedGame,
      qr_token: qrToken,
      registration_status: "confirmed",
      check_in_status: "not_checked_in",
      members: [
        { role: "leader", full_name: input.leader.fullName.trim(), email: input.leader.email.trim(), phone: input.leader.phone.trim(), college_id: input.leader.collegeId.trim() },
        { role: "member", full_name: input.member.fullName.trim(), email: input.member.email.trim(), phone: input.member.phone.trim(), college_id: input.member.collegeId.trim() },
      ],
    };

    return { success: true, team: fullTeam, qrDataUrl };
  } catch (err: any) {
    console.error("Supabase register team network error:", err);
    return { success: false, error: err?.message || "Failed to complete team registration." };
  }
}

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

    sendEmail({
      to: input.email.trim(),
      subject: "Your Entry Ticket — Nova Forge Campus Carnival Pass",
      html: getAudienceEmailHtml({
        fullName: input.fullName.trim(),
        passId,
        phone: input.phone.trim(),
        collegeId: input.collegeId.trim(),
        qrDataUrl,
        eventDate: settings.event_date,
        venue: settings.venue,
        reportingTime: settings.reporting_time,
      }),
    });

    return { success: true, audience: newAud, qrDataUrl };
  };

  if (!supabase) {
    return registerAudienceInDevStore();
  }

  try {
    // 1. Check audience capacity limit
    const { count: audCount, error: countErr } = await supabase
      .from("audience_registrations")
      .select("id", { count: "exact", head: true })
      .neq("registration_status", "cancelled");

    if (!countErr && typeof audCount === "number" && audCount >= settings.audience_limit) {
      return { success: false, error: "Audience registrations are full." };
    }

    // 2. Try atomic RPC first
    const { data: rpcData, error: rpcErr } = await supabase.rpc("register_audience_atomic", {
      p_pass_id: passId,
      p_full_name: input.fullName.trim(),
      p_email: input.email.trim().toLowerCase(),
      p_phone: input.phone.trim(),
      p_college_id: input.collegeId.trim(),
      p_qr_token: qrToken,
    });

    let createdAudience = rpcData;

    if (rpcErr) {
      if (rpcErr.message && !rpcErr.message.includes("does not exist") && !rpcErr.message.includes("function") && rpcErr.code !== "42883") {
        return { success: false, error: rpcErr.message };
      }

      // Standard insert fallback
      const { data, error } = await supabase
        .from("audience_registrations")
        .insert({
          pass_id: passId,
          full_name: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          college_id: input.collegeId.trim(),
          qr_token: qrToken,
          registration_status: "confirmed",
          check_in_status: "not_checked_in",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return { success: false, error: "Email, Mobile number, or College ID is already registered." };
        }
        return { success: false, error: error.message || "Failed to save audience registration." };
      }

      createdAudience = data;
    }

    try {
      await sendEmail({
        to: input.email.trim(),
        subject: "Your Entry Ticket — Nova Forge Campus Carnival Pass",
        html: getAudienceEmailHtml({
          fullName: input.fullName.trim(),
          passId,
          phone: input.phone.trim(),
          collegeId: input.collegeId.trim(),
          qrDataUrl,
          eventDate: settings.event_date,
          venue: settings.venue,
          reportingTime: settings.reporting_time,
        }),
      });
    } catch (e) {
      console.error("[Audience Email Error]:", e);
    }

    return { success: true, audience: createdAudience as AudienceRegistration, qrDataUrl };
  } catch (err: any) {
    console.error("Supabase audience register network error:", err);
    return { success: false, error: err?.message || "Failed to complete audience registration." };
  }
}

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
          members: team.participants?.map((p: any) => ({
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
  } catch (err: any) {
    return { status: "INVALID", message: err.message || "Verification failed" };
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
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Undo Check-in (Strictly restricted to Admin role)
 */
export async function undoCheckIn(
  type: "participant" | "audience",
  id: string,
  userRole: AdminRole = "admin"
): Promise<{ success: boolean; error?: string }> {
  if (userRole !== "admin") {
    return { success: false, error: "Permission Denied: Only Admins can undo check-ins. Volunteers cannot undo." };
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
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 5. DASHBOARD STATS & MANAGEMENT QUERIES
// ==============================================================================
export async function getDashboardStats() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const totalTeams = devStore.teams.length;
    const confirmedTeams = devStore.teams.filter((t) => t.registration_status === "confirmed").length;
    const cancelledTeams = devStore.teams.filter((t) => t.registration_status === "cancelled").length;
    const checkedInTeams = devStore.teams.filter((t) => t.check_in_status === "checked_in").length;
    const totalParticipants = devStore.participants.length;

    const totalAudience = devStore.audience.length;
    const confirmedAudience = devStore.audience.filter((a) => a.registration_status === "confirmed").length;
    const cancelledAudience = devStore.audience.filter((a) => a.registration_status === "cancelled").length;
    const checkedInAudience = devStore.audience.filter((a) => a.check_in_status === "checked_in").length;

    const totalCheckedIn = checkedInTeams + checkedInAudience;
    const totalRegistrations = confirmedTeams + confirmedAudience;
    const settings = devStore.settings;

    const remainingTeamCapacity = Math.max(0, settings.participant_limit - confirmedTeams);
    const remainingAudienceCapacity = Math.max(0, settings.audience_limit - confirmedAudience);

    return {
      participant: {
        totalTeams,
        confirmedTeams,
        cancelledTeams,
        checkedInTeams,
        remainingCapacity: remainingTeamCapacity,
        limit: settings.participant_limit,
      },
      audience: {
        totalAudience,
        confirmedAudience,
        cancelledAudience,
        checkedInAudience,
        remainingCapacity: remainingAudienceCapacity,
        limit: settings.audience_limit,
      },
      // Backward-compatible fields
      totalTeams,
      totalParticipants,
      totalAudience,
      teamsCheckedIn: checkedInTeams,
      checkedInParticipants: checkedInTeams * 2,
      checkedInAudience,
      audienceCheckedIn: checkedInAudience,
      totalCheckedIn,
      pendingCheckIn: Math.max(0, totalRegistrations - totalCheckedIn),
      checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      participantCapacity: `${confirmedTeams} / ${settings.participant_limit} Teams`,
      audienceCapacity: `${confirmedAudience} / ${settings.audience_limit}`,
      settings,
    };
  }

  try {
    const [teamsRes, partsRes, audRes, settingsRes] = await Promise.all([
      supabase.from("teams").select("id, check_in_status, registration_status"),
      supabase.from("participants").select("id", { count: "exact", head: true }),
      supabase.from("audience_registrations").select("id, check_in_status, registration_status"),
      getEventSettings(),
    ]);

    const allTeams = teamsRes.data || [];
    const allAud = audRes.data || [];

    const totalTeams = allTeams.length;
    const confirmedTeams = allTeams.filter((t: any) => t.registration_status === "confirmed").length;
    const cancelledTeams = allTeams.filter((t: any) => t.registration_status === "cancelled").length;
    const checkedInTeams = allTeams.filter((t: any) => t.check_in_status === "checked_in").length;
    const totalParticipants = partsRes.count || confirmedTeams * 2;

    const totalAudience = allAud.length;
    const confirmedAudience = allAud.filter((a: any) => a.registration_status === "confirmed").length;
    const cancelledAudience = allAud.filter((a: any) => a.registration_status === "cancelled").length;
    const checkedInAudience = allAud.filter((a: any) => a.check_in_status === "checked_in").length;

    const totalCheckedIn = checkedInTeams + checkedInAudience;
    const totalRegistrations = confirmedTeams + confirmedAudience;
    const settings = settingsRes;

    const remainingTeamCapacity = Math.max(0, settings.participant_limit - confirmedTeams);
    const remainingAudienceCapacity = Math.max(0, settings.audience_limit - confirmedAudience);

    return {
      participant: {
        totalTeams,
        confirmedTeams,
        cancelledTeams,
        checkedInTeams,
        remainingCapacity: remainingTeamCapacity,
        limit: settings.participant_limit,
      },
      audience: {
        totalAudience,
        confirmedAudience,
        cancelledAudience,
        checkedInAudience,
        remainingCapacity: remainingAudienceCapacity,
        limit: settings.audience_limit,
      },
      // Backward-compatible fields
      totalTeams,
      totalParticipants,
      totalAudience,
      teamsCheckedIn: checkedInTeams,
      checkedInParticipants: checkedInTeams * 2,
      checkedInAudience,
      audienceCheckedIn: checkedInAudience,
      totalCheckedIn,
      pendingCheckIn: Math.max(0, totalRegistrations - totalCheckedIn),
      checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      participantCapacity: `${confirmedTeams} / ${settings.participant_limit} Teams`,
      audienceCapacity: `${confirmedAudience} / ${settings.audience_limit}`,
      settings,
    };
  } catch (err) {
    return {
      participant: { totalTeams: 0, confirmedTeams: 0, cancelledTeams: 0, checkedInTeams: 0, remainingCapacity: 0, limit: 250 },
      audience: { totalAudience: 0, confirmedAudience: 0, cancelledAudience: 0, checkedInAudience: 0, remainingCapacity: 0, limit: 1000 },
      totalTeams: 0,
      totalParticipants: 0,
      totalAudience: 0,
      teamsCheckedIn: 0,
      checkedInParticipants: 0,
      checkedInAudience: 0,
      audienceCheckedIn: 0,
      totalCheckedIn: 0,
      pendingCheckIn: 0,
      checkInRate: 0,
      participantCapacity: `0 / ${devStore.settings.participant_limit} Teams`,
      audienceCapacity: `0 / ${devStore.settings.audience_limit}`,
      settings: devStore.settings,
    };
  }
}

export async function getAllTeams() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return devStore.teams;
  }
  try {
    const { data, error } = await supabase.from("teams").select("*, participants(*)").order("created_at", { ascending: false });
    if (error || !data) return devStore.teams;
    return data;
  } catch (err) {
    return devStore.teams;
  }
}

export async function getAllAudience() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return devStore.audience;
  }
  try {
    const { data, error } = await supabase.from("audience_registrations").select("*").order("created_at", { ascending: false });
    if (error || !data) return devStore.audience;
    return data;
  } catch (err) {
    return devStore.audience;
  }
}

export async function getRecentAuditLogs(limit: number = 50) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return devStore.logs.slice(0, limit);
  }
  try {
    const { data, error } = await supabase
      .from("check_in_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);
    if (error || !data) return devStore.logs.slice(0, limit);
    return data;
  } catch (err) {
    return devStore.logs.slice(0, limit);
  }
}

export async function searchRegistrations(query: string) {
  const q = query.trim().toLowerCase();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const matchedTeams = devStore.teams.filter((t) => {
      const matchId = t.team_id.toLowerCase().includes(q);
      const matchName = t.name.toLowerCase().includes(q);
      const matchMember = t.members?.some(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.college_id.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
      return matchId || matchName || matchMember;
    });

    const matchedAudience = devStore.audience.filter((a) => {
      return (
        a.pass_id.toLowerCase().includes(q) ||
        a.full_name.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.college_id.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    });

    return { teams: matchedTeams, audience: matchedAudience };
  }

  try {
    const [teamsRes, audRes] = await Promise.all([
      supabase.from("teams").select("*, participants(*)"),
      supabase.from("audience_registrations").select("*"),
    ]);

    const allTeams = teamsRes.data || [];
    const allAud = audRes.data || [];

    const matchedTeams = allTeams.filter((t: any) => {
      const matchId = t.team_id?.toLowerCase().includes(q);
      const matchName = t.name?.toLowerCase().includes(q);
      const matchMember = t.participants?.some(
        (p: any) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          p.college_id?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      );
      return matchId || matchName || matchMember;
    });

    const matchedAudience = allAud.filter((a: any) => {
      return (
        a.pass_id?.toLowerCase().includes(q) ||
        a.full_name?.toLowerCase().includes(q) ||
        a.phone?.includes(q) ||
        a.college_id?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
      );
    });

    return { teams: matchedTeams, audience: matchedAudience };
  } catch (err) {
    return { teams: [], audience: [] };
  }
}

// ==============================================================================
// 6. CSV EXPORT FOR PHYSICAL PEN-AND-PAPER CHECK-IN SHEETS (NO QR TOKEN)
// ==============================================================================
export async function getTeamsCsv(): Promise<string> {
  const supabase = getSupabaseServerClient();
  let teams: any[] = [];

  if (!supabase) {
    teams = devStore.teams;
  } else {
    const { data } = await supabase.from("teams").select("*, participants(*)").order("created_at", { ascending: true });
    teams = data || [];
  }

  const headers = [
    "Team ID",
    "Team Name",
    "Player 1 Name",
    "Player 1 Email",
    "Player 1 Mobile",
    "Player 1 College ID",
    "Player 2 Name",
    "Player 2 Email",
    "Player 2 Mobile",
    "Player 2 College ID",
    "Registration Status",
    "Check-in Status",
    "Created At",
  ];

  const rows = teams.map((t) => {
    const members = t.members || t.participants || [];
    const leader = members.find((m: any) => m.role === "leader") || members[0] || {};
    const p2 = members.find((m: any) => m.role === "member") || members[1] || {};

    return [
      `"${t.team_id}"`,
      `"${t.name?.replace(/"/g, '""')}"`,
      `"${leader.full_name?.replace(/"/g, '""') || ""}"`,
      `"${leader.email || ""}"`,
      `"${leader.phone || ""}"`,
      `"${leader.college_id || ""}"`,
      `"${p2.full_name?.replace(/"/g, '""') || ""}"`,
      `"${p2.email || ""}"`,
      `"${p2.phone || ""}"`,
      `"${p2.college_id || ""}"`,
      `"${t.registration_status}"`,
      `"${t.check_in_status}"`,
      `"${new Date(t.created_at || Date.now()).toISOString()}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export async function getAudienceCsv(): Promise<string> {
  const supabase = getSupabaseServerClient();
  let audience: any[] = [];

  if (!supabase) {
    audience = devStore.audience;
  } else {
    const { data } = await supabase.from("audience_registrations").select("*").order("created_at", { ascending: true });
    audience = data || [];
  }

  const headers = [
    "Pass ID",
    "Name",
    "Email",
    "Mobile",
    "College ID",
    "Registration Status",
    "Check-in Status",
    "Created At",
  ];

  const rows = audience.map((a) => {
    return [
      `"${a.pass_id}"`,
      `"${a.full_name?.replace(/"/g, '""')}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.college_id}"`,
      `"${a.registration_status}"`,
      `"${a.check_in_status}"`,
      `"${new Date(a.created_at || Date.now()).toISOString()}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

