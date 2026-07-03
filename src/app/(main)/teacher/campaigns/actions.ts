"use server";

import { cookies } from "next/headers";
import QRCode from "qrcode";
import { MongoServerError, type UpdateFilter } from "mongodb";
import { getCollection } from "@/lib/db";
import { ensureCampaignIndexes } from "@/lib/campaigns";
import {
  CAMPAIGN_COLLECTION,
  createCampaign,
  normalizeCampaignCode,
  normalizeCampaignTarget,
  type Campaign,
} from "@/lib/models/campaign";

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
  conversion: number; // signups / scans, 0..1
  notes: string | null;
  scanUrl: string;
  createdAt: string;
  deactivatedAt: string | null;
}

function toRow(c: Campaign): CampaignRow {
  return {
    code: c.code,
    label: c.label,
    medium: c.medium,
    target: c.target,
    active: c.active,
    permanent: c.permanent,
    fallbackCode: c.fallbackCode ?? null,
    scanCount: c.scanCount,
    signupCount: c.signupCount,
    conversion: c.scanCount > 0 ? c.signupCount / c.scanCount : 0,
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
    const campaigns = await col.find({}).sort({ createdAt: -1 }).toArray();
    return { success: true as const, campaigns: campaigns.map(toRow) };
  } catch (error) {
    console.error("listCampaignsAction:", error);
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Error al cargar campañas.",
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
