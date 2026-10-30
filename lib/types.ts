export type WeddingSide = 'bride' | 'groom' | 'mutual';

export type DietaryTag = 'Strict Veg' | 'Jain' | 'Swaminarayan' | 'Non-Veg' | 'Halal' | 'Gluten-Free';

export type RsvpStatus = 'attending' | 'declined' | 'tentative' | 'invited' | 'not_sent';

export type SubEventType = 
  | 'roka' 
  | 'mehendi' 
  | 'haldi' 
  | 'sangeet' 
  | 'baraat' 
  | 'pheras' 
  | 'vidaai' 
  | 'reception' 
  | 'custom';

export type RequirementCategory =
  | 'Transport & Entry'
  | 'Puja Samagri & Rituals'
  | 'Decor, Props & Staging'
  | 'Music, Sound & FX'
  | 'Attire, Saafa & Jewellery'
  | 'Food, Drinks & Favors';

export interface EventChecklistItem {
  id: string;
  title: string;
  category: RequirementCategory;
  assignedTo?: string; // e.g. "Groom's Brother", "Decor Vendor", "Planner"
  isArranged: boolean;
  notes?: string;
  subItems?: { id: string; title: string; completed: boolean }[];
}

export interface WeddingEvent {
  id: string;
  weddingId: string;
  name: string;
  type: SubEventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  muhuratTime?: string;
  venueName: string;
  venueAddress: string;
  mapLink?: string;
  dressCode: string;
  colorTheme: string;
  bannerGradient: string;
  description: string;
  coordinatorName: string;
  coordinatorPhone: string;
  checklist: EventChecklistItem[];
  hotelBlockName?: string; // e.g. "Hyatt Regency / Westin Hotel Room Block"
  hasWelcomeBags?: boolean;
  hasWelcomeDinner?: boolean;
}

export interface Guest {
  id: string;
  weddingId: string;
  name: string;
  phone: string;
  email?: string;
  side: WeddingSide;
  familyGroup: string;
  adultsCount: number;
  kidsCount: number;
  dietaryPreference: DietaryTag;
  city: string;
  needsPickup: boolean;
  hotelAssigned?: string;
  roomNumber?: string;
  notes?: string;
  // Event ID to RSVP status map
  eventRsvps: Record<string, RsvpStatus>;
}

export interface BudgetItem {
  id: string;
  weddingId: string;
  title: string;
  category: 
    | 'Venue & Catering' 
    | 'Decor & Mandap' 
    | 'Photography & Film' 
    | 'Outfits & Jewellery' 
    | 'Bridal MUA & Mehendi' 
    | 'Music, Dhol & Entertainment' 
    | 'Accommodations & Transport' 
    | 'Pandit & Rituals' 
    | 'Favors & Invites' 
    | 'Miscellaneous';
  estimatedCost: number;
  actualCost: number;
  paidAmount: number;
  dueDate: string;
  paidBy: 'bride_side' | 'groom_side' | 'split_50_50' | 'couple';
  status: 'paid' | 'partial' | 'pending';
  vendorId?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  weddingId: string;
  name: string;
  category: 
    | 'Pandit Ji' 
    | 'Mehendi Artist' 
    | 'Bridal MUA & Hair' 
    | 'Photographer & Cinematographer' 
    | 'Choreographer & DJ' 
    | 'Mandap & Floral Decorator' 
    | 'Catering' 
    | 'Trousseau / Attire'
    | 'Lighting & AV Production'
    | 'Baraat & Farewell Transport'
    | 'Live Musicians (Nathswaram/Shehnai)'
    | 'Wedding Planner & Coordinator';
  contactPerson: string;
  phone: string;
  email?: string;
  agreedAmount: number;
  depositPaid: number;
  status: 'contacted' | 'negotiating' | 'confirmed' | 'completed';
  contractUrl?: string;
  notes: string;
  deliverables: string[];
}

export interface VendorPricingTier {
  tierOrItem: string;
  rate: string;
  details: string;
}

export interface CuratedVendor {
  id: string;
  name: string;
  category: Vendor['category'];
  tagline: string;
  baseLocation: string;
  serviceRegions: ('NJ' | 'NY' | 'PA' | 'CT' | 'DE' | 'Destination')[];
  priceTier: '$' | '$$' | '$$$' | '$$$$';
  priceStartingAt: number;
  typicalPackagePrice: number;
  priceUnit: 'per_guest' | 'package' | 'per_event' | 'per_hour';
  pricingHeadline: string;
  historicalPricingBreakdown: VendorPricingTier[];
  hiddenFeesAndFinePrint: string[];
  inclusions: string[];
  desiSpecialties: string[];
  estateApprovedVenues: string[];
  typicalCapacityOrTeam: string;
  contactPerson?: string;
  contactPhone: string;
  contactEmail: string;
  websiteUrl: string;
  instagramHandle: string;
  curatorReviewAndVerdict: string;
  negotiationTips: string[];
}

export interface ShagunRecord {
  id: string;
  weddingId: string;
  giverName: string;
  relationship: string;
  side: WeddingSide;
  city: string;
  type: 'cash_lifafa' | 'gold_silver' | 'physical_gift' | 'voucher';
  amount?: number; // In currency
  giftDescription?: string;
  receivedAtEvent: string; // Event ID or name
  pastGivenRecord?: string; // e.g. "They gave $501 at Rohit's wedding"
  thankYouSent: boolean;
  date: string;
}

export interface RoomAllocation {
  id: string;
  weddingId: string;
  hotelName: string;
  roomNumber: string;
  roomType: 'Deluxe' | 'Suite' | 'Double Bed' | 'Villa';
  capacity: number;
  checkInDate: string;
  checkOutDate: string;
  assignedGuestIds: string[];
  notes?: string;
}

// -------------------------------------------------------------
// VENUE DECISION & SITE TOUR ROUTE OPTIMIZER TYPES
// -------------------------------------------------------------

export type VenueStatus =
  | 'researching'
  | 'shortlisted'
  | 'tour_scheduled'
  | 'toured'
  | 'contract_review'
  | 'selected'
  | 'declined';

export interface VenueCostBreakdown {
  rentalFee: number;
  foodAndBeverageMinimum: number;
  cateringBuyoutFeePerGuest?: number; // Outside Indian catering royalty fee/guest
  serviceChargePercent: number; // e.g. 22%
  taxPercent: number; // e.g. 8.875% or 6.625%
  estimatedTotalCost: number; // Calculated all-in estimate
}

export interface VenueDesiCapabilities {
  allowsOutsideIndianCatering: boolean;
  cateringKitchenAccess?: 'full_kitchen' | 'prep_only' | 'warming_only' | 'none';
  allowsOpenFlameHavan: boolean; // Agni kund for Vedic Pheras
  firePermitRequired: boolean;
  allowsBaraatProcession: boolean; // Horse, vintage car, elephant, mobile dhol
  baraatRouteType?: 'outdoor_driveway' | 'parking_lot' | 'indoor_hallway' | 'courtyard' | 'prohibited';
  soundCurfewTime: string; // e.g. "01:00 AM", "12:00 AM", "11:00 PM"
  maxCeremonyCapacity: number; // Mandap seating
  maxReceptionCapacity: number; // Banquet round tables with dance floor
  hasBridalSuite: boolean;
  hasGroomSuite: boolean;
  hotelRoomsOnSite: boolean;
  hotelRoomBlockDiscount?: string;
}

export interface NearestHotelInfo {
  hotelName: string;
  distanceMiles: number; // 0 if on-site
  approxDriveMinutes: number; // 0 if on-site
  roomBlockDiscountNote?: string;
  address?: string;
  phone?: string;
  shuttleProvided: boolean;
}

export interface VenueServiceRating {
  score: number;                   // 1 to 100 (e.g. 98)
  starRating: number;              // 1.0 to 5.0 (e.g. 4.95)
  serverToGuestRatio: string;      // e.g. "1:8 (5-Star White-Glove)" or "1:16 (Standard Banquet)"
  hasDedicatedBridalAttendant: boolean;
  vendorCoordinationScore: number; // 1 to 100 (smoothness with decorator, priest, caterer)
  highlight: string;
}

export type PricingConfidenceLevel =
  | 'verified_contract'     // Directly verified contracts, proposals, or real couple reports (High Confidence)
  | 'community_reported'   // Ballpark ranges and contract rules reported in Reddit community forums (Moderate Confidence)
  | 'modeled_benchmark';   // Modeled ballpark benchmark based on published rental fees + outside catering buyouts (Estimated)

export interface VenueDayPricingVariance {
  confidenceLevel: PricingConfidenceLevel;
  dataSourceNotes?: string;         // Explanation of where the data came from
  peakSaturdayRate: string;         // e.g. "$260 – $320 / guest" or "$85,000 – $110,000 total"
  fridayRate: string;               // e.g. "$195 – $240 / guest" (~20-25% discount vs Saturday)
  sundayRate: string;               // e.g. "$200 – $250 / guest"
  weekdayRate?: string;             // e.g. "$150 – $190 / guest"
  saturdayMinGuestCount: number;    // e.g. 200 or 250
  fridayMinGuestCount: number;      // e.g. 150
  sundayMinGuestCount: number;      // e.g. 150
  peakSeasonMonths: string;         // e.g. "May, June, September, October"
  offPeakSeasonDiscount: string;    // e.g. "15%–25% off per guest in Jan–March or mid-summer July/August"
  realCouplesRedditQuotes: string[];// Quotes from Reddit r/DesiWeddings & r/WedditNYC
  hiddenFeesAndSurcharges: string[];// Surcharges reported by couples (admin fees, outside catering buyout, ceremony fees, etc.)
  insiderNegotiationTips: string[]; // Negotiation tips from real couples
}

export interface VenueTouringHours {
  weekdayHours: string;          // e.g. "10:00 AM – 6:00 PM (Tue–Fri, Closed Mon)"
  saturdayHours: string;         // e.g. "09:30 AM – 1:30 PM (Morning Only before evening Baraat)"
  sundayHours: string;           // e.g. "10:00 AM – 2:30 PM"
  latestSaturdayTourStart: string; // e.g. "12:30 PM"
  latestWeekdayTourStart: string;  // e.g. "05:00 PM"
  appointmentRequirement: 'appointment_only' | 'advance_booking_required' | 'open_walkthrough';
  closedDays?: string[];         // e.g. ["Monday"]
  specialTouringNotes?: string;  // e.g. "Private estate grounds close at 2:00 PM for private evening wedding setup."
}

export interface StopTouringStatus {
  isWithinHours: boolean;
  status: 'valid' | 'closing_soon' | 'outside_hours' | 'closed_day';
  badgeLabel: string;
  warningMessage?: string;
  recommendedTimeWindow?: string;
}

export interface VenueOption {
  id: string;
  weddingId: string;
  name: string;
  type: 'hotel_ballroom' | 'historic_estate' | 'banquet_hall' | 'resort' | 'golf_club' | 'convention_center';
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  pricing: VenueCostBreakdown;
  desiFeatures: VenueDesiCapabilities;
  nearestHotel?: NearestHotelInfo;
  curatedState?: 'NJ' | 'PA' | string;
  popularityScore?: number; // 1 to 100
  serviceRating?: VenueServiceRating;
  historicalPriceTier?: '$' | '$$' | '$$$' | '$$$$';
  historicalPricingIntelligence?: VenueDayPricingVariance;
  touringHours?: VenueTouringHours;
  availableDates: string[]; // e.g. ["2026-10-24 (Sat)", "2026-11-07 (Sat)"]
  tourStatus: VenueStatus;
  tourScheduledDate?: string;
  tourScheduledTime?: string;
  pros: string[];
  cons: string[];
  rating?: number; // 1 to 5
  notes: string;
  isFavorite?: boolean;
  isSelectedOfficialVenue?: boolean;
}

export type VenuePricingQuoteType =
  | 'flat_total'             // Scenario A (Rockleigh): 1 total package amount
  | 'per_person_whole_day'   // Scenario B (The Grove): 1 price per person for whole day
  | 'per_person_per_event';  // Scenario C (Legacy Castle): Price per person for each event (wedding & reception)

export interface AvailableVenueDateEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek?: string; // e.g. "Saturday"
  isPreferred?: boolean;
  isHold?: boolean;
  holdExpiresDate?: string; // YYYY-MM-DD
  notes?: string; // e.g. "Holds until Friday 5pm" or "Grand Ballroom"
  customPriceOverride?: number; // e.g. 75000 for June/July vs 85000 for Sept
  pricingOverrideType?: 'flat_total' | 'per_person'; // Whether date override is a flat lump sum or per person
  seasonLabel?: string; // e.g. "Summer Rate (June/July)" or "Peak Fall (Sept)"
}

export interface UserVenueCustomQuote {
  venueId: string;
  userId?: string;
  updatedAt: string; // ISO timestamp

  // Pricing Model
  pricingType: VenuePricingQuoteType;

  // Scenario A: Flat lump sum package amount (e.g. Rockleigh)
  flatTotalAmount?: number; // e.g. 65000

  // Scenario B: Single per-person rate for the whole day (e.g. The Grove)
  perPersonWholeDayRate?: number; // e.g. 180

  // Scenario C: Separate per-person rate per event (e.g. Legacy Castle)
  perPersonWeddingRate?: number; // e.g. 95 (wedding ceremony & lunch)
  perPersonReceptionRate?: number; // e.g. 165 (reception dinner)
  weddingGuestCountOverride?: number;
  receptionGuestCountOverride?: number;

  // Additional Fees & Inclusions
  ceremonyFee?: number; // e.g. $2,500 ballroom rental / mandap fee
  outsideCateringRoyaltyFeePerGuest?: number;
  serviceChargePercent?: number; // e.g. 22%
  taxPercent?: number; // e.g. 6.625%
  isTaxAndServiceIncluded?: boolean; // Whether the quote already includes tax and service

  // Available Dates & Date-Specific Pricing (e.g. 75k for June/July, 85k for Sept)
  availableDates: AvailableVenueDateEntry[];
  selectedDateId?: string; // ID of the currently selected date to price against

  // Vendor Call & Coordinator Details
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  callDate?: string; // YYYY-MM-DD
  callNotes?: string;
  depositRequiredAmount?: number;
  depositDueNotes?: string;
}

export interface EffectiveVenuePricingResult {
  isCustomUserQuote: boolean;
  pricingType?: VenuePricingQuoteType;
  estimatedTotalCost: number;
  costPerGuest: number;
  breakdownSummary: string;
  quoteLabel?: string;
  availableDates: AvailableVenueDateEntry[];
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  callNotes?: string;
  depositRequiredAmount?: number;
  depositDueNotes?: string;
  isTaxAndServiceIncluded?: boolean;
  serviceChargePercent?: number;
  taxPercent?: number;
  ceremonyFee?: number;
  morningCeremonyTotal?: number;
  eveningReceptionTotal?: number;
  activeDate?: AvailableVenueDateEntry;
  hasDateSpecificPricing?: boolean;
}

export interface FamilyAddressInput {
  side: 'groom' | 'bride' | 'neutral_meeting';
  label: string; // e.g. "Groom's Parents (Jersey City)" or "Bride's Family (Edison)"
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface ProfileSavedAddress {
  id: string;
  userId: string;
  label: string; // e.g. "Groom's Parents (Lawrence Twp)", "Bride's Family (Mountain Top)"
  side?: 'groom' | 'bride' | 'mutual' | 'other';
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ScheduledTourStop {
  stopOrder: number;
  venueId: string;
  venueName: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  suggestedArrivalTime: string; // e.g. "10:00 AM"
  suggestedTourWindow: string; // e.g. "10:00 AM - 11:00 AM (60 min tour & Q&A)"
  suggestedDepartureTime: string; // e.g. "11:00 AM"
  tourDurationMinutes?: number; // Custom time allocated for this venue (e.g. 30, 45, 60, 75, 90 mins)
  drivingMinutesFromPrev?: number;
  distanceMilesFromPrev?: number;
  drivingTimeToNextMinutes?: number;
  distanceToNextMiles?: number;
  nextStopName?: string;
  notesOrQuestionsToAsk: string[];
  touringHours?: VenueTouringHours;
  touringStatus?: StopTouringStatus;
  isLockedTime?: boolean;
  lockedTime?: string;
  appointmentBookingAdvice?: string;
}

export type DualFamilyMeetingMode =
  | 'meet_at_first_venue'
  | 'carpool_pickup'
  | 'single_family_start';

export interface FamilyDepartureDetail {
  side: 'groom' | 'bride';
  familyLabel: string;
  homeAddress: string;
  homeCity: string;
  recommendedDepartureTime: string;
  drivingMinutesToFirstStop: number;
  distanceMilesToFirstStop: number;
}

export interface DualFamilyStartPlan {
  mode: DualFamilyMeetingMode;
  firstMeetingPointName: string;
  groomDeparture: FamilyDepartureDetail;
  brideDeparture: FamilyDepartureDetail;
  rendezvousArrivalTime: string;
  travelDiscrepancyMinutes: number;
  fairnessSummary: string;
  pickupOrder?: {
    driverSide: 'groom' | 'bride';
    passengerSide: 'groom' | 'bride';
    pickupTime: string;
    chaiBufferMinutes: number;
    pickupAddress: string;
    pickupCity: string;
    drivingMinutesToPickup: number;
    distanceMilesToPickup: number;
  };
}

export type StartTimePlanningMode = 'venue_arrival' | 'family_departure';

export interface SiteTourDayPlan {
  id: string;
  weddingId: string;
  tourDate: string; // YYYY-MM-DD
  startLocation: FamilyAddressInput;
  secondFamilyLocation?: FamilyAddressInput;
  meetingMode?: DualFamilyMeetingMode;
  dualFamilyStartPlan?: DualFamilyStartPlan;
  dayStartTime: string; // e.g. "09:30 AM"
  startTimePlanningMode?: StartTimePlanningMode;
  durationPerTourMinutes: number; // e.g. 60
  customVenueDurations?: Record<string, number>; // venueId -> minutes (e.g. { 'v-1': 30, 'v-2': 75 })
  bufferBetweenToursMinutes: number; // e.g. 15
  includesLunchBreak: boolean;
  lunchBreakWindow?: { startTime: string; durationMinutes: number; note: string };
  selectedVenueIds: string[];
  optimizedStops: ScheduledTourStop[];
  totalEstDrivingMinutes: number;
  totalEstDistanceMiles: number;
  googleMapsMultiStopUrl: string;
  notes?: string;
  lockedAppointmentTimes?: Record<string, string>;
  hasLockedAppointments?: boolean;
  hasTimingWarnings?: boolean;
  timingWarningsCount?: number;
}

export type WeddingTradition = 'traditional_desi' | 'south_indian' | 'fusion_mixed';

export interface PersonAstrologyProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // e.g. "10:30 AM"
  birthPlace?: string; // e.g. "Chicago, IL, USA"
  rashi?: string; // Vedic Moon Sign (e.g. "Mesha (Aries)", "Karka (Cancer)", etc.)
  nakshatra?: string; // Birth Star (e.g. "Rohini", "Swati", etc.)
  sunSign?: string; // Sun sign
}

export interface CompatibilityPillar {
  name: string;
  sanskritName: string;
  score: number;
  maxScore: number;
  description: string;
  verdict: 'Excellent' | 'Good' | 'Fair';
}

export interface PoruthamItem {
  name: string;
  status: 'Compatible' | 'Partially Compatible' | 'Neutral';
  description: string;
}

export interface HoroscopeCompatibilityReport {
  score: number; // e.g. 29 out of 36
  maxScore: number; // 36
  percentage: number; // e.g. 81%
  verdict: 'Uttam (Highly Auspicious Match)' | 'Shubh (Very Good Match)' | 'Madhyam (Good Harmony)' | 'Dynamic Growth Union';
  summary: string;
  archetype: {
    title: string;
    description: string;
    elementalBlend: string;
  };
  pillars: CompatibilityPillar[];
  poruthams?: PoruthamItem[];
  luckyElements: {
    colors: string[];
    gemstones: string[];
    auspiciousDays: string[];
    sacredFlora: string[];
    planetaryDeity: string;
    mantraOrBlessing: string;
  };
  relationshipStrengths: string[];
  remediesAndAdvice: string[];
  calculatedAt?: string;
}

export interface WeddingHoroscopeData {
  bride: PersonAstrologyProfile;
  groom: PersonAstrologyProfile;
  report?: HoroscopeCompatibilityReport;
}

export interface WeddingProfile {
  id: string;
  ownerId: string;
  brideName: string;
  groomName: string;
  slug: string;
  tradition?: WeddingTradition;
  startDate: string;
  endDate: string;
  city: string;
  venueName: string;
  currency: 'INR' | 'USD' | 'GBP' | 'CAD' | 'AED';
  targetBudget: number;
  guestCount?: number;
  story: string;
  hashtag: string;
  coverImage?: string;
  isConfigured?: boolean;
  horoscope?: WeddingHoroscopeData;
}

// -------------------------------------------------------------
// SANGEET & PRE-WEDDING CELEBRATION VENUES & TRIANGULATION
// -------------------------------------------------------------
export interface SangeetDesiFeatures {
  largeDanceFloor: boolean;
  stageAvLighting: boolean;
  soundCurfew: string; // e.g. "01:30 AM", "02:00 AM", "12:00 AM"
  allowsLiveChaat: boolean; // Live chaat, tandoori & dosa stalls
  allowsBhangraDhol: boolean;
  hotelOnSite: boolean;
  cateringPolicy: 'in_house_indian' | 'outside_approved_caterers' | 'both_allowed';
}

export interface SangeetVenueOption {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: 'NJ' | 'PA';
  zipCode: string;
  latitude: number;
  longitude: number;
  pricePerGuest: number; // e.g. 52 ($45 - $80 typical)
  hallRentalFee: number; // e.g. 1500 or 0
  estimatedTotalCost: number; // Calculated base or ~250-300 guests
  maxCapacity: number; // e.g. 500
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  desiFeatures: SangeetDesiFeatures;
  highlightTag: string; // e.g. "🏆 Central NJ Indian Banquet Epicenter"
  description: string;
  curatedNotes: string;
}

export interface SangeetTriangulationMetrics {
  groomDistanceMiles: number;
  groomDriveMinutes: number;
  brideDistanceMiles: number;
  brideDriveMinutes: number;
  mainVenueDistanceMiles: number;
  mainVenueDriveMinutes: number;
  fairnessScore: number; // 0-100: how balanced between Groom & Bride
  convenienceScore: number; // 0-100: factoring main venue guest lodging
  triangulationScore: number; // Combined weighted score (0-100)
  fairnessVerdict: string; // Human readable explanation
  isNearMainVenueHotelBlock: boolean; // within 25 mins of main venue
  travelDeltaMinutes: number; // Difference between Groom drive and Bride drive
}

export interface RankedSangeetVenue {
  venue: SangeetVenueOption;
  metrics: SangeetTriangulationMetrics;
  totalCostForGuests: number;
  costPerGuest: number;
}
