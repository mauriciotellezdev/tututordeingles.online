import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Inlined here (not imported from @/lib/models/campaign) because that module
// pulls in the mongodb driver, which cannot bundle into the edge middleware.
// Must stay in sync with normalizeCampaignCode.
function normalizeSrc(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Attribution for direct/digital links that carry ?src=<code> (as opposed to
  // the /q/<code> QR redirect). Last-touch: the newest source wins.
  const src = request.nextUrl.searchParams.get("src");
  if (src) {
    const code = normalizeSrc(src);
    if (code) {
      response.cookies.set("tu_campaign", code, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90,
        path: "/",
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon).*)"],
};
