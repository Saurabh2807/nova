export type RegistrationStatus = "pending" | "confirmed" | "cancelled";
export type CheckInStatus = "not_checked_in" | "checked_in";
export type StaffRole = "super_admin" | "admin" | "core_member" | "volunteer";
export type AdminRole = StaffRole;

export interface EventSettings {
  id: string;
  registration_open: boolean;
  participant_limit: number;
  audience_limit: number;
  event_name?: string;
  event_date: string;
  venue: string;
  reporting_time: string;
}

export interface TeamMember {
  id?: string;
  team_id?: string;
  role: "leader" | "member";
  full_name: string;
  email: string;
  phone: string;
  college_id: string;
  created_at?: string;
}

export interface Team {
  id?: string;
  team_id: string; // Format: NF-BGMI-2026-8X4K7
  name: string;
  game: string; // "bgmi"
  qr_token: string; // Internal secure verification token
  registration_status: RegistrationStatus;
  check_in_status: CheckInStatus;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at?: string;
  members?: TeamMember[];
  participants?: TeamMember[];
}

export interface AudienceRegistration {
  id?: string;
  pass_id: string; // Format: NF-AUD-SA-Q9PL
  full_name: string;
  email: string;
  phone: string;
  college_id: string;
  qr_token: string;
  registration_status: RegistrationStatus;
  check_in_status: CheckInStatus;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  created_at?: string;
}

export interface AdminProfile {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface CheckInLog {
  id?: string;
  type?: "participant" | "audience" | "staff" | "event";
  reference_id: string; // team_id, pass_id, or staff email
  action: "check_in" | "undo_check_in" | "staff_created" | "staff_started" | "staff_stopped" | "staff_deleted" | "manual_search";
  method: "qr_scan" | "manual_search" | "system" | "admin_portal";
  scanned_by: string;
  actor_role?: StaffRole;
  reason?: string;
  timestamp: string;
}

export interface VolunteerSearchResult {
  type: "participant" | "audience";
  id: string; // team_id or pass_id
  name: string;
  registration_status: RegistrationStatus;
  check_in_status: CheckInStatus;
  checked_in_at?: string | null;
}

export interface StaffAccount {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface VerificationResult {
  status: "APPROVED" | "ALREADY_CHECKED_IN" | "REGISTRATION_CANCELLED" | "INVALID";
  type?: "participant" | "audience";
  data?: {
    id: string;
    name: string;
    title: string;
    roleOrGame: string;
    phone: string;
    collegeId: string;
    checkedInAt?: string | null;
    members?: {
      role: string;
      name: string;
      phone: string;
      collegeId: string;
      email: string;
    }[];
  };
  message: string;
}

export interface ParticipantPassData {
  teamName: string;
  teamId: string;
  leaderName: string;
  leaderPhone?: string;
  leaderEmail?: string;
  player2Name?: string;
  player2Phone?: string;
  player2Email?: string;
  qrDataUrl?: string;
  eventDate?: string;
  venue?: string;
  reportingTime?: string;
}

export interface AudiencePassData {
  passId: string;
  fullName: string;
  phone?: string;
  email?: string;
  collegeId?: string;
  qrDataUrl?: string;
  eventDate?: string;
  venue?: string;
  reportingTime?: string;
}
