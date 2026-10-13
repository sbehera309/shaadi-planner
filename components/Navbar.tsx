'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { Calendar, Share2, Check, RefreshCw, Database } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { wedding, isDemoMode, resetToDefaultData } = useWedding();
  const [copied, setCopied] = useState(false);

  // Calculate days left
  const calculateDaysLeft = () => {
    const target = new Date(wedding.startDate).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = calculateDaysLeft();

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/invite/${wedding.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
      {/* Left: Venue & Dates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-stone-600 text-sm">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-stone-900">
            {new Date(wedding.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-600">{wedding.venueName.split('&')[0]}</span>
        </div>
      </div>

      {/* Right: Countdown, Mode badge, and Action buttons */}
      <div className="flex items-center gap-3">
        {/* Countdown Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-900">
          <span>⏳</span>
          <span>{daysLeft} Days to Shubh Vivah</span>
        </div>

        {/* Firebase / Local Demo Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
          <Database className="w-3.5 h-3.5 text-stone-500" />
          <span>{isDemoMode ? 'Local Storage (Demo Mode)' : 'Firebase Connected'}</span>
        </div>

        {/* Reset Demo Data button */}
        <button
          onClick={() => {
            if (confirm('Reset all demo data back to default sample records?')) {
              resetToDefaultData();
            }
          }}
          title="Reset to default sample wedding data"
          className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors text-xs flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Copy Invite Link */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Guest Link</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
