'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Compass,
  FileSpreadsheet,
  Building2,
  UtensilsCrossed,
  Flower2,
  Music,
  Camera,
} from 'lucide-react';
import { useWedding } from '@/lib/store';
import { EditWeddingModal } from './EditWeddingModal';
import { ExcelSyncModal } from './ExcelSyncModal';
import { ShareCollaboratorsModal } from './ShareCollaboratorsModal';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SidebarInner: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeVendorSection = pathname === '/dashboard/vendors' ? searchParams.get('section') || 'all' : null;
  const { wedding, vendors, collaborators, userRole } = useWedding();

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const vendorCounts = React.useMemo(() => {
    const counts = { catering: 0, decor: 0, dj: 0, photo: 0, other: 0 };
    vendors.forEach((v) => {
      if (v.category === 'Catering') counts.catering++;
      else if (v.category === 'Mandap & Floral Decorator') counts.decor++;
      else if (v.category === 'Choreographer & DJ' || v.category === 'Lighting & AV Production') counts.dj++;
      else if (v.category === 'Photographer & Cinematographer') counts.photo++;
      else counts.other++;
    });
    return counts;
  }, [vendors]);

  const navSections: Array<{
    heading: string;
    items: Array<{
      label: string;
      href: string;
      icon: React.ComponentType<{ className?: string }>;
      sectionKey?: string;
      badgeCount?: number;
    }>;
  }> = [
    {
      heading: 'Plan',
      items: [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Venues & Contracts', href: '/dashboard/venues', icon: Building2 },
        { label: 'Itinerary & Timings', href: '/dashboard/itinerary', icon: CalendarDays },
      ],
    },
    {
      heading: 'Vendors',
      items: [
        { label: 'Catering', href: '/dashboard/vendors?section=catering', icon: UtensilsCrossed, sectionKey: 'catering', badgeCount: vendorCounts.catering },
        { label: 'Mandap & Decor', href: '/dashboard/vendors?section=decor', icon: Flower2, sectionKey: 'decor', badgeCount: vendorCounts.decor },
        { label: 'DJ, Lighting & AV', href: '/dashboard/vendors?section=dj', icon: Music, sectionKey: 'dj', badgeCount: vendorCounts.dj },
        { label: 'Photo & Video', href: '/dashboard/vendors?section=photo', icon: Camera, sectionKey: 'photo', badgeCount: vendorCounts.photo },
        { label: 'Other Vendors', href: '/dashboard/vendors?section=other', icon: Briefcase, sectionKey: 'other', badgeCount: vendorCounts.other },
      ],
    },
    {
      heading: 'People & Money',
      items: [
        { label: 'Budget & Payments', href: '/dashboard/budget', icon: WalletCards },
        { label: 'Guests & RSVPs', href: '/dashboard/guests', icon: Users },
      ],
    },
    {
      heading: 'Extras',
      items: [
        { label: 'Gifts', href: '/dashboard/shagun', icon: Gift },
        { label: 'Rooms & Logistics', href: '/dashboard/logistics', icon: Hotel },
        { label: 'Horoscope & Kundali', href: '/dashboard/horoscope', icon: Compass },
      ],
    },
  ];

  const renderContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Brand Header */}
      <div className={`p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between shrink-0 ${isMobile ? 'pt-[max(1.25rem,env(safe-area-inset-top))]' : ''}`}>
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

      {/* Navigation Links Grouped Cleanly */}
      <nav className="flex-1 px-3 py-2 space-y-4">
        {navSections.map((section) => (
          <div key={section.heading} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {section.heading}
            </div>
            {section.items.map((item) => {
              const isActive = item.sectionKey
                ? pathname === '/dashboard/vendors' && activeVendorSection === item.sectionKey
                : pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && onMobileClose?.()}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-rose-600/20 text-amber-300 border-l-4 border-amber-400 pl-2'
                      : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-amber-400/25 text-amber-200'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Share, Excel Sync & Guest Invitation Footer Actions */}
      <div className={`p-4 border-t border-stone-800 mt-auto space-y-2 shrink-0 ${isMobile ? 'pb-[max(1.5rem,env(safe-area-inset-bottom))]' : ''}`}>
        {wedding && wedding.isConfigured && (
          <button
            type="button"
            onClick={() => {
              if (isMobile) onMobileClose?.();
              setIsShareModalOpen(true);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs font-semibold transition-all group"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Share &amp; Collaborators</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
              {collaborators.length > 0 ? `${collaborators.length + 1}` : userRole === 'owner' ? '+ Add' : userRole}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (isMobile) onMobileClose?.();
            setIsExcelModalOpen(true);
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs font-semibold transition-all group"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Excel & Sheets Sync</span>
          </div>
          <span className="text-[10px] text-stone-400 group-hover:text-white font-mono bg-stone-700/50 px-1.5 py-0.5 rounded">
            .xlsx
          </span>
        </button>

        {wedding && wedding.isConfigured && wedding.slug && (
          <Link
            href={`/invite/${wedding.slug}`}
            target="_blank"
            onClick={() => isMobile && onMobileClose?.()}
            className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-medium text-xs hover:opacity-95 shadow-md shadow-rose-900/30 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Public Guest Invite</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        )}
      </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
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

      <ExcelSyncModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

      <ShareCollaboratorsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = (props) => (
  <Suspense fallback={null}>
    <SidebarInner {...props} />
  </Suspense>
);
