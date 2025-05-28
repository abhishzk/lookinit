import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG } from '@/lib/config';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(req: Request) {
  try {
    const { planId, userId, source } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Define price IDs for each plan using config
    const priceIds: Record<string, string> = {
      basic: CONFIG.stripe.basicPriceId,
      pro: CONFIG.stripe.proPriceId,
    };
    
    if (!priceIds[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Use config file for base URL
    const baseUrl = CONFIG.baseUrl;

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceIds[planId], // Use the price ID from config
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pro/cancel`,
      metadata: {
        userId,
        planId,
        source: source || 'website',
      },
      customer_email: req.headers.get('x-user-email') || undefined,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
