import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getCollection } from '@/lib/db';
import { createCredit, CREDIT_COLLECTION } from '@/lib/models/credit';
import { ObjectId } from 'mongodb';

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
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-01-27.accredited-gratis' as any });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.payment_status !== 'paid') {
      // Not yet paid
      return NextResponse.json({ status: 'pending', message: 'Payment not completed yet.' }, { status: 200 });
    }

    // Determine credits to add
    const creditsToAdd = planType === 'single' ? 1 : 12;

    const creditsCol = await getCollection(CREDIT_COLLECTION);
    await creditsCol.insertOne(
      createCredit({
        studentId,
        amount: creditsToAdd,
        source: 'purchase',
        description: planType === 'single' ? 'Compra 1 crédito' : 'Paquete 12 créditos',
        stripeChargeId: session.payment_intent as unknown as string
      })
    );

    return NextResponse.json({ status: 'success', message: 'Créditos añadidos', creditsAdded: creditsToAdd }, { status: 200 });
  } catch (error: any) {
    console.error('Error in verify-payment API:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
