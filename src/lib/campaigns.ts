import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import {
  CAMPAIGN_COLLECTION,
  CAMPAIGN_SCAN_COLLECTION,
  CAMPAIGN_SIGNUP_COLLECTION,
  DEFAULT_CAMPAIGN_TARGET,
  normalizeCampaignCode,
  type Campaign,
} from "@/lib/models/campaign";
import { PAYMENT_COLLECTION } from "@/lib/models/payment";
import { STUDENT_COLLECTION } from "@/lib/models/student";

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
      const signupsCol = await getCollection(CAMPAIGN_SIGNUP_COLLECTION);

      await Promise.all([
        campaignsCol.createIndex(
          { code: 1 },
          { unique: true, name: "campaign_code_unique" }
        ),
        scansCol.createIndex(
          { code: 1, day: 1 },
          { unique: true, name: "campaign_scan_code_day_unique" }
        ),
        signupsCol.createIndex(
          { studentId: 1 },
          { unique: true, sparse: true, name: "campaign_signup_student_unique" }
        ),
        signupsCol.createIndex(
          { code: 1 },
          { name: "campaign_signup_code_idx" }
        ),
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
 * Decide where a scanned code should send the visitor.
 *
 * - Active code → its own target.
 * - Inactive code → follow the fallbackCode chain to the first ACTIVE code's
 *   target (intelligent redirect for retired codes), otherwise the default
 *   Tehuacán landing page. We never dead-end a printed QR.
 * - Unknown code → default landing page.
 */
export async function resolveCampaignRedirect(
  rawCode: string
): Promise<RedirectResolution> {
  let code: string;
  try {
    code = normalizeCampaignCode(rawCode);
  } catch {
    return { target: DEFAULT_CAMPAIGN_TARGET, found: false, active: false };
  }

  const campaignsCol = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
  const campaign = await campaignsCol.findOne({ code });

  if (!campaign) {
    return { target: DEFAULT_CAMPAIGN_TARGET, found: false, active: false };
  }

  if (campaign.active) {
    return { target: campaign.target, found: true, active: true };
  }

  // Inactive: walk the fallback chain (guard against loops / long chains).
  const seen = new Set<string>([code]);
  let cursor: Campaign = campaign;
  for (let hops = 0; hops < 8; hops += 1) {
    const nextCode = cursor.fallbackCode;
    if (!nextCode || seen.has(nextCode)) break;
    seen.add(nextCode);
    const next = await campaignsCol.findOne({ code: nextCode });
    if (!next) break;
    if (next.active) {
      return { target: next.target, found: true, active: false };
    }
    cursor = next;
  }

  // No active fallback found — send to the default landing page rather than a
  // retired destination.
  return { target: DEFAULT_CAMPAIGN_TARGET, found: true, active: false };
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

/**
 * Persist which campaign code a new student signed up from. Best-effort and
 * decoupled from the students collection so it can never break signup.
 */
export async function recordSignupAttribution(payload: {
  code: string;
  studentId: string;
  email: string;
}): Promise<void> {
  let code: string;
  try {
    code = normalizeCampaignCode(payload.code);
  } catch {
    return;
  }

  const now = new Date();
  const campaignsCol = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
  const signupsCol = await getCollection(CAMPAIGN_SIGNUP_COLLECTION);
  const studentOid = new ObjectId(payload.studentId);

  await signupsCol.updateOne(
    { studentId: studentOid },
    {
      $setOnInsert: {
        studentId: studentOid,
        code,
        email: payload.email.toLowerCase().trim(),
        createdAt: now,
      },
    },
    { upsert: true }
  );

  // Only counts against a real campaign record.
  await campaignsCol.updateOne(
    { code },
    { $inc: { signupCount: 1 }, $set: { updatedAt: now } }
  );
}

export interface CampaignStat {
  signups: number;
  paidStudents: number;
  revenueCents: number;
  scan7d: number;
  scan30d: number;
}

function dayString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Read-time analytics per campaign code: attributed signups, how many of those
 * students actually PAID, total attributed revenue, and recent scan trend.
 * Recomputed from source (campaign_signups + payments + campaign_scans) so it
 * needs no write-path changes to the Stripe webhook.
 */
export async function getCampaignStats(): Promise<Map<string, CampaignStat>> {
  const signupsCol = await getCollection(CAMPAIGN_SIGNUP_COLLECTION);
  const scansCol = await getCollection(CAMPAIGN_SCAN_COLLECTION);

  const now = new Date();
  const cutoff7 = dayString(new Date(now.getTime() - 6 * 86_400_000));
  const cutoff30 = dayString(new Date(now.getTime() - 29 * 86_400_000));

  const [revenueRows, scanRows] = await Promise.all([
    signupsCol
      .aggregate<{
        _id: string;
        signups: number;
        paidStudents: number;
        revenueCents: number;
      }>([
        {
          $lookup: {
            from: PAYMENT_COLLECTION,
            let: { sid: "$studentId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$studentId", "$$sid"] },
                      { $eq: ["$status", "succeeded"] },
                    ],
                  },
                },
              },
              { $project: { amount: 1 } },
            ],
            as: "pays",
          },
        },
        {
          $group: {
            _id: "$code",
            signups: { $sum: 1 },
            paidStudents: {
              $sum: { $cond: [{ $gt: [{ $size: "$pays" }, 0] }, 1, 0] },
            },
            revenueCents: { $sum: { $sum: "$pays.amount" } },
          },
        },
      ])
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
      stat = {
        signups: 0,
        paidStudents: 0,
        revenueCents: 0,
        scan7d: 0,
        scan30d: 0,
      };
      map.set(code, stat);
    }
    return stat;
  };

  for (const r of revenueRows) {
    const stat = ensure(r._id);
    stat.signups = r.signups;
    stat.paidStudents = r.paidStudents;
    stat.revenueCents = r.revenueCents || 0;
  }
  for (const s of scanRows) {
    const stat = ensure(s._id);
    stat.scan7d = s.scan7d;
    stat.scan30d = s.scan30d;
  }
  return map;
}

export interface CampaignSignupRow {
  studentId: string;
  name: string;
  email: string;
  createdAt: string;
  paid: boolean;
  revenueCents: number;
}

/** Who signed up from a given code, and whether they became paying students. */
export async function getCampaignSignups(
  rawCode: string
): Promise<CampaignSignupRow[]> {
  let code: string;
  try {
    code = normalizeCampaignCode(rawCode);
  } catch {
    return [];
  }

  const signupsCol = await getCollection(CAMPAIGN_SIGNUP_COLLECTION);
  const rows = await signupsCol
    .aggregate<{
      studentId?: ObjectId;
      email?: string;
      createdAt?: Date;
      student?: { name?: string; email?: string };
      pays?: { amount?: number }[];
    }>([
      { $match: { code } },
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
      {
        $lookup: {
          from: STUDENT_COLLECTION,
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: PAYMENT_COLLECTION,
          let: { sid: "$studentId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$studentId", "$$sid"] },
                    { $eq: ["$status", "succeeded"] },
                  ],
                },
              },
            },
            { $project: { amount: 1 } },
          ],
          as: "pays",
        },
      },
    ])
    .toArray();

  return rows.map((r) => {
    const pays = r.pays ?? [];
    const created = r.createdAt instanceof Date ? r.createdAt : new Date();
    return {
      studentId: r.studentId?.toString() ?? "",
      name: r.student?.name ?? "—",
      email: r.student?.email ?? r.email ?? "—",
      createdAt: created.toISOString(),
      paid: pays.length > 0,
      revenueCents: pays.reduce((sum, p) => sum + (p.amount ?? 0), 0),
    };
  });
}
