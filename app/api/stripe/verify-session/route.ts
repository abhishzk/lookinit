import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrUpdateUserSubscription } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ 
        error: 'Payment not completed', 
        status: session.payment_status 
      }, { status: 400 });
    }

    // Get the customer ID and subscription ID
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    // Get user ID and plan ID from metadata
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session metadata' }, { status: 400 });
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Store subscription data in your database
    await createOrUpdateUserSubscription({
      userId,
      customerId,
      subscriptionId,
      status: subscription.status,
      planId: planId || 'basic',
      currentPeriodEnd: subscription.current_period_end,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return NextResponse.json({
      success: true,
      customerId,
      subscriptionId,
      userId,
      planType: planId || 'unknown'
    });
    
  } catch (error) {
    console.error('Error verifying Stripe session:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
