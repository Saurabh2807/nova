"use client";

import { useState, useEffect } from "react";
import { Users, Shield, AlertCircle, Loader2, Gamepad2, Calendar, MapPin, Clock, Building2, Ban, Flame, Search, Instagram } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TeamCard } from "@/components/registration/TeamCard";
import { FindPassModal } from "@/components/registration/FindPassModal";
import { COLLEGE_OPTIONS } from "@/lib/config/colleges";

export default function ParticipantRegisterPage() {
  const [teamName, setTeamName] = useState("");
  const [website, setWebsite] = useState("");
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
  const [findPassOpen, setFindPassOpen] = useState(false);
  const [eventSettings, setEventSettings] = useState<{
    event_name?: string;
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
    leaderEmail?: string;
    player2Name: string;
    player2Phone: string;
    player2Email?: string;
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/register/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          teamName: teamName.trim(),
          game: "bgmi",
          website: website.trim(),
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

      clearTimeout(timeoutId);

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
        leaderEmail: leader.email.trim(),
        player2Name: member.fullName.trim(),
        player2Phone: member.phone.trim(),
        player2Email: member.email.trim(),
        qrDataUrl: data.qrDataUrl,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        setErrorMsg(
          "The registration request timed out. Your registration may have already succeeded in the database! Please DO NOT submit again. Open 'Find My Pass' with your email to check your confirmation."
        );
      } else {
        setErrorMsg("An unexpected network error occurred. If you submitted, please check 'Find My Pass' before re-registering.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (successData) {
    return (
      <RegisterShell
        eyebrow="Participant Pass"
        title="Squad Slot Confirmed"
        description={`Your BGMI duo team is registered for the ${eventSettings?.event_name || "Campus Unleashed"} on Day 2.`}
      >
        <div className="space-y-6">
          <TeamCard
            teamName={successData.teamName}
            teamId={successData.teamId}
            leaderName={successData.leaderName}
            leaderPhone={successData.leaderPhone}
            leaderEmail={successData.leaderEmail}
            player2Name={successData.player2Name}
            player2Phone={successData.player2Phone}
            player2Email={successData.player2Email}
            qrDataUrl={successData.qrDataUrl}
          />
        </div>
      </RegisterShell>
    );
  }

  const isClosed = eventSettings ? !eventSettings.registration_open || eventSettings.isTeamFull : false;

  return (
    <>
      <RegisterShell
        eyebrow="Participant Pass"
        title="BGMI Duo Squad Registration"
        description={`Register your 2-player BGMI squad for the ${eventSettings?.event_name || "Nova Forge"} LAN Esports Championship at ${eventSettings?.venue || "LNCT Bhopal"}.`}
      >
        {/* Already Registered Link */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50/60 border border-blue-100/80 px-4 py-2.5 text-xs text-slate-700">
          <span>Already registered your squad?</span>
          <button
            type="button"
            onClick={() => setFindPassOpen(true)}
            className="flex items-center gap-1 font-bold text-nf-blue hover:underline"
          >
            <Search size={13} />
            <span>Find My Team Pass</span>
          </button>
        </div>

        {isClosed ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 text-center shadow-sm space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs">
              <Ban size={30} />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-rose-800">
                Registrations Closed
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                Registrations Are Closed
              </h2>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Registrations are closed. If registrations opens up again we will inform you on instagram
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://instagram.com/novaforge.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <Instagram size={16} />
                <span>Follow on Instagram (@novaforge.gg)</span>
              </a>

              <button
                type="button"
                onClick={() => setFindPassOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-white hover:border-[#2872A1] hover:text-[#2872A1] transition-all w-full sm:w-auto"
              >
                <Search size={15} />
                <span>Find My Team Pass</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - invisible to real users */}
            <div className="opacity-0 absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
              <label htmlFor="participant-website">Leave blank</label>
              <input
                id="participant-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Dynamic Tournament Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-nf-line bg-slate-50/70 p-4">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-nf-ink">
                <Calendar size={15} className="text-nf-blue shrink-0" />
                <span>{eventSettings?.event_date || "19 Sep 2026"} (Day 2)</span>
                <span className="text-slate-300">•</span>
                <MapPin size={15} className="text-nf-blue shrink-0" />
                <span>Ramanujam Auditorium</span>
                <span className="text-slate-300">•</span>
                <Clock size={15} className="text-nf-blue shrink-0" />
                <span>Report by 9:00 AM</span>
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
              <div className="text-right">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-800">
                  <Flame size={12} className="text-orange-600" /> Slots Active
                </span>
              </div>
            </div>

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
                  className={inputClass}
                  placeholder="e.g. Soul Reapers, Godlike LNCT"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </Field>
            </div>

            {/* Player 1 Card (Leader) */}
            <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-nf-line pb-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-nf-blue" />
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-nf-ink">
                    Player 1 (Team Leader)
                  </span>
                </div>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nf-blue">
                  Primary Contact
                </span>
              </div>

              <Field label="Full Name">
                <input
                  required
                  className={inputClass}
                  placeholder="Leader's full name"
                  value={leader.fullName}
                  onChange={(e) => setLeader((l) => ({ ...l, fullName: e.target.value }))}
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
                    value={leader.phone}
                    onChange={(e) => setLeader((l) => ({ ...l, phone: e.target.value.replace(/\D/g, "") }))}
                  />
                </Field>
                <Field label="Email Address" hint="Pass will be emailed here">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Select College">
                  <select
                    required
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
              <div className="flex items-center justify-between border-b border-nf-line pb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-nf-blue" />
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-nf-ink">
                    Player 2 (Duo Partner)
                  </span>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nf-ink-soft">
                  Team Member
                </span>
              </div>

              <Field label="Full Name">
                <input
                  required
                  className={inputClass}
                  placeholder="Player 2's full name"
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
                <Field label="Email Address" hint="Pass will be emailed here">
                  <input
                    required
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
              disabled={loading}
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
              By registering, both players agree to arrive at Ramanujam Auditorium by <strong>9:00 AM</strong> with their physical College ID card.
            </p>
          </form>
        )}
      </RegisterShell>

      <FindPassModal isOpen={findPassOpen} onClose={() => setFindPassOpen(false)} />
    </>
  );
}
