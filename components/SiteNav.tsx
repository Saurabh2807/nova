"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { LogoLockup } from "./Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "#events", label: "Events" },
  { href: "#creators", label: "Creators" },
  { href: "#sponsors", label: "Sponsors" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      // Simple active section detector based on scroll position
      const sections = ["contact", "about", "sponsors", "creators", "events"];
      let current = "Home";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            current = section.charAt(0).toUpperCase() + section.slice(1);
            break;
          }
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-[#e8ecf4]/90"
          : "bg-white border-b border-[#e8ecf4]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2.5 sm:px-8 sm:py-3">
        {/* Brand Logo */}
        <Link href="/" onClick={() => setOpen(false)} className="group transition-opacity hover:opacity-90">
          <LogoLockup markClassName="h-9 w-9 sm:h-9.5 sm:w-9.5 text-nf-blue transition-transform duration-200 group-hover:scale-[1.02]" wordmarkClassName="text-nf-ink" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => {
            const isActive = activeSection === l.label;
            return (
              <a
                key={l.href}
                href={l.href}
                className={`relative text-[13px] font-semibold tracking-wide transition-colors duration-200 ${
                  isActive
                    ? "text-nf-blue"
                    : "text-nf-ink-soft hover:text-nf-ink"
                }`}
              >
                {l.label}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] rounded-full bg-nf-blue transition-all" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Premium CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#events"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-[#2872A1] px-5 py-2 text-[13.5px] font-bold text-white shadow-[0_2px_10px_rgba(40,114,161,0.25)] transition-all duration-200 hover:bg-[#1f5f87] hover:shadow-[0_4px_16px_rgba(40,114,161,0.35)] active:scale-[0.98]"
          >
            <span>Register Now</span>
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="grid h-9 w-9 place-items-center rounded-lg text-nf-ink hover:bg-gray-100 transition-colors md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer (Clean, Touch-Friendly, with Social Icons) */}
      {open && (
        <div className="border-t border-[#e8ecf4] bg-white px-5 pb-7 pt-3 md:hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => {
              const isActive = activeSection === l.label;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-[44px] items-center rounded-lg px-4 text-[15px] font-bold tracking-tight transition-colors ${
                    isActive
                      ? "bg-[#2872A1]/10 text-[#2872A1]"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#2872A1]"
                  }`}
                >
                  {l.label}
                </a>
              );
            })}

            {/* Mobile Action Button */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-3">
              <a
                href="#events"
                onClick={() => setOpen(false)}
                className="flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#2872A1] px-5 py-2.5 text-center text-[14px] font-bold text-white shadow-[0_2px_10px_rgba(40,114,161,0.25)] transition-all active:scale-[0.98]"
              >
                <span>Register Now</span>
                <ArrowRight size={15} />
              </a>

              {/* Mobile Social Channels */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href="https://instagram.com/novaforge.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#2872A1] hover:border-[#2872A1]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#2872A1] hover:border-[#2872A1]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://discord.gg/novaforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-[#2872A1] hover:border-[#2872A1]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.081.114 18.104.132 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
