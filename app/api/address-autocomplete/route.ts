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

// Built-in high-fidelity tri-state & nationwide Desi wedding hubs
const LOCAL_ADDRESS_DATABASE: AddressSuggestion[] = [
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
    primaryText: '10 Exchange Place',
    secondaryText: 'Jersey City, NJ 07302, USA',
    fullAddress: '10 Exchange Place, Jersey City, NJ 07302',
    street: '10 Exchange Place',
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
    id: 'local-edison-oak-tree',
    primaryText: '88 Oak Tree Road',
    secondaryText: 'Edison, NJ 08820, USA',
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
    id: 'local-parsippany-rt46',
    primaryText: '199 Smith Road',
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
    id: 'local-morristown-south-st',
    primaryText: '2 Whippany Road',
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
    id: 'local-somerset-davidson',
    primaryText: '333 Davidson Avenue',
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
    primaryText: '1200 Market Street',
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
    id: 'local-voorhees-main-st',
    primaryText: '3000 Main Street',
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
    id: 'local-kop-mall-blvd',
    primaryText: '160 N Gulph Road',
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
    primaryText: '1112 Broad Street',
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
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const queryLower = query.toLowerCase();

  // 1. Check local pre-populated high-fidelity database first
  const localMatches = LOCAL_ADDRESS_DATABASE.filter(
    (item) =>
      item.fullAddress.toLowerCase().includes(queryLower) ||
      item.street.toLowerCase().includes(queryLower) ||
      item.city.toLowerCase().includes(queryLower) ||
      item.zipCode.includes(query)
  );

  // 2. Check if Google Places API Key is configured in environment
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
            return NextResponse.json({
              suggestions: googleSuggestions.slice(0, 5),
              provider: 'google',
            });
          }
        }
      }
    } catch {
      // Fall through to public geocoder or local matches
    }
  }

  // 3. Fallback: Query OpenStreetMap / Photon geocoder
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const osmRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'ShaadiPlanner/1.0' },
      }
    );
    clearTimeout(timeoutId);

    if (osmRes.ok) {
      const data = await osmRes.json();
      if (data.features && data.features.length > 0) {
        const osmSuggestions: AddressSuggestion[] = data.features
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

        if (osmSuggestions.length > 0) {
          // Merge local matches with OSM suggestions
          const combined = [...localMatches, ...osmSuggestions];
          const unique = Array.from(new Map(combined.map((item) => [item.fullAddress, item])).values());
          return NextResponse.json({
            suggestions: unique.slice(0, 6),
            provider: 'osm',
          });
        }
      }
    }
  } catch {
    // If network fetch fails (e.g. offline sandbox), return local matches
  }

  // 4. Return local matches or structured parse of user query
  if (localMatches.length > 0) {
    return NextResponse.json({
      suggestions: localMatches.slice(0, 5),
      provider: 'local',
    });
  }

  // 5. If user typed an address not in DB, generate structured fallback suggestion
  const parsedParts = query.split(',').map((s) => s.trim());
  const fallbackStreet = parsedParts[0] || query;
  const fallbackCity = parsedParts[1] || 'Jersey City';
  const fallbackStateZip = parsedParts[2] || 'NJ';
  const fallbackState = fallbackStateZip.split(' ')[0] || 'NJ';
  const fallbackZip = fallbackStateZip.split(' ')[1] || '07302';

  const generatedFallback: AddressSuggestion = {
    id: `custom-${Date.now()}`,
    primaryText: fallbackStreet,
    secondaryText: `${fallbackCity}, ${fallbackState} ${fallbackZip}, USA`,
    fullAddress: `${fallbackStreet}, ${fallbackCity}, ${fallbackState} ${fallbackZip}`,
    street: fallbackStreet,
    city: fallbackCity,
    state: fallbackState,
    zipCode: fallbackZip,
    source: 'places',
  };

  return NextResponse.json({
    suggestions: [generatedFallback],
    provider: 'heuristic',
  });
}
