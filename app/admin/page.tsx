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
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  AdminRole,
  Team,
  AudienceRegistration,
  CheckInLog,
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

type AdminTab =
  | "dashboard"
  | "scanner"
  | "teams"
  | "audience"
  | "logs"
  | "settings"
  | "export";

export default function AdminPortalPage() {
  // Auth state
  const [sessionUser, setSessionUser] = useState<{
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

  // Data Fetching
  async function fetchStats() {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
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
    setTeamsLoading(true);
    try {
      const res = await fetch("/api/admin/teams", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
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
    setAudienceLoading(true);
    try {
      const res = await fetch("/api/admin/audience", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
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
    setLogsLoading(true);
    try {
      const res = await fetch("/api/admin/logs", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setLogsList(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  }

  useEffect(() => {
    if (sessionUser) {
      fetchStats();
      if (activeTab === "teams") fetchTeams();
      if (activeTab === "audience") fetchAudience();
      if (activeTab === "logs") fetchLogs();
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

        // Fetch user profile role from admin_profiles
        const { data: profile, error: profErr } = await supabase
          .from("admin_profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profErr || !profile) {
          setAuthError("Forbidden: Your account does not have admin/volunteer access.");
          await supabase.auth.signOut();
          setAuthLoading(false);
          return;
        }

        setSessionUser({
          email: data.user.email || email,
          role: (profile?.role as AdminRole) || "volunteer",
          name: profile?.full_name || email.split("@")[0],
          token: data.session?.access_token,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        setAuthError(message);
      } finally {
        setAuthLoading(false);
      }
      return;
    }

    // 2. Dev / Offline Fallback Mode
    if (email.includes("admin")) {
      setSessionUser({
        email,
        role: "admin",
        name: "Lead Admin (Dev)",
        token: "dev-admin-token",
      });
    } else {
      setSessionUser({
        email,
        role: "volunteer",
        name: "Desk Volunteer (Dev)",
        token: "dev-volunteer-token",
      });
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
    if (sessionUser?.role !== "admin") {
      alert("Permission Denied: Only Admins can undo check-ins. Volunteers do not have this permission.");
      return;
    }

    if (!confirm(`Are you sure you want to revert check-in for ${id}? Status will be reset to Not Checked In.`)) {
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
        }),
      });

      const data = await res.json();
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

  // Toggle Registration Open/Closed (Admin only)
  async function toggleRegistration(currentState: boolean) {
    if (sessionUser?.role !== "admin") {
      alert("Only Admins can change registration status.");
      return;
    }

    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ registration_open: !currentState }),
      });
      const data = await res.json();
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
              Nova Forge Admin
            </h1>
            <p className="mt-1 text-xs text-white/50">
              LNCT Campus Carnival · Authorized Organizers Only
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
                Organizer Email
              </label>
              <input
                required
                type="email"
                placeholder="admin@novaforge.gg or volunteer@novaforge.gg"
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
              {authLoading ? "Authenticating with Supabase..." : "Sign In to Organizer Panel"}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div className="mt-6 rounded-xl bg-blue-950/40 border border-blue-800/30 p-3 text-center text-[11px] text-blue-200">
              ⚡ <strong>Local Dev Fallback:</strong> Type any email with <code>admin</code> for Admin role, or any other email for Volunteer role.
            </div>
          )}
        </div>
      </div>
    );
  }

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
                <h1 className="font-display text-lg font-black tracking-wide text-white">NOVA FORGE ADMIN</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider ${
                    sessionUser.role === "admin"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  }`}
                >
                  {sessionUser.role === "admin" ? "Admin (Full Access)" : "Volunteer (Check-in Only)"}
                </span>
              </div>
              <p className="text-[11px] text-white/50">LNCT Campus Carnival Operations</p>
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
            {[
              { id: "dashboard", label: "Dashboard", icon: Sliders },
              { id: "scanner", label: "QR Check-in", icon: QrCode },
              { id: "teams", label: "BGMI Teams", icon: Gamepad2 },
              { id: "audience", label: "Audience Passes", icon: Ticket },
              { id: "logs", label: "Audit Logs", icon: History },
              ...(sessionUser.role === "admin"
                ? [
                    { id: "settings", label: "Event Settings", icon: Sliders },
                    { id: "export", label: "CSV Export", icon: FileSpreadsheet },
                  ]
                : []),
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
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
              fetchStats();
              if (activeTab === "teams") fetchTeams();
              if (activeTab === "audience") fetchAudience();
              if (activeTab === "logs") fetchLogs();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-[#2872A1] hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition"
          >
            <RefreshCw size={13} className={statsLoading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-6">
        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <AdminDashboardTab
            stats={stats}
            role={sessionUser.role}
            onToggleRegistration={toggleRegistration}
          />
        )}

        {/* 2. QR CODE SCANNER & CHECK-IN */}
        {activeTab === "scanner" && (
          <AdminScannerTab
            role={sessionUser.role}
            getAuthHeaders={getAuthHeaders}
            onDataMutated={() => {
              fetchStats();
            }}
          />
        )}

        {/* 3. BGMI TEAMS ROSTER */}
        {activeTab === "teams" && (
          <AdminTeamsTab
            teamsList={teamsList}
            role={sessionUser.role}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
          />
        )}

        {/* 4. AUDIENCE PASSES */}
        {activeTab === "audience" && (
          <AdminAudienceTab
            audienceList={audienceList}
            role={sessionUser.role}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
          />
        )}

        {/* 5. AUDIT LOGS */}
        {activeTab === "logs" && (
          <AdminLogsTab logsList={logsList} />
        )}

        {/* 6. EVENT SETTINGS (ADMIN ONLY) */}
        {activeTab === "settings" && sessionUser.role === "admin" && (
          <AdminSettingsTab
            settings={stats?.settings}
            getAuthHeaders={getAuthHeaders}
            onSettingsUpdated={fetchStats}
          />
        )}

        {/* 7. CSV EXPORT (ADMIN ONLY) */}
        {activeTab === "export" && sessionUser.role === "admin" && (
          <AdminExportTab
            role={sessionUser.role}
            getAuthHeaders={getAuthHeaders}
          />
        )}
      </main>
    </div>
  );
}
