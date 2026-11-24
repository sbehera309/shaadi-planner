'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

interface PrivateFinancialLockProps {
  sectionName: string;
}

export const PrivateFinancialLock: React.FC<PrivateFinancialLockProps> = ({ sectionName }) => {
  return (
    <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl border border-stone-200 shadow-xs p-8 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-bold font-serif text-stone-900">
          {sectionName} is Private
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Budgets, contract prices, payments, and gift amounts are visible only to the wedding owners and collaborators with <strong>Edit Access</strong>.
        </p>
      </div>
      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5 text-left">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          You can still view the <strong>Wedding Schedule</strong>, <strong>Venues</strong>, <strong>Vendors</strong>, <strong>Guest List</strong>, and <strong>Seating Chart</strong>. Ask the couple to grant you Edit Access if you&apos;re helping manage finances.
        </span>
      </div>
      <div className="pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </div>
    </div>
  );
};
