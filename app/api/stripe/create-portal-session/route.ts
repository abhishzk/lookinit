import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG } from '@/lib/config';


const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Get the customer ID from your database
    const customerId = await getCustomerIdFromUserId(userId);
    
    if (!customerId) {
      return NextResponse.json({ error: 'No subscription found for this user' }, { status: 404 });
    }

    // Create a Stripe customer portal session
    const baseUrl = CONFIG.baseUrl;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/account`,
    });

    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error('Error creating portal session:', error);
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
