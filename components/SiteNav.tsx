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

      {/* Mobile Drawer */}
      {open && (
        <div className="border-t border-nf-line bg-white/95 backdrop-blur-md px-5 pb-6 pt-3 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3.5 py-2.5 text-[14px] font-semibold text-nf-ink-soft hover:bg-gray-50 hover:text-nf-blue transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#events"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-md bg-[#2872A1] px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm"
            >
              <span>Register Now</span>
              <ArrowRight size={15} />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
