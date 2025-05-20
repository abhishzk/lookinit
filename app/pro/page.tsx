'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle } from '@phosphor-icons/react';

export default function ProPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
                    // Fetch subscription data
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
                    }
                  } catch (error) {
                    console.error('Error fetching subscription:', error);
                  }
                }
              });
          
              return () => unsubscribe();
            }, []);
          
            const handleSubscribe = async (planId: string) => {
              if (!user) {
                toast({
                  title: 'Login Required',
                  description: 'Please login with Google to subscribe.',
                  variant: 'destructive',
                });
                return;
              }
          
              setIsLoading(true);
              try {
                const response = await fetch('/api/create-checkout-session', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': user.email || '',
                  },
                  body: JSON.stringify({
                    planId,
                    userId: user.uid,
                    source: 'pro_page',
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
          
            const handleManageSubscription = async () => {
              setIsLoading(true);
              try {
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
                setIsLoading(false);
              }
            };
          
            return (
              <div>
                <div className="container mx-auto py-10 px-4">
                  <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Upgrade Your Lookinit Experience</h1>
                    <p className="text-lg max-w-2xl mx-auto">
                      Get unlimited searches and access to premium features with our subscription plans.
                    </p>
                  </div>
          
                  {subscription?.status === 'active' ? (
                    <div className="max-w-md mx-auto bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                          <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold">You're Subscribed!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          You're currently on the <span className="font-medium capitalize">{subscription.plan}</span> plan.
                        </p>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <p className="mb-4">
                          Your subscription renews on {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}.
                        </p>
                        <Button 
                          onClick={handleManageSubscription}
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Loading...' : 'Manage Subscription'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                      {/* Free Plan */}
                      <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                          <h2 className="text-2xl font-bold mb-2">Free</h2>
                          <p className="text-3xl font-bold mb-6">$0<span className="text-lg font-normal">/month</span></p>
                          <ul className="space-y-3 mb-6">
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>3 searches per day</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Basic search results</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Standard response time</span>
                            </li>
                          </ul>
                          <Button variant="outline" className="w-full" disabled>
                            Current Plan
                          </Button>
                        </div>
                      </div>
          
                      {/* Basic Plan */}
                      <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                          <h2 className="text-2xl font-bold mb-2">Basic</h2>
                          <p className="text-3xl font-bold mb-6">€5.99<span className="text-lg font-normal">/month</span></p>
                          <ul className="space-y-3 mb-6">
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>100 searches per month</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Enhanced search results</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Standard response time</span>
                            </li>
                          </ul>
                          <Button 
                            className="w-full" 
                            onClick={() => handleSubscribe('basic')}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Processing...' : 'Subscribe'}
                          </Button>
                        </div>
                      </div>
          
                      {/* Pro Plan */}
                      <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg overflow-hidden border-2 border-blue-500 dark:border-blue-400 relative">
                        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-bold">
                          POPULAR
                        </div>
                        <div className="p-6">
                          <h2 className="text-2xl font-bold mb-2">Pro</h2>
                          <p className="text-3xl font-bold mb-6">€9.99<span className="text-lg font-normal">/month</span></p>
                          <ul className="space-y-3 mb-6">
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Unlimited searches</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Premium search results</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Priority response time</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              <span>Access to all AI models</span>
                            </li>
                            <li className="flex items-start">
                    <svg className="w-5 h-5 mr-2 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>Early access to new features</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={() => handleSubscribe('pro')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Subscribe'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">How does the search limit work?</h3>
              <p>Free users are limited to 3 searches per day. Once you reach this limit, you'll need to upgrade to a paid plan to continue searching.</p>
            </div>
            <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p>Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period.</p>
            </div>
            <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p>We accept all major credit cards through our secure payment processor, Stripe.</p>
            </div>
            <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Do you offer enterprise plans?</h3>
              <p>Yes, we offer custom enterprise plans for organizations with specific needs. Please <a href="/enterprise-inquiry" className="text-blue-600 dark:text-blue-400 hover:underline">contact us</a> for more information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

