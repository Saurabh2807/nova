"use client";

import { useState, useEffect } from "react";
import { Users, Shield, AlertCircle, Loader2, Gamepad2, Calendar, MapPin, Clock, CheckCircle, Ban } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TeamCard } from "@/components/registration/TeamCard";

const GAME_OPTIONS = [
  { id: "bgmi", name: "BGMI", type: "Duo (2 Players)", badge: "Featured" },
  { id: "valorant", name: "Valorant", type: "Squad / Duo", badge: "PC Esports" },
  { id: "freefire", name: "Free Fire", type: "Duo Squad", badge: "Mobile" },
];

export default function ParticipantRegisterPage() {
  const [selectedGame, setSelectedGame] = useState("bgmi");
  const [teamName, setTeamName] = useState("");
  const [leader, setLeader] = useState({
    fullName: "",
    email: "",
    phone: "",
    collegeId: "",
  });
  const [member, setMember] = useState({
    fullName: "",
    email: "",
    phone: "",
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

  // Fetch live event settings on mount
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

    // Client-side quick validations
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(leader.phone.trim())) {
      setErrorMsg("Team Leader phone number must be exactly 10 digits.");
      return;
    }
    if (!phoneRegex.test(member.phone.trim())) {
      setErrorMsg("Player 2 phone number must be exactly 10 digits.");
      return;
    }
    if (leader.email.trim().toLowerCase() === member.email.trim().toLowerCase()) {
      setErrorMsg("Player 1 and Player 2 cannot have the same email address.");
      return;
    }
    if (leader.phone.trim() === member.phone.trim()) {
      setErrorMsg("Player 1 and Player 2 cannot have the same phone number.");
      return;
    }
    if (leader.collegeId.trim().toLowerCase() === member.collegeId.trim().toLowerCase()) {
      setErrorMsg("Player 1 and Player 2 cannot have the same College Enrollment / Scholar No.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName: teamName.trim(),
          game: selectedGame,
          leader: {
            fullName: leader.fullName.trim(),
            email: leader.email.trim(),
            phone: leader.phone.trim(),
            collegeId: leader.collegeId.trim(),
          },
          member: {
            fullName: member.fullName.trim(),
            email: member.email.trim(),
            phone: member.phone.trim(),
            collegeId: member.collegeId.trim(),
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to complete registration. Please check your details.");
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
      setErrorMsg("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (successData) {
    return (
      <RegisterShell
        eyebrow="Participant Pass"
        title="Squad Slot Confirmed"
        description={`Your ${selectedGame.toUpperCase()} duo team is registered for the Nova Forge Campus Carnival on Day 2.`}
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
      title="Register as Participant"
      description="Battle it out at Nova Forge Campus Carnival. Register your 2-player squad for the championship."
    >
      {/* Event Meta Live Banner */}
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
        {/* Game Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-nf-ink">
            Select Tournament Game
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {GAME_OPTIONS.map((g) => {
              const active = selectedGame === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGame(g.id)}
                  className={`flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all ${
                    active
                      ? "border-nf-blue bg-blue-50/60 shadow-xs ring-2 ring-nf-blue/20"
                      : "border-nf-line bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-display font-black text-sm text-nf-ink">{g.name}</span>
                    {active && <CheckCircle size={14} className="text-nf-blue" />}
                  </div>
                  <span className="text-[10.5px] font-medium text-nf-ink-soft">{g.type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Registration Status Banner */}
        <div className="flex items-center justify-between rounded-2xl border border-nf-line bg-gradient-to-r from-blue-50/80 via-white to-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nf-blue text-white shadow-sm">
              <Gamepad2 size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-extrabold text-nf-ink">
                {selectedGame.toUpperCase()} Championship
              </p>
              <p className="text-[11px] font-medium text-nf-ink-soft">
                Team Size: Exactly 2 Players (Duo Roster)
              </p>
            </div>
          </div>
          {isClosed ? (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-800">
              <Ban size={12} /> Closed
            </span>
          ) : (
            <div className="text-right">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                Registrations Open
              </span>
              {eventSettings?.remainingTeamSlots !== undefined && (
                <p className="mt-1 text-[10px] font-bold text-slate-500">
                  {eventSettings.remainingTeamSlots} slots left
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
              <p className="font-bold">Registrations for this tournament are currently paused or full.</p>
              <p className="mt-0.5 text-amber-800/90 font-normal">
                Please check back later or register as an Audience pass to attend and watch the tournament live!
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

        {/* Team Details */}
        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Users size={16} className="text-nf-blue" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-nf-ink">Team Information</h3>
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

        {/* Player 1: Team Leader */}
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

          <Field label="Enrollment / Scholar No (College ID)" hint="Must match physical college ID card">
            <input
              required
              disabled={isClosed}
              className={inputClass}
              placeholder="e.g. 0103CS231001"
              value={leader.collegeId}
              onChange={(e) => setLeader((l) => ({ ...l, collegeId: e.target.value }))}
            />
          </Field>
        </div>

        {/* Player 2: Team Member */}
        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-nf-ink">Player 2 (Team Member)</h3>
            </div>
            <span className="text-[10.5px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
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
            <Field label="Mobile Number (10 Digits)">
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
                placeholder="member@example.com"
                value={member.email}
                onChange={(e) => setMember((m) => ({ ...m, email: e.target.value }))}
              />
            </Field>
          </div>

          <Field label="Enrollment / Scholar No (College ID)" hint="Must match physical college ID card">
            <input
              required
              disabled={isClosed}
              className={inputClass}
              placeholder="e.g. 0103CS231002"
              value={member.collegeId}
              onChange={(e) => setMember((m) => ({ ...m, collegeId: e.target.value }))}
            />
          </Field>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || isClosed}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-nf-blue py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-nf-blue-bright hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Registering Squad...
            </>
          ) : isClosed ? (
            "Registrations Closed"
          ) : (
            `Complete ${selectedGame.toUpperCase()} Squad Registration`
          )}
        </button>

        <p className="text-center text-[11px] text-nf-ink-soft">
          By registering, you confirm that both players are enrolled students and will bring valid College ID cards to the event.
        </p>
      </form>
    </RegisterShell>
  );
}
