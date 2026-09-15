"use client";

import { useState } from "react";
import { Search, Filter, Trash2 } from "lucide-react";
import { AdminRole, Team } from "@/lib/types/registration";

interface AdminTeamsTabProps {
  teamsList: Team[];
  role: AdminRole;
  loading?: boolean;
  onCheckIn: (type: "participant", id: string, method?: "qr_scan" | "manual_search") => void;
  onUndoCheckIn: (type: "participant", id: string) => void;
  onDeleteTeam?: (teamId: string, teamName: string) => void;
  onDeleteParticipant?: (identifier: string, name: string) => void;
}

export function AdminTeamsTab({ teamsList, role, loading = false, onCheckIn, onUndoCheckIn, onDeleteTeam, onDeleteParticipant }: AdminTeamsTabProps) {
  const [teamSearch, setTeamSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");

  // Filtered Teams List
  const filteredTeams = teamsList.filter((t) => {
    const q = teamSearch.trim().toLowerCase();
    const members = t.members || t.participants || [];
    const matchSearch =
      !q ||
      t.team_id?.toLowerCase().includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      members.some(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          p.college_id?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      );

    const matchFilter =
      teamFilter === "all" ||
      (teamFilter === "confirmed" && t.registration_status === "confirmed") ||
      (teamFilter === "cancelled" && t.registration_status === "cancelled") ||
      (teamFilter === "checked_in" && t.check_in_status === "checked_in") ||
      (teamFilter === "not_checked_in" && t.check_in_status === "not_checked_in");

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#cbdde9] shadow-xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Team ID, Name, Player, Phone, College ID..."
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2872A1] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="all">All Teams ({teamsList.length})</option>
            <option value="checked_in">Checked In</option>
            <option value="not_checked_in">Not Checked In</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Teams List Table */}
      <div className="rounded-2xl border border-[#cbdde9] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Team ID</th>
                <th className="p-3.5">Team Name</th>
                <th className="p-3.5">Leader (Player 1)</th>
                <th className="p-3.5">Member (Player 2)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Check-in</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#2872A1]" />
                      <span className="text-xs font-bold text-slate-600">Loading BGMI teams...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No teams found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((t) => {
                  const members = t.members || t.participants || [];
                  const leader = members.find((m) => m.role === "leader") || members[0] || {};
                  const p2 = members.find((m) => m.role === "member") || members[1] || {};

                  return (
                    <tr key={t.id || t.team_id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-mono font-bold text-[#2872A1] whitespace-nowrap">
                        {t.team_id}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{t.name}</td>
                      <td className="p-3.5 text-slate-700">
                        <div className="flex items-center justify-between gap-1">
                          <div>
                            <p className="font-semibold">{leader.full_name || "—"}</p>
                            <p className="text-[10.5px] text-slate-400">{leader.phone} · {leader.college_id}</p>
                          </div>
                          {(role === "super_admin" || role === "admin") && leader.email && onDeleteParticipant && (
                            <button
                              type="button"
                              onClick={() => onDeleteParticipant(leader.email, leader.full_name || "Leader")}
                              title="Remove participant (will delete squad)"
                              className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        <div className="flex items-center justify-between gap-1">
                          <div>
                            <p className="font-semibold">{p2.full_name || "—"}</p>
                            <p className="text-[10.5px] text-slate-400">{p2.phone} · {p2.college_id}</p>
                          </div>
                          {(role === "super_admin" || role === "admin") && p2.email && onDeleteParticipant && (
                            <button
                              type="button"
                              onClick={() => onDeleteParticipant(p2.email, p2.full_name || "Player 2")}
                              title="Remove participant (will delete squad)"
                              className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            t.registration_status === "confirmed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {t.registration_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            t.check_in_status === "checked_in"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {t.check_in_status === "checked_in" ? "CHECKED IN" : "PENDING"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {t.check_in_status === "not_checked_in" && t.registration_status === "confirmed" ? (
                            <button
                              onClick={() => onCheckIn("participant", t.team_id, "manual_search")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs"
                            >
                              Check In
                            </button>
                          ) : t.check_in_status === "checked_in" && (role === "super_admin" || role === "admin" || role === "core_member") ? (
                            <button
                              onClick={() => onUndoCheckIn("participant", t.team_id)}
                              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                            >
                              Undo
                            </button>
                          ) : null}

                          {(role === "super_admin" || role === "admin") && onDeleteTeam && (
                            <button
                              type="button"
                              onClick={() => onDeleteTeam(t.team_id, t.name)}
                              className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1"
                              title="Delete Team & Players"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
