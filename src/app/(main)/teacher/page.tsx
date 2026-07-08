"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  getTeacherDashboardDataAction,
  updateLeadStatusAction,
  deleteLeadAction,
  listScheduleAction,
  createScheduleEntryAction,
  updateScheduleEntryAction,
  deleteScheduleEntryAction,
  teacherLogoutAction,
  type LeadRow,
  type ScheduleRow,
} from "./actions";
import {
  Users,
  LogOut,
  QrCode,
  CalendarDays,
  Trash2,
  Plus,
  Phone,
} from "lucide-react";

type LeadStatus = "nuevo" | "contactado" | "inscrito";

const STATUS_STYLES: Record<LeadStatus, string> = {
  nuevo: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  contactado: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  inscrito: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const cardClass =
  "overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0f1729]/40 p-6 backdrop-blur-xl";
const inputClass =
  "rounded-lg border border-white/[0.08] bg-[#111827]/60 px-3 py-2 text-xs text-white placeholder:text-white/25 outline-none focus:border-blue-500/50";

function nextSundayKey(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const add = day === 0 ? 7 : 7 - day;
  const d = new Date(now);
  d.setUTCDate(now.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    nuevo: 0,
    contactado: 0,
    inscrito: 0,
  });
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // new-session form
  const [form, setForm] = useState({
    date: nextSundayKey(),
    startTime: "11:00",
    endTime: "12:30",
    location: "Starbucks Tehuacán",
    activity: "Conversación en inglés en grupo",
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [leadRes, schedRes] = await Promise.all([
      getTeacherDashboardDataAction(),
      listScheduleAction(),
    ]);
    setLoading(false);
    if (!leadRes.success) {
      setError(leadRes.error || "Unauthorized.");
      router.push("/teacher/login");
      return;
    }
    setLeads(leadRes.leads);
    setCounts(leadRes.counts);
    if (schedRes.success) setSchedule(schedRes.entries);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
  }, [loadAll]);

  const handleLogout = async () => {
    await teacherLogoutAction();
    router.push("/teacher/login");
  };

  const changeStatus = async (id: string, status: LeadStatus) => {
    setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
    await updateLeadStatusAction(id, status);
    void loadAll();
  };

  const removeLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l._id !== id));
    await deleteLeadAction(id);
    void loadAll();
  };

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createScheduleEntryAction(form);
    if (res.success) void loadAll();
    else setError(res.error);
  };

  const patchEntry = async (id: string, patch: Partial<ScheduleRow>) => {
    await updateScheduleEntryAction(id, patch);
    void loadAll();
  };

  const removeEntry = async (id: string) => {
    setSchedule((prev) => prev.filter((s) => s._id !== id));
    await deleteScheduleEntryAction(id);
    void loadAll();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
        Loading teacher dashboard...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16 text-white md:px-8">
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Club <span className="text-blue-400">Dashboard</span>
            </h1>
            <p className="mt-1 text-xs text-white/40">
              Form registrations and session schedule
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a href="/teacher/campaigns">
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/5 hover:text-blue-300"
              >
                <QrCode className="size-4" />
                QR Campaigns
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Registrations",
              value: counts.total,
              color: "text-white",
            },
            { label: "New", value: counts.nuevo, color: "text-blue-400" },
            {
              label: "Contacted",
              value: counts.contactado,
              color: "text-amber-400",
            },
            {
              label: "Enrolled",
              value: counts.inscrito,
              color: "text-emerald-400",
            },
          ].map((s) => (
            <div key={s.label} className={cardClass + " py-5"}>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[11px] tracking-wider text-white/40 uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {/* Schedule manager */}
          <section className={cardClass}>
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="size-5 text-blue-400" />
              <h2 className="text-lg font-bold">Session schedule</h2>
            </div>
            <p className="mb-5 text-xs text-white/40">
              These sessions are shown on the homepage. If none are active, the
              site shows the upcoming Sundays by default.
            </p>

            {/* Add form */}
            <form
              onSubmit={addEntry}
              className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:grid-cols-6"
            >
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass + " col-span-2 md:col-span-1"}
              />
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location"
                className={inputClass + " col-span-2 md:col-span-1"}
              />
              <Button
                type="submit"
                className="flex items-center justify-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-400"
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </form>

            {schedule.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.06] py-8 text-center text-xs text-white/40">
                No sessions scheduled. The site shows the upcoming Sundays by
                default.
              </div>
            ) : (
              <div className="space-y-2">
                {schedule.map((s) => (
                  <div
                    key={s._id}
                    className={`grid grid-cols-2 items-center gap-2 rounded-xl border p-3 md:grid-cols-7 ${
                      s.active
                        ? "border-white/[0.08] bg-white/[0.02]"
                        : "border-white/[0.04] bg-white/[0.01] opacity-50"
                    }`}
                  >
                    <input
                      type="date"
                      defaultValue={s.date}
                      onBlur={(e) =>
                        patchEntry(s._id, { date: e.target.value })
                      }
                      className={inputClass + " col-span-2 md:col-span-1"}
                    />
                    <input
                      type="time"
                      defaultValue={s.startTime}
                      onBlur={(e) =>
                        patchEntry(s._id, { startTime: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="time"
                      defaultValue={s.endTime}
                      onBlur={(e) =>
                        patchEntry(s._id, { endTime: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      defaultValue={s.location}
                      onBlur={(e) =>
                        patchEntry(s._id, { location: e.target.value })
                      }
                      className={inputClass + " col-span-2 md:col-span-2"}
                    />
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => patchEntry(s._id, { active: !s.active })}
                        title={s.active ? "Hide" : "Show"}
                        className={`rounded-lg border px-2 py-1.5 text-[10px] font-semibold ${
                          s.active
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-white/10 bg-white/5 text-white/40"
                        }`}
                      >
                        {s.active ? "Active" : "Hidden"}
                      </button>
                      <button
                        onClick={() => removeEntry(s._id)}
                        title="Delete"
                        className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Leads */}
          <section className={cardClass}>
            <div className="mb-4 flex items-center gap-2">
              <Users className="size-5 text-blue-400" />
              <h2 className="text-lg font-bold">Form registrations</h2>
            </div>

            {leads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.06] py-10 text-center">
                <Users className="mx-auto mb-3 size-8 text-white/15" />
                <p className="text-sm font-semibold text-white/70">
                  No registrations yet
                </p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-white/40">
                  When someone registers at /join they will appear here with
                  their phone number so you can call them.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-white/[0.06] text-[10px] tracking-wider text-white/40 uppercase">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Phone</th>
                      <th className="py-2 pr-4">Level</th>
                      <th className="py-2 pr-4">Time</th>
                      <th className="py-2 pr-4">Source</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr
                        key={l._id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.01]"
                      >
                        <td className="py-3 pr-4">
                          <span className="text-sm font-semibold text-white">
                            {l.name}
                          </span>
                          {l.age != null && (
                            <span className="ml-1.5 text-[11px] text-white/35">
                              · {l.age} yrs
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <a
                            href={`tel:${l.phone}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:underline"
                          >
                            <Phone className="size-3" />
                            {l.phone}
                          </a>
                        </td>
                        <td className="py-3 pr-4 text-xs text-white/60">
                          {l.level}
                        </td>
                        <td className="py-3 pr-4 text-xs text-white/60">
                          {l.slot}
                        </td>
                        <td className="py-3 pr-4 text-[11px] text-white/40">
                          {l.campaignCode ? (
                            <span className="rounded-full bg-white/5 px-2 py-0.5">
                              {l.campaignCode}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-4 text-[11px] text-white/40">
                          {new Date(l.createdAt).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="py-3 pr-4">
                          <select
                            value={l.status}
                            onChange={(e) =>
                              changeStatus(l._id, e.target.value as LeadStatus)
                            }
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_STYLES[l.status]}`}
                          >
                            <option
                              value="nuevo"
                              className="bg-[#111827] text-white"
                            >
                              New
                            </option>
                            <option
                              value="contactado"
                              className="bg-[#111827] text-white"
                            >
                              Contacted
                            </option>
                            <option
                              value="inscrito"
                              className="bg-[#111827] text-white"
                            >
                              Enrolled
                            </option>
                          </select>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => removeLead(l._id)}
                            title="Delete"
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
