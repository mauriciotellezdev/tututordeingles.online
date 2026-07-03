import { getCollection } from "@/lib/db";

// Rate-limiting + brute-force lockout for email OTP codes. Kept in its own
// collection (keyed by email) so it never touches the strict `students`
// validator. Protects against: (a) email-bombing via repeated code requests,
// (b) brute-forcing the 6-digit code within its validity window.

const OTP_GUARD_COLLECTION = "otp_guards";

const SEND_COOLDOWN_MS = 45_000; // minimum gap between code sends
const SEND_MAX_PER_WINDOW = 6; // max sends per window
const SEND_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5; // wrong codes before lockout
const LOCK_MS = 15 * 60 * 1000;

interface OtpGuard {
  _id: string; // normalized email
  sends?: Date[];
  failedAttempts?: number;
  lockedUntil?: Date;
  updatedAt?: Date;
}

function keyOf(email: string): string {
  return email.toLowerCase().trim();
}

export interface GuardCheck {
  allowed: boolean;
  retryAfterSec?: number;
}

/** Check + record a code-send. Enforces a cooldown and a per-window cap. */
export async function checkAndRecordSend(email: string): Promise<GuardCheck> {
  const col = await getCollection<OtpGuard>(OTP_GUARD_COLLECTION);
  const key = keyOf(email);
  const now = Date.now();

  const guard = await col.findOne({ _id: key });
  const recent = (guard?.sends ?? [])
    .map((d) => new Date(d).getTime())
    .filter((t) => now - t < SEND_WINDOW_MS);

  if (recent.length > 0) {
    const sinceLast = now - Math.max(...recent);
    if (sinceLast < SEND_COOLDOWN_MS) {
      return {
        allowed: false,
        retryAfterSec: Math.ceil((SEND_COOLDOWN_MS - sinceLast) / 1000),
      };
    }
  }
  if (recent.length >= SEND_MAX_PER_WINDOW) {
    return { allowed: false, retryAfterSec: Math.ceil(SEND_WINDOW_MS / 1000) };
  }

  recent.push(now);
  await col.updateOne(
    { _id: key },
    { $set: { sends: recent.map((t) => new Date(t)), updatedAt: new Date() } },
    { upsert: true }
  );
  return { allowed: true };
}

/** Check whether verification attempts are currently locked. */
export async function checkVerifyAllowed(email: string): Promise<GuardCheck> {
  const col = await getCollection<OtpGuard>(OTP_GUARD_COLLECTION);
  const guard = await col.findOne({ _id: keyOf(email) });
  if (guard?.lockedUntil) {
    const remaining = new Date(guard.lockedUntil).getTime() - Date.now();
    if (remaining > 0) {
      return { allowed: false, retryAfterSec: Math.ceil(remaining / 1000) };
    }
  }
  return { allowed: true };
}

/** Record a wrong code; lock the account after too many failures. */
export async function recordFailedVerify(email: string): Promise<void> {
  const col = await getCollection<OtpGuard>(OTP_GUARD_COLLECTION);
  const key = keyOf(email);
  const guard = await col.findOne({ _id: key });
  const failed = (guard?.failedAttempts ?? 0) + 1;

  if (failed >= MAX_FAILED_ATTEMPTS) {
    await col.updateOne(
      { _id: key },
      {
        $set: {
          failedAttempts: 0,
          lockedUntil: new Date(Date.now() + LOCK_MS),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
  } else {
    await col.updateOne(
      { _id: key },
      { $set: { failedAttempts: failed, updatedAt: new Date() } },
      { upsert: true }
    );
  }
}

/** Reset guard state on a successful verification. */
export async function clearOtpGuard(email: string): Promise<void> {
  const col = await getCollection<OtpGuard>(OTP_GUARD_COLLECTION);
  await col.updateOne(
    { _id: keyOf(email) },
    {
      $set: { failedAttempts: 0, updatedAt: new Date() },
      $unset: { lockedUntil: "" },
    }
  );
}
