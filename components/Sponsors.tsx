import Image from "next/image";
import { Sparkles, ArrowUpRight } from "lucide-react";

// Partner & Game brand logos with their authentic branding colors and assets
const partnerLogos = [
  {
    name: "Monster Energy",
    tier: "Official Energy Partner",
    type: "image",
    src: "/logos/monster.png",
    width: 380,
    height: 172,
    imgClass: "h-14 sm:h-16 md:h-18 w-auto object-contain",
    glowColor: "rgba(0, 255, 1, 0.2)",
    accentColor: "#00ff01",
    tag: "Energy Partner",
  },
  {
    name: "Nodwin Gaming",
    tier: "Official Esports Partner",
    type: "image",
    src: "/logos/nodwin.png",
    width: 260,
    height: 80,
    imgClass: "h-11 sm:h-13 w-auto object-contain",
    glowColor: "rgba(108, 46, 185, 0.18)",
    accentColor: "#6C2EB9",
    tag: "Esports Partner",
  },
  {
    name: "LNCT Group",
    tier: "Official Academic Partner",
    type: "image",
    src: "/logos/lnct.png",
    width: 240,
    height: 70,
    imgClass: "h-11 sm:h-13 w-auto object-contain",
    glowColor: "rgba(227, 82, 5, 0.18)",
    accentColor: "#E35205",
    tag: "Academic Partner",
  },
  {
    name: "JNCT University",
    tier: "Official University Partner",
    type: "image",
    src: "/logos/jnct.png",
    width: 240,
    height: 70,
    imgClass: "h-11 sm:h-13 w-auto object-contain",
    glowColor: "rgba(0, 91, 172, 0.18)",
    accentColor: "#005BAC",
    tag: "University Partner",
  },
  {
    name: "Vedx Events",
    tier: "Official Guide",
    type: "image",
    src: "/logos/vedx.png",
    width: 240,
    height: 70,
    imgClass: "h-12 sm:h-14 w-auto object-contain",
    glowColor: "rgba(212, 175, 55, 0.18)",
    accentColor: "#D4AF37",
    tag: "Guide",
  },
  {
    name: "BGMI",
    tier: "Battlegrounds Mobile India",
    type: "image",
    src: "/logos/bgmi.png",
    width: 240,
    height: 80,
    imgClass: "h-12 sm:h-14 w-auto object-contain",
    glowColor: "rgba(255, 157, 12, 0.18)",
    accentColor: "#FF9D0C",
    tag: "Featured Game",
  },
  {
    name: "VALORANT",
    tier: "Riot Games Tactical Shooter",
    type: "image",
    src: "/logos/valorant.svg",
    width: 220,
    height: 48,
    imgClass: "h-10 sm:h-12 w-auto object-contain",
    glowColor: "rgba(255, 70, 85, 0.18)",
    accentColor: "#FF4655",
    tag: "Featured Game",
  },
  {
    name: "FREE FIRE",
    tier: "Garena Survival Battle",
    type: "image",
    src: "/logos/free-fire.png",
    width: 220,
    height: 48,
    imgClass: "h-11 sm:h-13 w-auto object-contain",
    glowColor: "rgba(255, 183, 0, 0.18)",
    accentColor: "#FFB700",
    tag: "Featured Game",
  },
];

export function Sponsors() {
  return (
    <section id="sponsors" className="border-y border-nf-line bg-gradient-to-b from-white via-slate-50/40 to-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-nf-blue/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue mb-2.5">
              <Sparkles size={13} className="text-nf-blue" />
              <span>Partners & Ecosystem</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-nf-ink">
              Supported by Top Brands & Titles
            </h2>
          </div>
          <p className="text-sm text-nf-ink-soft max-w-md">
            Collaborating with industry-defining gaming publishers, hardware innovators, and academic partners.
          </p>
        </div>

        {/* Spacious, Wider Card Grid with Bigger Colorful Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {partnerLogos.map((p) => (
            <div
              key={p.name}
              className="group relative flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-300"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
                minHeight: "180px",
              }}
            >
              {/* Top brand accent bar on hover */}
              <div
                className="absolute top-0 left-6 right-6 h-1 rounded-b-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: p.accentColor }}
              />

              {/* Tag & Icon row */}
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nf-ink-soft">
                  {p.tag}
                </span>
                <ArrowUpRight
                  size={15}
                  className="text-gray-300 transition-colors group-hover:text-nf-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </div>

              {/* Logo Area (Large & Centered) */}
              <div className="flex flex-1 items-center justify-center py-2">
                {p.src && (
                  <Image
                    src={p.src}
                    alt={`${p.name} Logo`}
                    width={p.width}
                    height={p.height}
                    className={`${p.imgClass} transition-transform duration-300 group-hover:scale-110`}
                  />
                )}
              </div>

              {/* Name & Tier */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-nf-ink">
                  {p.name}
                </span>
                <span className="text-[11px] text-nf-ink-soft/80">
                  {p.tier}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
