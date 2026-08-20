import { Instagram, Youtube, MessageCircle, Twitter, Headphones } from "lucide-react";
import { contact } from "@/lib/data";
import { LogoLockup } from "./Logo";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.081.114 18.104.132 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "#events" },
  { label: "Creators", href: "#creators" },
  { label: "Sponsors", href: "#sponsors" },
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Our Team", href: "#team" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Refund Policy", href: "#" },
];

export function ContactFooter() {
  return (
    <>
      {/* Contact section */}
      <section id="contact" className="bg-white py-16 sm:py-20" style={{ borderTop: "1px solid #e8ecf4" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue">
            Contact Us
          </span>
          <h2 className="mt-3 max-w-lg font-display text-[1.9rem] font-bold leading-tight text-nf-ink sm:text-[2.1rem]">
            Have questions or want to work with us?
          </h2>
          <p className="mt-2 text-sm text-nf-ink-soft">We&apos;d love to hear from you.</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Support card */}
            <div
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{ border: "1px solid #e8ecf4", minWidth: 220 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nf-base">
                <Headphones size={18} className="text-nf-blue" />
              </div>
              <div>
                <p className="text-xs font-semibold text-nf-ink">Contact Us</p>
                <p className="text-xs text-nf-ink-soft">{contact.generalEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white" style={{ borderTop: "1px solid #e8ecf4" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Top row */}
          <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-1">
              <LogoLockup markClassName="h-7 w-7 text-nf-blue" wordmarkClassName="text-nf-ink" />
              <p className="mt-3 text-[12px] leading-relaxed text-nf-ink-soft">
                Rise From The Middle.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Quick Links
              </p>
              <ul className="space-y-2.5">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] text-nf-ink-soft transition-colors hover:text-nf-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Company
              </p>
              <ul className="space-y-2.5">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] text-nf-ink-soft transition-colors hover:text-nf-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Legal
              </p>
              <ul className="space-y-2.5">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[13px] text-nf-ink-soft transition-colors hover:text-nf-ink"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stay Connected */}
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Stay Connected
              </p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/novaforge.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-nf-base"
                  style={{ border: "1px solid #e8ecf4" }}
                  aria-label="Instagram"
                >
                  <Instagram size={16} className="text-nf-ink-soft" />
                </a>
                <a
                  href={`https://${contact.discord}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-nf-base"
                  style={{ border: "1px solid #e8ecf4" }}
                  aria-label="Discord"
                >
                  <DiscordIcon className="h-4 w-4 text-nf-ink-soft" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-nf-base"
                  style={{ border: "1px solid #e8ecf4" }}
                  aria-label="YouTube"
                >
                  <Youtube size={16} className="text-nf-ink-soft" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-nf-base"
                  style={{ border: "1px solid #e8ecf4" }}
                  aria-label="Twitter / X"
                >
                  <Twitter size={16} className="text-nf-ink-soft" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex flex-col items-center justify-between gap-3 py-5 text-[12px] text-nf-ink-soft sm:flex-row"
            style={{ borderTop: "1px solid #e8ecf4" }}
          >
            <p>© 2026 Nova Forge Esports. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
