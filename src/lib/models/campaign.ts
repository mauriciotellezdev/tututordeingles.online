import { ObjectId } from "mongodb";

export const CAMPAIGN_COLLECTION = "campaigns";
export const CAMPAIGN_SCAN_COLLECTION = "campaign_scans";
export const CAMPAIGN_SIGNUP_COLLECTION = "campaign_signups";

/**
 * A QR / marketing campaign code. Each printed QR (combi, flyer, bulletin, etc.)
 * points at `/q/<code>`. The code is a permanent record so we can:
 *  - redirect to a configurable destination,
 *  - deactivate it later and redirect intelligently to a fallback,
 *  - count scans and attributed signups to see what performs best.
 */
export interface Campaign {
  _id: ObjectId;
  code: string; // normalized slug, unique. e.g. "combi-01"
  label: string; // human friendly name. e.g. "Combi ruta 3"
  medium: string; // channel bucket. e.g. "combi" | "flyer" | "bulletin" | "poster" | "other"
  target: string; // destination path (or absolute URL). e.g. "/club-de-conversacion-en-ingles-tehuacan"
  active: boolean;
  permanent: boolean; // permanent codes are never auto-deactivated
  scanCount: number;
  signupCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt?: Date;
  // Soft delete: archived campaigns are hidden from the main list but keep all
  // their scan + registration history so stats are never lost.
  deletedAt?: Date;
}

export interface CreateCampaignInput {
  /** Optional: when empty the code is derived from the name (label). */
  code?: string;
  label: string;
  medium?: string;
  target?: string;
  permanent?: boolean;
  notes?: string;
}

export const CAMPAIGN_MEDIA = [
  "combi",
  "flyer",
  "bulletin",
  "poster",
  "sticker",
  "store",
  "other",
] as const;

/**
 * Normalize a code into a URL-safe, lowercase slug. Keeps a-z, 0-9 and hyphens.
 * Throws if nothing usable remains.
 */
export function normalizeCampaignCode(raw: string): string {
  const code = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  if (!code) {
    throw new Error("Enter a name (letters and numbers).");
  }
  return code;
}

/** Normalize a destination into a leading-slash path or an absolute URL. */
export function normalizeCampaignTarget(raw?: string | null): string {
  const value = (raw || "").trim();
  if (!value) return "/"; // no destination given → homepage
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export function createCampaign(
  input: CreateCampaignInput
): Omit<Campaign, "_id"> {
  const now = new Date();
  // Derive the code from the name when no explicit code is given, so the teacher
  // only has to type a name. An explicit code still wins when provided.
  const rawCode = input.code?.trim() ? input.code : input.label;
  const code = normalizeCampaignCode(rawCode);
  // Omit optional fields entirely when empty — the strict $jsonSchema validator
  // rejects `null`/`undefined` for `fallbackCode`/`notes` (they must be absent
  // or a string), and the driver serializes `undefined` as `null`.
  const doc: Omit<Campaign, "_id"> = {
    code,
    label: input.label.trim() || code,
    medium: (input.medium || "other").trim().toLowerCase(),
    target: normalizeCampaignTarget(input.target),
    active: true,
    permanent: Boolean(input.permanent),
    scanCount: 0,
    signupCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const notes = input.notes?.trim();
  if (notes) {
    doc.notes = notes;
  }
  return doc;
}
