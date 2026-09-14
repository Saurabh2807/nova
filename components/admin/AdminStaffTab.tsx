"use client";

import { useState } from "react";
import {
  Users,
  ShieldAlert,
  UserPlus,
  Play,
  Square,
  Lock,
  Mail,
  User,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { StaffAccount, StaffRole } from "@/lib/types/registration";

interface AdminStaffTabProps {
  staffList: StaffAccount[];
  currentUserId: string;
  getAuthHeaders: () => Record<string, string>;
  onStaffUpdated?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function AdminStaffTab({
  staffList,
  currentUserId,
  getAuthHeaders,
  onStaffUpdated,
  onRefresh,
  loading = false,
}: AdminStaffTabProps) {
  const triggerRefresh = () => {
    if (onRefresh) onRefresh();
    if (onStaffUpdated) onStaffUpdated();
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"core_member" | "volunteer">("volunteer");

  // Toggle Confirm State
  const [confirmStaff, setConfirmStaff] = useState<StaffAccount | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Group staff members
  const superAdmins = staffList.filter((s) => s.role === "super_admin");
  const coreMembers = staffList.filter((s) => s.role === "core_member");
  const volunteers = staffList.filter((s) => s.role === "volunteer");

  async function handleCreateStaff(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFullName("");
        setEmail("");
        setPassword("");
        setRole("volunteer");
        triggerRefresh();
      } else {
        setFormError(data.error || "Failed to create staff account");
      }
    } catch (err) {
      setFormError("Network error while creating staff account");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleToggleStatus(staff: StaffAccount) {
    setActionLoading(true);
    try {
      const nextActive = !staff.is_active;
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: staff.id || staff.user_id || staff.email,
          is_active: nextActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConfirmStaff(null);
        triggerRefresh();
      } else {
        alert(data.error || "Failed to update staff status");
      }
    } catch (err) {
      alert("Network error updating staff status");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-[#cbdde9] bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="font-display text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="text-[#2872A1]" /> Staff & Access Management
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Super Admin control panel for Core Members and Gate Volunteers. Individual Start/Stop controls.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#2872A1] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1e5d85]"
          >
            <UserPlus size={15} />
            <span>Add Staff Member</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-4 rounded-xl bg-blue-50/70 border border-blue-100 p-3 text-xs text-slate-600 flex items-start gap-2.5">
          <Shield className="text-[#2872A1] shrink-0 mt-0.5" size={16} />
          <div>
            <span className="font-bold text-[#2872A1]">Server-Enforced Access:</span> When a staff member is Stopped, their active browser sessions immediately lose access to all scanning, check-in, search, and dashboard APIs.
          </div>
        </div>
      </div>

      {/* 1. SUPER ADMIN SECTION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Shield className="text-purple-600" size={17} />
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-slate-800">
            Super Admin (1)
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {superAdmins.map((admin) => (
            <div
              key={admin.id || admin.email}
              className="rounded-2xl border-2 border-purple-200 bg-purple-50/40 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white font-black text-sm">
                  SA
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-bold text-slate-900">{admin.full_name}</h4>
                    <span className="rounded-full bg-purple-100 border border-purple-300 px-2 py-0.5 text-[10px] font-black uppercase text-purple-800">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE (PROTECTED)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CORE MEMBERS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Shield className="text-[#2872A1]" size={17} />
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-slate-800">
            Core Members ({coreMembers.length})
          </h3>
        </div>

        {coreMembers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
            No Core Members added yet. Click &quot;Add Staff Member&quot; above to create a Core Member account.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {coreMembers.map((member) => (
              <div
                key={member.id || member.email}
                className="rounded-2xl border border-[#cbdde9] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#2872A1] font-black text-sm">
                    CM
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold text-slate-900">{member.full_name}</h4>
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase text-[#2872A1]">
                        Core Member
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                      member.is_active
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${member.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                    {member.is_active ? "ACTIVE" : "STOPPED"}
                  </span>

                  <button
                    onClick={() => setConfirmStaff(member)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                      member.is_active
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {member.is_active ? (
                      <>
                        <Square size={13} />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. VOLUNTEERS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Users className="text-emerald-600" size={17} />
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-slate-800">
            Gate Volunteers ({volunteers.length})
          </h3>
        </div>

        {volunteers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
            No Volunteers added yet. Click &quot;Add Staff Member&quot; above to add volunteers for entry desk check-in.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {volunteers.map((vol) => (
              <div
                key={vol.id || vol.email}
                className="rounded-2xl border border-[#cbdde9] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm">
                    VO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-bold text-slate-900">{vol.full_name}</h4>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                        Gate Volunteer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{vol.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                      vol.is_active
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${vol.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                    {vol.is_active ? "ACTIVE" : "STOPPED"}
                  </span>

                  <button
                    onClick={() => setConfirmStaff(vol)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                      vol.is_active
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {vol.is_active ? (
                      <>
                        <Square size={13} />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD STAFF MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="font-display text-base font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="text-[#2872A1]" size={18} /> Add New Staff Member
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="volunteer@novaforge.gg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Staff Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    required
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-[#2872A1] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Assigned Staff Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("volunteer")}
                    className={`rounded-xl border p-3 text-left transition ${
                      role === "volunteer"
                        ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-display text-xs font-black text-slate-900">Volunteer</div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Gate Scanner & Phone Check-in only</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("core_member")}
                    className={`rounded-xl border p-3 text-left transition ${
                      role === "core_member"
                        ? "border-[#2872A1] bg-blue-50/60 ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-display text-xs font-black text-slate-900">Core Member</div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">Dashboard, Scanner, & Undo Check-in</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-xl bg-[#2872A1] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1e5d85] disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM START / STOP MODAL */}
      {confirmStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-center">
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${
                confirmStaff.is_active ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {confirmStaff.is_active ? <AlertTriangle size={24} /> : <Play size={24} />}
            </div>

            <h3 className="font-display text-base font-black text-slate-900">
              {confirmStaff.is_active ? "Stop this staff account?" : "Start this staff account?"}
            </h3>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {confirmStaff.is_active
                ? `${confirmStaff.full_name} will immediately lose access to the staff portal and all protected operations.`
                : `${confirmStaff.full_name} will have their access restored immediately.`}
            </p>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmStaff(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleToggleStatus(confirmStaff)}
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 ${
                  confirmStaff.is_active ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading ? "Updating..." : confirmStaff.is_active ? "Confirm Stop" : "Confirm Start"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
