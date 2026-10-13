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
    | 'Trousseau / Attire';
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
  pastGivenRecord?: string; // e.g. "They gave ₹11,000 at Rohit's wedding"
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

export interface WeddingProfile {
  id: string;
  ownerId: string;
  brideName: string;
  groomName: string;
  slug: string;
  startDate: string;
  endDate: string;
  city: string;
  venueName: string;
  currency: 'INR' | 'USD' | 'GBP' | 'CAD' | 'AED';
  targetBudget: number;
  story: string;
  hashtag: string;
  coverImage?: string;
}
