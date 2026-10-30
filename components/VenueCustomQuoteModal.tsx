'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import {
  VenueOption,
  UserVenueCustomQuote,
  VenuePricingQuoteType,
  AvailableVenueDateEntry,
} from '@/lib/types';
import {
  DollarSign,
  Calendar,
  Phone,
  User,
  Clock,
  Sparkles,
  Trash2,
  Plus,
  CheckCircle2,
  Info,
  ShieldCheck,
  Building,
  Tag,
} from 'lucide-react';

interface VenueCustomQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueOption | null;
  existingQuote?: UserVenueCustomQuote;
  planningGuestCount: number;
  onSaveQuote: (quote: UserVenueCustomQuote) => Promise<void>;
  onDeleteQuote?: (venueId: string) => Promise<void>;
  isLoggedIn: boolean;
  onOpenAuthModal?: () => void;
}

export const VenueCustomQuoteModal: React.FC<VenueCustomQuoteModalProps> = ({
  isOpen,
  onClose,
  venue,
  existingQuote,
  planningGuestCount,
  onSaveQuote,
  onDeleteQuote,
  isLoggedIn,
  onOpenAuthModal,
}) => {
  // Form State
  const [pricingType, setPricingType] = useState<VenuePricingQuoteType>('flat_total');
  const [flatTotalAmount, setFlatTotalAmount] = useState<string>('');
  const [perPersonWholeDayRate, setPerPersonWholeDayRate] = useState<string>('');
  const [perPersonWeddingRate, setPerPersonWeddingRate] = useState<string>('');
  const [perPersonReceptionRate, setPerPersonReceptionRate] = useState<string>('');
  const [weddingGuestOverride, setWeddingGuestOverride] = useState<string>('');
  const [receptionGuestOverride, setReceptionGuestOverride] = useState<string>('');
  const [ceremonyFee, setCeremonyFee] = useState<string>('');
  const [isTaxAndServiceIncluded, setIsTaxAndServiceIncluded] = useState<boolean>(false);
  const [serviceChargePercent, setServiceChargePercent] = useState<string>('22');
  const [taxPercent, setTaxPercent] = useState<string>('6.625');

  // Available Dates State & Date-Specific Pricing
  const [availableDates, setAvailableDates] = useState<AvailableVenueDateEntry[]>([]);
  const [selectedDateId, setSelectedDateId] = useState<string>('');
  const [newDateInput, setNewDateInput] = useState<string>('');
  const [newDateNotes, setNewDateNotes] = useState<string>('');
  const [newDateCost, setNewDateCost] = useState<string>('');
  const [newDateCostType, setNewDateCostType] = useState<'flat_total' | 'per_person'>('flat_total');
  const [newDateSeasonLabel, setNewDateSeasonLabel] = useState<string>('');
  const [newDateIsHold, setNewDateIsHold] = useState<boolean>(false);
  const [newDateHoldExpires, setNewDateHoldExpires] = useState<string>('');
  const [newDateIsPreferred, setNewDateIsPreferred] = useState<boolean>(false);

  // Vendor Call & Coordinator Details
  const [coordinatorName, setCoordinatorName] = useState<string>('');
  const [coordinatorPhone, setCoordinatorPhone] = useState<string>('');
  const [coordinatorEmail, setCoordinatorEmail] = useState<string>('');
  const [callDate, setCallDate] = useState<string>('');
  const [callNotes, setCallNotes] = useState<string>('');
  const [depositRequiredAmount, setDepositRequiredAmount] = useState<string>('');
  const [depositDueNotes, setDepositDueNotes] = useState<string>('');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Populate state when modal opens or venue/quote changes
  useEffect(() => {
    if (!venue) return;

    if (existingQuote) {
      setPricingType(existingQuote.pricingType || 'flat_total');
      setFlatTotalAmount(existingQuote.flatTotalAmount ? String(existingQuote.flatTotalAmount) : '');
      setPerPersonWholeDayRate(existingQuote.perPersonWholeDayRate ? String(existingQuote.perPersonWholeDayRate) : '');
      setPerPersonWeddingRate(existingQuote.perPersonWeddingRate ? String(existingQuote.perPersonWeddingRate) : '');
      setPerPersonReceptionRate(existingQuote.perPersonReceptionRate ? String(existingQuote.perPersonReceptionRate) : '');
      setWeddingGuestOverride(existingQuote.weddingGuestCountOverride ? String(existingQuote.weddingGuestCountOverride) : '');
      setReceptionGuestOverride(existingQuote.receptionGuestCountOverride ? String(existingQuote.receptionGuestCountOverride) : '');
      setCeremonyFee(existingQuote.ceremonyFee ? String(existingQuote.ceremonyFee) : '');
      setIsTaxAndServiceIncluded(Boolean(existingQuote.isTaxAndServiceIncluded));
      setServiceChargePercent(existingQuote.serviceChargePercent !== undefined ? String(existingQuote.serviceChargePercent) : '22');
      setTaxPercent(existingQuote.taxPercent !== undefined ? String(existingQuote.taxPercent) : (venue.state === 'PA' ? '8.0' : '6.625'));
      const existingDates = existingQuote.availableDates || [];
      const venueDates: AvailableVenueDateEntry[] = (venue.availableDates || []).map((d, i) => {
        const trimmed = d.trim();
        const datePart = trimmed.split(' ')[0];
        let dayOfWeek: string | undefined = undefined;
        if (/sat/i.test(trimmed)) dayOfWeek = 'Saturday';
        else if (/sun/i.test(trimmed)) dayOfWeek = 'Sunday';
        else if (/fri/i.test(trimmed)) dayOfWeek = 'Friday';
        return {
          id: `venue-seed-${i}-${datePart.replace(/[^a-zA-Z0-9]/g, '')}`,
          date: datePart,
          dayOfWeek,
          notes: trimmed.includes('(') ? trimmed : undefined,
        };
      });

      const mergedDates = [...existingDates];
      venueDates.forEach((vd) => {
        if (!mergedDates.some((ed) => ed.date === vd.date)) {
          mergedDates.push(vd);
        }
      });
      setAvailableDates(mergedDates);
      setSelectedDateId(existingQuote.selectedDateId || '');
      setCoordinatorName(existingQuote.coordinatorName || venue.contactPerson || '');
      setCoordinatorPhone(existingQuote.coordinatorPhone || venue.contactPhone || '');
      setCoordinatorEmail(existingQuote.coordinatorEmail || venue.contactEmail || '');
      setCallDate(existingQuote.callDate || new Date().toISOString().split('T')[0]);
      setCallNotes(existingQuote.callNotes || '');
      setDepositRequiredAmount(existingQuote.depositRequiredAmount ? String(existingQuote.depositRequiredAmount) : '');
      setDepositDueNotes(existingQuote.depositDueNotes || '');
    } else {
      // Sensible initial defaults
      const isRockleigh = venue.name.toLowerCase().includes('rockleigh');
      const isGrove = venue.name.toLowerCase().includes('grove');
      const isLegacy = venue.name.toLowerCase().includes('legacy');

      setPricingType(isRockleigh ? 'flat_total' : isGrove ? 'per_person_whole_day' : isLegacy ? 'per_person_per_event' : 'flat_total');
      setFlatTotalAmount('');
      setPerPersonWholeDayRate('');
      setPerPersonWeddingRate('');
      setPerPersonReceptionRate('');
      setWeddingGuestOverride('');
      setReceptionGuestOverride('');
      setCeremonyFee('');
      setIsTaxAndServiceIncluded(false);
      setServiceChargePercent(venue.pricing?.serviceChargePercent ? String(venue.pricing.serviceChargePercent) : '22');
      setTaxPercent(venue.pricing?.taxPercent ? String(venue.pricing.taxPercent) : (venue.state === 'PA' ? '8.0' : '6.625'));
      setAvailableDates(
        (venue.availableDates || []).map((d, i) => {
          const trimmed = d.trim();
          const datePart = trimmed.split(' ')[0];
          let dayOfWeek: string | undefined = undefined;
          if (/sat/i.test(trimmed)) dayOfWeek = 'Saturday';
          else if (/sun/i.test(trimmed)) dayOfWeek = 'Sunday';
          else if (/fri/i.test(trimmed)) dayOfWeek = 'Friday';
          return {
            id: `seed-${i}-${datePart.replace(/[^a-zA-Z0-9]/g, '')}`,
            date: datePart,
            dayOfWeek,
            notes: trimmed.includes('(') ? trimmed : 'Confirmed open slot',
          };
        })
      );
      setSelectedDateId('');
      setCoordinatorName(venue.contactPerson || '');
      setCoordinatorPhone(venue.contactPhone || '');
      setCoordinatorEmail(venue.contactEmail || '');
      setCallDate(new Date().toISOString().split('T')[0]);
      setCallNotes('');
      setDepositRequiredAmount('');
      setDepositDueNotes('');
    }
  }, [venue, existingQuote]);

  // Dynamic preview calculation
  const calculatedEstimate = useMemo(() => {
    const guests = Math.max(1, planningGuestCount || 350);
    const fee = Number(ceremonyFee) || 0;
    const svcPct = (Number(serviceChargePercent) || 22) / 100;
    const taxPct = (Number(taxPercent) || 6.625) / 100;
    const feeMultiplier = 1 + svcPct + taxPct;

    let subtotal = 0;
    let allInTotal = 0;
    let activeDateDetail = '';

    // Check if an active date with a specific price override is selected
    const activeDate = availableDates.find(
      (d) => (d.id === selectedDateId || (!selectedDateId && d.isPreferred)) && Number(d.customPriceOverride) > 0
    ) || availableDates.find((d) => Number(d.customPriceOverride) > 0 && d.id === selectedDateId);

    if (activeDate && Number(activeDate.customPriceOverride) > 0) {
      const datePrice = Number(activeDate.customPriceOverride);
      if (activeDate.pricingOverrideType === 'per_person') {
        subtotal = datePrice * guests;
        if (isTaxAndServiceIncluded) {
          allInTotal = subtotal + fee;
        } else {
          allInTotal = Math.round(subtotal * feeMultiplier + fee);
        }
        activeDateDetail = `Date Override: $${datePrice}/guest • ${activeDate.seasonLabel || activeDate.date}`;
      } else {
        subtotal = datePrice;
        if (isTaxAndServiceIncluded) {
          allInTotal = datePrice + fee;
        } else {
          allInTotal = Math.round((datePrice + fee) * feeMultiplier);
        }
        activeDateDetail = `Date Override: $${datePrice.toLocaleString()} Flat • ${activeDate.seasonLabel || activeDate.date}`;
      }
    } else if (pricingType === 'flat_total') {
      const flat = Number(flatTotalAmount) || 0;
      subtotal = flat;
      if (isTaxAndServiceIncluded) {
        allInTotal = flat + fee;
      } else {
        allInTotal = Math.round((flat + fee) * feeMultiplier);
      }
    } else if (pricingType === 'per_person_whole_day') {
      const perGuest = Number(perPersonWholeDayRate) || 0;
      subtotal = perGuest * guests;
      if (isTaxAndServiceIncluded) {
        allInTotal = subtotal + fee;
      } else {
        allInTotal = Math.round(subtotal * feeMultiplier + fee);
      }
    } else if (pricingType === 'per_person_per_event') {
      const wedRate = Number(perPersonWeddingRate) || 0;
      const recRate = Number(perPersonReceptionRate) || 0;
      const wedGuests = Number(weddingGuestOverride) || guests;
      const recGuests = Number(receptionGuestOverride) || guests;

      subtotal = wedRate * wedGuests + recRate * recGuests;
      if (isTaxAndServiceIncluded) {
        allInTotal = subtotal + fee;
      } else {
        allInTotal = Math.round(subtotal * feeMultiplier + fee);
      }
    }

    const costPerGuest = Math.round(allInTotal / guests);
    return {
      subtotal,
      allInTotal,
      costPerGuest,
      guests,
      activeDateDetail,
    };
  }, [
    pricingType,
    flatTotalAmount,
    perPersonWholeDayRate,
    perPersonWeddingRate,
    perPersonReceptionRate,
    weddingGuestOverride,
    receptionGuestOverride,
    ceremonyFee,
    isTaxAndServiceIncluded,
    serviceChargePercent,
    taxPercent,
    planningGuestCount,
    availableDates,
    selectedDateId,
  ]);

  if (!venue) return null;

  // Add available date helper
  const handleAddDate = () => {
    if (!newDateInput) return;
    const d = new Date(`${newDateInput}T12:00:00`);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = isNaN(d.getTime()) ? undefined : dayNames[d.getDay()];

    const entry: AvailableVenueDateEntry = {
      id: `date-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: newDateInput,
      dayOfWeek,
      isHold: newDateIsHold,
      holdExpiresDate: newDateIsHold ? newDateHoldExpires : undefined,
      isPreferred: newDateIsPreferred,
      notes: newDateNotes.trim() || undefined,
      customPriceOverride: newDateCost ? Number(newDateCost) : undefined,
      pricingOverrideType: newDateCostType,
      seasonLabel: newDateSeasonLabel.trim() || undefined,
    };

    setAvailableDates((prev) => [...prev, entry]);
    if (!selectedDateId && newDateCost) {
      setSelectedDateId(entry.id);
    }
    setNewDateInput('');
    setNewDateNotes('');
    setNewDateCost('');
    setNewDateSeasonLabel('');
    setNewDateIsHold(false);
    setNewDateHoldExpires('');
    setNewDateIsPreferred(false);
  };

  const handleRemoveDate = (id: string) => {
    setAvailableDates((prev) => prev.filter((d) => d.id !== id));
    if (selectedDateId === id) {
      setSelectedDateId('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const quotePayload: UserVenueCustomQuote = {
      venueId: venue.id,
      updatedAt: new Date().toISOString(),
      pricingType,
      flatTotalAmount: flatTotalAmount ? Number(flatTotalAmount) : undefined,
      perPersonWholeDayRate: perPersonWholeDayRate ? Number(perPersonWholeDayRate) : undefined,
      perPersonWeddingRate: perPersonWeddingRate ? Number(perPersonWeddingRate) : undefined,
      perPersonReceptionRate: perPersonReceptionRate ? Number(perPersonReceptionRate) : undefined,
      weddingGuestCountOverride: weddingGuestOverride ? Number(weddingGuestOverride) : undefined,
      receptionGuestCountOverride: receptionGuestOverride ? Number(receptionGuestOverride) : undefined,
      ceremonyFee: ceremonyFee ? Number(ceremonyFee) : undefined,
      isTaxAndServiceIncluded,
      serviceChargePercent: serviceChargePercent ? Number(serviceChargePercent) : 22,
      taxPercent: taxPercent ? Number(taxPercent) : 6.625,
      availableDates,
      selectedDateId: selectedDateId || undefined,
      coordinatorName: coordinatorName.trim() || undefined,
      coordinatorPhone: coordinatorPhone.trim() || undefined,
      coordinatorEmail: coordinatorEmail.trim() || undefined,
      callDate: callDate || undefined,
      callNotes: callNotes.trim() || undefined,
      depositRequiredAmount: depositRequiredAmount ? Number(depositRequiredAmount) : undefined,
      depositDueNotes: depositDueNotes.trim() || undefined,
    };

    await onSaveQuote(quotePayload);
    setIsSaving(false);
    setJustSaved(true);
    setTimeout(() => {
      setJustSaved(false);
      onClose();
    }, 1200);
  };

  const handleDelete = async () => {
    if (!confirm('Revert back to the curated directory price estimates for this venue?')) return;
    if (onDeleteQuote) {
      await onDeleteQuote(venue.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Vendor Call & Custom Quote • ${venue.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs text-stone-700 p-1">
        {/* Banner summary */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-400/30 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">⭐</span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">{venue.name}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {venue.city}, {venue.state}
              </span>
              <span className="text-[10px] font-semibold text-stone-500">
                Planning Guest Count: <strong>{planningGuestCount} guests</strong>
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Record the custom quote and open dates given directly to you by the sales manager.
              <strong> These prices will only apply to your account</strong> without altering directory numbers for other users.
            </p>
          </div>
        </div>

        {/* SECTION 1: QUOTE STRUCTURE SELECTION */}
        <div className="space-y-2">
          <label className="font-bold text-stone-900 text-xs block">
            1. Select How This Venue Quoted Your Pricing:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Scenario A: Flat Total */}
            <button
              type="button"
              onClick={() => setPricingType('flat_total')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                pricingType === 'flat_total'
                  ? 'border-amber-600 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20 text-stone-900'
                  : 'border-stone-200 hover:border-stone-300 bg-white text-stone-600'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>🏷️ Flat Total Package</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                1 lump-sum total for the entire booking (e.g., <strong>Rockleigh</strong> gave a flat package quote).
              </p>
            </button>

            {/* Scenario B: Single Whole Day Rate */}
            <button
              type="button"
              onClick={() => setPricingType('per_person_whole_day')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                pricingType === 'per_person_whole_day'
                  ? 'border-amber-600 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20 text-stone-900'
                  : 'border-stone-200 hover:border-stone-300 bg-white text-stone-600'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>👤 1 Price / Person (Whole Day)</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Single rate per guest covering ceremony and reception (e.g., <strong>The Grove</strong> full-day rate).
              </p>
            </button>

            {/* Scenario C: Separate Rates per Event */}
            <button
              type="button"
              onClick={() => setPricingType('per_person_per_event')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                pricingType === 'per_person_per_event'
                  ? 'border-amber-600 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/20 text-stone-900'
                  : 'border-stone-200 hover:border-stone-300 bg-white text-stone-600'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span>🍽️ Itemized per Event</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Separate price / person for wedding and reception (e.g., <strong>Legacy Castle</strong> ceremony + reception).
              </p>
            </button>
          </div>
        </div>

        {/* SECTION 2: PRICING INPUTS BASED ON SELECTED TYPE */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3.5">
          {pricingType === 'flat_total' && (
            <div className="space-y-1">
              <label className="font-bold text-stone-800 text-xs block">
                Total Lump-Sum Package Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="e.g. 65000"
                  value={flatTotalAmount}
                  onChange={(e) => setFlatTotalAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-[10px] text-stone-500">
                Enter the all-in flat package amount quoted for your event date.
              </span>
            </div>
          )}

          {pricingType === 'per_person_whole_day' && (
            <div className="space-y-1">
              <label className="font-bold text-stone-800 text-xs block">
                Price per Person for Whole Day ($/guest) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="e.g. 180"
                  value={perPersonWholeDayRate}
                  onChange={(e) => setPerPersonWholeDayRate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-[10px] text-stone-500">
                Covers both morning ceremony &amp; evening reception dinner under 1 unified guest rate.
              </span>
            </div>
          )}

          {pricingType === 'per_person_per_event' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-800 text-xs block">
                    Wedding Ceremony Rate ($/guest) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">$</span>
                    <input
                      type="number"
                      placeholder="e.g. 95"
                      value={perPersonWeddingRate}
                      onChange={(e) => setPerPersonWeddingRate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Baraat, Mandap ceremony &amp; daytime luncheon.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-800 text-xs block">
                    Reception Dinner Rate ($/guest) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">$</span>
                    <input
                      type="number"
                      placeholder="e.g. 165"
                      value={perPersonReceptionRate}
                      onChange={(e) => setPerPersonReceptionRate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Evening cocktail hour, banquet dinner &amp; open bar.
                  </span>
                </div>
              </div>

              {/* Optional guest count overrides if wedding guest count differs from reception */}
              <div className="pt-2 border-t border-stone-200/70">
                <span className="text-[10px] font-bold text-stone-600 block mb-1">
                  Guest Count Splits (Optional — defaults to {planningGuestCount}):
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500">Wedding Guests:</span>
                    <input
                      type="number"
                      placeholder={String(planningGuestCount)}
                      value={weddingGuestOverride}
                      onChange={(e) => setWeddingGuestOverride(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500">Reception Guests:</span>
                    <input
                      type="number"
                      placeholder={String(planningGuestCount)}
                      value={receptionGuestOverride}
                      onChange={(e) => setReceptionGuestOverride(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Fees & Tax Inclusions */}
          <div className="pt-3 border-t border-stone-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTaxAndServiceIncluded}
                  onChange={(e) => setIsTaxAndServiceIncluded(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-stone-800 text-xs">
                  This quote is ALL-INCLUSIVE (Service Charge &amp; Tax already included)
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Ceremony / Rental Fee ($)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={ceremonyFee}
                    onChange={(e) => setCeremonyFee(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              {!isTaxAndServiceIncluded && (
                <>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Service / Admin Fee (%)
                    </label>
                    <input
                      type="number"
                      placeholder="22"
                      value={serviceChargePercent}
                      onChange={(e) => setServiceChargePercent(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Sales Tax (%)
                    </label>
                    <input
                      type="number"
                      placeholder="6.625"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* DYNAMIC LIVE CALCULATION BOX */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-950 text-white space-y-2 border border-stone-800">
          {calculatedEstimate.activeDateDetail && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 pb-2 border-b border-stone-800">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{calculatedEstimate.activeDateDetail}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Calculated Total for {calculatedEstimate.guests} Guests
              </span>
              <span className="text-2xl font-extrabold font-mono text-white">
                ${calculatedEstimate.allInTotal.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold font-mono text-sm border border-amber-500/30">
                ~${calculatedEstimate.costPerGuest.toLocaleString()} / guest
              </span>
              <span className="block text-[10px] text-stone-400 mt-1">all-in effective cost</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: AVAILABLE DATES & DATE-SPECIFIC PRICING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>2. Available Dates &amp; Date-Specific Pricing ({availableDates.length} logged):</span>
              </label>
              <span className="text-[10px] text-stone-500">
                Set individual costs per date if the venue charges seasonal rates (e.g., <strong>Crystal Plaza</strong>: $75k June/July vs $85k Sept).
              </span>
            </div>
          </div>

          {/* Date add bar */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-stone-700 block mb-1">Available Date *</label>
                <input
                  type="date"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-700 block mb-1">
                  Quoted Price for this Date ($)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-stone-400 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="e.g. 75000 or 85000"
                    value={newDateCost}
                    onChange={(e) => setNewDateCost(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-2 rounded-xl border border-stone-300 bg-white font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-700 block mb-1">Price Structure</label>
                <select
                  value={newDateCostType}
                  onChange={(e) => setNewDateCostType(e.target.value as 'flat_total' | 'per_person')}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
                >
                  <option value="flat_total">🏷️ Flat Lump-Sum Total</option>
                  <option value="per_person">👤 Per Person ($/guest)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-stone-600 block mb-1">
                  Season / Rate Reason Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. June/July Summer Special, or Peak Sept Saturday"
                  value={newDateSeasonLabel}
                  onChange={(e) => setNewDateSeasonLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-600 block mb-1">
                  Ballroom or Date Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Ballroom, holds until Friday"
                  value={newDateNotes}
                  onChange={(e) => setNewDateNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/60">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDateIsHold}
                    onChange={(e) => setNewDateIsHold(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-amber-900">On Courtesy Hold</span>
                </label>

                {newDateIsHold && (
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-stone-500">Hold expires:</span>
                    <input
                      type="date"
                      value={newDateHoldExpires}
                      onChange={(e) => setNewDateHoldExpires(e.target.value)}
                      className="px-2 py-0.5 rounded-md border border-amber-300 bg-white text-xs"
                    />
                  </div>
                )}

                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDateIsPreferred}
                    onChange={(e) => setNewDateIsPreferred(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-emerald-900">⭐ Top Pick Date</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleAddDate}
                disabled={!newDateInput}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Date to Venue</span>
              </button>
            </div>
          </div>

          {/* List of dates with date-specific pricing */}
          {availableDates.length > 0 && (
            <div className="space-y-2">
              {availableDates.map((d) => {
                const isSelectedForPricing = selectedDateId === d.id || (!selectedDateId && d.isPreferred);
                const hasCost = Number(d.customPriceOverride) > 0;

                return (
                  <div
                    key={d.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelectedForPricing && hasCost
                        ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                        : d.isHold
                        ? 'bg-amber-50/50 border-amber-300'
                        : d.isPreferred
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-stone-900 flex items-center gap-1">
                          <span>📅</span>
                          <span>{d.date}</span>
                        </span>

                        {d.dayOfWeek && (
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 font-semibold text-[10px] text-stone-700">
                            {d.dayOfWeek}
                          </span>
                        )}

                        {hasCost && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-bold font-mono text-[11px] border border-amber-300">
                            💰 {d.pricingOverrideType === 'per_person' ? `$${d.customPriceOverride}/pp` : `$${d.customPriceOverride?.toLocaleString()} Flat`}
                          </span>
                        )}

                        {d.seasonLabel && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 font-bold text-[10px] border border-rose-200">
                            🏷️ {d.seasonLabel}
                          </span>
                        )}

                        {d.isHold && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-200/90 text-amber-950 font-bold text-[10px]">
                            ⏳ Held {d.holdExpiresDate ? `until ${d.holdExpiresDate}` : ''}
                          </span>
                        )}

                        {d.isPreferred && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
                            ⭐ Top Pick
                          </span>
                        )}
                      </div>

                      {d.notes && (
                        <p className="text-[11px] text-stone-600 italic">
                          &ldquo;{d.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {hasCost && (
                        <button
                          type="button"
                          onClick={() => setSelectedDateId(d.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            selectedDateId === d.id
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          {selectedDateId === d.id ? '✓ Active Rate' : 'Calculate at this Rate'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveDate(d.id)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                        title="Remove date"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: VENDOR CALL DETAILS & CONCESSIONS */}
        <div className="space-y-3 pt-1 border-t border-stone-200">
          <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-amber-700" />
            <span>3. Vendor Call &amp; Coordinator Log:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                Coordinator Name
              </span>
              <input
                type="text"
                placeholder="e.g. Susan, Mark"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                Direct Phone
              </span>
              <input
                type="tel"
                placeholder="(201) 555-0199"
                value={coordinatorPhone}
                onChange={(e) => setCoordinatorPhone(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                Call Date
              </span>
              <input
                type="date"
                value={callDate}
                onChange={(e) => setCallDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                Deposit Required ($)
              </span>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-stone-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={depositRequiredAmount}
                  onChange={(e) => setDepositRequiredAmount(e.target.value)}
                  className="w-full pl-6 pr-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
                Payment Installment Notes
              </span>
              <input
                type="text"
                placeholder="e.g. 25% at signing, balance in 3 equal installments"
                value={depositDueNotes}
                onChange={(e) => setDepositDueNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-stone-600 block mb-0.5">
              Call Notes, Concessions &amp; Special Permissions
            </span>
            <textarea
              rows={2}
              placeholder="e.g. Susan will waive ceremony fee if booked by Friday. Outside mithai allowed without buyout fee. Bridal suite access starting 7:00 AM."
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2.5">
          <div>
            {existingQuote && onDeleteQuote && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-stone-400 hover:text-rose-700 text-xs font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revert to Curated Directory Estimate</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className={`px-6 py-2 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                justSaved
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 hover:from-rose-800 hover:to-amber-800'
              }`}
            >
              {isSaving ? (
                <span>Saving Quote...</span>
              ) : justSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ Quote Saved!</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Save My Custom Quote &amp; Dates</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
