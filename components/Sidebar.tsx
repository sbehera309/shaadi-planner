'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  WalletCards,
  Briefcase,
  Gift,
  Hotel,
  ExternalLink,
  Sparkles,
  HeartHandshake,
  X,
} from 'lucide-react';
import { useWedding } from '@/lib/store';
import { EditWeddingModal } from './EditWeddingModal';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const { wedding } = useWedding();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Itinerary & Timings', href: '/dashboard/itinerary', icon: CalendarDays },
    { label: 'Guests & RSVPs', href: '/dashboard/guests', icon: Users },
    { label: 'Budget & Splits', href: '/dashboard/budget', icon: WalletCards },
    { label: 'Vendor Directory', href: '/dashboard/vendors', icon: Briefcase },
    { label: 'Gifts', href: '/dashboard/shagun', icon: Gift },
    { label: 'Rooms & Logistics', href: '/dashboard/logistics', icon: Hotel },
  ];

  const renderContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
        <Link
          href="/"
          onClick={() => isMobile && onMobileClose?.()}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-amber-100 tracking-wide font-serif">Vivaah</h1>
            <p className="text-[11px] text-stone-400">Desi American Wedding Planner</p>
          </div>
        </Link>
        {isMobile && (
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Couple Card */}
      {wedding && wedding.isConfigured && wedding.brideName ? (
        <div className="px-4 py-3.5 mx-3 my-3 rounded-xl bg-stone-800/60 border border-stone-700/50">
          <div className="flex items-center justify-between text-xs font-medium text-amber-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Active Wedding</span>
            </span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[10px] text-stone-400 hover:text-amber-300 underline"
            >
              Edit
            </button>
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {wedding.brideName} & {wedding.groomName}
          </p>
          {wedding.city && <p className="text-xs text-stone-400 truncate">{wedding.city}</p>}
          {wedding.hashtag && (
            <div className="mt-2 text-xs inline-block bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded-full border border-rose-800/60">
              {wedding.hashtag}
            </div>
          )}
        </div>
      ) : (
        <div className="px-3.5 py-2.5 mx-3 my-2 rounded-xl bg-stone-800/60 border border-stone-700/50 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-200">No Active Profile</p>
            <p className="text-[10px] text-stone-400">Start from scratch</p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="py-1 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
          >
            + Setup
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onMobileClose?.()}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-600/20 text-amber-300 border-l-4 border-amber-400 pl-2'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Guest Invitation Quick Link */}
      {wedding && wedding.isConfigured && wedding.slug && (
        <div className="p-4 border-t border-stone-800 mt-auto">
          <Link
            href={`/invite/${wedding.slug}`}
            target="_blank"
            onClick={() => isMobile && onMobileClose?.()}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-medium text-xs hover:opacity-95 shadow-md shadow-rose-900/30 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Public Guest Invite</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-stone-900 text-stone-100 flex-col min-h-screen border-r border-stone-800 shrink-0 sticky top-0 h-screen">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-stone-900 text-stone-100 flex flex-col h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </aside>
        </div>
      )}

      <EditWeddingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};
