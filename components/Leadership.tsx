import { leadership } from "@/lib/data";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Avatar colors for each person
const avatarColors = [
  { bg: "#1a3a6b", text: "#CBDDE9" },
  { bg: "#2a1a4b", text: "#d4b8ff" },
  { bg: "#0a3020", text: "#86efac" },
];

export function Leadership() {
  return (
    <section id="team" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue">
          Leadership
        </span>
        <h2 className="mt-3 font-display text-[1.9rem] font-bold leading-tight text-nf-ink sm:text-[2.2rem]">
          Meet the Leaders<br />Behind Nova Forge.
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {leadership.map((p, i) => {
            const color = avatarColors[i % avatarColors.length];
            const initials = p.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("");
            return (
              <div
                key={p.name}
                className="rounded-2xl p-6 transition-shadow hover:shadow-md"
                style={{ border: "1px solid #e8ecf4", background: "#fff" }}
              >
                {/* Avatar */}
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold"
                    style={{ background: color.bg, color: color.text }}
                  >
                    {initials}
                  </div>
                  {/* LinkedIn icon */}
                  <a
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-blue-50"
                    style={{ color: "#0077b5" }}
                    aria-label={`${p.name} on LinkedIn`}
                  >
                    <LinkedInIcon className="h-4 w-4" />
                  </a>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-nf-ink">
                  {p.name}
                </h3>
                <p className="mt-0.5 text-sm text-nf-ink-soft">{p.role}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
