import { NextRequest, NextResponse } from "next/server";
import {
  ensureCampaignIndexes,
  isBotUserAgent,
  recordScan,
  resolveCampaignRedirect,
} from "@/lib/campaigns";
import { normalizeCampaignCode } from "@/lib/models/campaign";

// Campaign QR entrypoint: tututordeingles.online/q/<code>
// Resolves the destination, drops an attribution cookie, counts the scan,
// then 302-redirects. Always runs fresh (no caching) so scans are recorded.
export const dynamic = "force-dynamic";

const CAMPAIGN_COOKIE = "tu_campaign";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: rawCode } = await params;

  let normalized = "";
  try {
    normalized = normalizeCampaignCode(rawCode);
  } catch {
    normalized = "";
  }

  // Link-preview crawlers must be redirected (so the unfurl works) but must not
  // count as scans or receive an attribution cookie.
  const isBot = isBotUserAgent(request.headers.get("user-agent"));

  let target = "/";
  try {
    await ensureCampaignIndexes();
    const resolution = await resolveCampaignRedirect(rawCode);
    target = resolution.target;
    if (!isBot) {
      // Count the scan against the originally scanned code. Awaited so the
      // write isn't dropped when the redirect response ends the request.
      await recordScan(rawCode);
    }
  } catch (error) {
    console.error("Campaign redirect error:", error);
  }

  const destination = /^https?:\/\//i.test(target)
    ? target
    : new URL(target, request.url).toString();

  const response = NextResponse.redirect(destination, 302);

  // Persist which code brought them in, so signup can attribute it.
  if (normalized && !isBot) {
    response.cookies.set(CAMPAIGN_COOKIE, normalized, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return response;
}
