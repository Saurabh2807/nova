"use client";

import { useState, useRef, useEffect } from "react";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Ban,
  XCircle,
} from "lucide-react";
import { AdminRole, VerificationResult } from "@/lib/types/registration";

interface AdminScannerTabProps {
  role: AdminRole;
  getAuthHeaders: () => Record<string, string>;
  onDataMutated?: () => void;
}

export function AdminScannerTab({ role, getAuthHeaders, onDataMutated }: AdminScannerTabProps) {
  const [scanInput, setScanInput] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<VerificationResult | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Camera scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  }

  // Camera cleanup on unmount / tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn("Camera access denied:", err);
      setCameraActive(false);
      alert("Camera access was not granted. Please enter the token or ID manually.");
    }
  }

  async function handleVerify(tokenOverride?: string) {
    const tokenToVerify = tokenOverride || scanInput.trim();
    if (!tokenToVerify) return;

    setScanLoading(true);
    setScanResult(null);
    setActionSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setScanResult({ status: "INVALID", message: "Network error during verification" });
    } finally {
      setScanLoading(false);
    }
  }

  async function handleCheckIn(type: "participant" | "audience", id: string, method: "qr_scan" | "manual_search" = "qr_scan") {
    setCheckInLoading(true);
    setActionSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "check_in",
          type,
          id,
          method,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`ENTRY APPROVED: Successfully checked in ${id}!`);
        handleVerify(id);
        onDataMutated?.();
      } else {
        alert(data.error || "Failed to check in attendee");
      }
    } catch (err) {
      alert("Check-in request failed");
    } finally {
      setCheckInLoading(false);
    }
  }

  async function handleUndoCheckIn(type: "participant" | "audience", id: string) {
    if (role !== "admin") {
      alert("Permission Denied: Only Admins can undo check-ins. Volunteers do not have this permission.");
      return;
    }

    if (!confirm(`Are you sure you want to revert check-in for ${id}? Status will be reset to Not Checked In.`)) {
      return;
    }

    setCheckInLoading(true);
    setActionSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/checkin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "undo",
          type,
          id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccessMsg(`Reverted check-in for ${id}. Status is now Not Checked In.`);
        handleVerify(id);
        onDataMutated?.();
      } else {
        alert(data.error || "Failed to undo check-in");
      }
    } catch (err) {
      alert("Undo check-in request failed");
    } finally {
      setCheckInLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-3xl border border-[#cbdde9] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-black text-slate-900 flex items-center gap-2">
              <QrCode className="text-[#2872A1]" /> QR Code & Token Check-in
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan attendee QR pass with camera or enter the secure token / ID.
            </p>
          </div>
        </div>

        {/* Camera Scanner Controls */}
        <div className="mt-5 text-center">
          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border-2 border-[#2872A1]">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-[#2872A1]/70 pointer-events-none m-8 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 max-w-md mx-auto">
              <Camera size={36} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-600 font-semibold">Live Camera Scanner</p>
              <p className="text-[11px] text-slate-400 mt-1">Use mobile back camera for rapid gate entry</p>
            </div>
          )}

          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              onClick={cameraActive ? stopCamera : startCamera}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                cameraActive
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-[#2872A1] hover:bg-[#205d84] text-white"
              }`}
            >
              <Camera size={14} />
              {cameraActive ? "Stop Camera" : "Launch Camera Scanner"}
            </button>
          </div>
        </div>

        {/* Manual Input Search */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Manual QR Token or Pass/Team ID Input
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste internal QR token (nf_par_...) or enter NF-BGMI-2026-XXXXX / NF-AUD-SA-XXXX"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#2872A1] focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => handleVerify()}
              disabled={scanLoading || !scanInput.trim()}
              className="rounded-xl bg-[#2872A1] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#205d84] transition disabled:opacity-50"
            >
              {scanLoading ? "Verifying..." : "Verify Pass"}
            </button>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* SCAN / VERIFICATION RESULT CARD */}
        {scanResult && (
          <div className="mt-6 rounded-2xl border p-5 transition-all">
            {/* Status: APPROVED */}
            {scanResult.status === "APPROVED" && (
              <div className="border-emerald-300 bg-emerald-50 rounded-2xl p-5 text-emerald-900 border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                      VERIFICATION PASSED
                    </span>
                    <h3 className="text-lg font-black text-emerald-900 leading-tight">ENTRY APPROVED</h3>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-emerald-200 text-xs space-y-1.5 text-slate-800">
                  <p>
                    <strong>Reference ID:</strong> {scanResult.data?.id}
                  </p>
                  <p>
                    <strong>Name / Team:</strong> {scanResult.data?.name || scanResult.data?.title}
                  </p>
                  <p>
                    <strong>Category:</strong> {scanResult.data?.roleOrGame}
                  </p>
                  {scanResult.data?.members && (
                    <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
                      <p className="font-bold text-slate-600 uppercase text-[10px]">Team Roster:</p>
                      {scanResult.data.members.map((m, idx) => (
                        <p key={idx} className="text-slate-700">
                          • {m.role}: <strong>{m.name}</strong> ({m.phone}) - ID: {m.collegeId}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleCheckIn(scanResult.type || "participant", scanResult.data?.id || "")}
                  disabled={checkInLoading}
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-md transition active:scale-[0.99] disabled:opacity-50"
                >
                  {checkInLoading ? "Processing Check-in..." : "Confirm & Check In Attendee"}
                </button>
              </div>
            )}

            {/* Status: ALREADY CHECKED IN */}
            {scanResult.status === "ALREADY_CHECKED_IN" && (
              <div className="border-amber-300 bg-amber-50 rounded-2xl p-5 text-amber-950 border space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                      ALREADY SCANNED
                    </span>
                    <h3 className="text-lg font-black text-amber-900 leading-tight">ALREADY CHECKED IN</h3>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3.5 border border-amber-200 text-xs space-y-1.5 text-slate-800">
                  <p>
                    <strong>Reference ID:</strong> {scanResult.data?.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {scanResult.data?.name}
                  </p>
                  <p className="text-amber-800 font-bold">
                    {scanResult.message || "Attendee already entered the arena."}
                  </p>
                </div>

                {role === "admin" && (
                  <button
                    onClick={() => handleUndoCheckIn(scanResult.type || "participant", scanResult.data?.id || "")}
                    disabled={checkInLoading}
                    className="w-full rounded-xl bg-slate-800 hover:bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={14} /> Revert Check-in (Admin Only)
                  </button>
                )}
              </div>
            )}

            {/* Status: REGISTRATION CANCELLED */}
            {scanResult.status === "REGISTRATION_CANCELLED" && (
              <div className="border-rose-300 bg-rose-50 rounded-2xl p-5 text-rose-950 border space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                    <Ban size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                      ENTRY DENIED
                    </span>
                    <h3 className="text-lg font-black text-rose-900 leading-tight">
                      REGISTRATION CANCELLED
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-rose-800">
                  This pass or team registration has been cancelled by organizers. Entry is not permitted.
                </p>
              </div>
            )}

            {/* Status: INVALID */}
            {scanResult.status === "INVALID" && (
              <div className="border-rose-300 bg-rose-50 rounded-2xl p-5 text-rose-950 border space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">
                      INVALID PASS
                    </span>
                    <h3 className="text-lg font-black text-rose-900 leading-tight">INVALID QR CODE</h3>
                  </div>
                </div>
                <p className="text-xs text-rose-800">
                  {scanResult.message || "QR Token / ID does not match any record in the database."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
