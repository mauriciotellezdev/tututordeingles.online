import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import { createPayment, PAYMENT_COLLECTION } from "@/lib/models/payment";
import { ObjectId } from "mongodb";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-01-27.accredited-gratis" as any
    });

    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // Parse body directly if webhook secret is not set (useful for local development testing)
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata && metadata.studentId && metadata.planType) {
      const { studentId, planType } = metadata;
      
      try {
        const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
        const paymentsCol = await getCollection(PAYMENT_COLLECTION);
        const studentOid = new ObjectId(studentId);

        const creditsToAdd = planType === "single" ? 1 : 12;

        // 1. Update student credits
        const updateResult = await studentsCol.updateOne(
          { _id: studentOid },
          {
            $inc: { credits: creditsToAdd },
            $set: { 
              stripeCustomerId: (session.customer as string) || undefined,
              updatedAt: new Date() 
            }
          }
        );

        if (updateResult.matchedCount === 0) {
          console.error(`Student with ID ${studentId} not found in Stripe checkout webhook handler.`);
          return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }

        // 2. Store payment record
        const paymentInput = {
          studentId: studentOid,
          stripePaymentIntentId: (session.payment_intent as string) || session.id,
          stripeCustomerId: (session.customer as string) || "mock_customer_id",
          amount: session.amount_total || (planType === "single" ? 30000 : 240000),
          currency: ((session.currency || "mxn").toLowerCase()) as any,
          description: planType === "single" ? "1 Clase Individual (Compra)" : "Paquete 10 Clases + 2 Gratis (Compra)"
        };

        const paymentData = createPayment(paymentInput);
        paymentData.status = "succeeded"; // Mark succeeded

        await paymentsCol.insertOne(paymentData);
        console.log(`Successfully processed checkout webhook: added ${creditsToAdd} credits to student ${studentId}.`);
      } catch (dbError: any) {
        console.error("Database error processing checkout event:", dbError);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
