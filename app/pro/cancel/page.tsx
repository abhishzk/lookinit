'use client';

import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { XCircle } from '@phosphor-icons/react';

export default function CancelPage() {
  return (
    <div>
      <Header />
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <XCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Subscription Cancelled</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your subscription process was cancelled. No charges were made.
          </p>
          <div className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/'}
            >
              Return to Home
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/pro'}
            >
              View Plans Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
