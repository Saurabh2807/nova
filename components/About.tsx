import { ArrowRight, Trophy, Sparkles, Target } from "lucide-react";

export function About() {
  return (
    <section id="about" className="bg-white py-16 sm:py-24 border-t border-[#e8ecf4]">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section label */}
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue">
          About Nova Forge
        </span>

        {/* Two-column layout */}
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          {/* Left: Editorial narrative */}
          <div>
            <h2 className="font-display text-[2rem] sm:text-[2.4rem] lg:text-[2.6rem] font-black uppercase leading-[1.05] tracking-tight text-nf-ink">
              More Than a Tournament.<br />
              A National Movement.
            </h2>
            <p className="mt-4 text-[14.5px] sm:text-[15px] leading-relaxed text-nf-ink-soft">
              Nova Forge exists to give collegiate players and rising creators a true tier-1 stage to compete, broadcast, and forge legacies. Starting with central India&apos;s largest campus LANs in Bhopal, expanding across colleges nationwide.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-md bg-[#2872A1] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#1f5f87] active:scale-[0.98]"
              >
                <span>Partner With Us</span>
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#events"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-nf-blue"
              >
                <span>View Carnival</span>
              </a>
            </div>
          </div>

          {/* Right: 3 Core Pillars (Real Organizational Structure) */}
          <div className="flex flex-col gap-3.5">
            <div className="rounded-xl border border-[#e8ecf4] bg-slate-50/50 p-4.5 sm:p-5 transition-all duration-200 hover:bg-white hover:shadow-md hover:border-[#2872A1]/30">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2872A1]/10 text-[#2872A1]">
                  <Trophy size={16} />
                </div>
                <h3 className="font-display text-base font-black uppercase tracking-tight text-nf-ink">
                  Collegiate LAN Championships
                </h3>
              </div>
              <p className="text-[13px] text-nf-ink-soft leading-relaxed pl-11">
                Executing stadium-grade esports production, official LAN lobbies, and verified fair-play bracket tournaments on campus.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8ecf4] bg-slate-50/50 p-4.5 sm:p-5 transition-all duration-200 hover:bg-white hover:shadow-md hover:border-[#2872A1]/30">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2872A1]/10 text-[#2872A1]">
                  <Sparkles size={16} />
                </div>
                <h3 className="font-display text-base font-black uppercase tracking-tight text-nf-ink">
                  Creator & Media Ecosystem
                </h3>
              </div>
              <p className="text-[13px] text-nf-ink-soft leading-relaxed pl-11">
                Providing student casters, artists, content creators, and broadcast crews with priority media passes and production mentorship.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8ecf4] bg-slate-50/50 p-4.5 sm:p-5 transition-all duration-200 hover:bg-white hover:shadow-md hover:border-[#2872A1]/30">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2872A1]/10 text-[#2872A1]">
                  <Target size={16} />
                </div>
                <h3 className="font-display text-base font-black uppercase tracking-tight text-nf-ink">
                  Tier-1 Scouting Pipeline
                </h3>
              </div>
              <p className="text-[13px] text-nf-ink-soft leading-relaxed pl-11">
                Bridging collegiate competitive rosters with professional esports organizations and brand sponsorships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
