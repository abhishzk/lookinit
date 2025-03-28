'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ProPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    
    try {
      // Call your API to create a Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: 'user123', // Replace with actual user ID from auth
        }),
      });
      
      const { sessionId, url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        // Fallback to client-side redirect
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId });
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-12 dark:text-white">Upgrade to Lookinit Pro</h1>
      
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Basic Plan */}
        <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Basic</h2>
          <p className="text-3xl font-bold mb-6 dark:text-white">$9<span className="text-lg font-normal">/month</span></p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100 searches per day
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Standard response time
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Basic AI models
            </li>
          </ul>
          <Button 
            className="w-full" 
            onClick={() => handleSubscribe('basic')}
            disabled={isLoading}
          >
            {isLoading && selectedPlan === 'basic' ? 'Processing...' : 'Subscribe'}
          </Button>
        </div>
        
        {/* Pro Plan */}
        <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-8 border-2 border-blue-500 dark:border-blue-400 relative">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
            POPULAR
          </div>
          <h2 className="text-xl font-bold mb-4 dark:text-white">Pro</h2>
          <p className="text-3xl font-bold mb-6 dark:text-white">$19<span className="text-lg font-normal">/month</span></p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Unlimited searches
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Priority response time
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Access to all AI models
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Advanced analytics
            </li>
          </ul>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={() => handleSubscribe('pro')}
            disabled={isLoading}
          >
            {isLoading && selectedPlan === 'pro' ? 'Processing...' : 'Subscribe'}
          </Button>
        </div>
        
        {/* Enterprise Plan */}
        <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Enterprise</h2>
          <p className="text-3xl font-bold mb-6 dark:text-white">$49<span className="text-lg font-normal">/month</span></p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Unlimited everything
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Dedicated support
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Custom AI model training
            </li>
            <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              API access
            </li>
          </ul>
          <Button 
            className="w-full" 
            onClick={() => handleSubscribe('enterprise')}
            disabled={isLoading}
          >
            {isLoading && selectedPlan === 'enterprise' ? 'Processing...' : 'Subscribe'}
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-[#1e2022] rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">Can I cancel my subscription anytime?</h3>
            <p className="dark:text-gray-300">Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">How do the search limits work?</h3>
            <p className="dark:text-gray-300">Search limits reset at midnight UTC. Unused searches do not roll over to the next day.</p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2 dark:text-white">Do you offer refunds?</h3>
            <p className="dark:text-gray-300">We offer a 7-day money-back guarantee if you're not satisfied with our service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
