import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { updateUserSubscriptionStatus } from '@/lib/db';

// But then it doesn't use the validated apiKey variable
const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      // Update user subscription status in your database
      await handleSuccessfulSubscription(session);
      break;
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      // Update subscription status in your database
      await handleSubscriptionChange(subscription);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (userId) {
    // Update user subscription status in your database
    // Example: await db.user.update({ where: { id: userId }, data: { isPro: true } });
    console.log(`User ${userId} subscribed successfully`);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  // Handle subscription updates or cancellations
  const status = subscription.status;
  const customerId = subscription.customer as string;
  
  // Find user by customer ID and update their subscription status
  // Example: await db.user.updateMany({ where: { stripeCustomerId: customerId }, data: { isPro: status === 'active' } });
}
