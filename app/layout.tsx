import './globals.css';
import { WeddingProvider } from '@/lib/store';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#881337',
};

export const metadata: Metadata = {
  title: 'ShaadiSutra — Indian Wedding Planning Platform',
  description: 'Complete Indian wedding management suite: multi-event itinerary, guest RSVPs, budget splitting, vendor directory, shagun tracker, and accommodations.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShaadiSutra',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[#FAF8F5] text-slate-800 selection:bg-rose-100 selection:text-rose-900">
        <WeddingProvider>{children}</WeddingProvider>
      </body>
    </html>
  );
}
