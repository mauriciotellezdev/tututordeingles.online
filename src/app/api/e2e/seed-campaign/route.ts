import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { isE2ELocalRequest } from "@/lib/e2e";
import {
  CAMPAIGN_COLLECTION,
  createCampaign,
  normalizeCampaignCode,
  type Campaign,
} from "@/lib/models/campaign";
import { ensureCampaignIndexes } from "@/lib/campaigns";

// E2E-only (local, non-prod): create/replace a QR campaign so attribution +
// redirect flows can be tested against a real active code.
export async function POST(request: NextRequest) {
  if (!isE2ELocalRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    target?: string;
    label?: string;
  };
  if (!body.code) {
    return NextResponse.json(
      { success: false, error: "Missing code" },
      { status: 400 }
    );
  }

  await ensureCampaignIndexes();
  const col = await getCollection<Campaign>(CAMPAIGN_COLLECTION);
  const code = normalizeCampaignCode(body.code);
  await col.deleteOne({ code });
  const doc = createCampaign({
    code,
    label: body.label ?? code,
    target: body.target,
  });
  await col.insertOne(doc as Campaign);

  return NextResponse.json({ success: true, code });
}
