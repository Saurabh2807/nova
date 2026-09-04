"use client";

import { useState, useEffect } from "react";
import { Users, Shield, AlertCircle, Loader2, Gamepad2, Calendar, MapPin, Clock, Building2, Ban, Flame } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TeamCard } from "@/components/registration/TeamCard";

const COLLEGE_OPTIONS = [
  { id: "lnct-main", name: "LNCT Main, Bhopal (0103)", prefix: "0103" },
  { id: "lnct-e", name: "LNCT Excellence - LNCTE, Bhopal (0176)", prefix: "0176" },
  { id: "lnct-s", name: "LNCT Science - LNCTS, Bhopal (0157)", prefix: "0157" },
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
    college: "",
    collegeId: "",
  });
  const [member, setMember] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
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

    if (!leader.college || !member.college) {
      setErrorMsg("Please select college for both Player 1 and Player 2.");
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
        <div className="space-y-6">
          <TeamCard
            teamName={successData.teamName}
            teamId={successData.teamId}
            leaderName={successData.leaderName}
            leaderPhone={successData.leaderPhone}
            player2Name={successData.player2Name}
            player2Phone={successData.player2Phone}
            qrDataUrl={successData.qrDataUrl}
          />
        </div>
      </RegisterShell>
    );
  }

  const isClosed = eventSettings ? !eventSettings.registration_open || eventSettings.isTeamFull : false;

  return (
    <RegisterShell
      eyebrow="Participant Pass"
      title="BGMI Duo Squad Registration"
      description="Register your 2-player BGMI squad for the LAN Esports Championship at LNCT Bhopal."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic Tournament Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-nf-line bg-slate-50/70 p-4">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-nf-ink">
            <Calendar size={15} className="text-nf-blue shrink-0" />
            <span>{eventSettings?.event_date || "19 Sep 2026"} (Day 2)</span>
            <span className="text-slate-300">•</span>
            <MapPin size={15} className="text-nf-blue shrink-0" />
            <span>{eventSettings?.venue || "LNCT Bhopal"}</span>
            <span className="text-slate-300">•</span>
            <Clock size={15} className="text-nf-blue shrink-0" />
            <span>Report by {eventSettings?.reporting_time || "09:00 AM"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              Free Entry
            </span>
          </div>
        </div>

        {/* Live Slot Status Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-nf-line bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nf-blue text-white shadow-sm">
              <Gamepad2 size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-extrabold text-nf-ink">BGMI 2-Player Duo Format</p>
              <p className="text-[11px] font-medium text-nf-ink-soft">LAN Final Stage • LNCT Campus</p>
            </div>
          </div>
          {isClosed ? (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-800">
              <Ban size={12} /> Slots Full / Closed
            </span>
          ) : (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-800">
                <Flame size={12} className="text-orange-600" /> Slots Active
              </span>
              {eventSettings?.remainingTeamSlots !== undefined && (
                <p className="mt-1 text-[10px] font-bold text-slate-500">
                  {eventSettings.remainingTeamSlots} team slots left
                </p>
              )}
            </div>
          )}
        </div>

        {/* Closed Warning if applicable */}
        {isClosed && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="font-bold">Team registrations are currently closed or tournament capacity is full.</p>
              <p className="mt-0.5 text-amber-800/90 font-normal">
                If additional spots or backup slots open up, they will be announced on the Nova Forge Discord.
              </p>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Squad Details Card */}
        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <Field label="Team / Duo Name">
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

        {/* Player 1 Card */}
        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-nf-blue" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nf-ink">Player 1 (Team Leader)</h3>
            </div>
            <span className="text-[10.5px] font-bold text-nf-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Primary Contact
            </span>
          </div>

          <Field label="Full Name">
            <input
              required
              disabled={isClosed}
              className={inputClass}
              placeholder="Leader Full Name"
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
            <Field label="Select College">
              <select
                required
                disabled={isClosed}
                value={leader.college}
                onChange={(e) => setLeader((l) => ({ ...l, college: e.target.value }))}
                className={`${inputClass} font-medium ${leader.college ? "text-slate-800" : "text-slate-400"}`}
              >
                <option value="" disabled>
                  Select College
                </option>
                {COLLEGE_OPTIONS.map((c) => (
                  <option key={c.id} value={c.name} className="text-slate-800">
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
                placeholder="e.g. 0103CS231045"
                value={leader.collegeId}
                onChange={(e) => setLeader((l) => ({ ...l, collegeId: e.target.value.toUpperCase() }))}
              />
            </Field>
          </div>
        </div>

        {/* Player 2 Card */}
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
            <Field label="Select College">
              <select
                required
                disabled={isClosed}
                value={member.college}
                onChange={(e) => setMember((m) => ({ ...m, college: e.target.value }))}
                className={`${inputClass} font-medium ${member.college ? "text-slate-800" : "text-slate-400"}`}
              >
                <option value="" disabled>
                  Select College
                </option>
                {COLLEGE_OPTIONS.map((c) => (
                  <option key={c.id} value={c.name} className="text-slate-800">
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
