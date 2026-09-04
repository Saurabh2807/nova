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

      <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-3.5 px-5 py-3 sm:flex-row sm:items-center sm:px-8 sm:py-3.5">
        {/* Left: Broadcast Status & Event Details */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Pulsing Live Ticker Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2872A1]/40 bg-[#2872A1]/20 px-3 py-1 shadow-xs">
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
            <p className="font-display text-[14px] font-bold text-white sm:text-[15px] tracking-tight">
              LNCT Campus Carnival — Live Registrations Open
            </p>
            <div className="hidden h-3.5 w-px bg-white/20 sm:block" />
            <div className="flex items-center gap-2 text-[12px] font-medium text-slate-300/85">
              <span>18–19 Sep</span>
              <span className="text-white/40">·</span>
              <span>LNCT Bhopal</span>
              <span className="text-white/40">·</span>
              <span className="font-bold text-cyan-300">Free Entry</span>
            </div>
          </div>
        </div>

        {/* Right: Premium CTA */}
        <Link
          href="#events"
          className="group inline-flex shrink-0 items-center gap-2 rounded-md border border-[#2872A1] bg-[#2872A1]/25 px-4.5 py-1.5 text-[12.5px] font-bold text-white shadow-xs backdrop-blur-sm transition-all duration-200 hover:bg-[#2872A1] hover:shadow-[0_2px_12px_rgba(40,114,161,0.4)] active:scale-[0.98]"
        >
          <span>REGISTER NOW</span>
          <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
