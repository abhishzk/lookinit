import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { planId, userId } = req.body;

      // Create a Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: planId === 'pro' ? 'price_12345' : 'price_67890', // Replace with your Stripe price IDs
            quantity: 1,
          },
        ],
        success_url: `${process.env.STRIPE_CUSTOMER_PORTAL_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.STRIPE_CUSTOMER_PORTAL_URL}/pro/cancel`,
        metadata: {
          userId, // Pass user ID for tracking
        },
      });

      res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}