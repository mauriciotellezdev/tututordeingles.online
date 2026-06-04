import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { processCompletedPayment } from '@/lib/stripe-verify';

export async function POST(request: Request) {
  try {
    const { sessionId, studentId, planType } = await request.json();
    if (!sessionId || !studentId || !planType) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.payment_status !== 'paid') {
      // Not yet paid
      return NextResponse.json({ status: 'pending', message: 'Payment not completed yet.' }, { status: 200 });
    }

    const result = await processCompletedPayment(
      studentId,
      session.payment_intent as string,
      session.customer as string,
      planType as "single" | "package"
    );

    return NextResponse.json(
      { status: 'success', message: result.message, creditsAdded: result.creditsAdded },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error in verify-payment API:', error);
    return NextResponse.json({ error: (error instanceof Error ? error.message : 'Server error') }, { status: 500 });
  }
}
