"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket, Users, Trophy, ArrowRight } from "lucide-react";
import { flagshipEvent } from "@/lib/data";
import { EventCountdown } from "./EventCountdown";

export function Events() {
  return (
    <section id="events" className="bg-white py-14 sm:py-20 border-t border-nf-line/60">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* ── TOP SECTION: Main Event Details & Day Cards ── */}
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 items-start">

          {/* ══ LEFT COLUMN ══ */}
          <div className="flex flex-col gap-6">

            {/* Eyebrow */}
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-nf-blue">
              Upcoming Event
            </span>

            {/* Main Title & Subtitle */}
            <div className="-mt-3.5">
              <h2 className="font-display text-[2.4rem] sm:text-[2.9rem] font-black uppercase leading-[1.02] tracking-tight text-nf-ink">
                Nova Forge<br />Campus Carnival
              </h2>
              <p className="mt-3 text-[14.5px] font-medium text-nf-ink-soft">
                {flagshipEvent.tagline}
              </p>
            </div>

            {/* Meta Info Badges */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-nf-ink-soft">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-nf-blue shrink-0" />
                <span>18 – 19 Sep 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-nf-blue shrink-0" />
                <span>LNCT Bhopal</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket size={16} className="text-nf-blue shrink-0" />
                <span className="uppercase text-[10.5px] tracking-widest font-black text-nf-blue border border-nf-blue/30 bg-nf-blue/6 px-2.5 py-0.5 rounded-full">
                  Free Entry
                </span>
              </div>
            </div>

            {/* ── COUNTDOWN CARD WITH OVERFLOWING MONSTER CAN ── */}
            <div className="relative mt-3">
              {/* Monster Energy Can with Ice & Splash — positioned to overflow above card */}
              <div
                className="absolute right-0 sm:right-2 bottom-0 pointer-events-none select-none z-20"
                style={{ height: "135%", width: "170px" }}
              >
                <Image
                  src="/monster-can.png"
                  alt="Monster Energy Can"
                  fill
                  priority
                  className="object-contain object-right-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                />
              </div>

              {/* Dark Navy Countdown Box */}
              <div
                className="relative rounded-2xl p-5 sm:p-6 shadow-md overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #091522 0%, #102336 55%, #152d45 100%)",
                  border: "1px solid rgba(40, 114, 161, 0.2)",
                }}
              >
                {/* Radial Glow Highlight */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle at 75% 50%, #2872A1 0%, transparent 60%)",
                  }}
                />

                {/* Countdown Content */}
                <div className="relative z-10 pr-[140px] sm:pr-[165px]">
                  <p className="mb-2.5 text-[9.5px] font-black uppercase tracking-[0.22em] text-white/50">
                    Registration Closes In
                  </p>
                  <EventCountdown dark />
                </div>
              </div>
            </div>

            {/* ── DUAL REGISTRATION ACTION BUTTONS (WHITE WITH BLUE BORDERS & HOVER GLOW) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Primary CTA: Register as Participant */}
              <Link
                href="/register/participant"
                className="group flex items-center justify-between gap-3 rounded-2xl border-2 border-nf-blue bg-white px-5 py-4 text-nf-ink shadow-xs transition-all duration-300 hover:bg-nf-blue hover:text-white hover:border-nf-blue hover:shadow-[0_8px_25px_rgba(40,114,161,0.35)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nf-blue/10 text-nf-blue transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
                    <Trophy size={19} />
                  </div>
                  <div>
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-nf-ink-soft transition-colors duration-300 group-hover:text-white/75">
                      Register as
                    </span>
                    <span className="block font-display text-[15px] font-black uppercase leading-tight text-nf-ink transition-colors duration-300 group-hover:text-white">
                      Participant
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-nf-blue transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
              </Link>

              {/* Secondary CTA: Register as Audience */}
              <Link
                href="/register/audience"
                className="group flex items-center justify-between gap-3 rounded-2xl border-2 border-nf-blue bg-white px-5 py-4 text-nf-ink shadow-xs transition-all duration-300 hover:bg-nf-blue hover:text-white hover:border-nf-blue hover:shadow-[0_8px_25px_rgba(40,114,161,0.35)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nf-blue/10 text-nf-blue transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
                    <Users size={19} />
                  </div>
                  <div>
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-nf-ink-soft transition-colors duration-300 group-hover:text-white/75">
                      Register as
                    </span>
                    <span className="block font-display text-[15px] font-black uppercase leading-tight text-nf-ink transition-colors duration-300 group-hover:text-white">
                      Audience
                    </span>
                  </div>
                </div>
                <ArrowRight size={18} className="text-nf-blue transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
              </Link>
            </div>

            {/* ── SPONSOR STRIP (POWERED BY + ASSOCIATE PARTNER) ── */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#e8ecf4] pt-5 mt-1">
              {/* Powered By Monster */}
              <div className="flex items-center gap-3">
                <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Powered by
                </span>
                <Image
                  src="/logos/monster.svg"
                  alt="Monster Energy"
                  width={115}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-6 w-px bg-slate-200" />

              {/* Associate Partner iQOO */}
              <div className="flex items-center gap-3">
                <span className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Associate Partner
                </span>
                <Image
                  src="/logos/iqoo.svg"
                  alt="iQOO"
                  width={75}
                  height={24}
                  className="h-6 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* ══ RIGHT COLUMN: Stacked Day 1 & Day 2 Cards ══ */}
          <div className="flex flex-col gap-4">

            {/* DAY 1 — CREATION DAY */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#c8d8e8]">
              <div className="grid grid-cols-[1fr_160px] sm:grid-cols-[1fr_210px] items-stretch min-h-[160px]">
                {/* Left Info */}
                <div className="p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nf-blue">
                      Day 1 · 18 Sep
                    </span>
                    <h3 className="mt-1 font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-nf-ink leading-none">
                      Creation Day
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-nf-ink-soft">
                      Dance battles, art, open mic and music — the stage belongs to every kind of creator.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["Dance", "Art", "Music & Open Mic"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[#e2e8f0] bg-gray-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-nf-ink-soft"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Stage Image */}
                <div className="relative overflow-hidden bg-slate-900">
                  <Image
                    src="/creation-day.png"
                    alt="Creation Day Festival Stage"
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-t border-[#f0f4f8] bg-slate-50/50">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Powered by
                </span>
                <Image
                  src="/logos/monster.svg"
                  alt="Monster Energy"
                  width={90}
                  height={22}
                  className="h-5 w-auto object-contain"
                />
              </div>
            </div>

            {/* DAY 2 — GAMING DAY */}
            <div className="group relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#c8d8e8]">
              <div className="grid grid-cols-[1fr_160px] sm:grid-cols-[1fr_210px] items-stretch min-h-[160px]">
                {/* Left Info */}
                <div className="p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nf-blue">
                      Day 2 · 19 Sep
                    </span>
                    <h3 className="mt-1 font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-nf-ink leading-none">
                      Gaming Day
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-nf-ink-soft">
                      Squad up and battle it out in the flagship BGMI LAN Tournament at LNCT Campus.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["BGMI Esports", "LAN Arena", "Duo Squads"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[#e2e8f0] bg-gray-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-nf-ink-soft"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Stage Image */}
                <div className="relative overflow-hidden bg-slate-900">
                  <Image
                    src="/gaming-day.png"
                    alt="Gaming Day Tournament Stage"
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-t border-[#f0f4f8] bg-slate-50/50">
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Powered by
                </span>
                <Image
                  src="/logos/monster.svg"
                  alt="Monster Energy"
                  width={90}
                  height={22}
                  className="h-5 w-auto object-contain"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ── FEATURED GAMES SECTION ── */}
        <div className="mt-16 sm:mt-20">
          {/* Section Header */}
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.22em] text-nf-blue">
              Featured Games
            </span>
            <a href="#" className="text-[12px] font-semibold text-nf-blue hover:underline flex items-center gap-1 transition-colors">
              View All Games <ArrowRight size={13} />
            </a>
          </div>

          {/* 3 Featured Game Cards Grid (Cleaned of white frames with smooth hover pop-up) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            {/* 1. BGMI CARD */}
            <div className="group relative rounded-2xl overflow-hidden shadow-sm transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_16px_36px_rgba(245,158,11,0.2)]">
              <div className="relative w-full rounded-2xl overflow-hidden border border-amber-500/20 bg-slate-950">
                <Image
                  src="/bgmi-clean.png"
                  alt="BGMI Battlegrounds Mobile India"
                  width={2110}
                  height={1064}
                  priority
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* 2. VALORANT CARD */}
            <div className="group relative rounded-2xl overflow-hidden shadow-sm transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_16px_36px_rgba(244,63,94,0.22)]">
              <div className="relative w-full rounded-2xl overflow-hidden border border-rose-500/25 bg-slate-950">
                <Image
                  src="/valorant-clean.png"
                  alt="Valorant"
                  width={2323}
                  height={1195}
                  priority
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* 3. FREE FIRE CARD */}
            <div className="group relative rounded-2xl overflow-hidden shadow-sm transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_16px_36px_rgba(249,115,22,0.22)]">
              <div className="relative w-full rounded-2xl overflow-hidden border border-orange-500/25 bg-slate-950">
                <Image
                  src="/freefire-clean.png"
                  alt="Free Fire"
                  width={2362}
                  height={1032}
                  priority
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
