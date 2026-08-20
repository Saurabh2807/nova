import Image from "next/image";
import { Sparkles, Plus, ArrowUpRight } from "lucide-react";

// Partner & Game brand logos with their authentic branding colors and assets
const partnerLogos = [
  {
    name: "Monster Energy",
    tier: "Official Energy Partner",
    type: "image",
    src: "/logos/monster.svg",
    width: 240,
    height: 70,
    imgClass: "h-14 sm:h-16 w-auto object-contain",
    glowColor: "rgba(0, 255, 1, 0.15)",
    accentColor: "#00ff01",
    tag: "Energy Partner",
  },
  {
    name: "iQOO",
    tier: "Official Device Partner",
    type: "image",
    src: "/logos/iqoo.svg",
    width: 180,
    height: 48,
    imgClass: "h-10 sm:h-12 w-auto object-contain",
    glowColor: "rgba(255, 184, 0, 0.18)",
    accentColor: "#FFB800",
    tag: "Device Partner",
  },
  {
    name: "BGMI",
    tier: "Battlegrounds Mobile India",
    type: "image",
    src: "/logos/bgmi.png",
    width: 240,
    height: 80,
    imgClass: "h-14 sm:h-16 w-auto object-contain",
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
  {
    name: "Red Bull",
    tier: "Esports & Community Partner",
    type: "svg",
    accentColor: "#DC0028",
    glowColor: "rgba(220, 0, 40, 0.15)",
    tag: "Community Partner",
  },
];

function RedBullLogo() {
  return (
    <svg viewBox="0 0 150 52" className="h-12 sm:h-14 w-auto" fill="none">
      <g transform="translate(4, 4)">
        {/* Yellow Sun */}
        <circle cx="30" cy="20" r="12" fill="#FFC72C" />
        {/* Left Bull */}
        <path
          d="M6 32 C9 27 16 20 25 22 C27 19 25 15 20 15 C18 12 13 13 8 18 C6 20 4 25 6 32 Z"
          fill="#DC0028"
        />
        {/* Right Bull */}
        <path
          d="M54 32 C51 27 44 20 35 22 C33 19 35 15 40 15 C42 12 47 13 52 18 C54 20 56 25 54 32 Z"
          fill="#DC0028"
        />
        {/* Bull body silhouettes */}
        <circle cx="18" cy="25" r="8" fill="#DC0028" />
        <circle cx="42" cy="25" r="8" fill="#DC0028" />
      </g>
      <text
        x="70"
        y="24"
        fontFamily="Arial Black, Impact, sans-serif"
        fontWeight="900"
        fontSize="16"
        fill="#DC0028"
        letterSpacing="-0.5"
      >
        Red
      </text>
      <text
        x="70"
        y="42"
        fontFamily="Arial Black, Impact, sans-serif"
        fontWeight="900"
        fontSize="16"
        fill="#002B7F"
        letterSpacing="-0.5"
      >
        Bull
      </text>
    </svg>
  );
}

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
            Collaborating with industry-defining gaming publishers, hardware innovators, and lifestyle partners.
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
                {p.type === "image" && p.src ? (
                  <Image
                    src={p.src}
                    alt={`${p.name} Logo`}
                    width={p.width}
                    height={p.height}
                    className={`${p.imgClass} transition-transform duration-300 group-hover:scale-110`}
                  />
                ) : (
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <RedBullLogo />
                  </div>
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

          {/* Prominent "and many more..." Card */}
          <div
            className="group relative flex flex-col justify-between rounded-2xl border-2 border-dashed border-nf-blue/30 bg-gradient-to-b from-nf-blue/[0.02] to-nf-blue/[0.06] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-nf-blue hover:shadow-xl hover:bg-nf-blue/[0.08]"
            style={{ minHeight: "180px" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-md bg-nf-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-nf-blue">
                Roster Expanding
              </span>
              <Sparkles size={15} className="text-nf-blue/60 group-hover:text-nf-blue transition-colors" />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
              <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-nf-blue/10 text-nf-blue transition-all duration-300 group-hover:scale-115 group-hover:bg-nf-blue group-hover:text-white group-hover:shadow-lg">
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span className="font-display text-base font-black uppercase tracking-wider text-nf-blue">
                and many more...
              </span>
              <p className="mt-1 text-[11px] text-nf-ink-soft">
                More top brands & college partners joining soon
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-nf-blue/10 text-center">
              <a
                href="#contact"
                className="text-[11px] font-bold uppercase tracking-wider text-nf-blue hover:underline"
              >
                Become a Partner →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
