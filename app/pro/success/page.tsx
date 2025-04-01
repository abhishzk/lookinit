'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { CheckCircle } from '@phosphor-icons/react';
import { useToast } from '@/components/ui/use-toast';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? null;
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) return;

      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
          setVerified(true);
          toast({
            title: 'Subscription Activated',
            description: 'Your subscription has been successfully activated.',
          });
        } else {
          toast({
            title: 'Verification Failed',
            description: data.error || 'Failed to verify your subscription.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        toast({
          title: 'Verification Error',
          description: 'An error occurred while verifying your subscription.',
          variant: 'destructive',
        });
      } finally {
        setVerifying(false);
      }
    }

    verifySession();
  }, [sessionId, toast]);

  return (
    <div>
      <Header />
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-8 text-center">
          {verifying ? (
            <div>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold mb-2">Verifying your subscription...</h1>
              <p className="text-gray-600 dark:text-gray-400">Please wait while we confirm your payment.</p>
            </div>
          ) : verified ? (
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your subscription has been successfully activated. You now have unlimited searches!
              </p>
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/'}
                >
                  Start Searching
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/account'}
                >
                  View Account
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't verify your subscription. Please contact support if you believe this is an error.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
