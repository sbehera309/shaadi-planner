'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Modal } from './Modal';
import { useShortlistBudget } from '@/lib/useShortlistBudget';
import { AnimatedBudgetNumber } from './AnimatedBudgetNumber';
import {
  Wallet,
  Building,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  BookmarkCheck,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface ShortlistBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortlistBudgetModal: React.FC<ShortlistBudgetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    targetBudget,
    committedCost,
    shortlistVenueCost,
    shortlistVendorsCost,
    totalShortlistCost,
    totalProjectedCost,
    remainingBudget,
    percentUsed,
    isOverBudget,
    isCloseToBudget,
    currencySymbol,
    guestCount,
    candidateVenuesCount,
    shortlistedVendorsCount,
    includedVendorsCount,
    shortlistedVenuesList,
    shortlistedVendorsList,
    selectedVenueId,
    selectedVenueItem,
    setSelectedVenueId,
    toggleVendorInclusion,
    selectAllVendors,
    deselectAllVendors,
    setTargetBudget,
  } = useShortlistBudget();

  // Inline edit state for target budget
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(targetBudget.toString());

  const handleStartEditBudget = () => {
    setBudgetValue(targetBudget.toString());
    setIsEditingBudget(true);
  };

  const handleSaveBudget = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const num = parseInt(budgetValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) {
      setTargetBudget(num);
    }
    setIsEditingBudget(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Shortlist & Real-Time Budget Simulator"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-stone-800">
        {/* Subtitle / Context */}
        <p className="text-xs text-stone-600 leading-relaxed -mt-1">
          Simulate candidate venues and shortlisted vendors to calculate total projected wedding costs and see your
          <strong> live remaining budget</strong> update in real time.
        </p>

        {/* ========================================================================= */}
        {/* HERO METRICS CARDS WITH ANIMATED COUNTERS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. Target Budget */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Target Budget
              </span>
              {!isEditingBudget && (
                <button
                  type="button"
                  onClick={handleStartEditBudget}
                  className="p-1 text-stone-400 hover:text-amber-800 hover:bg-stone-200/60 rounded-md transition-colors"
                  title="Edit Target Budget"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {isEditingBudget ? (
              <form onSubmit={handleSaveBudget} className="mt-1 flex items-center gap-1">
                <input
                  type="number"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-bold border border-amber-400 rounded-md bg-white focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-1 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="p-1 text-stone-400 hover:bg-stone-200 rounded-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="text-base sm:text-lg font-bold text-stone-900 mt-1 font-mono">
                <AnimatedBudgetNumber
                  value={targetBudget}
                  currency={currencySymbol}
                  highlightDirection="standard"
                />
              </div>
            )}
            <span className="text-[10px] text-stone-400 mt-0.5">Total Cap</span>
          </div>

          {/* 2. Committed / Booked */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
              Committed
            </span>
            <div className="text-base sm:text-lg font-bold text-stone-900 mt-1 font-mono">
              <AnimatedBudgetNumber
                value={committedCost}
                currency={currencySymbol}
                highlightDirection="reverse"
              />
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5">Signed contracts</span>
          </div>

          {/* 3. Shortlist Candidates */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Shortlist Est.</span>
            </span>
            <div className="text-base sm:text-lg font-bold text-amber-950 mt-1 font-mono">
              <AnimatedBudgetNumber
                value={totalShortlistCost}
                currency={currencySymbol}
                highlightDirection="reverse"
              />
            </div>
            <span className="text-[10px] text-amber-800/80 mt-0.5">
              1 venue + {includedVendorsCount} vendors
            </span>
          </div>

          {/* 4. Real-Time Remaining Budget */}
          <div
            className={`rounded-2xl p-3 sm:p-3.5 border flex flex-col justify-between transition-colors ${
              isOverBudget
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : isCloseToBudget
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isOverBudget ? 'Over Budget' : 'Remaining'}
              </span>
              {isOverBudget ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
            </div>
            <div
              className={`text-base sm:text-lg font-extrabold mt-1 font-mono ${
                isOverBudget ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              <AnimatedBudgetNumber
                value={remainingBudget}
                currency={currencySymbol}
                highlightDirection="standard"
              />
            </div>
            <span className="text-[10px] opacity-80 mt-0.5">
              {isOverBudget ? 'Deficit' : `${100 - percentUsed}% buffer left`}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SEGMENTED PROGRESS BAR */}
        {/* ========================================================================= */}
        <div className="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
            <span>Projected Budget Allocation</span>
            <span className="font-mono font-bold">
              {percentUsed}% allocated of {currencySymbol}{targetBudget.toLocaleString()}
            </span>
          </div>

          <div className="h-3 w-full bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
            {/* Committed portion */}
            <div
              style={{
                width: `${targetBudget > 0 ? Math.min(100, (committedCost / targetBudget) * 100) : 0}%`,
              }}
              className="bg-stone-700 transition-all duration-500 relative group"
              title={`Committed: $${committedCost.toLocaleString()}`}
            />
            {/* Shortlist portion */}
            <div
              style={{
                width: `${
                  targetBudget > 0
                    ? Math.min(
                        100 - (committedCost / targetBudget) * 100,
                        (totalShortlistCost / targetBudget) * 100
                      )
                    : 0
                }%`,
              }}
              className="bg-amber-500 transition-all duration-500 relative group"
              title={`Shortlist Scenario: $${totalShortlistCost.toLocaleString()}`}
            />
            {/* Remaining buffer */}
            <div
              style={{
                width: `${targetBudget > 0 ? Math.max(0, 100 - percentUsed) : 0}%`,
              }}
              className="bg-emerald-400/80 transition-all duration-500"
              title={`Remaining: $${remainingBudget.toLocaleString()}`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-stone-700 inline-block" />
                <span>Committed: ${committedCost.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>Shortlist: ${totalShortlistCost.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Buffer: ${Math.max(0, remainingBudget).toLocaleString()}</span>
              </span>
            </div>
            {isOverBudget && (
              <span className="text-rose-600 font-bold">
                Exceeds cap by ${Math.abs(remainingBudget).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: SHORTLISTED VENUE CANDIDATE SELECTION */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
              <Building className="w-4 h-4 text-amber-700" />
              <span>1. Select Venue Candidate to Simulate</span>
            </div>
            <span className="text-[11px] text-stone-500">
              {candidateVenuesCount} shortlisted candidate{candidateVenuesCount === 1 ? '' : 's'}
            </span>
          </div>

          {candidateVenuesCount === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-center text-xs">
              <p className="text-stone-600">No venue shortlisted yet.</p>
              <Link
                href="/dashboard/venues"
                onClick={onClose}
                className="mt-1.5 inline-flex items-center gap-1 text-amber-800 font-bold hover:underline"
              >
                <span>Browse Curated Venues Directory</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {shortlistedVenuesList.map(({ venue, estimatedCost, isSelected, pricingLabel }) => (
                <label
                  key={venue.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-2xs font-medium'
                      : 'bg-white border-stone-200 hover:bg-stone-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="radio"
                      name="scenario_venue"
                      checked={isSelected}
                      onChange={() => setSelectedVenueId(venue.id)}
                      className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 truncate">{venue.name}</span>
                        {venue.isSelectedOfficialVenue && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-sm bg-emerald-100 text-emerald-800">
                            Official Venue
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">
                        {venue.city}, {venue.state} • {pricingLabel}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="font-bold font-mono text-stone-900">
                      ${estimatedCost.toLocaleString()}
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-amber-800">Active Scenario</span>
                    )}
                  </div>
                </label>
              ))}

              {/* Option to exclude venue from scenario */}
              <label
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                  selectedVenueId === null
                    ? 'bg-stone-100 border-stone-400 font-medium'
                    : 'bg-white border-stone-200 hover:bg-stone-50/80 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="scenario_venue"
                    checked={selectedVenueId === null}
                    onChange={() => setSelectedVenueId(null)}
                    className="text-stone-600 focus:ring-stone-500 h-4 w-4"
                  />
                  <span>Exclude venue from scenario (already booked / separate budget)</span>
                </div>
                <span className="font-mono text-stone-500">$0</span>
              </label>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: SHORTLISTED VENDORS CHECKLIST */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
              <Users className="w-4 h-4 text-amber-700" />
              <span>2. Shortlisted Vendor Candidates</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={selectAllVendors}
                className="text-[11px] font-bold text-amber-800 hover:underline"
              >
                Select All
              </button>
              <span className="text-stone-300">•</span>
              <button
                type="button"
                onClick={deselectAllVendors}
                className="text-[11px] font-bold text-stone-500 hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>

          {shortlistedVendorsCount === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 text-center text-xs">
              <p className="text-stone-600">No vendors in your shortlist yet.</p>
              <Link
                href="/dashboard/vendors"
                onClick={onClose}
                className="mt-1.5 inline-flex items-center gap-1 text-amber-800 font-bold hover:underline"
              >
                <span>Browse Curated Desi Vendors & Shortlist Candidates</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {shortlistedVendorsList.map(({ vendor, curatedMatch, estimatedCost, isIncluded, rateBasis }) => (
                <label
                  key={vendor.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                    isIncluded
                      ? 'bg-amber-50/60 border-amber-300 font-medium'
                      : 'bg-white border-stone-200 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={() => toggleVendorInclusion(vendor.id)}
                      className="text-amber-600 focus:ring-amber-500 rounded-sm h-4 w-4"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-900 truncate">{vendor.name}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.2 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          {vendor.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">
                        {rateBasis}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="font-bold font-mono text-stone-900">
                      <AnimatedBudgetNumber
                        value={estimatedCost}
                        currency={currencySymbol}
                        highlightDirection="none"
                      />
                    </div>
                    {isIncluded ? (
                      <span className="text-[10px] text-emerald-700 font-bold">Included</span>
                    ) : (
                      <span className="text-[10px] text-stone-400">Excluded</span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM REALTIME BREAKDOWN BAR */}
        {/* ========================================================================= */}
        <div className="pt-3 border-t border-stone-200 bg-stone-50 p-3 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-600">
            <span>Target Budget</span>
            <span className="font-mono font-bold text-stone-900">
              +{currencySymbol}{targetBudget.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-600">
            <span>Signed / Committed Contracts</span>
            <span className="font-mono font-bold text-stone-700">
              -{currencySymbol}{committedCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-amber-900">
            <span>
              Shortlist Venue ({selectedVenueItem?.venue.name.split('&')[0] || 'None'})
            </span>
            <span className="font-mono font-bold text-amber-800">
              -{currencySymbol}{shortlistVenueCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-amber-900">
            <span>Shortlisted Vendors ({includedVendorsCount} included)</span>
            <span className="font-mono font-bold text-amber-800">
              -{currencySymbol}{shortlistVendorsCost.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-bold text-sm">
            <span>Real-Time Remaining Budget:</span>
            <span
              className={`font-mono text-base ${
                isOverBudget ? 'text-rose-700' : 'text-emerald-700'
              }`}
            >
              <AnimatedBudgetNumber
                value={remainingBudget}
                currency={currencySymbol}
                highlightDirection="standard"
              />
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/dashboard/budget"
            onClick={onClose}
            className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
          >
            <span>Open Detailed Budget & Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 hover:opacity-95 text-white font-semibold text-xs shadow-xs"
          >
            Keep Scenario Active
          </button>
        </div>
      </div>
    </Modal>
  );
};
