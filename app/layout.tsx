import './globals.css';
import { WeddingProvider } from '@/lib/store';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shaadi Sutra — Indian Wedding Planning Platform',
  description: 'Complete Indian wedding management suite: multi-event itinerary, guest RSVPs, budget splitting, vendor directory, shagun tracker, and accommodations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased bg-[#FAF8F5] text-slate-800">
        <WeddingProvider>{children}</WeddingProvider>
      </body>
    </html>
  );
}
