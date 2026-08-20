# Nova Forge Esports — Website

Next.js 15 + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Structure

- `app/page.tsx` — the single-page marketing site (Hero → About → Events → Sponsors → Creators → Team → Contact/Footer)
- `app/register/audience/page.tsx` — audience registration form (name, phone, email, year, enrollment no.) → generates a ticket ID
- `app/register/participant/page.tsx` — participant/athlete registration (solo or squad, game select, dynamic squad member fields by game) → generates a team ID
- `components/` — all section components
- `lib/data.ts` — **single source of truth** for event details, games, sponsors, leadership, stats, contact info. Edit this file to update real content across the whole site (dates, prize pool, sponsor list, team names, stats, emails, Discord link, etc.)

## Placeholders to replace later

- `lib/data.ts` → `stats` (currently placeholder numbers), `contact` (placeholder emails/Discord), prize pool (not yet set)
- Leadership photos — currently show initials in a hex avatar; swap in real photos when ready
- Sponsors beyond Monster Energy (iQOO, BGMI, Valorant) are shown as "not yet confirmed" partner placeholders

## No backend yet

Both registration forms are fully built UIs. On submit they generate a ticket/team ID **client-side** and show the confirmation card, but nothing is persisted or emailed yet — that's intentionally left for your planned Supabase integration (store the submission, send the confirmation email, generate the real unique IDs server-side).

## Design notes

- Palette: cool off-white base (`--color-nf-base`), deep navy panels (`--color-nf-navy`), electric blue primary (`--color-nf-blue`) — matches your Instagram brand blue.
- Fonts: Space Grotesk (display/headings), Inter (body), JetBrains Mono (ticket/team IDs) — self-hosted via `@fontsource`, no external font requests.
- Signature motif: hexagon shapes throughout (value icons, avatars, hero graphic) — echoes the NF logomark's hex shell.
- Fully responsive, mobile-first (your primary audience is mobile).
