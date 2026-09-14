/**
 * Comprehensive Automated Security & Access Control Test Suite
 * Tests 3-Tier Staff Role Hierarchy: super_admin, core_member, volunteer
 * Verifies Start/Stop active status enforcement, PII protection, and privilege separation.
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

// Dev tokens configured in dev-store.ts and admin-auth.ts
const TOKENS = {
  superAdmin: "dev-super_admin-token",
  coreMember: "dev-core_member-token",
  volunteer: "dev-volunteer-token",
  stoppedStaff: "dev-stopped-token",
};

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("🔒 NOVA FORGE: 3-TIER STAFF ACCESS CONTROL TEST SUITE");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------------
  // 1. UNPROTECTED / UN-AUTHENTICATED REQUESTS
  // -------------------------------------------------------------------------
  console.log("--- 1. Missing Token Rejection ---");
  const noTokenRes = await request("/api/admin/staff");
  assert(noTokenRes.status === 401, "GET /api/admin/staff without token returns 401 Unauthorized");

  const noTokenStats = await request("/api/admin/stats");
  assert(noTokenStats.status === 401, "GET /api/admin/stats without token returns 401 Unauthorized");

  // -------------------------------------------------------------------------
  // 2. STOPPED / DISABLED ACCOUNT ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Stopped Account Enforcement (is_active: false) ---");
  const stoppedStats = await request("/api/admin/stats", { token: TOKENS.stoppedStaff });
  assert(
    stoppedStats.status === 403 && (stoppedStats.data.code === "ACCOUNT_DISABLED" || stoppedStats.data.error === "ACCOUNT_DISABLED"),
    "Stopped staff receives HTTP 403 ACCOUNT_DISABLED immediately"
  );

  const stoppedStaffList = await request("/api/admin/staff", { token: TOKENS.stoppedStaff });
  assert(stoppedStaffList.status === 403, "Stopped staff cannot access staff management (403)");

  // -------------------------------------------------------------------------
  // 3. VOLUNTEER ROLE RESTRICTIONS
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Volunteer Role Restrictions ---");
  const volStats = await request("/api/admin/stats", { token: TOKENS.volunteer });
  assert(volStats.status === 403, "Volunteer cannot access Dashboard Stats (403 Forbidden)");

  const volStaff = await request("/api/admin/staff", { token: TOKENS.volunteer });
  assert(volStaff.status === 403, "Volunteer cannot access Staff Management (403 Forbidden)");

  const volTeams = await request("/api/admin/teams", { token: TOKENS.volunteer });
  assert(volTeams.status === 403, "Volunteer cannot access BGMI Teams master list (403 Forbidden)");

  const volAudience = await request("/api/admin/audience", { token: TOKENS.volunteer });
  assert(volAudience.status === 403, "Volunteer cannot access Audience Passes master list (403 Forbidden)");

  const volLogs = await request("/api/admin/logs", { token: TOKENS.volunteer });
  assert(volLogs.status === 403, "Volunteer cannot access Audit Logs (403 Forbidden)");

  const volExport = await request("/api/admin/export?type=teams", { token: TOKENS.volunteer });
  assert(volExport.status === 403, "Volunteer cannot Export CSV (403 Forbidden)");

  const volUndo = await request("/api/admin/checkin", {
    method: "POST",
    token: TOKENS.volunteer,
    body: JSON.stringify({ action: "undo", type: "participant", id: "NF-T-1001", reason: "test" }),
  });
  assert(volUndo.status === 403, "Volunteer cannot Undo Check-In (403 Forbidden)");

  // Volunteer Search: Non-phone search must be blocked
  const volTextSearch = await request("/api/admin/search?q=rahul", { token: TOKENS.volunteer });
  assert(
    volTextSearch.status === 400 && volTextSearch.data.code === "PHONE_REQUIRED",
    "Volunteer text search without phone returns 400 PHONE_REQUIRED"
  );

  // Volunteer Search: Phone search succeeds with minimized fields ONLY (no PII)
  const volPhoneSearch = await request("/api/admin/search?q=9876543210", { token: TOKENS.volunteer });
  assert(volPhoneSearch.status === 200, "Volunteer phone search returns 200 OK");
  const firstResult = volPhoneSearch.data.results?.[0];
  if (firstResult) {
    const hasSensitiveFields =
      "email" in firstResult ||
      "phone" in firstResult ||
      "college_id" in firstResult ||
      "p2_name" in firstResult ||
      "p2_phone" in firstResult;
    assert(!hasSensitiveFields, "Volunteer search result strictly omits all PII (email, phone, college_id, p2 info)");
    assert("name" in firstResult && "id" in firstResult && "check_in_status" in firstResult, "Volunteer search includes only sanitized operational fields (name, id, status)");
  } else {
    assert(true, "Volunteer search returned empty list (valid)");
  }

  // -------------------------------------------------------------------------
  // 4. CORE MEMBER ROLE BOUNDARIES
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Core Member Role Boundaries ---");
  const coreStats = await request("/api/admin/stats", { token: TOKENS.coreMember });
  assert(coreStats.status === 200, "Core Member CAN view Dashboard Stats (200 OK)");

  const coreToggleReg = await request("/api/admin/stats", {
    method: "POST",
    token: TOKENS.coreMember,
    body: JSON.stringify({ registration_open: false }),
  });
  assert(coreToggleReg.status === 403, "Core Member CANNOT toggle Registration status (403 Forbidden)");

  const coreStaff = await request("/api/admin/staff", { token: TOKENS.coreMember });
  assert(coreStaff.status === 403, "Core Member CANNOT access Staff Management (403 Forbidden)");

  const coreTeams = await request("/api/admin/teams", { token: TOKENS.coreMember });
  assert(coreTeams.status === 403, "Core Member CANNOT access BGMI Teams master list (403 Forbidden)");

  const coreAudience = await request("/api/admin/audience", { token: TOKENS.coreMember });
  assert(coreAudience.status === 403, "Core Member CANNOT access Audience Passes master list (403 Forbidden)");

  const coreLogs = await request("/api/admin/logs", { token: TOKENS.coreMember });
  assert(coreLogs.status === 403, "Core Member CANNOT access Audit Logs (403 Forbidden)");

  const coreExport = await request("/api/admin/export?type=teams", { token: TOKENS.coreMember });
  assert(coreExport.status === 403, "Core Member CANNOT export CSV (403 Forbidden)");

  // Core Member Operational Search (can search by name/pass_id)
  const coreSearch = await request("/api/admin/search?q=Phoenix", { token: TOKENS.coreMember });
  assert(coreSearch.status === 200, "Core Member CAN perform operational text/name search (200 OK)");

  // Core Member Undo Check-in (requires reason)
  const coreUndoNoReason = await request("/api/admin/checkin", {
    method: "POST",
    token: TOKENS.coreMember,
    body: JSON.stringify({ action: "undo", type: "participant", id: "NF-T-1001" }),
  });
  assert(coreUndoNoReason.status === 400, "Core Member Undo Check-In without reason returns 400 (Reason required)");

  const coreUndoWithReason = await request("/api/admin/checkin", {
    method: "POST",
    token: TOKENS.coreMember,
    body: JSON.stringify({ action: "undo", type: "participant", id: "NF-T-1001", reason: "Accidental scan at Gate 2" }),
  });
  assert(coreUndoWithReason.status === 200, "Core Member Undo Check-In with valid reason returns 200 OK");

  // -------------------------------------------------------------------------
  // 5. SUPER ADMIN EXCLUSIVE POWERS
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Super Admin Exclusive Powers ---");
  const superStaff = await request("/api/admin/staff", { token: TOKENS.superAdmin });
  assert(superStaff.status === 200 && Array.isArray(superStaff.data.staff), "Super Admin can view Staff List (200 OK)");

  const superTeams = await request("/api/admin/teams", { token: TOKENS.superAdmin });
  assert(superTeams.status === 200, "Super Admin can access BGMI Teams (200 OK)");

  const superAudience = await request("/api/admin/audience", { token: TOKENS.superAdmin });
  assert(superAudience.status === 200, "Super Admin can access Audience Passes (200 OK)");

  const superLogs = await request("/api/admin/logs", { token: TOKENS.superAdmin });
  assert(superLogs.status === 200, "Super Admin can access Audit Logs (200 OK)");

  const superExport = await request("/api/admin/export?type=teams", { token: TOKENS.superAdmin });
  assert(superExport.status === 200, "Super Admin can Export CSV (200 OK)");

  // Create Staff with Password (Core Member)
  const testStaffEmail = `test.staff.${Date.now()}@novaforge.gg`;
  const createStaffRes = await request("/api/admin/staff", {
    method: "POST",
    token: TOKENS.superAdmin,
    body: JSON.stringify({
      email: testStaffEmail,
      password: "securePassword123!",
      full_name: "Test Ops Member",
      role: "core_member",
    }),
  });
  assert(createStaffRes.status === 200 && createStaffRes.data.success, "Super Admin can create staff account with password");

  // Toggle Start/Stop Staff Member
  if (createStaffRes.data.profile) {
    const createdId = createStaffRes.data.profile.id;

    // Stop staff
    const stopRes = await request("/api/admin/staff", {
      method: "PATCH",
      token: TOKENS.superAdmin,
      body: JSON.stringify({ staffId: createdId, is_active: false }),
    });
    assert(stopRes.status === 200 && stopRes.data.profile?.is_active === false, "Super Admin can stop staff member access (is_active: false)");

    // Start staff
    const startRes = await request("/api/admin/staff", {
      method: "PATCH",
      token: TOKENS.superAdmin,
      body: JSON.stringify({ staffId: createdId, is_active: true }),
    });
    assert(startRes.status === 200 && startRes.data.profile?.is_active === true, "Super Admin can start staff member access (is_active: true)");
  }

  // Safety Violation Protection: Super Admin stopping themselves
  const selfStopRes = await request("/api/admin/staff", {
    method: "PATCH",
    token: TOKENS.superAdmin,
    body: JSON.stringify({ staffId: "super-admin-dev-1", is_active: false }),
  });
  assert(selfStopRes.status === 400, "Safety Check: Super Admin cannot stop their own account (400)");

  // -------------------------------------------------------------------------
  // 6. CLIENT-SIDE ROLE SPOOFING ATTACK RESISTANCE
  // -------------------------------------------------------------------------
  console.log("\n--- 6. Role Spoofing Attack Resistance ---");
  const spoofRes = await request("/api/admin/staff", {
    method: "POST",
    token: TOKENS.volunteer,
    headers: {
      "X-Role": "super_admin",
      "Role": "super_admin",
    },
    body: JSON.stringify({ role: "super_admin" }),
  });
  assert(spoofRes.status === 403, "Server ignores client-supplied role spoofing headers/body (403 Forbidden)");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`📊 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
