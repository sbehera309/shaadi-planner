import { SubEventType, RequirementCategory, WeddingEvent } from './types';

export interface EventDecisionBlueprint {
  id: string;
  title: string;
  category: RequirementCategory;
  description: string;
  decisionType: 'venue' | 'food' | 'entertainment' | 'decor' | 'attire' | 'ritual' | 'transport';
  options?: string[];
  defaultSelected?: boolean;
  tip?: string;
}

export type EventSortOrder = 'priority' | 'chronological' | 'needs_planning';

export interface EventBlueprint {
  type: SubEventType;
  name: string;
  tagline: string;
  defaultTime: { start: string; end: string };
  bannerGradient: string;
  description: string;
  dressCode: string;
  colorTheme: string;
  venueType: string;
  planningPriority: number; // 1 = highest lead-time, e.g. Baraat/Pheras, 2 = Sangeet, 3 = Reception
  chronologicalRank: number; // 1 = Roka, 2 = Mehndi, 3 = Haldi, 4 = Sangeet, 5 = Pheras, 6 = Reception
  priorityBadge: {
    label: string;
    level: 'critical' | 'high' | 'medium';
    color: string;
  };
  decisions: EventDecisionBlueprint[];
}

export const EVENT_BLUEPRINTS: Record<SubEventType, EventBlueprint> = {
  pheras: {
    type: 'pheras',
    name: 'Baraat, Mandap Ceremony & Pheras (Wedding Day)',
    tagline: 'Groom procession, sacred fire rituals, Vedic vows & feast',
    defaultTime: { start: '15:30', end: '20:30' },
    bannerGradient: 'from-rose-800 via-crimson-800 to-red-900',
    description: 'The sacred heart of the wedding: outdoor Baraat entry with Dhol, welcoming Milni, Mandap rituals, and 7 sacred pheras.',
    dressCode: 'Regal Traditional Heritage: Royal Crimson, Sindoori Red, Gold & Ivory Sherwanis',
    colorTheme: '#DC2626',
    venueType: 'Grand Mandap Lawn or Estate Ballroom',
    planningPriority: 1, // Core ceremony: highest lead time
    chronologicalRank: 5,
    priorityBadge: {
      label: '🔥 Core Ceremony (Highest Lead Time)',
      level: 'critical',
      color: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    decisions: [
      {
        id: 'baraat-transport',
        title: 'Baraat Procession Vehicle: Horse (Ghodi) or Vintage Convertible Car + City Permit',
        category: 'Transport & Entry',
        decisionType: 'transport',
        description: 'Decide groom entry transport and ensure local USA municipality permit for parking lot or street procession is approved.',
        tip: 'Check if the hotel or city requires specialized equestrian insurance or police escort for road rolling closures.',
        defaultSelected: true,
      },
      {
        id: 'baraat-dhol',
        title: 'Live Dhol Squad & Mobile Sound Truck for Baraat',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: '2-4 live energetic Punjabi Dhol players and a sound vehicle for high-energy dancing during the procession.',
        defaultSelected: true,
      },
      {
        id: 'pheras-saafa',
        title: 'Saafas (Turbans) for Ladkewale & Professional Tying Specialist',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Pre-order matching pastel or silk turbans for groom family male guests and hire a quick on-site tying team.',
        defaultSelected: true,
      },
      {
        id: 'pheras-pandit',
        title: 'Pandit Ji & Vedic Havan Kund Samagri Kit (Ghee, Coconuts, Camphor)',
        category: 'Puja Samagri & Rituals',
        decisionType: 'ritual',
        description: 'Confirm the Hindu Priest (Pandit Ji) and verify the venue approves open-flame indoor Havan or outdoor Mandap.',
        tip: 'Check USA fire alarm regulations with the venue for the sacred fire ceremony.',
        defaultSelected: true,
      },
      {
        id: 'pheras-jaimala',
        title: 'Fresh Lotus & Rose Jaimalas (Varmala Garlands)',
        category: 'Puja Samagri & Rituals',
        decisionType: 'decor',
        description: 'Custom fragrant flower garlands for the initial garland exchange ceremony.',
        defaultSelected: true,
      },
      {
        id: 'pheras-jewelry',
        title: 'Safe-Keeping for Mangalsutra, Sindoor Box & Wedding Rings',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'ritual',
        description: 'Assign a designated family coordinator to hold and present sacred marriage symbols at the exact ritual moment.',
        defaultSelected: true,
      },
      {
        id: 'pheras-feast',
        title: 'Traditional Pure Vegetarian Satvik Wedding Feast',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Authentic regional feast (Gujarati/Punjabi/South Indian) served immediately following pheras.',
        defaultSelected: true,
      },
    ],
  },
  sangeet: {
    type: 'sangeet',
    name: 'Sangeet & Garba Celebration Night',
    tagline: 'High-energy music, family dance performances & live food stations',
    defaultTime: { start: '18:30', end: '23:30' },
    bannerGradient: 'from-amber-600 via-rose-700 to-purple-800',
    description: 'The liveliest night of the wedding with choreographies, DJ beats, Chaat counters, and cocktails.',
    dressCode: 'Glamorous Indo-Western, Lehengas & Kurta Sets with Mirror Work',
    colorTheme: '#D97706',
    venueType: 'Ballroom with Hardwood Dance Floor & Sound Permit',
    planningPriority: 2, // High priority party
    chronologicalRank: 4,
    priorityBadge: {
      label: '⚡ High-Impact Party (Late Sound Curfew)',
      level: 'high',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    decisions: [
      {
        id: 'sangeet-venue',
        title: 'Venue with Dance Floor & Late-Night Sound Permit',
        category: 'Decor, Props & Staging',
        decisionType: 'venue',
        description: 'Ensure the ballroom has adequate hardwood dance floor space and municipal clearance for high-decibel music past 10 PM in the USA.',
        tip: 'Ask the venue if amplified sound is permitted until 12 AM or if a strict 10 PM sound curfew applies.',
        defaultSelected: true,
      },
      {
        id: 'sangeet-dj',
        title: 'DJ, Sound Engineer, Intelligent Lighting & Live Dhol Squad',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Hire an experienced Indian wedding DJ who can mix Bollywood, Punjabi, and Western hits, plus live Dhol players for dance floor hype.',
        tip: 'Ensure they supply wireless microphones for family MCs and speech toasts.',
        defaultSelected: true,
      },
      {
        id: 'sangeet-food',
        title: 'Live Chaat Counter, Indo-Fusion Appetizers & Open Bar',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Sangeet food is best served cocktail-style with interactive live stations (Pani Puri, Kathi Rolls, Slider bars).',
        tip: 'Keep passed hors d’oeuvres flowing so guests can eat between dance performances.',
        defaultSelected: true,
      },
      {
        id: 'sangeet-decor',
        title: 'Stage Staging, LED Video Backdrop & Custom Dance Floor Wrap',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'A raised performance stage with LED wall for family visuals and a monogrammed vinyl dance floor wrap.',
        defaultSelected: true,
      },
      {
        id: 'sangeet-choreography',
        title: 'Choreographer & Family Dance Performance Order',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Schedule rehearsals for bride vs groom side dances, friend groups, and the couple’s signature performance.',
        tip: 'Cap performances to 35-45 minutes total to maintain high party energy.',
        defaultSelected: true,
      },
    ],
  },
  reception: {
    type: 'reception',
    name: 'Black-Tie Grand Wedding Reception',
    tagline: 'Formal banquet, grand entrances, first dance & celebration',
    defaultTime: { start: '19:00', end: '00:30' },
    bannerGradient: 'from-stone-900 via-zinc-900 to-slate-950',
    description: 'Formal celebration with champagne toasts, emotional speeches, 4-course dinner banquet, and dance floor party.',
    dressCode: 'Black Tie Tuxedos, Dinner Jackets & Designer Evening Gowns / Lehengas',
    colorTheme: '#1F2937',
    venueType: 'Luxury Hotel Ballroom / Country Club Estate',
    planningPriority: 3, // High priority gala
    chronologicalRank: 6,
    priorityBadge: {
      label: '🥂 Grand Gala (Ballroom & Catering)',
      level: 'high',
      color: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    decisions: [
      {
        id: 'reception-venue',
        title: 'Luxury Ballroom Venue & Table Seating Chart',
        category: 'Decor, Props & Staging',
        decisionType: 'venue',
        description: 'Spacious banquet hall with head sweetheart table, assigned guest tables, and dance floor.',
        defaultSelected: true,
      },
      {
        id: 'reception-catering',
        title: '4-Course Gourmet Dinner Banquet & Top-Shelf Open Bar',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Plated or upscale buffet dinner featuring premium culinary selections and curated signature cocktails.',
        defaultSelected: true,
      },
      {
        id: 'reception-cake',
        title: 'Custom Multi-Tier Wedding Cake & Floral Table Staging',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Designer cake in couple’s favorite flavors with champagne flutes and cake-cutting ceremony set.',
        defaultSelected: true,
      },
      {
        id: 'reception-dj',
        title: 'Reception DJ & MC for Grand Entrances, First Dance & Speeches',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Professional Master of Ceremonies to coordinate program flow, entrance walkouts, toasts, and dance playlist.',
        defaultSelected: true,
      },
      {
        id: 'reception-photo',
        title: 'Photo & Video: Couple Sunset Portraits & Highlight Film',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Schedule dedicated 45 minutes for formal couple and immediate family portraits before guests enter.',
        defaultSelected: true,
      },
    ],
  },
  mehendi: {
    type: 'mehendi',
    name: 'Mehndi Ceremony & Lounge',
    tagline: 'Intimate Henna ritual with folk tunes, floral decor & favors',
    defaultTime: { start: '13:00', end: '17:00' },
    bannerGradient: 'from-emerald-700 to-teal-800',
    description: 'Traditional Henna application afternoon for the bride, bridal party, and female relatives with relaxed music and chai.',
    dressCode: 'Bright Jewel Tones: Parrot Green, Fuchsia Pink & Mustard Yellow',
    colorTheme: '#059669',
    venueType: 'Garden Terrace or Boutique Banquet Lounge',
    planningPriority: 4,
    chronologicalRank: 2,
    priorityBadge: {
      label: '🌿 Festive Lounge (Henna Artists)',
      level: 'medium',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    decisions: [
      {
        id: 'mehndi-artist',
        title: 'Bridal Henna Artist & 2+ Fast Henna Artists for Guests',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'ritual',
        description: 'Book a specialized bridal artist for intricate arms/feet designs, and assistant artists for guests.',
        tip: 'Estimate ~5-8 minutes per guest hand to avoid bottlenecks.',
        defaultSelected: true,
      },
      {
        id: 'mehndi-decor',
        title: 'Colorful Mehndi Lounge: Low Seating, Bolsters & Floral Swing',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Comfortable bohemian seating with colorful Moroccan poufs, cushions, and a floral photo-op swing for the bride.',
        defaultSelected: true,
      },
      {
        id: 'mehndi-food',
        title: 'Afternoon Refreshments: Masala Chai, Mocktails & Indian Street Snacks',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Light bite-sized snacks that are easy to eat with one hand while henna is drying on the other.',
        defaultSelected: true,
      },
      {
        id: 'mehndi-music',
        title: 'Traditional Dholki & Acoustic Indian Playlist',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Curate classic folk wedding songs, Sufi acoustics, and upbeat Bollywood unplugged tracks.',
        defaultSelected: true,
      },
      {
        id: 'mehndi-favors',
        title: 'Favors: Silk Bangles, Bindi Booklets & Embroidered Potli Bags',
        category: 'Food, Drinks & Favors',
        decisionType: 'ritual',
        description: 'Set up an interactive Bangle & Potli Bar where guests can pick up custom accessories.',
        defaultSelected: true,
      },
    ],
  },
  haldi: {
    type: 'haldi',
    name: 'Haldi & Chooda Ceremony',
    tagline: 'Turmeric blessings, marigold petal shower & celebratory brunch',
    defaultTime: { start: '10:00', end: '12:30' },
    bannerGradient: 'from-amber-500 to-orange-600',
    description: 'Auspicious turmeric paste application for natural glow and blessings, followed by flower petal splash.',
    dressCode: 'Sunshine Yellow, Ochre Kurtas & Floral Printed Sarees',
    colorTheme: '#F59E0B',
    venueType: 'Courtyard, Lawn or Poolside Area with Wash Stations',
    planningPriority: 5,
    chronologicalRank: 3,
    priorityBadge: {
      label: '💛 Joyful Ritual (Turmeric & Floral)',
      level: 'medium',
      color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    },
    decisions: [
      {
        id: 'haldi-samagri',
        title: 'Organic Ubtan Paste, Rosewater & Brass Urli Bowl',
        category: 'Puja Samagri & Rituals',
        decisionType: 'ritual',
        description: 'Skin-friendly organic turmeric mixed with sandalwood, gram flour, and rosewater in a large brass Urli.',
        tip: 'Use organic culinary-grade turmeric to prevent skin staining.',
        defaultSelected: true,
      },
      {
        id: 'haldi-petals',
        title: 'Fresh Marigold & Sunflower Petal Baskets for Floral Splash',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Plenty of loose fresh flower petals for guests to shower over the couple for vibrant photo moments.',
        defaultSelected: true,
      },
      {
        id: 'haldi-decor',
        title: 'Yellow Floral Backdrop & Splash-Safe Flooring Mats',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Bright marigold garlands, draping, and waterproof flooring to prevent outdoor grass or marble from staining.',
        defaultSelected: true,
      },
      {
        id: 'haldi-brunch',
        title: 'Indian Breakfast Brunch Catering',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Fresh Idli/Dosa stations, hot Puri Bhaji, Masala Chai, and fresh fruit juices.',
        defaultSelected: true,
      },
    ],
  },
  roka: {
    type: 'roka',
    name: 'Roka & Sagan Ceremony',
    tagline: 'Intimate family formalization, Chunni ceremony & blessing',
    defaultTime: { start: '11:00', end: '15:00' },
    bannerGradient: 'from-amber-700 to-yellow-800',
    description: 'Intimate family gathering formalizing the union with dry fruit baskets, gift envelopes, and luncheon.',
    dressCode: 'Semi-Formal Traditional / Smart Ethnic',
    colorTheme: '#B45309',
    planningPriority: 6,
    chronologicalRank: 1,
    priorityBadge: {
      label: '💍 Kick-off (Intimate Gathering)',
      level: 'medium',
      color: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    venueType: 'Private Dining Room, Banquet Lounge or Family Home',
    decisions: [
      {
        id: 'roka-venue',
        title: 'Intimate Venue or Private Dining Hall for Close Family',
        category: 'Decor, Props & Staging',
        decisionType: 'venue',
        description: 'Reserve private room for 30-75 guests with seating for elders and gift blessing area.',
        defaultSelected: true,
      },
      {
        id: 'roka-gifts',
        title: 'Silver Coins, Mithai Boxes, Dry Fruit Hampers & Sagan Envelopes',
        category: 'Food, Drinks & Favors',
        decisionType: 'ritual',
        description: 'Traditional gift hampers for close relatives from each family side.',
        defaultSelected: true,
      },
      {
        id: 'roka-chunni',
        title: 'Red Chunni (Dupatta) & Shagun Blessing Set',
        category: 'Puja Samagri & Rituals',
        decisionType: 'ritual',
        description: 'Groom family presents auspicious red Chunni, jewelry, and sweets to the bride.',
        defaultSelected: true,
      },
    ],
  },
  baraat: {
    type: 'baraat',
    name: 'Standalone Baraat Procession',
    tagline: 'Groom entry parade, live dhol beats & welcoming milni',
    defaultTime: { start: '14:30', end: '16:00' },
    bannerGradient: 'from-orange-700 to-amber-900',
    description: 'Procession with groom transport, live drumming, and celebratory dancing.',
    dressCode: 'Sherwanis & Festive Attire',
    colorTheme: '#C2410C',
    planningPriority: 1,
    chronologicalRank: 5,
    priorityBadge: {
      label: '🐎 Procession & Permits',
      level: 'critical',
      color: 'bg-orange-100 text-orange-900 border-orange-300',
    },
    venueType: 'Hotel Entrance Driveway or Designated Street Route',
    decisions: [
      {
        id: 'standalone-baraat-permit',
        title: 'Secure Municipality & Venue Permission for Outdoor Baraat',
        category: 'Transport & Entry',
        decisionType: 'transport',
        description: 'Confirm permit for outdoor noise and procession route.',
        defaultSelected: true,
      },
      {
        id: 'standalone-baraat-dhol',
        title: 'Book Dhol Squad & Portable Sound System Truck',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Live percussionists for the procession.',
        defaultSelected: true,
      },
    ],
  },
  vidaai: {
    type: 'vidaai',
    name: 'Vidaai & Doli Farewell',
    tagline: 'Emotional bride farewell & getaway car send-off',
    defaultTime: { start: '20:30', end: '21:30' },
    bannerGradient: 'from-rose-950 to-stone-900',
    description: 'Emotional farewell ceremony with rice tossing ritual and doli car departure.',
    dressCode: 'Wedding Ceremony Attire',
    colorTheme: '#4C0519',
    planningPriority: 5,
    chronologicalRank: 6,
    priorityBadge: {
      label: '🚗 Send-off & Transport',
      level: 'medium',
      color: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    venueType: 'Mandap Venue Exit / Portico',
    decisions: [
      {
        id: 'vidaai-ritual',
        title: 'Prepare Rice / Grain Baskets for Traditional Tossing',
        category: 'Puja Samagri & Rituals',
        decisionType: 'ritual',
        description: 'Bride tosses puffed rice over her head as a blessing of prosperity for her parents’ home.',
        defaultSelected: true,
      },
      {
        id: 'vidaai-car',
        title: 'Decorated Farewell Getaway Car (Doli Vehicle)',
        category: 'Transport & Entry',
        decisionType: 'transport',
        description: 'Decorated car with flowers and driver ready at the portico.',
        defaultSelected: true,
      },
    ],
  },
  custom: {
    type: 'custom',
    name: 'Custom Celebration',
    tagline: 'Personalized wedding gathering or dinner',
    defaultTime: { start: '18:00', end: '22:00' },
    bannerGradient: 'from-stone-800 to-stone-950',
    description: 'Personalized wedding gathering or dinner.',
    dressCode: 'Festive Attire',
    colorTheme: '#374151',
    planningPriority: 6,
    chronologicalRank: 7,
    priorityBadge: {
      label: '✨ Custom Event',
      level: 'medium',
      color: 'bg-stone-100 text-stone-800 border-stone-300',
    },
    venueType: 'Private Venue',
    decisions: [
      {
        id: 'custom-venue',
        title: 'Reserve Venue & Finalize Food/Bar Service',
        category: 'Food, Drinks & Favors',
        decisionType: 'venue',
        description: 'Coordinate gathering location and catering setup.',
        defaultSelected: true,
      },
    ],
  },
};

export function sortEventsBy(
  events: WeddingEvent[],
  sortBy: EventSortOrder
): WeddingEvent[] {
  const cloned = [...events];

  if (sortBy === 'priority') {
    return cloned.sort((a, b) => {
      const pA = EVENT_BLUEPRINTS[a.type]?.planningPriority ?? 99;
      const pB = EVENT_BLUEPRINTS[b.type]?.planningPriority ?? 99;
      return pA - pB;
    });
  }

  if (sortBy === 'needs_planning') {
    return cloned.sort((a, b) => {
      const aPlanned =
        Boolean(a.venueName && a.venueName !== 'TBD' && a.venueName !== 'Venue TBA') ||
        Boolean(a.checklist && a.checklist.length > 0);
      const bPlanned =
        Boolean(b.venueName && b.venueName !== 'TBD' && b.venueName !== 'Venue TBA') ||
        Boolean(b.checklist && b.checklist.length > 0);

      // Unplanned first
      if (!aPlanned && bPlanned) return -1;
      if (aPlanned && !bPlanned) return 1;

      // Secondary: priority
      const pA = EVENT_BLUEPRINTS[a.type]?.planningPriority ?? 99;
      const pB = EVENT_BLUEPRINTS[b.type]?.planningPriority ?? 99;
      return pA - pB;
    });
  }

  // 'chronological':
  return cloned.sort((a, b) => {
    // If dates are present and differ, sort by date then time
    if (a.date && b.date && a.date !== b.date && a.date !== 'TBD' && b.date !== 'TBD') {
      return a.date.localeCompare(b.date);
    }
    // Fall back to traditional ritual sequence
    const rA = EVENT_BLUEPRINTS[a.type]?.chronologicalRank ?? 99;
    const rB = EVENT_BLUEPRINTS[b.type]?.chronologicalRank ?? 99;
    return rA - rB;
  });
}
