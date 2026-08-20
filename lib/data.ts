export type GameId = "bgmi" | "valorant" | "freefire";

export const games: { id: GameId; name: string; squadSize: number; mode: string }[] = [
  { id: "bgmi", name: "BGMI", squadSize: 4, mode: "Squad TPP" },
  { id: "valorant", name: "Valorant", squadSize: 5, mode: "5v5 Competitive" },
  { id: "freefire", name: "Free Fire", squadSize: 4, mode: "Squad" },
];

export const flagshipEvent = {
  name: "Nova Forge Campus Carnival",
  tagline: "2 Days. One Campus. Every Kind of Player.",
  dateLabel: "18–19 September",
  dateRange: "18–19 Sep 2026",
  venue: "LNCT Group of Colleges, Bhopal",
  entryFee: "Free Entry",
  perk: "Free Monster Energy can for every registered participant",
  days: [
    {
      label: "Day 1",
      date: "18 Sep",
      title: "Creation Day",
      description:
        "Dance battles, art, open mic and music — the stage belongs to every kind of creator, not just gamers.",
      tracks: ["Dance", "Art", "Music & Open Mic"],
    },
    {
      label: "Day 2",
      date: "19 Sep",
      title: "Gaming Day",
      description:
        "Squad up and battle it out across three of the biggest competitive titles on campus.",
      tracks: ["BGMI", "Valorant", "Free Fire"],
    },
  ],
};

export const comingSoonEvents = [
  { id: "cs-1", label: "City Circuit" },
  { id: "cs-2", label: "State Qualifiers" },
  { id: "cs-3", label: "Creator Meet" },
];

export const sponsors = [
  { name: "Monster Energy", tier: "Title Sponsor", confirmed: true },
  { name: "iQOO", tier: "Partner", confirmed: false },
  { name: "BGMI Esports", tier: "Game Partner", confirmed: false },
  { name: "Valorant", tier: "Game Partner", confirmed: false },
];

export const leadership = [
  { name: "Sajal Verma", role: "Founder & CEO" },
  { name: "Paras Parihar", role: "Co-Founder" },
  { name: "Saurabh Kumar Singh", role: "Head of Operations" },
];

export const stats = [
  { label: "Discord Members", value: "1.2K+" },
  { label: "Instagram Followers", value: "500+" },
  { label: "Events Planned", value: "3+" },
  { label: "Teams Onboard", value: "40+" },
  { label: "Community Reach", value: "5K+" },
  { label: "Supported Games", value: "3" },
];

export const creatorProgram = {
  headline: "Create. Compete. Get Discovered.",
  description:
    "Nova Forge's Creator Program backs the players who bring the energy — clips, streams, highlight reels — with early access, event coverage and a direct line to brand deals as we grow beyond campus.",
  benefits: [
    { title: "Early Access", description: "First slots at every Nova Forge event, before public registration opens." },
    { title: "Event Coverage", description: "Dedicated content coverage and shoutouts across Nova Forge channels." },
    { title: "Creator Badge", description: "A verified on-site and online badge that marks you as Nova Forge crew." },
    { title: "Brand Deals", description: "Priority access to sponsor collaborations as our partner roster grows." },
  ],
};

export const contact = {
  generalEmail: "hello@novaforge.gg",
  partnersEmail: "partners@novaforge.gg",
  creatorsEmail: "creators@novaforge.gg",
  discord: "discord.gg/novaforge",
  instagram: "@novaforge.gg",
};
