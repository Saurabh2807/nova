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
  linkedin: string | null;
  avatarBg?: string;
  avatarText?: string;
  image?: string;
}

export const teamMembers: TeamMember[] = [
  {
    id: "sajal-verma",
    name: "Sajal Verma",
    role: "Founder / Owner",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Leadership", "Strategy", "Ecosystem"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #0d2238 0%, #1a3a6b 100%)",
    avatarText: "#CBDDE9",
  },
  {
    id: "paras-thakur",
    name: "Paras Thakur",
    role: "Co-Founder / CEO",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Leadership", "Operations", "Growth"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #181d36 0%, #2a2558 100%)",
    avatarText: "#d4b8ff",
  },
  {
    id: "tanuj-kurele",
    name: "Tanuj Kurele",
    role: "Chief Operating Officer (COO)",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Operations", "Logistics", "Management"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #102a3a 0%, #17485e 100%)",
    avatarText: "#7dd3fc",
  },
  {
    id: "shailash-paliya",
    name: "Shailash Paliya",
    role: "Chief Financial Officer (CFO)",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Finance", "Planning", "Budgeting"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #13241b 0%, #1c4b35 100%)",
    avatarText: "#86efac",
  },
  {
    id: "abhishek-mishra",
    name: "Abhishek Mishra",
    role: "Joint Secretary",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Administration", "Governance", "Coordination"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #241432 0%, #3e1b5b 100%)",
    avatarText: "#f0abfc",
  },
  {
    id: "saurabh-kumar-singh",
    name: "Saurabh Kumar Singh",
    role: "IT Head",
    description: "Leads Nova Forge's technology and digital infrastructure, including the organization's website and digital web experience.",
    tags: ["IT", "Web Development", "Digital Experience"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #091e30 0%, #174836 100%)",
    avatarText: "#86efac",
  },
  {
    id: "yashwant-singh",
    name: "Yashwant Singh",
    role: "Head of Esports",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Esports", "Tournaments", "Competitive"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
    avatarText: "#93c5fd",
  },
  {
    id: "kashish-singh",
    name: "Kashish Singh",
    role: "Head of Esports",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Esports", "Tournaments", "Player Ops"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
    avatarText: "#c7d2fe",
  },
  {
    id: "atharv-singh",
    name: "Atharv Singh",
    role: "Executive",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Executive", "Execution", "Coordination"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    avatarText: "#cbd5e1",
  },
  {
    id: "aditya-patkar",
    name: "Aditya Patkar",
    role: "Marketing Head",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Marketing", "Brand Outreach", "Campaigns"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)",
    avatarText: "#ddd6fe",
  },
  {
    id: "aarunya-rai",
    name: "Aarunya Rai",
    role: "Content Head",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Content", "Creative", "Media"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #3b0764 0%, #581c87 100%)",
    avatarText: "#f5d0fe",
  },
  {
    id: "roshni-purswani",
    name: "Roshni Purswani",
    role: "Content Director",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Content Direction", "Production", "Storytelling"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #4a044e 0%, #701a75 100%)",
    avatarText: "#fbcfe8",
  },
  {
    id: "nirbhika-chaurasiya",
    name: "Nirbhika Chaurasiya",
    role: "Event Head",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Events", "On-Ground", "LAN Management"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #042f2e 0%, #115e59 100%)",
    avatarText: "#99f6e4",
  },
  {
    id: "tarun-singh-umath",
    name: "Tarun Singh Umath",
    role: "Event Head",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Events", "Venue Operations", "Stage Production"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    avatarText: "#94a3b8",
  },
  {
    id: "adarsh-tirtade",
    name: "Adarsh Tirtade",
    role: "Social Media Head",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Social Media", "Community", "Engagement"],
    linkedin: null,
    avatarBg: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
    avatarText: "#fdba74",
  },
  {
    id: "vedant-dubey",
    name: "Vedant Dubey",
    role: "Mentor",
    description: "Part of the Nova Forge leadership team, contributing to the organization's growth and execution.",
    tags: ["Mentorship", "Advisory", "Guidance"],
    linkedin: null,
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
