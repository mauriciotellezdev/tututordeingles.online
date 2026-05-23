import { ObjectId } from "mongodb";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type PaymentCurrency = "usd" | "mxn" | "eur";

export interface Payment {
  _id: ObjectId;
  studentId: ObjectId;
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  amount: number; // in cents
  currency: PaymentCurrency;
  status: PaymentStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  studentId: ObjectId;
  stripePaymentIntentId: string;
  stripeCustomerId: string;
  amount: number;
  currency: PaymentCurrency;
  description?: string;
}

export const PAYMENT_COLLECTION = "payments";

/**
 * Creates a new payment record with default timestamps and pending status.
 * Note: The top-level _id is managed by MongoDB, not by this function.
 */
export function createPayment(input: CreatePaymentInput): Omit<Payment, "_id"> {
  if (!input.stripePaymentIntentId || input.stripePaymentIntentId.trim() === "") {
    throw new Error("stripePaymentIntentId cannot be empty");
  }
  if (!input.stripeCustomerId || input.stripeCustomerId.trim() === "") {
    throw new Error("stripeCustomerId cannot be empty");
  }
  if (input.amount <= 0 || !Number.isInteger(input.amount)) {
    throw new Error("Amount must be a positive integer (in cents)");
  }

  const now = new Date();
  return {
    ...input,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Returns an update patch to apply when a Stripe webhook confirms a payment outcome.
 */
export function applyPaymentStatus(
  status: PaymentStatus
): Pick<Payment, "status" | "updatedAt"> {
  const allowed: PaymentStatus[] = ["pending", "succeeded", "failed", "refunded"];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid payment status: ${status}`);
  }
  return {
    status,
    updatedAt: new Date(),
  };
}