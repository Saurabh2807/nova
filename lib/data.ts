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
        "Squad up and battle it out in the flagship BGMI LAN Tournament at LNCT Bhopal.",
      tracks: ["BGMI Esports", "LAN Arena", "Duo Squads"],
    },
  ],
};

export const comingSoonEvents = [
  { id: "cs-1", label: "City Circuit" },
  { id: "cs-2", label: "State Qualifiers" },
  { id: "cs-3", label: "Creator Meet" },
];

export const sponsors = [
  { name: "Monster Energy", tier: "Powered by", confirmed: true },
  { name: "Nodwin Gaming", tier: "Official Esports Partner", confirmed: true },
];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  tags: string[];
  linkedin?: string;
  avatarBg?: string;
  avatarText?: string;
  image?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "sajal",
    name: "Sajal Verma",
    role: "Founder & CEO",
    description: "Leading Nova Forge's strategic roadmap, institutional partnerships, and building India's premier collegiate esports ecosystem.",
    tags: ["Strategy", "Leadership", "Esports Ecosystem"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #0d2238 0%, #1a3a6b 100%)",
    avatarText: "#CBDDE9",
  },
  {
    id: "paras",
    name: "Paras Parihar",
    role: "Founder & CEO",
    description: "Directing tournament operations, creator ecosystem initiatives, and championing competitive gaming opportunities across university campuses.",
    tags: ["Operations", "Community", "Brand Growth"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #181d36 0%, #2a2558 100%)",
    avatarText: "#d4b8ff",
  },
  {
    id: "saurabh",
    name: "Saurabh Kumar Singh",
    role: "Lead Developer & Web Experience",
    description: "Designed and built the Nova Forge website and digital web experience, shaping the platform's frontend, interactions and overall digital presence.",
    tags: ["Web Development", "Frontend", "Digital Experience"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #091e30 0%, #174836 100%)",
    avatarText: "#86efac",
  },
  {
    id: "aditya",
    name: "Aditya Singh",
    role: "Community Lead",
    description: "Fostering active student engagement across 40+ college esports clubs and managing Discord community operations.",
    tags: ["Community Management", "Player Support", "Discord"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #241432 0%, #3e1b5b 100%)",
    avatarText: "#f0abfc",
  },
  {
    id: "rohan",
    name: "Rohan Verma",
    role: "Events & Partnerships",
    description: "Executing on-ground LAN arena production, sponsor brand integrations, and collegiate venue coordination.",
    tags: ["Event Management", "Sponsorships", "LAN Production"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
    avatarText: "#93c5fd",
  },
  {
    id: "karan",
    name: "Karan Mehta",
    role: "Esports & Tournaments",
    description: "Managing tournament rulebooks, referee rosters, competitive lobbies, and fair play governance across official titles.",
    tags: ["Tournament Director", "BGMI Operations", "Fair Play"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    avatarText: "#c7d2fe",
  },
  {
    id: "nisha",
    name: "Nisha Rao",
    role: "Creator Relations",
    description: "Scouting college gaming creators, coordinating broadcast talent, and managing creator roster perk distribution.",
    tags: ["Creator Program", "Talent Scouting", "Media"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #3b0764 0%, #581c87 100%)",
    avatarText: "#f5d0fe",
  },
  {
    id: "arjun",
    name: "Arjun Pathak",
    role: "Technology & Systems",
    description: "Maintaining scoring telemetry, live match telemetry, registration pipelines, and tournament verification systems.",
    tags: ["Systems", "Telemetry", "Infrastructure"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #022c22 0%, #064e3b 100%)",
    avatarText: "#6ee7b7",
  },
  {
    id: "rahul",
    name: "Rahul Sharma",
    role: "Operations Manager",
    description: "Streamlining stage management, equipment logistics, college administration permissions, and on-site hospitality.",
    tags: ["Logistics", "Stage Operations", "Coordination"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
    avatarText: "#fdba74",
  },
  {
    id: "aman",
    name: "Aman Kapoor",
    role: "Production & Broadcast",
    description: "Directing livestream broadcast feeds, multi-camera switching, live match overlays, and caster coordination.",
    tags: ["Broadcast Direction", "Live Production", "Casting"],
    linkedin: "#",
    avatarBg: "linear-gradient(135deg, #172554 0%, #1e40af 100%)",
    avatarText: "#bfdbfe",
  },
];

export const leadership = teamMembers;

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
