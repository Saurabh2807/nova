"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { teamMembers, TeamMember } from "@/lib/data";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function Leadership() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileSelectedId, setMobileSelectedId] = useState<string>(teamMembers[0]?.id || "sajal");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const railRef = useRef<HTMLDivElement>(null);

  // Check scroll bounds for arrows
  const checkScrollBounds = useCallback(() => {
    if (!railRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate approximate index for mobile indicator
    const cardWidth = railRef.current.firstElementChild?.clientWidth || 280;
    const index = Math.round(scrollLeft / cardWidth);
    setCurrentSlideIndex(Math.min(index, teamMembers.length - 1));
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    checkScrollBounds();
    rail.addEventListener("scroll", checkScrollBounds, { passive: true });
    window.addEventListener("resize", checkScrollBounds);

    return () => {
      rail.removeEventListener("scroll", checkScrollBounds);
      window.removeEventListener("resize", checkScrollBounds);
    };
  }, [checkScrollBounds]);

  const scroll = (direction: "left" | "right") => {
    if (!railRef.current) return;
    const scrollAmount = direction === "left" ? -380 : 380;
    railRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const mobileSelectedMember = teamMembers.find((m) => m.id === mobileSelectedId) || teamMembers[0];

  return (
    <section id="team" className="bg-white py-14 sm:py-20 border-t border-nf-line overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        
        {/* ── SECTION HEADER (Two-Part Responsive Composition) ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-gray-100">
          {/* Left Column */}
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue">
              Core Leadership
            </span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-nf-ink">
              Meet the Team Behind Nova Forge
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-nf-blue tracking-wide">
              Builders. Gamers. Creators. Problem Solvers.
            </p>
          </div>

          {/* Right Column: Mission statement + Desktop/Mobile Carousel Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center lg:items-end justify-between lg:justify-end gap-5">
            <p className="max-w-xs text-xs sm:text-[13px] text-nf-ink-soft leading-relaxed hidden sm:block">
              Building India&apos;s most robust collegiate esports infrastructure and creator talent pipeline.
            </p>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll team members left"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-nf-ink transition-all duration-200 hover:border-nf-blue hover:text-nf-blue hover:shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll team members right"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-nf-ink transition-all duration-200 hover:border-nf-blue hover:text-nf-blue hover:shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={17} />
              </button>

              {/* Progress Count (e.g. 1 / 10) */}
              <span className="ml-2 text-[11px] font-mono font-semibold text-slate-400">
                {String(currentSlideIndex + 1).padStart(2, "0")} / {String(teamMembers.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* ── DESKTOP & TABLET HORIZONTAL TEAM RAIL (With Signature Hover Expansion) ── */}
        <div className="relative mt-8">
          <div
            ref={railRef}
            className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1"
            tabIndex={0}
            aria-label="Nova Forge Leadership Horizontal Rail"
          >
            {teamMembers.map((member) => {
              const isExpanded = activeId === member.id;
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("");

              return (
                <div
                  key={member.id}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onMouseEnter={() => setActiveId(member.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(member.id)}
                  onBlur={() => setActiveId(null)}
                  onClick={() => {
                    setActiveId((prev) => (prev === member.id ? null : member.id));
                    setMobileSelectedId(member.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveId((prev) => (prev === member.id ? null : member.id));
                      setMobileSelectedId(member.id);
                    }
                  }}
                  className={`group relative shrink-0 cursor-pointer select-none rounded-2xl border transition-[width,box-shadow,border-color,transform] duration-350 ease-out outline-none focus-visible:ring-2 focus-visible:ring-nf-blue
                    ${isExpanded 
                      ? "w-[390px] lg:w-[420px] border-[#2872A1]/40 bg-white shadow-xl -translate-y-0.5" 
                      : "w-[155px] sm:w-[165px] lg:w-[175px] border-gray-200/90 bg-slate-50/60 shadow-xs hover:border-gray-300 hover:shadow-md"
                    }
                    h-[280px] overflow-hidden`}
                >
                  {/* Default State: Compact Portrait Card */}
                  {!isExpanded && (
                    <div className="flex h-full w-full flex-col justify-between p-4">
                      {/* Top Avatar Monogram / Portrait */}
                      <div className="relative flex flex-1 items-center justify-center">
                        <div
                          className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl text-xl sm:text-2xl font-black tracking-wider shadow-inner transition-transform duration-300 group-hover:scale-105"
                          style={{
                            background: member.avatarBg || "linear-gradient(135deg, #091522 0%, #1a3a6b 100%)",
                            color: member.avatarText || "#CBDDE9",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          {initials}
                        </div>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="pt-2 text-center">
                        <h3 className="truncate font-display text-xs sm:text-[13px] font-bold text-nf-ink">
                          {member.name}
                        </h3>
                        <p className="mt-0.5 text-[10.5px] font-semibold text-nf-ink-soft line-clamp-2 leading-tight">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expanded State: Two-Panel Profile Breakdown */}
                  {isExpanded && (
                    <div className="flex h-full w-full items-stretch">
                      {/* Left: Portrait Column */}
                      <div
                        className="flex w-[140px] lg:w-[150px] shrink-0 flex-col items-center justify-between p-4 text-center"
                        style={{
                          background: member.avatarBg || "linear-gradient(135deg, #091522 0%, #1a3a6b 100%)",
                          color: member.avatarText || "#CBDDE9",
                        }}
                      >
                        <div className="flex flex-1 items-center justify-center">
                          <div 
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black backdrop-blur-xs border border-white/20 shadow-md"
                            aria-label={`${member.name} — ${member.role}`}
                          >
                            {initials}
                          </div>
                        </div>
                        <div className="w-full pt-1">
                          <span className="block text-[9.5px] font-mono uppercase tracking-widest text-white/60">
                            Leadership
                          </span>
                        </div>
                      </div>

                      {/* Right: Detailed Professional Profile */}
                      <div className="flex flex-1 flex-col justify-between p-4.5 bg-white">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-display text-sm sm:text-base font-bold text-nf-ink leading-tight">
                                {member.name}
                              </h3>
                              <p className="text-[11.5px] font-semibold text-nf-blue mt-0.5">
                                {member.role}
                              </p>
                            </div>

                            {/* LinkedIn Link */}
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`${member.name} LinkedIn Profile`}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition-colors hover:border-[#0077b5] hover:bg-blue-50 hover:text-[#0077b5]"
                              >
                                <LinkedInIcon className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Short Professional Description */}
                          <p className="mt-2.5 text-[11.5px] leading-relaxed text-slate-600 line-clamp-4">
                            {member.description}
                          </p>
                        </div>

                        {/* Expertise Area Tags */}
                        {member.tags && member.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-3 border-t border-gray-100">
                            {member.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-600 border border-slate-200/80"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE FOCUSED PROFILE DRAWER (Appears on Mobile when a team card is selected) ── */}
        <div className="mt-5 block lg:hidden">
          {mobileSelectedMember && (
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-xs transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-black shadow-xs"
                    style={{
                      background: mobileSelectedMember.avatarBg || "linear-gradient(135deg, #091522 0%, #1a3a6b 100%)",
                      color: mobileSelectedMember.avatarText || "#CBDDE9",
                    }}
                  >
                    {mobileSelectedMember.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-nf-ink">
                      {mobileSelectedMember.name}
                    </h3>
                    <p className="text-xs font-semibold text-nf-blue">
                      {mobileSelectedMember.role}
                    </p>
                  </div>
                </div>

                {mobileSelectedMember.linkedin && (
                  <a
                    href={mobileSelectedMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${mobileSelectedMember.name} LinkedIn Profile`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-[#0077b5] hover:bg-blue-50"
                  >
                    <LinkedInIcon className="h-4 w-4" />
                  </a>
                )}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {mobileSelectedMember.description}
              </p>

              {mobileSelectedMember.tags && mobileSelectedMember.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
                  {mobileSelectedMember.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
