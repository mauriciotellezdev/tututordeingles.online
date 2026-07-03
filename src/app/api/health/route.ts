import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Uptime/health probe for Cloudflare origin checks and monitoring. Pings the DB
// so a broken database surfaces as 503 rather than a false-healthy 200.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
