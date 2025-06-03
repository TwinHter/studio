
"use client"; // Required for QueryClientProvider at the root

import type { Metadata } from 'next'; // Keep this for static metadata
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/lib/query-client'; // Import the shared client

// Static metadata can still be exported if QueryClientProvider is handled correctly
// export const metadata: Metadata = { // This might need to be moved or handled differently if it causes issues with "use client"
//   title: 'London Housing - AI Price Prediction & Insights',
//   description: 'AI-powered London house price prediction and property insights.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Static metadata can be defined directly in head if needed, or use the new Metadata API for client components */}
        <title>London Housing - AI Price Prediction & Insights</title>
        <meta name="description" content="AI-powered London house price prediction and property insights." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
