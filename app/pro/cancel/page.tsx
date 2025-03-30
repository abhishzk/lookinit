'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CancelPage() {
  const router = useRouter();

  // Add a console log to check if this page is being reached
  useEffect(() => {
    console.log('Cancel page reached');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 ">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md bg-white dark:bg-[#282a2c]">
        <h1 className="text-2xl font-bold mb-4">Payment Cancelled</h1>
        <p className="mb-6">
          Your payment process was cancelled. If you have any questions or encountered any issues,
          please feel free to contact our support team.
        </p>
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
    </div>
  );
}
