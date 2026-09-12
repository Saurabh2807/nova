/**
 * Compatibility Facade for Nova Forge Backend Services.
 *
 * This module re-exports domain services decomposed into lib/services/*
 * to preserve 100% backward compatibility for all API route handlers and callers.
 */

// 1. Event Settings Service
export {
  getEventSettings,
  updateEventSettings,
} from "@/lib/services/event-settings.service";

// 2. Team Registration Service
export {
  type RegisterTeamInput,
  registerBgmiTeam,
} from "@/lib/services/team-registration.service";

// 3. Audience Registration Service
export {
  type RegisterAudienceInput,
  registerAudience,
} from "@/lib/services/audience-registration.service";

// 4. QR Verification & Check-in Service
export {
  verifyTokenOrId,
  performCheckIn,
  undoCheckIn,
} from "@/lib/services/checkin.service";

// 5. Dashboard Statistics Service
export {
  getDashboardStats,
} from "@/lib/services/stats.service";

// 6. Registration Query Service
export {
  getAllTeams,
  getAllAudience,
  getRecentAuditLogs,
  searchRegistrations,
} from "@/lib/services/registration-query.service";

// 7. CSV Export Service
export {
  getTeamsCsv,
  getAudienceCsv,
} from "@/lib/services/export.service";

// 8. Secure Pass Lookup & Resend Email Service
export {
  findPassSecurely,
  findPassByQuery,
  resendConfirmationEmail,
} from "@/lib/services/pass-lookup.service";
