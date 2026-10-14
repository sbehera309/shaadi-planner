'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  WalletCards,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMore: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMore }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Events', href: '/dashboard/itinerary', icon: CalendarDays },
    { label: 'Guests', href: '/dashboard/guests', icon: Users },
    { label: 'Budget', href: '/dashboard/budget', icon: WalletCards },
  ];

  const isMoreActive =
    pathname === '/dashboard/vendors' ||
    pathname === '/dashboard/shagun' ||
    pathname === '/dashboard/horoscope' ||
    pathname === '/dashboard/logistics';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 lg:hidden px-2 pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-rose-700 font-bold'
                  : 'text-stone-500 hover:text-stone-900 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-rose-50 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-rose-700' : 'text-stone-500'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-rose-700 mt-0.5" />
              )}
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
            isMoreActive
              ? 'text-rose-700 font-bold'
              : 'text-stone-500 hover:text-stone-900 font-medium'
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-transform ${
              isMoreActive ? 'bg-rose-50 scale-105' : ''
            }`}
          >
            <Menu className={`w-5 h-5 ${isMoreActive ? 'text-rose-700' : 'text-stone-500'}`} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          {isMoreActive && (
            <span className="w-1 h-1 rounded-full bg-rose-700 mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
