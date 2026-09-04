"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2, Ticket, Calendar, MapPin, Clock, Ban } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TicketCard } from "@/components/registration/TicketCard";
import { flagshipEvent } from "@/lib/data";

const COLLEGE_OPTIONS = [
  { id: "lnct-main", name: "LNCT Main, Bhopal (0103)", prefix: "0103" },
  { id: "lnct-e", name: "LNCT Excellence - LNCTE, Bhopal (0176)", prefix: "0176" },
  { id: "lnct-s", name: "LNCT Science - LNCTS, Bhopal (0157)", prefix: "0157" },
  { id: "lnctu", name: "LNCT University (LNCTU), Bhopal", prefix: "LNCTU" },
  { id: "lncp", name: "LNCP (Pharmacy), Bhopal", prefix: "LNCP" },
  { id: "lnct-mca-mba", name: "LNCT MCA / MBA Department", prefix: "LNCT-PG" },
  { id: "other", name: "Other College / External Institution", prefix: "" },
];

export default function AudienceRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
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
    remainingAudienceSlots: number;
    isAudienceFull: boolean;
  } | null>(null);

  const [successData, setSuccessData] = useState<{
    passId: string;
    name: string;
    phone: string;
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

    try {
      const res = await fetch("/api/register/audience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          collegeId: form.collegeId.trim(),
        }),
      });

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
        collegeId: data.audience.college_id,
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
        eyebrow="Audience Pass"
        title="You’re on the guest list."
        description="Here is your official entry pass for Nova Forge Campus Carnival."
      >
        <TicketCard
          name={successData.name}
          phone={successData.phone}
          collegeId={successData.collegeId}
          ticketId={successData.passId}
          eventLabel={`${flagshipEvent.name} · ${eventSettings?.event_date || flagshipEvent.dateLabel}`}
          qrDataUrl={successData.qrDataUrl}
        />
      </RegisterShell>
    );
  }

  const isClosed = eventSettings !== null && (!eventSettings.registration_open || eventSettings.isAudienceFull);

  return (
    <RegisterShell
      eyebrow="Step into the crowd"
      title="Register as Audience"
      description="Claim your free entry ticket to the Nova Forge Campus Carnival at LNCT Bhopal."
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
          <span>Entry: {eventSettings?.reporting_time || "09:00 AM"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          {isClosed ? (
            <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-red-800">
              <Ban size={12} /> Closed
            </span>
          ) : (
            <div className="text-right">
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-800">
                Free Pass
              </span>
              {eventSettings?.remainingAudienceSlots !== undefined && (
                <p className="mt-1 text-[10px] font-bold text-slate-500">
                  {eventSettings.remainingAudienceSlots} passes left
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
              <p className="font-bold">Audience pass registrations are currently closed or at full capacity.</p>
              <p className="mt-0.5 text-amber-800/90 font-normal">
                Please check with desk organizers on the event day for spot entry availability.
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

        <div className="rounded-2xl border border-nf-line bg-white p-5 space-y-4 shadow-sm">
          <Field label="Full Name">
            <input
              required
              disabled={isClosed}
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
                disabled={isClosed}
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
                disabled={isClosed}
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
                disabled={isClosed}
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
                disabled={isClosed}
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
          disabled={loading || isClosed}
          className="w-full rounded-2xl bg-nf-blue py-4 font-display font-extrabold text-white text-base shadow-md transition-all hover:bg-nf-blue-bright active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Generating Entry Pass & QR Code...</span>
            </>
          ) : isClosed ? (
            <span>Passes Unavailable</span>
          ) : (
            <span>Claim Free Audience Pass</span>
          )}
        </button>

        <p className="text-center text-[11.5px] text-nf-ink-soft">
          Please carry your physical College ID card to the arena along with your digital QR pass.
        </p>
      </form>
    </RegisterShell>
  );
}
