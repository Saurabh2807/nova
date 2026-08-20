"use client";

import { useMemo, useState } from "react";
import { User, Users } from "lucide-react";
import { RegisterShell, Field, inputClass } from "@/components/registration/RegisterShell";
import { TeamCard } from "@/components/registration/TeamCard";
import { games, type GameId } from "@/lib/data";

function genTeamId(gameId: GameId) {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = { bgmi: "BGM", valorant: "VAL", freefire: "FRF" }[gameId];
  return `NF-${prefix}-${rand}`;
}

type Member = { name: string; inGameId: string };

export default function ParticipantRegisterPage() {
  const [mode, setMode] = useState<"solo" | "team">("team");
  const [gameId, setGameId] = useState<GameId>("bgmi");
  const [captain, setCaptain] = useState({ name: "", phone: "", email: "", inGameId: "" });
  const [teamName, setTeamName] = useState("");
  const selectedGame = games.find((g) => g.id === gameId)!;
  const extraSlots = Math.max(selectedGame.squadSize - 1, 0);

  const [members, setMembers] = useState<Member[]>(
    Array.from({ length: extraSlots }, () => ({ name: "", inGameId: "" }))
  );

  const [submitted, setSubmitted] = useState(false);
  const [teamId] = useState(() => genTeamId(gameId));

  function changeGame(id: GameId) {
    setGameId(id);
    const g = games.find((x) => x.id === id)!;
    const slots = Math.max(g.squadSize - 1, 0);
    setMembers((prev) => {
      const next = [...prev];
      while (next.length < slots) next.push({ name: "", inGameId: "" });
      return next.slice(0, slots);
    });
  }

  function updateMember(i: number, key: keyof Member, value: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)));
  }

  const displayName = useMemo(
    () => (mode === "solo" ? captain.name : teamName || captain.name),
    [mode, teamName, captain.name]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <RegisterShell
        eyebrow="Participant Pass"
        title="You&rsquo;re registered."
        description="Your bracket slot is locked in for Nova Forge Campus Carnival, Day 2."
      >
        <TeamCard
          teamName={displayName}
          captain={captain.name}
          game={selectedGame.name}
          teamId={teamId}
          memberCount={mode === "solo" ? 1 : extraSlots + 1}
        />
      </RegisterShell>
    );
  }

  return (
    <RegisterShell
      eyebrow="Enter the bracket"
      title="Register as Participant"
      description="Solo or squad — pick your game, lock your roster, and step into the arena on Day 2."
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("solo")}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
              mode === "solo"
                ? "border-nf-blue bg-nf-blue/10 text-nf-blue"
                : "border-nf-line bg-white text-nf-ink-soft"
            }`}
          >
            <User size={16} /> Solo
          </button>
          <button
            type="button"
            onClick={() => setMode("team")}
            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-colors ${
              mode === "team"
                ? "border-nf-blue bg-nf-blue/10 text-nf-blue"
                : "border-nf-line bg-white text-nf-ink-soft"
            }`}
          >
            <Users size={16} /> Team / Squad
          </button>
        </div>

        {/* Game select */}
        <Field label="Choose Game">
          <div className="grid grid-cols-3 gap-3">
            {games.map((g) => (
              <button
                type="button"
                key={g.id}
                onClick={() => changeGame(g.id)}
                className={`rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors ${
                  gameId === g.id
                    ? "border-nf-blue bg-nf-blue/10 text-nf-blue"
                    : "border-nf-line bg-white text-nf-ink-soft"
                }`}
              >
                {g.name}
                <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide opacity-70">
                  {mode === "team" ? `${g.squadSize}-player` : "Solo entry"}
                </span>
              </button>
            ))}
          </div>
        </Field>

        {/* Captain / player details */}
        <div className="space-y-5 rounded-2xl border border-nf-line bg-white p-5">
          <p className="text-sm font-semibold text-nf-ink">
            {mode === "solo" ? "Player Details" : "Captain Details"}
          </p>
          <Field label="Full Name">
            <input
              required
              className={inputClass}
              placeholder="Full name"
              value={captain.name}
              onChange={(e) => setCaptain((c) => ({ ...c, name: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Phone Number">
              <input
                required
                type="tel"
                className={inputClass}
                placeholder="10-digit mobile number"
                value={captain.phone}
                onChange={(e) => setCaptain((c) => ({ ...c, phone: e.target.value }))}
              />
            </Field>
            <Field label="Email Address">
              <input
                required
                type="email"
                className={inputClass}
                placeholder="you@example.com"
                value={captain.email}
                onChange={(e) => setCaptain((c) => ({ ...c, email: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="In-Game ID / Username">
            <input
              required
              className={inputClass}
              placeholder={`Your ${selectedGame.name} ID`}
              value={captain.inGameId}
              onChange={(e) => setCaptain((c) => ({ ...c, inGameId: e.target.value }))}
            />
          </Field>
        </div>

        {/* Team fields */}
        {mode === "team" && (
          <div className="space-y-5 rounded-2xl border border-nf-line bg-white p-5">
            <Field label="Team Name">
              <input
                required
                className={inputClass}
                placeholder="Your squad's name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </Field>

            <div>
              <p className="mb-3 text-sm font-semibold text-nf-ink">
                Squad Members ({extraSlots} more, {selectedGame.mode})
              </p>
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      required
                      className={inputClass}
                      placeholder={`Member ${i + 2} name`}
                      value={m.name}
                      onChange={(e) => updateMember(i, "name", e.target.value)}
                    />
                    <input
                      required
                      className={inputClass}
                      placeholder={`Member ${i + 2} in-game ID`}
                      value={m.inGameId}
                      onChange={(e) => updateMember(i, "inGameId", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-nf-blue py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Confirm Registration
        </button>
      </form>
    </RegisterShell>
  );
}
