"use client";

import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { CheckCircle2, Download, Printer, ShieldCheck, MapPin, Calendar, Mail, Loader2, Info } from "lucide-react";
import Image from "next/image";

interface TeamCardProps {
  teamName: string;
  teamId: string;
  leaderName: string;
  leaderPhone?: string;
  leaderEmail?: string;
  player2Name: string;
  player2Phone?: string;
  player2Email?: string;
  qrDataUrl?: string;
}

export function TeamCard({
  teamName,
  teamId,
  leaderName,
  leaderPhone,
  leaderEmail,
  player2Name,
  player2Phone,
  player2Email,
  qrDataUrl,
}: TeamCardProps) {
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  function handlePrint() {
    window.print();
  }

  function handleDownloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${teamId}_BGMI_PASS.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleResendEmail() {
    if (resending) return;
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/pass/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "participant",
          id: teamId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus("Pass re-sent! Check your Inbox and Spam/Updates folder.");
      } else {
        setResendStatus(data.error || "Failed to resend. Please try again.");
      }
    } catch {
      setResendStatus("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Top success badge */}
      <div className="flex items-center justify-between rounded-t-2xl bg-nf-navy px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Registration Confirmed</span>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
          BGMI Duo Squad
        </span>
      </div>

      {/* Main Ticket Pass */}
      <div className="hex-grid-bg relative overflow-hidden rounded-b-2xl border border-t-0 border-nf-line bg-[#091522] p-6 text-white shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8 text-cyan-400" />
            <div>
              <p className="font-display text-sm font-extrabold tracking-wide text-white">NOVA FORGE</p>
              <p className="text-[9px] uppercase tracking-widest text-white/50">Campus Unleashed 2026</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-white/40">Official Team ID</span>
            <span className="font-mono text-sm font-black tracking-wider text-cyan-300">{teamId}</span>
          </div>
        </div>

        {/* Team Name */}
        <div className="mt-5 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Squad Name</span>
          <h3 className="font-display text-2xl font-black uppercase tracking-tight text-white">{teamName}</h3>
        </div>

        {/* QR Code & Player Details Grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_130px] items-center rounded-xl bg-white/5 p-4 border border-white/10">
          <div className="space-y-3 text-left">
            <div>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-400">Player 1 (Team Leader)</span>
              <p className="text-sm font-bold text-white">{leaderName}</p>
              {leaderPhone && <p className="text-[11px] text-white/60">Ph: {leaderPhone}</p>}
            </div>
            <div>
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-white/50">Player 2 (Team Member)</span>
              <p className="text-sm font-bold text-white">{player2Name}</p>
              {player2Phone && <p className="text-[11px] text-white/60">Ph: {player2Phone}</p>}
            </div>
          </div>

          {/* High-res shared QR */}
          <div className="flex flex-col items-center justify-center text-center">
            {qrDataUrl ? (
              <div className="rounded-lg bg-white p-1.5 shadow-md">
                <Image src={qrDataUrl} alt="Team QR Pass" width={110} height={110} className="rounded" />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white/40">
                QR Loading
              </div>
            )}
            <span className="mt-1 text-[8.5px] font-bold uppercase tracking-wider text-white/40">Squad Entry QR</span>
          </div>
        </div>

        {/* Venue & Time */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-white/15 pt-3 text-[11px] text-white/70">
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-cyan-400" />
            <span>18–19 Sep 2026 · 09:00 AM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-cyan-400" />
            <span>Ramanujam Auditorium</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="flex items-center gap-1.5 rounded-full bg-nf-blue px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-nf-blue-bright active:scale-95"
        >
          <Download size={14} /> Download QR Pass
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 rounded-full border border-nf-line bg-white px-4 py-2 text-xs font-bold text-nf-ink shadow-sm transition hover:bg-gray-50 active:scale-95"
        >
          <Printer size={14} /> Print Pass
        </button>

        <button
          type="button"
          disabled={resending}
          onClick={handleResendEmail}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 disabled:opacity-50"
        >
          {resending ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
          <span>{resending ? "Sending..." : "Resend Email"}</span>
        </button>
      </div>

      {resendStatus && (
        <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-semibold text-emerald-800 animate-in fade-in duration-200">
          {resendStatus}
        </div>
      )}

      {/* Safe info / spam reminder */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-left text-xs text-slate-700">
        <div className="flex items-start gap-2">
          <Info size={15} className="text-nf-blue mt-0.5 shrink-0" />
          <div className="space-y-1 text-[11.5px] leading-relaxed">
            <p className="font-semibold text-slate-900">
              Emails have been dispatched to both players.
            </p>
            <p className="text-slate-600">
              If not visible in your Primary Inbox, please check your <strong>Spam</strong> or <strong>Updates / Promotions</strong> tab. You can also save/screenshot the QR pass above for direct gate entry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
