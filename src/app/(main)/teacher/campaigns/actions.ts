"use server";

import { cookies } from "next/headers";
import QRCode from "qrcode";
import { MongoServerError } from "mongodb";
import { getCollection } from "@/lib/db";
import {
  ensureCampaignIndexes,
  getCampaignStats,
  getCampaignLeads,
  type CampaignStat,
  type CampaignLeadRow,
} from "@/lib/campaigns";
import {
  CAMPAIGN_COLLECTION,
  createCampaign,
  normalizeCampaignCode,
  normalizeCampaignTarget,
  type Campaign,
} from "@/lib/models/campaign";

const ZERO_STAT: CampaignStat = {
  leads: 0,
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
  scanCount: number;
  leadCount: number;
  scan7d: number;
  scan30d: number;
  conversion: number; // registrations / scans, 0..1
  notes: string | null;
  scanUrl: string;
  createdAt: string;
  deleted: boolean;
}

function toRow(c: Campaign, stat: CampaignStat): CampaignRow {
  return {
    code: c.code,
    label: c.label,
    medium: c.medium,
    target: c.target,
    active: c.active,
    permanent: c.permanent,
    scanCount: c.scanCount,
    leadCount: stat.leads,
    scan7d: stat.scan7d,
    scan30d: stat.scan30d,
    // Conversion that matters: registrations (leads) per scan.
    conversion: c.scanCount > 0 ? stat.leads / c.scanCount : 0,
    notes: c.notes ?? null,
    scanUrl: buildCampaignScanUrl(c.code),
    createdAt: c.createdAt.toISOString(),
    deleted: Boolean(c.deletedAt),
  };
}

export async function listCampaignsAction() {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
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
        error instanceof Error ? error.message : "Failed to load campaigns.",
    };
  }
}

export interface CampaignLeadsResult {
  success: true;
  leads: CampaignLeadRow[];
}

export async function getCampaignSignupsAction(code: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const leads = await getCampaignLeads(code);
    return { success: true as const, leads };
  } catch (error) {
    console.error("getCampaignSignupsAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load registrations.",
    };
  }
}

export async function createCampaignAction(input: {
  code?: string;
  label: string;
  medium?: string;
  target?: string;
  permanent?: boolean;
  notes?: string;
}) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  if (!input.label?.trim() && !input.code?.trim()) {
    return { success: false as const, error: "Enter a name." };
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
        error: "A campaign with that code already exists.",
      };
    }
    console.error("createCampaignAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to create campaign.",
    };
  }
}

/**
 * Soft delete (archive) a campaign: hide it from the main list but keep the
 * campaign row, its scan history, and attributed registrations so no stats are
 * ever lost. A retired code's scans still resolve to the homepage.
 */
export async function deleteCampaignAction(code: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const normalized = normalizeCampaignCode(code);
    const campaigns = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
    await campaigns.updateOne(
      { code: normalized },
      { $set: { deletedAt: new Date(), active: false, updatedAt: new Date() } }
    );
    return { success: true as const };
  } catch (error) {
    console.error("deleteCampaignAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to archive.",
    };
  }
}

/** Restore an archived campaign back to the active list. */
export async function restoreCampaignAction(code: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
  }
  try {
    const normalized = normalizeCampaignCode(code);
    const campaigns = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
    await campaigns.updateOne(
      { code: normalized },
      {
        $set: { active: true, updatedAt: new Date() },
        $unset: { deletedAt: "" },
      }
    );
    return { success: true as const };
  } catch (error) {
    console.error("restoreCampaignAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to restore.",
    };
  }
}

export async function updateCampaignAction(
  code: string,
  patch: {
    label?: string;
    medium?: string;
    target?: string;
    permanent?: boolean;
    notes?: string;
  }
) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
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

    const update: Record<string, unknown> = { $set: set };
    if (Object.keys(unset).length > 0) update.$unset = unset;

    await col.updateOne({ code: normalized }, update);
    return { success: true as const };
  } catch (error) {
    console.error("updateCampaignAction:", error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update.",
    };
  }
}

export async function generateCampaignQrAction(code: string) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
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
      error: error instanceof Error ? error.message : "Failed to generate QR.",
    };
  }
}

export interface BulkCreateResult {
  success: true;
  created: string[];
  skipped: { line: string; reason: string }[];
}

/**
 * Create many campaigns at once. Each non-empty line is `name | medium`
 * (medium optional); the code is derived from the name. Duplicates and invalid
 * names are skipped and reported rather than aborting the whole batch.
 */
export async function createCampaignsBulkAction(
  text: string,
  defaults?: { medium?: string; target?: string; permanent?: boolean }
) {
  if (!(await requireTeacher())) {
    return { success: false as const, error: "Unauthorized." };
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
      const [name, medium] = line.split("|").map((p) => p.trim());
      if (!name) {
        skipped.push({ line, reason: "no name" });
        continue;
      }
      try {
        const doc = createCampaign({
          label: name,
          medium: medium || defaults?.medium,
          target: defaults?.target,
          permanent: defaults?.permanent,
        });
        await col.insertOne(doc as Campaign);
        created.push(doc.code);
      } catch (err) {
        if (err instanceof MongoServerError && err.code === 11000) {
          skipped.push({ line, reason: "duplicate code" });
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
      error: error instanceof Error ? error.message : "Failed to bulk create.",
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
    return { success: false as const, error: "Unauthorized." };
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
        error instanceof Error ? error.message : "Failed to generate sheet.",
    };
  }
}
