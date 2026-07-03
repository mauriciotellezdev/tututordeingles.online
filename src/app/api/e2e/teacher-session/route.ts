import { NextRequest, NextResponse } from "next/server";
import { isE2ELocalRequest } from "@/lib/e2e";

// E2E-only (local, non-prod): set the teacher_session cookie so tests can hit
// teacher-only pages without the OTP flow.
export async function POST(request: NextRequest) {
  if (!isE2ELocalRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("teacher_session", "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
