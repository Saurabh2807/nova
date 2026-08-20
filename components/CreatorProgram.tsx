import { Zap, Video, BadgeCheck, Handshake, ArrowRight } from "lucide-react";
import { creatorProgram, contact } from "@/lib/data";

const icons = [Zap, Video, BadgeCheck, Handshake];

export function CreatorProgram() {
  return (
    <section id="creators" className="py-16 sm:py-24" style={{ background: "#0d1f3c" }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section label */}
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue-bright">
          Creator Program
        </span>

        {/* Main content: left heading + right benefits */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-16">
          {/* Left */}
          <div>
            <h2 className="font-display text-[2rem] font-bold uppercase leading-tight text-white sm:text-[2.2rem]">
              {creatorProgram.headline}
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/60">
              {creatorProgram.description}
            </p>
            <a
              href={`mailto:${contact.creatorsEmail}`}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-nf-blue px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Apply to the Program
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Right: 2x2 benefits grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {creatorProgram.benefits.map((b, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={b.title}
                  className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "rgba(40, 114, 161, 0.2)" }}
                  >
                    <Icon size={18} className="text-nf-blue-bright" />
                  </div>
                  <h3 className="mt-4 font-display text-[15px] font-semibold text-white">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
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
