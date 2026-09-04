"use client";

import { motion } from "framer-motion";
import { ArrowRight, Plus, Trophy } from "lucide-react";
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

const socialLinks = [
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/novaforge.gg" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
  { icon: DiscordIcon, label: "Discord", href: "https://discord.gg/novaforge" },
];

const brandLogos = [
  {
    name: "Monster Energy",
    src: "/logos/monster.svg",
    width: 220,
    height: 60,
    imgClass: "h-8 sm:h-10 md:h-11 w-auto object-contain",
  },
  {
    name: "Nodwin Gaming",
    src: "/logos/nodwin.png",
    width: 200,
    height: 55,
    imgClass: "h-6 sm:h-7.5 md:h-8.5 w-auto object-contain",
  },
  {
    name: "LNCT Group of Colleges",
    src: "/logos/lnct.png",
    width: 190,
    height: 55,
    imgClass: "h-7 sm:h-8.5 md:h-9.5 w-auto object-contain",
  },
  {
    name: "JNCT Professional University",
    src: "/logos/jnct.png",
    width: 190,
    height: 55,
    imgClass: "h-7 sm:h-8.5 md:h-9.5 w-auto object-contain",
  },
  {
    name: "Vedx Events",
    src: "/logos/vedx.png",
    width: 200,
    height: 55,
    imgClass: "h-8 sm:h-9.5 md:h-10.5 w-auto object-contain",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-[#e8ecf4]">
      {/* ── Continuous Cinematic Stage Layout ── */}
      <div className="relative mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.15fr_0.85fr] items-center min-h-[460px] sm:min-h-[500px] lg:min-h-[540px]">
          
          {/* ══ Left: Editorial Typography & Actions ══ */}
          <div className="relative z-20 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:py-20 xl:px-12">
            
            {/* Campaign Label Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-[#2872A1]/20 bg-[#2872A1]/6 px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.24em] text-[#2872A1]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2872A1] animate-pulse" />
              <span>Rise From The Middle</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="font-display leading-[0.98] tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="block text-[3rem] font-black tracking-tight text-[#091522] sm:text-[3.8rem] lg:text-[4.1rem] xl:text-[4.6rem]"
              >
                WE FORGE
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="block text-[3rem] font-black tracking-tight text-[#2872A1] sm:text-[3.8rem] lg:text-[4.1rem] xl:text-[4.6rem]"
              >
                LEGENDS
              </motion.span>
            </h1>

            {/* Editorial Description */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-4 max-w-md text-[14.5px] font-medium leading-relaxed text-slate-600 sm:text-[15.5px]"
            >
              India&apos;s premium esports tournaments, creator programs and gaming ecosystem.
            </motion.p>

            {/* CTAs and Integrated Social Controls */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.28 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <a
                href="#events"
                className="group inline-flex items-center gap-2.5 rounded-md bg-[#2872A1] px-6 py-3 text-[14px] font-bold text-white shadow-[0_3px_14px_rgba(40,114,161,0.28)] transition-all duration-200 hover:bg-[#1f5f87] hover:shadow-[0_5px_20px_rgba(40,114,161,0.38)] active:scale-[0.98]"
              >
                <span>Explore the Event</span>
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              {/* Integrated Social Channels */}
              <div className="flex items-center gap-1.5 border-l border-slate-200/80 pl-4">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50/80 text-slate-600 transition-all duration-200 hover:border-[#2872A1]/40 hover:bg-white hover:text-[#2872A1] hover:scale-105 active:scale-95"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ══ Right: Atmospheric Esports Arena Scene ══ */}
          <div className="relative h-[280px] sm:h-[340px] lg:h-full lg:min-h-[520px] w-full overflow-hidden">
            {/* Background Image */}
            <Image
              src="/esports-arena.jpg"
              alt="Nova Forge Esports Championship Arena"
              fill
              className="object-cover object-center scale-[1.03]"
              priority
            />

            {/* Seamless Left-to-Right Atmospheric Gradient Blending */}
            <div className="absolute inset-y-0 left-0 w-full sm:w-4/5 lg:w-3/5 bg-gradient-to-r from-white via-white/90 via-[#CBDDE9]/35 to-transparent z-10 pointer-events-none" />
            
            {/* Top & Bottom Soft Feathering */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/30 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/30 to-transparent z-10 pointer-events-none" />

            {/* Broadcast Arena Badge */}
            <div className="absolute top-5 right-5 z-20 hidden sm:flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-md px-3.5 py-1.5 border border-white/20 shadow-md">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-white/95">
                Official Arena
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Editorial "Trusted By" Ecosystem Strip ── */}
      <div className="w-full border-t border-[#e8ecf4] bg-gradient-to-b from-slate-50/70 to-white py-4.5 sm:py-5">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 md:gap-x-14 gap-y-3.5">
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
              Trusted By
            </span>
            <div className="hidden h-4 w-px bg-slate-200 sm:block" />

            {brandLogos.map((brand) => (
              <div
                key={brand.name}
                className="flex items-center opacity-85 transition-all duration-200 hover:opacity-100 hover:scale-105 cursor-pointer"
                title={brand.name}
              >
                <Image
                  src={brand.src}
                  alt={`${brand.name} Logo`}
                  width={brand.width}
                  height={brand.height}
                  className={brand.imgClass}
                />
              </div>
            ))}

            {/* "and many more..." pill */}
            <div className="flex items-center gap-1.5 rounded-full bg-[#2872A1]/8 px-3 py-1 text-[11px] font-bold text-[#2872A1] transition-all duration-200 hover:bg-[#2872A1] hover:text-white">
              <Plus size={12} strokeWidth={3} />
              <span>and many more...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

