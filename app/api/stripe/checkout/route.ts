import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Correct way to initialize Stripe with proper validation
const apiKey = process.env.STRIPE_API_KEY;
if (!apiKey) {
  throw new Error('STRIPE_API_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: '2025-02-24.acacia',
  });
  

export async function POST(request: Request) {
  try {
    const { planId, userId, email } = await request.json();
    
    if (!planId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    
    // Updated to use BASIC instead of PREMIUM
    const PRICE_IDS = {
      pro: process.env.STRIPE_PRO_PRICE_ID,
      basic: process.env.STRIPE_BASIC_PRICE_ID,
    };
    
    if (!PRICE_IDS[planId as keyof typeof PRICE_IDS]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: PRICE_IDS[planId as keyof typeof PRICE_IDS],
          quantity: 1,
        },
      ],
      // Use NEXT_PUBLIC_BASE_URL instead of STRIPE_CUSTOMER_PORTAL_URL
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pro/cancel`,
      metadata: {
        userId, // Pass user ID for tracking
        planId, // Store which plan was selected
      },
      customer_email: email, // Pre-fill customer email if available
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
