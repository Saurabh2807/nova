"use client";

import { LogoMark } from "@/components/Logo";
import { CheckCircle2 } from "lucide-react";

export function TicketCard({
  name,
  ticketId,
  eventLabel,
}: {
  name: string;
  ticketId: string;
  eventLabel: string;
}) {
  return (
    <div className="mx-auto max-w-sm">
      <div className="flex items-center gap-2 rounded-t-2xl bg-nf-navy px-5 py-2.5 text-white">
        <CheckCircle2 size={16} className="text-nf-blue-bright" />
        <span className="text-xs font-semibold uppercase tracking-wide">Registration Confirmed</span>
      </div>
      <div className="hex-grid-bg relative overflow-hidden rounded-b-2xl border border-t-0 border-nf-line bg-nf-navy p-6 text-white">
        <div className="flex items-center justify-between">
          <LogoMark className="h-9 w-9 text-nf-blue-bright" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
            Audience Pass
          </span>
        </div>

        <p className="mt-5 text-xs uppercase tracking-wide text-white/50">Attendee</p>
        <p className="font-display text-xl font-bold">{name}</p>

        <p className="mt-4 text-xs uppercase tracking-wide text-white/50">Event</p>
        <p className="text-sm font-medium text-white/80">{eventLabel}</p>

        <div className="mt-6 flex items-center justify-between border-t border-dashed border-white/20 pt-4">
          <span className="text-[10px] uppercase tracking-wide text-white/40">Ticket ID</span>
          <span className="font-mono text-sm font-semibold tracking-wider text-nf-blue-bright">
            {ticketId}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-nf-ink-soft">
        A copy of this ticket has been sent to your email. Show the Ticket ID at entry for verification.
      </p>
    </div>
  );
}
