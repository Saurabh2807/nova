"use client";

import { useState, useEffect } from "react";
import { Users, Shield, AlertCircle, Loader2, Gamepad2, Calendar, MapPin, Clock, Building2, Ban, Flame } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TeamCard } from "@/components/registration/TeamCard";

export const COLLEGE_OPTIONS = [
  { id: "lnct-main", name: "LNCT Main, Bhopal (0103)", prefix: "0103" },
  { id: "lnct-s", name: "LNCT Science - LNCTS, Bhopal (0176)", prefix: "0176" },
  { id: "lnct-e", name: "LNCT Excellence - LNCTE, Bhopal (0157)", prefix: "0157" },
  { id: "lnctu", name: "LNCT University (LNCTU), Bhopal", prefix: "LNCTU" },
  { id: "lncp", name: "LNCP (Pharmacy), Bhopal", prefix: "LNCP" },
  { id: "lnct-mca-mba", name: "LNCT MCA / MBA Department", prefix: "LNCT-PG" },
  { id: "other", name: "Other College / External Institution", prefix: "" },
];

export default function ParticipantRegisterPage() {
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "LNCT Main, Bhopal (0103)",
    collegeId: "",
  });
  const [member, setMember] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "LNCT Main, Bhopal (0103)",
    collegeId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [eventSettings, setEventSettings] = useState<{
    registration_open: boolean;
    event_date: string;
    venue: string;
    reporting_time: string;
    remainingTeamSlots: number;
    isTeamFull: boolean;
  } | null>(null);

  const [successData, setSuccessData] = useState<{
    teamId: string;
    teamName: string;
    leaderName: string;
    leaderPhone: string;
    player2Name: string;
    player2Phone: string;
    qrDataUrl: string;
  } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/event/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setEventSettings(data.settings);
        }
      } catch (err) {
        console.warn("Could not load dynamic settings:", err);
      }
    }
    fetchSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (eventSettings && !eventSettings.registration_open) {
      setErrorMsg("Registrations are currently closed by the organizers.");
      return;
    }

    if (eventSettings && eventSettings.isTeamFull) {
      setErrorMsg("Tournament team slots are completely full.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(leader.phone.trim()) || !phoneRegex.test(member.phone.trim())) {
      setErrorMsg("Phone numbers must be exactly 10 digits.");
      return;
    }
    if (leader.email.trim().toLowerCase() === member.email.trim().toLowerCase()) {
      setErrorMsg("Player 1 and Player 2 cannot have the same email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          game: "bgmi",
          leader: {
            fullName: leader.fullName.trim(),
            email: leader.email.trim(),
            phone: leader.phone.trim(),
            college: leader.college,
            collegeId: leader.collegeId.trim(),
          },
          member: {
            fullName: member.fullName.trim(),
            email: member.email.trim(),
            phone: member.phone.trim(),
            college: member.college,
            collegeId: member.collegeId.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to complete registration.");
        setLoading(false);
        return;
      }

      setSuccessData({
        teamId: data.team.team_id,
        teamName: data.team.name,
        leaderName: leader.fullName.trim(),
        leaderPhone: leader.phone.trim(),
        player2Name: member.fullName.trim(),
        player2Phone: member.phone.trim(),
        qrDataUrl: data.qrDataUrl,
      });
    } catch (err: any) {
      setErrorMsg("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (successData) {
    return (
      <RegisterShell
        eyebrow="Participant Pass"
        title="Squad Slot Confirmed"
        description="Your BGMI duo team is registered for the Nova Forge Campus Carnival on Day 2."
      >
        <TeamCard
          teamName={successData.teamName}
          teamId={successData.teamId}
          leaderName={successData.leaderName}
          leaderPhone={successData.leaderPhone}
          player2Name={successData.player2Name}
          player2Phone={successData.player2Phone}
          qrDataUrl={successData.qrDataUrl}
        />
      </RegisterShell>
    );
  }

  const isClosed = eventSettings !== null && (!eventSettings.registration_open || eventSettings.isTeamFull);

  return (
    <RegisterShell
      eyebrow="Tournament Entry"
      title="BGMI Championship Registration"
      description="Register your 2-player BGMI squad for the LAN Esports Championship at LNCT Bhopal."
    >
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-nf-ink-soft bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-nf-blue shrink-0" />
          <span>{eventSettings?.event_date || "18–19 Sep 2026"}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-nf-blue shrink-0" />
          <span>{eventSettings?.venue || "LNCT Bhopal"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-nf-blue shrink-0" />
          <span>Reporting: {eventSettings?.reporting_time || "09:00 AM"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-nf-blue/30 bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-transparent p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-nf-blue text-white shadow-md">
              <Gamepad2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-base font-black text-nf-ink tracking-tight">
                  BGMI LAN TOURNAMENT
                </p>
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-amber-700">
                  <Flame size={11} className="text-amber-600" /> Day 2 LAN
                </span>
              </div>
              <p className="text-[11.5px] font-semibold text-nf-ink-soft">
                Team Format: <strong>2 Players (Duo Squad)</strong> · Erangel & Miramar
              </p>
            </div>
          </div>
          {isClosed ? (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-red-800">
              <Ban size={12} /> Closed
            </span>
          ) : (
            <div className="text-right">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Slots Open
              </span>
              {eventSettings?.remainingTeamSlots !== undefined && (
                <p className="mt-1 text-[10px] font-bold text-slate-500">
                  {eventSettings.remainingTeamSlots} slots left
                </p>
              )}
            </div>
          )}
        </div>

        {isClosed && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="font-bold">BGMI tournament slots are currently full or registrations are closed.</p>
              <p className="mt-0.5 text-amber-800/90 font-normal">
                Please check back later or register for an Audience Pass to watch the LAN matches live!
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Users size={16} className="text-nf-blue" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-nf-ink">Team / Squad Information</h3>
          </div>
          <Field label="Team / Squad Name" hint="Must be unique across the tournament">
            <input
              required
              disabled={isClosed}
              className={inputClass}
              placeholder="e.g. Soul Reapers, Godlike LNCT"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-nf-blue" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nf-ink">Player 1 (Team Leader)</h3>
            </div>
            <span className="text-[10.5px] font-bold text-nf-blue bg-nf-blue/10 px-2.5 py-0.5 rounded-full">
              Primary Contact
            </span>
          </div>

          <Field label="Full Name">
            <input
              required
              disabled={isClosed}
              className={inputClass}
              placeholder="Leader's Full Name"
              value={leader.fullName}
              onChange={(e) => setLeader((l) => ({ ...l, fullName: e.target.value }))}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Mobile Number (10 Digits)" hint="WhatsApp / Calling">
              <input
                required
                disabled={isClosed}
                type="tel"
                maxLength={10}
                className={inputClass}
                placeholder="10-digit number"
                value={leader.phone}
                onChange={(e) => setLeader((l) => ({ ...l, phone: e.target.value.replace(/\D/g, "") }))}
              />
            </Field>
            <Field label="Email Address" hint="Leader ticket will be sent here">
              <input
                required
                disabled={isClosed}
                type="email"
                className={inputClass}
                placeholder="leader@example.com"
                value={leader.email}
                onChange={(e) => setLeader((l) => ({ ...l, email: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Select College / Campus">
              <select
                disabled={isClosed}
                value={leader.college}
                onChange={(e) => setLeader((l) => ({ ...l, college: e.target.value }))}
                className={`${inputClass} font-medium text-slate-800`}
              >
                {COLLEGE_OPTIONS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Enrollment / Scholar No" hint="Must match your physical College ID card">
              <input
                required
                disabled={isClosed}
                className={inputClass}
                placeholder="e.g. 0103CS231045"
                value={leader.collegeId}
                onChange={(e) => setLeader((l) => ({ ...l, collegeId: e.target.value.toUpperCase() }))}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-cyan-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nf-ink">Player 2 (Team Member)</h3>
            </div>
            <span className="text-[10.5px] font-bold text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-100">
              Duo Partner
            </span>
          </div>

          <Field label="Full Name">
            <input
              required
              disabled={isClosed}
              className={inputClass}
              placeholder="Player 2 Full Name"
              value={member.fullName}
              onChange={(e) => setMember((m) => ({ ...m, fullName: e.target.value }))}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Mobile Number (10 Digits)" hint="WhatsApp / Calling">
              <input
                required
                disabled={isClosed}
                type="tel"
                maxLength={10}
                className={inputClass}
                placeholder="10-digit number"
                value={member.phone}
                onChange={(e) => setMember((m) => ({ ...m, phone: e.target.value.replace(/\D/g, "") }))}
              />
            </Field>
            <Field label="Email Address" hint="Member pass will be sent here">
              <input
                required
                disabled={isClosed}
                type="email"
                className={inputClass}
                placeholder="player2@example.com"
                value={member.email}
                onChange={(e) => setMember((m) => ({ ...m, email: e.target.value }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Select College / Campus">
              <select
                disabled={isClosed}
                value={member.college}
                onChange={(e) => setMember((m) => ({ ...m, college: e.target.value }))}
                className={`${inputClass} font-medium text-slate-800`}
              >
                {COLLEGE_OPTIONS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Enrollment / Scholar No" hint="Must match physical College ID card">
              <input
                required
                disabled={isClosed}
                className={inputClass}
                placeholder="e.g. 0103CS231089"
                value={member.collegeId}
                onChange={(e) => setMember((m) => ({ ...m, collegeId: e.target.value.toUpperCase() }))}
              />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || isClosed}
          className="w-full rounded-2xl bg-nf-blue py-4 font-display font-extrabold text-white text-base shadow-md transition-all hover:bg-nf-blue-bright active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Generating Squad Tickets & QR Passes...</span>
            </>
          ) : (
            <span>Complete BGMI Duo Registration</span>
          )}
        </button>

        <p className="text-center text-[11.5px] text-nf-ink-soft">
          By registering, both players agree to arrive at LNCT Bhopal by <strong>{eventSettings?.reporting_time || "09:00 AM"}</strong> with their physical College ID card.
        </p>
      </form>
    </RegisterShell>
  );
}
