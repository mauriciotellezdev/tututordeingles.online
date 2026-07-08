"use server";

import { cookies } from "next/headers";
import { getCollection } from "@/lib/db";
import { ensureCampaignIndexes } from "@/lib/campaigns";
import { createLead, LEAD_COLLECTION, type Lead } from "@/lib/models/lead";

const CAMPAIGN_COOKIE = "tu_campaign";

export interface RegisterLeadInput {
  name: string;
  phone: string;
  level?: string;
  slot?: string;
  age?: string;
  goal?: string;
}

export async function registerLeadAction(input: RegisterLeadInput) {
  const name = (input.name || "").trim();
  const phone = (input.phone || "").trim();

  if (name.length < 2) {
    return { success: false as const, error: "Escribe tu nombre." };
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) {
    return {
      success: false as const,
      error: "Escribe un número de teléfono válido.",
    };
  }

  try {
    const cookieStore = await cookies();
    const campaignCode = cookieStore.get(CAMPAIGN_COOKIE)?.value;

    const ageNum = input.age ? parseInt(input.age, 10) : undefined;

    const doc = createLead({
      name,
      phone,
      level: input.level,
      slot: input.slot,
      age: Number.isFinite(ageNum) ? ageNum : undefined,
      goal: input.goal,
      campaignCode,
    });

    await ensureCampaignIndexes();
    const col = await getCollection<Lead>(LEAD_COLLECTION);
    await col.insertOne(doc as Lead);

    return { success: true as const };
  } catch (error) {
    console.error("registerLeadAction:", error);
    return {
      success: false as const,
      error: "No pudimos guardar tu registro. Intenta de nuevo.",
    };
  }
}
