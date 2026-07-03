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
