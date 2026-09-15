"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Sliders,
  QrCode,
  Gamepad2,
  Ticket,
  History,
  FileSpreadsheet,
  Users,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  AdminRole,
  Team,
  AudienceRegistration,
  CheckInLog,
  StaffAccount,
} from "@/lib/types/registration";
import {
  AdminDashboardTab,
  DashboardStatsData,
} from "@/components/admin/AdminDashboardTab";
import { AdminScannerTab } from "@/components/admin/AdminScannerTab";
import { AdminTeamsTab } from "@/components/admin/AdminTeamsTab";
import { AdminAudienceTab } from "@/components/admin/AdminAudienceTab";
import { AdminLogsTab } from "@/components/admin/AdminLogsTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import { AdminExportTab } from "@/components/admin/AdminExportTab";
import { AdminStaffTab } from "@/components/admin/AdminStaffTab";

type AdminTab =
  | "dashboard"
  | "scanner"
  | "staff"
  | "teams"
  | "audience"
  | "logs"
  | "settings"
  | "export";

export default function AdminPortalPage() {
  // Auth state
  const [sessionUser, setSessionUser] = useState<{
    id: string;
    email: string;
    role: AdminRole;
    name: string;
    token?: string;
  } | null>(null);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // Portal Data States
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [teamsList, setTeamsList] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [audienceList, setAudienceList] = useState<AudienceRegistration[]>([]);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [logsList, setLogsList] = useState<CheckInLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Helper for authenticated API calls
  function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionUser?.token) {
      headers["Authorization"] = `Bearer ${sessionUser.token}`;
    }
    return headers;
  }

  function handleAccountDisabled() {
    alert("Account Disabled: Your staff account has been stopped by the Super Admin.");
    handleLogout();
  }

  // Data Fetching
  async function fetchStats() {
    if (sessionUser?.role === "volunteer") return;
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchTeams() {
    if (sessionUser?.role === "volunteer") return;
    setTeamsLoading(true);
    try {
      const res = await fetch("/api/admin/teams", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        setTeamsList(data.teams || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTeamsLoading(false);
    }
  }

  async function fetchAudience() {
    if (sessionUser?.role !== "super_admin" && sessionUser?.role !== "admin") return;
    setAudienceLoading(true);
    try {
      const res = await fetch("/api/admin/audience", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        setAudienceList(data.audience || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAudienceLoading(false);
    }
  }

  async function fetchLogs() {
    if (sessionUser?.role !== "super_admin") return;
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/logs", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        setLogsList(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  }

  async function fetchStaff() {
    if (sessionUser?.role !== "super_admin") return;
    setStaffLoading(true);
    try {
      const res = await fetch("/api/admin/staff", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStaffLoading(false);
    }
  }

  // Direct Tab Navigation Security Guard
  useEffect(() => {
    if (sessionUser) {
      if (sessionUser.role === "volunteer" && activeTab !== "scanner") {
        setActiveTab("scanner");
      } else if (
        sessionUser.role === "core_member" &&
        activeTab !== "dashboard" &&
        activeTab !== "scanner" &&
        activeTab !== "teams"
      ) {
        setActiveTab("dashboard");
      } else if (
        sessionUser.role === "admin" &&
        (activeTab === "staff" || activeTab === "logs" || activeTab === "settings")
      ) {
        setActiveTab("dashboard");
      }
    }
  }, [sessionUser, activeTab]);

  useEffect(() => {
    if (sessionUser) {
      if (sessionUser.role !== "volunteer") {
        fetchStats();
      }
      if (sessionUser.role === "super_admin") {
        if (activeTab === "staff") fetchStaff();
        if (activeTab === "logs") fetchLogs();
      }
      if (sessionUser.role === "super_admin" || sessionUser.role === "admin") {
        if (activeTab === "audience") fetchAudience();
      }
      if (sessionUser.role === "super_admin" || sessionUser.role === "admin" || sessionUser.role === "core_member") {
        if (activeTab === "teams") fetchTeams();
      }
    }
  }, [sessionUser, activeTab]);

  // Auth Handlers
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const email = authEmail.trim().toLowerCase();

    // 1. If Supabase Auth is active
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: authPassword,
        });

        if (error) {
          setAuthError(error.message);
          setAuthLoading(false);
          return;
        }

        // Fetch user profile from admin_profiles
        const { data: profile, error: profErr } = await supabase
          .from("admin_profiles")
          .select("*")
          .or(`id.eq.${data.user.id},user_id.eq.${data.user.id}`)
          .single();

        if (profErr || !profile) {
          setAuthError("Forbidden: Your account does not have authorized staff access.");
          await supabase.auth.signOut();
          setAuthLoading(false);
          return;
        }

        // Strict is_active check
        if (profile.is_active === false) {
          setAuthError("Account Disabled: Your staff account has been stopped by the Super Admin.");
          await supabase.auth.signOut();
          setAuthLoading(false);
          return;
        }

        let assignedRole = (profile.role as AdminRole) || "volunteer";
        // Ensure owner email is always super_admin
        if (email === "saurabhsinghkarmwarrajput@gmail.com") {
          assignedRole = "super_admin";
        }

        setSessionUser({
          id: data.user.id,
          email: data.user.email || email,
          role: assignedRole,
          name: profile?.full_name || email.split("@")[0],
          token: data.session?.access_token,
        });

        // Set role-appropriate default landing tab
        if (assignedRole === "volunteer") {
          setActiveTab("scanner");
        } else {
          setActiveTab("dashboard");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        setAuthError(message);
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    // 2. Dev / Offline Fallback Mode
    if (email.includes("saurabh") || email.includes("super")) {
      setSessionUser({
        id: "super-admin-dev-1",
        email,
        role: "super_admin",
        name: "Saurabh Kumar Singh (Super Admin)",
        token: "dev-super_admin-token",
      });
      setActiveTab("dashboard");
    } else if (email.includes("admin")) {
      setSessionUser({
        id: "admin-dev-1",
        email,
        role: "admin",
        name: "Admin Coordinator (Dev)",
        token: "dev-admin-token",
      });
      setActiveTab("dashboard");
    } else if (email.includes("core")) {
      setSessionUser({
        id: "core-dev-1",
        email,
        role: "core_member",
        name: "Core Coordinator (Dev)",
        token: "dev-core_member-token",
      });
      setActiveTab("dashboard");
    } else if (email.includes("stopped")) {
      setAuthError("Account Disabled: Your staff account has been stopped by the Super Admin.");
      setAuthLoading(false);
      return;
    } else {
      setSessionUser({
        id: "volunteer-dev-1",
        email,
        role: "volunteer",
        name: "Gate Volunteer (Dev)",
        token: "dev-volunteer-token",
      });
      setActiveTab("scanner");
    }
    setAuthLoading(false);
  }

  function handleLogout() {
    if (supabase) {
      supabase.auth.signOut();
    }
    setSessionUser(null);
  }

  // Check-in and Undo Check-in (used by Teams & Audience tabs)
  async function handleCheckIn(
    type: "participant" | "audience",
    id: string,
    method: "qr_scan" | "manual_search" = "qr_scan"
  ) {
    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "check_in",
          type,
          id,
          method,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchStats();
        if (activeTab === "teams") fetchTeams();
        if (activeTab === "audience") fetchAudience();
      } else {
        alert(data.error || "Failed to check in attendee");
      }
    } catch (err) {
      alert("Check-in request failed");
    }
  }

  async function handleUndoCheckIn(type: "participant" | "audience", id: string) {
    if (sessionUser?.role === "volunteer") {
      alert("Permission Denied: Volunteers do not have permission to undo check-ins.");
      return;
    }

    const reason = prompt(
      `Please enter a mandatory reason for reverting check-in for ${id}:`,
      "Accidental check-in"
    );
    if (!reason || !reason.trim()) {
      alert("Undo cancelled: A reason is required to revert check-in.");
      return;
    }

    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "undo",
          type,
          id,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        fetchStats();
        if (activeTab === "teams") fetchTeams();
        if (activeTab === "audience") fetchAudience();
      } else {
        alert(data.error || "Failed to undo check-in");
      }
    } catch (err) {
      alert("Undo check-in request failed");
    }
  }

  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (sessionUser?.role !== "super_admin" && sessionUser?.role !== "admin") {
      alert("Permission Denied: Only Admins and Super Admins can delete teams.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete team "${teamName}" (${teamId})?\n\nThis will remove all players from the participant list and delete the team registration permanently.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/teams?teamId=${encodeURIComponent(teamId)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        fetchStats();
        fetchTeams();
      } else {
        alert(data.error || "Failed to delete team");
      }
    } catch (err) {
      alert("Delete team request failed");
    }
  }

  async function handleDeleteParticipant(identifier: string, name: string) {
    if (sessionUser?.role !== "super_admin" && sessionUser?.role !== "admin") {
      alert("Permission Denied: Only Admins and Super Admins can remove participants.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove "${name}" from the participant list?\n\nBecause BGMI is a 2-player team tournament, removing this player will automatically delete their team squad.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/teams?participant=${encodeURIComponent(identifier)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        fetchStats();
        fetchTeams();
      } else {
        alert(data.error || "Failed to remove participant");
      }
    } catch (err) {
      alert("Remove participant request failed");
    }
  }

  async function handleDeleteAudience(passId: string, name: string) {
    if (sessionUser?.role !== "super_admin" && sessionUser?.role !== "admin") {
      alert("Permission Denied: Only Admins and Super Admins can delete audience passes.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete audience pass for "${name}" (${passId})?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/audience?passId=${encodeURIComponent(passId)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        fetchStats();
        fetchAudience();
      } else {
        alert(data.error || "Failed to delete audience pass");
      }
    } catch (err) {
      alert("Delete audience pass request failed");
    }
  }

  // Toggle Registration Open/Closed (Super Admin only)
  async function toggleRegistration(currentState: boolean) {
    if (sessionUser?.role !== "super_admin") {
      alert("Only Super Admin can change registration status.");
      return;
    }

    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ registration_open: !currentState }),
      });
      const data = await res.json();
      if (data.code === "ACCOUNT_DISABLED") {
        handleAccountDisabled();
        return;
      }
      if (data.success) {
        fetchStats();
      } else {
        alert(data.error || "Failed to update registration status");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ==============================================================================
  // RENDER: LOGIN GATE
  // ==============================================================================
  if (!sessionUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#091522] p-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0e1d2e] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2872A1]/20 text-[#2872A1] border border-[#2872A1]/40">
              <Lock size={28} />
            </div>
            <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-white">
              Nova Forge Staff
            </h1>
            <p className="mt-1 text-xs text-white/50">
              Campus Unleashed · Authorized Organizers Only
            </p>
          </div>

          {authError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertTriangle size={16} className="shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                Staff Email
              </label>
              <input
                required
                type="email"
                placeholder="staff@novaforge.gg"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#2872A1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#2872A1] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 rounded-xl bg-[#2872A1] py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#205d84] active:scale-[0.99] disabled:opacity-50"
            >
              {authLoading ? "Authenticating with Supabase..." : "Sign In to Staff Panel"}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div className="mt-6 rounded-xl bg-blue-950/40 border border-blue-800/30 p-3 text-center text-[11px] text-blue-200">
              ⚡ <strong>Local Dev Fallback:</strong> Type <code>super</code> or <code>saurabh</code> for Super Admin, <code>core</code> for Core Member, or any other email for Volunteer.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Determine permitted navigation tabs based on staff role
  const navTabs = [
    ...(sessionUser.role !== "volunteer"
      ? [{ id: "dashboard" as AdminTab, label: "Dashboard", icon: Sliders }]
      : []),
    {
      id: "scanner" as AdminTab,
      label: sessionUser.role === "volunteer" ? "QR Check-in & Search" : "QR Check-in",
      icon: QrCode,
    },
    ...(sessionUser.role === "super_admin" || sessionUser.role === "admin" || sessionUser.role === "core_member"
      ? [{ id: "teams" as AdminTab, label: "BGMI Teams", icon: Gamepad2 }]
      : []),
    ...(sessionUser.role === "super_admin" || sessionUser.role === "admin"
      ? [
          { id: "audience" as AdminTab, label: "Audience Passes", icon: Ticket },
          { id: "export" as AdminTab, label: "CSV Export", icon: FileSpreadsheet },
        ]
      : []),
    ...(sessionUser.role === "super_admin"
      ? [
          { id: "staff" as AdminTab, label: "Staff Management", icon: Users },
          { id: "logs" as AdminTab, label: "Audit Logs", icon: History },
          { id: "settings" as AdminTab, label: "Event Settings", icon: Sliders },
        ]
      : []),
  ];

  // ==============================================================================
  // RENDER: MAIN ADMIN PORTAL
  // ==============================================================================
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="border-b border-[#cbdde9] bg-[#091522] px-6 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2872A1] text-white shadow-sm font-black text-sm">
              NF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg font-black tracking-wide text-white">NOVA FORGE OPS</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider ${
                    sessionUser.role === "super_admin"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : sessionUser.role === "admin"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                      : sessionUser.role === "core_member"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {sessionUser.role === "super_admin"
                    ? "Super Admin"
                    : sessionUser.role === "admin"
                    ? "Admin"
                    : sessionUser.role === "core_member"
                    ? "Core Member"
                    : "Volunteer"}
                </span>
              </div>
              <p className="text-[11px] text-white/50">Campus Unleashed Operations</p>
            </div>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:text-right sm:block">
              <p className="text-xs font-bold text-white">{sessionUser.name}</p>
              <p className="text-[10px] text-white/40">{sessionUser.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="border-b border-[#d2e0ea] bg-white px-6 py-2 shadow-xs sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
                    active
                      ? "bg-[#2872A1] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (sessionUser.role !== "volunteer") fetchStats();
              if (sessionUser.role === "super_admin") {
                if (activeTab === "staff") fetchStaff();
                if (activeTab === "logs") fetchLogs();
              }
              if (sessionUser.role === "super_admin" || sessionUser.role === "admin") {
                if (activeTab === "audience") fetchAudience();
              }
              if (sessionUser.role === "super_admin" || sessionUser.role === "admin" || sessionUser.role === "core_member") {
                if (activeTab === "teams") fetchTeams();
              }
            }}
            className="flex items-center gap-1 text-xs font-semibold text-[#2872A1] hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition"
          >
            <RefreshCw size={13} className={statsLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-6">
        {/* 1. DASHBOARD OVERVIEW (SUPER ADMIN, ADMIN & CORE MEMBER) */}
        {activeTab === "dashboard" && sessionUser.role !== "volunteer" && (
          <AdminDashboardTab
            stats={stats}
            role={sessionUser.role}
            onToggleRegistration={toggleRegistration}
          />
        )}

        {/* 2. QR CODE SCANNER & MANUAL SEARCH (ALL STAFF) */}
        {activeTab === "scanner" && (
          <AdminScannerTab
            role={sessionUser.role}
            getAuthHeaders={getAuthHeaders}
            onDataMutated={() => {
              if (sessionUser.role !== "volunteer") fetchStats();
            }}
          />
        )}

        {/* 3. STAFF MANAGEMENT (SUPER ADMIN EXCLUSIVE) */}
        {activeTab === "staff" && sessionUser.role === "super_admin" && (
          <AdminStaffTab
            staffList={staffList}
            loading={staffLoading}
            onRefresh={fetchStaff}
            getAuthHeaders={getAuthHeaders}
            currentUserId={sessionUser.id}
          />
        )}

        {/* 4. BGMI TEAMS ROSTER (SUPER ADMIN, ADMIN & CORE MEMBER) */}
        {activeTab === "teams" && (sessionUser.role === "super_admin" || sessionUser.role === "admin" || sessionUser.role === "core_member") && (
          <AdminTeamsTab
            teamsList={teamsList}
            role={sessionUser.role}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
            onDeleteTeam={handleDeleteTeam}
            onDeleteParticipant={handleDeleteParticipant}
          />
        )}

        {/* 5. AUDIENCE PASSES (SUPER ADMIN & ADMIN) */}
        {activeTab === "audience" && (sessionUser.role === "super_admin" || sessionUser.role === "admin") && (
          <AdminAudienceTab
            audienceList={audienceList}
            role={sessionUser.role}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
            onDeleteAudience={handleDeleteAudience}
          />
        )}

        {/* 6. AUDIT LOGS (SUPER ADMIN EXCLUSIVE) */}
        {activeTab === "logs" && sessionUser.role === "super_admin" && (
          <AdminLogsTab logsList={logsList} />
        )}

        {/* 7. EVENT SETTINGS (SUPER ADMIN EXCLUSIVE) */}
        {activeTab === "settings" && sessionUser.role === "super_admin" && (
          <AdminSettingsTab
            settings={stats?.settings}
            getAuthHeaders={getAuthHeaders}
            onSettingsUpdated={fetchStats}
          />
        )}

        {/* 8. CSV EXPORT (SUPER ADMIN & ADMIN) */}
        {activeTab === "export" && (sessionUser.role === "super_admin" || sessionUser.role === "admin") && (
          <AdminExportTab
            role={sessionUser.role}
            getAuthHeaders={getAuthHeaders}
          />
        )}
      </main>
    </div>
  );
}
