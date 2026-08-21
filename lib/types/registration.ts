export type RegistrationStatus = "pending" | "confirmed" | "cancelled";
export type CheckInStatus = "not_checked_in" | "checked_in";
export type AdminRole = "admin" | "volunteer";

export interface EventSettings {
  id: string;
  registration_open: boolean;
  participant_limit: number;
  audience_limit: number;
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
  email: string;
  full_name: string;
  role: AdminRole;
  created_at?: string;
}

export interface CheckInLog {
  id?: string;
  type: "participant" | "audience";
  reference_id: string; // team_id or pass_id
  action: "check_in" | "undo_check_in";
  method: "qr_scan" | "manual_search";
  scanned_by: string;
  timestamp: string;
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
