import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import {
  processCompletedPayment,
  reverseRefundedPayment,
} from "@/lib/stripe-verify";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") || "";

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = new Stripe(stripeSecretKey);
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback for local dev without webhook secret — parse raw body
      event = JSON.parse(body);
    }
  } catch (err: Error | unknown) {
    console.error(
      "Stripe webhook signature verification failed:",
      (err as Error).message
    );
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  // Refund → claw back the granted credits so a refunded student can't keep
  // paid classes. Idempotent + ledger-based.
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : (charge.payment_intent?.id ?? null);
    if (paymentIntentId) {
      try {
        const result = await reverseRefundedPayment(paymentIntentId);
        console.log(
          `Webhook: refund for PI ${paymentIntentId} — reversed ${result.creditsReversed} credits`
        );
      } catch (err: Error | unknown) {
        console.error(
          "Webhook: error reversing refund:",
          (err as Error).message
        );
        return NextResponse.json(
          { error: (err as Error).message },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({ received: true, refunded: true });
  }

  // OXXO voucher expired unpaid / SPEI transfer never arrived — log it so a
  // "customer says they paid" dispute is traceable, and note it for follow-up.
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.warn(
      `Webhook: async payment FAILED for session ${session.id} (student ${session.metadata?.studentId ?? "unknown"}, plan ${session.metadata?.planType ?? "unknown"})`
    );
    return NextResponse.json({ received: true, status: "async_failed" });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata?.studentId || !metadata?.planType) {
      console.warn(
        "Webhook: missing studentId or planType in session metadata",
        session.id
      );
      return NextResponse.json({ received: true, skipped: "missing metadata" });
    }

    const studentId = metadata.studentId;
    const planType = metadata.planType as "single" | "package";
    const paymentIntentId = session.payment_intent as string;
    const stripeCustomerId = session.customer as string;

    if (session.payment_status !== "paid") {
      console.log(
        `Webhook: session ${session.id} not paid yet (${session.payment_status})`
      );
      return NextResponse.json({
        received: true,
        status: session.payment_status,
      });
    }

    try {
      const result = await processCompletedPayment(
        studentId,
        paymentIntentId,
        stripeCustomerId,
        planType
      );
      console.log(
        `Webhook: ${result.message} for session ${session.id} (${result.paymentIntentId})`
      );
    } catch (err: Error | unknown) {
      console.error(
        "Webhook: error processing payment:",
        (err as Error).message
      );
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
