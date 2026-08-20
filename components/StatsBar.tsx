"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Instagram, Users, Globe, Gamepad2 } from "lucide-react";

const statsData = [
  { label: "Discord Members", value: "1.2K+", icon: MessageCircle },
  { label: "Instagram Followers", value: "500+", icon: Instagram },
  { label: "Teams Onboard", value: "40+", icon: Users },
  { label: "Community Reach", value: "5K+", icon: Globe },
  { label: "Supported Games", value: "3", icon: Gamepad2 },
];

function parseValue(val: string) {
  const hasPlus = val.endsWith("+");
  const hasK = val.toUpperCase().includes("K");
  const raw = parseFloat(val.replace(/[K+]/gi, ""));
  const num = hasK ? raw * 1000 : raw;
  const decimals = (val.split(".")[1] ?? "").replace(/[K+]/gi, "").length;
  return { num, hasPlus, hasK, decimals: hasK ? decimals : 0 };
}

function formatValue(current: number, hasPlus: boolean, hasK: boolean, decimals: number) {
  if (hasK) {
    const k = current / 1000;
    return `${decimals > 0 ? k.toFixed(decimals) : Math.floor(k)}K${hasPlus ? "+" : ""}`;
  }
  return `${Math.floor(current)}${hasPlus ? "+" : ""}`;
}

function CountUp({ value }: { value: string }) {
  const { num, hasPlus, hasK, decimals } = parseValue(value);
  const [display, setDisplay] = useState("0" + (hasPlus ? "+" : ""));
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const startTime = performance.now();

          function tick(now: number) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * num;
            setDisplay(formatValue(current, hasPlus, hasK, decimals));
            if (progress < 1) requestAnimationFrame(tick);
          }

          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num, hasPlus, hasK, decimals]);

  return <span ref={ref}>{display}</span>;
}

export function StatsBar() {
  return (
    <div className="border-b border-nf-line bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 divide-x divide-nf-line sm:grid-cols-3 lg:grid-cols-5">
          {statsData.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex flex-col items-center py-7 text-center">
                <Icon size={20} className="text-nf-blue mb-2" strokeWidth={1.5} />
                <div className="font-display text-2xl font-bold text-nf-ink sm:text-3xl">
                  <CountUp value={s.value} />
                </div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-nf-ink-soft">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
