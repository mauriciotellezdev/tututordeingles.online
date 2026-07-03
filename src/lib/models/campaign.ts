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
  target: string; // destination path (or absolute URL). e.g. "/clases-de-ingles-en-tehuacan"
  active: boolean;
  permanent: boolean; // permanent codes are never auto-deactivated
  fallbackCode?: string; // when inactive, redirect to this code's destination instead
  scanCount: number;
  signupCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt?: Date;
}

export interface CreateCampaignInput {
  code: string;
  label: string;
  medium?: string;
  target?: string;
  permanent?: boolean;
  fallbackCode?: string;
  notes?: string;
}

/** Where a scanned QR points by default (also the local-SEO landing page). */
export const DEFAULT_CAMPAIGN_TARGET = "/clases-de-ingles-en-tehuacan";

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
    throw new Error("El código no es válido. Usa letras, números y guiones.");
  }
  return code;
}

/** Normalize a destination into a leading-slash path or an absolute URL. */
export function normalizeCampaignTarget(raw?: string | null): string {
  const value = (raw || "").trim();
  if (!value) return DEFAULT_CAMPAIGN_TARGET;
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

export function createCampaign(
  input: CreateCampaignInput
): Omit<Campaign, "_id"> {
  const now = new Date();
  const code = normalizeCampaignCode(input.code);
  return {
    code,
    label: input.label.trim() || code,
    medium: (input.medium || "other").trim().toLowerCase(),
    target: normalizeCampaignTarget(input.target),
    active: true,
    permanent: Boolean(input.permanent),
    fallbackCode: input.fallbackCode
      ? normalizeCampaignCode(input.fallbackCode)
      : undefined,
    notes: input.notes?.trim() || undefined,
    scanCount: 0,
    signupCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}
