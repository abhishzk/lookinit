import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/toaster';
import Footer from '@/components/Footer';
import './globals.css';

import { AI } from './action';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

const meta = {
  title: 'Results, simple and smart.',
  description: 'AI Answer Engine',
};

export const metadata: Metadata = {
  ...meta,
  title: {
    default: 'Lookinit',
    template: `%s - Lookinit`,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  twitter: {
    ...meta,
    card: 'summary_large_image',
    site: '@vercel',
  },
  openGraph: {
    ...meta,
    locale: 'en-US',
    type: 'website',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <body
        className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Toaster />
        <AuthProvider>
          <AI>
            <ThemeProvider>
              <Providers
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex flex-col flex-1 bg-muted/50 dark:bg-background px-4 pb-16">
                    {children}
                  </main>
                </div>
                <Footer />
              </Providers>
            </ThemeProvider>
          </AI>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
export const runtime = 'edge';
