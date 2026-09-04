import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EventBanner() {
  return (
    <div
      className="relative w-full overflow-hidden border-y border-[#1e3a5f]"
      style={{ background: "linear-gradient(90deg, #091522 0%, #0d2238 50%, #091522 100%)" }}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_50%,rgba(40,114,161,0.22),transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-3.5 px-5 py-3.5 sm:flex-row sm:items-center sm:px-8 sm:py-3.5">
        {/* Left: Broadcast Status & Event Details */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 w-full sm:w-auto">
          {/* Pulsing Live Ticker Pill */}
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#2872A1]/40 bg-[#2872A1]/20 px-3 py-1 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-300">
              LIVE NOW
            </span>
          </div>

          {/* Event Headlines */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <p className="font-display text-[14.5px] font-bold text-white sm:text-[15px] tracking-tight">
              LNCT Campus Carnival — Live Registrations Open
            </p>
            <div className="hidden h-3.5 w-px bg-white/20 sm:block" />
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-300/85">
              <span>18–19 Sep 2026</span>
              <span className="text-white/40">·</span>
              <span>LNCT Bhopal</span>
              <span className="text-white/40">·</span>
              <span className="font-bold text-cyan-300">Free Entry</span>
            </div>
          </div>
        </div>

        {/* Right: Premium CTA with Rotating Glow Border */}
        <Link
          href="#events"
          className="group relative inline-flex w-full sm:w-auto justify-center shrink-0 items-center overflow-hidden rounded-md p-[1.5px] shadow-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-[0.98]"
        >
          {/* Rotating Conic Beam */}
          <span
            className="absolute -inset-[100%] animate-glow-rotate"
            style={{
              background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, #2872A1 90deg, #38bdf8 180deg, transparent 270deg, #2872A1 360deg)",
            }}
          />
          <span className="relative flex w-full items-center justify-center gap-2 rounded-[5px] bg-[#091522] px-5 py-2 sm:py-1.5 text-[12.5px] font-bold text-white transition-colors group-hover:bg-[#102a45]">
            <span>REGISTER NOW</span>
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
