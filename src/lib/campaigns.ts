import { getCollection } from "@/lib/db";
import {
  CAMPAIGN_COLLECTION,
  CAMPAIGN_SCAN_COLLECTION,
  normalizeCampaignCode,
  type Campaign,
} from "@/lib/models/campaign";
import {
  LEAD_COLLECTION,
  LEAD_LEVEL_LABELS,
  LEAD_SLOT_LABELS,
  type Lead,
} from "@/lib/models/lead";
import { blogPosts } from "@/lib/blog-posts";

// Where a scan is sent when its destination is dead or the code is unknown —
// the visitor always lands somewhere real, never on a 404.
export const HOMEPAGE_TARGET = "/";

// The public pages a campaign QR may legitimately point to. Built from the
// static marketing routes plus the content registry so it stays in sync as
// posts/landing pages are added. A printed QR always encodes /q/<code>, so the
// image never changes — but if the destination we forward it to was since
// deleted, we send the scan to the homepage instead of a broken page.
const STATIC_DESTINATIONS = [
  "/",
  "/join",
  "/perder-el-miedo-a-hablar-ingles",
  "/club-de-conversacion-en-ingles-tehuacan",
  "/clases-de-ingles-experiencias",
  "/english-for-job-interviews",
  "/ingles-para-entrevistas-de-trabajo",
  "/blog",
  "/aviso-de-privacidad",
  "/terminos",
  "/reembolsos",
];

const VALID_DESTINATIONS = new Set<string>([
  ...STATIC_DESTINATIONS,
  ...blogPosts.map((p) =>
    p.kind === "blog" ? `/blog/${p.slug}` : `/${p.slug}`
  ),
]);

/**
 * Guarantee a scan never lands on a dead page. External URLs pass through
 * unchanged; internal paths are checked against the set of pages that actually
 * exist and fall back to the homepage when the target no longer resolves.
 */
export function resolveValidDestination(target: string): string {
  if (/^https?:\/\//i.test(target)) return target;
  const path = target.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return VALID_DESTINATIONS.has(path) ? target : HOMEPAGE_TARGET;
}

// Link-preview crawlers and scrapers that hit /q/<code> when a link is shared
// (WhatsApp, Messenger, Slack, etc.). They must still be redirected so the
// preview unfurls, but must NOT inflate scan counts or receive an attribution
// cookie. A missing UA is treated as a bot too (real browsers always send one).
const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|slack|twitter|linkedin|embedly|pinterest|redditbot|applebot|bingpreview|yandex|baiduspider|python-requests|axios|okhttp|curl|wget|headless|preview/i;

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || !ua.trim()) return true;
  return BOT_UA.test(ua);
}

let ensureCampaignIndexesPromise: Promise<void> | null = null;

export async function ensureCampaignIndexes() {
  if (!ensureCampaignIndexesPromise) {
    ensureCampaignIndexesPromise = (async () => {
      const campaignsCol = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
      const scansCol = await getCollection(CAMPAIGN_SCAN_COLLECTION);
      const leadsCol = await getCollection<Lead>(LEAD_COLLECTION);

      await Promise.all([
        campaignsCol.createIndex(
          { code: 1 },
          { unique: true, name: "campaign_code_unique" }
        ),
        scansCol.createIndex(
          { code: 1, day: 1 },
          { unique: true, name: "campaign_scan_code_day_unique" }
        ),
        leadsCol.createIndex(
          { campaignCode: 1 },
          { name: "lead_campaign_idx" }
        ),
        leadsCol.createIndex({ createdAt: -1 }, { name: "lead_created_idx" }),
      ]);
    })().catch((error) => {
      ensureCampaignIndexesPromise = null;
      throw error;
    });
  }

  return ensureCampaignIndexesPromise;
}

export interface RedirectResolution {
  /** The path/URL to redirect the scanner to. */
  target: string;
  /** The matched campaign, if the scanned code exists. */
  found: boolean;
  /** Whether the matched code is currently active. */
  active: boolean;
}

/**
 * Decide where a scanned code should send the visitor. Every returned target is
 * passed through resolveValidDestination, so a scan can never dead-end on a
 * deleted page — it goes to the homepage instead.
 *
 * - Active code → its own target (or homepage if that page no longer exists).
 * - Inactive (retired) code → homepage.
 * - Unknown code → homepage.
 */
export async function resolveCampaignRedirect(
  rawCode: string
): Promise<RedirectResolution> {
  let code: string;
  try {
    code = normalizeCampaignCode(rawCode);
  } catch {
    return { target: HOMEPAGE_TARGET, found: false, active: false };
  }

  const campaignsCol = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
  const campaign = await campaignsCol.findOne({ code });

  if (!campaign) {
    return { target: HOMEPAGE_TARGET, found: false, active: false };
  }

  if (campaign.active) {
    return {
      target: resolveValidDestination(campaign.target),
      found: true,
      active: true,
    };
  }

  // Retired code → send home rather than to a stale page.
  return { target: HOMEPAGE_TARGET, found: true, active: false };
}

/** Record a scan against the originally scanned code (even if retired). */
export async function recordScan(rawCode: string): Promise<void> {
  let code: string;
  try {
    code = normalizeCampaignCode(rawCode);
  } catch {
    return;
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC bucket)

  const campaignsCol = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
  const scansCol = await getCollection(CAMPAIGN_SCAN_COLLECTION);

  await Promise.all([
    campaignsCol.updateOne(
      { code },
      { $inc: { scanCount: 1 }, $set: { updatedAt: now } }
    ),
    scansCol.updateOne(
      { code, day },
      { $inc: { count: 1 }, $setOnInsert: { code, day } },
      { upsert: true }
    ),
  ]);
}

export interface CampaignStat {
  /** Registrations (leads) attributed to this code. */
  leads: number;
  scan7d: number;
  scan30d: number;
}

function dayString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Read-time analytics per campaign code: attributed registrations (leads) and
 * recent scan trend. Recomputed from source (leads + campaign_scans) so it
 * needs no write-path bookkeeping.
 */
export async function getCampaignStats(): Promise<Map<string, CampaignStat>> {
  const leadsCol = await getCollection<Lead>(LEAD_COLLECTION);
  const scansCol = await getCollection(CAMPAIGN_SCAN_COLLECTION);

  const now = new Date();
  const cutoff7 = dayString(new Date(now.getTime() - 6 * 86_400_000));
  const cutoff30 = dayString(new Date(now.getTime() - 29 * 86_400_000));

  const [leadRows, scanRows] = await Promise.all([
    leadsCol
      .aggregate<{
        _id: string;
        leads: number;
      }>([{ $match: { campaignCode: { $type: "string" } } }, { $group: { _id: "$campaignCode", leads: { $sum: 1 } } }])
      .toArray(),
    scansCol
      .aggregate<{ _id: string; scan7d: number; scan30d: number }>([
        { $match: { day: { $gte: cutoff30 } } },
        {
          $group: {
            _id: "$code",
            scan7d: {
              $sum: { $cond: [{ $gte: ["$day", cutoff7] }, "$count", 0] },
            },
            scan30d: { $sum: "$count" },
          },
        },
      ])
      .toArray(),
  ]);

  const map = new Map<string, CampaignStat>();
  const ensure = (code: string): CampaignStat => {
    let stat = map.get(code);
    if (!stat) {
      stat = { leads: 0, scan7d: 0, scan30d: 0 };
      map.set(code, stat);
    }
    return stat;
  };

  for (const r of leadRows) ensure(r._id).leads = r.leads;
  for (const s of scanRows) {
    const stat = ensure(s._id);
    stat.scan7d = s.scan7d;
    stat.scan30d = s.scan30d;
  }
  return map;
}

export interface CampaignLeadRow {
  name: string;
  phone: string;
  level: string;
  slot: string;
  status: string;
  createdAt: string;
}

/** The registrations (leads) attributed to a given campaign code. */
export async function getCampaignLeads(
  rawCode: string
): Promise<CampaignLeadRow[]> {
  let code: string;
  try {
    code = normalizeCampaignCode(rawCode);
  } catch {
    return [];
  }

  const leadsCol = await getCollection<Lead>(LEAD_COLLECTION);
  const rows = await leadsCol
    .find({ campaignCode: code })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return rows.map((r) => ({
    name: r.name,
    phone: r.phone,
    level: LEAD_LEVEL_LABELS[r.level] ?? r.level,
    slot: LEAD_SLOT_LABELS[r.slot] ?? r.slot,
    status: r.status,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : new Date().toISOString(),
  }));
}
