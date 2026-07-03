"use server";

import { cookies } from "next/headers";
import QRCode from "qrcode";
import { MongoServerError, type UpdateFilter } from "mongodb";
import { getCollection } from "@/lib/db";
import {
  ensureCampaignIndexes,
  getCampaignStats,
  getCampaignSignups,
  type CampaignStat,
  type CampaignSignupRow,
} from "@/lib/campaigns";
import {
  CAMPAIGN_COLLECTION,
  createCampaign,
  normalizeCampaignCode,
  normalizeCampaignTarget,
  type Campaign,
} from "@/lib/models/campaign";

const ZERO_STAT: CampaignStat = {
  signups: 0,
  paidStudents: 0,
  revenueCents: 0,
  scan7d: 0,
  scan30d: 0,
};

const BASE =
  process.env.NEXT_PUBLIC_APP_URL || "https://tututordeingles.online";

async function requireTeacher() {
  const cookieStore = await cookies();
  return cookieStore.get("teacher_session")?.value === "true";
}

function buildCampaignScanUrl(code: string) {
  const base = BASE.endsWith("/") ? BASE.slice(0, -1) : BASE;
  return `${base}/q/${code}`;
}

export interface CampaignRow {
  code: string;
  label: string;
  medium: string;
  target: string;
  active: boolean;
  permanent: boolean;
  fallbackCode: string | null;
  scanCount: number;
  signupCount: number;
  paidCount: number;
  revenuePesos: number;
  scan7d: number;
  scan30d: number;
  conversion: number; // paying students / scans, 0..1
  notes: string | null;
  scanUrl: string;
  createdAt: string;
  deactivatedAt: string | null;
}

function toRow(c: Campaign, stat: CampaignStat): CampaignRow {
  // Prefer recomputed signup count from campaign_signups; fall back to the
  // denormalized counter if stats are unavailable.
  const signups = stat.signups || c.signupCount;
  return {
    code: c.code,
    label: c.label,
    medium: c.medium,
    target: c.target,
    active: c.active,
    permanent: c.permanent,
    fallbackCode: c.fallbackCode ?? null,
    scanCount: c.scanCount,
    signupCount: signups,
    paidCount: stat.paidStudents,
    revenuePesos: Math.round(stat.revenueCents / 100),
    scan7d: stat.scan7d,
    scan30d: stat.scan30d,
    // Conversion that matters: paying students per scan.
    conversion: c.scanCount > 0 ? stat.paidStudents / c.scanCount : 0,
    notes: c.notes ?? null,
    scanUrl: buildCampaignScanUrl(c.code),
    createdAt: c.createdAt.toISOString(),
    deactivatedAt: c.deactivatedAt ? c.deactivatedAt.toISOString() : null,
  };
}

export async function listCampaignsAction() {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    await ensureCampaignIndexes();
    const col = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
    const [campaigns, stats] = await Promise.all([
      col.find({}).sort({ createdAt: -1 }).toArray(),
      getCampaignStats(),
    ]);
    return {
      success: true as const,
      campaigns: campaigns.map((c) => toRow(c, stats.get(c.code) ?? ZERO_STAT)),
    };
  } catch (error) {
    console.error("listCampaignsAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Error al cargar campañas.",
    };
  }
}

export interface CampaignSignupsResult {
  success: true;
  signups: CampaignSignupRow[];
}

export async function getCampaignSignupsAction(code: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    const signups = await getCampaignSignups(code);
    return { success: true as const, signups };
  } catch (error) {
    console.error("getCampaignSignupsAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Error al cargar registros.",
    };
  }
}

export async function createCampaignAction(input: {
  code: string;
  label: string;
  medium?: string;
  target?: string;
  permanent?: boolean;
  fallbackCode?: string;
  notes?: string;
}) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    await ensureCampaignIndexes();
    const col = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
    const doc = createCampaign(input);
    await col.insertOne(doc as Campaign);
    return { success: true as const, code: doc.code };
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return {
        success: false as const,
        error: "Ya existe una campaña con ese código.",
      };
    }
    console.error("createCampaignAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Error al crear la campaña.",
    };
  }
}

export async function setCampaignActiveAction(code: string, active: boolean) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    const normalized = normalizeCampaignCode(code);
    const col = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
    const update: UpdateFilter<Campaign> = active
      ? {
          $set: { active: true, updatedAt: new Date() },
          $unset: { deactivatedAt: "" },
        }
      : {
          $set: {
            active: false,
            deactivatedAt: new Date(),
            updatedAt: new Date(),
          },
        };
    await col.updateOne({ code: normalized }, update);
    return { success: true as const };
  } catch (error) {
    console.error("setCampaignActiveAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error al actualizar.",
    };
  }
}

export async function updateCampaignAction(
  code: string,
  patch: {
    label?: string;
    medium?: string;
    target?: string;
    fallbackCode?: string | null;
    permanent?: boolean;
    notes?: string;
  }
) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    const normalized = normalizeCampaignCode(code);
    const col = await getCollection<Campaign>(CAMPAIGN_COLLECTION);

    const set: Record<string, unknown> = { updatedAt: new Date() };
    const unset: Record<string, ""> = {};

    if (patch.label !== undefined) set.label = patch.label.trim() || normalized;
    if (patch.medium !== undefined)
      set.medium = patch.medium.trim().toLowerCase();
    if (patch.target !== undefined)
      set.target = normalizeCampaignTarget(patch.target);
    if (patch.permanent !== undefined) set.permanent = Boolean(patch.permanent);
    if (patch.notes !== undefined) {
      const trimmed = patch.notes.trim();
      if (trimmed) set.notes = trimmed;
      else unset.notes = "";
    }
    if (patch.fallbackCode !== undefined) {
      if (patch.fallbackCode)
        set.fallbackCode = normalizeCampaignCode(patch.fallbackCode);
      else unset.fallbackCode = "";
    }

    const update: Record<string, unknown> = { $set: set };
    if (Object.keys(unset).length > 0) update.$unset = unset;

    await col.updateOne({ code: normalized }, update);
    return { success: true as const };
  } catch (error) {
    console.error("updateCampaignAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error al actualizar.",
    };
  }
}

export async function generateCampaignQrAction(code: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    const normalized = normalizeCampaignCode(code);
    const url = buildCampaignScanUrl(normalized);
    const dataUrl = await QRCode.toDataURL(url, {
      type: "image/png",
      width: 1024,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return { success: true as const, dataUrl, url };
  } catch (error) {
    console.error("generateCampaignQrAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error al generar el QR.",
    };
  }
}

export interface BulkCreateResult {
  success: true;
  created: string[];
  skipped: { line: string; reason: string }[];
}

/**
 * Create many codes at once. Each non-empty line is `code | label | medium`
 * (label and medium optional). Duplicates and invalid codes are skipped and
 * reported rather than aborting the whole batch.
 */
export async function createCampaignsBulkAction(
  text: string,
  defaults?: { medium?: string; target?: string; permanent?: boolean }
) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    await ensureCampaignIndexes();
    const col = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
    const created: string[] = [];
    const skipped: { line: string; reason: string }[] = [];

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      const [rawCode, label, medium] = line.split("|").map((p) => p.trim());
      if (!rawCode) {
        skipped.push({ line, reason: "sin código" });
        continue;
      }
      try {
        const doc = createCampaign({
          code: rawCode,
          label: label || rawCode,
          medium: medium || defaults?.medium,
          target: defaults?.target,
          permanent: defaults?.permanent,
        });
        await col.insertOne(doc as Campaign);
        created.push(doc.code);
      } catch (err) {
        if (err instanceof MongoServerError && err.code === 11000) {
          skipped.push({ line, reason: "código duplicado" });
        } else {
          skipped.push({
            line,
            reason: err instanceof Error ? err.message : "error",
          });
        }
      }
    }

    return { success: true as const, created, skipped };
  } catch (error) {
    console.error("createCampaignsBulkAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Error al crear en lote.",
    };
  }
}

export interface SheetItem {
  code: string;
  label: string;
  medium: string;
  url: string;
  dataUrl: string;
}

/**
 * QR + label for every active campaign, for a print-and-cut poster sheet.
 */
export async function generateCampaignSheetAction() {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "No autorizado." };
  }
  try {
    const col = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
    const campaigns = await col
      .find({ active: true })
      .sort({ createdAt: -1 })
      .toArray();

    const items: SheetItem[] = await Promise.all(
      campaigns.map(async (c) => {
        const url = buildCampaignScanUrl(c.code);
        const dataUrl = await QRCode.toDataURL(url, {
          type: "image/png",
          width: 512,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
        });
        return { code: c.code, label: c.label, medium: c.medium, url, dataUrl };
      })
    );

    return { success: true as const, items };
  } catch (error) {
    console.error("generateCampaignSheetAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Error al generar la hoja.",
    };
  }
}
