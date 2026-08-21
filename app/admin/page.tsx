"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  QrCode,
  Search,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Camera,
  LogOut,
  RefreshCw,
  Sliders,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { AdminRole, VerificationResult } from "@/lib/types/registration";

export default function AdminPortalPage() {
  // Auth state
  const [sessionUser, setSessionUser] = useState<{
    email: string;
    role: AdminRole;
    name: string;
  } | null>(null);

  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin Navigation Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "search" | "export" | "settings">("dashboard");

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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ teams: any[]; audience: any[] }>({ teams: [], audience: [] });
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch Dashboard Stats
  async function fetchStats() {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
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

  useEffect(() => {
    if (sessionUser) {
      fetchStats();
    }
  }, [sessionUser]);

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
        const { data: profile } = await supabase
          .from("admin_profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        setSessionUser({
          email: data.user.email || email,
          role: (profile?.role as AdminRole) || "volunteer",
          name: profile?.full_name || email.split("@")[0],
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
        name: "Head Organizer (Admin)",
      });
    } else {
      setSessionUser({
        email,
        role: "volunteer",
        name: "Desk Volunteer",
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
      console.warn("Camera access denied or unavailable:", err);
      setCameraActive(false);
      alert("Camera access was not granted. Please use manual token input.");
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
        headers: { "Content-Type": "application/json" },
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

  async function handleCheckIn(type: "participant" | "audience", id: string) {
    setCheckInLoading(true);
    setActionSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_in",
          type,
          id,
          scannedBy: sessionUser?.name || "Organizer",
          userRole: sessionUser?.role,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Successfully checked in ${id}!`);
        // Refresh verification state
        handleVerify(id);
        fetchStats();
        if (searchQuery) handleSearch();
      } else {
        alert(data.error || "Failed to check in");
      }
    } catch (err) {
      alert("Check-in request failed");
    } finally {
      setCheckInLoading(false);
    }
  }

  async function handleUndoCheckIn(type: "participant" | "audience", id: string) {
    if (sessionUser?.role !== "admin") {
      alert("Permission Denied: Only Admins can undo check-ins.");
      return;
    }

    if (!confirm(`Are you sure you want to revert check-in for ${id}?`)) {
      return;
    }

    setCheckInLoading(true);
    setActionSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "undo",
          type,
          id,
          scannedBy: sessionUser?.name || "Admin",
          userRole: sessionUser?.role,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Reverted check-in for ${id}. Status is now Pending.`);
        handleVerify(id);
        fetchStats();
        if (searchQuery) handleSearch();
      } else {
        alert(data.error || "Failed to undo check-in");
      }
    } catch (err) {
      alert("Undo check-in request failed");
    } finally {
      setCheckInLoading(false);
    }
  }

  // Manual Search Handler
  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults({ teams: [], audience: [] });
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }

  // Toggle Registration Open/Closed
  async function toggleRegistration(currentState: boolean) {
    if (sessionUser?.role !== "admin") {
      alert("Only Admins can change event settings.");
      return;
    }

    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_open: !currentState }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
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
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1f33] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-nf-blue/20 text-cyan-400 border border-cyan-500/30">
              <Lock size={28} />
            </div>
            <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-white">
              Organizer Portal
            </h1>
            <p className="mt-1 text-xs text-white/50">
              Nova Forge LNCT Campus Carnival · Restricted Access
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
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
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
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 rounded-xl bg-nf-blue py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-nf-blue-bright active:scale-[0.99] disabled:opacity-50"
            >
              {authLoading ? "Authenticating..." : "Sign In to Organizer Panel"}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div className="mt-6 rounded-xl bg-cyan-950/40 border border-cyan-800/30 p-3 text-center text-[11px] text-cyan-200">
              ⚡ <strong>Local Dev Fallback Active:</strong> Type any email with <code>admin</code> (e.g. <code>admin@test.com</code>) for Admin role, or any other email for Volunteer role.
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
    <div className="min-h-screen bg-[#070e17] text-white flex flex-col">
      {/* Top Admin Header */}
      <header className="border-b border-white/10 bg-[#091522] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-nf-blue text-white shadow-sm font-bold">
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
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut size={14} /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="border-b border-white/10 bg-[#0d1f33] px-6 py-2">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: Sliders },
            { id: "scanner", label: "QR Scanner", icon: QrCode },
            { id: "search", label: "Manual Search", icon: Search },
            { id: "export", label: "CSV Export", icon: FileSpreadsheet },
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
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                  active
                    ? "bg-nf-blue text-white shadow-md"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl p-6">
        {/* ==================================================================== */}
        {/* 1. DASHBOARD TAB */}
        {/* ==================================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-white/50">Total Teams (BGMI)</span>
                <p className="mt-2 font-display text-3xl font-black text-white">
                  {stats?.totalTeams ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-white/40">
                  {stats?.totalParticipants ?? 0} total registered players
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-white/50">Audience Passes</span>
                <p className="mt-2 font-display text-3xl font-black text-white">
                  {stats?.totalAudience ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-white/40">Free guest entry passes</p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-400">Total Checked In</span>
                <p className="mt-2 font-display text-3xl font-black text-emerald-300">
                  {stats?.totalCheckedIn ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-emerald-400/70">
                  {stats?.checkInRate ?? 0}% live turnout rate
                </p>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-400">Pending Check-in</span>
                <p className="mt-2 font-display text-3xl font-black text-amber-300">
                  {stats?.pendingCheckIn ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-amber-400/70">Awaiting desk entry</p>
              </div>
            </div>

            {/* Event Settings & Manual Toggle Controller */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">Event Registration Lifecycle</h2>
                  <p className="text-xs text-white/50">Manually open or close public registration without code updates</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${
                      stats?.settings?.registration_open
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {stats?.settings?.registration_open ? "REGISTRATIONS ACTIVE" : "REGISTRATIONS CLOSED"}
                  </span>

                  {sessionUser.role === "admin" && (
                    <button
                      onClick={() => toggleRegistration(Boolean(stats?.settings?.registration_open))}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                        stats?.settings?.registration_open
                          ? "bg-red-600/80 hover:bg-red-600 text-white"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {stats?.settings?.registration_open ? "Close Registrations" : "Open Registrations"}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-white/70">
                <div className="rounded-xl bg-white/5 p-3.5">
                  <span className="text-[10px] uppercase font-bold text-white/40">Venue</span>
                  <p className="mt-1 font-semibold text-white">{stats?.settings?.venue || "LNCT Bhopal"}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <span className="text-[10px] uppercase font-bold text-white/40">Event Dates</span>
                  <p className="mt-1 font-semibold text-white">{stats?.settings?.event_date || "18–19 Sep 2026"}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3.5">
                  <span className="text-[10px] uppercase font-bold text-white/40">Reporting Time</span>
                  <p className="mt-1 font-semibold text-white">{stats?.settings?.reporting_time || "09:00 AM IST"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. QR SCANNER TAB */}
        {/* ==================================================================== */}
        {activeTab === "scanner" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-6 shadow-xl">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="text-cyan-400" /> Live QR & Token Scanner
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Scan attendee QR code via camera or enter the secure token / ID manually.
              </p>

              {/* Camera Scanner Controls */}
              <div className="mt-5 text-center">
                {cameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border border-cyan-500/50">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-dashed border-cyan-400/60 pointer-events-none m-8 rounded-xl animate-pulse" />
                    <button
                      onClick={stopCamera}
                      className="absolute bottom-3 right-3 rounded-lg bg-red-600/90 px-3 py-1 text-xs font-bold text-white hover:bg-red-600"
                    >
                      Close Camera
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startCamera}
                    className="flex items-center justify-center gap-2 mx-auto rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition"
                  >
                    <Camera size={16} /> Activate Camera Scanner
                  </button>
                )}
              </div>

              {/* Manual Token / ID Input */}
              <div className="mt-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Paste QR Token, Team ID (NF-BGMI-...), or Pass ID (NF-AUD-...)"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none font-mono"
                />
                <button
                  onClick={() => handleVerify()}
                  disabled={scanLoading || !scanInput.trim()}
                  className="rounded-xl bg-nf-blue px-6 py-3 text-xs font-bold text-white shadow hover:bg-nf-blue-bright transition disabled:opacity-50"
                >
                  {scanLoading ? "Verifying..." : "Verify"}
                </button>
              </div>

              {actionSuccessMsg && (
                <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs font-bold text-emerald-300 text-center">
                  ✓ {actionSuccessMsg}
                </div>
              )}
            </div>

            {/* Verification Result Card */}
            {scanResult && (
              <div className="rounded-2xl border p-6 shadow-2xl transition-all animate-in fade-in">
                {/* 1. ENTRY APPROVED */}
                {scanResult.status === "APPROVED" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-4 text-emerald-300">
                      <CheckCircle2 size={24} className="shrink-0 text-emerald-400" />
                      <div>
                        <h3 className="font-display text-lg font-black uppercase text-emerald-300">Entry Approved</h3>
                        <p className="text-xs text-emerald-400/80">{scanResult.message}</p>
                      </div>
                    </div>

                    {scanResult.data && (
                      <div className="rounded-xl bg-white/5 p-4 border border-white/10 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="font-mono text-sm font-bold text-cyan-300">{scanResult.data.id}</span>
                          <span className="text-[10px] uppercase font-extrabold text-white/50">{scanResult.data.roleOrGame}</span>
                        </div>
                        <p className="text-base font-bold text-white">{scanResult.data.name}</p>

                        {scanResult.data.members && (
                          <div className="space-y-2 pt-2">
                            <span className="text-[10px] uppercase font-bold text-white/40">Duo Roster:</span>
                            {scanResult.data.members.map((m, idx) => (
                              <div key={idx} className="flex justify-between text-xs bg-white/5 p-2 rounded">
                                <span className="font-semibold text-white">{m.role}: {m.name}</span>
                                <span className="text-white/60">ID: {m.collegeId} · Ph: {m.phone}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => handleCheckIn(scanResult.type!, scanResult.data!.id)}
                      disabled={checkInLoading}
                      className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg hover:bg-emerald-500 transition active:scale-[0.99]"
                    >
                      {checkInLoading ? "Processing Entry..." : "Confirm & Check In"}
                    </button>
                  </div>
                )}

                {/* 2. ALREADY CHECKED IN */}
                {scanResult.status === "ALREADY_CHECKED_IN" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-amber-500/15 border border-amber-500/40 p-4 text-amber-300">
                      <AlertTriangle size={24} className="shrink-0 text-amber-400" />
                      <div>
                        <h3 className="font-display text-lg font-black uppercase text-amber-300">Already Checked In</h3>
                        <p className="text-xs text-amber-400/80">{scanResult.message}</p>
                      </div>
                    </div>

                    {scanResult.data && (
                      <div className="rounded-xl bg-white/5 p-4 border border-white/10 text-xs text-white/80 space-y-1">
                        <p><strong>ID:</strong> <span className="font-mono text-cyan-300">{scanResult.data.id}</span></p>
                        <p><strong>Name:</strong> {scanResult.data.name}</p>
                        {scanResult.data.checkedInAt && (
                          <p className="text-amber-400"><strong>Checked In Time:</strong> {new Date(scanResult.data.checkedInAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}

                    {/* Role Restricted Undo Check-in */}
                    {sessionUser.role === "admin" ? (
                      <button
                        onClick={() => handleUndoCheckIn(scanResult.type!, scanResult.data!.id)}
                        disabled={checkInLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                      >
                        <RotateCcw size={14} /> Revert / Undo Check-in (Admin Only)
                      </button>
                    ) : (
                      <p className="text-center text-[11px] text-white/40 italic">
                        Note: Only Head Admins have permission to revert a checked-in pass.
                      </p>
                    )}
                  </div>
                )}

                {/* 3. INVALID OR CANCELLED */}
                {(scanResult.status === "INVALID" || scanResult.status === "REGISTRATION_CANCELLED") && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-500/15 border border-red-500/40 p-4 text-red-300">
                    <XCircle size={24} className="shrink-0 text-red-400" />
                    <div>
                      <h3 className="font-display text-lg font-black uppercase text-red-300">Invalid Pass</h3>
                      <p className="text-xs text-red-400/80">{scanResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. MANUAL SEARCH TAB (PEN-AND-PAPER BACKUP) */}
        {/* ==================================================================== */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-6">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Search className="text-cyan-400" /> Manual Attendee Search
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Primary backup for desk operations. Search by Team ID, Pass ID, Mobile Number, Scholar / College ID, or Player Name.
              </p>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by Mobile, College ID (0103...), Name, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="rounded-xl bg-nf-blue px-6 py-3 text-xs font-bold text-white hover:bg-nf-blue-bright transition"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Teams Results */}
              {searchResults.teams.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-6 space-y-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-400">
                    BGMI Teams ({searchResults.teams.length})
                  </h3>
                  <div className="space-y-3">
                    {searchResults.teams.map((team) => {
                      const isCheckedIn = team.check_in_status === "checked_in";
                      const members = team.members || team.participants || [];
                      const leader = members.find((m: any) => m.role === "leader") || members[0] || {};
                      const member2 = members.find((m: any) => m.role === "member") || members[1] || {};

                      return (
                        <div key={team.team_id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-cyan-300">{team.team_id}</span>
                              <span className="text-sm font-extrabold text-white">{team.name}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                  isCheckedIn ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {isCheckedIn ? "Checked In" : "Pending"}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-white/70 space-y-0.5">
                              <p><strong>Leader:</strong> {leader.full_name} ({leader.phone}) · ID: {leader.college_id}</p>
                              <p><strong>Member 2:</strong> {member2.full_name} ({member2.phone}) · ID: {member2.college_id}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isCheckedIn ? (
                              <button
                                onClick={() => handleCheckIn("participant", team.team_id)}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                              >
                                Check In
                              </button>
                            ) : (
                              sessionUser.role === "admin" && (
                                <button
                                  onClick={() => handleUndoCheckIn("participant", team.team_id)}
                                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                                >
                                  Undo Check-in
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Audience Results */}
              {searchResults.audience.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-6 space-y-4">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-400">
                    Audience Passes ({searchResults.audience.length})
                  </h3>
                  <div className="space-y-3">
                    {searchResults.audience.map((aud) => {
                      const isCheckedIn = aud.check_in_status === "checked_in";
                      return (
                        <div key={aud.pass_id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-cyan-300">{aud.pass_id}</span>
                              <span className="text-sm font-extrabold text-white">{aud.full_name}</span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                  isCheckedIn ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {isCheckedIn ? "Checked In" : "Pending"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-white/70">
                              Phone: {aud.phone} · College ID: {aud.college_id} · Email: {aud.email}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isCheckedIn ? (
                              <button
                                onClick={() => handleCheckIn("audience", aud.pass_id)}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
                              >
                                Check In
                              </button>
                            ) : (
                              sessionUser.role === "admin" && (
                                <button
                                  onClick={() => handleUndoCheckIn("audience", aud.pass_id)}
                                  className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition"
                                >
                                  Undo Check-in
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.teams.length === 0 && searchResults.audience.length === 0 && !searchLoading && (
                <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-8 text-center text-xs text-white/50">
                  No matching teams or audience passes found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4. CSV EXPORT TAB (PHYSICAL PEN-AND-PAPER SHEETS) */}
        {/* ==================================================================== */}
        {activeTab === "export" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d1f33] p-6 shadow-xl">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="text-cyan-400" /> Export Physical Check-in Sheets
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Download printable CSV spreadsheets formatted specifically for physical clipboard check-in desks with signature columns.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-white">BGMI Teams Sheet</h3>
                    <p className="text-xs text-white/50 mt-1">
                      Includes Team ID, Team Name, Leader Name & Mobile, Player 2 Name & Mobile, Registration Time, and Check-in boxes.
                    </p>
                  </div>
                  <a
                    href="/api/admin/export?type=teams"
                    download
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-nf-blue py-3 text-xs font-bold text-white shadow hover:bg-nf-blue-bright transition"
                  >
                    <Download size={14} /> Download Teams CSV
                  </a>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-base font-bold text-white">Audience Entry Sheet</h3>
                    <p className="text-xs text-white/50 mt-1">
                      Includes Pass ID, Attendee Name, Mobile, College Enrollment ID, and Gate check-in verification columns.
                    </p>
                  </div>
                  <a
                    href="/api/admin/export?type=audience"
                    download
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-nf-blue py-3 text-xs font-bold text-white shadow hover:bg-nf-blue-bright transition"
                  >
                    <Download size={14} /> Download Audience CSV
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
