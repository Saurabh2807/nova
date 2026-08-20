import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/Logo";

export function RegisterShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-nf-base">
      <header className="border-b border-nf-line bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/">
            <LogoLockup markClassName="h-7 w-7 text-nf-blue" wordmarkClassName="text-nf-ink" />
          </Link>
          <Link
            href="/#events"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-nf-ink-soft hover:text-nf-ink"
          >
            <ArrowLeft size={15} />
            Back
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-nf-blue">
          {eyebrow}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-nf-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-nf-ink-soft">{description}</p>

        <div className="mt-9">{children}</div>
      </div>
    </main>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-nf-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-nf-ink-soft">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-nf-line bg-white px-4 py-3 text-[15px] text-nf-ink placeholder:text-nf-ink-soft/60 outline-none transition-colors focus:border-nf-blue focus:ring-2 focus:ring-nf-blue/20";
