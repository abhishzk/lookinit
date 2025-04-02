import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserSubscriptionStatus } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.log(`⚠️ Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        
        // Get the user ID from metadata (stored when subscription was created)
        const userId = await getUserIdFromSubscription(subscription);
        
        if (userId) {
          await updateUserSubscriptionStatus(
            userId, 
            subscription.status,
            subscription.current_period_end
          );
        }
        break;
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        
        // Get the user ID from metadata
        const deletedUserId = await getUserIdFromSubscription(deletedSubscription);
        
        if (deletedUserId) {
          await updateUserSubscriptionStatus(deletedUserId, 'canceled');
        }
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Helper function to get userId from subscription
async function getUserIdFromSubscription(subscription: Stripe.Subscription): Promise<string | null> {
  try {
    // First check if metadata exists on the subscription
    if (subscription.metadata?.userId) {
      return subscription.metadata.userId;
    }
    
    // If not, try to get it from the checkout session that created this subscription
    const sessions = await stripe.checkout.sessions.list({
      subscription: subscription.id,
      expand: ['data.metadata'],
    });
    
    if (sessions.data.length > 0 && sessions.data[0].metadata?.userId) {
      return sessions.data[0].metadata.userId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting userId from subscription:', error);
    return null;
  }
}
