import { Zap, Video, BadgeCheck, Handshake, ArrowRight } from "lucide-react";
import { creatorProgram, contact } from "@/lib/data";

const icons = [Zap, Video, BadgeCheck, Handshake];

export function CreatorProgram() {
  return (
    <section id="creators" className="relative py-16 sm:py-24 bg-[#0a1628] text-white overflow-hidden">
      {/* Controlled subtle background glow */}
      <div 
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "#2872A1" }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section label */}
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CBDDE9]">
          Creator Roster & Media
        </span>

        {/* Main content: left editorial heading + right benefits */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-16">
          {/* Left Editorial */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tight text-white">
              {creatorProgram.headline}
            </h2>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300/80 max-w-lg">
              {creatorProgram.description}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href={`mailto:${contact.creatorsEmail}`}
                className="inline-flex items-center gap-2 rounded-xl bg-nf-blue px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-nf-blue/25 transition-all hover:bg-nf-blue/90 hover:shadow-nf-blue/40"
              >
                Apply for Creator Slot
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          {/* Right: 2x2 benefits grid */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {creatorProgram.benefits.map((b, i) => {
              const Icon = icons[i] || Zap;
              return (
                <div
                  key={b.title}
                  className="rounded-2xl p-5 border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all hover:bg-white/[0.07] hover:border-white/20"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-nf-blue/20 text-[#CBDDE9]"
                  >
                    <Icon size={18} className="text-[#CBDDE9]" />
                  </div>
                  <h3 className="mt-4 font-display text-sm font-bold text-white uppercase tracking-wide">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300/70">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
