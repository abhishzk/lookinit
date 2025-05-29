'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/Admin/Sidebar';
import { AdminHeader } from '@/components/Admin/Header';
import { MobileSidebar } from '@/components/Admin/MobileSidebar';
import { ThemeProvider } from 'next-themes';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('isAuthenticated'); // Check for token in localStorage
    if (!token) {
      router.push('/login'); // Redirect to login if no token is found
    } else {
      setIsAuthenticated(true); // Set authentication state
    }
  }, [router]);

  if (!isAuthenticated) {
    return null; // Render nothing until authentication is verified
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <head>
        <link rel="canonical" href="https://www.speeir.com/admin" />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Admin Dashboard",
            "url": "https://www.speeir.com/admin",
            "description": "Admin dashboard for managing Speeir content and analytics."
          })}
        </script>
      </head>
      <div className="relative flex h-screen bg-gray-50 dark:bg-gray-900">
        <AdminSidebar />
        <MobileSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminHeader />
          
          <main className="relative flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800 transition-colors">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}