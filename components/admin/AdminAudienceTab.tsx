"use client";

import { useState } from "react";
import { Search, Filter, Trash2 } from "lucide-react";
import { AdminRole, AudienceRegistration } from "@/lib/types/registration";

interface AdminAudienceTabProps {
  audienceList: AudienceRegistration[];
  role: AdminRole;
  onCheckIn: (type: "audience", id: string, method?: "qr_scan" | "manual_search") => void;
  onUndoCheckIn: (type: "audience", id: string) => void;
  onDeleteAudience?: (passId: string, name: string) => void;
}

export function AdminAudienceTab({ audienceList, role, onCheckIn, onUndoCheckIn, onDeleteAudience }: AdminAudienceTabProps) {
  const [audienceSearch, setAudienceSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");

  // Filtered Audience List
  const filteredAudience = audienceList.filter((a) => {
    const q = audienceSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      a.pass_id?.toLowerCase().includes(q) ||
      a.full_name?.toLowerCase().includes(q) ||
      a.phone?.includes(q) ||
      a.college_id?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q);

    const matchFilter =
      audienceFilter === "all" ||
      (audienceFilter === "confirmed" && a.registration_status === "confirmed") ||
      (audienceFilter === "cancelled" && a.registration_status === "cancelled") ||
      (audienceFilter === "checked_in" && a.check_in_status === "checked_in") ||
      (audienceFilter === "not_checked_in" && a.check_in_status === "not_checked_in");

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#cbdde9] shadow-xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Pass ID, Name, Phone, College ID, Email..."
            value={audienceSearch}
            onChange={(e) => setAudienceSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2872A1] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="all">All Passes ({audienceList.length})</option>
            <option value="checked_in">Checked In</option>
            <option value="not_checked_in">Not Checked In</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Audience List Table */}
      <div className="rounded-2xl border border-[#cbdde9] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Pass ID</th>
                <th className="p-3.5">Attendee Name</th>
                <th className="p-3.5">Mobile Number</th>
                <th className="p-3.5">College ID</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Check-in</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAudience.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No audience passes found.
                  </td>
                </tr>
              ) : (
                filteredAudience.map((a) => (
                  <tr key={a.id || a.pass_id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-mono font-bold text-[#2872A1] whitespace-nowrap">
                      {a.pass_id}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{a.full_name}</td>
                    <td className="p-3.5 text-slate-700">{a.phone}</td>
                    <td className="p-3.5 text-slate-700">{a.college_id}</td>
                    <td className="p-3.5 text-slate-500">{a.email}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          a.registration_status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {a.registration_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          a.check_in_status === "checked_in"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {a.check_in_status === "checked_in" ? "CHECKED IN" : "PENDING"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {a.check_in_status === "not_checked_in" && a.registration_status === "confirmed" ? (
                          <button
                            onClick={() => onCheckIn("audience", a.pass_id, "manual_search")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-xs"
                          >
                            Check In
                          </button>
                        ) : a.check_in_status === "checked_in" && (role === "super_admin" || role === "admin" || role === "core_member") ? (
                          <button
                            onClick={() => onUndoCheckIn("audience", a.pass_id)}
                            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                          >
                            Undo
                          </button>
                        ) : null}

                        {(role === "super_admin" || role === "admin") && onDeleteAudience && (
                          <button
                            type="button"
                            onClick={() => onDeleteAudience(a.pass_id, a.full_name)}
                            className="border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2.5 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1"
                            title="Delete Audience Pass"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
