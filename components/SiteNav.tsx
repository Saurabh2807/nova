"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
      style={{ borderBottom: "1px solid #e8ecf4" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <Link href="/" onClick={() => setOpen(false)}>
          <LogoLockup markClassName="h-8 w-8 text-nf-blue" wordmarkClassName="text-nf-ink" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[13px] font-semibold transition-colors hover:text-nf-blue ${
                l.label === "Home" ? "text-nf-blue" : "text-nf-ink-soft"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href="/register/participant"
            className="rounded-md bg-nf-blue px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(40,114,161,0.4)] transition-all hover:bg-nf-blue-deep hover:shadow-[0_6px_20px_rgba(40,114,161,0.5)]"
          >
            Register Now
          </a>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full text-nf-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-nf-line bg-white px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-medium text-nf-ink-soft hover:bg-gray-50 hover:text-nf-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/register/participant"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-nf-blue px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Register Now
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
