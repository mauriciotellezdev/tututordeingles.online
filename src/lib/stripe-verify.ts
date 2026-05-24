import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import { createPayment, applyPaymentStatus, PAYMENT_COLLECTION } from "@/lib/models/payment";
import { createCredit, CREDIT_COLLECTION } from "@/lib/models/credit";

export interface VerifyResult {
  success: boolean;
  creditsAdded: number;
  message: string;
  paymentIntentId: string;
}

/**
 * Process a confirmed Stripe payment: insert payment + credit records atomically.
 * Idempotent — safe to call multiple times for the same PaymentIntent.
 */
export async function processCompletedPayment(
  studentId: string,
  paymentIntentId: string,
  stripeCustomerId: string,
  planType: "single" | "package",
): Promise<VerifyResult> {
  const studentOid = new ObjectId(studentId);
  const creditsToAdd = planType === "single" ? 1 : 12;
  const amount = planType === "single" ? 30000 : 240000;

  const paymentsCol = await getCollection(PAYMENT_COLLECTION);
  const creditsCol = await getCollection(CREDIT_COLLECTION);

  const existingPayment = await paymentsCol.findOne({ stripePaymentIntentId: paymentIntentId });

  if (existingPayment) {
    const existingCredit = await creditsCol.findOne({ stripeChargeId: paymentIntentId });
    if (existingCredit) {
      return { success: true, creditsAdded: 0, message: "Pago ya procesado anteriormente.", paymentIntentId };
    }
    await creditsCol.insertOne(
      createCredit({
        studentId,
        amount: creditsToAdd,
        source: "purchase",
        description: planType === "single" ? "Compra 1 crédito" : "Paquete 12 créditos",
        stripeChargeId: paymentIntentId,
      })
    );
    return { success: true, creditsAdded: creditsToAdd, message: "Créditos añadidos (recuperado)", paymentIntentId };
  }

  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  await studentsCol.updateOne(
    { _id: studentOid, stripeCustomerId: { $exists: false } },
    { $set: { stripeCustomerId } }
  );

  await paymentsCol.insertOne({
    ...createPayment({
      studentId: studentOid,
      stripePaymentIntentId: paymentIntentId,
      stripeCustomerId,
      amount,
      currency: "mxn",
      description: planType === "single" ? "Compra 1 crédito" : "Paquete 12 créditos",
    }),
    ...applyPaymentStatus("succeeded"),
  });

  await creditsCol.insertOne(
    createCredit({
      studentId,
      amount: creditsToAdd,
      source: "purchase",
      description: planType === "single" ? "Compra 1 crédito" : "Paquete 12 créditos",
      stripeChargeId: paymentIntentId,
    })
  );

  return { success: true, creditsAdded: creditsToAdd, message: "Créditos añadidos", paymentIntentId };
}
