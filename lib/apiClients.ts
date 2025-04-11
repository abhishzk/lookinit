import { Stripe } from 'stripe';
import OpenAI from 'openai';
import { getSecret } from './secretManager';

// Initialize Stripe with Secret Manager
export async function getStripeClient() {
  try {
    const stripeApiKey = await getSecret('stripe-api-key');
    return new Stripe(stripeApiKey, {
      apiVersion: '2025-02-24.acacia',
    });
  } catch (error) {
    // Fallback to environment variable
    if (process.env.STRIPE_API_KEY) {
      return new Stripe(process.env.STRIPE_API_KEY, {
        apiVersion: '2025-02-24.acacia',
      });
    }
    throw error;
  }
}

// Initialize OpenAI with Secret Manager
export async function getOpenAIClient() {
  try {
    const openaiApiKey = await getSecret('openai-api-key');
    return new OpenAI({ apiKey: openaiApiKey });
  } catch (error) {
    // Fallback to environment variable
    if (process.env.OPENAI_API_KEY) {
      return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    throw error;
  }
}
