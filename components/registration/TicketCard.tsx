"use client";

import { LogoMark } from "@/components/Logo";
import { CheckCircle2, Download, Printer } from "lucide-react";
import Image from "next/image";

interface TicketCardProps {
  name: string;
  phone?: string;
  email?: string;
  collegeId?: string;
  ticketId: string;
  eventLabel?: string;
  qrDataUrl?: string;
}

export function TicketCard({
  name,
  phone,
  email,
  collegeId,
  ticketId,
  eventLabel = "Campus Unleashed · 18–19 Sep 2026",
  qrDataUrl,
}: TicketCardProps) {

  function handlePrint() {
    window.print();
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${ticketId}_AUDIENCE_PASS.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  return (
    <div className="mx-auto max-w-sm">
      {/* Top Banner */}
      <div className="flex items-center justify-between rounded-t-2xl bg-nf-navy px-5 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wide">Audience Pass Confirmed</span>
        </div>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-cyan-300">
          Free Entry
        </span>
      </div>

      {/* Movie-ticket Styled Container */}
      <div className="relative overflow-hidden rounded-b-2xl border border-t-0 border-nf-line bg-[#091522] p-5 text-white shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <LogoMark className="h-7 w-7 text-cyan-400" />
            <span className="font-display text-sm font-extrabold text-white">NOVA FORGE</span>
          </div>
          <span className="rounded bg-nf-blue/20 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
            {ticketId}
          </span>
        </div>

        {/* Attendee details */}
        <div className="mt-4 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Attendee</span>
          <h3 className="font-display text-xl font-bold text-white">{name}</h3>
          {collegeId && <p className="text-xs text-white/60">ID: {collegeId}</p>}
          {phone && <p className="text-[11px] text-white/50">Ph: {phone}</p>}
        </div>

        {/* QR Code */}
        <div className="mt-4 flex flex-col items-center justify-center">
          {qrDataUrl ? (
            <div className="rounded-xl bg-white p-2 shadow-md">
              <Image src={qrDataUrl} alt="Audience Pass QR" width={140} height={140} className="rounded-lg" />
            </div>
          ) : (
            <div className="h-32 w-32 rounded-xl bg-white/10 flex items-center justify-center text-xs text-white/40">
              QR Code
            </div>
          )}
          <span className="mt-2 text-[9px] font-bold uppercase tracking-widest text-white/40">Scan at Gate for Entry</span>
        </div>

        {/* Venue & Date */}
        <div className="mt-5 border-t border-dashed border-white/15 pt-3 text-center text-xs text-white/70">
          <p className="font-semibold text-white">Aryabhatt auditorium · LNCT Campus</p>
          <p className="text-[11px] text-white/50">18–19 Sep 2026 · Gates Open 1:15 PM</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="flex items-center gap-1.5 rounded-full bg-nf-blue px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-nf-blue-bright active:scale-95"
        >
          <Download size={15} /> Download QR Pass
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-full border border-nf-line bg-white px-5 py-2.5 text-xs font-bold text-nf-ink shadow-sm transition hover:bg-gray-50 active:scale-95"
        >
          <Printer size={15} /> Print Pass
        </button>
      </div>

      {/* Screenshot & Download Notice */}
      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-center shadow-sm">
        <p className="flex items-center justify-center gap-2 text-xs font-bold text-amber-950 sm:text-[13px]">
          <span>📸</span>
          <span>Please take a screenshot or download your pass now!</span>
        </p>
      </div>
    </div>
  );
}
