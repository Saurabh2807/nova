"use client";

import { useState } from "react";
import { Search, X, Loader2, AlertCircle, Sparkles, ArrowLeft, Ticket } from "lucide-react";
import { TeamCard } from "./TeamCard";
import { TicketCard } from "./TicketCard";

import { ParticipantPassData, AudiencePassData } from "@/lib/types/registration";

interface FindPassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindPassModal({ isOpen, onClose }: FindPassModalProps) {
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [foundData, setFoundData] = useState<
    | { type: "participant"; pass: ParticipantPassData }
    | { type: "audience"; pass: AudiencePassData }
    | null
  >(null);

  if (!isOpen) return null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !query.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setFoundData(null);

    try {
      const res = await fetch("/api/pass/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          query: query.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "No pass found for these details. Please check your spelling.");
        return;
      }

      setFoundData({
        type: data.type,
        pass: data.pass,
      });
    } catch {
      setErrorMsg("Failed to connect to pass database. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFoundData(null);
    setErrorMsg(null);
    setEmail("");
    setQuery("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {!foundData ? (
          <div>
            <div className="flex items-center gap-2.5 text-nf-blue mb-1">
              <Ticket size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Self-Service Portal</span>
            </div>
            <h2 className="font-display text-xl font-black text-slate-900">
              Find & Download Your Pass
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Verify your identity by entering your registered email and your Pass ID, Team ID, or 10-digit mobile number.
            </p>

            <form onSubmit={handleSearch} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-nf-blue focus:bg-white focus:ring-2 focus:ring-nf-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pass ID / Team ID / 10-Digit Mobile *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. NF-BGMI-..., NF-AUD-SA-..., or 9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-nf-blue focus:bg-white focus:ring-2 focus:ring-nf-blue/20"
                  />
                  <Search size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim() || !query.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-nf-blue py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-nf-blue-bright active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Searching Pass...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Verify & Retrieve Pass</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-2xl bg-slate-50 border border-slate-100 p-3.5 text-center text-xs text-slate-500">
              💡 <strong>Tip:</strong> Your pass was also sent to your email after registration. Check your <strong>Spam / Promotions</strong> folder!
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-bold text-nf-blue hover:underline"
              >
                <ArrowLeft size={14} /> Search Another Pass
              </button>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Pass Found
              </span>
            </div>

            {foundData.type === "participant" ? (
              <TeamCard
                teamName={foundData.pass.teamName}
                teamId={foundData.pass.teamId}
                leaderName={foundData.pass.leaderName}
                leaderPhone={foundData.pass.leaderPhone}
                leaderEmail={foundData.pass.leaderEmail}
                player2Name={foundData.pass.player2Name || ""}
                player2Phone={foundData.pass.player2Phone}
                player2Email={foundData.pass.player2Email}
                qrDataUrl={foundData.pass.qrDataUrl}
              />
            ) : (
              <TicketCard
                name={foundData.pass.fullName}
                ticketId={foundData.pass.passId}
                phone={foundData.pass.phone}
                email={foundData.pass.email}
                collegeId={foundData.pass.collegeId}
                qrDataUrl={foundData.pass.qrDataUrl}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
