import { ObjectId } from "mongodb";

export interface Credit {
  _id: ObjectId;
  studentId: ObjectId;
  amount: number;
  source: "purchase" | "bonus" | "adjustment" | "debit" | "referral";
  description?: string;
  createdAt: Date;
  stripeChargeId?: string;
}

export interface CreditPurchaseInput {
  studentId: string;
  amount: number;
  source: "purchase" | "bonus" | "adjustment" | "debit" | "referral";
  description?: string;
  stripeChargeId?: string;
}

export const CREDIT_COLLECTION = "credits";

export function createCredit(input: CreditPurchaseInput): Omit<Credit, "_id"> {
  // Omit optional fields when empty — the strict $jsonSchema validator rejects
  // `null` for description/stripeChargeId (must be a non-empty string or
  // absent), and the driver serializes `undefined` as `null`.
  const doc: Omit<Credit, "_id"> = {
    studentId: new ObjectId(input.studentId),
    amount: input.amount,
    source: input.source,
    createdAt: new Date(),
  };
  if (input.description) doc.description = input.description;
  if (input.stripeChargeId) doc.stripeChargeId = input.stripeChargeId;
  return doc;
}
