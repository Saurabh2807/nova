"use client";

import { History } from "lucide-react";
import { CheckInLog } from "@/lib/types/registration";

interface AdminLogsTabProps {
  logsList: CheckInLog[];
}

export function AdminLogsTab({ logsList }: AdminLogsTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#cbdde9] bg-white p-5 shadow-xs">
        <h2 className="font-display text-base font-black text-slate-900 flex items-center gap-2 mb-1">
          <History className="text-[#2872A1]" size={18} /> Real-Time Check-in Audit Trail
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Tamper-proof audit logs recording all gate scans, manual check-ins, and admin undo operations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Type</th>
                <th className="p-3">Reference ID</th>
                <th className="p-3">Action</th>
                <th className="p-3">Method</th>
                <th className="p-3">Scanned By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-sans">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logsList.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/70">
                    <td className="p-3 text-slate-500 font-sans">
                      {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-3 uppercase text-[11px] font-bold text-slate-700">{log.type}</td>
                    <td className="p-3 font-bold text-[#2872A1]">{log.reference_id}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans ${
                          log.action === "check_in"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-slate-600">{log.method}</td>
                    <td className="p-3 font-sans text-slate-700">{log.scanned_by || "Organizer"}</td>
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
