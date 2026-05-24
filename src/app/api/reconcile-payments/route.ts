import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCollection } from "@/lib/db";
import { PAYMENT_COLLECTION } from "@/lib/models/payment";
import { processCompletedPayment } from "@/lib/stripe-verify";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const studentId = searchParams.get("student_id");
  const hours = parseInt(searchParams.get("hours") || "24", 10);

  const adminKey = process.env.RECONCILE_ADMIN_KEY;
  const providedKey = searchParams.get("key");
  if (adminKey && providedKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const results: { sessionId: string; status: string; message: string }[] = [];

  try {
    if (sessionId) {
      // Reconcile a single session
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const meta = session.metadata;
      if (!meta?.studentId || !meta?.planType) {
        return NextResponse.json({ error: "Session missing metadata" }, { status: 400 });
      }
      if (session.payment_status !== "paid") {
        return NextResponse.json({ sessionId, status: session.payment_status, message: "not paid yet" });
      }
      const result = await processCompletedPayment(
        meta.studentId,
        session.payment_intent as string,
        session.customer as string,
        meta.planType as "single" | "package",
      );
      results.push({ sessionId, status: "processed", message: result.message });
    } else if (studentId) {
      // Reconcile all sessions for a specific student (via their Stripe customer ID)
      const paymentsCol = await getCollection(PAYMENT_COLLECTION);
      const stripe = new Stripe(stripeSecretKey);

      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        created: { gte: Math.floor(Date.now() / 1000) - hours * 3600 },
      });

      for (const session of sessions.data) {
        const meta = session.metadata;
        if (meta?.studentId !== studentId) continue;
        if (session.payment_status !== "paid") continue;

        const existing = await paymentsCol.findOne({
          stripePaymentIntentId: session.payment_intent as string,
        });
        if (existing) {
          results.push({ sessionId: session.id, status: "skipped", message: "already processed" });
          continue;
        }

        const result = await processCompletedPayment(
          meta.studentId,
          session.payment_intent as string,
          session.customer as string,
          meta.planType as "single" | "package",
        );
        results.push({ sessionId: session.id, status: "processed", message: result.message });
      }
    } else {
      // Scan recent sessions across all students
      const paymentsCol = await getCollection(PAYMENT_COLLECTION);

      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
        status: "complete",
        created: { gte: Math.floor(Date.now() / 1000) - hours * 3600 },
      });

      for (const session of sessions.data) {
        const meta = session.metadata;
        if (!meta?.studentId || !meta?.planType) {
          results.push({ sessionId: session.id, status: "skipped", message: "missing metadata" });
          continue;
        }
        if (session.payment_status !== "paid") continue;

        const existing = await paymentsCol.findOne({
          stripePaymentIntentId: session.payment_intent as string,
        });
        if (existing) {
          results.push({ sessionId: session.id, status: "skipped", message: "already processed" });
          continue;
        }

        try {
          const result = await processCompletedPayment(
            meta.studentId,
            session.payment_intent as string,
            session.customer as string,
            meta.planType as "single" | "package",
          );
          results.push({ sessionId: session.id, status: "fixed", message: result.message });
        } catch (err: any) {
          results.push({ sessionId: session.id, status: "error", message: err.message });
        }
      }
    }

    return NextResponse.json({
      total: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
