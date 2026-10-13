'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { EditWeddingModal } from './EditWeddingModal';
import { Calendar, Share2, Check, RefreshCw, Database, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { wedding, isDemoMode, resetToDefaultData } = useWedding();
  const [copied, setCopied] = useState(false);

  // Calculate days left
  const calculateDaysLeft = () => {
    if (!wedding || !wedding.startDate) return 0;
    const target = new Date(wedding.startDate).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = calculateDaysLeft();

  const handleShare = () => {
    if (typeof window !== 'undefined' && wedding?.slug) {
      const url = `${window.location.origin}/invite/${wedding.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-stone-200 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
        {/* Left: Mobile hamburger + Venue/Dates */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 lg:hidden transition-colors shrink-0"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {wedding && wedding.isConfigured && wedding.startDate ? (
            <div className="flex items-center gap-1.5 sm:gap-2 text-stone-600 text-xs sm:text-sm min-w-0 truncate">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-stone-900 truncate">
                {new Date(wedding.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              {wedding.venueName && (
                <>
                  <span className="text-stone-300 hidden sm:inline">•</span>
                  <span className="text-stone-600 hidden sm:inline truncate">
                    {wedding.venueName.split('&')[0]}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-stone-500 text-xs truncate">
              <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate font-medium">ShaadiSutra Planner</span>
            </div>
          )}
        </div>

        {/* Right: Countdown, Mode badge, and Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Countdown Pill */}
          {wedding && wedding.isConfigured && wedding.startDate && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] sm:text-xs font-semibold text-amber-900 shrink-0">
              <span>⏳</span>
              <span className="hidden sm:inline">{daysLeft} Days to Shubh Vivah</span>
              <span className="sm:hidden">{daysLeft}d left</span>
            </div>
          )}

          {/* Database Badge - hide on small mobile to avoid crowding */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
            <Database className="w-3.5 h-3.5 text-stone-500" />
            <span>{isDemoMode ? 'Local Storage' : 'Firebase Connected'}</span>
          </div>

          {/* Reset Clean State button */}
          <button
            onClick={() => {
              if (confirm('Reset planner back to clean minimal start?')) {
                resetToDefaultData();
              }
            }}
            title="Reset to clean state"
            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded-xl transition-colors text-xs flex items-center gap-1 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Copy Invite Link or Setup Wedding */}
          {wedding && wedding.isConfigured ? (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="hidden sm:inline">Link Copied!</span>
                  <span className="sm:hidden">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Invite Link</span>
                  <span className="sm:hidden">Invite</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-amber-600 to-rose-700 hover:opacity-95 text-white rounded-xl text-xs font-semibold shadow-xs transition-all shrink-0"
            >
              <span>+ Set Up</span>
              <span className="hidden sm:inline">Wedding</span>
            </button>
          )}
        </div>
      </header>

      <EditWeddingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};
