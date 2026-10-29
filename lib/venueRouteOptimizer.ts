import {
  VenueOption,
  FamilyAddressInput,
  ScheduledTourStop,
  SiteTourDayPlan,
  VenueTouringHours,
  StopTouringStatus,
  DualFamilyMeetingMode,
  DualFamilyStartPlan,
  FamilyDepartureDetail,
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
  'cedar grove, nj': { lat: 40.8548, lon: -74.2285 },
  'montclair, nj': { lat: 40.8259, lon: -74.209 },
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
 * Converts a time string like "09:30 AM" or "02:15 PM" to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  const timePart = parts[0];
  const modifier = parts[1] || 'AM';
  let [hours, minutes] = timePart.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + (isNaN(minutes) ? 0 : minutes);
}

/**
 * Helper to add minutes to a time string like "09:30 AM"
 */
export function addMinutesToTimeString(timeStr: string, minutesToAdd: number): string {
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
export function roundToQuarterHour(timeStr: string): string {
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
 * Helper to subtract minutes from a time string like "10:00 AM" -> "09:35 AM"
 */
export function subtractMinutesFromTimeString(timeStr: string, minutesToSubtract: number): string {
  const [timePart, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  let totalMinutes = hours * 60 + minutes - minutesToSubtract;
  while (totalMinutes < 0) totalMinutes += 24 * 60;
  const newHours24 = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;

  const newModifier = newHours24 >= 12 ? 'PM' : 'AM';
  const newHours12 = newHours24 % 12 === 0 ? 12 : newHours24 % 12;

  const padMin = newMinutes < 10 ? `0${newMinutes}` : `${newMinutes}`;
  return `${newHours12}:${padMin} ${newModifier}`;
}

/**
 * Returns official site touring hours for a venue, reflecting real-world wedding venue scheduling rules:
 * - Saturdays: Luxury estates only tour morning hours (9:30 AM – 1:30 PM) before evening Baraat/weddings start.
 * - Sundays: 10:00 AM – 2:30 PM
 * - Weekdays (Tue–Fri): 10:00 AM – 6:00 PM (Ideal for viewing empty ballrooms)
 * - Mondays: Closed/dark for maintenance
 */
export function getDefaultTouringHours(venue: VenueOption): VenueTouringHours {
  if (venue.touringHours) {
    return venue.touringHours;
  }

  const nameLower = venue.name.toLowerCase();

  // Top Estate & Historic Venue Specific Overrides
  if (nameLower.includes('palace at somerset')) {
    return {
      weekdayHours: '10:00 AM – 6:00 PM (Tue–Fri, Closed Mon)',
      saturdayHours: '09:30 AM – 1:30 PM (Morning Only before evening Baraat)',
      sundayHours: '10:00 AM – 2:30 PM',
      latestSaturdayTourStart: '12:30 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Dual-wing complex. Saturday tours shut down strictly at 1:30 PM so evening Mandap load-in remains completely private.',
    };
  }

  if (nameLower.includes('legacy castle')) {
    return {
      weekdayHours: '11:00 AM – 6:00 PM (Tue–Fri, Closed Mon)',
      saturdayHours: '09:30 AM – 1:00 PM (Strict Morning Window)',
      sundayHours: '10:30 AM – 2:30 PM',
      latestSaturdayTourStart: '12:00 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Security gate check-in required. No tours once bridal party arrives for afternoon photo sessions & Baraat.',
    };
  }

  if (nameLower.includes('florentine gardens')) {
    return {
      weekdayHours: '10:00 AM – 6:00 PM (Tue–Fri)',
      saturdayHours: '09:00 AM – 1:00 PM (One-wedding exclusivity)',
      sundayHours: '10:00 AM – 2:00 PM',
      latestSaturdayTourStart: '12:00 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Single-event private estate: Saturday tours end strictly at 1:00 PM so the booked wedding party enjoys 100% exclusive access.',
    };
  }

  if (nameLower.includes('crystal plaza')) {
    return {
      weekdayHours: '10:00 AM – 6:00 PM (Tue–Fri)',
      saturdayHours: '09:30 AM – 1:30 PM (Morning Walkthroughs)',
      sundayHours: '10:00 AM – 2:30 PM',
      latestSaturdayTourStart: '12:30 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Gardens and grand ballroom close to outside couples at 1:30 PM on Saturday event dates.',
    };
  }

  if (nameLower.includes('grove')) {
    return {
      weekdayHours: '10:00 AM – 6:30 PM (Tue–Fri)',
      saturdayHours: '10:00 AM – 2:00 PM',
      sundayHours: '10:30 AM – 3:00 PM',
      latestSaturdayTourStart: '01:00 PM',
      latestWeekdayTourStart: '05:30 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Saturday walkthroughs must conclude prior to 2:00 PM event preparation.',
    };
  }

  if (nameLower.includes('rockleigh')) {
    return {
      weekdayHours: '10:00 AM – 6:00 PM (Tue–Fri)',
      saturdayHours: '09:30 AM – 1:00 PM (Strict Morning Window)',
      sundayHours: '10:00 AM – 2:00 PM',
      latestSaturdayTourStart: '12:00 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Georgian estate gates close to outside guests by 1:30 PM on Saturday wedding days.',
    };
  }

  if (nameLower.includes('pleasantdale')) {
    return {
      weekdayHours: '10:00 AM – 5:30 PM (Tue–Fri, Guard Gate)',
      saturdayHours: '09:30 AM – 12:30 PM (Limited 3 slots only)',
      sundayHours: '10:00 AM – 1:30 PM',
      latestSaturdayTourStart: '11:30 AM',
      latestWeekdayTourStart: '04:30 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Gated gatehouse check-in. Saturday tours are strictly limited to morning to preserve privacy for evening wedding guests.',
    };
  }

  if (nameLower.includes('shadowbrook') || nameLower.includes('park chateau') || nameLower.includes('nanina')) {
    return {
      weekdayHours: '10:00 AM – 6:00 PM (Tue–Fri)',
      saturdayHours: '09:30 AM – 1:30 PM (Morning Only)',
      sundayHours: '10:00 AM – 2:30 PM',
      latestSaturdayTourStart: '12:30 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Grounds close to public tours by early afternoon for active wedding and photography sessions.',
    };
  }

  if (nameLower.includes('cescaphe') || nameLower.includes('water works') || nameLower.includes('vie')) {
    return {
      weekdayHours: '10:00 AM – 6:00 PM (Tue–Fri)',
      saturdayHours: '09:30 AM – 1:00 PM (Morning Showcase)',
      sundayHours: '10:00 AM – 2:00 PM',
      latestSaturdayTourStart: '12:00 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Cescaphe event directors conduct morning walkthroughs before active Saturday evening galas.',
    };
  }

  // General Estate Default
  if (venue.type === 'historic_estate') {
    return {
      weekdayHours: '10:00 AM – 6:00 PM (Tue–Fri, Closed Mon)',
      saturdayHours: '09:30 AM – 1:30 PM (Morning Only before evening wedding)',
      sundayHours: '10:00 AM – 2:30 PM',
      latestSaturdayTourStart: '12:30 PM',
      latestWeekdayTourStart: '05:00 PM',
      appointmentRequirement: 'appointment_only',
      closedDays: ['Monday'],
      specialTouringNotes:
        'Private estate grounds close at 2:00 PM for private evening wedding setup & Baraats.',
    };
  }

  // Hotel Ballrooms & Resorts
  if (venue.type === 'hotel_ballroom' || venue.type === 'resort' || venue.type === 'convention_center') {
    return {
      weekdayHours: '09:00 AM – 6:30 PM (Mon–Fri)',
      saturdayHours: '10:00 AM – 3:30 PM',
      sundayHours: '10:00 AM – 4:00 PM',
      latestSaturdayTourStart: '02:30 PM',
      latestWeekdayTourStart: '05:30 PM',
      appointmentRequirement: 'advance_booking_required',
      closedDays: [],
      specialTouringNotes:
        'Catering sales director escort required. Ballroom viewing depends on corporate conference or wedding floor availability.',
    };
  }

  // Dedicated Desi Banquet Halls & Golf Clubs
  return {
    weekdayHours: '11:00 AM – 7:00 PM (Tue–Sun, Closed Mon)',
    saturdayHours: '10:00 AM – 3:30 PM',
    sundayHours: '10:00 AM – 4:00 PM',
    latestSaturdayTourStart: '02:30 PM',
    latestWeekdayTourStart: '06:00 PM',
    appointmentRequirement: 'appointment_only',
    closedDays: ['Monday'],
    specialTouringNotes:
      'Banquet manager appointment required; evening walkthroughs restricted during active Sangeet or Garba celebrations.',
  };
}

/**
 * Validates whether a proposed tour time falls within the venue's official touring hours
 */
export function evaluateTourStopTiming(
  venue: VenueOption,
  tourDate: string,
  arrivalStr: string,
  departureStr: string
): StopTouringStatus {
  const touringHours = getDefaultTouringHours(venue);
  const arrivalMinutes = timeStringToMinutes(arrivalStr);

  let dayOfWeek = 6; // default Saturday
  if (tourDate) {
    const d = new Date(`${tourDate}T12:00:00`);
    if (!isNaN(d.getTime())) {
      dayOfWeek = d.getDay();
    }
  }

  const isSaturday = dayOfWeek === 6;
  const isSunday = dayOfWeek === 0;
  const isMonday = dayOfWeek === 1;

  // 1. Saturday Check (Core scenario for weekend site tours)
  if (isSaturday) {
    const latestSaturdayStartMins = timeStringToMinutes(touringHours.latestSaturdayTourStart || '12:30 PM');
    const earliestSaturdayOpenMins = 570; // 9:30 AM

    if (arrivalMinutes < earliestSaturdayOpenMins) {
      return {
        isWithinHours: false,
        status: 'outside_hours',
        badgeLabel: 'Too Early (Before 9:30 AM)',
        warningMessage: `${venue.name} sales office does not open for tours before 9:30 AM on Saturdays.`,
        recommendedTimeWindow: touringHours.saturdayHours,
      };
    }

    if (arrivalMinutes > latestSaturdayStartMins) {
      return {
        isWithinHours: false,
        status: 'outside_hours',
        badgeLabel: 'Outside Saturday Tour Hours',
        warningMessage: `${venue.name} limits Saturday tours to ${touringHours.saturdayHours}. By afternoon (${arrivalStr}), ballrooms close for evening wedding & Baraat load-in. Confirm special access with sales director.`,
        recommendedTimeWindow: `Saturday mornings (${touringHours.saturdayHours}) or Weekday afternoons`,
      };
    }

    if (arrivalMinutes >= latestSaturdayStartMins - 30) {
      return {
        isWithinHours: true,
        status: 'closing_soon',
        badgeLabel: 'Tight Saturday Window',
        warningMessage: `Late morning tour slot (${arrivalStr}): Ensure walkthrough concludes before afternoon wedding decorator load-in begins.`,
        recommendedTimeWindow: touringHours.saturdayHours,
      };
    }

    return {
      isWithinHours: true,
      status: 'valid',
      badgeLabel: '✓ Within Saturday Tour Hours',
      recommendedTimeWindow: touringHours.saturdayHours,
    };
  }

  // 2. Sunday Check
  if (isSunday) {
    const earliestSundayOpenMins = 600; // 10:00 AM
    const latestSundayStartMins = 870; // 2:30 PM

    if (arrivalMinutes < earliestSundayOpenMins) {
      return {
        isWithinHours: false,
        status: 'outside_hours',
        badgeLabel: 'Too Early (Before 10:00 AM)',
        warningMessage: `${venue.name} begins Sunday tour appointments at 10:00 AM.`,
        recommendedTimeWindow: touringHours.sundayHours,
      };
    }

    if (arrivalMinutes > latestSundayStartMins) {
      return {
        isWithinHours: false,
        status: 'outside_hours',
        badgeLabel: 'Outside Sunday Tour Hours',
        warningMessage: `Sunday walkthroughs conclude by ~2:30 PM. Please verify weekend afternoon availability with sales office.`,
        recommendedTimeWindow: touringHours.sundayHours,
      };
    }

    return {
      isWithinHours: true,
      status: 'valid',
      badgeLabel: '✓ Within Sunday Tour Hours',
      recommendedTimeWindow: touringHours.sundayHours,
    };
  }

  // 3. Monday Check
  if (isMonday && touringHours.closedDays?.includes('Monday')) {
    return {
      isWithinHours: false,
      status: 'closed_day',
      badgeLabel: 'Venue Closed Mondays',
      warningMessage: `${venue.name} is dark/closed on Mondays for post-weekend maintenance. Tour requests must be arranged by private appointment.`,
      recommendedTimeWindow: touringHours.weekdayHours,
    };
  }

  // 4. Weekdays (Tue–Fri)
  const earliestWeekdayOpenMins = 570; // 9:30 AM
  const latestWeekdayStartMins = timeStringToMinutes(touringHours.latestWeekdayTourStart || '05:30 PM');

  if (arrivalMinutes < earliestWeekdayOpenMins) {
    return {
      isWithinHours: false,
      status: 'outside_hours',
      badgeLabel: 'Before Sales Office Opens',
      warningMessage: `Sales office opens at 10:00 AM.`,
      recommendedTimeWindow: touringHours.weekdayHours,
    };
  }

  if (arrivalMinutes > latestWeekdayStartMins) {
    return {
      isWithinHours: false,
      status: 'outside_hours',
      badgeLabel: 'After Hours (Sales Closed)',
      warningMessage: `Sales office closes by 6:00 PM. Evening viewings require pre-scheduled director confirmation.`,
      recommendedTimeWindow: touringHours.weekdayHours,
    };
  }

  return {
    isWithinHours: true,
    status: 'valid',
    badgeLabel: '✓ Within Weekday Tour Hours',
    recommendedTimeWindow: touringHours.weekdayHours,
  };
}

/**
 * Finds the optimal touring order that minimizes total driving time/distance
 * while factoring in:
 * 1. Dual-family starting locations (Groom & Bride homes) to choose an equitable starting venue or pickup order
 * 2. Venue operating and site tour hours to avoid after-hours appointments
 */
export function findOptimalTourOrder(
  startLocation: FamilyAddressInput,
  venues: VenueOption[],
  secondFamilyLocation?: FamilyAddressInput,
  meetingMode: DualFamilyMeetingMode = 'meet_at_first_venue',
  tourDate: string = '2026-11-14',
  dayStartTime: string = '09:30 AM',
  durationPerTourMinutes: number = 60,
  bufferBetweenToursMinutes: number = 15,
  includesLunchBreak: boolean = true
): {
  orderedVenues: VenueOption[];
  totalDistanceMiles: number;
  totalDrivingMinutes: number;
  legMetrics: Array<{ distanceMiles: number; durationMinutes: number }>;
  dualFamilyStartPlan?: DualFamilyStartPlan;
} {
  if (venues.length === 0) {
    return {
      orderedVenues: [],
      totalDistanceMiles: 0,
      totalDrivingMinutes: 0,
      legMetrics: [],
    };
  }

  // Cache venue coordinates
  const venueCoords = new Map<string, { lat: number; lon: number }>();
  venues.forEach((v) => {
    venueCoords.set(
      v.id,
      getCoordinates(v.address, v.city, v.state, v.latitude, v.longitude)
    );
  });

  // Check if two family locations are present
  const hasBothFamilies =
    secondFamilyLocation &&
    secondFamilyLocation.address &&
    secondFamilyLocation.address.trim().length > 0;

  const groomSide =
    startLocation.side === 'groom'
      ? startLocation
      : secondFamilyLocation?.side === 'groom'
      ? secondFamilyLocation
      : startLocation;

  const brideSide =
    startLocation.side === 'bride'
      ? startLocation
      : secondFamilyLocation?.side === 'bride'
      ? secondFamilyLocation
      : secondFamilyLocation || startLocation;

  const groomCoord = getCoordinates(
    groomSide.address,
    groomSide.city,
    groomSide.state,
    groomSide.latitude,
    groomSide.longitude
  );

  const brideCoord = getCoordinates(
    brideSide.address,
    brideSide.city,
    brideSide.state,
    brideSide.latitude,
    brideSide.longitude
  );

  const permutations = permute(venues);
  let bestOrder: VenueOption[] = permutations[0];
  let minWeightedScore = Infinity;
  let bestLegMetrics: Array<{ distanceMiles: number; durationMinutes: number }> = [];
  let bestDrivingMinutes = 0;
  let bestDistance = 0;
  let bestDualPlan: DualFamilyStartPlan | undefined = undefined;

  for (const candidateOrder of permutations) {
    const v1 = candidateOrder[0];
    const v1Coord = venueCoords.get(v1.id)!;

    let startFairnessCost = 0;
    let initialArrivalRaw = dayStartTime;
    const currentLegs: Array<{ distanceMiles: number; durationMinutes: number }> = [];
    let initialDistance = 0;
    let initialMinutes = 0;

    let candidateDualPlan: DualFamilyStartPlan | undefined = undefined;

    if (hasBothFamilies && meetingMode === 'meet_at_first_venue') {
      // Both families drive separately to meet at the 1st venue
      const groomLeg = estimateDrivingDistanceAndMinutes(
        groomCoord.lat,
        groomCoord.lon,
        v1Coord.lat,
        v1Coord.lon
      );
      const brideLeg = estimateDrivingDistanceAndMinutes(
        brideCoord.lat,
        brideCoord.lon,
        v1Coord.lat,
        v1Coord.lon
      );

      const maxStartMinutes = Math.max(groomLeg.durationMinutes, brideLeg.durationMinutes);
      const avgStartDist = (groomLeg.distanceMiles + brideLeg.distanceMiles) / 2;
      const discrepancyMinutes = Math.abs(groomLeg.durationMinutes - brideLeg.durationMinutes);

      // Score prioritizes low combined distance and balanced travel times
      startFairnessCost = avgStartDist * 0.8 + discrepancyMinutes * 0.6;
      initialArrivalRaw = addMinutesToTimeString(dayStartTime, maxStartMinutes);

      const firstArrivalRounded = roundToQuarterHour(initialArrivalRaw);
      const groomDepartureTime = subtractMinutesFromTimeString(
        firstArrivalRounded,
        groomLeg.durationMinutes
      );
      const brideDepartureTime = subtractMinutesFromTimeString(
        firstArrivalRounded,
        brideLeg.durationMinutes
      );

      const fairnessSummary =
        discrepancyMinutes <= 12
          ? `Equitable starting venue: Groom's family departs ${groomSide.city} at ${groomDepartureTime} (~${groomLeg.durationMinutes}m drive), Bride's family departs ${brideSide.city} at ${brideDepartureTime} (~${brideLeg.durationMinutes}m drive). Both arrive smoothly at ${firstArrivalRounded}.`
          : `Meeting at ${v1.name}: Groom departs ${groomSide.city} at ${groomDepartureTime} (~${groomLeg.durationMinutes}m), Bride departs ${brideSide.city} at ${brideDepartureTime} (~${brideLeg.durationMinutes}m). Rendezvous at ${firstArrivalRounded}.`;

      candidateDualPlan = {
        mode: 'meet_at_first_venue',
        firstMeetingPointName: v1.name,
        groomDeparture: {
          side: 'groom',
          familyLabel: groomSide.label || "Groom's Family",
          homeAddress: groomSide.address,
          homeCity: groomSide.city,
          recommendedDepartureTime: groomDepartureTime,
          drivingMinutesToFirstStop: groomLeg.durationMinutes,
          distanceMilesToFirstStop: groomLeg.distanceMiles,
        },
        brideDeparture: {
          side: 'bride',
          familyLabel: brideSide.label || "Bride's Family",
          homeAddress: brideSide.address,
          homeCity: brideSide.city,
          recommendedDepartureTime: brideDepartureTime,
          drivingMinutesToFirstStop: brideLeg.durationMinutes,
          distanceMilesToFirstStop: brideLeg.distanceMiles,
        },
        rendezvousArrivalTime: firstArrivalRounded,
        travelDiscrepancyMinutes: discrepancyMinutes,
        fairnessSummary,
      };

      initialDistance = avgStartDist;
      initialMinutes = maxStartMinutes;
      currentLegs.push({
        distanceMiles: avgStartDist,
        durationMinutes: maxStartMinutes,
      });
    } else if (hasBothFamilies && meetingMode === 'carpool_pickup') {
      // Carpool: Groom picks up Bride vs Bride picks up Groom
      const gToB = estimateDrivingDistanceAndMinutes(
        groomCoord.lat,
        groomCoord.lon,
        brideCoord.lat,
        brideCoord.lon
      );
      const bToV1 = estimateDrivingDistanceAndMinutes(
        brideCoord.lat,
        brideCoord.lon,
        v1Coord.lat,
        v1Coord.lon
      );

      const bToG = estimateDrivingDistanceAndMinutes(
        brideCoord.lat,
        brideCoord.lon,
        groomCoord.lat,
        groomCoord.lon
      );
      const gToV1 = estimateDrivingDistanceAndMinutes(
        groomCoord.lat,
        groomCoord.lon,
        v1Coord.lat,
        v1Coord.lon
      );

      const optionA_Miles = gToB.distanceMiles + bToV1.distanceMiles;
      const optionB_Miles = bToG.distanceMiles + gToV1.distanceMiles;

      const groomPicksUpBride = optionA_Miles <= optionB_Miles;
      const pickupLeg = groomPicksUpBride ? gToB : bToG;
      const venueLeg = groomPicksUpBride ? bToV1 : gToV1;

      const pickupTime = addMinutesToTimeString(dayStartTime, pickupLeg.durationMinutes);
      const chaiBufferMins = 20; // 20 mins morning chai / boarding
      const departPickupTime = addMinutesToTimeString(pickupTime, chaiBufferMins);
      const firstArrival = roundToQuarterHour(
        addMinutesToTimeString(departPickupTime, venueLeg.durationMinutes)
      );

      const driverSide = groomPicksUpBride ? 'groom' : 'bride';
      const passengerSide = groomPicksUpBride ? 'bride' : 'groom';
      const passengerAddress = groomPicksUpBride ? brideSide.address : groomSide.address;
      const passengerCity = groomPicksUpBride ? brideSide.city : groomSide.city;

      candidateDualPlan = {
        mode: 'carpool_pickup',
        firstMeetingPointName: v1.name,
        groomDeparture: {
          side: 'groom',
          familyLabel: groomSide.label || "Groom's Family",
          homeAddress: groomSide.address,
          homeCity: groomSide.city,
          recommendedDepartureTime: groomPicksUpBride
            ? dayStartTime
            : subtractMinutesFromTimeString(firstArrival, venueLeg.durationMinutes),
          drivingMinutesToFirstStop: groomPicksUpBride
            ? pickupLeg.durationMinutes + venueLeg.durationMinutes
            : venueLeg.durationMinutes,
          distanceMilesToFirstStop: groomPicksUpBride
            ? pickupLeg.distanceMiles + venueLeg.distanceMiles
            : venueLeg.distanceMiles,
        },
        brideDeparture: {
          side: 'bride',
          familyLabel: brideSide.label || "Bride's Family",
          homeAddress: brideSide.address,
          homeCity: brideSide.city,
          recommendedDepartureTime: groomPicksUpBride
            ? departPickupTime
            : dayStartTime,
          drivingMinutesToFirstStop: groomPicksUpBride
            ? venueLeg.durationMinutes
            : pickupLeg.durationMinutes + venueLeg.durationMinutes,
          distanceMilesToFirstStop: groomPicksUpBride
            ? venueLeg.distanceMiles
            : pickupLeg.distanceMiles + venueLeg.distanceMiles,
        },
        rendezvousArrivalTime: firstArrival,
        travelDiscrepancyMinutes: 0,
        fairnessSummary: `Carpool Sequence: ${
          groomPicksUpBride ? "Groom's family" : "Bride's family"
        } departs at ${dayStartTime}, picks up ${
          groomPicksUpBride ? "Bride's family" : "Groom's family"
        } in ${passengerCity} at ${pickupTime} (with morning chai), and both travel together to ${v1.name} for ${firstArrival}.`,
        pickupOrder: {
          driverSide,
          passengerSide,
          pickupTime,
          chaiBufferMinutes: chaiBufferMins,
          pickupAddress: passengerAddress,
          pickupCity: passengerCity,
          drivingMinutesToPickup: pickupLeg.durationMinutes,
          distanceMilesToPickup: pickupLeg.distanceMiles,
        },
      };

      initialArrivalRaw = firstArrival;
      initialDistance = pickupLeg.distanceMiles + venueLeg.distanceMiles;
      initialMinutes = pickupLeg.durationMinutes + chaiBufferMins + venueLeg.durationMinutes;
      startFairnessCost = initialDistance;
      currentLegs.push({
        distanceMiles: initialDistance,
        durationMinutes: initialMinutes,
      });
    } else {
      // Single family origin start
      const startCoord = getCoordinates(
        startLocation.address,
        startLocation.city,
        startLocation.state,
        startLocation.latitude,
        startLocation.longitude
      );
      const firstLeg = estimateDrivingDistanceAndMinutes(
        startCoord.lat,
        startCoord.lon,
        v1Coord.lat,
        v1Coord.lon
      );
      initialDistance = firstLeg.distanceMiles;
      initialMinutes = firstLeg.durationMinutes;
      startFairnessCost = firstLeg.distanceMiles;
      initialArrivalRaw = addMinutesToTimeString(dayStartTime, firstLeg.durationMinutes);
      currentLegs.push(firstLeg);
    }

    let routeDistance = initialDistance;
    let routeMinutes = initialMinutes;

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
      routeDistance += leg.distanceMiles;
      routeMinutes += leg.durationMinutes;
      currentLegs.push(leg);
    }

    // Simulate timeline to assess touring hours feasibility
    let simTime = roundToQuarterHour(initialArrivalRaw);
    let timingPenalty = 0;

    for (let i = 0; i < candidateOrder.length; i++) {
      const v = candidateOrder[i];
      let arrival = simTime;
      if (i > 0) {
        const leg = currentLegs[i];
        const arrivalRaw = addMinutesToTimeString(simTime, leg.durationMinutes);
        arrival = roundToQuarterHour(arrivalRaw);
      }
      const departure = addMinutesToTimeString(arrival, durationPerTourMinutes);

      const timingCheck = evaluateTourStopTiming(v, tourDate, arrival, departure);
      if (!timingCheck.isWithinHours) {
        timingPenalty += 500;
      } else if (timingCheck.status === 'closing_soon') {
        timingPenalty += 15;
      }

      simTime = departure;
      if (
        includesLunchBreak &&
        i < candidateOrder.length - 1 &&
        (departure.includes('12:') || departure.includes('1:'))
      ) {
        simTime = addMinutesToTimeString(departure, 60);
      } else {
        simTime = addMinutesToTimeString(simTime, bufferBetweenToursMinutes);
      }
    }

    const totalWeightedScore = startFairnessCost + routeDistance + timingPenalty;
    if (totalWeightedScore < minWeightedScore) {
      minWeightedScore = totalWeightedScore;
      bestOrder = candidateOrder;
      bestLegMetrics = currentLegs;
      bestDrivingMinutes = routeMinutes;
      bestDistance = routeDistance;
      bestDualPlan = candidateDualPlan;
    }
  }

  return {
    orderedVenues: bestOrder,
    totalDistanceMiles: Math.round(bestDistance * 10) / 10,
    totalDrivingMinutes: bestDrivingMinutes,
    legMetrics: bestLegMetrics,
    dualFamilyStartPlan: bestDualPlan,
  };
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
  meetingMode = 'meet_at_first_venue',
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
  meetingMode?: DualFamilyMeetingMode;
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
    dualFamilyStartPlan,
  } = findOptimalTourOrder(
    startLocation,
    venues,
    secondFamilyLocation,
    meetingMode,
    tourDate,
    dayStartTime,
    durationPerTourMinutes,
    bufferBetweenToursMinutes,
    includesLunchBreak
  );

  let currentTime = dayStartTime;
  const stops: ScheduledTourStop[] = [];
  let timingWarningsCount = 0;

  // Determine if a lunch break should be scheduled around midday (~12:30 PM - 1:30 PM)
  let lunchBreakScheduled = false;
  let lunchWindow: { startTime: string; durationMinutes: number; note: string } | undefined = undefined;

  for (let i = 0; i < orderedVenues.length; i++) {
    const venue = orderedVenues[i];
    const leg = legMetrics[i] || { distanceMiles: 5, durationMinutes: 15 };

    let suggestedArrival: string;
    if (i === 0 && dualFamilyStartPlan?.rendezvousArrivalTime) {
      suggestedArrival = dualFamilyStartPlan.rendezvousArrivalTime;
    } else {
      const arrivalRaw = addMinutesToTimeString(currentTime, leg.durationMinutes);
      suggestedArrival = roundToQuarterHour(arrivalRaw);
    }
    const suggestedDeparture = addMinutesToTimeString(suggestedArrival, durationPerTourMinutes);

    const nextVenue = i < orderedVenues.length - 1 ? orderedVenues[i + 1] : undefined;
    const nextLeg = i < orderedVenues.length - 1 ? legMetrics[i + 1] : undefined;

    const touringHours = getDefaultTouringHours(venue);
    const timingStatus = evaluateTourStopTiming(venue, tourDate, suggestedArrival, suggestedDeparture);
    if (!timingStatus.isWithinHours || timingStatus.status === 'closing_soon') {
      timingWarningsCount++;
    }

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
      touringHours,
      touringStatus: timingStatus,
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
    meetingMode,
    dualFamilyStartPlan,
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
    hasTimingWarnings: timingWarningsCount > 0,
    timingWarningsCount,
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
      `🤝 *Second Family Location:* ${plan.secondFamilyLocation.label} (${plan.secondFamilyLocation.address})`
    );
  }

  if (plan.dualFamilyStartPlan) {
    const df = plan.dualFamilyStartPlan;
    lines.push(
      ``,
      `🤝 *DUAL-FAMILY STARTING COORDINATION:*`,
      `• 🤵 *Groom's Side (${df.groomDeparture.homeCity}):* Depart at ${df.groomDeparture.recommendedDepartureTime} (~${df.groomDeparture.drivingMinutesToFirstStop} mins drive)`,
      `• 👰 *Bride's Side (${df.brideDeparture.homeCity}):* Depart at ${df.brideDeparture.recommendedDepartureTime} (~${df.brideDeparture.drivingMinutesToFirstStop} mins drive)`,
      `• 📍 *Rendezvous at Stop #1:* ${df.firstMeetingPointName} at ${df.rendezvousArrivalTime}`,
      `• ⚖️ *Fair Balance:* ${df.fairnessSummary}`
    );
  }

  lines.push(
    ``,
    `⏰ *Target Tour Start Time:* ${plan.dayStartTime}`,
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

    if (stop.touringHours) {
      lines.push(`⏰ *Official Tour Hours:* ${stop.touringHours.saturdayHours}`);
    }

    if (stop.touringStatus && !stop.touringStatus.isWithinHours) {
      lines.push(`⚠️ *Notice:* ${stop.touringStatus.warningMessage}`);
    }

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
