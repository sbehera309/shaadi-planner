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

export interface SiteTourDayPlan {
  id: string;
  weddingId: string;
  tourDate: string; // YYYY-MM-DD
  startLocation: FamilyAddressInput;
  secondFamilyLocation?: FamilyAddressInput;
  meetingMode?: DualFamilyMeetingMode;
  dualFamilyStartPlan?: DualFamilyStartPlan;
  dayStartTime: string; // e.g. "09:30 AM"
  durationPerTourMinutes: number; // e.g. 60
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
