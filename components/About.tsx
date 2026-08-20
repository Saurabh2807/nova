import { ArrowRight } from "lucide-react";

export function About() {
  return (
    <section id="about" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section label */}
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-nf-blue">
          About Nova Forge
        </span>

        {/* Two-column layout */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          {/* Left: text */}
          <div>
            <h2 className="font-display text-[1.9rem] font-bold uppercase leading-tight text-nf-ink sm:text-[2.2rem]">
              More Than a Game.<br />
              It&apos;s a Movement.&nbsp;🚀
            </h2>
            <p className="mt-5 text-[14px] leading-relaxed text-nf-ink-soft">
              We exist to give players from every game a platform to compete, grow and
              win championships. Starting in Bhopal, headed for every state.
            </p>
            <a
              href="#contact"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-nf-blue px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Know More About Us
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Right: image / visual */}
          <div
            className="relative h-64 overflow-hidden rounded-2xl lg:h-80"
            style={{ background: "linear-gradient(135deg, #0b1230 0%, #162040 40%, #1e3060 100%)" }}
          >
            {/* Players celebrating visual */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Simulated team celebration */}
              <div className="relative">
                <div className="flex items-end gap-3">
                  {[0.85, 1, 0.9, 0.95, 0.8].map((scale, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center"
                      style={{ transform: `scale(${scale})` }}
                    >
                      <div
                        className="h-16 w-10 rounded-t-full"
                        style={{
                          background: `hsl(${210 + i * 15}, 50%, ${30 + i * 5}%)`,
                          boxShadow: "0 0 20px rgba(40,114,161,0.3)",
                        }}
                      />
                    </div>
                  ))}
                </div>
                {/* Hands up effect */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl">
                  🏆
                </div>
              </div>
            </div>
            {/* Glow overlay */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-nf-blue/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
