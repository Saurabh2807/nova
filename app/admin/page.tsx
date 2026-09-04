"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  QrCode,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Camera,
  LogOut,
  RefreshCw,
  Sliders,
  Lock,
  FileSpreadsheet,
  History,
  Gamepad2,
  Ticket,
  Ban,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { AdminRole, VerificationResult } from "@/lib/types/registration";

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

  // Admin Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "scanner" | "teams" | "audience" | "logs" | "settings" | "export"
  >("dashboard");

  // Dashboard Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Scanner State
  const [scanInput, setScanInput] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<VerificationResult | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Camera scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Teams & Audience Lists
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");

  const [audienceList, setAudienceList] = useState<any[]>([]);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");

  // Logs List
  const [logsList, setLogsList] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Helper for authenticated API calls
  function getAuthHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (sessionUser?.token) {
      headers["Authorization"] = `Bearer ${sessionUser.token}`;
    }
    return headers;
  }

  // Fetch Dashboard Stats
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

  // Fetch Teams List
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

  // Fetch Audience List
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

  // Fetch Audit Logs
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

  // Auth Handler
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
      } catch (err: any) {
        setAuthError(err.message || "Authentication failed");
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
    stopCamera();
  }

  // Camera Scanning Handlers
  async function startCamera() {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Camera access denied:", err);
      setCameraActive(false);
      alert("Camera access was not granted. Please enter the token or ID manually.");
    }
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  }

  // Verification & Check-in handlers
  async function handleVerify(tokenOverride?: string) {
    const tokenToVerify = tokenOverride || scanInput.trim();
    if (!tokenToVerify) return;

    setScanLoading(true);
    setScanResult(null);
    setActionSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setScanResult({ status: "INVALID", message: "Network error during verification" });
    } finally {
      setScanLoading(false);
    }
  }

  async function handleCheckIn(type: "participant" | "audience", id: string, method: "qr_scan" | "manual_search" = "qr_scan") {
    setCheckInLoading(true);
    setActionSuccessMsg(null);

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
        setActionSuccessMsg(`ENTRY APPROVED: Successfully checked in ${id}!`);
        handleVerify(id);
        fetchStats();
        if (activeTab === "teams") fetchTeams();
        if (activeTab === "audience") fetchAudience();
      } else {
        alert(data.error || "Failed to check in attendee");
      }
    } catch (err) {
      alert("Check-in request failed");
    } finally {
      setCheckInLoading(false);
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

    setCheckInLoading(true);
    setActionSuccessMsg(null);

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
        setActionSuccessMsg(`Reverted check-in for ${id}. Status is now Not Checked In.`);
        handleVerify(id);
        fetchStats();
        if (activeTab === "teams") fetchTeams();
        if (activeTab === "audience") fetchAudience();
      } else {
        alert(data.error || "Failed to undo check-in");
      }
    } catch (err) {
      alert("Undo check-in request failed");
    } finally {
      setCheckInLoading(false);
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

  // Export CSV Handler (Admin only)
  async function handleExportCsv(type: "teams" | "audience") {
    if (sessionUser?.role !== "admin") {
      alert("Permission Denied: Only Admins can export attendee data.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/export?type=${type}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to export data");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `novaforge_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Export download failed");
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

  // Filtered Teams List
  const filteredTeams = teamsList.filter((t) => {
    const q = teamSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.team_id?.toLowerCase().includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.participants?.some(
        (p: any) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          p.college_id?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      );

    const matchFilter =
      teamFilter === "all" ||
      (teamFilter === "confirmed" && t.registration_status === "confirmed") ||
      (teamFilter === "cancelled" && t.registration_status === "cancelled") ||
      (teamFilter === "checked_in" && t.check_in_status === "checked_in") ||
      (teamFilter === "not_checked_in" && t.check_in_status === "not_checked_in");

    return matchSearch && matchFilter;
  });

  // Filtered Audience List
  const filteredAudience = audienceList.filter((a) => {
    const q = audienceSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      a.pass_id?.toLowerCase().includes(q) ||
      a.full_name?.toLowerCase().includes(q) ||
      a.phone?.includes(q) ||
      a.college_id?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q);

    const matchFilter =
      audienceFilter === "all" ||
      (audienceFilter === "confirmed" && a.registration_status === "confirmed") ||
      (audienceFilter === "cancelled" && a.registration_status === "cancelled") ||
      (audienceFilter === "checked_in" && a.check_in_status === "checked_in") ||
      (audienceFilter === "not_checked_in" && a.check_in_status === "not_checked_in");

    return matchSearch && matchFilter;
  });

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
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id !== "scanner") stopCamera();
                  }}
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
        {/* ==================================================================== */}
        {/* 1. DASHBOARD OVERVIEW TAB */}
        {/* ==================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Registration Status & Event Information Card */}
            <div className="rounded-2xl border border-[#cbdde9] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-xl font-black text-slate-900">
                      {stats?.settings?.event_name || "Nova Forge Campus Carnival"}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        stats?.settings?.registration_open
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {stats?.settings?.registration_open ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-[#2872A1]" /> {stats?.settings?.event_date || "18–19 Sep 2026"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-[#2872A1]" /> {stats?.settings?.venue || "LNCT Bhopal"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-[#2872A1]" /> Gate: {stats?.settings?.reporting_time || "09:00 AM"}
                    </span>
                  </div>
                </div>

                {sessionUser.role === "admin" && (
                  <button
                    onClick={() => toggleRegistration(Boolean(stats?.settings?.registration_open))}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                      stats?.settings?.registration_open
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {stats?.settings?.registration_open ? "Manually Close Registration" : "Manually Open Registration"}
                  </button>
                )}
              </div>

              {/* Participant vs Audience Capacity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {/* BGMI Participant Capacity */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="text-[#2872A1]" size={20} />
                      <span className="text-xs font-black uppercase tracking-wider text-[#2872A1]">
                        BGMI Tournament Capacity
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      {stats?.participant?.confirmedTeams ?? stats?.totalTeams ?? 0} / {stats?.settings?.participant_limit ?? 250} Teams
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 w-full rounded-full bg-blue-200/70 overflow-hidden">
                    <div
                      className="h-full bg-[#2872A1] rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (((stats?.participant?.confirmedTeams ?? stats?.totalTeams ?? 0)) /
                              (stats?.settings?.participant_limit || 1)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                    <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Total</span>
                      <span className="font-display text-base font-black text-slate-900">
                        {stats?.participant?.totalTeams ?? stats?.totalTeams ?? 0}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block">Confirmed</span>
                      <span className="font-display text-base font-black text-emerald-700">
                        {stats?.participant?.confirmedTeams ?? stats?.totalTeams ?? 0}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                      <span className="text-[10px] font-bold text-[#2872A1] uppercase block">Checked In</span>
                      <span className="font-display text-base font-black text-[#2872A1]">
                        {stats?.participant?.checkedInTeams ?? stats?.teamsCheckedIn ?? 0}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-600 uppercase block">Cancelled</span>
                      <span className="font-display text-base font-black text-rose-700">
                        {stats?.participant?.cancelledTeams ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audience Capacity */}
                <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="text-purple-700" size={20} />
                      <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                        Audience Passes Capacity
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      {stats?.audience?.confirmedAudience ?? stats?.totalAudience ?? 0} / {stats?.settings?.audience_limit ?? 1000} Passes
                    </span>
                  </div>

                  <div className="mt-3 h-2.5 w-full rounded-full bg-purple-200/70 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (((stats?.audience?.confirmedAudience ?? stats?.totalAudience ?? 0)) /
                              (stats?.settings?.audience_limit || 1)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                    <div className="rounded-xl bg-white p-2.5 border border-purple-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Total</span>
                      <span className="font-display text-base font-black text-slate-900">
                        {stats?.audience?.totalAudience ?? stats?.totalAudience ?? 0}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block">Confirmed</span>
                      <span className="font-display text-base font-black text-emerald-700">
                        {stats?.audience?.confirmedAudience ?? stats?.totalAudience ?? 0}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-purple-100">
                      <span className="text-[10px] font-bold text-purple-700 uppercase block">Checked In</span>
                      <span className="font-display text-base font-black text-purple-700">
                        {stats?.audience?.checkedInAudience ?? stats?.audienceCheckedIn ?? 0}
                      </span>
                    </div>
                    <div className="rounded-xl bg-white p-2.5 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-600 uppercase block">Cancelled</span>
                      <span className="font-display text-base font-black text-rose-700">
                        {stats?.audience?.cancelledAudience ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. QR CHECK-IN & SCANNER TAB */}
        {/* ==================================================================== */}
        {activeTab === "scanner" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-3xl border border-[#cbdde9] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-black text-slate-900 flex items-center gap-2">
                    <QrCode className="text-[#2872A1]" /> QR Code & Token Check-in
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scan attendee QR pass with camera or enter the secure token / ID.
                  </p>
                </div>
              </div>

              {/* Camera Scanner Controls */}
              <div className="mt-5 text-center">
                {cameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border-2 border-[#2872A1]">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-dashed border-[#2872A1]/70 pointer-events-none m-8 rounded-xl animate-pulse" />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 max-w-md mx-auto">
                    <Camera size={36} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-xs text-slate-600 font-semibold">Live Camera Scanner</p>
                    <p className="text-[11px] text-slate-400 mt-1">Use mobile back camera for rapid gate entry</p>
                  </div>
                )}

                <div className="mt-3 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={`rounded-xl px-5 py-2.5 text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                      cameraActive
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : "bg-[#2872A1] hover:bg-[#205d84] text-white"
                    }`}
                  >
                    <Camera size={14} />
                    {cameraActive ? "Stop Camera" : "Launch Camera Scanner"}
                  </button>
                </div>
              </div>

              {/* Manual Input Search */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Manual QR Token or Pass/Team ID Input
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste internal QR token (nf_par_...) or enter NF-BGMI-2026-XXXXX / NF-AUD-SA-XXXX"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2872A1] focus:bg-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleVerify()}
                    disabled={scanLoading || !scanInput.trim()}
                    className="rounded-xl bg-[#2872A1] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#205d84] transition disabled:opacity-50"
                  >
                    {scanLoading ? "Verifying..." : "Verify Pass"}
                  </button>
                </div>
              </div>

              {/* Action Success Alert */}
              {actionSuccessMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* SCAN / VERIFICATION RESULT CARD */}
              {scanResult && (
                <div className="mt-6 rounded-2xl border p-5 transition-all">
                  {/* Status: APPROVED */}
                  {scanResult.status === "APPROVED" && (
                    <div className="border-emerald-300 bg-emerald-50 rounded-2xl p-5 text-emerald-900 border space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            VERIFICATION PASSED
                          </span>
                          <h3 className="text-lg font-black text-emerald-900 leading-tight">ENTRY APPROVED</h3>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-3.5 border border-emerald-200 text-xs space-y-1.5 text-slate-800">
                        <p>
                          <strong>Reference ID:</strong> {scanResult.data?.id}
                        </p>
                        <p>
                          <strong>Name / Team:</strong> {scanResult.data?.name || scanResult.data?.title}
                        </p>
                        <p>
                          <strong>Category:</strong> {scanResult.data?.roleOrGame}
                        </p>
                        {scanResult.data?.members && (
                          <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
                            <p className="font-bold text-slate-600 uppercase text-[10px]">Team Roster:</p>
                            {scanResult.data.members.map((m: any, idx: number) => (
                              <p key={idx} className="text-slate-700">
                                • {m.role}: <strong>{m.name}</strong> ({m.phone}) - ID: {m.collegeId}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleCheckIn(scanResult.type || "participant", scanResult.data?.id || "")}
                        disabled={checkInLoading}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.99] disabled:opacity-50"
                      >
                        {checkInLoading ? "Processing Check-in..." : "Confirm & Check In Attendee"}
                      </button>
                    </div>
                  )}

                  {/* Status: ALREADY CHECKED IN */}
                  {scanResult.status === "ALREADY_CHECKED_IN" && (
                    <div className="border-amber-300 bg-amber-50 rounded-2xl p-5 text-amber-950 border space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
                          <AlertTriangle size={24} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                            ALREADY SCANNED
                          </span>
                          <h3 className="text-lg font-black text-amber-900 leading-tight">ALREADY CHECKED IN</h3>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white p-3.5 border border-amber-200 text-xs space-y-1.5 text-slate-800">
                        <p>
                          <strong>Reference ID:</strong> {scanResult.data?.id}
                        </p>
                        <p>
                          <strong>Name:</strong> {scanResult.data?.name}
                        </p>
                        <p className="text-amber-800 font-bold">
                          {scanResult.message || "Attendee already entered the arena."}
                        </p>
                      </div>

                      {sessionUser.role === "admin" && (
                        <button
                          onClick={() => handleUndoCheckIn(scanResult.type || "participant", scanResult.data?.id || "")}
                          disabled={checkInLoading}
                          className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={14} /> Revert Check-in (Admin Only)
                        </button>
                      )}
                    </div>
                  )}

                  {/* Status: REGISTRATION CANCELLED */}
                  {scanResult.status === "REGISTRATION_CANCELLED" && (
                    <div className="border-rose-300 bg-rose-50 rounded-2xl p-5 text-rose-950 border space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                          <Ban size={24} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                            ENTRY DENIED
                          </span>
                          <h3 className="text-lg font-black text-rose-900 leading-tight">
                            REGISTRATION CANCELLED
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs text-rose-800">
                        This pass or team registration has been cancelled by organizers. Entry is not permitted.
                      </p>
                    </div>
                  )}

                  {/* Status: INVALID */}
                  {scanResult.status === "INVALID" && (
                    <div className="border-rose-300 bg-rose-50 rounded-2xl p-5 text-rose-950 border space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                          <XCircle size={24} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                            INVALID PASS
                          </span>
                          <h3 className="text-lg font-black text-rose-900 leading-tight">INVALID QR CODE</h3>
                        </div>
                      </div>
                      <p className="text-xs text-rose-800">
                        {scanResult.message || "QR Token / ID does not match any record in the database."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. BGMI TEAMS MANAGEMENT TAB */}
        {/* ==================================================================== */}
        {activeTab === "teams" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#cbdde9] shadow-xs">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Team ID, Name, Player, Phone, College ID..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2872A1] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 focus:outline-none"
                >
                  <option value="all">All Teams ({teamsList.length})</option>
                  <option value="checked_in">Checked In</option>
                  <option value="not_checked_in">Not Checked In</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Teams List Table */}
            <div className="rounded-2xl border border-[#cbdde9] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <th className="p-3.5">Team ID</th>
                      <th className="p-3.5">Team Name</th>
                      <th className="p-3.5">Leader (Player 1)</th>
                      <th className="p-3.5">Member (Player 2)</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Check-in</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No teams found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTeams.map((t) => {
                        const members = t.members || t.participants || [];
                        const leader = members.find((m: any) => m.role === "leader") || members[0] || {};
                        const p2 = members.find((m: any) => m.role === "member") || members[1] || {};

                        return (
                          <tr key={t.id || t.team_id} className="hover:bg-slate-50/70 transition">
                            <td className="p-3.5 font-mono font-bold text-[#2872A1] whitespace-nowrap">
                              {t.team_id}
                            </td>
                            <td className="p-3.5 font-bold text-slate-900">{t.name}</td>
                            <td className="p-3.5 text-slate-700">
                              <p className="font-semibold">{leader.full_name || "—"}</p>
                              <p className="text-[10.5px] text-slate-400">{leader.phone} · {leader.college_id}</p>
                            </td>
                            <td className="p-3.5 text-slate-700">
                              <p className="font-semibold">{p2.full_name || "—"}</p>
                              <p className="text-[10.5px] text-slate-400">{p2.phone} · {p2.college_id}</p>
                            </td>
                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  t.registration_status === "confirmed"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                {t.registration_status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  t.check_in_status === "checked_in"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                {t.check_in_status === "checked_in" ? "CHECKED IN" : "PENDING"}
                              </span>
                            </td>
                            <td className="p-3.5 text-right whitespace-nowrap">
                              {t.check_in_status === "not_checked_in" && t.registration_status === "confirmed" ? (
                                <button
                                  onClick={() => handleCheckIn("participant", t.team_id, "manual_search")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs"
                                >
                                  Check In
                                </button>
                              ) : t.check_in_status === "checked_in" && sessionUser.role === "admin" ? (
                                <button
                                  onClick={() => handleUndoCheckIn("participant", t.team_id)}
                                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                                >
                                  Undo
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4. AUDIENCE PASSES MANAGEMENT TAB */}
        {/* ==================================================================== */}
        {activeTab === "audience" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#cbdde9] shadow-xs">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Pass ID, Name, Phone, College ID, Email..."
                  value={audienceSearch}
                  onChange={(e) => setAudienceSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2872A1] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                  className="text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 focus:outline-none"
                >
                  <option value="all">All Passes ({audienceList.length})</option>
                  <option value="checked_in">Checked In</option>
                  <option value="not_checked_in">Not Checked In</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Audience List Table */}
            <div className="rounded-2xl border border-[#cbdde9] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <th className="p-3.5">Pass ID</th>
                      <th className="p-3.5">Attendee Name</th>
                      <th className="p-3.5">Mobile Number</th>
                      <th className="p-3.5">College ID</th>
                      <th className="p-3.5">Email Address</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-center">Check-in</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAudience.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No audience passes found.
                        </td>
                      </tr>
                    ) : (
                      filteredAudience.map((a) => (
                        <tr key={a.id || a.pass_id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5 font-mono font-bold text-[#2872A1] whitespace-nowrap">
                            {a.pass_id}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">{a.full_name}</td>
                          <td className="p-3.5 text-slate-700">{a.phone}</td>
                          <td className="p-3.5 text-slate-700">{a.college_id}</td>
                          <td className="p-3.5 text-slate-500">{a.email}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                a.registration_status === "confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {a.registration_status}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                a.check_in_status === "checked_in"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {a.check_in_status === "checked_in" ? "CHECKED IN" : "PENDING"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            {a.check_in_status === "not_checked_in" && a.registration_status === "confirmed" ? (
                              <button
                                onClick={() => handleCheckIn("audience", a.pass_id, "manual_search")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs"
                              >
                                Check In
                              </button>
                            ) : a.check_in_status === "checked_in" && sessionUser.role === "admin" ? (
                              <button
                                onClick={() => handleUndoCheckIn("audience", a.pass_id)}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                              >
                                Undo
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 5. AUDIT LOGS TAB */}
        {/* ==================================================================== */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#cbdde9] bg-white p-5 shadow-xs">
              <h2 className="font-display text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                <History className="text-[#2872A1]" size={18} /> Real-Time Check-in Audit Trail
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Tamper-proof audit logs recording all gate scans, manual check-ins, and admin undo operations.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Scanned By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {logsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                          No audit logs recorded yet.
                        </td>
                      </tr>
                    ) : (
                      logsList.map((log, idx) => (
                        <tr key={log.id || idx} className="hover:bg-slate-50/70">
                          <td className="p-3 text-slate-500 font-sans">
                            {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-3 uppercase text-[11px] font-bold text-slate-700">{log.type}</td>
                          <td className="p-3 font-bold text-[#2872A1]">{log.reference_id}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans ${
                                log.action === "check_in"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 font-sans text-slate-600">{log.method}</td>
                          <td className="p-3 font-sans text-slate-700">{log.scanned_by || "Organizer"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 6. EVENT SETTINGS (ADMIN ONLY) */}
        {/* ==================================================================== */}
        {activeTab === "settings" && sessionUser.role === "admin" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-3xl border border-[#cbdde9] bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Sliders className="text-[#2872A1]" /> Event Configuration & Capacity Controls
              </h2>

              <div className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={stats?.settings?.event_name ?? "Nova Forge Campus Carnival"}
                    onChange={(e) =>
                      setStats((prev: any) => ({
                        ...prev,
                        settings: { ...prev?.settings, event_name: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#2872A1] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Participant Limit (Teams)
                    </label>
                    <input
                      type="number"
                      value={stats?.settings?.participant_limit ?? 250}
                      onChange={(e) =>
                        setStats((prev: any) => ({
                          ...prev,
                          settings: { ...prev?.settings, participant_limit: Number(e.target.value) },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#2872A1] focus:outline-none"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Number of 2-player squads</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Audience Limit (Passes)
                    </label>
                    <input
                      type="number"
                      value={stats?.settings?.audience_limit ?? 1000}
                      onChange={(e) =>
                        setStats((prev: any) => ({
                          ...prev,
                          settings: { ...prev?.settings, audience_limit: Number(e.target.value) },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#2872A1] focus:outline-none"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">Free guest entry tickets</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={stats?.settings?.venue ?? "LNCT Bhopal"}
                      onChange={(e) =>
                        setStats((prev: any) => ({
                          ...prev,
                          settings: { ...prev?.settings, venue: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Event Dates
                    </label>
                    <input
                      type="text"
                      value={stats?.settings?.event_date ?? "18–19 September 2026"}
                      onChange={(e) =>
                        setStats((prev: any) => ({
                          ...prev,
                          settings: { ...prev?.settings, event_date: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Reporting Time
                    </label>
                    <input
                      type="text"
                      value={stats?.settings?.reporting_time ?? "09:00 AM IST"}
                      onChange={(e) =>
                        setStats((prev: any) => ({
                          ...prev,
                          settings: { ...prev?.settings, reporting_time: e.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/admin/stats", {
                        method: "POST",
                        headers: getAuthHeaders(),
                        body: JSON.stringify(stats?.settings),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert("Settings updated successfully!");
                        fetchStats();
                      } else {
                        alert(data.error || "Failed to save settings");
                      }
                    } catch (err) {
                      alert("Error saving settings");
                    }
                  }}
                  className="w-full mt-4 rounded-xl bg-[#2872A1] hover:bg-[#205d84] py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.99]"
                >
                  Save Event Parameters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 7. CSV EXPORT TAB (ADMIN ONLY) */}
        {/* ==================================================================== */}
        {activeTab === "export" && sessionUser.role === "admin" && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="rounded-3xl border border-[#cbdde9] bg-white p-6 shadow-sm text-center">
              <FileSpreadsheet size={40} className="mx-auto text-[#2872A1] mb-2" />
              <h2 className="font-display text-lg font-black text-slate-900">
                Official CSV Attendance & Roster Export
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Download verified attendee spreadsheets for offline physical gate desk and record keeping.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-display font-black text-sm text-[#2872A1]">BGMI Teams Roster</h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Includes Team ID, Name, Player 1 & 2 details, status, timestamps.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportCsv("teams")}
                    className="mt-4 w-full rounded-xl bg-[#2872A1] hover:bg-[#205d84] text-white font-bold py-2.5 text-xs shadow-xs transition"
                  >
                    Download Teams CSV
                  </button>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-display font-black text-sm text-purple-800">Audience Passes</h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Includes Pass ID, Name, Mobile, College ID, status, timestamps.
                    </p>
                  </div>
                  <button
                    onClick={() => handleExportCsv("audience")}
                    className="mt-4 w-full rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 text-xs shadow-xs transition"
                  >
                    Download Audience CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
