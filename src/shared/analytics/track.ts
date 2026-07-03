// Conversion tracking helpers. No-op if analytics isn't loaded (no consent or
// no configured IDs), so they're always safe to call. Fires both GA4 and Meta
// Pixel with each platform's standard event names for ad optimization.

type Gtag = (command: string, ...args: unknown[]) => void;
type Fbq = (command: string, ...args: unknown[]) => void;

function gtag(): Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { gtag?: Gtag }).gtag;
}

function fbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { fbq?: Fbq }).fbq;
}

/** New account created (top-of-funnel lead). */
export function trackSignup() {
  gtag()?.("event", "sign_up");
  fbq()?.("track", "Lead");
}

/** Checkout started for a plan. */
export function trackBeginCheckout(plan: "single" | "package") {
  const value = plan === "single" ? 300 : 2400;
  gtag()?.("event", "begin_checkout", { currency: "MXN", value, plan });
  fbq()?.("track", "InitiateCheckout", { currency: "MXN", value });
}

/** A class was booked. */
export function trackBooking(type: "intro" | "tutoring") {
  gtag()?.("event", type === "intro" ? "book_trial" : "book_class");
  fbq()?.("track", "Schedule", { content_category: type });
}

/** A payment completed (fired on the checkout-success return). */
export function trackPurchase(plan: "single" | "package") {
  const value = plan === "single" ? 300 : 2400;
  gtag()?.("event", "purchase", { currency: "MXN", value, plan });
  fbq()?.("track", "Purchase", { currency: "MXN", value });
}
