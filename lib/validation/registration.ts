export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PHONE_REGEX = /^\d{10}$/;

export function normalizeEmail(email?: unknown): string {
  return String(email ?? "").trim().toLowerCase();
}

export function normalizePhone(phone?: unknown): string {
  return String(phone ?? "").trim();
}

export function normalizeName(name?: unknown): string {
  return String(name ?? "").trim();
}

export function normalizeCollegeId(collegeId?: unknown): string {
  return String(collegeId ?? "").trim();
}

export function normalizeTeamName(teamName?: unknown): string {
  return String(teamName ?? "").trim();
}

export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.length <= 254 && EMAIL_REGEX.test(email);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export function isValidName(name: string): boolean {
  return name.length >= 2 && name.length <= 100;
}

export function isValidCollegeId(collegeId: string): boolean {
  return collegeId.length >= 2 && collegeId.length <= 50;
}

export function isValidTeamName(teamName: string): boolean {
  return teamName.length >= 2 && teamName.length <= 100;
}

export interface ValidatedParticipantData {
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

export type ParticipantValidationResult =
  | { success: true; data: ValidatedParticipantData }
  | { success: false; error: string };

export interface RawParticipantPayload {
  teamName?: string;
  leader?: {
    fullName?: string;
    email?: string;
    phone?: string;
    collegeId?: string;
  };
  member?: {
    fullName?: string;
    email?: string;
    phone?: string;
    collegeId?: string;
  };
}

/**
 * Validates and normalizes HTTP input for participant team registration.
 * Preserves exact error messages required by existing test suites and UI.
 */
export function validateParticipantInput(body: Record<string, unknown> | null | undefined): ParticipantValidationResult {
  const { teamName, leader, member } = (body || {}) as RawParticipantPayload;

  if (!teamName || !leader || !member) {
    return { success: false, error: "All team and player fields are required." };
  }

  const cleanTeamName = normalizeTeamName(teamName);
  if (!isValidTeamName(cleanTeamName)) {
    return { success: false, error: "Team Name must be between 2 and 100 characters." };
  }

  const leaderName = normalizeName(leader.fullName);
  const leaderEmail = normalizeEmail(leader.email);
  const leaderPhone = normalizePhone(leader.phone);
  const leaderCollegeId = normalizeCollegeId(leader.collegeId);

  const memberName = normalizeName(member.fullName);
  const memberEmail = normalizeEmail(member.email);
  const memberPhone = normalizePhone(member.phone);
  const memberCollegeId = normalizeCollegeId(member.collegeId);

  if (
    !leaderName ||
    !leaderEmail ||
    !leaderPhone ||
    !leaderCollegeId ||
    !memberName ||
    !memberEmail ||
    !memberPhone ||
    !memberCollegeId
  ) {
    return { success: false, error: "All fields for Player 1 and Player 2 are mandatory." };
  }

  if (leaderName.length > 100 || memberName.length > 100) {
    return { success: false, error: "Player names must be under 100 characters." };
  }

  if (!isValidEmail(leaderEmail) || !isValidEmail(memberEmail)) {
    return { success: false, error: "Please enter valid email addresses." };
  }

  if (!isValidPhone(leaderPhone) || !isValidPhone(memberPhone)) {
    return { success: false, error: "Mobile numbers must be exactly 10 digits." };
  }

  if (!isValidCollegeId(leaderCollegeId) || !isValidCollegeId(memberCollegeId)) {
    return { success: false, error: "College ID must be between 2 and 50 characters." };
  }

  return {
    success: true,
    data: {
      teamName: cleanTeamName,
      leader: {
        fullName: leaderName,
        email: leaderEmail,
        phone: leaderPhone,
        collegeId: leaderCollegeId,
      },
      member: {
        fullName: memberName,
        email: memberEmail,
        phone: memberPhone,
        collegeId: memberCollegeId,
      },
    },
  };
}

export interface ValidatedAudienceData {
  fullName: string;
  email: string;
  phone: string;
  collegeId: string;
}

export type AudienceValidationResult =
  | { success: true; data: ValidatedAudienceData }
  | { success: false; error: string };

export interface RawAudiencePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  collegeId?: string;
}

export function validateAudienceInput(body: Record<string, unknown> | null | undefined): AudienceValidationResult {
  const { fullName, email, phone, collegeId } = (body || {}) as RawAudiencePayload;

  if (!fullName || !email || !phone || !collegeId) {
    return { success: false, error: "All fields are mandatory." };
  }

  const cleanName = normalizeName(fullName);
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);
  const cleanCollegeId = normalizeCollegeId(collegeId);

  if (!isValidName(cleanName)) {
    return { success: false, error: "Name must be between 2 and 100 characters." };
  }

  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!isValidPhone(cleanPhone)) {
    return { success: false, error: "Mobile number must be exactly 10 digits." };
  }

  if (!isValidCollegeId(cleanCollegeId)) {
    return { success: false, error: "College ID must be between 2 and 50 characters." };
  }

  return {
    success: true,
    data: {
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      collegeId: cleanCollegeId,
    },
  };
}
