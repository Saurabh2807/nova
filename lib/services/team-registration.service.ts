import { getSupabaseServerClient, isProduction } from "@/lib/supabase/server";
import { Team } from "@/lib/types/registration";
import { devStore } from "@/lib/dev/dev-store";
import { getEventSettings } from "@/lib/services/event-settings.service";
import { generateTeamId, generateQrToken, generateQrDataUrl } from "@/lib/utils/id-generator";
import { getLeaderEmailHtml, getPlayer2EmailHtml } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/sender";

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
  statusCode?: number;
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
    if (isProduction) {
      return { success: false, error: "Database service unavailable in production.", statusCode: 503 };
    }
    return registerInDevStore();
  }

  // --- Production Supabase execution ---
  try {
    // 1. Check participant team capacity limit first (dynamic from DB settings)
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
      // If RPC threw a functional error (e.g. limit reached, duplicates), return it immediately
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
          email_notification_status: "pending",
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

    // 3. Email Delivery (Decoupled from Registration Success)
    // Registration is confirmed in database regardless of Google SMTP quota/network status
    let emailStatus = "pending";
    let emailError: string | null = null;

    try {
      const emailResults = await Promise.allSettled([
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

      const failedResult = emailResults.find(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
      );

      if (failedResult) {
        emailStatus = "failed";
        emailError =
          failedResult.status === "rejected"
            ? String(failedResult.reason?.message || "Google SMTP failed")
            : failedResult.value.error || "Google SMTP dispatch failed";
        console.warn(`[Team Registration] Email delivery failed (${emailError}), but database registration is confirmed.`);
      } else {
        emailStatus = "sent";
      }

      // Record email delivery status in database
      await supabase
        .from("teams")
        .update({
          email_notification_status: emailStatus,
          email_error: emailError,
          email_sent_at: new Date().toISOString(),
        })
        .eq("team_id", teamId);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.warn("[Team Registration] Google SMTP unexpected exception:", message);
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to complete team registration.";
    console.error("Supabase register team network error:", err);
    return { success: false, error: message };
  }
}

/**
 * Completely delete a team and all its participants.
 */
export async function deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
  const cleanId = teamId.trim();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const team = devStore.teams.find((t) => t.team_id === cleanId || t.id === cleanId);
    const resolvedTeamId = team ? team.team_id : cleanId;

    devStore.teams = devStore.teams.filter((t) => t.team_id !== resolvedTeamId && t.id !== resolvedTeamId);
    devStore.participants = devStore.participants.filter((p) => p.team_id !== resolvedTeamId);

    return { success: true };
  }

  try {
    // Delete participants first to maintain referential integrity, then delete team
    await supabase.from("participants").delete().eq("team_id", cleanId);
    const { error } = await supabase.from("teams").delete().eq("team_id", cleanId);

    if (error) {
      // Also attempt by primary key UUID
      const retry = await supabase.from("teams").delete().eq("id", cleanId);
      if (retry.error) throw retry.error;
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete team";
    console.error("Failed to delete team:", err);
    return { success: false, error: message };
  }
}

/**
 * Remove a participant by ID, email, or phone.
 * Since this is a 2-player squad tournament, removing a participant automatically deletes the squad/team.
 */
export async function deleteParticipant(identifier: string): Promise<{ success: boolean; error?: string }> {
  const clean = identifier.trim();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const p = devStore.participants.find(
      (pt) =>
        pt.email?.toLowerCase() === clean.toLowerCase() ||
        pt.phone === clean ||
        pt.team_id === clean ||
        (pt as any).id === clean
    );
    if (p && p.team_id) {
      return await deleteTeam(p.team_id);
    }
    return { success: true };
  }

  try {
    const { data } = await supabase
      .from("participants")
      .select("team_id")
      .or(`email.eq.${clean},phone.eq.${clean}`)
      .limit(1)
      .maybeSingle();

    if (data?.team_id) {
      return await deleteTeam(data.team_id);
    }

    await supabase.from("participants").delete().or(`email.eq.${clean},phone.eq.${clean}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete participant";
    return { success: false, error: message };
  }
}

