import { createHash, randomUUID } from "crypto";

const ABUSE_HASH_SECRET =
  process.env.ABUSE_HASH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "dev-abuse-secret";

export function getClientIp(requestHeaders: {
  get(name: string): string | null;
}) {
  const forwarded = requestHeaders.get("x-forwarded-for") || "";
  const realIp =
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("cf-connecting-ip") ||
    "";
  const firstForwarded = forwarded.split(",")[0]?.trim();
  return firstForwarded || realIp.trim() || "unknown";
}

export function hashAbuseSignal(value: string) {
  return createHash("sha256")
    .update(`${ABUSE_HASH_SECRET}:${value}`)
    .digest("hex");
}

export function getOrCreateBrowserId(cookieStore: {
  get(name: string): { value?: string } | undefined;
}) {
  const existing = cookieStore.get("tu_browser_id")?.value;
  if (existing) {
    return existing;
  }

  return randomUUID();
}
