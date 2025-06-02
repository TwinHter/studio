import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
// import Footer from '@/components/layout/Footer'; // Removed Footer import
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'London Dwellings AI',
  description: 'AI-powered London house price prediction and insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        {/* <Footer /> Removed Footer component */}
        <Toaster />
      </body>
    </html>
  );
}
