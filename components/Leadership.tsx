import { leadership } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Subtle brand avatar styles
const avatarStyles = [
  { bg: "linear-gradient(135deg, #102640 0%, #1a3a6b 100%)", text: "#CBDDE9", border: "rgba(40,114,161,0.25)" },
  { bg: "linear-gradient(135deg, #181d36 0%, #2a2558 100%)", text: "#d4b8ff", border: "rgba(108,46,185,0.25)" },
  { bg: "linear-gradient(135deg, #0f2720 0%, #174836 100%)", text: "#86efac", border: "rgba(34,197,94,0.25)" },
];

export function Leadership() {
  return (
    <section id="team" className="bg-white py-14 sm:py-20 border-t border-nf-line">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue">
              Core Leadership
            </span>
            <h2 className="mt-2.5 font-display text-2xl font-black uppercase tracking-tight text-nf-ink sm:text-3xl lg:text-4xl">
              Meet the Team Behind Nova Forge
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-nf-ink-soft leading-relaxed">
            Building India’s most robust collegiate esports infrastructure and creator talent pipeline.
          </p>
        </div>

        {/* Mobile: Compact Horizontal Profile Rows | Desktop: 3-Col Cards */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
          {leadership.map((p, i) => {
            const style = avatarStyles[i % avatarStyles.length];
            const initials = p.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");

            return (
              <div
                key={p.name}
                className="group relative flex items-center justify-between rounded-xl border border-gray-200/90 bg-gradient-to-b from-white to-slate-50/50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:flex-col sm:items-start sm:p-6 sm:rounded-2xl"
              >
                {/* Mobile Row Layout */}
                <div className="flex items-center gap-3.5 sm:w-full sm:flex-col sm:items-start sm:gap-0">
                  <div className="flex items-center justify-between sm:w-full">
                    {/* Avatar with Initials */}
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-black tracking-wide shadow-inner sm:h-14 sm:w-14 sm:rounded-2xl sm:text-lg"
                      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                    >
                      {initials}
                    </div>

                    {/* LinkedIn icon (desktop corner) */}
                    <a
                      href="#"
                      className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-50 hover:text-[#0077b5]"
                      aria-label={`${p.name} on LinkedIn`}
                    >
                      <LinkedInIcon className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="sm:mt-4">
                    <h3 className="font-display text-sm font-bold text-nf-ink sm:text-base">
                      {p.name}
                    </h3>
                    <p className="text-[12px] font-medium text-nf-ink-soft sm:text-xs">
                      {p.role}
                    </p>
                  </div>
                </div>

                {/* Mobile Trailing Arrow / LinkedIn */}
                <div className="flex items-center gap-2 sm:hidden">
                  <a
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-[#0077b5]"
                    aria-label={`${p.name} on LinkedIn`}
                  >
                    <ArrowUpRight size={16} className="text-gray-400 group-hover:text-nf-blue" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
