"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2, Ticket, Calendar, MapPin, Clock, Ban, Search, Instagram } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TicketCard } from "@/components/registration/TicketCard";
import { FindPassModal } from "@/components/registration/FindPassModal";
import { flagshipEvent } from "@/lib/data";
import { COLLEGE_OPTIONS } from "@/lib/config/colleges";

export default function AudienceRegisterPage() {
  const [website, setWebsite] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
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
    remainingAudienceSlots: number;
    isAudienceFull: boolean;
  } | null>(null);

  const [successData, setSuccessData] = useState<{
    passId: string;
    name: string;
    phone: string;
    email: string;
    collegeId: string;
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

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (eventSettings && !eventSettings.registration_open) {
      setErrorMsg("Audience pass registrations are currently closed by the organizers.");
      return;
    }

    if (eventSettings && eventSettings.isAudienceFull) {
      setErrorMsg("Audience entry passes are completely full.");
      return;
    }

    if (!form.college) {
      setErrorMsg("Please select your college.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      setErrorMsg("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/register/audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          collegeId: form.collegeId.trim(),
          website: website.trim(),
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to register audience pass. Please check your details.");
        setLoading(false);
        return;
      }

      setSuccessData({
        passId: data.audience.pass_id,
        name: data.audience.full_name,
        phone: data.audience.phone,
        email: form.email.trim(),
        collegeId: data.audience.college_id,
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
        eyebrow="Audience Pass"
        title="You’re on the guest list."
        description={`Here is your official entry pass for ${eventSettings?.event_name || "Campus Unleashed"}.`}
      >
        <TicketCard
          name={successData.name}
          phone={successData.phone}
          email={successData.email}
          collegeId={successData.collegeId}
          ticketId={successData.passId}
          eventLabel={`${eventSettings?.event_name || flagshipEvent.name} · ${eventSettings?.event_date || flagshipEvent.dateLabel}`}
          qrDataUrl={successData.qrDataUrl}
        />
      </RegisterShell>
    );
  }

  const isClosed = eventSettings !== null && (!eventSettings.registration_open || eventSettings.isAudienceFull);

  return (
    <>
      <RegisterShell
        eyebrow="Step into the crowd"
        title="Register as Audience"
        description={`Claim your free entry ticket to the ${eventSettings?.event_name || "Campus Unleashed"} at Aryabhatt auditorium.`}
      >
        {/* Already Registered Link */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50/60 border border-blue-100/80 px-4 py-2.5 text-xs text-slate-700">
          <span>Already registered for a pass?</span>
          <button
            type="button"
            onClick={() => setFindPassOpen(true)}
            className="flex items-center gap-1 font-bold text-nf-blue hover:underline"
          >
            <Search size={13} />
            <span>Find My Pass</span>
          </button>
        </div>

        {/* Event Meta Live Banner */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold text-nf-ink-soft bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-nf-blue shrink-0" />
            <span>{eventSettings?.event_date || "18–19 Sep 2026"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-nf-blue shrink-0" />
            <span>Aryabhatt auditorium</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-nf-blue shrink-0" />
            <span>Entry: 1:15 PM</span>
          </div>
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
                <span>Find My Pass</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot field - invisible to real users */}
            <div className="opacity-0 absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
              <label htmlFor="audience-website">Leave blank</label>
              <input
                id="audience-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-nf-line bg-gradient-to-r from-blue-50/80 via-white to-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nf-blue text-white shadow-sm">
                  <Ticket size={20} />
                </div>
                <div>
                  <p className="font-display text-sm font-extrabold text-nf-ink">Campus Arena Pass</p>
                  <p className="text-[11px] font-medium text-nf-ink-soft">Free entry with valid College ID</p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-800">
                  Free Pass
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

            <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
              <Field label="Full Name">
                <input
                  required
                  className={inputClass}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
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
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                  />
                </Field>
                <Field label="Email Address" hint="Pass will be emailed here">
                  <input
                    required
                    type="email"
                    className={inputClass}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Select College">
                  <select
                    required
                    value={form.college}
                    onChange={(e) => update("college", e.target.value)}
                    className={`${inputClass} font-medium ${form.college ? "text-slate-800" : "text-slate-400"}`}
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
                    placeholder="e.g. 0103IT241045"
                    value={form.collegeId}
                    onChange={(e) => update("collegeId", e.target.value.toUpperCase())}
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
                  <span>Generating Entry Pass & QR Code...</span>
                </>
              ) : (
                <span>Claim Free Audience Pass</span>
              )}
            </button>

            <p className="text-center text-[11.5px] text-nf-ink-soft">
              Please carry your physical College ID card to the arena along with your digital QR pass.
            </p>
          </form>
        )}
      </RegisterShell>

      <FindPassModal isOpen={findPassOpen} onClose={() => setFindPassOpen(false)} />
    </>
  );
}
