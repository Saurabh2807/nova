"use client";

import { useState } from "react";
import { Users, Shield, AlertCircle, Loader2, Gamepad2 } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TeamCard } from "@/components/registration/TeamCard";

export default function ParticipantRegisterPage() {
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
  const [successData, setSuccessData] = useState<{
    teamId: string;
    teamName: string;
    leaderName: string;
    leaderPhone: string;
    player2Name: string;
    player2Phone: string;
    qrDataUrl: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

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

  return (
    <RegisterShell
      eyebrow="BGMI Tournament Entry"
      title="Register as Participant"
      description="Battlegrounds Mobile India (BGMI) · 2-Player Duo Squad Registration for LNCT Campus Carnival."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Banner Header */}
        <div className="flex items-center justify-between rounded-2xl border border-nf-line bg-gradient-to-r from-blue-50/80 via-white to-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nf-blue text-white shadow-sm">
              <Gamepad2 size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-extrabold text-nf-ink">BGMI Tournament (Duo)</p>
              <p className="text-[11px] font-medium text-nf-ink-soft">Team Size: Exactly 2 Players</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            Registrations Open
          </span>
        </div>

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
              Submitting Registration
            </span>
          </div>

          <Field label="Full Name">
            <input
              required
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
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-nf-blue py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-nf-blue-bright hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Registering Squad...
            </>
          ) : (
            "Complete Squad Registration"
          )}
        </button>

        <p className="text-center text-[11px] text-nf-ink-soft">
          By registering, you confirm that both players are enrolled students and will bring valid College ID cards to the event.
        </p>
      </form>
    </RegisterShell>
  );
}
