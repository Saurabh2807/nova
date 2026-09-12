"use client";

import { FileSpreadsheet } from "lucide-react";
import { AdminRole } from "@/lib/types/registration";

interface AdminExportTabProps {
  role: AdminRole;
  getAuthHeaders: () => Record<string, string>;
  onExportCsv?: (type: "teams" | "audience") => void;
}

export function AdminExportTab({ role, getAuthHeaders, onExportCsv }: AdminExportTabProps) {
  async function handleExport(type: "teams" | "audience") {
    if (onExportCsv) {
      onExportCsv(type);
      return;
    }

    if (role !== "admin") {
      alert("Permission Denied: Only Admins can export attendee data.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/export?type=${type}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to export data");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `novaforge_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Export download failed");
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="rounded-3xl border border-[#cbdde9] bg-white p-6 shadow-sm text-center">
        <FileSpreadsheet size={40} className="mx-auto text-[#2872A1] mb-2" />
        <h2 className="font-display text-lg font-black text-slate-900">
          Official CSV Attendance & Roster Export
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Download verified attendee spreadsheets for offline physical gate desk and record keeping.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 flex flex-col justify-between text-left">
            <div>
              <h3 className="font-display font-black text-sm text-[#2872A1]">BGMI Teams Roster</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Includes Team ID, Name, Player 1 & 2 details, status, timestamps.
              </p>
            </div>
            <button
              onClick={() => handleExport("teams")}
              className="mt-4 w-full rounded-xl bg-[#2872A1] hover:bg-[#205d84] text-white font-bold py-2.5 text-xs shadow-xs transition"
            >
              Download Teams CSV
            </button>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 flex flex-col justify-between text-left">
            <div>
              <h3 className="font-display font-black text-sm text-purple-800">Audience Passes</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Includes Pass ID, Name, Mobile, College ID, status, timestamps.
              </p>
            </div>
            <button
              onClick={() => handleExport("audience")}
              className="mt-4 w-full rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 text-xs shadow-xs transition"
            >
              Download Audience CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
