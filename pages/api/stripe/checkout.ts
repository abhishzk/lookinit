import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2025-02-24.acacia', // Update to a current API version
});

// Define your pricing plans
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { planId, userId } = req.body;
      
      if (!planId || !userId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      if (!PRICE_IDS[planId as keyof typeof PRICE_IDS]) {
        return res.status(400).json({ error: 'Invalid plan ID' });
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
        success_url: `${process.env.STRIPE_CUSTOMER_PORTAL_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.STRIPE_CUSTOMER_PORTAL_URL}/cancel`,
        metadata: {
          userId, // Pass user ID for tracking
        },
        customer_email: req.body.email, // Pre-fill customer email if available
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
