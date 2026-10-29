import {
  VenueOption,
  FamilyAddressInput,
  ScheduledTourStop,
  SiteTourDayPlan,
} from './types';

// Known coordinates for common wedding hub cities & metro areas
const KNOWN_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // New Jersey & New York Metro
  'jersey city, nj': { lat: 40.7178, lon: -74.0431 },
  'jersey city': { lat: 40.7178, lon: -74.0431 },
  'edison, nj': { lat: 40.5187, lon: -74.4121 },
  'edison': { lat: 40.5187, lon: -74.4121 },
  'pompton plains, nj': { lat: 40.9701, lon: -74.2982 },
  'pompton plains': { lat: 40.9701, lon: -74.2982 },
  'morristown, nj': { lat: 40.7968, lon: -74.4815 },
  'morristown': { lat: 40.7968, lon: -74.4815 },
  'new york, ny': { lat: 40.7128, lon: -74.006 },
  'new york': { lat: 40.7128, lon: -74.006 },
  'newark, nj': { lat: 40.7357, lon: -74.1724 },
  'princeton, nj': { lat: 40.3573, lon: -74.6672 },
  'somerset, nj': { lat: 40.4976, lon: -74.4893 },
  'parsippany, nj': { lat: 40.8653, lon: -74.4174 },
  'woodbridge, nj': { lat: 40.5576, lon: -74.2846 },
  'mahwah, nj': { lat: 41.0887, lon: -74.1438 },
  'rockleigh, nj': { lat: 41.0025, lon: -73.9392 },
  'shrewsbury, nj': { lat: 40.3204, lon: -74.0626 },
  'livingston, nj': { lat: 40.7891, lon: -74.3418 },
  'randolph, nj': { lat: 40.8653, lon: -74.5517 },
  'east brunswick, nj': { lat: 40.4072, lon: -74.3989 },
  'florham park, nj': { lat: 40.7937, lon: -74.4098 },
  'voorhees, nj': { lat: 39.8658, lon: -74.9818 },
  'berlin, nj': { lat: 39.7915, lon: -74.9385 },
  'cinnaminson, nj': { lat: 39.9984, lon: -75.0326 },
  'aberdeen, nj': { lat: 40.4354, lon: -74.2057 },
  'garfield, nj': { lat: 40.8787, lon: -74.1132 },
  'west orange, nj': { lat: 40.8123, lon: -74.2694 },
  'belleville, nj': { lat: 40.7937, lon: -74.1504 },
  'whippany, nj': { lat: 40.8243, lon: -74.4035 },
  'new brunswick, nj': { lat: 40.4862, lon: -74.4518 },
  'river vale, nj': { lat: 41.0116, lon: -74.0093 },
  'woodcliff lake, nj': { lat: 41.0268, lon: -74.0538 },
  'stamford, ct': { lat: 41.0534, lon: -73.5387 },
  'long island, ny': { lat: 40.7891, lon: -73.135 },
  'philadelphia, pa': { lat: 39.9526, lon: -75.1652 },
  'center city, philadelphia': { lat: 39.9515, lon: -75.1645 },
  'king of prussia, pa': { lat: 40.0931, lon: -75.4057 },

  // Other Major Desi Wedding Metros
  'chicago, il': { lat: 41.8781, lon: -87.6298 },
  'schaumburg, il': { lat: 42.0334, lon: -88.0834 },
  'oak brook, il': { lat: 41.8328, lon: -87.9545 },
  'dallas, tx': { lat: 32.7767, lon: -96.797 },
  'plano, tx': { lat: 33.0198, lon: -96.6989 },
  'frisco, tx': { lat: 33.1507, lon: -96.8236 },
  'irving, tx': { lat: 32.814, lon: -96.9489 },
  'houston, tx': { lat: 29.7604, lon: -95.3698 },
  'sugar land, tx': { lat: 29.6197, lon: -95.6349 },
  'atlanta, ga': { lat: 33.749, lon: -84.388 },
  'alpharetta, ga': { lat: 34.0754, lon: -84.2941 },
  'duluth, ga': { lat: 34.0029, lon: -84.1446 },
  'san jose, ca': { lat: 37.3382, lon: -121.8863 },
  'fremont, ca': { lat: 37.5485, lon: -121.9886 },
  'san francisco, ca': { lat: 37.7749, lon: -122.4194 },
  'los angeles, ca': { lat: 34.0522, lon: -118.2437 },
  'anaheim, ca': { lat: 33.8366, lon: -117.9143 },
  'orlando, fl': { lat: 28.5383, lon: -81.3792 },
  'washington, dc': { lat: 38.9072, lon: -77.0369 },
  'tysons, va': { lat: 38.9187, lon: -77.2311 },
  'chantilly, va': { lat: 38.8943, lon: -77.4311 },
};

/**
 * Standard Haversine formula to compute great-circle distance between two GPS coordinates in miles
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves or approximates GPS coordinates from address strings
 */
export function getCoordinates(
  address: string,
  city: string,
  state: string,
  explicitLat?: number,
  explicitLon?: number
): { lat: number; lon: number } {
  if (explicitLat !== undefined && explicitLon !== undefined && explicitLat !== 0) {
    return { lat: explicitLat, lon: explicitLon };
  }

  const normalizedCity = `${city.trim().toLowerCase()}, ${state.trim().toLowerCase()}`;
  if (KNOWN_COORDINATES[normalizedCity]) {
    return KNOWN_COORDINATES[normalizedCity];
  }

  const justCity = city.trim().toLowerCase();
  if (KNOWN_COORDINATES[justCity]) {
    return KNOWN_COORDINATES[justCity];
  }

  // Check if any known city key is a substring in address or city
  const fullText = `${address} ${city} ${state}`.toLowerCase();
  for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
    if (fullText.includes(key)) {
      return coords;
    }
  }

  // Fallback: pseudo-deterministic coordinate based on string hash around NJ/NY baseline
  let hash = 0;
  for (let i = 0; i < fullText.length; i++) {
    hash = (hash << 5) - hash + fullText.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = (Math.abs(hash % 1000) / 1000) * 0.4 - 0.2;
  const lonOffset = (Math.abs((hash >> 3) % 1000) / 1000) * 0.4 - 0.2;

  return {
    lat: 40.7128 + latOffset,
    lon: -74.006 + lonOffset,
  };
}

/**
 * Estimates realistic road driving distance and driving time with traffic buffers
 */
export function estimateDrivingDistanceAndMinutes(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): { distanceMiles: number; durationMinutes: number } {
  const straightLine = calculateHaversineDistance(fromLat, fromLon, toLat, toLon);
  // Suburban/Metro road circuity factor (~1.35x straight line)
  const roadMiles = Math.max(1.5, Math.round(straightLine * 1.35 * 10) / 10);

  // Realistic driving speed (approx 28-35 mph average in suburban traffic + 4 min base for lights/parking)
  const drivingMinutes = Math.max(10, Math.round(roadMiles * 2.2 + 4));

  return {
    distanceMiles: roadMiles,
    durationMinutes: drivingMinutes,
  };
}

/**
 * Computes all permutations of an array
 */
function permute<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const subPerms = permute(remaining);
    for (const sub of subPerms) {
      result.push([current, ...sub]);
    }
  }
  return result;
}

/**
 * Finds the optimal touring order that minimizes total driving time/distance
 */
export function findOptimalTourOrder(
  startLocation: FamilyAddressInput,
  venues: VenueOption[]
): {
  orderedVenues: VenueOption[];
  totalDistanceMiles: number;
  totalDrivingMinutes: number;
  legMetrics: Array<{ distanceMiles: number; durationMinutes: number }>;
} {
  if (venues.length <= 1) {
    const startCoord = getCoordinates(
      startLocation.address,
      startLocation.city,
      startLocation.state,
      startLocation.latitude,
      startLocation.longitude
    );
    if (venues.length === 1) {
      const v = venues[0];
      const vCoord = getCoordinates(v.address, v.city, v.state, v.latitude, v.longitude);
      const leg = estimateDrivingDistanceAndMinutes(
        startCoord.lat,
        startCoord.lon,
        vCoord.lat,
        vCoord.lon
      );
      return {
        orderedVenues: venues,
        totalDistanceMiles: leg.distanceMiles,
        totalDrivingMinutes: leg.durationMinutes,
        legMetrics: [leg],
      };
    }
    return {
      orderedVenues: [],
      totalDistanceMiles: 0,
      totalDrivingMinutes: 0,
      legMetrics: [],
    };
  }

  const startCoord = getCoordinates(
    startLocation.address,
    startLocation.city,
    startLocation.state,
    startLocation.latitude,
    startLocation.longitude
  );

  // Cache venue coordinates
  const venueCoords = new Map<string, { lat: number; lon: number }>();
  venues.forEach((v) => {
    venueCoords.set(
      v.id,
      getCoordinates(v.address, v.city, v.state, v.latitude, v.longitude)
    );
  });

  const permutations = permute(venues);
  let bestOrder: VenueOption[] = permutations[0];
  let minDistance = Infinity;
  let bestLegMetrics: Array<{ distanceMiles: number; durationMinutes: number }> = [];
  let bestDrivingMinutes = 0;

  for (const candidateOrder of permutations) {
    let currentDistance = 0;
    let currentMinutes = 0;
    const currentLegs: Array<{ distanceMiles: number; durationMinutes: number }> = [];

    // First leg: from start point to 1st venue
    const firstCoord = venueCoords.get(candidateOrder[0].id)!;
    const firstLeg = estimateDrivingDistanceAndMinutes(
      startCoord.lat,
      startCoord.lon,
      firstCoord.lat,
      firstCoord.lon
    );
    currentDistance += firstLeg.distanceMiles;
    currentMinutes += firstLeg.durationMinutes;
    currentLegs.push(firstLeg);

    // Subsequent legs: from venue i to venue i+1
    for (let i = 0; i < candidateOrder.length - 1; i++) {
      const fromCoord = venueCoords.get(candidateOrder[i].id)!;
      const toCoord = venueCoords.get(candidateOrder[i + 1].id)!;
      const leg = estimateDrivingDistanceAndMinutes(
        fromCoord.lat,
        fromCoord.lon,
        toCoord.lat,
        toCoord.lon
      );
      currentDistance += leg.distanceMiles;
      currentMinutes += leg.durationMinutes;
      currentLegs.push(leg);
    }

    if (currentDistance < minDistance) {
      minDistance = currentDistance;
      bestOrder = candidateOrder;
      bestLegMetrics = currentLegs;
      bestDrivingMinutes = currentMinutes;
    }
  }

  return {
    orderedVenues: bestOrder,
    totalDistanceMiles: Math.round(minDistance * 10) / 10,
    totalDrivingMinutes: bestDrivingMinutes,
    legMetrics: bestLegMetrics,
  };
}

/**
 * Helper to add minutes to a time string like "09:30 AM"
 */
function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
  const [timePart, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours24 = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  const newModifier = newHours24 >= 12 ? 'PM' : 'AM';
  const newHours12 = newHours24 % 12 === 0 ? 12 : newHours24 % 12;

  const padMin = newMinutes < 10 ? `0${newMinutes}` : `${newMinutes}`;
  return `${newHours12}:${padMin} ${newModifier}`;
}

/**
 * Rounds a time string to the closest 15-minute slot (e.g. 10:08 AM -> 10:15 AM)
 */
function roundToQuarterHour(timeStr: string): string {
  const [timePart, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  const roundedMinutes = Math.round(minutes / 15) * 15;
  const totalMinutes = hours * 60 + roundedMinutes;

  const newHours24 = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  const newModifier = newHours24 >= 12 ? 'PM' : 'AM';
  const newHours12 = newHours24 % 12 === 0 ? 12 : newHours24 % 12;

  const padMin = newMinutes < 10 ? `0${newMinutes}` : `${newMinutes}`;
  return `${newHours12}:${padMin} ${newModifier}`;
}

/**
 * Generates tailor-made questions for a Desi wedding site walkthrough
 */
export function getQuestionsForVenue(venue: VenueOption): string[] {
  const questions: string[] = [
    'Can we bring outside licensed Indian caterers (e.g. Moghul, Bukhara, Chowpatty)? What is the exact kitchen buyout / per-person royalty fee?',
    'What is your policy on live sacred flame (Agni Havan Kund) for Hindu Pheras? Do we need to pull a municipal Fire Marshal permit?',
    'Where is the designated Baraat procession route (front driveway, lawn, or parking lot)? Are live dhol players, brass bands, horses, or vintage cars permitted?',
    'What is the evening sound and music curfew? Can the DJ play until 1:00 AM or does the ballroom shut down strictly at 11:00 PM?',
    'Are dedicated Bride and Groom hospitality suites included for early morning makeup/turban tying?',
    'What is the guaranteed room block discount rate for out-of-town guests?',
  ];

  if (venue.desiFeatures.maxCeremonyCapacity < 350) {
    questions.push('Can the ballroom partition be opened to accommodate higher headcount for the Mandap ceremony?');
  }

  return questions;
}

/**
 * Constructs the turnkey Google Maps navigation URL with all stops preloaded
 */
export function buildGoogleMapsRouteUrl(
  startAddress: string,
  venues: VenueOption[]
): string {
  if (venues.length === 0) return 'https://www.google.com/maps';

  const origin = encodeURIComponent(startAddress);
  const destination = encodeURIComponent(
    `${venues[venues.length - 1].address}, ${venues[venues.length - 1].city}, ${venues[venues.length - 1].state}`
  );

  if (venues.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }

  const waypoints = venues
    .slice(0, venues.length - 1)
    .map((v) => encodeURIComponent(`${v.address}, ${v.city}, ${v.state}`))
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
}

/**
 * Master Route & Schedule Generation Function
 */
export function generateSiteTourSchedule({
  weddingId,
  tourDate,
  startLocation,
  secondFamilyLocation,
  venues,
  dayStartTime = '09:30 AM',
  durationPerTourMinutes = 60,
  bufferBetweenToursMinutes = 15,
  includesLunchBreak = true,
}: {
  weddingId: string;
  tourDate: string;
  startLocation: FamilyAddressInput;
  secondFamilyLocation?: FamilyAddressInput;
  venues: VenueOption[];
  dayStartTime?: string;
  durationPerTourMinutes?: number;
  bufferBetweenToursMinutes?: number;
  includesLunchBreak?: boolean;
}): SiteTourDayPlan {
  const {
    orderedVenues,
    totalDistanceMiles,
    totalDrivingMinutes,
    legMetrics,
  } = findOptimalTourOrder(startLocation, venues);

  let currentTime = dayStartTime;
  const stops: ScheduledTourStop[] = [];

  // Determine if a lunch break should be scheduled around midday (~12:30 PM - 1:30 PM)
  let lunchBreakScheduled = false;
  let lunchWindow: { startTime: string; durationMinutes: number; note: string } | undefined = undefined;

  for (let i = 0; i < orderedVenues.length; i++) {
    const venue = orderedVenues[i];
    const leg = legMetrics[i] || { distanceMiles: 5, durationMinutes: 15 };

    // Driving to venue
    const arrivalRaw = addMinutesToTimeString(currentTime, leg.durationMinutes);
    const suggestedArrival = roundToQuarterHour(arrivalRaw);
    const suggestedDeparture = addMinutesToTimeString(suggestedArrival, durationPerTourMinutes);

    const nextVenue = i < orderedVenues.length - 1 ? orderedVenues[i + 1] : undefined;
    const nextLeg = i < orderedVenues.length - 1 ? legMetrics[i + 1] : undefined;

    stops.push({
      stopOrder: i + 1,
      venueId: venue.id,
      venueName: venue.name,
      address: venue.address,
      city: `${venue.city}, ${venue.state}`,
      suggestedArrivalTime: suggestedArrival,
      suggestedTourWindow: `${suggestedArrival} – ${suggestedDeparture} (${durationPerTourMinutes} min tour & Q&A)`,
      suggestedDepartureTime: suggestedDeparture,
      drivingTimeToNextMinutes: nextLeg?.durationMinutes,
      distanceToNextMiles: nextLeg?.distanceMiles,
      nextStopName: nextVenue?.name,
      notesOrQuestionsToAsk: getQuestionsForVenue(venue),
    });

    currentTime = suggestedDeparture;

    // Check if we should insert lunch break between stops
    if (
      includesLunchBreak &&
      !lunchBreakScheduled &&
      i < orderedVenues.length - 1 &&
      (suggestedDeparture.includes('12:') || suggestedDeparture.includes('1:'))
    ) {
      const lunchStart = suggestedDeparture;
      const lunchEnd = addMinutesToTimeString(lunchStart, 60);
      lunchWindow = {
        startTime: lunchStart,
        durationMinutes: 60,
        note: 'Family Lunch & Debrief Break: Review morning venue pros/cons away from sales coordinators over chai & lunch.',
      };
      currentTime = lunchEnd;
      lunchBreakScheduled = true;
    } else {
      // Add standard buffer before driving
      currentTime = addMinutesToTimeString(currentTime, bufferBetweenToursMinutes);
    }
  }

  const startAddressStr = `${startLocation.address}, ${startLocation.city}, ${startLocation.state}`;
  const googleMapsUrl = buildGoogleMapsRouteUrl(startAddressStr, orderedVenues);

  return {
    id: `tour-plan-${Date.now()}`,
    weddingId,
    tourDate,
    startLocation,
    secondFamilyLocation,
    dayStartTime,
    durationPerTourMinutes,
    bufferBetweenToursMinutes,
    includesLunchBreak,
    lunchBreakWindow: lunchWindow,
    selectedVenueIds: orderedVenues.map((v) => v.id),
    optimizedStops: stops,
    totalEstDrivingMinutes: totalDrivingMinutes,
    totalEstDistanceMiles: totalDistanceMiles,
    googleMapsMultiStopUrl: googleMapsUrl,
  };
}

/**
 * Formats the tour itinerary into a clean, WhatsApp-ready message for family group chats
 */
export function formatTourPlanForWhatsApp(
  plan: SiteTourDayPlan,
  venues: VenueOption[]
): string {
  const lines: string[] = [
    `🏰 *WEDDING VENUE TOUR DAY ITINERARY* 🚗`,
    `📅 *Date:* ${plan.tourDate}`,
    `📍 *Starting From:* ${plan.startLocation.label} (${plan.startLocation.address}, ${plan.startLocation.city})`,
  ];

  if (plan.secondFamilyLocation?.address) {
    lines.push(
      `🤝 *Second Family Rendezvous:* ${plan.secondFamilyLocation.label} (${plan.secondFamilyLocation.address})`
    );
  }

  lines.push(
    `⏰ *Start Time:* ${plan.dayStartTime}`,
    `⏱️ *Total Estimated Drive Time:* ~${plan.totalEstDrivingMinutes} mins (${plan.totalEstDistanceMiles} miles total)`,
    ``,
    `--------------------------------------`,
    `📋 *SCHEDULED TOUR APPOINTMENTS:*`
  );

  plan.optimizedStops.forEach((stop) => {
    const venue = venues.find((v) => v.id === stop.venueId);
    lines.push(
      ``,
      `*Stop #${stop.stopOrder}: ${stop.venueName}*`,
      `📍 ${stop.address}, ${stop.city}`,
      `🕒 *Tour Window:* ${stop.suggestedTourWindow}`
    );

    if (venue?.contactPerson || venue?.contactPhone) {
      lines.push(
        `📞 Contact: ${venue.contactPerson || 'Sales Office'} (${venue.contactPhone || 'N/A'})`
      );
    }

    if (stop.drivingTimeToNextMinutes && stop.nextStopName) {
      lines.push(
        `🚗 *Drive to next:* ~${stop.drivingTimeToNextMinutes} mins (${stop.distanceToNextMiles} mi) to ${stop.nextStopName}`
      );
    }
  });

  if (plan.lunchBreakWindow) {
    lines.push(
      ``,
      `🍱 *${plan.lunchBreakWindow.note}*`,
      `🕒 ${plan.lunchBreakWindow.startTime} (60 min break)`
    );
  }

  lines.push(
    ``,
    `--------------------------------------`,
    `🗺️ *Turn-by-Turn GPS Google Maps Route:*`,
    plan.googleMapsMultiStopUrl,
    ``,
    `✨ Shared via Vivaah Desi American Wedding Planner`
  );

  return lines.join('\n');
}
