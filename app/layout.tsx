import './globals.css';
import 'leaflet/dist/leaflet.css';
import { WeddingProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/authContext';
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
  title: 'Vivaah — Desi American Wedding Planner',
  description: 'Modern wedding planning platform tailored for Desi-American celebrations: multi-day ceremonies, venue sound curfews, outside catering, guest RSVPs, and budget tracking.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vivaah',
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
        <AuthProvider>
          <WeddingProvider>{children}</WeddingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
