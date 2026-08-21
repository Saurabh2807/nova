"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Ticket, Sparkles } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TicketCard } from "@/components/registration/TicketCard";
import { flagshipEvent } from "@/lib/data";

export default function AudienceRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    collegeId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    passId: string;
    name: string;
    phone: string;
    collegeId: string;
    qrDataUrl: string;
  } | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

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
        title="You&rsquo;re on the guest list."
        description="Here is your official entry pass for Nova Forge Campus Carnival."
      >
        <TicketCard
          name={successData.name}
          phone={successData.phone}
          collegeId={successData.collegeId}
          ticketId={successData.passId}
          eventLabel={`${flagshipEvent.name} · ${flagshipEvent.dateLabel}`}
          qrDataUrl={successData.qrDataUrl}
        />
      </RegisterShell>
    );
  }

  return (
    <RegisterShell
      eyebrow="Step into the crowd"
      title="Register as Audience"
      description="Claim your free entry ticket to the Nova Forge Campus Carnival at LNCT Bhopal."
    >
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
          <span className="rounded-full bg-cyan-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cyan-800">
            Free Pass
          </span>
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

          <Field label="Enrollment / Scholar No (College ID)" hint="Required for gate verification">
            <input
              required
              className={inputClass}
              placeholder="e.g. 0103IT241045"
              value={form.collegeId}
              onChange={(e) => update("collegeId", e.target.value)}
            />
          </Field>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-nf-blue py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-nf-blue-bright hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating Pass...
            </>
          ) : (
            "Claim Audience Pass"
          )}
        </button>

        <p className="text-center text-[11px] text-nf-ink-soft">
          Please carry your official College ID card to the arena along with your digital ticket.
        </p>
      </form>
    </RegisterShell>
  );
}
