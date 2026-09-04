import { Instagram, Youtube, Mail, MapPin } from "lucide-react";
import { contact } from "@/lib/data";
import { LogoLockup } from "./Logo";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.081.114 18.104.132 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

const exploreLinks = [
  { label: "Home", href: "#hero" },
  { label: "Events", href: "#events" },
  { label: "Creators", href: "#creators" },
  { label: "Sponsors", href: "#sponsors" },
];

const companyLinks = [
  { label: "About Us", href: "#about" },
  { label: "Leadership", href: "#team" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Refund Policy", href: "#" },
  { label: "Rulebook", href: "#" },
];

export function ContactFooter() {
  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="bg-slate-50/70 py-14 sm:py-20 border-t border-nf-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue">
              Get in Touch
            </span>
            <h2 className="mt-2.5 font-display text-2xl font-black uppercase tracking-tight text-nf-ink sm:text-3xl lg:text-4xl">
              Have Questions? We&apos;d Love to Hear From You.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-nf-ink-soft leading-relaxed">
              Whether you are a university esports rep, gaming brand, content creator, or tournament participant, reach out to our team.
            </p>
          </div>

          {/* Contact Methods Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Email */}
            <a
              href={`mailto:${contact.generalEmail}`}
              className="group flex items-center gap-3.5 rounded-xl border border-gray-200/90 bg-white p-4.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-nf-blue/10 text-nf-blue transition-colors group-hover:bg-nf-blue group-hover:text-white">
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-nf-ink-soft">Email</p>
                <p className="truncate text-xs sm:text-sm font-semibold text-nf-ink group-hover:text-nf-blue">
                  {contact.generalEmail}
                </p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/novaforge.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 rounded-xl border border-gray-200/90 bg-white p-4.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition-colors group-hover:bg-pink-600 group-hover:text-white">
                <Instagram size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-nf-ink-soft">Instagram</p>
                <p className="truncate text-xs sm:text-sm font-semibold text-nf-ink group-hover:text-pink-600">
                  {contact.instagram}
                </p>
              </div>
            </a>

            {/* Discord */}
            <a
              href={`https://${contact.discord}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 rounded-xl border border-gray-200/90 bg-white p-4.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <DiscordIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-nf-ink-soft">Discord</p>
                <p className="truncate text-xs sm:text-sm font-semibold text-nf-ink group-hover:text-indigo-600">
                  {contact.discord}
                </p>
              </div>
            </a>

            {/* Location */}
            <div className="flex items-center gap-3.5 rounded-xl border border-gray-200/90 bg-white p-4.5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-nf-ink-soft">Location</p>
                <p className="truncate text-xs sm:text-sm font-semibold text-nf-ink">
                  Bhopal, MP, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-nf-line">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Main Footer Row */}
          <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] sm:py-14">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-1">
              <LogoLockup markClassName="h-7 w-7 text-nf-blue" wordmarkClassName="text-nf-ink" />
              <p className="mt-3 text-xs leading-relaxed text-nf-ink-soft max-w-xs">
                Rise From The Middle. India&apos;s premier collegiate esports championships and creator ecosystem.
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                <a
                  href="https://instagram.com/novaforge.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50"
                  aria-label="Instagram"
                >
                  <Instagram size={15} />
                </a>
                <a
                  href={`https://${contact.discord}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                  aria-label="Discord"
                >
                  <DiscordIcon className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-red-500 hover:text-red-600 hover:bg-red-50"
                  aria-label="YouTube"
                >
                  <Youtube size={15} />
                </a>
              </div>
            </div>

            {/* Explore Links */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Explore
              </p>
              <ul className="space-y-2">
                {exploreLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-xs text-nf-ink-soft transition-colors hover:text-nf-blue"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Company
              </p>
              <ul className="space-y-2">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-xs text-nf-ink-soft transition-colors hover:text-nf-blue"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Legal
              </p>
              <ul className="space-y-2">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-xs text-nf-ink-soft transition-colors hover:text-nf-blue"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Tournament */}
            <div className="col-span-2 sm:col-span-1">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-nf-ink">
                Campus Carnival
              </p>
              <div className="rounded-xl border border-gray-100 bg-slate-50 p-3 text-[11px] text-nf-ink-soft">
                <p className="font-bold text-nf-ink">LNCT Bhopal LAN</p>
                <p className="mt-0.5 text-emerald-600 font-semibold">18–19 Sep 2026 • Free Entry</p>
                <a
                  href="#events"
                  className="mt-2 inline-block font-bold text-nf-blue hover:underline"
                >
                  View Details →
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-5 text-[11px] text-nf-ink-soft border-t border-nf-line">
            <p>© 2026 Nova Forge Esports. All rights reserved.</p>
            <p className="text-gray-400">Crafted for the Indian Esports Ecosystem</p>
          </div>
        </div>
      </footer>
    </>
  );
}
