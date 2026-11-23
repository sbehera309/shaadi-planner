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
  const {
    wedding,
    budgetItems,
    vendors,
    venues,
    updateWeddingProfile,
    scenarioSelection,
    updateScenarioSelection,
  } = useWedding();
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

  // Selected venue for scenario — backed by Firebase-synced WeddingContext (works across laptop + mobile!)
  const selectedVenueId = useMemo<string | null>(() => {
    const saved = scenarioSelection?.selectedVenueId;
    if (saved === EXCLUDE_VENUE_SENTINEL) {
      return null;
    }
    if (saved && candidateVenues.some((v) => v.id === saved)) {
      return saved;
    }

    // If venue is ALREADY committed in budget ledger, default to excluding it from shortlist estimate (no double-counting!)
    if (hasCommittedVenueBudget) {
      return null;
    }

    // Otherwise default to official venue or first shortlisted
    const official = candidateVenues.find((v) => v.isSelectedOfficialVenue || v.tourStatus === 'selected');
    if (official) return official.id;
    if (candidateVenues.length > 0) return candidateVenues[0].id;
    return null;
  }, [scenarioSelection?.selectedVenueId, candidateVenues, hasCommittedVenueBudget]);

  const setSelectedVenueId = useCallback(
    (id: string | null) => {
      updateScenarioSelection({ selectedVenueId: id ? id : EXCLUDE_VENUE_SENTINEL });
    },
    [updateScenarioSelection]
  );

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

  // Included vendors in scenario — backed by Firebase-synced WeddingContext
  const includedVendorIds = useMemo<string[]>(() => {
    if (Array.isArray(scenarioSelection?.includedVendorIds)) {
      return scenarioSelection.includedVendorIds;
    }
    return shortlistedVendorsRaw.map((v) => v.id);
  }, [scenarioSelection?.includedVendorIds, shortlistedVendorsRaw]);

  const toggleVendorInclusion = useCallback(
    (vendorId: string) => {
      const next = includedVendorIds.includes(vendorId)
        ? includedVendorIds.filter((id) => id !== vendorId)
        : [...includedVendorIds, vendorId];
      updateScenarioSelection({ includedVendorIds: next });
    },
    [includedVendorIds, updateScenarioSelection]
  );

  const selectAllVendors = useCallback(() => {
    updateScenarioSelection({ includedVendorIds: shortlistedVendorsRaw.map((v) => v.id) });
  }, [shortlistedVendorsRaw, updateScenarioSelection]);

  const deselectAllVendors = useCallback(() => {
    updateScenarioSelection({ includedVendorIds: [] });
  }, [updateScenarioSelection]);

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
