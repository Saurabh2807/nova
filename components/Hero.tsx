"use client";

import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import Image from "next/image";

// Social icons
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.081.114 18.104.132 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

function RedBullLogo() {
  return (
    <svg viewBox="0 0 110 38" className="h-6 sm:h-7 w-auto" fill="none">
      <g transform="translate(2, 2)">
        <circle cx="20" cy="15" r="8" fill="#FFC72C" />
        <path
          d="M4 22 C6 18 11 14 17 15 C19 13 17 11 13 11 C11 8 8 9 5 12 C4 14 2 17 4 22 Z"
          fill="#DC0028"
        />
        <path
          d="M36 22 C34 18 29 14 23 15 C21 13 23 11 27 11 C29 8 32 9 35 12 C36 14 38 17 36 22 Z"
          fill="#DC0028"
        />
        <circle cx="12" cy="17" r="5" fill="#DC0028" />
        <circle cx="28" cy="17" r="5" fill="#DC0028" />
      </g>
      <text
        x="46"
        y="17"
        fontFamily="Arial Black, Impact, sans-serif"
        fontWeight="900"
        fontSize="11"
        fill="#DC0028"
        letterSpacing="-0.5"
      >
        Red
      </text>
      <text
        x="46"
        y="30"
        fontFamily="Arial Black, Impact, sans-serif"
        fontWeight="900"
        fontSize="11"
        fill="#002B7F"
        letterSpacing="-0.5"
      >
        Bull
      </text>
    </svg>
  );
}

const socialLinks = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/novaforge.gg" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
  { icon: DiscordIcon, label: "Discord", href: "https://discord.gg/novaforge" },
];

const brandLogos = [
  {
    name: "Monster Energy",
    type: "image",
    src: "/logos/monster.svg",
    width: 380,
    height: 110,
    imgClass: "h-14 sm:h-18 md:h-20 w-auto object-contain scale-110",
  },
  {
    name: "iQOO",
    type: "image",
    src: "/logos/iqoo.svg",
    width: 100,
    height: 28,
    imgClass: "h-7 sm:h-8 w-auto object-contain",
  },
  {
    name: "BGMI",
    type: "image",
    src: "/logos/bgmi.png",
    width: 140,
    height: 48,
    imgClass: "h-8 sm:h-10 w-auto object-contain",
  },
  {
    name: "VALORANT",
    type: "image",
    src: "/logos/valorant.svg",
    width: 140,
    height: 28,
    imgClass: "h-6 sm:h-7 w-auto object-contain",
  },
  {
    name: "FREE FIRE",
    type: "image",
    src: "/logos/free-fire.png",
    width: 140,
    height: 28,
    imgClass: "h-7 sm:h-8 w-auto object-contain",
  },
  {
    name: "Red Bull",
    type: "svg",
  },
];

export function Hero() {
  return (
    <section className="relative bg-white">
      {/* Main hero grid */}
      <div className="grid lg:grid-cols-[440px_1fr] xl:grid-cols-[490px_1fr]">
        {/* Left: text content */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:py-14 xl:px-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.22em] text-nf-blue"
          >
            Rise From The Middle
          </motion.div>

          <h1 className="font-display leading-[1.0]">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="block text-[3rem] font-black text-nf-ink sm:text-[3.5rem] lg:text-[3.3rem] xl:text-[3.8rem]"
            >
              WE FORGE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
              className="block text-[3rem] font-black text-nf-blue sm:text-[3.5rem] lg:text-[3.3rem] xl:text-[3.8rem]"
            >
              LEGENDS
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-nf-ink-soft sm:text-[14px]"
          >
            India&apos;s premium esports tournaments, creator programs and gaming ecosystem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="mt-7 flex flex-row flex-wrap gap-3"
          >
            <a
              href="#events"
              className="group inline-flex items-center gap-2.5 rounded-md border-2 border-nf-blue bg-white px-6 py-3 text-sm font-bold text-nf-blue shadow-sm transition-all duration-300 hover:bg-nf-blue hover:text-white hover:shadow-[0_4px_20px_rgba(40,114,161,0.35)]"
            >
              <span>Explore the Event</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>

        {/* Right: esports arena visual with smooth atmospheric haze transition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative min-h-[320px] sm:min-h-[360px] lg:min-h-[420px] overflow-hidden"
        >
          {/* Arena Background Image */}
          <Image
            src="/esports-arena.jpg"
            alt="Nova Forge Esports Championship Arena"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Smooth Cinematic Haze Transition: Arena -> Soft Blue/White Haze -> Pure White */}
          <div className="absolute inset-y-0 left-0 w-3/5 sm:w-1/2 lg:w-2/5 bg-gradient-to-r from-white via-white/80 via-[#CBDDE9]/25 to-transparent z-10 pointer-events-none" />

          {/* Subtle atmospheric blue tint wash to unify color palette */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/15 via-transparent to-transparent z-10 pointer-events-none" />

          {/* Integrated Broadcast Stage Indicator */}
          <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 border border-white/20 shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">
              Live Stage
            </span>
          </div>

          {/* Subtle Integrated Social Links */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-black/35 backdrop-blur-md border border-white/20 text-white/70 shadow-sm transition-all hover:bg-black/60 hover:text-white hover:scale-105"
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>

      {/* TRUSTED BY Strip - Full Width with generous spacing */}
      <div className="w-full border-t border-nf-line bg-gradient-to-r from-gray-50/90 via-white to-gray-50/90 py-5">
        <div className="w-full px-6 sm:px-12 lg:px-16 xl:px-20">
          <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-12 md:gap-x-16 gap-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-nf-ink-soft/80">
              Trusted By
            </span>
            <div className="hidden h-4 w-px bg-nf-line sm:block" />

            {brandLogos.map((brand) => (
              <div
                key={brand.name}
                className="flex items-center opacity-85 transition-all duration-200 hover:opacity-100 hover:scale-105 cursor-pointer"
                title={brand.name}
              >
                {brand.type === "image" && brand.src ? (
                  <Image
                    src={brand.src}
                    alt={`${brand.name} Logo`}
                    width={brand.width}
                    height={brand.height}
                    className={brand.imgClass}
                  />
                ) : (
                  <RedBullLogo />
                )}
              </div>
            ))}

            {/* "and many more..." pill */}
            <div className="flex items-center gap-1.5 rounded-full bg-nf-blue/10 px-3 py-1 text-[11px] font-bold text-nf-blue transition-all duration-200 hover:bg-nf-blue hover:text-white">
              <Plus size={12} strokeWidth={3} />
              <span>and many more...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
