import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PaymentPrompt = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: 'user-id', // You'll need to get the actual user ID
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
      <div className="flex space-x-4">
        <Button 
          className="bg-blue-600 hover:bg-blue-700" 
          onClick={() => handleUpgrade('pro')}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Upgrade to Pro'}
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/enterprise-inquiry'}
          disabled={isLoading}
        >
          Enterprise Options
        </Button>
      </div>
    </div>
  );
};

export default PaymentPrompt;
