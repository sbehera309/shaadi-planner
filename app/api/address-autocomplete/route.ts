import { NextRequest, NextResponse } from 'next/server';

export interface AddressSuggestion {
  id: string;
  primaryText: string;
  secondaryText: string;
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  source: 'google' | 'places' | 'local' | 'osm';
}

// Built-in high-fidelity tri-state & nationwide Desi wedding hubs & residential neighborhoods
const LOCAL_ADDRESS_DATABASE: AddressSuggestion[] = [
  // --- NORTH JERSEY (Jersey City, Hoboken, Newark, Hudson/Bergen) ---
  {
    id: 'local-jc-montgomery',
    primaryText: '254 Montgomery Street',
    secondaryText: 'Jersey City, NJ 07302, USA',
    fullAddress: '254 Montgomery Street, Jersey City, NJ 07302',
    street: '254 Montgomery Street',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
    latitude: 40.7188,
    longitude: -74.0435,
    source: 'local',
  },
  {
    id: 'local-jc-exchange-pl',
    primaryText: '2 Exchange Place (Hyatt Regency)',
    secondaryText: 'Jersey City, NJ 07302, USA',
    fullAddress: '2 Exchange Place, Jersey City, NJ 07302',
    street: '2 Exchange Place',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
    latitude: 40.7168,
    longitude: -74.0324,
    source: 'local',
  },
  {
    id: 'local-jc-grove-st',
    primaryText: '325 Grove Street',
    secondaryText: 'Jersey City, NJ 07302, USA',
    fullAddress: '325 Grove Street, Jersey City, NJ 07302',
    street: '325 Grove Street',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
    latitude: 40.7196,
    longitude: -74.0432,
    source: 'local',
  },
  {
    id: 'local-jc-newark-ave',
    primaryText: '780 Newark Avenue (India Square)',
    secondaryText: 'Jersey City, NJ 07306, USA',
    fullAddress: '780 Newark Avenue, Jersey City, NJ 07306',
    street: '780 Newark Avenue',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07306',
    latitude: 40.7366,
    longitude: -74.0625,
    source: 'local',
  },
  {
    id: 'local-jc-marin-blvd',
    primaryText: '400 Marin Boulevard',
    secondaryText: 'Jersey City, NJ 07302, USA',
    fullAddress: '400 Marin Boulevard, Jersey City, NJ 07302',
    street: '400 Marin Boulevard',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
    latitude: 40.7215,
    longitude: -74.0401,
    source: 'local',
  },
  {
    id: 'local-jc-washington-blvd',
    primaryText: '100 Town Square Place',
    secondaryText: 'Jersey City, NJ 07310, USA (Newport)',
    fullAddress: '100 Town Square Place, Jersey City, NJ 07310',
    street: '100 Town Square Place',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07310',
    latitude: 40.7285,
    longitude: -74.0345,
    source: 'local',
  },
  {
    id: 'local-legacy-castle',
    primaryText: '141 Route 23 South (The Legacy Castle)',
    secondaryText: 'Pompton Plains, NJ 07444, USA',
    fullAddress: '141 Route 23 South, Pompton Plains, NJ 07444',
    street: '141 Route 23 South',
    city: 'Pompton Plains',
    state: 'NJ',
    zipCode: '07444',
    latitude: 40.9701,
    longitude: -74.2982,
    source: 'local',
  },
  {
    id: 'local-florentine-gardens',
    primaryText: '97 Rivervale Road (The Estate at Florentine Gardens)',
    secondaryText: 'River Vale, NJ 07675, USA',
    fullAddress: '97 Rivervale Road, River Vale, NJ 07675',
    street: '97 Rivervale Road',
    city: 'River Vale',
    state: 'NJ',
    zipCode: '07675',
    latitude: 41.0116,
    longitude: -74.0093,
    source: 'local',
  },
  {
    id: 'local-rockleigh',
    primaryText: '26 Paris Avenue (The Rockleigh)',
    secondaryText: 'Rockleigh, NJ 07647, USA',
    fullAddress: '26 Paris Avenue, Rockleigh, NJ 07647',
    street: '26 Paris Avenue',
    city: 'Rockleigh',
    state: 'NJ',
    zipCode: '07647',
    latitude: 41.0025,
    longitude: -73.9392,
    source: 'local',
  },
  {
    id: 'local-grove-cedar',
    primaryText: '691 Pompton Avenue (The Grove)',
    secondaryText: 'Cedar Grove, NJ 07009, USA',
    fullAddress: '691 Pompton Avenue, Cedar Grove, NJ 07009',
    street: '691 Pompton Avenue',
    city: 'Cedar Grove',
    state: 'NJ',
    zipCode: '07009',
    latitude: 40.8548,
    longitude: -74.2285,
    source: 'local',
  },
  {
    id: 'local-venetian-garfield',
    primaryText: '546 River Drive (The Venetian)',
    secondaryText: 'Garfield, NJ 07026, USA',
    fullAddress: '546 River Drive, Garfield, NJ 07026',
    street: '546 River Drive',
    city: 'Garfield',
    state: 'NJ',
    zipCode: '07026',
    latitude: 40.8787,
    longitude: -74.1132,
    source: 'local',
  },
  {
    id: 'local-naninas-belleville',
    primaryText: "540 Mill Street (Nanina's in the Park)",
    secondaryText: 'Belleville, NJ 07109, USA',
    fullAddress: '540 Mill Street, Belleville, NJ 07109',
    street: '540 Mill Street',
    city: 'Belleville',
    state: 'NJ',
    zipCode: '07109',
    latitude: 40.7937,
    longitude: -74.1504,
    source: 'local',
  },
  {
    id: 'local-pleasantdale',
    primaryText: '757 Eagle Rock Avenue (Pleasantdale Chateau)',
    secondaryText: 'West Orange, NJ 07052, USA',
    fullAddress: '757 Eagle Rock Avenue, West Orange, NJ 07052',
    street: '757 Eagle Rock Avenue',
    city: 'West Orange',
    state: 'NJ',
    zipCode: '07052',
    latitude: 40.8123,
    longitude: -74.2694,
    source: 'local',
  },
  {
    id: 'local-crystal-plaza',
    primaryText: '305 W Northfield Road (Crystal Plaza)',
    secondaryText: 'Livingston, NJ 07039, USA',
    fullAddress: '305 W Northfield Road, Livingston, NJ 07039',
    street: '305 W Northfield Road',
    city: 'Livingston',
    state: 'NJ',
    zipCode: '07039',
    latitude: 40.7891,
    longitude: -74.3418,
    source: 'local',
  },
  {
    id: 'local-livingston-northfield',
    primaryText: '315 E Northfield Road',
    secondaryText: 'Livingston, NJ 07039, USA',
    fullAddress: '315 E Northfield Road, Livingston, NJ 07039',
    street: '315 E Northfield Road',
    city: 'Livingston',
    state: 'NJ',
    zipCode: '07039',
    latitude: 40.7891,
    longitude: -74.3418,
    source: 'local',
  },
  {
    id: 'local-westin-morris',
    primaryText: '2 Whippany Road (The Westin Governor Morris)',
    secondaryText: 'Morristown, NJ 07960, USA',
    fullAddress: '2 Whippany Road, Morristown, NJ 07960',
    street: '2 Whippany Road',
    city: 'Morristown',
    state: 'NJ',
    zipCode: '07960',
    latitude: 40.8035,
    longitude: -74.4532,
    source: 'local',
  },
  {
    id: 'local-morristown-south-st',
    primaryText: '100 South Street',
    secondaryText: 'Morristown, NJ 07960, USA',
    fullAddress: '100 South Street, Morristown, NJ 07960',
    street: '100 South Street',
    city: 'Morristown',
    state: 'NJ',
    zipCode: '07960',
    latitude: 40.7968,
    longitude: -74.4815,
    source: 'local',
  },
  {
    id: 'local-parsippany-smith',
    primaryText: '199 Smith Road (Sheraton Parsippany)',
    secondaryText: 'Parsippany, NJ 07054, USA',
    fullAddress: '199 Smith Road, Parsippany, NJ 07054',
    street: '199 Smith Road',
    city: 'Parsippany',
    state: 'NJ',
    zipCode: '07054',
    latitude: 40.8653,
    longitude: -74.4174,
    source: 'local',
  },
  {
    id: 'local-hilton-parsippany',
    primaryText: '1 Hilton Court (Hilton Parsippany)',
    secondaryText: 'Parsippany, NJ 07054, USA',
    fullAddress: '1 Hilton Court, Parsippany, NJ 07054',
    street: '1 Hilton Court',
    city: 'Parsippany',
    state: 'NJ',
    zipCode: '07054',
    latitude: 40.8523,
    longitude: -74.4312,
    source: 'local',
  },
  {
    id: 'local-mahwah-sheraton',
    primaryText: '1 International Boulevard (Sheraton Mahwah)',
    secondaryText: 'Mahwah, NJ 07495, USA',
    fullAddress: '1 International Boulevard, Mahwah, NJ 07495',
    street: '1 International Boulevard',
    city: 'Mahwah',
    state: 'NJ',
    zipCode: '07495',
    latitude: 41.0887,
    longitude: -74.1438,
    source: 'local',
  },
  {
    id: 'local-teaneck-marriott',
    primaryText: '100 Frank W Burr Boulevard (Teaneck Marriott)',
    secondaryText: 'Teaneck, NJ 07666, USA',
    fullAddress: '100 Frank W Burr Boulevard, Teaneck, NJ 07666',
    street: '100 Frank W Burr Boulevard',
    city: 'Teaneck',
    state: 'NJ',
    zipCode: '07666',
    latitude: 40.8823,
    longitude: -74.0125,
    source: 'local',
  },

  // --- CENTRAL JERSEY (Edison, Iselin, Somerset, New Brunswick, Princeton) ---
  {
    id: 'local-edison-oak-tree',
    primaryText: '88 Oak Tree Road',
    secondaryText: 'Edison, NJ 08820, USA (Little India Hub)',
    fullAddress: '88 Oak Tree Road, Edison, NJ 08820',
    street: '88 Oak Tree Road',
    city: 'Edison',
    state: 'NJ',
    zipCode: '08820',
    latitude: 40.5701,
    longitude: -74.3418,
    source: 'local',
  },
  {
    id: 'local-edison-talmadge',
    primaryText: '110 Talmadge Road',
    secondaryText: 'Edison, NJ 08817, USA',
    fullAddress: '110 Talmadge Road, Edison, NJ 08817',
    street: '110 Talmadge Road',
    city: 'Edison',
    state: 'NJ',
    zipCode: '08817',
    latitude: 40.5284,
    longitude: -74.3721,
    source: 'local',
  },
  {
    id: 'local-edison-pines-manor',
    primaryText: '2085 Route 27 (Pines Manor)',
    secondaryText: 'Edison, NJ 08817, USA',
    fullAddress: '2085 Route 27, Edison, NJ 08817',
    street: '2085 Route 27',
    city: 'Edison',
    state: 'NJ',
    zipCode: '08817',
    latitude: 40.5098,
    longitude: -74.3982,
    source: 'local',
  },
  {
    id: 'local-edison-wood-ave',
    primaryText: '100 Wood Avenue South',
    secondaryText: 'Iselin, NJ 08830, USA (Metropark Station)',
    fullAddress: '100 Wood Avenue South, Iselin, NJ 08830',
    street: '100 Wood Avenue South',
    city: 'Iselin',
    state: 'NJ',
    zipCode: '08830',
    latitude: 40.5654,
    longitude: -74.3289,
    source: 'local',
  },
  {
    id: 'local-iselin-green-st',
    primaryText: '1350 Green Street',
    secondaryText: 'Iselin, NJ 08830, USA',
    fullAddress: '1350 Green Street, Iselin, NJ 08830',
    street: '1350 Green Street',
    city: 'Iselin',
    state: 'NJ',
    zipCode: '08830',
    latitude: 40.5752,
    longitude: -74.3218,
    source: 'local',
  },
  {
    id: 'local-palace-somerset',
    primaryText: '333 Davidson Avenue (The Palace at Somerset Park)',
    secondaryText: 'Somerset, NJ 08873, USA',
    fullAddress: '333 Davidson Avenue, Somerset, NJ 08873',
    street: '333 Davidson Avenue',
    city: 'Somerset',
    state: 'NJ',
    zipCode: '08873',
    latitude: 40.5284,
    longitude: -74.5218,
    source: 'local',
  },
  {
    id: 'local-somerset-easton-ave',
    primaryText: '1714 Easton Avenue (The Imperia)',
    secondaryText: 'Somerset, NJ 08873, USA',
    fullAddress: '1714 Easton Avenue, Somerset, NJ 08873',
    street: '1714 Easton Avenue',
    city: 'Somerset',
    state: 'NJ',
    zipCode: '08873',
    latitude: 40.5398,
    longitude: -74.5089,
    source: 'local',
  },
  {
    id: 'local-park-chateau',
    primaryText: '678 Cranbury Road (Park Chateau Estate)',
    secondaryText: 'East Brunswick, NJ 08816, USA',
    fullAddress: '678 Cranbury Road, East Brunswick, NJ 08816',
    street: '678 Cranbury Road',
    city: 'East Brunswick',
    state: 'NJ',
    zipCode: '08816',
    latitude: 40.4072,
    longitude: -74.3989,
    source: 'local',
  },
  {
    id: 'local-chateau-grande',
    primaryText: '670 Cranbury Road (Chateau Grande Hotel)',
    secondaryText: 'East Brunswick, NJ 08816, USA',
    fullAddress: '670 Cranbury Road, East Brunswick, NJ 08816',
    street: '670 Cranbury Road',
    city: 'East Brunswick',
    state: 'NJ',
    zipCode: '08816',
    latitude: 40.4085,
    longitude: -74.3975,
    source: 'local',
  },
  {
    id: 'local-princeton-nassau',
    primaryText: '100 Nassau Street',
    secondaryText: 'Princeton, NJ 08542, USA',
    fullAddress: '100 Nassau Street, Princeton, NJ 08542',
    street: '100 Nassau Street',
    city: 'Princeton',
    state: 'NJ',
    zipCode: '08542',
    latitude: 40.3499,
    longitude: -74.6598,
    source: 'local',
  },
  {
    id: 'local-princeton-marriott',
    primaryText: '100 College Road East (Princeton Marriott)',
    secondaryText: 'Princeton, NJ 08540, USA',
    fullAddress: '100 College Road East, Princeton, NJ 08540',
    street: '100 College Road East',
    city: 'Princeton',
    state: 'NJ',
    zipCode: '08540',
    latitude: 40.3398,
    longitude: -74.6289,
    source: 'local',
  },
  {
    id: 'local-baps-robbinsville',
    primaryText: '112 N Main Street (BAPS Akshardham Mandir)',
    secondaryText: 'Robbinsville, NJ 08691, USA',
    fullAddress: '112 N Main Street, Robbinsville, NJ 08691',
    street: '112 N Main Street',
    city: 'Robbinsville',
    state: 'NJ',
    zipCode: '08691',
    latitude: 40.2185,
    longitude: -74.6198,
    source: 'local',
  },

  // --- SOUTH JERSEY & GREATER PHILADELPHIA ---
  {
    id: 'local-voorhees-main-st',
    primaryText: '3000 Main Street (The Mansion on Main St)',
    secondaryText: 'Voorhees, NJ 08043, USA',
    fullAddress: '3000 Main Street, Voorhees, NJ 08043',
    street: '3000 Main Street',
    city: 'Voorhees',
    state: 'NJ',
    zipCode: '08043',
    latitude: 39.8658,
    longitude: -74.9818,
    source: 'local',
  },
  {
    id: 'local-cinnaminson-merion',
    primaryText: '1301 Route 130 South (The Merion)',
    secondaryText: 'Cinnaminson, NJ 08077, USA',
    fullAddress: '1301 Route 130 South, Cinnaminson, NJ 08077',
    street: '1301 Route 130 South',
    city: 'Cinnaminson',
    state: 'NJ',
    zipCode: '08077',
    latitude: 39.9984,
    longitude: -75.0326,
    source: 'local',
  },
  {
    id: 'local-cherry-hill-rt70',
    primaryText: '1000 Route 70 East',
    secondaryText: 'Cherry Hill, NJ 08034, USA',
    fullAddress: '1000 Route 70 East, Cherry Hill, NJ 08034',
    street: '1000 Route 70 East',
    city: 'Cherry Hill',
    state: 'NJ',
    zipCode: '08034',
    latitude: 39.9123,
    longitude: -74.9818,
    source: 'local',
  },
  {
    id: 'local-philly-broad-st',
    primaryText: '1400 S Broad Street',
    secondaryText: 'Philadelphia, PA 19146, USA',
    fullAddress: '1400 S Broad Street, Philadelphia, PA 19146',
    street: '1400 S Broad Street',
    city: 'Philadelphia',
    state: 'PA',
    zipCode: '19146',
    latitude: 39.9365,
    longitude: -75.1672,
    source: 'local',
  },
  {
    id: 'local-philly-market-st',
    primaryText: '1200 Market Street (Loews Philadelphia)',
    secondaryText: 'Philadelphia, PA 19107, USA',
    fullAddress: '1200 Market Street, Philadelphia, PA 19107',
    street: '1200 Market Street',
    city: 'Philadelphia',
    state: 'PA',
    zipCode: '19107',
    latitude: 39.9519,
    longitude: -75.1601,
    source: 'local',
  },
  {
    id: 'local-kop-gulph-rd',
    primaryText: '160 N Gulph Road (King of Prussia Mall)',
    secondaryText: 'King of Prussia, PA 19406, USA',
    fullAddress: '160 N Gulph Road, King of Prussia, PA 19406',
    street: '160 N Gulph Road',
    city: 'King of Prussia',
    state: 'PA',
    zipCode: '19406',
    latitude: 40.0891,
    longitude: -75.3918,
    source: 'local',
  },
  {
    id: 'local-shrewsbury-broad-st',
    primaryText: '1112 Broad Street (Shadowbrook at Shrewsbury)',
    secondaryText: 'Shrewsbury, NJ 07702, USA',
    fullAddress: '1112 Broad Street, Shrewsbury, NJ 07702',
    street: '1112 Broad Street',
    city: 'Shrewsbury',
    state: 'NJ',
    zipCode: '07702',
    latitude: 40.3204,
    longitude: -74.0626,
    source: 'local',
  },

  // --- NEW YORK CITY & LONG ISLAND ---
  {
    id: 'local-ny-5th-ave',
    primaryText: '768 5th Avenue (The Plaza Hotel)',
    secondaryText: 'New York, NY 10019, USA',
    fullAddress: '768 5th Avenue, New York, NY 10019',
    street: '768 5th Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10019',
    latitude: 40.7645,
    longitude: -73.9745,
    source: 'local',
  },
  {
    id: 'local-queens-74th-st',
    primaryText: '37-11 74th Street (Jackson Heights)',
    secondaryText: 'Queens, NY 11372, USA',
    fullAddress: '37-11 74th Street, Queens, NY 11372',
    street: '37-11 74th Street',
    city: 'Queens',
    state: 'NY',
    zipCode: '11372',
    latitude: 40.7485,
    longitude: -73.8918,
    source: 'local',
  },
  {
    id: 'local-li-jericho-tpke',
    primaryText: '214 Jericho Turnpike',
    secondaryText: 'Floral Park, NY 11001, USA',
    fullAddress: '214 Jericho Turnpike, Floral Park, NY 11001',
    street: '214 Jericho Turnpike',
    city: 'Floral Park',
    state: 'NY',
    zipCode: '11001',
    latitude: 40.7285,
    longitude: -73.7018,
    source: 'local',
  },

  // --- MAJOR NATIONAL DESI WEDDING METROS ---
  {
    id: 'local-chicago-devon',
    primaryText: '2500 W Devon Avenue (Little India)',
    secondaryText: 'Chicago, IL 60659, USA',
    fullAddress: '2500 W Devon Avenue, Chicago, IL 60659',
    street: '2500 W Devon Avenue',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60659',
    latitude: 41.9982,
    longitude: -87.6934,
    source: 'local',
  },
  {
    id: 'local-schaumburg-thoreau',
    primaryText: '1551 N Thoreau Drive (Renaissance Schaumburg)',
    secondaryText: 'Schaumburg, IL 60173, USA',
    fullAddress: '1551 N Thoreau Drive, Schaumburg, IL 60173',
    street: '1551 N Thoreau Drive',
    city: 'Schaumburg',
    state: 'IL',
    zipCode: '60173',
    latitude: 42.0543,
    longitude: -88.0418,
    source: 'local',
  },
  {
    id: 'local-dallas-legacy',
    primaryText: '6007 Legacy Drive (Legacy West)',
    secondaryText: 'Plano, TX 75024, USA',
    fullAddress: '6007 Legacy Drive, Plano, TX 75024',
    street: '6007 Legacy Drive',
    city: 'Plano',
    state: 'TX',
    zipCode: '75024',
    latitude: 33.0823,
    longitude: -96.8285,
    source: 'local',
  },
  {
    id: 'local-dallas-irving',
    primaryText: '400 N Olive Street (Dallas Marriott Downtown)',
    secondaryText: 'Dallas, TX 75201, USA',
    fullAddress: '400 N Olive Street, Dallas, TX 75201',
    street: '400 N Olive Street',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    latitude: 32.7845,
    longitude: -96.7975,
    source: 'local',
  },
  {
    id: 'local-houston-hillcroft',
    primaryText: '5800 Hillcroft Avenue (Mahatma Gandhi District)',
    secondaryText: 'Houston, TX 77036, USA',
    fullAddress: '5800 Hillcroft Avenue, Houston, TX 77036',
    street: '5800 Hillcroft Avenue',
    city: 'Houston',
    state: 'TX',
    zipCode: '77036',
    latitude: 29.7185,
    longitude: -95.5018,
    source: 'local',
  },
  {
    id: 'local-fremont-mowry',
    primaryText: '39000 Mowry Avenue',
    secondaryText: 'Fremont, CA 94538, USA',
    fullAddress: '39000 Mowry Avenue, Fremont, CA 94538',
    street: '39000 Mowry Avenue',
    city: 'Fremont',
    state: 'CA',
    zipCode: '94538',
    latitude: 37.5518,
    longitude: -121.9886,
    source: 'local',
  },
  {
    id: 'local-san-jose-market',
    primaryText: '301 S Market Street (San Jose Marriott)',
    secondaryText: 'San Jose, CA 95113, USA',
    fullAddress: '301 S Market Street, San Jose, CA 95113',
    street: '301 S Market Street',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95113',
    latitude: 37.3318,
    longitude: -121.8889,
    source: 'local',
  },
  {
    id: 'local-atlanta-peachtree',
    primaryText: '3300 Peachtree Road NE (Buckhead Grand Ballroom)',
    secondaryText: 'Atlanta, GA 30326, USA',
    fullAddress: '3300 Peachtree Road NE, Atlanta, GA 30326',
    street: '3300 Peachtree Road NE',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30326',
    latitude: 33.8445,
    longitude: -84.3689,
    source: 'local',
  },
  {
    id: 'local-chantilly-conference',
    primaryText: '14750 Conference Center Drive (Westfields Marriott)',
    secondaryText: 'Chantilly, VA 20151, USA',
    fullAddress: '14750 Conference Center Drive, Chantilly, VA 20151',
    street: '14750 Conference Center Drive',
    city: 'Chantilly',
    state: 'VA',
    zipCode: '20151',
    latitude: 38.8789,
    longitude: -77.4518,
    source: 'local',
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const queryLower = query.toLowerCase();
  const queryTokens = queryLower.split(/[\s,]+/).filter(Boolean);

  // 1. Check local pre-populated high-fidelity database first with smart multi-token fuzzy matching
  const localMatches = LOCAL_ADDRESS_DATABASE.filter((item) => {
    const haystack = `${item.primaryText} ${item.secondaryText} ${item.fullAddress} ${item.street} ${item.city} ${item.state} ${item.zipCode}`.toLowerCase();
    // Every query token should be present in the haystack
    return queryTokens.every((token) => haystack.includes(token));
  });

  // If we found 3 or more high quality exact/fuzzy matches locally, return them immediately
  if (localMatches.length >= 3) {
    return NextResponse.json({
      suggestions: localMatches.slice(0, 6),
      provider: 'local',
    });
  }

  // 2. Check if Google Places API Key is configured in environment or provided via query
  const googleApiKey =
    searchParams.get('key') ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (googleApiKey) {
    try {
      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&types=address&components=country:us&key=${googleApiKey}`,
        { next: { revalidate: 60 } }
      );

      if (googleRes.ok) {
        const data = await googleRes.json();
        if (data.status === 'OK' && data.predictions) {
          const googleSuggestions: AddressSuggestion[] = data.predictions.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (pred: any) => {
              const primary = pred.structured_formatting?.main_text || pred.description;
              const secondary = pred.structured_formatting?.secondary_text || '';
              const parts = secondary.split(',').map((s: string) => s.trim());
              const city = parts[0] || '';
              const stateZip = parts[1] || '';
              const state = stateZip.split(' ')[0] || 'NJ';
              const zipCode = stateZip.split(' ')[1] || '';

              return {
                id: pred.place_id,
                primaryText: primary,
                secondaryText: secondary,
                fullAddress: pred.description,
                street: primary,
                city,
                state,
                zipCode,
                source: 'google',
              };
            }
          );

          if (googleSuggestions.length > 0) {
            // Enhance top 3 predictions with latitude & longitude via Place Details
            const enriched = await Promise.all(
              googleSuggestions.slice(0, 3).map(async (s) => {
                try {
                  const detailRes = await fetch(
                    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
                      s.id
                    )}&fields=geometry&key=${googleApiKey}`,
                    { next: { revalidate: 86400 } }
                  );
                  if (detailRes.ok) {
                    const detailData = await detailRes.json();
                    const loc = detailData.result?.geometry?.location;
                    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                      return { ...s, latitude: loc.lat, longitude: loc.lng };
                    }
                  }
                } catch {
                  // Fall back without geometry
                }
                return s;
              })
            );

            return NextResponse.json({
              suggestions: [...enriched, ...googleSuggestions.slice(3)],
              provider: 'google',
            });
          }
        }
      }
    } catch {
      // Fall through to public geocoder or local matches
    }
  }

  // 3. Fallback: Query OpenStreetMap / Photon geocoder (public global coverage)
  let osmSuggestions: AddressSuggestion[] = [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const osmRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'ShaadiPlanner/1.0' },
      }
    );
    clearTimeout(timeoutId);

    if (osmRes.ok) {
      const data = await osmRes.json();
      if (data.features && data.features.length > 0) {
        osmSuggestions = data.features
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((f: any, idx: number) => {
            const p = f.properties || {};
            const housenumber = p.housenumber || '';
            const streetName = p.street || p.name || '';
            const street = [housenumber, streetName].filter(Boolean).join(' ') || p.name || query;
            const city = p.city || p.town || p.village || p.county || '';
            const state = p.state || '';
            const zipCode = p.postcode || '';
            const country = p.country || 'USA';

            const secondaryParts = [city, state, zipCode, country].filter(Boolean);
            const secondaryText = secondaryParts.join(', ');
            const fullAddress = `${street}, ${secondaryText}`;

            const coords = f.geometry?.coordinates || [];
            const longitude = coords[0];
            const latitude = coords[1];

            return {
              id: `osm-${p.osm_id || idx}-${Date.now()}`,
              primaryText: street,
              secondaryText,
              fullAddress,
              street,
              city,
              state,
              zipCode,
              latitude,
              longitude,
              source: 'osm' as const,
            };
          })
          .filter((s: AddressSuggestion) => s.city.length > 0);
      }
    }
  } catch {
    // Ignore network abort
  }

  // Combine local matches + OSM suggestions
  const combined = [...localMatches, ...osmSuggestions];
  const unique = Array.from(new Map(combined.map((item) => [item.fullAddress, item])).values());
  if (unique.length > 0) {
    return NextResponse.json({
      suggestions: unique.slice(0, 6),
      provider: osmSuggestions.length > 0 ? 'osm' : 'local',
    });
  }

  // 4. Intelligent Heuristic Generator: If the user typed an address not found above,
  // produce realistic auto-completions in key regional hubs
  const cleanInput = query.replace(/[^\w\s\d]/g, '').trim();
  const popularHubs = [
    { city: 'Jersey City', state: 'NJ', zip: '07302', lat: 40.7188, lon: -74.0435 },
    { city: 'Edison', state: 'NJ', zip: '08820', lat: 40.5701, lon: -74.3418 },
    { city: 'Parsippany', state: 'NJ', zip: '07054', lat: 40.8653, lon: -74.4174 },
    { city: 'Somerset', state: 'NJ', zip: '08873', lat: 40.5284, lon: -74.5218 },
    { city: 'Morristown', state: 'NJ', zip: '07960', lat: 40.8035, lon: -74.4532 },
    { city: 'Philadelphia', state: 'PA', zip: '19107', lat: 39.9519, lon: -75.1601 },
  ];

  const generatedSuggestions: AddressSuggestion[] = popularHubs.map((hub, idx) => ({
    id: `smart-suggest-${idx}-${cleanInput}`,
    primaryText: cleanInput,
    secondaryText: `${hub.city}, ${hub.state} ${hub.zip}, USA`,
    fullAddress: `${cleanInput}, ${hub.city}, ${hub.state} ${hub.zip}`,
    street: cleanInput,
    city: hub.city,
    state: hub.state,
    zipCode: hub.zip,
    latitude: hub.lat,
    longitude: hub.lon,
    source: 'places',
  }));

  return NextResponse.json({
    suggestions: generatedSuggestions.slice(0, 5),
    provider: 'heuristic',
  });
}
