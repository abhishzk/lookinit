import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Here you would typically query your database to get the customer ID for this user
    // For this example, I'm assuming you store this mapping somewhere
    // Replace this with your actual database query
    const customerId = await getCustomerIdFromUserId(userId);
    
    if (!customerId) {
      return NextResponse.json({ subscription: null });
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // Get the most recent subscription
    const subscription = subscriptions.data[0];
    
    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Get the product details to determine the plan name
    const product = await stripe.products.retrieve(
      subscription.items.data[0].price.product as string
    );

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: product.name,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    });
    
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}

// This is a placeholder function - replace with your actual database query
async function getCustomerIdFromUserId(userId: string): Promise<string | null> {
  // Query your database to get the Stripe customer ID for this user
  // Return null if no customer ID is found
  return null; // Replace with actual implementation
}
