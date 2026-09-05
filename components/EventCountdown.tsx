"use client";

import { useEffect, useState } from "react";

// Registration closes: Sep 17, 2026 at 23:59 IST = Sep 17, 2026 18:29:00 UTC
const CLOSE_DATE = new Date("2026-09-17T18:29:00Z");

function getTimeLeft() {
  const diff = CLOSE_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function EventCountdown({ dark = false }: { dark?: boolean }) {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft>>({
    days: 12,
    hours: 8,
    minutes: 22,
    seconds: 45,
  });

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Mins", value: time.minutes },
    { label: "Secs", value: time.seconds },
  ];

  if (dark) {
    return (
      <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3.5">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1.5 xs:gap-2 sm:gap-3.5">
            {i > 0 && (
              <span className="font-display text-base xs:text-xl sm:text-2xl font-bold text-white/30 -mt-2.5 sm:-mt-3.5">:</span>
            )}
            <div className="text-center min-w-[26px] xs:min-w-[32px] sm:min-w-[42px]">
              <div className="font-display text-xl xs:text-2xl sm:text-3xl font-extrabold leading-none text-white">
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[8px] xs:text-[9px] font-bold uppercase tracking-wider text-white/45">
                {u.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e8ecf4] bg-white p-4 sm:p-5 shadow-sm">
      <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-nf-ink-soft">
        Registration Closes In
      </p>
      <div className="flex items-center justify-between sm:justify-start gap-1.5 xs:gap-2 sm:gap-3.5">
        {units.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1.5 xs:gap-2 sm:gap-3.5">
            {i > 0 && (
              <span className="font-display text-base xs:text-lg sm:text-2xl font-bold text-gray-300 -mt-2.5 sm:-mt-3.5">:</span>
            )}
            <div className="text-center min-w-[26px] xs:min-w-[32px] sm:min-w-[40px]">
              <div className="font-display text-xl xs:text-2xl sm:text-3xl font-extrabold leading-none text-nf-ink">
                {String(u.value).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[8px] xs:text-[9px] font-bold uppercase tracking-wider text-nf-ink-soft/70">
                {u.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
