"use client";

import { useState, useEffect } from "react";
import { Sliders } from "lucide-react";
import { EventSettings } from "@/lib/types/registration";

interface AdminSettingsTabProps {
  settings?: EventSettings;
  getAuthHeaders: () => Record<string, string>;
  onSettingsUpdated: () => void;
}

export function AdminSettingsTab({
  settings,
  getAuthHeaders,
  onSettingsUpdated,
}: AdminSettingsTabProps) {
  const [formData, setFormData] = useState<Partial<EventSettings>>({
    event_name: settings?.event_name ?? "Campus Unleashed",
    participant_limit: settings?.participant_limit ?? 250,
    audience_limit: settings?.audience_limit ?? 1000,
    venue: settings?.venue ?? "LNCT Bhopal",
    event_date: settings?.event_date ?? "18–19 September 2026",
    reporting_time: settings?.reporting_time ?? "01:15 PM IST",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        event_name: settings.event_name ?? "Campus Unleashed",
        participant_limit: settings.participant_limit ?? 250,
        audience_limit: settings.audience_limit ?? 1000,
        venue: settings.venue ?? "LNCT Bhopal",
        event_date: settings.event_date ?? "18–19 September 2026",
        reporting_time: settings.reporting_time ?? "01:15 PM IST",
      });
    }
  }, [settings]);

  async function handleSaveSettings() {
    try {
      const res = await fetch("/api/admin/stats", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...settings,
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Settings updated successfully!");
        onSettingsUpdated();
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (err) {
      alert("Error saving settings");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl border border-[#cbdde9] bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
          <Sliders className="text-[#2872A1]" /> Event Configuration & Capacity Controls
        </h2>

        <div className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={formData.event_name ?? "Campus Unleashed"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  event_name: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-[#2872A1] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Participant Limit (Teams)
              </label>
              <input
                type="number"
                value={formData.participant_limit ?? 250}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    participant_limit: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#2872A1] focus:outline-none"
              />
              <p className="text-[10.5px] text-slate-400 mt-1">Number of 2-player squads</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Audience Limit (Passes)
              </label>
              <input
                type="number"
                value={formData.audience_limit ?? 1000}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    audience_limit: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#2872A1] focus:outline-none"
              />
              <p className="text-[10.5px] text-slate-400 mt-1">Free guest entry tickets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue ?? "LNCT Bhopal"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    venue: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Event Dates
              </label>
              <input
                type="text"
                value={formData.event_date ?? "18–19 September 2026"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    event_date: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Reporting Time
              </label>
              <input
                type="text"
                value={formData.reporting_time ?? "01:15 PM IST"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    reporting_time: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full mt-4 rounded-xl bg-[#2872A1] hover:bg-[#205d84] py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.99]"
          >
            Save Event Parameters
          </button>
        </div>
      </div>
    </div>
  );
}
