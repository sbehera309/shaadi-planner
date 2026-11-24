export interface RecommendedHotel {
  id: string;
  name: string;
  city: string;
  distanceNote: string;
  phone: string;
  typicalRateRange: string;
  blockType: 'Courtesy Block (0% Attrition)' | 'Courtesy + Contracted Options';
  likelyFreePerks: string[];
  desiWeddingTip: string;
}

export interface HotelPerkNegotiationItem {
  id: string;
  title: string;
  howToGetIt: string;
  typicalValue: string;
  priority: 'Must Ask' | 'High Value' | 'Bonus';
}

export const HOTEL_BLOCK_FREE_PERKS: HotelPerkNegotiationItem[] = [
  {
    id: 'shuttle',
    title: 'Complimentary Round-Trip Venue Shuttle',
    howToGetIt:
      'Most suburban NJ/NY/PA hotels include a free 14-to-24 passenger shuttle once you hit 15–20 booked rooms/night. Ask for continuous loops before Baraat and after Reception.',
    typicalValue: 'Saves $1,200 – $2,500',
    priority: 'Must Ask',
  },
  {
    id: 'courtesy-block',
    title: 'Courtesy Block (0% Financial Attrition)',
    howToGetIt:
      'Always ask for a "Courtesy Block" of 15–20 rooms first so unbooked rooms release back to the hotel 30 days prior at $0 penalty—with a clause to add 10 more rooms at the same rate once 80% fills.',
    typicalValue: 'Zero financial risk',
    priority: 'Must Ask',
  },
  {
    id: 'bridal-suite',
    title: 'Free Bridal / Getting-Ready Suite Upgrade',
    howToGetIt:
      'Ask for 1 complimentary suite upgrade (or 1 comp room per 15–20 rooms picked up) for morning hair, makeup, saree draping, and Baraat turban tying.',
    typicalValue: 'Saves $400 – $900/night',
    priority: 'Must Ask',
  },
  {
    id: 'welcome-bags',
    title: 'Free Welcome Bag Handout at Front Desk',
    howToGetIt:
      'Hotels often charge $3–$5 per bag for distribution. Ask them to waive the welcome bag fee completely for front-desk check-in handouts.',
    typicalValue: 'Saves $200 – $500',
    priority: 'High Value',
  },
  {
    id: 'early-late',
    title: 'Early Check-In & Late Check-Out (2 PM)',
    howToGetIt:
      'Critical for Desi weddings with morning Baraat/Pheras and midnight Receptions. Request priority early check-in for immediate family and a 1–2 PM late check-out on departure day.',
    typicalValue: 'Stress-free morning prep',
    priority: 'High Value',
  },
  {
    id: 'hospitality-room',
    title: 'Complimentary Hospitality Suite / Chai Room',
    howToGetIt:
      'Ask if they can include a small meeting room or connecting suite for family morning chai, snacks, or elders to rest between Ceremony and Reception.',
    typicalValue: 'Saves $500 – $1,000',
    priority: 'High Value',
  },
  {
    id: 'breakfast-parking',
    title: 'Free Breakfast, Wi-Fi & Self-Parking',
    howToGetIt:
      'Confirm self-parking is free and ask for breakfast vouchers (or pick a Residence Inn / Embassy Suites / Hampton Inn where hot breakfast is free for every guest).',
    typicalValue: 'Saves $25 – $40/guest/day',
    priority: 'Bonus',
  },
  {
    id: 'booking-link',
    title: 'Custom Booking Link + 21-Day Cutoff',
    howToGetIt:
      'Request a direct online booking URL (easier than phone codes for guests) and negotiate the room-release cutoff from 30 days down to 21 days before the wedding.',
    typicalValue: 'Higher guest pickup',
    priority: 'Bonus',
  },
];

interface VenueHotelCluster {
  regionLabel: string;
  matchKeywords: string[];
  hotels: RecommendedHotel[];
}

const VENUE_HOTEL_CLUSTERS: VenueHotelCluster[] = [
  {
    regionLabel: 'The Rockleigh / Bergen County & Rockland Area',
    matchKeywords: ['rockleigh', 'bergen', 'montvale', 'woodcliff', 'park ridge', 'pearl river', 'alpine', 'englewood', 'closter', 'norwood'],
    hotels: [
      {
        id: 'hilton-pearl-river',
        name: 'Hilton Pearl River',
        city: 'Pearl River, NY',
        distanceNote: '~5 min drive (3–4 mi) north of The Rockleigh',
        phone: '(845) 735-9000',
        typicalRateRange: '$179 – $239/night',
        blockType: 'Courtesy + Contracted Options',
        likelyFreePerks: ['Courtesy block (10–15+ rooms)', 'Custom online booking link', 'Spacious getting-ready suites', 'Free parking'],
        desiWeddingTip: 'Physically the closest upscale hotel to The Rockleigh. Ask for their Rockleigh Preferred Wedding Rate and partner shuttle credits (standard blocks rarely include a free private bus, so quick 5-min local shuttle loops keep transit costs low).',
      },
      {
        id: 'marriott-park-ridge',
        name: 'Marriott Park Ridge',
        city: 'Park Ridge, NJ',
        distanceNote: '~10–15 min drive west of The Rockleigh',
        phone: '(201) 307-0800',
        typicalRateRange: '$169 – $219/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['0% attrition courtesy block', 'PR Social Bar + Kitchen for after-party', 'M Club Lounge & indoor/outdoor pools', 'Comp Bridal Suite upgrade'],
        desiWeddingTip: 'Very experienced with multi-event Indian wedding weekends at The Rockleigh. Great hub for a late-night after-party at PR Social Bar + Kitchen and a morning-after farewell breakfast; ask about shuttle partner discounts.',
      },
      {
        id: 'courtyard-montvale',
        name: 'Courtyard by Marriott Montvale',
        city: 'Montvale, NJ',
        distanceNote: '~9 min drive (4.5 mi) from The Rockleigh',
        phone: '(201) 391-7700',
        typicalRateRange: '$149 – $189/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['0% attrition courtesy block (10–15 rooms)', 'Free parking', 'Custom online booking link', 'Free welcome bag handout'],
        desiWeddingTip: 'Great budget-friendly secondary block for friends and cousins alongside a luxury primary hotel.',
      },
      {
        id: 'residence-inn-orangeburg',
        name: 'Residence Inn by Marriott Orangeburg',
        city: 'Orangeburg, NY',
        distanceNote: '~9 min drive (4.1 mi) from The Rockleigh',
        phone: '(845) 359-5200',
        typicalRateRange: '$169 – $215/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['Free hot breakfast for all guests', 'Full kitchens in suites (great for chai/kids)', 'Free parking', '0% attrition courtesy block'],
        desiWeddingTip: 'Elders and families with young kids love Residence Inn because every room is a suite with a kitchen and free hot breakfast.',
      },
    ],
  },
  {
    regionLabel: 'The Legacy Castle / Pompton Plains & Wayne, NJ',
    matchKeywords: ['legacy castle', 'pompton', 'wayne', 'parsippany', 'fairfield', 'morristown', 'westmount', 'woodland park'],
    hotels: [
      {
        id: 'courtyard-wayne-fairfield',
        name: 'Courtyard by Marriott Wayne Fairfield',
        city: 'Wayne, NJ',
        distanceNote: '~10 min drive from Legacy Castle / Westmount',
        phone: '(973) 646-3377',
        typicalRateRange: '$149 – $189/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['0% attrition courtesy block', 'Free self-parking', 'Free welcome bag distribution', 'Custom booking link'],
        desiWeddingTip: 'Ask for their Legacy Castle preferred wedding block rate and early check-in for immediate family.',
      },
      {
        id: 'residence-inn-wayne',
        name: 'Residence Inn by Marriott Wayne',
        city: 'Wayne, NJ',
        distanceNote: '~9 min drive from Legacy Castle',
        phone: '(973) 872-7100',
        typicalRateRange: '$169 – $209/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['Free hot breakfast daily', 'Suite kitchens for family chai/prep', 'Free parking', 'Complimentary suite upgrade'],
        desiWeddingTip: 'Ideal for immediate family and out-of-town relatives staying 2–3 nights.',
      },
      {
        id: 'hilton-parsippany',
        name: 'Hilton Parsippany',
        city: 'Parsippany, NJ',
        distanceNote: '~16 min drive from Legacy Castle',
        phone: '(973) 267-7373',
        typicalRateRange: '$159 – $219/night',
        blockType: 'Courtesy + Contracted Options',
        likelyFreePerks: ['Large room inventory (350+ rooms)', 'Hospitality suites for Haldi/Mehendi', 'Shuttle negotiation available', 'Free parking'],
        desiWeddingTip: 'Very familiar with multi-day South Asian weddings—can also host your Haldi or Mehndi brunch.',
      },
    ],
  },
  {
    regionLabel: 'Park Chateau / East Brunswick & Central NJ',
    matchKeywords: ['park chateau', 'east brunswick', 'edison', 'somerset', 'piscataway', 'marigold', 'fords', 'woodbridge', 'new brunswick'],
    hotels: [
      {
        id: 'chateau-grande-eb',
        name: 'Chateau Grande Hotel',
        city: 'East Brunswick, NJ',
        distanceNote: 'On-site next to Park Chateau Estate',
        phone: '(732) 724-4600',
        typicalRateRange: '$249 – $329/night',
        blockType: 'Courtesy + Contracted Options',
        likelyFreePerks: ['Walkable to Park Chateau (no shuttle needed!)', 'Luxury bridal getting-ready suites', 'On-site after-party lounge'],
        desiWeddingTip: 'Reserve early for immediate family and bridal party; pair with Hilton East Brunswick 5 minutes away for a budget-friendly second block.',
      },
      {
        id: 'hilton-east-brunswick',
        name: 'Hilton East Brunswick Hotel',
        city: 'East Brunswick, NJ',
        distanceNote: '~5 min drive from Park Chateau / Edison',
        phone: '(732) 828-2000',
        typicalRateRange: '$159 – $209/night',
        blockType: 'Courtesy + Contracted Options',
        likelyFreePerks: ['Complimentary shuttle negotiation', 'Large suites for getting ready', 'Free parking', 'Very experienced with Desi weddings'],
        desiWeddingTip: 'A Central NJ Desi wedding staple—ask for waived welcome bag fees and a complimentary bridal hospitality room.',
      },
      {
        id: 'delta-somerset',
        name: 'Delta Hotels by Marriott Somerset',
        city: 'Somerset, NJ',
        distanceNote: '~8 min from The Marigold / ~15 min from Edison',
        phone: '(732) 560-0500',
        typicalRateRange: '$149 – $189/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['0% attrition courtesy block', 'Free parking', 'Complimentary upgrade for couple', 'Custom booking URL'],
        desiWeddingTip: 'Great value for large family blocks in Middlesex/Somerset County.',
      },
    ],
  },
  {
    regionLabel: 'The Grove / Crystal Plaza / The Venetian (North NJ)',
    matchKeywords: ['grove', 'cedar grove', 'crystal plaza', 'livingston', 'venetian', 'garfield', 'saddle brook', 'west orange', 'short hills', 'montclair', 'pleasantdale'],
    hotels: [
      {
        id: 'westminster-livingston',
        name: 'The Westminster Hotel',
        city: 'Livingston, NJ',
        distanceNote: '~4 min from Crystal Plaza / ~12 min from The Grove',
        phone: '(973) 533-0600',
        typicalRateRange: '$189 – $249/night',
        blockType: 'Courtesy + Contracted Options',
        likelyFreePerks: ['Complimentary shuttle option to Crystal Plaza', 'Upscale lobby bar for after-party', 'Comp Bridal Suite with block'],
        desiWeddingTip: 'Top partner hotel for Crystal Plaza & Pleasantdale Chateau weddings.',
      },
      {
        id: 'mc-hotel-montclair',
        name: 'The MC Hotel, Autograph Collection',
        city: 'Montclair, NJ',
        distanceNote: '~8 min drive from The Grove',
        phone: '(844) 624-6835',
        typicalRateRange: '$219 – $289/night',
        blockType: 'Courtesy + Contracted Options',
        likelyFreePerks: ['Rooftop bar for welcome drinks / after-party', 'Boutique getting-ready suites', 'Custom Marriott booking link'],
        desiWeddingTip: 'Very stylish for wedding party & friends; pair with Marriott Saddle Brook or Courtyard West Orange for larger family blocks.',
      },
      {
        id: 'marriott-saddle-brook',
        name: 'Marriott Saddle Brook',
        city: 'Saddle Brook, NJ',
        distanceNote: '~7 min drive from The Venetian / ~14 min from The Grove',
        phone: '(201) 843-9500',
        typicalRateRange: '$159 – $199/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['0% attrition courtesy block', 'Free parking', 'Shuttle negotiation at 15–20 rooms', 'Free welcome bag handout'],
        desiWeddingTip: 'Closest full-service Marriott to The Venetian in Garfield.',
      },
    ],
  },
  {
    regionLabel: 'Northeast PA (Sugarloaf / Hazleton / Mountain Top / Wilkes-Barre)',
    matchKeywords: ['sugarloaf', 'valley country club', 'hazleton', 'mountain top', 'wilkes-barre', 'mohegan', 'scranton', 'conyngham'],
    hotels: [
      {
        id: 'hampton-inn-hazleton',
        name: 'Hampton Inn Hazleton',
        city: 'Hazleton, PA',
        distanceNote: '~10 min drive from Valley Country Club (Sugarloaf)',
        phone: '(570) 454-3449',
        typicalRateRange: '$129 – $169/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['Free hot breakfast for all guests', '0% attrition courtesy block', 'Free parking', 'Free welcome bag handout'],
        desiWeddingTip: 'Right off I-81 near Sugarloaf; ask for a courtesy block of 15–20 rooms with free early check-in.',
      },
      {
        id: 'residence-inn-hazleton',
        name: 'Residence Inn by Marriott Hazleton',
        city: 'Hazleton, PA',
        distanceNote: '~11 min drive from Valley Country Club',
        phone: '(570) 455-9555',
        typicalRateRange: '$149 – $189/night',
        blockType: 'Courtesy Block (0% Attrition)',
        likelyFreePerks: ['Full kitchen suites for families', 'Free hot breakfast', 'Free parking', '0% attrition courtesy block'],
        desiWeddingTip: 'Great for immediate family needing extra space for outfits, steamers, and morning chai.',
      },
      {
        id: 'mohegan-pa-hotel',
        name: 'Mohegan Pennsylvania Hotel',
        city: 'Wilkes-Barre, PA',
        distanceNote: '~20 min from Mountain Top / ~30 min from Sugarloaf',
        phone: '(570) 831-2100',
        typicalRateRange: '$159 – $239/night',
        blockType: 'Courtesy + Contracted Options',
        likelyFreePerks: ['Resort amenities, dining & spa on-site', 'Large suite options for getting ready', 'Free valet/self-parking'],
        desiWeddingTip: 'Fun resort option if guests want entertainment and restaurants on-site.',
      },
    ],
  },
];

export interface VenueHotelRecommendations {
  matchedRegionLabel: string;
  hotels: RecommendedHotel[];
  isExactMatch: boolean;
}

export const getRecommendedHotelsForVenue = (
  venueName?: string,
  venueLocation?: string
): VenueHotelRecommendations => {
  const haystack = `${venueName || ''} ${venueLocation || ''}`.toLowerCase().trim();
  if (haystack) {
    for (const cluster of VENUE_HOTEL_CLUSTERS) {
      if (cluster.matchKeywords.some((kw) => haystack.includes(kw))) {
        return {
          matchedRegionLabel: cluster.regionLabel,
          hotels: cluster.hotels,
          isExactMatch: true,
        };
      }
    }
  }
  // Default fallback: show Bergen/Rockleigh + Central NJ highlights and encourage Google Maps search
  return {
    matchedRegionLabel: 'Popular NJ / NY / PA Wedding Block Hotels',
    hotels: [
      VENUE_HOTEL_CLUSTERS[0].hotels[0],
      VENUE_HOTEL_CLUSTERS[0].hotels[1],
      VENUE_HOTEL_CLUSTERS[2].hotels[1],
      VENUE_HOTEL_CLUSTERS[4].hotels[0],
    ],
    isExactMatch: false,
  };
};

export const buildHotelOutreachScript = (params: {
  coupleNames: string;
  venueName: string;
  checkInDate: string;
  checkOutDate: string;
  estimatedRooms: number;
  hotelName?: string;
}): string => {
  const { coupleNames, venueName, checkInDate, checkOutDate, estimatedRooms, hotelName } = params;
  return `Subject: Wedding Room Block Inquiry — ${coupleNames} (${checkInDate} to ${checkOutDate})

Hi ${hotelName ? `${hotelName} Sales Team` : 'Sales Team'},

We are hosting our wedding celebrations at ${venueName} and are looking to set up a hotel room block for our out-of-town family and friends.

• Dates: ${checkInDate} – ${checkOutDate}
• Estimated Rooms Needed: ~${estimatedRooms} rooms per night (mix of King & Double Queen)
• Block Type Preferred: Courtesy Block (0% attrition) with the ability to add rooms if the block fills

Could you please share your group rates along with what complimentary perks you can include with our block? Specifically, we would love to know about:
1. Complimentary round-trip shuttle to/from ${venueName} (and minimum room pickup required)
2. Complimentary Bridal / Getting-Ready Suite upgrade (or comp room ratio)
3. Waived welcome bag distribution fee at the front desk
4. Priority early check-in (for morning ceremony prep) & late check-out
5. Custom online booking link & room-release cutoff date

Thank you so much — looking forward to hearing from you!

Best regards,
${coupleNames}`;
};
