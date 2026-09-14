import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getLeaderEmailHtml, getPlayer2EmailHtml, getAudienceEmailHtml } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/sender";
import { generateQrToken, generateQrDataUrl } from "@/lib/utils/id-generator";
import { devStore } from "@/lib/dev/dev-store";
import { getEventSettings } from "./event-settings.service";
import { Team, AudienceRegistration, TeamMember } from "@/lib/types/registration";

// ==============================================================================
// 7. SECURE PASS LOOKUP & RESEND EMAIL (Self-service attendee recovery)
// ==============================================================================

/**
 * Secure Pass Lookup: Requires two factors to verify ownership:
 * 1. Registered Email (email)
 * 2. Pass ID / Team ID OR registered mobile number (query)
 * Prevents enumeration, arbitrary browsing, and exposure of unmasked teammate PII.
 */
export async function findPassSecurely({ email, query }: { email: string; query: string }) {
  const userEmail = email.trim().toLowerCase();
  const lookupQuery = query.trim().toUpperCase();

  if (!userEmail || !lookupQuery) {
    return { success: false, error: "Both your registered Email and Pass ID or Mobile Number are required." };
  }

  const supabase = getSupabaseServerClient();
  const settings = await getEventSettings();

  if (!supabase) {
    // 1. Check devStore teams
    const team = devStore.teams.find((t) => {
      const hasEmail = t.members?.some((m) => m.email.toLowerCase() === userEmail);
      const matchesQuery =
        t.team_id.toUpperCase() === lookupQuery ||
        t.members?.some((m) => m.phone === lookupQuery || m.college_id.toLowerCase() === lookupQuery.toLowerCase());
      return hasEmail && matchesQuery;
    });

    if (team) {
      const requester = team.members?.find((m) => m.email.toLowerCase() === userEmail) || team.members?.[0];
      const teammate = team.members?.find((m) => m.email.toLowerCase() !== userEmail);
      const qrDataUrl = await generateQrDataUrl(team.qr_token || generateQrToken("participant", team.team_id));

      return {
        success: true,
        type: "participant" as const,
        pass: {
          teamId: team.team_id,
          teamName: team.name,
          leaderName: requester?.full_name || "",
          leaderEmail: requester?.email || "",
          player2Name: teammate ? teammate.full_name : "",
          registrationStatus: team.registration_status,
          checkInStatus: team.check_in_status,
          qrDataUrl,
          eventDate: settings.event_date,
          venue: settings.venue,
          reportingTime: settings.reporting_time,
        },
      };
    }

    // 2. Check devStore audience
    const aud = devStore.audience.find(
      (a) =>
        a.email.toLowerCase() === userEmail &&
        (a.pass_id.toUpperCase() === lookupQuery || a.phone === lookupQuery)
    );

    if (aud) {
      const qrDataUrl = await generateQrDataUrl(aud.qr_token || generateQrToken("audience", aud.pass_id));
      return {
        success: true,
        type: "audience" as const,
        pass: {
          passId: aud.pass_id,
          fullName: aud.full_name,
          email: aud.email,
          registrationStatus: aud.registration_status,
          checkInStatus: aud.check_in_status,
          qrDataUrl,
          eventDate: settings.event_date,
          venue: settings.venue,
          reportingTime: settings.reporting_time,
        },
      };
    }

    return { success: false, error: "No matching registration found. Please verify your Email and Pass ID or Mobile." };
  }

  try {
    // 1. Search in participants by verified email + (pass_id / team_id OR phone)
    const { data: matchedParticipants } = await supabase
      .from("participants")
      .select("team_id, role, full_name, email, phone")
      .eq("email", userEmail);

    if (matchedParticipants && matchedParticipants.length > 0) {
      for (const p of matchedParticipants) {
        // Query must match team_id or the participant's phone
        if (p.team_id.toUpperCase() === lookupQuery || p.phone === lookupQuery) {
          const { data: team } = await supabase
            .from("teams")
            .select("*, participants(role, full_name, email)")
            .eq("team_id", p.team_id)
            .maybeSingle();

          if (team) {
            const qrDataUrl = await generateQrDataUrl(team.qr_token || generateQrToken("participant", team.team_id));
            const participants = (team.participants || []) as { email?: string; full_name?: string }[];
            const currentMember = participants.find((m) => m.email?.toLowerCase() === userEmail);
            const otherMember = participants.find((m) => m.email?.toLowerCase() !== userEmail);

            return {
              success: true,
              type: "participant" as const,
              pass: {
                teamId: team.team_id,
                teamName: team.name,
                leaderName: currentMember?.full_name || "",
                leaderEmail: userEmail,
                player2Name: otherMember ? otherMember.full_name : "",
                registrationStatus: team.registration_status,
                checkInStatus: team.check_in_status,
                qrDataUrl,
                eventDate: settings.event_date,
                venue: settings.venue,
                reportingTime: settings.reporting_time,
              },
            };
          }
        }
      }
    }

    // 2. Search in audience registrations by verified email + (pass_id OR phone)
    const { data: audData } = await supabase
      .from("audience_registrations")
      .select("pass_id, full_name, email, phone, qr_token, registration_status, check_in_status")
      .eq("email", userEmail)
      .maybeSingle();

    if (audData) {
      if (audData.pass_id.toUpperCase() === lookupQuery || audData.phone === lookupQuery) {
        const qrDataUrl = await generateQrDataUrl(audData.qr_token || generateQrToken("audience", audData.pass_id));
        return {
          success: true,
          type: "audience" as const,
          pass: {
            passId: audData.pass_id,
            fullName: audData.full_name,
            email: audData.email,
            registrationStatus: audData.registration_status,
            checkInStatus: audData.check_in_status,
            qrDataUrl,
            eventDate: settings.event_date,
            venue: settings.venue,
            reportingTime: settings.reporting_time,
          },
        };
      }
    }

    return {
      success: false,
      error: "No pass found matching both the provided Email and Pass ID / Mobile Number.",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to lookup pass.";
    return { success: false, error: message };
  }
}

// Backward-compatible wrapper
export async function findPassByQuery(query: string, email?: string) {
  if (email) {
    return findPassSecurely({ email, query });
  }
  return {
    success: false,
    error: "Pass lookup requires both your registered Email and your Pass ID or Mobile Number.",
  };
}

export async function resendConfirmationEmail(type: "participant" | "audience", id: string, targetEmail?: string) {
  const supabase = getSupabaseServerClient();
  const settings = await getEventSettings();

  if (type === "participant") {
    let team: (Team & { participants?: TeamMember[] }) | null = null;
    if (!supabase) {
      team = devStore.teams.find((t) => t.team_id === id) || null;
    } else {
      const { data } = await supabase.from("teams").select("*, participants(*)").eq("team_id", id).maybeSingle();
      team = data as (Team & { participants?: TeamMember[] }) | null;
    }

    if (!team) return { success: false, error: "Team not found." };

    const members = team.members || team.participants || [];
    const leader = members.find((m) => m.role === "leader") || members[0] || ({} as Partial<TeamMember>);
    const member = members.find((m) => m.role === "member") || members[1] || ({} as Partial<TeamMember>);
    const qrDataUrl = await generateQrDataUrl(team.qr_token || generateQrToken("participant", team.team_id));

    const promises: Promise<unknown>[] = [];

    // If targetEmail specified, send to that specific recipient; otherwise send to both
    if (!targetEmail || targetEmail.toLowerCase() === leader.email?.toLowerCase()) {
      if (leader.email) {
        promises.push(
          sendEmail({
            to: leader.email,
            subject: `[Pass Copy] Your Registration Pass — Nova Forge BGMI Squad`,
            html: getLeaderEmailHtml({
              teamName: team.name,
              teamId: team.team_id,
              leaderName: leader.full_name || "",
              leaderPhone: leader.phone || "",
              leaderCollegeId: leader.college_id || "",
              player2Name: member.full_name || "",
              player2Phone: member.phone || "",
              player2CollegeId: member.college_id || "",
              qrDataUrl,
              eventDate: settings.event_date,
              venue: settings.venue,
              reportingTime: settings.reporting_time,
            }),
          })
        );
      }
    }

    if (!targetEmail || targetEmail.toLowerCase() === member.email?.toLowerCase()) {
      if (member.email) {
        promises.push(
          sendEmail({
            to: member.email,
            subject: `[Pass Copy] You're Registered — Nova Forge BGMI Duo Squad`,
            html: getPlayer2EmailHtml({
              teamName: team.name,
              teamId: team.team_id,
              leaderName: leader.full_name || "",
              player2Name: member.full_name || "",
              player2Phone: member.phone || "",
              player2CollegeId: member.college_id || "",
              qrDataUrl,
              eventDate: settings.event_date,
              venue: settings.venue,
              reportingTime: settings.reporting_time,
            }),
          })
        );
      }
    }

    await Promise.allSettled(promises);
    return { success: true, message: "Confirmation pass re-sent successfully!" };
  } else {
    let aud: AudienceRegistration | null = null;
    if (!supabase) {
      aud = devStore.audience.find((a) => a.pass_id === id) || null;
    } else {
      const { data } = await supabase.from("audience_registrations").select("*").eq("pass_id", id).maybeSingle();
      aud = data as AudienceRegistration | null;
    }

    if (!aud) return { success: false, error: "Audience pass not found." };

    const qrDataUrl = await generateQrDataUrl(aud.qr_token || generateQrToken("audience", aud.pass_id));
    const recipient = targetEmail || aud.email;

    if (recipient) {
      await sendEmail({
        to: recipient,
        subject: "[Pass Copy] Your Entry Ticket — Campus Unleashed Pass",
        html: getAudienceEmailHtml({
          fullName: aud.full_name,
          passId: aud.pass_id,
          phone: aud.phone,
          collegeId: aud.college_id,
          qrDataUrl,
          eventDate: settings.event_date,
          venue: settings.venue,
          reportingTime: settings.reporting_time,
        }),
      });
    }

    return { success: true, message: "Confirmation pass re-sent successfully to your email!" };
  }
}
