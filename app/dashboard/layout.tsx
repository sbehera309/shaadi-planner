'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CollaboratorBanner } from '@/components/CollaboratorBanner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] overflow-x-clip w-full">
      {/* Persistent Left Sidebar on Desktop & Slide Drawer on Mobile */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8">
          <CollaboratorBanner />
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMore={() => setIsMobileMenuOpen(true)} />
    </div>
  );
}
