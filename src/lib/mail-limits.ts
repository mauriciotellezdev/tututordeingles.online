import { getCollection } from "@/lib/db";

// Self-tracked daily email volume so we can warn the owner BEFORE hitting the
// transactional-email cap (Brevo free = 300/day). If that cap trips, OTP login/
// signup + booking mail silently stop and the funnel is DOA — this gives a
// day-of heads-up to upgrade. Provider-agnostic: we count our own sends.

const MAIL_LIMITS_COLLECTION = "mail_limits";

// Fractions of the daily cap that trigger a one-time notification (per day):
// 0.5 = early heads-up, 0.8 = urgent (upgrade soon).
const ALERT_THRESHOLDS = [0.5, 0.8] as const;

function dailyCap(): number {
  const n = Number(process.env.MAIL_DAILY_CAP);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 300; // Brevo free default
}

export interface MailSendCheck {
  count: number;
  cap: number;
  /** Fraction (e.g. 0.5, 0.8) just crossed and to be alerted; null otherwise. */
  alertLevel: number | null;
}

/**
 * Record one send against today's counter and report which alert threshold (if
 * any) was just crossed for the first time today. Thresholds are claimed
 * atomically so only one concurrent send fires each; crossing a higher level
 * also marks all lower ones (so a jump past several only alerts the highest).
 */
export async function recordMailSendAndCheck(): Promise<MailSendCheck> {
  const cap = dailyCap();
  const day = new Date().toISOString().slice(0, 10);

  const col = await getCollection<{
    _id: string;
    count: number;
    alertedLevels?: number[];
  }>(MAIL_LIMITS_COLLECTION);

  const doc = await col.findOneAndUpdate(
    { _id: day },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const count = doc?.count ?? 1;
  const alerted = doc?.alertedLevels ?? [];

  const crossed = ALERT_THRESHOLDS.filter(
    (t) => count >= Math.floor(cap * t) && !alerted.includes(t)
  );
  if (crossed.length === 0) {
    return { count, cap, alertLevel: null };
  }

  const level = Math.max(...crossed);
  const toMark = ALERT_THRESHOLDS.filter((t) => t <= level);
  const claim = await col.updateOne(
    { _id: day, alertedLevels: { $ne: level } },
    { $addToSet: { alertedLevels: { $each: toMark } } }
  );

  return { count, cap, alertLevel: claim.modifiedCount === 1 ? level : null };
}
