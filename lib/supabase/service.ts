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
  const { data, error } = await supabase.from("event_settings").select("*").limit(1).single();
  if (error || !data) {
    return devStore.settings;
  }
  return data as EventSettings;
}

export async function updateEventSettings(newSettings: Partial<EventSettings>): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    Object.assign(devStore.settings, newSettings);
    return true;
  }
  const { error } = await supabase.from("event_settings").update(newSettings).neq("id", "00000000-0000-0000-0000-000000000000");
  return !error;
}

// ==============================================================================
// 2. PARTICIPANT BGMI TEAM REGISTRATION (2-Player Strict)
// ==============================================================================
export interface RegisterTeamInput {
  teamName: string;
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
  if (!settings.registration_open) {
    return { success: false, error: "Registrations are currently closed by the organizers." };
  }

  // Validate 10-digit mobile
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(input.leader.phone.trim()) || !phoneRegex.test(input.member.phone.trim())) {
    return { success: false, error: "Mobile number must be exactly 10 digits." };
  }

  // Validate distinct players within the team
  if (
    input.leader.email.trim().toLowerCase() === input.member.email.trim().toLowerCase() ||
    input.leader.phone.trim() === input.member.phone.trim() ||
    input.leader.collegeId.trim().toLowerCase() === input.member.collegeId.trim().toLowerCase()
  ) {
    return { success: false, error: "Player 1 and Player 2 cannot have the same Email, Phone, or College ID." };
  }

  const teamId = generateTeamId();
  const qrToken = generateQrToken("participant", teamId);
  const qrDataUrl = await generateQrDataUrl(qrToken);

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    // Check uniqueness in dev store
    const lowerName = input.teamName.trim().toLowerCase();
    if (devStore.teams.some((t) => t.name.toLowerCase() === lowerName)) {
      return { success: false, error: "This Team Name is already registered. Please choose another." };
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
      game: "bgmi",
      qr_token: qrToken,
      registration_status: "confirmed",
      check_in_status: "not_checked_in",
      created_at: new Date().toISOString(),
      members: [
        { role: "leader", full_name: input.leader.fullName.trim(), email: input.leader.email.trim(), phone: input.leader.phone.trim(), college_id: input.leader.collegeId.trim() },
        { role: "member", full_name: input.member.fullName.trim(), email: input.member.email.trim(), phone: input.member.phone.trim(), college_id: input.member.collegeId.trim() },
      ],
    };

    devStore.teams.unshift(newTeam);
    devStore.participants.push(
      { team_id: teamId, role: "leader", full_name: input.leader.fullName.trim(), email: input.leader.email.trim(), phone: input.leader.phone.trim(), college_id: input.leader.collegeId.trim(), created_at: new Date().toISOString() },
      { team_id: teamId, role: "member", full_name: input.member.fullName.trim(), email: input.member.email.trim(), phone: input.member.phone.trim(), college_id: input.member.collegeId.trim(), created_at: new Date().toISOString() }
    );

    // Send asynchronous transactional emails
    sendEmail({
      to: input.leader.email.trim(),
      subject: "Your Registration is Confirmed — Nova Forge BGMI Team Pass",
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
      subject: "You're Registered — Nova Forge BGMI Team Confirmed",
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
  }

  // --- Production Supabase execution ---
  try {
    // 1. Insert team
    const { data: teamData, error: teamErr } = await supabase
      .from("teams")
      .insert({
        team_id: teamId,
        name: input.teamName.trim(),
        game: "bgmi",
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
      return { success: false, error: teamErr.message };
    }

    // 2. Insert participants (database trigger enforces exactly 2 players)
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
      // Rollback team on error
      await supabase.from("teams").delete().eq("team_id", teamId);
      if (partErr.code === "23505") {
        return { success: false, error: "One of the emails, phone numbers, or college IDs is already registered." };
      }
      return { success: false, error: partErr.message };
    }

    // Send emails
    sendEmail({
      to: input.leader.email.trim(),
      subject: "Your Registration is Confirmed — Nova Forge BGMI Team Pass",
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
      subject: "You're Registered — Nova Forge BGMI Team Confirmed",
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

    const fullTeam: Team = {
      ...teamData,
      members: [
        { role: "leader", full_name: input.leader.fullName.trim(), email: input.leader.email.trim(), phone: input.leader.phone.trim(), college_id: input.leader.collegeId.trim() },
        { role: "member", full_name: input.member.fullName.trim(), email: input.member.email.trim(), phone: input.member.phone.trim(), college_id: input.member.collegeId.trim() },
      ],
    };

    return { success: true, team: fullTeam, qrDataUrl };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to register team." };
  }
}

// ==============================================================================
// 3. AUDIENCE REGISTRATION
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
  if (!settings.registration_open) {
    return { success: false, error: "Audience registrations are currently closed." };
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(input.phone.trim())) {
    return { success: false, error: "Mobile number must be exactly 10 digits." };
  }

  const passId = generateAudiencePassId();
  const qrToken = generateQrToken("audience", passId);
  const qrDataUrl = await generateQrDataUrl(qrToken);

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const lowerEmail = input.email.trim().toLowerCase();
    const phone = input.phone.trim();
    const lowerCollege = input.collegeId.trim().toLowerCase();

    if (devStore.audience.some((a) => a.email.toLowerCase() === lowerEmail)) {
      return { success: false, error: "This Email is already registered for an Audience pass." };
    }
    if (devStore.audience.some((a) => a.phone === phone)) {
      return { success: false, error: "This Mobile number is already registered for an Audience pass." };
    }
    if (devStore.audience.some((a) => a.college_id.toLowerCase() === lowerCollege)) {
      return { success: false, error: "This College ID is already registered for an Audience pass." };
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
  }

  try {
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
      return { success: false, error: error.message };
    }

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

    return { success: true, audience: data as AudienceRegistration, qrDataUrl };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to register audience pass." };
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
// 5. DASHBOARD STATS & SEARCH
// ==============================================================================
export async function getDashboardStats() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const totalTeams = devStore.teams.length;
    const totalParticipants = devStore.participants.length;
    const totalAudience = devStore.audience.length;
    const teamsCheckedIn = devStore.teams.filter((t) => t.check_in_status === "checked_in").length;
    const audienceCheckedIn = devStore.audience.filter((a) => a.check_in_status === "checked_in").length;
    const totalCheckedIn = teamsCheckedIn + audienceCheckedIn;
    const totalRegistrations = totalTeams + totalAudience;

    return {
      totalTeams,
      totalParticipants,
      totalAudience,
      teamsCheckedIn,
      audienceCheckedIn,
      totalCheckedIn,
      pendingCheckIn: totalRegistrations - totalCheckedIn,
      checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      settings: devStore.settings,
    };
  }

  try {
    const [teamsRes, partsRes, audRes, settingsRes] = await Promise.all([
      supabase.from("teams").select("id, check_in_status"),
      supabase.from("participants").select("id", { count: "exact", head: true }),
      supabase.from("audience_registrations").select("id, check_in_status"),
      getEventSettings(),
    ]);

    const teams = teamsRes.data || [];
    const audience = audRes.data || [];
    const totalTeams = teams.length;
    const totalParticipants = partsRes.count || totalTeams * 2;
    const totalAudience = audience.length;
    const teamsCheckedIn = teams.filter((t) => t.check_in_status === "checked_in").length;
    const audienceCheckedIn = audience.filter((a) => a.check_in_status === "checked_in").length;
    const totalCheckedIn = teamsCheckedIn + audienceCheckedIn;
    const totalRegistrations = totalTeams + totalAudience;

    return {
      totalTeams,
      totalParticipants,
      totalAudience,
      teamsCheckedIn,
      audienceCheckedIn,
      totalCheckedIn,
      pendingCheckIn: totalRegistrations - totalCheckedIn,
      checkInRate: totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
      settings: settingsRes,
    };
  } catch (err) {
    return {
      totalTeams: 0,
      totalParticipants: 0,
      totalAudience: 0,
      teamsCheckedIn: 0,
      audienceCheckedIn: 0,
      totalCheckedIn: 0,
      pendingCheckIn: 0,
      checkInRate: 0,
      settings: devStore.settings,
    };
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
// 6. CSV EXPORT FOR PHYSICAL PEN-AND-PAPER CHECK-IN SHEETS
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
    "S.No",
    "Team ID",
    "Team Name",
    "Leader Name",
    "Leader Mobile",
    "Leader College ID",
    "Player 2 Name",
    "Player 2 Mobile",
    "Player 2 College ID",
    "Registration Time",
    "Check-in Status",
    "Check-in Time",
    "Physical Signature / Desk Verification",
  ];

  const rows = teams.map((t, index) => {
    const members = t.members || t.participants || [];
    const leader = members.find((m: any) => m.role === "leader") || members[0] || {};
    const p2 = members.find((m: any) => m.role === "member") || members[1] || {};

    return [
      index + 1,
      `"${t.team_id}"`,
      `"${t.name?.replace(/"/g, '""')}"`,
      `"${leader.full_name?.replace(/"/g, '""') || ""}"`,
      `"${leader.phone || ""}"`,
      `"${leader.college_id || ""}"`,
      `"${p2.full_name?.replace(/"/g, '""') || ""}"`,
      `"${p2.phone || ""}"`,
      `"${p2.college_id || ""}"`,
      `"${new Date(t.created_at || Date.now()).toLocaleString()}"`,
      `"${t.check_in_status === "checked_in" ? "CHECKED IN" : "PENDING"}"`,
      `"${t.checked_in_at ? new Date(t.checked_in_at).toLocaleTimeString() : "-"}"`,
      `"[   ]"`,
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
    "S.No",
    "Pass ID",
    "Full Name",
    "Mobile Number",
    "College ID / Scholar No",
    "Email Address",
    "Registration Time",
    "Check-in Status",
    "Check-in Time",
    "Physical Signature / Desk Verification",
  ];

  const rows = audience.map((a, index) => {
    return [
      index + 1,
      `"${a.pass_id}"`,
      `"${a.full_name?.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.college_id}"`,
      `"${a.email}"`,
      `"${new Date(a.created_at || Date.now()).toLocaleString()}"`,
      `"${a.check_in_status === "checked_in" ? "CHECKED IN" : "PENDING"}"`,
      `"${a.checked_in_at ? new Date(a.checked_in_at).toLocaleTimeString() : "-"}"`,
      `"[   ]"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
