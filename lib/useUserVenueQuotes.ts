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
 * Calculates effective pricing for a venue, preferring the user's custom negotiated
 * vendor quote (if present) over generic directory estimates.
 */
export function calculateEffectiveVenuePricing(
  venue: VenueOption,
  quote: UserVenueCustomQuote | undefined,
  guestCount: number,
  eventFormat: EventPackageFormat = 'all_day'
): EffectiveVenuePricingResult {
  const safeGuests = Math.max(1, guestCount || 350);

  // If the user has logged a custom quote for this venue, calculate using their negotiated terms
  if (quote) {
    const ceremonyFee = Number(quote.ceremonyFee) || 0;
    const isAllInclusive = Boolean(quote.isTaxAndServiceIncluded);
    const servicePercent = quote.serviceChargePercent ?? (venue.pricing?.serviceChargePercent || 22);
    const taxPercent = quote.taxPercent ?? (venue.state === 'PA' ? 8.0 : 6.625);
    const svcPct = servicePercent / 100;
    const taxPct = taxPercent / 100;
    const feeMultiplier = 1 + svcPct + taxPct;

    let estimatedTotal = 0;
    let quoteLabel = '';
    let morningCeremonyTotal = 0;
    let eveningReceptionTotal = 0;

    switch (quote.pricingType) {
      case 'flat_total': {
        // Scenario A (e.g. Rockleigh): 1 Flat package price for the whole day
        const flatAmount = Number(quote.flatTotalAmount) || 0;
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
        const perPersonRate = Number(quote.perPersonWholeDayRate) || 0;
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
        const weddingRate = Number(quote.perPersonWeddingRate) || 0;
        const receptionRate = Number(quote.perPersonReceptionRate) || 0;
        const weddingGuests = Number(quote.weddingGuestCountOverride) || safeGuests;
        const receptionGuests = Number(quote.receptionGuestCountOverride) || safeGuests;

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

    const costPerGuest = Math.round(estimatedTotal / safeGuests);
    const breakdownSummary = `${safeGuests} guests • ~$${costPerGuest}/guest negotiated (${quoteLabel})`;

    return {
      isCustomUserQuote: true,
      pricingType: quote.pricingType,
      estimatedTotalCost: estimatedTotal,
      costPerGuest,
      breakdownSummary,
      quoteLabel,
      availableDates: quote.availableDates || [],
      coordinatorName: quote.coordinatorName,
      coordinatorPhone: quote.coordinatorPhone,
      coordinatorEmail: quote.coordinatorEmail,
      callNotes: quote.callNotes,
      depositRequiredAmount: quote.depositRequiredAmount,
      depositDueNotes: quote.depositDueNotes,
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
  const [quotes, setQuotes] = useState<Record<string, UserVenueCustomQuote>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load quotes from user-scoped localStorage and Firestore
  useEffect(() => {
    const storageKey = `${STORAGE_KEY_PREFIX}${user?.uid || 'guest'}`;
    let cachedMap: Record<string, UserVenueCustomQuote> = {};

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        cachedMap = JSON.parse(stored);
        if (typeof cachedMap === 'object' && cachedMap !== null) {
          setQuotes(cachedMap);
        }
      }
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

          // Merge: remote takes precedence, supplemented by any local unsaved quotes
          const merged = { ...cachedMap, ...remoteMap };
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
    (venueId: string): UserVenueCustomQuote | undefined => {
      return quotes[venueId];
    },
    [quotes]
  );

  const getEffectivePricing = useCallback(
    (
      venue: VenueOption,
      guestCount: number,
      eventFormat: EventPackageFormat = 'all_day'
    ): EffectiveVenuePricingResult => {
      const userQuote = quotes[venue.id];
      return calculateEffectiveVenuePricing(venue, userQuote, guestCount, eventFormat);
    },
    [quotes]
  );

  return {
    quotes,
    getQuote,
    saveQuote,
    deleteQuote,
    getEffectivePricing,
    loading,
  };
}
