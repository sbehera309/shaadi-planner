'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './authContext';
import {
  VenueOption,
  UserVenueCustomQuote,
  EffectiveVenuePricingResult,
  AvailableVenueDateEntry,
} from './types';
import {
  calculateVenueEstimateForGuests,
  EventPackageFormat,
} from './venuePricingCalculator';
import { isFirebaseConfigured, db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

const STORAGE_KEY_PREFIX = 'shaadi_venue_quotes_';

/**
 * Preloaded verified negotiated quotes for real couple scenarios:
 * - The Rockleigh: Flat total lump sum of $85,000 for whole day
 * - The Grove: 1 price per person of $250/person for whole day
 * - The Legacy Castle: $125/person ceremony + $175/person reception
 * - Crystal Plaza: Date-specific overrides ($75k summer June/July vs $85k peak September)
 */
export const DEFAULT_USER_VENUE_QUOTES: Record<string, UserVenueCustomQuote> = {
  'curated-nj-the-rockleigh': {
    venueId: 'curated-nj-the-rockleigh',
    updatedAt: '2026-10-29T18:00:00Z',
    pricingType: 'flat_total',
    flatTotalAmount: 85000,
    isTaxAndServiceIncluded: true,
    coordinatorName: 'Sunny Patel (Banquet Sales)',
    callNotes: 'Quoted $85,000 flat total package for whole day event.',
    availableDates: [
      { id: 'rockleigh-date-1', date: '2026-10-17', dayOfWeek: 'Saturday', isPreferred: true, notes: 'Grand Pavilion' },
      { id: 'rockleigh-date-2', date: '2026-10-24', dayOfWeek: 'Saturday', isHold: true, notes: 'Hold until Friday 5pm' },
      { id: 'rockleigh-date-3', date: '2026-11-07', dayOfWeek: 'Saturday' },
    ],
  },
  'curated-nj-the-grove': {
    venueId: 'curated-nj-the-grove',
    updatedAt: '2026-10-29T18:00:00Z',
    pricingType: 'per_person_whole_day',
    perPersonWholeDayRate: 250,
    isTaxAndServiceIncluded: false,
    serviceChargePercent: 22,
    taxPercent: 6.625,
    coordinatorName: 'Catering Office',
    callNotes: 'Gave 1 flat price of $250/person for the whole day event including ceremony through reception.',
    availableDates: [
      { id: 'grove-date-1', date: '2026-10-24', dayOfWeek: 'Saturday', isPreferred: true },
      { id: 'grove-date-2', date: '2026-11-14', dayOfWeek: 'Saturday' },
    ],
  },
  'curated-nj-legacy-castle': {
    venueId: 'curated-nj-legacy-castle',
    updatedAt: '2026-10-29T18:00:00Z',
    pricingType: 'per_person_per_event',
    perPersonWeddingRate: 125,
    perPersonReceptionRate: 175,
    isTaxAndServiceIncluded: false,
    serviceChargePercent: 22,
    taxPercent: 6.625,
    coordinatorName: 'Legacy Banquet Sales',
    callNotes: 'Legacy gave price per person for each event: $125/pp for morning wedding ceremony and $175/pp for evening reception dinner.',
    availableDates: [
      { id: 'legacy-date-1', date: '2026-10-17', dayOfWeek: 'Saturday', isPreferred: true, notes: 'Grand Ballroom' },
      { id: 'legacy-date-2', date: '2026-10-24', dayOfWeek: 'Saturday', isHold: true },
      { id: 'legacy-date-3', date: '2026-11-07', dayOfWeek: 'Saturday' },
    ],
  },
  'curated-nj-crystal-plaza': {
    venueId: 'curated-nj-crystal-plaza',
    updatedAt: '2026-10-29T18:00:00Z',
    pricingType: 'flat_total',
    flatTotalAmount: 85000,
    isTaxAndServiceIncluded: true,
    coordinatorName: 'Sales Director',
    callNotes: 'Crystal Plaza does pricing based on dates: $75k for June/July summer dates but $85k for September peak fall dates.',
    selectedDateId: 'cp-date-summer-1',
    availableDates: [
      {
        id: 'cp-date-summer-1',
        date: '2026-06-27',
        dayOfWeek: 'Saturday',
        customPriceOverride: 75000,
        pricingOverrideType: 'flat_total',
        seasonLabel: 'Summer ($75k)',
        isPreferred: true,
      },
      {
        id: 'cp-date-summer-2',
        date: '2026-07-18',
        dayOfWeek: 'Saturday',
        customPriceOverride: 75000,
        pricingOverrideType: 'flat_total',
        seasonLabel: 'Summer ($75k)',
      },
      {
        id: 'cp-date-fall-1',
        date: '2026-09-19',
        dayOfWeek: 'Saturday',
        customPriceOverride: 85000,
        pricingOverrideType: 'flat_total',
        seasonLabel: 'Peak Fall ($85k)',
        isHold: true,
      },
      {
        id: 'cp-date-fall-2',
        date: '2026-09-26',
        dayOfWeek: 'Saturday',
        customPriceOverride: 85000,
        pricingOverrideType: 'flat_total',
        seasonLabel: 'Peak Fall ($85k)',
      },
    ],
  },
};

/**
 * Robust resolver that matches a venue by its ID or normalized name
 * to guarantee pre-seeded user quotes & negotiated dates are never lost.
 */
export function findDefaultVenueQuote(
  venueOrId: string | { id: string; name?: string }
): UserVenueCustomQuote | undefined {
  const venueId = typeof venueOrId === 'string' ? venueOrId : venueOrId.id;
  if (DEFAULT_USER_VENUE_QUOTES[venueId]) {
    return DEFAULT_USER_VENUE_QUOTES[venueId];
  }

  const venueName = typeof venueOrId === 'object' ? (venueOrId.name || '').toLowerCase() : '';
  const idLower = (venueId || '').toLowerCase();

  if (idLower.includes('rockleigh') || venueName.includes('rockleigh')) {
    return { ...DEFAULT_USER_VENUE_QUOTES['curated-nj-the-rockleigh'], venueId };
  }
  if (idLower.includes('grove') || venueName.includes('grove')) {
    return { ...DEFAULT_USER_VENUE_QUOTES['curated-nj-the-grove'], venueId };
  }
  if (idLower.includes('legacy') || venueName.includes('legacy')) {
    return { ...DEFAULT_USER_VENUE_QUOTES['curated-nj-legacy-castle'], venueId };
  }
  if (idLower.includes('crystal') || venueName.includes('crystal')) {
    return { ...DEFAULT_USER_VENUE_QUOTES['curated-nj-crystal-plaza'], venueId };
  }

  return undefined;
}

/**
 * Calculates effective pricing for a venue, preferring the user's custom negotiated
 * vendor quote (if present) over generic directory estimates.
 */
export function calculateEffectiveVenuePricing(
  venue: VenueOption,
  quote: UserVenueCustomQuote | undefined,
  guestCount: number,
  eventFormat: EventPackageFormat = 'all_day',
  targetDateId?: string
): EffectiveVenuePricingResult {
  const safeGuests = Math.max(1, guestCount || 350);
  const effectiveQuote = quote || findDefaultVenueQuote(venue);

  // If the user has logged a custom quote for this venue (or default verified quote applies), calculate using negotiated terms
  if (effectiveQuote) {
    const ceremonyFee = Number(effectiveQuote.ceremonyFee) || 0;
    const isAllInclusive = Boolean(effectiveQuote.isTaxAndServiceIncluded);
    const servicePercent = effectiveQuote.serviceChargePercent ?? (venue.pricing?.serviceChargePercent || 22);
    const taxPercent = effectiveQuote.taxPercent ?? (venue.state === 'PA' ? 8.0 : 6.625);
    const svcPct = servicePercent / 100;
    const taxPct = taxPercent / 100;
    const feeMultiplier = 1 + svcPct + taxPct;

    // Check for date-specific pricing overrides (e.g. 75k for June/July vs 85k for Sept)
    const availableDates = effectiveQuote.availableDates || [];
    const datesWithPricing = availableDates.filter((d) => Number(d.customPriceOverride) > 0);
    const hasDateSpecificPricing = datesWithPricing.length > 0;

    // Resolve active date: explicit param > effectiveQuote.selectedDateId > preferred date > first date with price override
    let activeDate: AvailableVenueDateEntry | undefined;
    if (targetDateId) {
      activeDate = availableDates.find((d) => d.id === targetDateId);
    } else if (effectiveQuote.selectedDateId) {
      activeDate = availableDates.find((d) => d.id === effectiveQuote.selectedDateId);
    }
    if (!activeDate && datesWithPricing.length > 0) {
      activeDate = availableDates.find((d) => d.isPreferred && Number(d.customPriceOverride) > 0) || datesWithPricing[0];
    }
    if (!activeDate && availableDates.length > 0) {
      activeDate = availableDates.find((d) => d.isPreferred) || availableDates[0];
    }

    let estimatedTotal = 0;
    let quoteLabel = '';
    let morningCeremonyTotal = 0;
    let eveningReceptionTotal = 0;

    // 1. If an active date has its own specific cost override, use that date's pricing!
    if (activeDate && Number(activeDate.customPriceOverride) > 0) {
      const datePrice = Number(activeDate.customPriceOverride);
      const dateSeasonTag = activeDate.seasonLabel || `${activeDate.date}${activeDate.dayOfWeek ? ` (${activeDate.dayOfWeek.slice(0, 3)})` : ''}`;

      if (activeDate.pricingOverrideType === 'per_person') {
        const subtotal = datePrice * safeGuests;
        if (isAllInclusive) {
          estimatedTotal = subtotal + ceremonyFee;
        } else {
          estimatedTotal = Math.round(subtotal * feeMultiplier + ceremonyFee);
        }
        quoteLabel = `$${datePrice}/pp • ${dateSeasonTag}`;
        morningCeremonyTotal = Math.round(estimatedTotal * 0.38);
        eveningReceptionTotal = estimatedTotal - morningCeremonyTotal;
      } else {
        // Flat lump sum for date (e.g. Crystal Plaza $75k June/July vs $85k Sept)
        if (isAllInclusive) {
          estimatedTotal = datePrice + ceremonyFee;
        } else {
          estimatedTotal = Math.round((datePrice + ceremonyFee) * feeMultiplier);
        }
        quoteLabel = `$${datePrice.toLocaleString()} Flat • ${dateSeasonTag}`;
      }
    } else {
      // 2. Otherwise calculate based on the venue's overall pricing model
      switch (effectiveQuote.pricingType) {
        case 'flat_total': {
          // Scenario A (e.g. Rockleigh): 1 Flat package price for the whole day
          const flatAmount = Number(effectiveQuote.flatTotalAmount) || 0;
          if (isAllInclusive) {
            estimatedTotal = flatAmount + ceremonyFee;
          } else {
            estimatedTotal = Math.round((flatAmount + ceremonyFee) * feeMultiplier);
          }
          quoteLabel = `Flat Package: $${flatAmount.toLocaleString()}`;
          break;
        }

        case 'per_person_whole_day': {
          // Scenario B (e.g. The Grove): 1 Single rate per person across all events
          const perPersonRate = Number(effectiveQuote.perPersonWholeDayRate) || 0;
          const subtotal = perPersonRate * safeGuests;
          if (isAllInclusive) {
            estimatedTotal = subtotal + ceremonyFee;
          } else {
            estimatedTotal = Math.round(subtotal * feeMultiplier + ceremonyFee);
          }
          quoteLabel = `$${perPersonRate}/guest Full Day`;
          morningCeremonyTotal = Math.round(estimatedTotal * 0.38);
          eveningReceptionTotal = estimatedTotal - morningCeremonyTotal;
          break;
        }

        case 'per_person_per_event': {
          // Scenario C (e.g. The Legacy Castle): Itemized rate per person for wedding & reception
          const weddingRate = Number(effectiveQuote.perPersonWeddingRate) || 0;
          const receptionRate = Number(effectiveQuote.perPersonReceptionRate) || 0;
          const weddingGuests = Number(effectiveQuote.weddingGuestCountOverride) || safeGuests;
          const receptionGuests = Number(effectiveQuote.receptionGuestCountOverride) || safeGuests;

          let activeWeddingCost = weddingRate * weddingGuests;
          let activeReceptionCost = receptionRate * receptionGuests;

          if (!isAllInclusive) {
            activeWeddingCost = Math.round(activeWeddingCost * feeMultiplier);
            activeReceptionCost = Math.round(activeReceptionCost * feeMultiplier);
          }

          morningCeremonyTotal = activeWeddingCost + ceremonyFee;
          eveningReceptionTotal = activeReceptionCost;

          if (eventFormat === 'ceremony_only') {
            estimatedTotal = morningCeremonyTotal;
          } else if (eventFormat === 'reception_only') {
            estimatedTotal = eveningReceptionTotal;
          } else {
            estimatedTotal = morningCeremonyTotal + eveningReceptionTotal;
          }

          quoteLabel = `$${weddingRate}/pp Wed + $${receptionRate}/pp Rec`;
          break;
        }
      }
    }

    const costPerGuest = Math.round(estimatedTotal / safeGuests);
    const breakdownSummary = `${safeGuests} guests • ~$${costPerGuest}/guest negotiated (${quoteLabel})`;

    return {
      isCustomUserQuote: true,
      pricingType: effectiveQuote.pricingType,
      estimatedTotalCost: estimatedTotal,
      costPerGuest,
      breakdownSummary,
      quoteLabel,
      availableDates: availableDates,
      activeDate,
      hasDateSpecificPricing,
      coordinatorName: effectiveQuote.coordinatorName,
      coordinatorPhone: effectiveQuote.coordinatorPhone,
      coordinatorEmail: effectiveQuote.coordinatorEmail,
      callNotes: effectiveQuote.callNotes,
      depositRequiredAmount: effectiveQuote.depositRequiredAmount,
      depositDueNotes: effectiveQuote.depositDueNotes,
      isTaxAndServiceIncluded: isAllInclusive,
      serviceChargePercent: servicePercent,
      taxPercent,
      ceremonyFee,
      morningCeremonyTotal,
      eveningReceptionTotal,
    };
  }

  // Fallback to directory default estimate
  const defaultEstimate = calculateVenueEstimateForGuests(venue, safeGuests, eventFormat);
  const fallbackDates: AvailableVenueDateEntry[] = (venue.availableDates || []).map((dateStr, idx) => ({
    id: `default-${idx}`,
    date: dateStr.split(' ')[0],
    dayOfWeek: dateStr.includes('Sat') ? 'Saturday' : dateStr.includes('Sun') ? 'Sunday' : undefined,
    notes: 'Directory estimate slot',
  }));

  return {
    isCustomUserQuote: false,
    estimatedTotalCost: defaultEstimate.estimatedTotalCost,
    costPerGuest: defaultEstimate.costPerGuest,
    breakdownSummary: defaultEstimate.breakdownSummary,
    availableDates: fallbackDates,
    serviceChargePercent: defaultEstimate.serviceChargePercent,
    taxPercent: defaultEstimate.taxPercent,
    morningCeremonyTotal: defaultEstimate.morningCeremonyTotal,
    eveningReceptionTotal: defaultEstimate.eveningReceptionTotal,
  };
}

export function useUserVenueQuotes() {
  const { user } = useAuth();
  // Initialize with preloaded negotiated quotes so they are active by default
  const [quotes, setQuotes] = useState<Record<string, UserVenueCustomQuote>>(DEFAULT_USER_VENUE_QUOTES);
  const [loading, setLoading] = useState<boolean>(true);

  // Load quotes from user-scoped localStorage and Firestore, ensuring default quotes are preserved
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${user?.uid || 'guest'}`;
    let cachedMap: Record<string, UserVenueCustomQuote> = { ...DEFAULT_USER_VENUE_QUOTES };

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          cachedMap = { ...DEFAULT_USER_VENUE_QUOTES, ...parsed };
        }
      }
      setQuotes(cachedMap);
    } catch (e) {
      console.warn('Failed to parse cached venue quotes:', e);
    }

    if (user && isFirebaseConfigured && db) {
      setLoading(true);
      const quotesRef = collection(db, 'users', user.uid, 'venue_quotes');
      getDocs(quotesRef)
        .then((snapshot) => {
          const remoteMap: Record<string, UserVenueCustomQuote> = {};
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserVenueCustomQuote;
            remoteMap[docSnap.id] = {
              ...data,
              venueId: docSnap.id,
            };
          });

          // Merge: remote takes precedence, supplemented by local unsaved & baseline verified quotes
          const merged = { ...DEFAULT_USER_VENUE_QUOTES, ...cachedMap, ...remoteMap };
          setQuotes(merged);
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch {}
        })
        .catch((err) => {
          console.warn('Firestore venue quotes fetch failed, using local cache:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Save or update quote for a venue
  const saveQuote = useCallback(
    async (quote: UserVenueCustomQuote) => {
      const storageKey = `${STORAGE_KEY_PREFIX}${user?.uid || 'guest'}`;
      const updatedQuote: UserVenueCustomQuote = {
        ...quote,
        userId: user?.uid,
        updatedAt: new Date().toISOString(),
      };

      setQuotes((prev) => {
        const next = { ...prev, [quote.venueId]: updatedQuote };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });

      if (user && isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, 'users', user.uid, 'venue_quotes', quote.venueId);
          await setDoc(docRef, updatedQuote, { merge: true });
        } catch (err) {
          console.warn('Failed to sync venue quote to Firestore:', err);
        }
      }
    },
    [user]
  );

  // Delete quote (revert to directory baseline)
  const deleteQuote = useCallback(
    async (venueId: string) => {
      const storageKey = `${STORAGE_KEY_PREFIX}${user?.uid || 'guest'}`;

      setQuotes((prev) => {
        const next = { ...prev };
        delete next[venueId];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });

      if (user && isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, 'users', user.uid, 'venue_quotes', venueId);
          await deleteDoc(docRef);
        } catch (err) {
          console.warn('Failed to delete venue quote in Firestore:', err);
        }
      }
    },
    [user]
  );

  const getQuote = useCallback(
    (venueId: string, venueName?: string): UserVenueCustomQuote | undefined => {
      return quotes[venueId] || findDefaultVenueQuote({ id: venueId, name: venueName });
    },
    [quotes]
  );

  const selectActiveDate = useCallback(
    async (venueId: string, dateId: string) => {
      const existing = quotes[venueId] || findDefaultVenueQuote(venueId);
      if (!existing) return;
      const updated: UserVenueCustomQuote = {
        ...existing,
        venueId,
        selectedDateId: dateId,
        updatedAt: new Date().toISOString(),
      };
      await saveQuote(updated);
    },
    [quotes, saveQuote]
  );

  const getEffectivePricing = useCallback(
    (
      venue: VenueOption,
      guestCount: number,
      eventFormat: EventPackageFormat = 'all_day',
      targetDateId?: string
    ): EffectiveVenuePricingResult => {
      const userQuote = quotes[venue.id] || findDefaultVenueQuote(venue);
      return calculateEffectiveVenuePricing(venue, userQuote, guestCount, eventFormat, targetDateId);
    },
    [quotes]
  );

  return {
    quotes,
    getQuote,
    saveQuote,
    deleteQuote,
    selectActiveDate,
    getEffectivePricing,
    loading,
  };
}
