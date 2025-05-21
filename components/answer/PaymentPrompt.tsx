import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/lib/firebase';

const PaymentPrompt = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    
    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        title: 'Login Required',
        description: 'Please login with Google to continue with your upgrade.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email || '',
        },
        body: JSON.stringify({
          planId,
          userId: currentUser.uid,
          source: 'search_limit',
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout process. Please try again.',
        variant: 'destructive',
      });
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-6 my-4 bg-white dark:bg-[#282a2c] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold mb-2">Search Limit Reached</h3>
      <p className="mb-4">You've used all your free searches. Upgrade to continue searching without limits.</p>
      
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div className="p-4 border rounded-lg dark:border-gray-700">
          <h4 className="font-bold text-lg mb-2">Basic Plan</h4>
          <p className="text-2xl font-bold mb-2">€5.99<span className="text-sm font-normal">/month</span></p>
          <ul className="mb-4 space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              100 searches per month
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Standard response time
            </li>
          </ul>
          <Button 
            className="w-full" 
            onClick={() => handleUpgrade('basic')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Get Basic'}
          </Button>
        </div>
        
        <div className="p-4 border rounded-lg dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="absolute -mt-6 px-2 py-1 bg-blue-600 text-white text-xs rounded">RECOMMENDED</div>
          <h4 className="font-bold text-lg mb-2">Pro Plan</h4>
          <p className="text-2xl font-bold mb-2">€9.99<span className="text-sm font-normal">/month</span></p>
          <ul className="mb-4 space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Unlimited searches
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Priority response time
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              Access to all AI models
            </li>
          </ul>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={() => handleUpgrade('pro')}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Get Pro'}
          </Button>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <a href="/enterprise" className="text-blue-600 dark:text-blue-400 hover:underline">
          Need enterprise options? Contact us
        </a>
      </div>
    </div>
  );
};

export default PaymentPrompt;
