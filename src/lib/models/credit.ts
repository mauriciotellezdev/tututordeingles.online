import { ObjectId } from "mongodb";

export interface Credit {
  _id: ObjectId;
  studentId: ObjectId;
  amount: number;
  source: "purchase" | "bonus" | "adjustment" | "debit";
  description?: string;
  createdAt: Date;
  stripeChargeId?: string;
}

export interface CreditPurchaseInput {
  studentId: string;
  amount: number;
  source: "purchase" | "bonus" | "adjustment" | "debit";
  description?: string;
  stripeChargeId?: string;
}

export const CREDIT_COLLECTION = "credits";

export function createCredit(input: CreditPurchaseInput): Omit<Credit, "_id"> {
  return {
    studentId: new ObjectId(input.studentId),
    amount: input.amount,
    source: input.source,
    description: input.description,
    createdAt: new Date(),
    stripeChargeId: input.stripeChargeId
  };
}