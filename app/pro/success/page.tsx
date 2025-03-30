'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') ?? null;
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Success page reached');
    console.log('Session ID:', sessionId);

    // Verify the payment with Stripe
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // You'll need to create this API endpoint
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        // Payment verified successfully
        setPaymentVerified(true);
        
        // Here you would typically update the user's subscription status in your database
        // This will be implemented later when you add plan restrictions
        
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#282a2c] p-8 rounded-lg shadow-md">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg">Verifying your payment...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Verification Failed</h1>
            <p className="mb-6">{error}</p>
            <div className="flex flex-col space-y-4">
              <Link 
                href="/pro"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-center"
              >
                Try Again
              </Link>
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800 text-center"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="mb-6">
              Thank you for your subscription! Your account has been upgraded successfully.
              You now have access to all the premium features of Lookinit.
            </p>
            <div className="flex flex-col space-y-4">
              <Link 
                href="/"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-center"
              >
                Start Exploring
              </Link>
              <Link 
                href="/account"
                className="text-blue-600 hover:text-blue-800 text-center"
              >
                View My Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
