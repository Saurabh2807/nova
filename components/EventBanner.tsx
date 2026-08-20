import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";

export function EventBanner() {
  return (
    <div
      className="w-full"
      style={{ background: "#0d1f3c" }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-8">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Live Now pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-nf-blue px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Live Now
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white sm:text-[15px]">
              LNCT Campus Carnival — Live Registrations Open
            </p>
            <p className="mt-0.5 text-[12px] text-white/60">
              18–19 Sep · LNCT Bhopal · Free Entry
            </p>
          </div>
        </div>

        {/* Right — CTA */}
        <Link
          href="/register/participant"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-nf-blue bg-transparent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-nf-blue"
        >
          REGISTER NOW
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
