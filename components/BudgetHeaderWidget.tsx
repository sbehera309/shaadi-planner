'use client';

import React, { useState } from 'react';
import { useShortlistBudget } from '@/lib/useShortlistBudget';
import { AnimatedBudgetNumber } from './AnimatedBudgetNumber';
import { ShortlistBudgetModal } from './ShortlistBudgetModal';
import { Wallet, Sparkles, ChevronDown, AlertCircle, CheckCircle2 } from 'lucide-react';

export const BudgetHeaderWidget: React.FC = () => {
  const {
    targetBudget,
    committedCost,
    totalShortlistCost,
    totalProjectedCost,
    remainingBudget,
    percentUsed,
    isOverBudget,
    isCloseToBudget,
    currencySymbol,
    candidateVenuesCount,
    includedVendorsCount,
  } = useShortlistBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // If budget is not configured or 0
  const isBudgetUnset = targetBudget === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="group relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50/90 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all text-xs cursor-pointer overflow-hidden"
        title="Click to view real-time shortlist budget simulation"
        aria-label="Open Real-Time Shortlist Budget Simulator"
      >
        {/* Subtle mini progress bar along the bottom */}
        {!isBudgetUnset && (
          <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-stone-100 flex overflow-hidden">
            <div
              style={{ width: `${Math.min(100, (committedCost / targetBudget) * 100)}%` }}
              className="bg-stone-700 transition-all duration-500"
            />
            <div
              style={{
                width: `${Math.min(
                  100 - (committedCost / targetBudget) * 100,
                  (totalShortlistCost / targetBudget) * 100
                )}%`,
              }}
              className="bg-amber-500 transition-all duration-500"
            />
            <div
              style={{ width: `${Math.max(0, 100 - percentUsed)}%` }}
              className="bg-emerald-400 transition-all duration-500"
            />
          </div>
        )}

        {/* Icon */}
        <div className="w-5 h-5 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/60 group-hover:bg-amber-100 transition-colors">
          <Wallet className="w-3 h-3" />
        </div>

        {isBudgetUnset ? (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-700">Set Budget</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
              + Plan
            </span>
          </div>
        ) : (
          <>
            {/* Desktop Full View */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                <span className="font-semibold text-stone-700">Budget:</span>
                <span className="font-mono font-bold text-stone-900">
                  <AnimatedBudgetNumber
                    value={targetBudget}
                    currency={currencySymbol}
                    compact={true}
                    highlightDirection="none"
                  />
                </span>
              </div>

              <span className="text-stone-300">•</span>

              <div className="flex items-center gap-1 text-[11px] text-amber-800">
                <span className="font-medium">Shortlist:</span>
                <span className="font-mono font-bold">
                  <AnimatedBudgetNumber
                    value={totalShortlistCost}
                    currency={currencySymbol}
                    compact={true}
                    highlightDirection="none"
                  />
                </span>
              </div>

              <span className="text-stone-300">•</span>

              {/* Remaining badge */}
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md font-bold font-mono text-[11px] border transition-colors ${
                  isOverBudget
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : isCloseToBudget
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isOverBudget ? (
                  <AlertCircle className="w-3 h-3 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                )}
                <AnimatedBudgetNumber
                  value={remainingBudget}
                  currency={currencySymbol}
                  compact={true}
                  highlightDirection="standard"
                />
                <span className="text-[10px] uppercase font-sans font-semibold">
                  {isOverBudget ? 'over' : 'left'}
                </span>
              </div>
            </div>

            {/* Mobile / Tablet Compact View */}
            <div className="flex md:hidden items-center gap-1.5">
              <span className="text-[11px] font-semibold text-stone-600">Left:</span>
              <span
                className={`font-mono font-extrabold text-xs px-1.5 py-0.2 rounded-md ${
                  isOverBudget
                    ? 'bg-rose-100 text-rose-800'
                    : isCloseToBudget
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}
              >
                <AnimatedBudgetNumber
                  value={remainingBudget}
                  currency={currencySymbol}
                  compact={true}
                  highlightDirection="standard"
                />
              </span>
            </div>

            <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-y-0.5" />
          </>
        )}
      </button>

      <ShortlistBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
