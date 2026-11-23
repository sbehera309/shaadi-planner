'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useWedding } from './store';
import { useUserVenueQuotes } from './useUserVenueQuotes';
import { PRELOADED_CURATED_VENDORS } from './preloadedVendors';
import { PRELOADED_CURATED_VENUES } from './preloadedVenues';
import { VenueOption, Vendor, CuratedVendor } from './types';

const STORAGE_KEY_VENUE = 'shaadi_scenario_selected_venue_id';
const STORAGE_KEY_VENDORS = 'shaadi_scenario_included_vendors';
const SCENARIO_SYNC_EVENT = 'shaadi_shortlist_scenario_changed';
const EXCLUDE_VENUE_SENTINEL = '__NONE__';

export interface ShortlistedVenueItem {
  venue: VenueOption;
  estimatedCost: number;
  isSelected: boolean;
  pricingLabel: string;
}

export interface ShortlistedVendorItem {
  vendor: Vendor;
  curatedMatch?: CuratedVendor;
  estimatedCost: number;
  isIncluded: boolean;
  rateBasis: string;
}

export function useShortlistBudget() {
  const { wedding, budgetItems, vendors, venues, updateWeddingProfile } = useWedding();
  const { getEffectivePricing } = useUserVenueQuotes();

  const guestCount = wedding?.guestCount || 250;
  const targetBudget = wedding?.targetBudget || 0;
  const currencySymbol = wedding?.currency === 'INR' ? '₹' : '$';

  // 1. Identify all shortlisted venues (deduplicated by ID and normalized name)
  const candidateVenues = useMemo<VenueOption[]>(() => {
    const list: VenueOption[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    // From user's venues store
    venues.forEach((v) => {
      const normName = v.name.toLowerCase().trim();
      if (
        (v.tourStatus === 'shortlisted' ||
          v.isFavorite ||
          v.tourStatus === 'selected' ||
          v.isSelectedOfficialVenue) &&
        !seenIds.has(v.id) &&
        !seenNames.has(normName)
      ) {
        list.push(v);
        seenIds.add(v.id);
        seenNames.add(normName);
      }
    });

    // Check if official venue name in profile matches a curated venue not yet added
    if (wedding?.venueName) {
      const match = PRELOADED_CURATED_VENUES.find(
        (cv) =>
          !seenIds.has(cv.id) &&
          !seenNames.has(cv.name.toLowerCase().trim()) &&
          wedding.venueName.toLowerCase().includes(cv.name.toLowerCase().split('&')[0].trim())
      );
      if (match) {
        list.push(match);
        seenIds.add(match.id);
        seenNames.add(match.name.toLowerCase().trim());
      }
    }

    return list;
  }, [venues, wedding?.venueName]);

  // Detect whether a venue contract is already committed in the Budget ledger (to avoid double-counting!)
  const hasCommittedVenueBudget = useMemo(() => {
    return budgetItems.some(
      (b) => b.category === 'Venue & Catering' && (b.actualCost > 0 || b.estimatedCost > 0)
    );
  }, [budgetItems]);

  // Selected venue for scenario
  const [selectedVenueId, setSelectedVenueIdState] = useState<string | null>(null);

  const readVenueSelectionFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VENUE);
      if (saved === EXCLUDE_VENUE_SENTINEL) {
        setSelectedVenueIdState(null);
        return;
      }
      if (saved && candidateVenues.some((v) => v.id === saved)) {
        setSelectedVenueIdState(saved);
        return;
      }
    } catch {}

    // If venue is ALREADY committed in budget ledger, default to excluding it from shortlist estimate (no double-counting!)
    if (hasCommittedVenueBudget) {
      setSelectedVenueIdState(null);
      return;
    }

    // Otherwise default to official venue or first shortlisted
    const official = candidateVenues.find((v) => v.isSelectedOfficialVenue || v.tourStatus === 'selected');
    if (official) {
      setSelectedVenueIdState(official.id);
    } else if (candidateVenues.length > 0) {
      setSelectedVenueIdState(candidateVenues[0].id);
    } else {
      setSelectedVenueIdState(null);
    }
  }, [candidateVenues, hasCommittedVenueBudget]);

  // Initialize selected venue from storage or smart default
  useEffect(() => {
    readVenueSelectionFromStorage();
  }, [readVenueSelectionFromStorage]);

  const setSelectedVenueId = useCallback((id: string | null) => {
    setSelectedVenueIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY_VENUE, id ? id : EXCLUDE_VENUE_SENTINEL);
      window.dispatchEvent(new Event(SCENARIO_SYNC_EVENT));
    } catch {}
  }, []);

  // Shortlisted venues with resolved costs (prefer user's agreed contract amount when set)
  const shortlistedVenuesList = useMemo<ShortlistedVenueItem[]>(() => {
    return candidateVenues.map((venue) => {
      const effective = getEffectivePricing(venue, guestCount, 'all_day');
      const estimatedCost =
        (venue.contractAgreedAmount && venue.contractAgreedAmount > 0
          ? venue.contractAgreedAmount
          : effective.estimatedTotalCost || venue.pricing.estimatedTotalCost) || 0;
      return {
        venue,
        estimatedCost,
        isSelected: venue.id === selectedVenueId,
        pricingLabel:
          venue.contractAgreedAmount && venue.contractAgreedAmount > 0
            ? `Contract total: $${venue.contractAgreedAmount.toLocaleString()}`
            : effective.breakdownSummary || `$${estimatedCost.toLocaleString()} estimated`,
      };
    });
  }, [candidateVenues, selectedVenueId, getEffectivePricing, guestCount]);

  // Active selected venue
  const selectedVenueItem = useMemo(() => {
    return shortlistedVenuesList.find((item) => item.isSelected) || null;
  }, [shortlistedVenuesList]);

  const shortlistVenueCost = selectedVenueItem ? selectedVenueItem.estimatedCost : 0;

  // 2. Identify all shortlisted vendors
  const shortlistedVendorsRaw = useMemo(() => {
    return vendors.filter((v) => v.status === 'shortlisted');
  }, [vendors]);

  // Included vendors in scenario
  const [includedVendorIds, setIncludedVendorIds] = useState<string[]>([]);
  const [initializedVendors, setInitializedVendors] = useState(false);

  const readVendorSelectionFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VENDORS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setIncludedVendorIds(parsed);
          setInitializedVendors(true);
          return;
        }
      }
    } catch {}

    // Default: include all shortlisted vendors
    setIncludedVendorIds(shortlistedVendorsRaw.map((v) => v.id));
    setInitializedVendors(true);
  }, [shortlistedVendorsRaw]);

  useEffect(() => {
    readVendorSelectionFromStorage();
  }, [readVendorSelectionFromStorage]);

  // Listen for cross-component scenario updates (so Navbar, Budget page & Modal stay 100% synced in real time)
  useEffect(() => {
    const handleSync = () => {
      readVenueSelectionFromStorage();
      readVendorSelectionFromStorage();
    };
    window.addEventListener(SCENARIO_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(SCENARIO_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [readVenueSelectionFromStorage, readVendorSelectionFromStorage]);

  const toggleVendorInclusion = useCallback((vendorId: string) => {
    setIncludedVendorIds((prev) => {
      const next = prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId];
      try {
        localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(next));
        window.dispatchEvent(new Event(SCENARIO_SYNC_EVENT));
      } catch {}
      return next;
    });
  }, []);

  const selectAllVendors = useCallback(() => {
    const allIds = shortlistedVendorsRaw.map((v) => v.id);
    setIncludedVendorIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(allIds));
      window.dispatchEvent(new Event(SCENARIO_SYNC_EVENT));
    } catch {}
  }, [shortlistedVendorsRaw]);

  const deselectAllVendors = useCallback(() => {
    setIncludedVendorIds([]);
    try {
      localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify([]));
      window.dispatchEvent(new Event(SCENARIO_SYNC_EVENT));
    } catch {}
  }, []);

  // Shortlisted vendors with resolved candidate costs
  const shortlistedVendorsList = useMemo<ShortlistedVendorItem[]>(() => {
    const categoryFallbacks: Record<string, number> = {
      'Pandit Ji': 2100,
      'Mehendi Artist': 1500,
      'Bridal MUA & Hair': 2500,
      'Photographer & Cinematographer': 12000,
      'Choreographer & DJ': 7500,
      'Mandap & Floral Decorator': 18000,
      'Catering': 25000,
      'Trousseau / Attire': 5000,
      'Lighting & AV Production': 5000,
      'Baraat & Farewell Transport': 2000,
      'Live Musicians (Nathswaram/Shehnai)': 2500,
      'Wedding Planner & Coordinator': 8000,
    };

    return shortlistedVendorsRaw.map((vendor) => {
      const curatedMatch = PRELOADED_CURATED_VENDORS.find(
        (c) =>
          c.id === vendor.curatedVendorId ||
          c.name.toLowerCase() === vendor.name.toLowerCase()
      );

      let estimatedCost = 0;
      let rateBasis = '';

      if (vendor.agreedAmount > 0) {
        estimatedCost = vendor.agreedAmount;
        rateBasis = 'Custom quote';
      } else if (curatedMatch) {
        if (curatedMatch.priceUnit === 'per_guest') {
          estimatedCost = (curatedMatch.typicalPackagePrice || curatedMatch.priceStartingAt) * guestCount;
          rateBasis = `$${curatedMatch.typicalPackagePrice || curatedMatch.priceStartingAt}/guest (${guestCount} guests)`;
        } else {
          estimatedCost = curatedMatch.typicalPackagePrice || curatedMatch.priceStartingAt;
          rateBasis = `Curated historical package (${curatedMatch.priceTier})`;
        }
      } else {
        estimatedCost = categoryFallbacks[vendor.category] || 3500;
        rateBasis = 'Category benchmark estimate';
      }

      return {
        vendor,
        curatedMatch,
        estimatedCost,
        isIncluded: includedVendorIds.includes(vendor.id),
        rateBasis,
      };
    });
  }, [shortlistedVendorsRaw, includedVendorIds, guestCount]);

  const shortlistVendorsCost = useMemo(() => {
    return shortlistedVendorsList
      .filter((item) => item.isIncluded)
      .reduce((sum, item) => sum + item.estimatedCost, 0);
  }, [shortlistedVendorsList]);

  // 3. Committed costs
  const committedCost = useMemo(() => {
    // Budget items ledger
    const budgetItemsTotal = budgetItems.reduce((acc, b) => acc + (b.actualCost || b.estimatedCost || 0), 0);

    // Booked vendors not duplicated in budget items
    const bookedVendors = vendors.filter((v) => v.status !== 'shortlisted' && v.agreedAmount > 0);
    const unbudgetedVendorsTotal = bookedVendors
      .filter((v) => !budgetItems.some((b) => b.title.toLowerCase().includes(v.name.toLowerCase())))
      .reduce((acc, v) => acc + v.agreedAmount, 0);

    return budgetItemsTotal + unbudgetedVendorsTotal;
  }, [budgetItems, vendors]);

  // 4. Totals and Remaining Budget
  const totalShortlistCost = shortlistVenueCost + shortlistVendorsCost;
  const totalProjectedCost = committedCost + totalShortlistCost;
  const remainingBudget = targetBudget - totalProjectedCost;

  const percentUsed = targetBudget > 0 ? Math.min(100, Math.round((totalProjectedCost / targetBudget) * 100)) : 0;
  const isOverBudget = remainingBudget < 0;
  const isCloseToBudget = remainingBudget >= 0 && remainingBudget < targetBudget * 0.1;

  // 5. Update Target Budget helper
  const setTargetBudget = useCallback(
    (amount: number) => {
      updateWeddingProfile({ targetBudget: Math.max(0, amount) });
    },
    [updateWeddingProfile]
  );

  return {
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
    candidateVenuesCount: candidateVenues.length,
    shortlistedVendorsCount: shortlistedVendorsRaw.length,
    includedVendorsCount: shortlistedVendorsList.filter((i) => i.isIncluded).length,
    shortlistedVenuesList,
    shortlistedVendorsList,
    selectedVenueId,
    selectedVenueItem,
    setSelectedVenueId,
    toggleVendorInclusion,
    selectAllVendors,
    deselectAllVendors,
    setTargetBudget,
  };
}
