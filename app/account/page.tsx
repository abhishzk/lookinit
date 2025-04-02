'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { resetSearchCount } from '@/lib/search-counter';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch subscription data from your API
          const response = await fetch('/api/stripe/get-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.uid }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setSubscription(data.subscription);
            
            // If user has an active subscription, reset their search count
            if (data.subscription?.status === 'active') {
              resetSearchCount(currentUser.uid);
            }
          }
        } catch (error) {
          console.error('Error fetching subscription:', error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.uid }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create portal session');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open subscription management portal',
        variant: 'destructive',
      });
      console.error('Error creating portal session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="container mx-auto py-10 text-center">
          <p>Loading account information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <div className="container mx-auto py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Account</h1>
          <p className="mb-4">Please sign in to view your account details.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Account</h1>
        
        <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <div className="flex items-center mb-4">
            <img 
              src={user.photoURL || "/default-avatar.png"} 
              alt="Profile" 
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <p className="font-medium">{user.displayName}</p>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          
          {subscription ? (
            <div>
              <div className="mb-4">
                <p className="font-medium">Plan: <span className="capitalize">{subscription.plan || 'Basic'}</span></p>
                <p className="font-medium">Status: <span className="capitalize">{subscription.status || 'Unknown'}</span></p>
                {subscription.currentPeriodEnd && (
                  <p className="font-medium">
                    Next billing date: {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <Button onClick={handleManageSubscription} disabled={loading}>
                {loading ? 'Loading...' : 'Manage Subscription'}
              </Button>
            </div>
          ) : (
            <div>
              <p className="mb-4">You don't have an active subscription.</p>
              <Button 
                onClick={() => window.location.href = '/pro'} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
