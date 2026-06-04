import { MongoServerError, ObjectId } from "mongodb";
import Stripe from "stripe";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import { createPayment, applyPaymentStatus, PAYMENT_COLLECTION } from "@/lib/models/payment";
import { createCredit, CREDIT_COLLECTION } from "@/lib/models/credit";
import { awardReferralRewardForPayment } from "@/lib/referrals";

export interface VerifyResult {
  success: boolean;
  creditsAdded: number;
  message: string;
  paymentIntentId: string;
}

export function resolveCheckoutSessionPaymentContext(
  session: Stripe.Checkout.Session,
  expectedStudentId: string,
  expectedPlanType: "single" | "package",
) {
  const metadataStudentId = session.metadata?.studentId;
  const metadataPlanType = session.metadata?.planType as "single" | "package" | undefined;

  if (!metadataStudentId || !metadataPlanType) {
    return { ok: false as const, error: "La sesión de Stripe no incluye metadatos válidos." };
  }

  if (metadataStudentId !== expectedStudentId || metadataPlanType !== expectedPlanType) {
    return { ok: false as const, error: "La sesión de Stripe no coincide con los datos solicitados." };
  }

  return {
    ok: true as const,
    studentId: metadataStudentId,
    planType: metadataPlanType,
  };
}

/**
 * Process a confirmed Stripe payment: insert payment + credit records atomically.
 * Idempotent — safe to call multiple times for the same PaymentIntent.
 */
let ensurePaymentIndexesPromise: Promise<void> | null = null;

async function ensurePaymentIndexes() {
  if (!ensurePaymentIndexesPromise) {
    ensurePaymentIndexesPromise = (async () => {
      const paymentsCol = await getCollection(PAYMENT_COLLECTION);
      await paymentsCol.createIndex(
        { stripePaymentIntentId: 1 },
        { unique: true, sparse: true, name: "payment_stripePaymentIntentId_unique" }
      );
    })().catch((error) => {
      ensurePaymentIndexesPromise = null;
      throw error;
    });
  }

  return ensurePaymentIndexesPromise;
}

export async function processCompletedPayment(
  studentId: string,
  paymentIntentId: string,
  stripeCustomerId: string,
  planType: "single" | "package",
): Promise<VerifyResult> {
  await ensurePaymentIndexes();
  const studentOid = new ObjectId(studentId);
  const creditsToAdd = planType === "single" ? 1 : 10;
  const amount = planType === "single" ? 30000 : 240000;

  const paymentsCol = await getCollection(PAYMENT_COLLECTION);
  const creditsCol = await getCollection(CREDIT_COLLECTION);

  const existingPayment = await paymentsCol.findOne({ stripePaymentIntentId: paymentIntentId });
  const purchaseCreditPayload = {
    studentId,
    amount: creditsToAdd,
    source: "purchase" as const,
    description: planType === "single" ? "Compra 1 crédito" : "Paquete 10 clases (8 pagadas + 2 gratis)",
    stripeChargeId: paymentIntentId,
  };

  if (existingPayment) {
    const existingCredit = await creditsCol.findOne({ stripeChargeId: paymentIntentId });
    if (existingCredit) {
      await awardReferralRewardForPayment({
        referredStudentId: studentId,
        paymentIntentId,
        paymentAmount: amount,
      });
      return { success: true, creditsAdded: 0, message: "Pago ya procesado anteriormente.", paymentIntentId };
    }
    try {
      await creditsCol.insertOne(createCredit(purchaseCreditPayload));
    } catch (error) {
      if (!(error instanceof MongoServerError && error.code === 11000)) {
        throw error;
      }
    }
    await awardReferralRewardForPayment({
      referredStudentId: studentId,
      paymentIntentId,
      paymentAmount: amount,
    });
    return { success: true, creditsAdded: creditsToAdd, message: "Créditos añadidos (recuperado)", paymentIntentId };
  }

  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  await studentsCol.updateOne(
    { _id: studentOid, stripeCustomerId: { $exists: false } },
    { $set: { stripeCustomerId } }
  );

  try {
    await paymentsCol.insertOne({
      ...createPayment({
        studentId: studentOid,
        stripePaymentIntentId: paymentIntentId,
        stripeCustomerId,
        amount,
        currency: "mxn",
        description: planType === "single" ? "Compra 1 crédito" : "Paquete 10 clases (8 pagadas + 2 gratis)",
      }),
      ...applyPaymentStatus("succeeded"),
    });
  } catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000)) {
      throw error;
    }
  }

  try {
    await creditsCol.insertOne(createCredit(purchaseCreditPayload));
  } catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000)) {
      throw error;
    }
  }

  await awardReferralRewardForPayment({
    referredStudentId: studentId,
    paymentIntentId,
    paymentAmount: amount,
  });

  return { success: true, creditsAdded: creditsToAdd, message: "Créditos añadidos", paymentIntentId };
}
