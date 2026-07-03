import { getCollection } from "@/lib/db";

// Self-tracked daily email volume so we can warn the owner BEFORE hitting the
// transactional-email cap (Brevo free = 300/day). If that cap trips, OTP login/
// signup + booking mail silently stop and the funnel is DOA — this gives a
// day-of heads-up to upgrade. Provider-agnostic: we count our own sends.

const MAIL_LIMITS_COLLECTION = "mail_limits";

function dailyCap(): number {
  const n = Number(process.env.MAIL_DAILY_CAP);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 300; // Brevo free default
}

export interface MailSendCheck {
  count: number;
  cap: number;
  /** True exactly once per day, when the warn threshold is first crossed. */
  shouldAlert: boolean;
}

/**
 * Record one send against today's counter and report whether the owner should
 * be alerted (first time crossing 80% of the cap today). The alert flag is
 * claimed atomically so only one concurrent send triggers it.
 */
export async function recordMailSendAndCheck(): Promise<MailSendCheck> {
  const cap = dailyCap();
  const warnAt = Math.floor(cap * 0.8);
  const day = new Date().toISOString().slice(0, 10);

  const col = await getCollection<{
    _id: string;
    count: number;
    alerted?: boolean;
  }>(MAIL_LIMITS_COLLECTION);

  const doc = await col.findOneAndUpdate(
    { _id: day },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  const count = doc?.count ?? 1;

  let shouldAlert = false;
  if (count >= warnAt && !doc?.alerted) {
    const claim = await col.updateOne(
      { _id: day, alerted: { $ne: true } },
      { $set: { alerted: true } }
    );
    shouldAlert = claim.modifiedCount === 1;
  }

  return { count, cap, shouldAlert };
}
