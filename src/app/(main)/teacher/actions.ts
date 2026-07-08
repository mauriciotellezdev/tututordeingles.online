"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import {
  LEAD_COLLECTION,
  LEAD_LEVEL_LABELS,
  LEAD_SLOT_LABELS,
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
} from "@/lib/models/lead";
import {
  CALENDAR_COLLECTION,
  createCalendarEntry,
  type CalendarEntry,
} from "@/lib/models/calendar-entry";

async function requireTeacher() {
  const cookieStore = await cookies();
  return cookieStore.get("teacher_session")?.value === "true";
}

/* ------------------------------------------------------------------ leads */

export interface LeadRow {
  _id: string;
  name: string;
  phone: string;
  level: string;
  slot: string;
  age: number | null;
  goal: string | null;
  status: LeadStatus;
  campaignCode: string | null;
  createdAt: string;
}

export async function getTeacherDashboardDataAction() {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const col = await getCollection<Lead>(LEAD_COLLECTION);
    const leads = await col
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    const rows: LeadRow[] = leads.map((l) => ({
      _id: l._id.toString(),
      name: l.name,
      phone: l.phone,
      level: LEAD_LEVEL_LABELS[l.level] ?? l.level,
      slot: LEAD_SLOT_LABELS[l.slot] ?? l.slot,
      age: typeof l.age === "number" ? l.age : null,
      goal: l.goal ?? null,
      status: l.status,
      campaignCode: l.campaignCode ?? null,
      createdAt:
        l.createdAt instanceof Date
          ? l.createdAt.toISOString()
          : new Date().toISOString(),
    }));

    const counts = {
      total: rows.length,
      nuevo: rows.filter((r) => r.status === "nuevo").length,
      contactado: rows.filter((r) => r.status === "contactado").length,
      inscrito: rows.filter((r) => r.status === "inscrito").length,
    };

    return { success: true as const, leads: rows, counts };
  } catch (error) {
    console.error("getTeacherDashboardDataAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load registrations.",
    };
  }
}

export async function updateLeadStatusAction(id: string, status: LeadStatus) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
    return { success: false as const, error: "Invalid status." };
  }
  try {
    const col = await getCollection<Lead>(LEAD_COLLECTION);
    const set: Partial<Lead> = { status };
    if (status === "contactado") set.contactedAt = new Date();
    await col.updateOne({ _id: new ObjectId(id) }, { $set: set });
    return { success: true as const };
  } catch (error) {
    console.error("updateLeadStatusAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update.",
    };
  }
}

export async function deleteLeadAction(id: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const col = await getCollection<Lead>(LEAD_COLLECTION);
    await col.deleteOne({ _id: new ObjectId(id) });
    return { success: true as const };
  } catch (error) {
    console.error("deleteLeadAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete.",
    };
  }
}

/* --------------------------------------------------------------- schedule */

export interface ScheduleRow {
  _id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  activity: string;
  active: boolean;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse a YYYY-MM-DD into a UTC-midnight Date (stable, tz-independent). */
function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

export async function listScheduleAction() {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const col = await getCollection<CalendarEntry>(CALENDAR_COLLECTION);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);
    const entries = await col
      .find({ date: { $gte: cutoff } })
      .sort({ date: 1, startTime: 1 })
      .limit(100)
      .toArray();

    const rows: ScheduleRow[] = entries.map((e) => ({
      _id: e._id.toString(),
      date: toDateKey(e.date),
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      activity: e.activity,
      active: e.active,
    }));
    return { success: true as const, entries: rows };
  } catch (error) {
    console.error("listScheduleAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to load schedule.",
    };
  }
}

export async function createScheduleEntryAction(input: {
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  activity: string;
}) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    if (!input.date) {
      return { success: false as const, error: "Date is required." };
    }
    const col = await getCollection<CalendarEntry>(CALENDAR_COLLECTION);
    const doc = createCalendarEntry({
      date: parseDateKey(input.date),
      startTime: input.startTime || "11:00",
      endTime: input.endTime || "12:30",
      location: input.location?.trim() || "Por confirmar",
      activity: input.activity?.trim() || "Conversación en inglés en grupo",
    });
    await col.insertOne(doc as CalendarEntry);
    return { success: true as const };
  } catch (error) {
    console.error("createScheduleEntryAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to create session.",
    };
  }
}

export async function updateScheduleEntryAction(
  id: string,
  patch: {
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    activity?: string;
    active?: boolean;
  }
) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const col = await getCollection<CalendarEntry>(CALENDAR_COLLECTION);
    const set: Record<string, unknown> = { updatedAt: new Date() };
    if (patch.date) set.date = parseDateKey(patch.date);
    if (patch.startTime !== undefined) set.startTime = patch.startTime;
    if (patch.endTime !== undefined) set.endTime = patch.endTime;
    if (patch.location !== undefined)
      set.location = patch.location.trim() || "Por confirmar";
    if (patch.activity !== undefined)
      set.activity = patch.activity.trim() || "Conversación en inglés en grupo";
    if (patch.active !== undefined) set.active = Boolean(patch.active);

    await col.updateOne({ _id: new ObjectId(id) }, { $set: set });
    return { success: true as const };
  } catch (error) {
    console.error("updateScheduleEntryAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update.",
    };
  }
}

export async function deleteScheduleEntryAction(id: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const col = await getCollection<CalendarEntry>(CALENDAR_COLLECTION);
    await col.deleteOne({ _id: new ObjectId(id) });
    return { success: true as const };
  } catch (error) {
    console.error("deleteScheduleEntryAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete.",
    };
  }
}

/* ----------------------------------------------------------------- logout */

export async function teacherLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("teacher_session");
  return { success: true as const };
}
