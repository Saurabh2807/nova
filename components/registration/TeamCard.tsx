"use client";

import { LogoMark } from "@/components/Logo";
import { CheckCircle2 } from "lucide-react";

export function TeamCard({
  teamName,
  captain,
  game,
  teamId,
  memberCount,
}: {
  teamName: string;
  captain: string;
  game: string;
  teamId: string;
  memberCount: number;
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
            Participant Pass · {game}
          </span>
        </div>

        <p className="mt-5 text-xs uppercase tracking-wide text-white/50">
          {memberCount > 1 ? "Team" : "Player"}
        </p>
        <p className="font-display text-xl font-bold">{teamName}</p>

        <p className="mt-4 text-xs uppercase tracking-wide text-white/50">Captain</p>
        <p className="text-sm font-medium text-white/80">{captain}</p>

        <div className="mt-6 flex items-center justify-between border-t border-dashed border-white/20 pt-4">
          <span className="text-[10px] uppercase tracking-wide text-white/40">Team ID</span>
          <span className="font-mono text-sm font-semibold tracking-wider text-nf-blue-bright">
            {teamId}
          </span>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-nf-ink-soft">
        Your registration card has been emailed to the captain. Keep the Team ID handy for check-in and brackets.
      </p>
    </div>
  );
}
