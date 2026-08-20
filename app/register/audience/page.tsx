"use client";

import { useState } from "react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TicketCard } from "@/components/registration/TicketCard";
import { flagshipEvent } from "@/lib/data";

function genTicketId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NF-AUD-${rand}`;
}

export default function AudienceRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    year: "",
    enrollment: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId] = useState(genTicketId);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <RegisterShell
        eyebrow="Audience Pass"
        title="You&rsquo;re on the list."
        description="Here&rsquo;s your entry ticket for the Nova Forge Campus Carnival."
      >
        <TicketCard name={form.name} ticketId={ticketId} eventLabel={`${flagshipEvent.name} · ${flagshipEvent.dateLabel}`} />
      </RegisterShell>
    );
  }

  return (
    <RegisterShell
      eyebrow="Step into the crowd"
      title="Register as Audience"
      description="Just a few details to get you into the Nova Forge Campus Carnival — no entry fee."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full Name">
          <input
            required
            className={inputClass}
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Phone Number">
            <input
              required
              type="tel"
              className={inputClass}
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="Email Address">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Year of Study">
            <select
              required
              className={inputClass}
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
            >
              <option value="" disabled>Select year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
              <option>Not a student</option>
            </select>
          </Field>
          <Field label="Enrollment Number" hint="Leave blank if not applicable">
            <input
              className={inputClass}
              placeholder="e.g. 0102CS250000"
              value={form.enrollment}
              onChange={(e) => update("enrollment", e.target.value)}
            />
          </Field>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-nf-blue py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Confirm Registration
        </button>
      </form>
    </RegisterShell>
  );
}
