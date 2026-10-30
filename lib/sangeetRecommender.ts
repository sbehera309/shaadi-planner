import {
  SangeetVenueOption,
  SangeetTriangulationMetrics,
  RankedSangeetVenue,
  FamilyAddressInput,
  VenueOption,
} from './types';
import {
  estimateDrivingDistanceAndMinutes,
  getCoordinates,
} from './venueRouteOptimizer';
import { PRELOADED_SANGEET_VENUES } from './preloadedSangeetVenues';

export type SangeetAnchorMode = 'groom_bride_only' | 'three_way';

export interface TriangulationAnchorInput {
  groomLocation: {
    city?: string;
    state?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    label?: string;
  };
  brideLocation: {
    city?: string;
    state?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    label?: string;
  };
  mainVenue?: {
    name?: string;
    city?: string;
    state?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  guestCount?: number;
  sangeetVenues?: SangeetVenueOption[];
  anchorMode?: SangeetAnchorMode;
}

export type SangeetSortOption =
  | 'triangulation'
  | 'fairness'
  | 'cost_asc'
  | 'groom_closest'
  | 'bride_closest'
  | 'main_venue_closest'
  | 'capacity_desc';

/**
 * Calculates driving triangulation metrics from:
 * Mode A ('three_way'): Groom's Home + Bride's Home + Confirmed Main Wedding Venue
 * Mode B ('groom_bride_only'): Groom's Home + Bride's Home (family 2-way midpoint only)
 */
export function calculateSangeetTriangulationMetrics(
  venue: SangeetVenueOption,
  groomCoords: { lat: number; lon: number },
  brideCoords: { lat: number; lon: number },
  mainCoords?: { lat: number; lon: number } | null,
  mainVenueName?: string,
  anchorMode: SangeetAnchorMode = 'three_way'
): SangeetTriangulationMetrics {
  const isGroomBrideOnly = anchorMode === 'groom_bride_only';

  const groomDrive = estimateDrivingDistanceAndMinutes(
    groomCoords.lat,
    groomCoords.lon,
    venue.latitude,
    venue.longitude
  );

  const brideDrive = estimateDrivingDistanceAndMinutes(
    brideCoords.lat,
    brideCoords.lon,
    venue.latitude,
    venue.longitude
  );

  const mainVenueDrive = mainCoords
    ? estimateDrivingDistanceAndMinutes(
        mainCoords.lat,
        mainCoords.lon,
        venue.latitude,
        venue.longitude
      )
    : { distanceMiles: 0, durationMinutes: 0 };

  const travelDeltaMinutes = Math.abs(groomDrive.durationMinutes - brideDrive.durationMinutes);

  // Fairness Score (0 to 100): 100 is identical drive time from both family homes
  let fairnessScore = Math.max(20, Math.round(100 - travelDeltaMinutes * 1.35));
  if (travelDeltaMinutes <= 5) fairnessScore = 99;
  else if (travelDeltaMinutes <= 10) fairnessScore = 95;
  else if (travelDeltaMinutes <= 18) fairnessScore = 90;
  else if (travelDeltaMinutes <= 28) fairnessScore = 82;

  // Convenience Score (0 to 100):
  let convenienceScore = 50;
  if (isGroomBrideOnly) {
    // In Groom & Bride Only mode, convenience reflects low average drive time for both families
    const avgDrive = (groomDrive.durationMinutes + brideDrive.durationMinutes) / 2;
    if (avgDrive <= 30) {
      convenienceScore = 98;
    } else if (avgDrive <= 45) {
      convenienceScore = 90;
    } else if (avgDrive <= 60) {
      convenienceScore = 80;
    } else if (avgDrive <= 80) {
      convenienceScore = 68;
    } else {
      convenienceScore = 52;
    }
  } else {
    // In 3-way mode, based on travel time from the confirmed Main Venue's hotel block
    if (mainVenueDrive.durationMinutes <= 20) {
      convenienceScore = 98;
    } else if (mainVenueDrive.durationMinutes <= 35) {
      convenienceScore = 88;
    } else if (mainVenueDrive.durationMinutes <= 50) {
      convenienceScore = 76;
    } else if (mainVenueDrive.durationMinutes <= 75) {
      convenienceScore = 64;
    }
  }

  // Composite Triangulation / Match Score:
  const desiFeatureBonus =
    (venue.desiFeatures.largeDanceFloor ? 5 : 0) +
    (venue.desiFeatures.stageAvLighting ? 5 : 0) +
    (venue.desiFeatures.allowsLiveChaat ? 5 : 0) +
    (venue.desiFeatures.hotelOnSite ? 5 : 0) +
    (venue.pricePerGuest <= 55 ? 5 : 0);

  let rawTriangulation = 0;
  if (isGroomBrideOnly) {
    // 55% Groom-Bride Equity + 25% Proximity (Low combined drive) + 20% Venue Desi Features & Value
    rawTriangulation =
      fairnessScore * 0.55 + convenienceScore * 0.25 + (70 + desiFeatureBonus) * 0.20;
  } else {
    // 42% Groom-Bride Equity + 33% Proximity to Main Venue / Hotel block + 25% Venue Desi Features
    rawTriangulation =
      fairnessScore * 0.42 + convenienceScore * 0.33 + (70 + desiFeatureBonus) * 0.25;
  }
  const triangulationScore = Math.min(99, Math.max(35, Math.round(rawTriangulation)));

  const isNearMainVenueHotelBlock = !isGroomBrideOnly && mainVenueDrive.durationMinutes <= 30;

  // Generate clear human-friendly verdict
  let fairnessVerdict = '';
  const mainName = mainVenueName || 'Main Wedding Venue';

  if (isGroomBrideOnly) {
    if (travelDeltaMinutes <= 8) {
      fairnessVerdict = `⚖️ Ideal Family Midpoint: Only ${travelDeltaMinutes}m drive difference (~${groomDrive.durationMinutes}m for Groom vs ~${brideDrive.durationMinutes}m for Bride). Perfect equity!`;
    } else if (travelDeltaMinutes <= 18) {
      fairnessVerdict = `⚖️ Well-Balanced Midpoint: ~${groomDrive.durationMinutes}m for Groom vs ~${brideDrive.durationMinutes}m for Bride (${travelDeltaMinutes}m delta). Great central meeting point.`;
    } else if (groomDrive.durationMinutes < brideDrive.durationMinutes) {
      fairnessVerdict = `🤵 Skews closer to Groom’s family (~${groomDrive.durationMinutes}m drive vs ~${brideDrive.durationMinutes}m for Bride side).`;
    } else {
      fairnessVerdict = `👰 Skews closer to Bride’s family (~${brideDrive.durationMinutes}m drive vs ~${groomDrive.durationMinutes}m for Groom side).`;
    }
  } else {
    if (travelDeltaMinutes <= 15 && isNearMainVenueHotelBlock) {
      fairnessVerdict = `✨ Optimal Triangulation: Only ${travelDeltaMinutes}m travel difference between families, and ~${mainVenueDrive.durationMinutes}m from ${mainName} hotel block!`;
    } else if (travelDeltaMinutes <= 15) {
      fairnessVerdict = `⚖️ High Family Equity: Nearly balanced drive time (${groomDrive.durationMinutes}m for Groom vs ${brideDrive.durationMinutes}m for Bride).`;
    } else if (isNearMainVenueHotelBlock && groomDrive.durationMinutes < brideDrive.durationMinutes) {
      fairnessVerdict = `🏛️ Ultra-convenient to ${mainName} (${mainVenueDrive.durationMinutes}m) and closer to Groom side (${groomDrive.durationMinutes}m vs ${brideDrive.durationMinutes}m).`;
    } else if (isNearMainVenueHotelBlock && brideDrive.durationMinutes < groomDrive.durationMinutes) {
      fairnessVerdict = `🏛️ Ultra-convenient to ${mainName} (${mainVenueDrive.durationMinutes}m) and closer to Bride side (${brideDrive.durationMinutes}m vs ${groomDrive.durationMinutes}m).`;
    } else if (brideDrive.durationMinutes < 30) {
      fairnessVerdict = `👰 Highly accessible for Bride’s local circle (~${brideDrive.durationMinutes}m drive), ~${groomDrive.durationMinutes}m from Groom.`;
    } else if (groomDrive.durationMinutes < 30) {
      fairnessVerdict = `🤵 Highly accessible for Groom’s local circle (~${groomDrive.durationMinutes}m drive), ~${brideDrive.durationMinutes}m from Bride.`;
    } else {
      fairnessVerdict = `📍 Regional hub: ~${groomDrive.durationMinutes}m from Groom, ~${brideDrive.durationMinutes}m from Bride, ~${mainVenueDrive.durationMinutes}m from ${mainName}.`;
    }
  }

  return {
    groomDistanceMiles: groomDrive.distanceMiles,
    groomDriveMinutes: groomDrive.durationMinutes,
    brideDistanceMiles: brideDrive.distanceMiles,
    brideDriveMinutes: brideDrive.durationMinutes,
    mainVenueDistanceMiles: mainVenueDrive.distanceMiles,
    mainVenueDriveMinutes: mainVenueDrive.durationMinutes,
    fairnessScore,
    convenienceScore,
    triangulationScore,
    fairnessVerdict,
    isNearMainVenueHotelBlock,
    travelDeltaMinutes,
  };
}

/**
 * Ranks and filters Sangeet venues based on 3-way triangulation, guest count, and family anchor points
 */
export function rankSangeetVenues(
  input: TriangulationAnchorInput,
  sortOption: SangeetSortOption = 'triangulation',
  filters?: {
    state?: 'ALL' | 'NJ' | 'PA';
    hotelOnSiteOnly?: boolean;
    liveChaatOnly?: boolean;
    maxBudgetTotal?: number;
    searchQuery?: string;
  }
): RankedSangeetVenue[] {
  const venues = input.sangeetVenues || PRELOADED_SANGEET_VENUES;
  const guestCount = input.guestCount || 250;
  const anchorMode = input.anchorMode || 'three_way';

  // 1. Resolve Anchor Coordinates
  const groomCoords = getCoordinates(
    input.groomLocation.address || '',
    input.groomLocation.city || '',
    input.groomLocation.state || '',
    input.groomLocation.latitude,
    input.groomLocation.longitude
  );

  const brideCoords = getCoordinates(
    input.brideLocation.address || '',
    input.brideLocation.city || '',
    input.brideLocation.state || '',
    input.brideLocation.latitude,
    input.brideLocation.longitude
  );

  // If in 3-way mode and main venue is not specified, default to Central NJ hub coordinates (Edison)
  const mainCoords =
    anchorMode === 'groom_bride_only'
      ? (input.mainVenue
          ? getCoordinates(
              input.mainVenue.address || '',
              input.mainVenue.city || '',
              input.mainVenue.state || '',
              input.mainVenue.latitude,
              input.mainVenue.longitude
            )
          : null)
      : input.mainVenue
      ? getCoordinates(
          input.mainVenue.address || '',
          input.mainVenue.city || '',
          input.mainVenue.state || '',
          input.mainVenue.latitude,
          input.mainVenue.longitude
        )
      : { lat: 40.5187, lon: -74.4121 };

  // 2. Compute metrics for each venue
  const ranked: RankedSangeetVenue[] = venues.map((v) => {
    const metrics = calculateSangeetTriangulationMetrics(
      v,
      groomCoords,
      brideCoords,
      mainCoords,
      input.mainVenue?.name,
      anchorMode
    );

    const totalCostForGuests = v.hallRentalFee + guestCount * v.pricePerGuest;

    return {
      venue: v,
      metrics,
      totalCostForGuests,
      costPerGuest: v.pricePerGuest,
    };
  });

  // 3. Filter
  let filtered = ranked.filter((item) => {
    if (filters?.state && filters.state !== 'ALL' && item.venue.state !== filters.state) {
      return false;
    }
    if (filters?.hotelOnSiteOnly && !item.venue.desiFeatures.hotelOnSite) {
      return false;
    }
    if (filters?.liveChaatOnly && !item.venue.desiFeatures.allowsLiveChaat) {
      return false;
    }
    if (filters?.maxBudgetTotal && item.totalCostForGuests > filters.maxBudgetTotal) {
      return false;
    }
    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase();
      const matchName = item.venue.name.toLowerCase().includes(q);
      const matchCity = item.venue.city.toLowerCase().includes(q);
      const matchTag = item.venue.highlightTag.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchTag) return false;
    }
    return true;
  });

  // 4. Sort
  filtered.sort((a, b) => {
    switch (sortOption) {
      case 'triangulation':
        return b.metrics.triangulationScore - a.metrics.triangulationScore;
      case 'fairness':
        return a.metrics.travelDeltaMinutes - b.metrics.travelDeltaMinutes;
      case 'cost_asc':
        return a.totalCostForGuests - b.totalCostForGuests;
      case 'groom_closest':
        return a.metrics.groomDriveMinutes - b.metrics.groomDriveMinutes;
      case 'bride_closest':
        return a.metrics.brideDriveMinutes - b.metrics.brideDriveMinutes;
      case 'main_venue_closest':
        return a.metrics.mainVenueDriveMinutes - b.metrics.mainVenueDriveMinutes;
      case 'capacity_desc':
        return b.venue.maxCapacity - a.venue.maxCapacity;
      default:
        return b.metrics.triangulationScore - a.metrics.triangulationScore;
    }
  });

  return filtered;
}

/**
 * Formats top triangulated Sangeet recommendations into a WhatsApp brief to share with family
 */
export function formatSangeetBriefForWhatsApp(
  rankedVenues: RankedSangeetVenue[],
  groomLabel = "Groom's Family",
  brideLabel = "Bride's Family",
  mainVenueName = 'Main Wedding Venue',
  guestCount = 250,
  anchorMode: SangeetAnchorMode = 'three_way'
): string {
  const topChoices = rankedVenues.slice(0, 4);
  const isGroomBrideOnly = anchorMode === 'groom_bride_only';

  const lines = [
    isGroomBrideOnly
      ? `💃 *Sangeet & Garba Venue Report (Groom & Bride Midpoint)* 🪘`
      : `💃 *Sangeet & Garba Venue Triangulation Report* 🪘`,
    `------------------------------------------------`,
    `📍 *Anchor Locations Considered:*`,
    `• 🤵 Groom's Side: ${groomLabel}`,
    `• 👰 Bride's Side: ${brideLabel}`,
  ];

  if (isGroomBrideOnly) {
    lines.push(`• ℹ️ Mode: Focused strictly on family midpoint balance between Groom & Bride`);
  } else {
    lines.push(`• 🏛️ Main Wedding Venue: ${mainVenueName}`);
  }

  lines.push(
    `👥 *Guest Count Assumption:* ${guestCount} guests`,
    ``,
    `⭐ *Top Recommended Venues:*`
  );

  topChoices.forEach((rv, i) => {
    const v = rv.venue;
    const m = rv.metrics;
    const estTotalStr = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(rv.totalCostForGuests);

    const driveLines = [
      `   • Groom: ~${m.groomDriveMinutes}m (${m.groomDistanceMiles} mi)`,
      `   • Bride: ~${m.brideDriveMinutes}m (${m.brideDistanceMiles} mi)`,
    ];
    if (!isGroomBrideOnly && m.mainVenueDriveMinutes > 0) {
      driveLines.push(
        `   • Main Venue Hotel Block: ~${m.mainVenueDriveMinutes}m (${m.mainVenueDistanceMiles} mi)`
      );
    }

    lines.push(
      `${i + 1}️⃣ *${v.name}* (${v.city}, ${v.state})`,
      `   ${v.highlightTag}`,
      `   ⏱️ *Drive Times:*`,
      ...driveLines,
      `   ⚖️ *Equity Score:* ${m.fairnessScore}% (${m.travelDeltaMinutes}m drive delta)`,
      `   💰 *Cost:* ~$${v.pricePerGuest}/guest • ${estTotalStr} package est.`,
      `   🎵 *Dance Floor & AV:* ${v.desiFeatures.largeDanceFloor ? 'Yes' : 'No'} • Curfew: ${v.desiFeatures.soundCurfew}`,
      `   ${v.contactPhone ? `📞 Contact: ${v.contactPhone}` : ''}`,
      ``
    );
  });

  lines.push(
    `💡 *Key Advantage:* Sangeet venues range $48–$65/guest vs $180–$250/guest for wedding estates, saving $25k–$40k while offering larger dance floors and late-night curfews!`,
    `------------------------------------------------`,
    `_Generated by ShaadiPlanner Triangulation Engine_`
  );

  return lines.join('\n');
}
