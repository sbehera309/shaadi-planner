import { SubEventType, RequirementCategory, WeddingEvent, WeddingTradition } from './types';

export interface EventDecisionBlueprint {
  id: string;
  title: string;
  category: RequirementCategory;
  description: string;
  decisionType: 'venue' | 'food' | 'entertainment' | 'decor' | 'attire' | 'ritual' | 'transport';
  options?: string[];
  defaultSelected?: boolean;
  tip?: string;
  subItems?: { id: string; title: string; completed: boolean }[];
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
  timelinePhase: string; // e.g. "Pre-Wedding Kick-off", "The Wedding Day", "Grand Finale • Last Day"
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
    timelinePhase: 'The Wedding Day',
    priorityBadge: {
      label: '🔥 Core Ceremony (Highest Lead Time)',
      level: 'critical',
      color: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    decisions: [
      {
        id: 'pheras-hotel-block',
        title: 'Hotel Room Block & Welcome Hospitality Suite for Guests',
        category: 'Transport & Entry',
        decisionType: 'venue',
        description: 'Reserve a contracted courtesy hotel room block at preferred rates for traveling guests, with early check-in for the wedding party.',
        tip: 'Request a hospitality suite where family can gather for midnight chai, snacks, and dholki rehearsals.',
        defaultSelected: true,
        subItems: [
          { id: 'hb-1', title: 'Contract 25-50 room block with 30-day courtesy cut-off', completed: false },
          { id: 'hb-2', title: 'Secure hospitality suite for family gathering & midnight chai', completed: false },
          { id: 'hb-3', title: 'Coordinate front desk distribution of guest welcome bags', completed: false },
          { id: 'hb-4', title: 'Schedule wedding party early 11 AM check-in for HMUA glam', completed: false },
        ],
      },
      {
        id: 'pheras-welcome-bags',
        title: 'Hotel Welcome Bags for Out-of-Town Guests (In-Room Delivery)',
        category: 'Food, Drinks & Favors',
        decisionType: 'ritual',
        description: 'Custom hospitality bags placed in hotel guest rooms to greet family and friends flying in for the wedding weekend.',
        tip: 'Include high-protein snacks, hydration, and an easy-to-read printed weekend schedule with shuttle times.',
        defaultSelected: true,
        subItems: [
          { id: 'wb-1', title: 'Custom monogrammed jute or canvas tote bag', completed: false },
          { id: 'wb-2', title: 'Printed weekend itinerary card with shuttle schedule & attire guide', completed: false },
          { id: 'wb-3', title: 'Haldiram’s savory snacks (Bhujia, dry samosas) & gourmet sweets', completed: false },
          { id: 'wb-4', title: 'Liquid I.V. hydration packs & premium bottled water bottles', completed: false },
          { id: 'wb-5', title: 'Morning-after relief kit (Advil, antacids, breath mints, safety pins)', completed: false },
          { id: 'wb-6', title: 'Personal welcome letter signed by bride & groom', completed: false },
        ],
      },
      {
        id: 'pheras-bridal-attire',
        title: 'Bridal Wedding Lehenga, Heritage Polki/Kundan Jewelry & Accessories',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Complete bridal look including red/crimson lehenga, heavy veil draping, heirloom bridal jewelry set, and ceremonial accessories.',
        tip: 'Have a professional steam the bridal lehenga and double dupatta 3 hours before photography begins.',
        defaultSelected: true,
        subItems: [
          { id: 'ba-1', title: 'Bridal heritage lehenga, blouse, and double dupattas pressed & steamed', completed: false },
          { id: 'ba-2', title: 'Heavy Polki / Kundan choker, long haar necklace & matching earrings', completed: false },
          { id: 'ba-3', title: 'Matha Patti / Maang Tikka and bridal nose ring (Nath)', completed: false },
          { id: 'ba-4', title: 'Traditional Chooda bangles & hanging gold Kalire bells', completed: false },
          { id: 'ba-5', title: 'Bridal comfort block heels / embroidered ceremony mojris', completed: false },
          { id: 'ba-6', title: 'Bridal emergency clutch (fashion tape, safety pins, blotting sheets, mints)', completed: false },
        ],
      },
      {
        id: 'pheras-groom-attire',
        title: 'Groom Royal Sherwani, Saafa Turban, Kalgi & Mojris',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Regal groom ensemble including silk sherwani, matching churidar, jeweled kalgi, ceremonial sword/stole, and footwear.',
        tip: 'Assign a groomsman to keep the groom’s sunglasses and phone safe during the Baraat procession.',
        defaultSelected: true,
        subItems: [
          { id: 'ga-1', title: 'Embroidered silk Sherwani, churidar/trousers & inner kurta', completed: false },
          { id: 'ga-2', title: 'Matching silk Saafa (Turban) & jeweled feather Kalgi brooch', completed: false },
          { id: 'ga-3', title: 'Regal embroidered Stole / Dushala shawl with gold tassels', completed: false },
          { id: 'ga-4', title: 'Groom ceremony mojris + spare pair of cushioned socks', completed: false },
          { id: 'ga-5', title: 'Groom luxury watch, cufflinks & gold pearl mala necklace', completed: false },
        ],
      },
      {
        id: 'pheras-saafa',
        title: 'Saafas (Turbans) for Ladkewale & Professional Tying Specialist',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Pre-order 40-80 matching pastel or silk turbans for groom family male guests and hire a quick on-site tying team.',
        tip: 'Hire 2 tying specialists so all 50+ uncles and cousins are ready before Baraat step-off.',
        defaultSelected: true,
      },
      {
        id: 'baraat-transport',
        title: 'Baraat Procession Vehicle: Horse (Ghodi) vs. Dual-Use Car',
        category: 'Transport & Entry',
        decisionType: 'transport',
        description: 'Choose groom entry vehicle. 💡 Money-saving tip: If renting a vintage convertible or luxury car, use it for BOTH the Baraat procession and the Vidai / Farewell exit to eliminate a 2nd vehicle fee!',
        tip: 'If using a car for both Baraat and Vidai, you do NOT need a horse rental ($750–$1,500) or a separate getaway car ($1,000–$2,500).',
        defaultSelected: true,
        subItems: [
          { id: 'bt-1', title: 'Select mode: Dual-Use Car (Baraat + Vidai) OR Traditional Horse (Ghodi) + separate exit car', completed: false },
          { id: 'bt-2', title: 'Obtain city municipality procession permit & police rolling closure (if road used)', completed: false },
          { id: 'bt-3', title: 'Confirm hotel venue allows vehicle procession / equestrian insurance coverage', completed: false },
          { id: 'bt-4', title: 'If Car: Book decorated vintage convertible, Rolls Royce, or sports car with driver', completed: false },
          { id: 'bt-5', title: 'If Horse: Book Ghodi with ornate ceremonial saddle, chhatri (umbrella) & handler', completed: false },
        ],
      },
      {
        id: 'vidai-farewell-transport',
        title: 'Vidai (Farewell) Getaway Exit Vehicle & Luggage Coordination',
        category: 'Transport & Entry',
        decisionType: 'transport',
        description: 'Coordinate the emotional newlywed getaway exit following the ceremony.',
        tip: 'If the Baraat car was chosen for dual-use, simply have the valet or coordinator stage it at the main entrance decorated with florals/ribbon.',
        defaultSelected: true,
        subItems: [
          { id: 'vt-1', title: 'Vehicle paired: Same as Baraat car (no extra fee) OR family vehicle decorated', completed: false },
          { id: 'vt-2', title: 'Staging: Move car to porte-cochère 20 minutes before Vidai with hazard lights', completed: false },
          { id: 'vt-3', title: 'Luggage: Ensure couple honeymoon / overnight bags are loaded into trunk in advance', completed: false },
          { id: 'vt-4', title: 'Vidai samagri: Rice / puffed grain (Kheel) & coins ready for bride toss over head', completed: false },
          { id: 'vt-5', title: 'Designate sober trusted family driver or professional chauffeur', completed: false },
        ],
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
        id: 'pheras-live-music',
        title: 'Auspicious Live Musicians: Nathswaram & Thavil or Shehnai & Flute',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Traditional live classical instrumentalists to welcome guests, play during Kanyadaan, and perform sacred ragas during the main ceremony vows exchange.',
        tip: 'Nathswaram (South Indian) or Shehnai (North Indian) creates an authentic sacred Vedic atmosphere.',
        defaultSelected: true,
        subItems: [
          { id: 'lm-1', title: 'Book live Nathswaram & Thavil ensemble (or Shehnai & Flute) for 3-4 hours', completed: false },
          { id: 'lm-2', title: 'Elevated Mandap-side floor seating (Bajots / cushions) and sound microphones', completed: false },
          { id: 'lm-3', title: 'Coordinate vows time cue signals between Priest and musicians', completed: false },
          { id: 'lm-4', title: 'Provide artist hospitality & lunch arrangements', completed: false },
        ],
      },
      {
        id: 'pheras-pandit',
        title: 'Vedic Priest / Iyer / Pandit Ji & Havan Kund Samagri Kit',
        category: 'Puja Samagri & Rituals',
        decisionType: 'ritual',
        description: 'Confirm Vedic Priest / Iyer / Purohit / Pandit Ji dakshina, travel, and check if hotel approves open-flame indoor Havan or requires outdoor Mandap.',
        tip: 'Check USA fire alarm regulations with the venue for the sacred fire ceremony.',
        defaultSelected: true,
        subItems: [
          { id: 'pk-1', title: 'Confirm Priest / Iyer dakshina fees, travel, and overnight hotel room', completed: false },
          { id: 'pk-2', title: 'Vedic Samagri kit arranged (Desi ghee, dried coconut, camphor, gangajal, betel nuts)', completed: false },
          { id: 'pk-3', title: 'Venue indoor fire permit / smoke detector bypass or outdoor Mandap approval', completed: false },
        ],
      },
      {
        id: 'pheras-jaimala',
        title: 'Fresh Lotus & Rose Jaimalas (Varmala Garlands) & Milni Garlands',
        category: 'Puja Samagri & Rituals',
        decisionType: 'decor',
        description: 'Custom fragrant lotus flower garlands for couple exchange, plus 7-10 Milni garlands for key family uncles.',
        defaultSelected: true,
      },
      {
        id: 'pheras-mandap-centerpieces',
        title: 'Mandap Floral Architecture, Guest Aisle Pedestals & Chair Decor',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: '4-pillar floral Mandap, elevated sacred fire pedestal, ceremonial Bajots, and floral aisle runners.',
        defaultSelected: true,
      },
      {
        id: 'pheras-family-attire',
        title: 'Immediate Family & Bridal Party Attire (Matching Sarees, Kurtas & Safas)',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Coordinated ceremonial wardrobe for parents, siblings, bridesmaids, and groomsmen.',
        defaultSelected: true,
        subItems: [
          { id: 'fa-1', title: 'Bride & Groom immediate parents formal sarees and sherwanis steamed & ready', completed: false },
          { id: 'fa-2', title: 'Bridesmaids coordinated sarees/lehengas and groomsmen matching kurta sets', completed: false },
          { id: 'fa-3', title: 'Matching family Safas (turbans) for groom side male relatives with tying team', completed: false },
        ],
      },
      {
        id: 'pheras-jewelry',
        title: 'Safe-Keeping for Mangalsutra, Gold Coins, Sindoor & Rings',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'ritual',
        description: 'Assign a designated trusted family coordinator to hold and present sacred marriage symbols at the exact ceremony vows window.',
        defaultSelected: true,
        subItems: [
          { id: 'sym-1', title: 'Sacred Gold & Black Bead Mangalsutra in secure velvet pouch', completed: false },
          { id: 'sym-2', title: 'Auspicious gold coins or bullion for ritual shagun / blessings', completed: false },
          { id: 'sym-3', title: 'Ornate silver or brass Sindoor Dani (vermilion container)', completed: false },
          { id: 'sym-4', title: 'Bride and Groom platinum/gold wedding bands', completed: false },
        ],
      },
      {
        id: 'pheras-vendor-meals',
        title: 'Vendor Meals & Green Room Hospitality (Photo, Cinema, DJ & AV Crews)',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Contract dedicated vendor plates ($35-$50/person vs full guest rate) for 10-20 working professionals covering long 8-12 hour shifts.',
        tip: 'Feed vendors while guests are eating lunch so they are ready for the next photo session immediately after.',
        defaultSelected: true,
        subItems: [
          { id: 'vm-1', title: 'Headcount confirmed: Photo/Video (4-6), DJ/AV (2-4), Planner (2-3), Decorators (3)', completed: false },
          { id: 'vm-2', title: 'Order discounted vendor meals with caterer ($35-$40/plate)', completed: false },
          { id: 'vm-3', title: 'Set aside quiet vendor dining room / green room with cold water and hot chai', completed: false },
        ],
      },
      {
        id: 'pheras-feast',
        title: 'Traditional Pure Vegetarian Satvik Wedding Feast (Adults + Kids + Vendors)',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Authentic regional feast (Gujarati/Punjabi/South Indian) served immediately following pheras, with distinct adult, children, and vendor pricing.',
        defaultSelected: true,
        subItems: [
          { id: 'pf-1', title: 'Confirm adult meal plate count (e.g. 500 guests @ ~$50/plate)', completed: false },
          { id: 'pf-2', title: 'Confirm children meal plate count (e.g. 35-50 kids @ half price)', completed: false },
          { id: 'pf-3', title: 'Arrange live Jalebi-Fafda / Dosa / Puri counters with caterer', completed: false },
        ],
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
    chronologicalRank: 2,
    timelinePhase: 'Weekend Kick-off • Sangeet & Garba Night',
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
        id: 'sangeet-attire',
        title: 'Bride & Groom Sangeet Dance Attire, Footwear & Accessories',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Glittering dance-friendly outfits: mirror-work lehenga or indo-western gown for bride, bandhgala or kurta for groom, with comfortable dance shoes.',
        defaultSelected: true,
        subItems: [
          { id: 'sa-1', title: 'Bride lightweight mirror-work lehenga or Indo-Western gown', completed: false },
          { id: 'sa-2', title: 'Bride dance floor sneakers or supportive cushioned platforms', completed: false },
          { id: 'sa-3', title: 'Groom embroidered Bandhgala jacket / bespoke Indo-Western kurta', completed: false },
          { id: 'sa-4', title: 'Groom stylish loafers or dance shoes', completed: false },
          { id: 'sa-5', title: 'Statement earrings, maang tikka, and dance-proof hairpins', completed: false },
        ],
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
        id: 'sangeet-centerpieces',
        title: 'Table Centerpieces, Moroccan Lanterns & Party Props',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Colorful vibrant table centerpieces with brass lanterns, fresh marigold garlands, and LED dance party accessories.',
        defaultSelected: true,
        subItems: [
          { id: 'sc-1', title: 'Ornate brass Moroccan lanterns with LED candles for guest tables', completed: false },
          { id: 'sc-2', title: 'Vibrant jewel-tone table runners & embroidered napkins', completed: false },
          { id: 'sc-3', title: 'Custom LED foam glow sticks & party glasses for open dance floor', completed: false },
          { id: 'sc-4', title: 'Dandiya stick baskets if hosting Garba portion', completed: false },
        ],
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
        id: 'sangeet-floor-wrap',
        title: 'Custom Dance Floor Vinyl Wrap (Onyx Black or Monogrammed White)',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Glossy seamless vinyl dance floor wrap with bride & groom custom monogram or bold Onyx aesthetic to anchor the celebration.',
        tip: 'Verify venue allows floor wrap adhesive and schedule 3-hour morning installation window before rehearsals.',
        defaultSelected: true,
        subItems: [
          { id: 'fw-1', title: 'Submit high-resolution vector couple monogram / logo 4 weeks in advance', completed: false },
          { id: 'fw-2', title: 'Confirm exact ballroom dance floor dimensions (sq footage) with venue', completed: false },
          { id: 'fw-3', title: 'Schedule vendor installation at 10 AM & post-event midnight removal', completed: false },
        ],
      },
      {
        id: 'sangeet-lighting-production',
        title: 'Intelligent Lighting & AV Production (Visual Comet Style / Moving Heads / Uplights)',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Perimeter room uplighting, intelligent moving head dance spotlights, LED video wall, and wireless microphone systems.',
        tip: 'Often contracted with a specialized Desi event production company (like Visual Comet) separate from basic DJ decks.',
        defaultSelected: true,
        subItems: [
          { id: 'lp-1', title: '24-36 Wireless battery LED uplights programmed to jewel-tone color palette', completed: false },
          { id: 'lp-2', title: '4 Intelligent moving head spots mounted on truss for dance performance highlights', completed: false },
          { id: 'lp-3', title: 'LED video backdrop wall or projection screen for family visual montages', completed: false },
          { id: 'lp-4', title: 'Hazer / water-based atmospheric mist for beam visibility (venue approved)', completed: false },
        ],
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
    timelinePhase: 'Finale • Last Day',
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
        id: 'reception-hotel-welcome',
        title: 'Hotel Room Block & Pre-Reception Welcome Hospitality Suite',
        category: 'Transport & Entry',
        decisionType: 'venue',
        description: 'Ensure out-of-town guests have confirmed hotel rooms on-site or adjacent, with an afternoon welcome hospitality lounge before cocktail hour.',
        tip: 'Arrange a family welcome dinner or hospitality suite the evening before for guests checking in early.',
        defaultSelected: true,
        subItems: [
          { id: 'rh-1', title: 'Confirm room block reservations and master billing account', completed: false },
          { id: 'rh-2', title: 'Schedule Pre-Reception welcome dinner / hospitality lounge', completed: false },
          { id: 'rh-3', title: 'Arrange luxury shuttle between partner hotels and reception ballroom', completed: false },
          { id: 'rh-4', title: 'Request late check-out pass for VIP family members', completed: false },
        ],
      },
      {
        id: 'reception-attire',
        title: 'Black-Tie Tuxedo, Evening Gown & Fine Jewelry Suite',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Formal black-tie attire for couple: tailored tuxedo with satin lapels, designer reception gown/lehenga, and evening jewelry.',
        defaultSelected: true,
        subItems: [
          { id: 'ra-1', title: 'Groom custom black-tie tuxedo, silk bowtie, cufflinks & patent shoes', completed: false },
          { id: 'ra-2', title: 'Bride couture evening gown or contemporary reception lehenga', completed: false },
          { id: 'ra-3', title: 'Fine diamond or white gold evening necklace and drop earrings', completed: false },
          { id: 'ra-4', title: 'Reception red soles or formal designer evening heels', completed: false },
          { id: 'ra-5', title: 'Evening touch-up glam kit & perfume / cologne spray', completed: false },
        ],
      },
      {
        id: 'reception-centerpieces',
        title: 'Luxury Floral Centerpieces, Sweetheart Table & Ambient Candlelight',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Tall cascading floral arrangements, glass candelabras, monogram sweetheart table florals, and custom printed menus.',
        defaultSelected: true,
        subItems: [
          { id: 'rc-1', title: 'Alternating high and low lush floral centerpieces on guest tables', completed: false },
          { id: 'rc-2', title: 'Floating candle cylinders and golden mercury glass votives', completed: false },
          { id: 'rc-3', title: 'Sweetheart table lush floral arch or overflowing flower bed', completed: false },
          { id: 'rc-4', title: 'Calligraphy laser-cut acrylic table numbers & custom menus', completed: false },
        ],
      },
      {
        id: 'reception-favors',
        title: 'Guest Takeaway Gift Favors & Artisanal Mithai Boxes',
        category: 'Food, Drinks & Favors',
        decisionType: 'ritual',
        description: 'Elegant takeaway boxes for guests containing gourmet artisanal Indian sweets or French macarons with personalized thank-you tags.',
        defaultSelected: true,
        subItems: [
          { id: 'rf-1', title: 'Custom embossed favor boxes with couple monogram wax seal', completed: false },
          { id: 'rf-2', title: 'Artisanal mithai (Kaju pista roll, rose katli) or gourmet macarons', completed: false },
          { id: 'rf-3', title: 'Personalized printed thank-you card at each guest place setting', completed: false },
        ],
      },
      {
        id: 'reception-floor-wrap',
        title: 'Dance Floor Vinyl Wrap (Onyx Black or Monogrammed White)',
        category: 'Decor, Props & Staging',
        decisionType: 'decor',
        description: 'Seamless vinyl ballroom dance floor wrap featuring couple’s custom emblem or sleek high-gloss finish.',
        defaultSelected: true,
        subItems: [
          { id: 'rfw-1', title: 'Submit monogram vector graphic to floor wrap company', completed: false },
          { id: 'rfw-2', title: 'Approve final dimensions & floor layout mockups', completed: false },
          { id: 'rfw-3', title: 'Coordinate venue ballroom early access for installation crew', completed: false },
        ],
      },
      {
        id: 'reception-lighting-production',
        title: 'Intelligent Lighting & AV Production (Pinspots, Moving Heads, Dry Ice & Cold Sparks)',
        category: 'Music, Sound & FX',
        decisionType: 'entertainment',
        description: 'Luxury ballroom production: ceiling pinspotting on floral centerpieces and cake, moving head spotlights, dry ice low fog for first dance, and indoor cold sparks.',
        tip: 'Check with hotel/fire marshal if indoor cold sparks require a special permit.',
        defaultSelected: true,
        subItems: [
          { id: 'rlp-1', title: 'Pinspot lighting focused on every tall floral centerpiece & wedding cake', completed: false },
          { id: 'rlp-2', title: 'Intelligent moving heads for grand bridal party walkout spotlights', completed: false },
          { id: 'rlp-3', title: 'Dry ice low fog machine for "Dancing on Clouds" first dance', completed: false },
          { id: 'rlp-4', title: 'Cold spark pyro fountains for grand entrance & cake cutting finale', completed: false },
        ],
      },
      {
        id: 'reception-catering',
        title: '4-Course Gourmet Dinner Banquet & Top-Shelf Open Bar',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Plated or upscale buffet dinner featuring premium culinary selections and curated signature cocktails.',
        defaultSelected: true,
        subItems: [
          { id: 'rc-1', title: 'Adult dinner banquet count (e.g. 400-450 guests @ ~$80-$165/plate)', completed: false },
          { id: 'rc-2', title: 'Children meal count (e.g. 30-45 kids @ ~$40-$80/plate)', completed: false },
          { id: 'rc-3', title: 'Top-shelf open bar package with custom bride & groom cocktails', completed: false },
        ],
      },
      {
        id: 'reception-vendor-meals',
        title: 'Vendor Meals Table & Crew Hospitality (10-15 Vendors @ Vendor Rate)',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Feed photographers, cinematographers, DJ crew, lighting technicians, and day-of planners during dinner.',
        tip: 'Venues typically charge $35-$50 for vendor plates (compared to $160+ guest plates).',
        defaultSelected: true,
        subItems: [
          { id: 'rvm-1', title: 'Submit final vendor count to banquet captain (10-15 plates)', completed: false },
          { id: 'rvm-2', title: 'Assign vendor table in ballroom or private adjacent green room', completed: false },
          { id: 'rvm-3', title: 'Coordinate vendor dining timing while speeches or dinner courses are served', completed: false },
        ],
      },
      {
        id: 'reception-catering-fees',
        title: 'Catering Operational Costs: Sales Tax, Staff Transport & 10-18% Gratuity',
        category: 'Food, Drinks & Favors',
        decisionType: 'food',
        description: 'Budget essential operational fees: catering staff travel/transport fees (e.g. Moghul Catering), local sales tax, and 10-18% service gratuity.',
        tip: 'These fees often total $15,000–$25,000 on a full weekend contract — always account for them upfront!',
        defaultSelected: true,
        subItems: [
          { id: 'rcf-1', title: 'Review 10-18% catering staff service gratuity line item', completed: false },
          { id: 'rcf-2', title: 'Confirm staff transport & kitchen truck mileage fees', completed: false },
          { id: 'rcf-3', title: 'Verify state/local sales tax rate on food & beverage', completed: false },
        ],
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
    chronologicalRank: 4,
    timelinePhase: 'Henna Lounge & Folk Music',
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
        id: 'mehndi-attire',
        title: 'Bride & Groom Mehndi Outfits, Floral Jewelry & Accessories',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Comfortable breezy ethnic outfits: short-sleeve or sleeveless kurta/lehenga for bride for easy henna application.',
        defaultSelected: true,
        subItems: [
          { id: 'ma-1', title: 'Bride henna-friendly lehenga or kurta set with 3/4 or short sleeves', completed: false },
          { id: 'ma-2', title: 'Fresh floral jewelry set (floral earrings, maang tikka, haathphool)', completed: false },
          { id: 'ma-3', title: 'Groom relaxed printed pastel kurta pyjama set', completed: false },
          { id: 'ma-4', title: 'Henna sealing spray (lemon & sugar syrup mixture) and cotton balls', completed: false },
        ],
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
        subItems: [
          { id: 'mf-1', title: 'Velvet and glass bangles organized in assorted sizes (2.4, 2.6, 2.8)', completed: false },
          { id: 'mf-2', title: 'Handmade embroidered silk potli pouches for guest gifts', completed: false },
          { id: 'mf-3', title: 'Designer colorful bindi booklets and pocket mirrors', completed: false },
        ],
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
    timelinePhase: 'Morning Cleansing & Turmeric Ritual',
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
        id: 'haldi-attire',
        title: 'Splash-Safe Yellow Outfits & Fresh Floral Jewelry',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Yellow cotton outfits for couple that can handle turmeric stains, accompanied by fragrant floral ornaments.',
        defaultSelected: true,
        subItems: [
          { id: 'ha-1', title: 'Bride yellow cotton kurta/sharara set (stain-safe)', completed: false },
          { id: 'ha-2', title: 'Groom simple yellow silk/cotton kurta with churidar', completed: false },
          { id: 'ha-3', title: 'Fresh yellow floral jewelry set (tagar/marigold earrings and choker)', completed: false },
          { id: 'ha-4', title: 'Fluffy white towels, gentle wet wipes & post-haldi fresh clothes change', completed: false },
        ],
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
    timelinePhase: 'Pre-Wedding Kick-off',
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
        id: 'roka-attire',
        title: 'Semi-Formal Traditional Attire & Shagun Envelopes',
        category: 'Attire, Saafa & Jewellery',
        decisionType: 'attire',
        description: 'Smart ethnic outfits for couple, plus organized gift envelopes for close aunts and uncles.',
        defaultSelected: true,
        subItems: [
          { id: 'ro-1', title: 'Bride pastel Anarkali or smart raw silk suit', completed: false },
          { id: 'ro-2', title: 'Groom crisp Nehru jacket over linen kurta pyjama', completed: false },
          { id: 'ro-3', title: 'Decorative Sagan lifafas (cash envelopes) pre-filled for elders', completed: false },
        ],
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
    timelinePhase: 'Procession Parade',
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
    timelinePhase: 'Farewell Send-off',
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
    timelinePhase: 'Custom Ritual',
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
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison !== 0) return dateComparison;
    }
    // If start times are present and differ on the same day
    if (a.startTime && b.startTime && a.startTime !== b.startTime) {
      const timeComparison = a.startTime.localeCompare(b.startTime);
      if (timeComparison !== 0) return timeComparison;
    }
    // Fall back to traditional ritual sequence: Roka -> Sangeet -> Haldi -> Mehndi -> Pheras -> Reception
    const rA = EVENT_BLUEPRINTS[a.type]?.chronologicalRank ?? 99;
    const rB = EVENT_BLUEPRINTS[b.type]?.chronologicalRank ?? 99;
    return rA - rB;
  });
}

/**
 * Traditional chronological weekend order for ceremony selection:
 * 1. Roka (Kick-off)
 * 2. Sangeet & Garba Night (Weekend Kick-off Party)
 * 3. Haldi (Morning Cleansing & Turmeric Ritual)
 * 4. Mehndi (Festive Henna Lounge)
 * 5. Baraat & Pheras (The Wedding Day)
 * 6. Reception (Grand Finale on the last day)
 */
export const CHRONOLOGICAL_EVENT_TYPES: SubEventType[] = [
  'roka',
  'sangeet',
  'haldi',
  'mehendi',
  'pheras',
  'reception',
];

export function sortEventTypesChronologically(types: SubEventType[]): SubEventType[] {
  return [...types].sort((a, b) => {
    const rankA = EVENT_BLUEPRINTS[a]?.chronologicalRank ?? 99;
    const rankB = EVENT_BLUEPRINTS[b]?.chronologicalRank ?? 99;
    return rankA - rankB;
  });
}

/**
 * South Indian Wedding Blueprint for Pheras (Muhurtham & Mandapam)
 * Tamil, Telugu, Kannada, Malayalam traditions
 */
export const SOUTH_INDIAN_PHERAS_BLUEPRINT: EventBlueprint = {
  type: 'pheras',
  name: 'Muhurtham & Mandapam Ceremony (South Indian Wedding Day)',
  tagline: 'Sacred Thaali tying, Kashi Yatra, Oonjal swing, Vedic mantras & Sadhya feast',
  defaultTime: { start: '08:30', end: '13:30' },
  bannerGradient: 'from-amber-700 via-yellow-700 to-orange-800',
  description: 'The sacred heart of the South Indian wedding: auspicious morning Nadaswaram, Kashi Yatra, Maalai Maatral garland exchange, Kanyadaanam, and Mangalyadharanam (tying of the sacred Thaali) conducted by the Iyer / Vadhyar.',
  dressCode: 'Traditional South Indian Silks: Bridal Kanchipuram Pattu Saree, Gold Temple Jewelry, Mullai Flowers & Groom Pure Silk Pattu Veshti (Dhoti) / Angavastram',
  colorTheme: '#D97706',
  venueType: 'Grand Mandapam Ballroom or Temple Hall',
  planningPriority: 1,
  chronologicalRank: 5,
  timelinePhase: 'The Wedding Day • Sacred Muhurtham',
  priorityBadge: {
    label: '🪔 Sacred Muhurtham (Vedic Morning Rituals)',
    level: 'critical',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  decisions: [
    {
      id: 'south-hotel-block',
      title: 'Hotel Room Block & Family Hospitality Suite',
      category: 'Transport & Entry',
      decisionType: 'venue',
      description: 'Reserve contracted hotel rooms with 5 AM early morning check-in for MUA and Iyer preparation.',
      defaultSelected: true,
      subItems: [
        { id: 'shb-1', title: 'Contract room block with 5 AM early arrival passes for bridal party', completed: false },
        { id: 'shb-2', title: 'Secure hospitality suite for midnight filter coffee and family gathering', completed: false },
        { id: 'shb-3', title: 'Coordinate front desk distribution of South Indian welcome bags', completed: false },
      ],
    },
    {
      id: 'south-welcome-bags',
      title: 'Guest Hospitality Welcome Bags (Banana Chips, Mysore Pak & Itinerary)',
      category: 'Food, Drinks & Favors',
      decisionType: 'ritual',
      description: 'Welcome bags featuring South Indian savory snacks, sweets, and weekend schedule.',
      defaultSelected: true,
      subItems: [
        { id: 'swb-1', title: 'Custom jute welcome bag with couple initials', completed: false },
        { id: 'swb-2', title: 'South Indian banana chips, murukku & artisanal Mysore Pak sweets', completed: false },
        { id: 'swb-3', title: 'Weekend schedule card with auspicious vows time window', completed: false },
        { id: 'swb-4', title: 'Morning relief kit & bottled water bottles', completed: false },
      ],
    },
    {
      id: 'south-bridal-attire',
      title: 'Bridal Kanchipuram Silk Sarees, Pure Gold Temple Jewelry & Jasmine Gajra',
      category: 'Attire, Saafa & Jewellery',
      decisionType: 'attire',
      description: 'Heirloom Kanchipuram silk saree (Muhurtham saree & 9-yard Madisar if Iyengar/Iyer), antique temple necklace, Vanki (armlet), Maang Tikka, and fresh Mullai/Jasmine flowers.',
      defaultSelected: true,
      subItems: [
        { id: 'sba-1', title: 'Auspicious Muhurtham Kanchipuram silk saree with pure zari borders steamed & pleated', completed: false },
        { id: 'sba-2', title: 'Antique 22K temple jewelry choker, Kasu Malai (coin necklace) & Jhumkas', completed: false },
        { id: 'sba-3', title: 'Bridal Vanki (armlet), Oddiyanam (gold waist belt) & Suryan/Chandran hair jewels', completed: false },
        { id: 'sba-4', title: 'Fresh fragrant Jasmine / Mullai gajra flower strings for bridal braid (Jadai)', completed: false },
        { id: 'sba-5', title: 'Bridal touch-up kit and comfortable ceremony footwear', completed: false },
      ],
    },
    {
      id: 'south-groom-attire',
      title: 'Groom Pure Silk Pattu Veshti (Dhoti), Angavastram & Gold Chain',
      category: 'Attire, Saafa & Jewellery',
      decisionType: 'attire',
      description: 'Traditional pure silk Veshti with gold zari border, matching Angavastram shawl, and gold chain/rings.',
      defaultSelected: true,
      subItems: [
        { id: 'sga-1', title: 'Pure silk cream/gold Pattu Veshti (Dhoti) & matching Angavastram silk stole', completed: false },
        { id: 'sga-2', title: 'Traditional silk shirt for welcoming & bare chest draping for Muhurtham rituals', completed: false },
        { id: 'sga-3', title: 'Groom gold chain, ring, and formal ceremony leather sandals', completed: false },
      ],
    },
    {
      id: 'south-live-music',
      title: 'Live Nathswaram & Thavil Auspicious Instrumental Ensemble',
      category: 'Music, Sound & FX',
      decisionType: 'entertainment',
      description: 'Traditional Nadaswaram & Thavil live artists playing classical Carnatic ragas to welcome guests, accompany Kashi Yatra, and play the celebratory crescendo during Mangalyadharanam (Thaali tying).',
      tip: 'The Nadaswaram crescendo during the 3 knots of the Thaali is the emotional climax of the wedding.',
      defaultSelected: true,
      subItems: [
        { id: 'snm-1', title: 'Book 3-piece Nathswaram & Thavil live ensemble for 4 hours morning coverage', completed: false },
        { id: 'snm-2', title: 'Arrange Mandapam-side elevated seating, power outlets & dedicated microphones', completed: false },
        { id: 'snm-3', title: 'Coordinate Thaali tying crescendo cue with the Iyer / Vadhyar', completed: false },
      ],
    },
    {
      id: 'south-iyer',
      title: 'Vedic Priest / Iyer / Vadhyar & Muhurtham Puja Samagri Kit',
      category: 'Puja Samagri & Rituals',
      decisionType: 'ritual',
      description: 'Confirm Vedic Officiant (Iyer / Vadhyar / Purohit) dakshina, travel, and complete Samagri checklist (Coconuts, Betel leaves/nuts, Mango leaves, Turmeric, Rice Akshata, and Brass Urlis).',
      defaultSelected: true,
      subItems: [
        { id: 'siy-1', title: 'Confirm Iyer / Vadhyar dakshina, travel, and morning arrival at 7:30 AM', completed: false },
        { id: 'siy-2', title: 'Assemble Vedic Samagri: 20 Coconuts, Betel leaves, Turmeric root, Akshata & Ghee', completed: false },
        { id: 'siy-3', title: 'Arrange Homam Kund and obtain venue smoke detector / open flame approval', completed: false },
      ],
    },
    {
      id: 'south-kashi-yatra',
      title: 'Kashi Yatra Procession: Umbrella, Walking Stick, Geetha Book & Mirror',
      category: 'Transport & Entry',
      decisionType: 'ritual',
      description: 'The playful traditional ritual where the groom pretends to leave for Kashi and the bride’s father convinces him to marry.',
      defaultSelected: true,
      subItems: [
        { id: 'sky-1', title: 'Decorated ceremonial Kashi Yatra umbrella (silk with frills) & walking stick', completed: false },
        { id: 'sky-2', title: 'Bhagavad Gita holy book, hand mirror & ceremonial footwear', completed: false },
        { id: 'sky-3', title: 'Brief bride’s father and groom on playful ritual dialogue', completed: false },
      ],
    },
    {
      id: 'south-thaali',
      title: 'Sacred Thaali (Mangalsutra), Gold Coins & Yellow Thread Coordination',
      category: 'Attire, Saafa & Jewellery',
      decisionType: 'ritual',
      description: 'Gold Thaali / Thirumangalyam emblems blessed on a silver thali by elder guests before being tied around the bride’s neck with three sacred knots.',
      defaultSelected: true,
      subItems: [
        { id: 'stt-1', title: 'Gold Thaali / Thirumangalyam charms strung on auspicious yellow turmeric thread', completed: false },
        { id: 'stt-2', title: 'Silver puja plate (Thali) for circulating Thaali among elders for blessings', completed: false },
        { id: 'stt-3', title: 'Assign groom’s sister to assist with tying the second and third knots', completed: false },
      ],
    },
    {
      id: 'south-garlands',
      title: 'Fresh Jasmine, Lotus & Rose Petal Maalai (Garlands) for Maalai Maatral',
      category: 'Puja Samagri & Rituals',
      decisionType: 'decor',
      description: 'Thick fragrant fresh South Indian floral garlands for the joyous couple garland exchange, plus family honoring shawls.',
      defaultSelected: true,
    },
    {
      id: 'south-mandapam',
      title: 'Mandapam Architecture, Banana Tree Entrance & Brass Vilakku Lamps',
      category: 'Decor, Props & Staging',
      decisionType: 'decor',
      description: 'Traditional Mandapam framed with whole green banana trees, fresh mango leaf Thoranams, brass Kuthu Vilakku oil lamps, and marigold strings.',
      defaultSelected: true,
    },
    {
      id: 'south-sadhya',
      title: 'Traditional South Indian Banana Leaf Sadhya Feast (Adults + Kids + Vendors)',
      category: 'Food, Drinks & Favors',
      decisionType: 'food',
      description: 'Authentic pure vegetarian South Indian feast served on fresh banana leaves: Sambar, Rasam, Avial, Kootu, Poriyal, Appalam, and warm Paal Payasam.',
      defaultSelected: true,
      subItems: [
        { id: 'ss-1', title: 'Confirm adult guest count (e.g. 400-500 guests @ ~$45-$65/plate)', completed: false },
        { id: 'ss-2', title: 'Order fresh whole banana leaves and stainless steel service water cups', completed: false },
        { id: 'ss-3', title: 'Arrange South Indian filter coffee station for guest reception arrival', completed: false },
      ],
    },
    {
      id: 'south-vendor-meals',
      title: 'Vendor Hot Meals & Green Room Hospitality',
      category: 'Food, Drinks & Favors',
      decisionType: 'food',
      description: 'Provide hot meals and coffee for 10-15 working professionals (photographers, cinematographers, Nathswaram artists, coordinators).',
      defaultSelected: true,
    },
    {
      id: 'south-farewell-transport',
      title: 'Farewell / Getaway Exit Vehicle & Luggage Coordination',
      category: 'Transport & Entry',
      decisionType: 'transport',
      description: 'Decorated getaway vehicle for couple departure following the afternoon festivities.',
      defaultSelected: true,
    },
  ],
};

/**
 * Fusion / Cross-Cultural Blueprint for Pheras
 * Blends North and South Indian traditions
 */
export const FUSION_PHERAS_BLUEPRINT: EventBlueprint = {
  type: 'pheras',
  name: 'Mandapam, Baraat & Sacred Vedic Pheras (Cross-Cultural Fusion Day)',
  tagline: 'Groom Baraat procession with Dhol, Kashi Yatra, sacred Agni pheras & Thaali blessings',
  defaultTime: { start: '10:30', end: '16:00' },
  bannerGradient: 'from-rose-800 via-amber-800 to-red-950',
  description: 'A beautiful fusion celebration weaving together North and South Indian traditions: high-energy Baraat entry with Dhol, Kashi Yatra, dual Iyer & Pandit Ji blessings, sacred fire pheras, and Thaali tying.',
  dressCode: 'Regal Heritage & Silks: Bridal Lehengas / Kanchipuram Silks, Temple or Kundan Jewelry, Groom Sherwani or Pattu Veshti',
  colorTheme: '#DC2626',
  venueType: 'Grand Estate Mandapam Lawn or Ballroom',
  planningPriority: 1,
  chronologicalRank: 5,
  timelinePhase: 'The Wedding Day • Fusion Ceremony',
  priorityBadge: {
    label: '💫 Cross-Cultural Celebration',
    level: 'critical',
    color: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  decisions: [
    ...EVENT_BLUEPRINTS.pheras.decisions,
    {
      id: 'fusion-south-music',
      title: 'Live Nathswaram & Thavil Ensemble (Complements Baraat Dhol)',
      category: 'Music, Sound & FX',
      decisionType: 'entertainment',
      description: 'Nathswaram & Thavil classical instrumentalists welcoming Mandap guests and performing the Thaali / Mangalsutra crescendo.',
      defaultSelected: true,
    },
    {
      id: 'fusion-kashi-yatra',
      title: 'Kashi Yatra Playful Ritual (Umbrella, Cane & Gita Book)',
      category: 'Transport & Entry',
      decisionType: 'ritual',
      description: 'Playful South Indian welcoming ritual between groom and bride’s father preceding Mandap entry.',
      defaultSelected: true,
    },
    {
      id: 'fusion-bananaleaf-satvik',
      title: 'Dual Regional Feast: South Indian Sadhya + North Indian Satvik Specialties',
      category: 'Food, Drinks & Favors',
      decisionType: 'food',
      description: 'Catering menu celebrating both families: Sambar, Avial, Payasam alongside Paneer, Dal Makhani, and Chaat.',
      defaultSelected: true,
    },
  ],
};

/**
 * Returns the appropriate event blueprints map based on the couple's cultural tradition
 */
export function getEventBlueprintsForTradition(
  tradition: WeddingTradition = 'traditional_desi'
): Record<SubEventType, EventBlueprint> {
  if (tradition === 'south_indian') {
    return {
      ...EVENT_BLUEPRINTS,
      pheras: SOUTH_INDIAN_PHERAS_BLUEPRINT,
    };
  }
  if (tradition === 'fusion_mixed') {
    return {
      ...EVENT_BLUEPRINTS,
      pheras: FUSION_PHERAS_BLUEPRINT,
    };
  }
  return EVENT_BLUEPRINTS;
}


