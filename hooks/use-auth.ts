'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const response = await fetch('/api/stripe/get-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.uid }),
          });

          if (response.ok) {
            const data = await response.json();
            setHasSubscription(data.subscription?.status === 'active');
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      } else {
        setHasSubscription(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, hasSubscription, loading };
}