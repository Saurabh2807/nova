"use client";

import { Calendar, MapPin, Clock, Gamepad2, Ticket } from "lucide-react";
import { AdminRole, EventSettings } from "@/lib/types/registration";

export interface DashboardStatsData {
  participant?: {
    totalTeams: number;
    confirmedTeams: number;
    cancelledTeams: number;
    checkedInTeams: number;
    remainingCapacity: number;
    limit: number;
  };
  audience?: {
    totalAudience: number;
    confirmedAudience: number;
    cancelledAudience: number;
    checkedInAudience: number;
    remainingCapacity: number;
    limit: number;
  };
  totalTeams?: number;
  totalParticipants?: number;
  totalAudience?: number;
  teamsCheckedIn?: number;
  checkedInParticipants?: number;
  checkedInAudience?: number;
  audienceCheckedIn?: number;
  totalCheckedIn?: number;
  pendingCheckIn?: number;
  checkInRate?: number;
  participantCapacity?: string;
  audienceCapacity?: string;
  settings?: EventSettings;
}

interface AdminDashboardTabProps {
  stats: DashboardStatsData | null;
  role: AdminRole;
  onToggleRegistration: (currentState: boolean) => void;
}

export function AdminDashboardTab({ stats, role, onToggleRegistration }: AdminDashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Registration Status & Event Information Card */}
      <div className="rounded-2xl border border-[#cbdde9] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl font-black text-slate-900">
                {stats?.settings?.event_name || "Nova Forge Campus Carnival"}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  stats?.settings?.registration_open
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                {stats?.settings?.registration_open ? "REGISTRATION OPEN" : "REGISTRATION CLOSED"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-[#2872A1]" /> {stats?.settings?.event_date || "18–19 Sep 2026"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#2872A1]" /> {stats?.settings?.venue || "LNCT Bhopal"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-[#2872A1]" /> Gate: {stats?.settings?.reporting_time || "09:00 AM"}
              </span>
            </div>
          </div>

          {role === "admin" && (
            <button
              onClick={() => onToggleRegistration(Boolean(stats?.settings?.registration_open))}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
                stats?.settings?.registration_open
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {stats?.settings?.registration_open ? "Manually Close Registration" : "Manually Open Registration"}
            </button>
          )}
        </div>

        {/* Participant vs Audience Capacity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* BGMI Participant Capacity */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="text-[#2872A1]" size={20} />
                <span className="text-xs font-black uppercase tracking-wider text-[#2872A1]">
                  BGMI Tournament Capacity
                </span>
              </div>
              <span className="text-sm font-black text-slate-900">
                {stats?.participant?.confirmedTeams ?? stats?.totalTeams ?? 0} / {stats?.settings?.participant_limit ?? 250} Teams
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full rounded-full bg-blue-200/70 overflow-hidden">
              <div
                className="h-full bg-[#2872A1] rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (((stats?.participant?.confirmedTeams ?? stats?.totalTeams ?? 0)) /
                        (stats?.settings?.participant_limit || 1)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total</span>
                <span className="font-display text-base font-black text-slate-900">
                  {stats?.participant?.totalTeams ?? stats?.totalTeams ?? 0}
                </span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Confirmed</span>
                <span className="font-display text-base font-black text-emerald-700">
                  {stats?.participant?.confirmedTeams ?? stats?.totalTeams ?? 0}
                </span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                <span className="text-[10px] font-bold text-[#2872A1] uppercase block">Checked In</span>
                <span className="font-display text-base font-black text-[#2872A1]">
                  {stats?.participant?.checkedInTeams ?? stats?.teamsCheckedIn ?? 0}
                </span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Cancelled</span>
                <span className="font-display text-base font-black text-rose-700">
                  {stats?.participant?.cancelledTeams ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Audience Capacity */}
          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="text-purple-700" size={20} />
                <span className="text-xs font-black uppercase tracking-wider text-purple-700">
                  Audience Passes Capacity
                </span>
              </div>
              <span className="text-sm font-black text-slate-900">
                {stats?.audience?.confirmedAudience ?? stats?.totalAudience ?? 0} / {stats?.settings?.audience_limit ?? 1000} Passes
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full rounded-full bg-purple-200/70 overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (((stats?.audience?.confirmedAudience ?? stats?.totalAudience ?? 0)) /
                        (stats?.settings?.audience_limit || 1)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="rounded-xl bg-white p-2.5 border border-purple-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total</span>
                <span className="font-display text-base font-black text-slate-900">
                  {stats?.audience?.totalAudience ?? stats?.totalAudience ?? 0}
                </span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Confirmed</span>
                <span className="font-display text-base font-black text-emerald-700">
                  {stats?.audience?.confirmedAudience ?? stats?.totalAudience ?? 0}
                </span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700 uppercase block">Checked In</span>
                <span className="font-display text-base font-black text-purple-700">
                  {stats?.audience?.checkedInAudience ?? stats?.audienceCheckedIn ?? 0}
                </span>
              </div>
              <div className="rounded-xl bg-white p-2.5 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-600 uppercase block">Cancelled</span>
                <span className="font-display text-base font-black text-rose-700">
                  {stats?.audience?.cancelledAudience ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
