import { ObjectId } from "mongodb";

export const LEAD_COLLECTION = "leads";

/** English level the person self-reports at registration. */
export const LEAD_LEVELS = [
  "principiante",
  "intermedio",
  "avanzado",
  "no-se",
] as const;
export type LeadLevel = (typeof LEAD_LEVELS)[number];

/** Which Sunday group they prefer. */
export const LEAD_SLOTS = ["manana", "tarde", "cualquiera"] as const;
export type LeadSlot = (typeof LEAD_SLOTS)[number];

/** Where the lead is in the follow-up pipeline. */
export const LEAD_STATUSES = ["nuevo", "contactado", "inscrito"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * A registration from the /join funnel. The site no longer takes payments or
 * accounts online: a visitor leaves their name + phone and we call them to
 * confirm a spot in a Sunday conversation group. Payment happens in person.
 */
export interface Lead {
  _id: ObjectId;
  name: string;
  phone: string;
  level: LeadLevel;
  slot: LeadSlot;
  age?: number;
  goal?: string;
  campaignCode?: string; // QR/flyer attribution, if scanned in
  status: LeadStatus;
  notes?: string;
  createdAt: Date;
  contactedAt?: Date;
}

export interface CreateLeadInput {
  name: string;
  phone: string;
  level?: string;
  slot?: string;
  age?: number;
  goal?: string;
  campaignCode?: string;
}

function coerceLevel(raw?: string): LeadLevel {
  const v = (raw || "").trim().toLowerCase();
  return (LEAD_LEVELS as readonly string[]).includes(v)
    ? (v as LeadLevel)
    : "no-se";
}

function coerceSlot(raw?: string): LeadSlot {
  const v = (raw || "").trim().toLowerCase();
  return (LEAD_SLOTS as readonly string[]).includes(v)
    ? (v as LeadSlot)
    : "cualquiera";
}

/** Normalize a phone to digits (keep a leading +). */
export function normalizeLeadPhone(raw: string): string {
  const trimmed = (raw || "").trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/\D/g, "");
}

export function createLead(input: CreateLeadInput): Omit<Lead, "_id"> {
  const now = new Date();
  const doc: Omit<Lead, "_id"> = {
    name: input.name.trim(),
    phone: normalizeLeadPhone(input.phone),
    level: coerceLevel(input.level),
    slot: coerceSlot(input.slot),
    status: "nuevo",
    createdAt: now,
  };
  if (typeof input.age === "number" && Number.isFinite(input.age)) {
    doc.age = Math.trunc(input.age);
  }
  const goal = input.goal?.trim();
  if (goal) doc.goal = goal.slice(0, 500);
  const code = input.campaignCode?.trim().toLowerCase();
  if (code) doc.campaignCode = code;
  return doc;
}

export const LEAD_LEVEL_LABELS: Record<LeadLevel, string> = {
  principiante: "Beginner",
  intermedio: "Intermediate",
  avanzado: "Advanced",
  "no-se": "Not sure",
};

export const LEAD_SLOT_LABELS: Record<LeadSlot, string> = {
  manana: "Sunday 11:00 AM",
  tarde: "Sunday 5:00 PM",
  cualquiera: "Any time",
};
