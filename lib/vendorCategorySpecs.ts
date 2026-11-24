import { Vendor } from './types';

export interface VendorSpecField {
  key: string;
  label: string;
  type: 'text' | 'boolean';
  placeholder?: string;
  shortLabel?: string;
}

export interface VendorCategorySpecConfig {
  sectionTitle: string;
  sectionHint: string;
  supportsEventBreakdown: boolean;
  supportsAddOns: boolean;
  sampleAddOnHint: string;
  fields: VendorSpecField[];
}

export const VENDOR_CATEGORY_SPECS: Record<Vendor['category'], VendorCategorySpecConfig> = {
  'Photographer & Cinematographer': {
    sectionTitle: 'Photo & Cinema Package Specs',
    sectionHint:
      'Track coverage hours, crew size, film lengths, photo counts, delivery timeline, and add-ons (like Same Day Edit or Albums).',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Same Day Edit ($2,500), Live YouTube Coverage ($400), 12×12" Album ($490)',
    fields: [
      { key: 'coverageHours', label: 'Total Coverage Hours', shortLabel: 'Coverage', type: 'text', placeholder: 'e.g. 10 hours (5h Ceremony + 5h Reception)' },
      { key: 'hourlyRate', label: 'Hourly Rate / Overtime', shortLabel: 'Hourly Rate', type: 'text', placeholder: 'e.g. $600/hr (Wedding), $500/hr (Haldi)' },
      { key: 'teamSize', label: 'Crew / Team Size', shortLabel: 'Team', type: 'text', placeholder: 'e.g. 2 Photographers + 2 Videographers (4 crew)' },
      { key: 'editedPhotos', label: 'Edited Photos Included', shortLabel: 'Edited Photos', type: 'text', placeholder: 'e.g. ~50 photos/hr (~500 edited total)' },
      { key: 'teaserFilm', label: 'Cinematic Teaser Film', shortLabel: 'Teaser Film', type: 'text', placeholder: 'e.g. 1–2 minutes' },
      { key: 'highlightFilm', label: 'Wedding Highlight Film', shortLabel: 'Highlight Film', type: 'text', placeholder: 'e.g. 8–12 minutes' },
      { key: 'fullFilm', label: 'Full-Length Ceremony Film', shortLabel: 'Full Film', type: 'text', placeholder: 'e.g. 60–90 min per major event' },
      { key: 'turnaroundTime', label: 'Delivery Timeline (First Draft)', shortLabel: 'Turnaround', type: 'text', placeholder: 'e.g. Within 90 days' },
      { key: 'albumDetails', label: 'Wedding Album Specs', shortLabel: 'Album', type: 'text', placeholder: 'e.g. 12×12" 100 photos / 50 pages (Free over 15 hrs)' },
      { key: 'preWeddingDetails', label: 'Pre-Wedding / Engagement Shoot', shortLabel: 'Pre-Wedding', type: 'text', placeholder: 'e.g. Free in NY/NJ over 15 hrs (~40 edited + RAW)' },
      { key: 'includesDrone', label: 'Drone Coverage Included', shortLabel: 'Drone', type: 'boolean' },
      { key: 'includesRawPhotos', label: 'All RAW Photos Included', shortLabel: 'All RAW Photos', type: 'boolean' },
      { key: 'includesOnlineGallery', label: 'Online Photo & Video Gallery', shortLabel: 'Online Gallery', type: 'boolean' },
      { key: 'includesPreWedding', label: 'Engagement / Pre-Wedding Included', shortLabel: 'Pre-Wedding Shoot', type: 'boolean' },
      { key: 'includesAlbum', label: 'Physical Album Included', shortLabel: 'Album Included', type: 'boolean' },
    ],
  },

  Catering: {
    sectionTitle: 'Catering & Menu Specs',
    sectionHint: 'Record per-plate pricing, guest minimums, live stations, dietary support, and venue approval.',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Live Chaat Station ($1,500), Late Night Dosa Cart ($1,200), Mithai Favors',
    fields: [
      { key: 'perPlateRate', label: 'Per-Plate / Per-Guest Rate', shortLabel: 'Per Plate', type: 'text', placeholder: 'e.g. $65/guest (Reception), $42/guest (Lunch)' },
      { key: 'minimumGuests', label: 'Minimum Guest Count', shortLabel: 'Min Guests', type: 'text', placeholder: 'e.g. 200 guests' },
      { key: 'cuisineStyles', label: 'Cuisine / Menu Highlights', shortLabel: 'Menu', type: 'text', placeholder: 'e.g. Gujarati Thali, North Indian, Indo-Chinese' },
      { key: 'liveStations', label: 'Live Stations Included', shortLabel: 'Live Stations', type: 'text', placeholder: 'e.g. Pani Puri, Chaat, Live Naan/Tandoor, Chai' },
      { key: 'venueRoyaltyNote', label: 'Venue Royalty / Kitchen Fee', shortLabel: 'Venue Fee', type: 'text', placeholder: 'e.g. Approved at The Rockleigh' },
      { key: 'tastingIncluded', label: 'Menu Tasting Included', shortLabel: 'Tasting', type: 'boolean' },
      { key: 'jainSwaminarayanCapable', label: 'Jain / Swaminarayan Options', shortLabel: 'Jain / Swaminarayan', type: 'boolean' },
      { key: 'staffAndChafing', label: 'Servers & Chafing Dishes Included', shortLabel: 'Staff & Chafing', type: 'boolean' },
      { key: 'venueApproved', label: 'Estate / Hotel Approved', shortLabel: 'Venue Approved', type: 'boolean' },
    ],
  },

  'Mandap & Floral Decorator': {
    sectionTitle: 'Mandap & Floral Decor Specs',
    sectionHint: 'Capture mandap design, floral type, centerpieces, stage setup, and breakdown coverage.',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Fresh Floral Mandap Upgrade ($3,500), Welcome Sign & Seating Chart ($650)',
    fields: [
      { key: 'mandapStyle', label: 'Mandap Style / Structure', shortLabel: 'Mandap', type: 'text', placeholder: 'e.g. 4-pillar wooden mandap with fresh floral halo' },
      { key: 'floralType', label: 'Floral Type (Fresh vs. Silk)', shortLabel: 'Florals', type: 'text', placeholder: 'e.g. 100% Fresh Roses & Marigolds' },
      { key: 'centerpiecesCount', label: 'Table Centerpieces Count', shortLabel: 'Centerpieces', type: 'text', placeholder: 'e.g. 25 tall + low alternating centerpieces' },
      { key: 'eventsCovered', label: 'Events Decorated', shortLabel: 'Events', type: 'text', placeholder: 'e.g. Sangeet, Ceremony Mandap, Reception Stage' },
      { key: 'includesSweetheartStage', label: 'Sweetheart Stage & Backdrop', shortLabel: 'Sweetheart Stage', type: 'boolean' },
      { key: 'includesAisleDecor', label: 'Aisle Runner & Ganesh Welcome', shortLabel: 'Aisle & Welcome', type: 'boolean' },
      { key: 'includesDrapingLighting', label: 'Draping & Accent Lighting', shortLabel: 'Draping & Lighting', type: 'boolean' },
      { key: 'includesSetupBreakdown', label: 'Delivery, Setup & Breakdown', shortLabel: 'Setup & Breakdown', type: 'boolean' },
    ],
  },

  'Choreographer & DJ': {
    sectionTitle: 'DJ, Lighting & AV Production Specs',
    sectionHint: 'Track DJ/MC crew, Baraat mobile sound, Dhol players, uplighting, LED walls/screens, pinspotting, and special FX.',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. LED Video Wall ($2,800), Cold Sparklers ($800), Dancing on a Cloud ($650), Extra Dhol Player ($450)',
    fields: [
      { key: 'crewSize', label: 'Crew Included (DJ / MC / Lighting Tech)', shortLabel: 'Crew', type: 'text', placeholder: 'e.g. 1 DJ + 1 Bilingual MC + 1 Lighting/VJ Tech' },
      { key: 'hoursIncluded', label: 'Total Performance Hours', shortLabel: 'Hours', type: 'text', placeholder: 'e.g. Sangeet (4h) + Baraat (1.5h) + Reception (5h)' },
      { key: 'soundSetup', label: 'Sound & Audio Equipment', shortLabel: 'Audio', type: 'text', placeholder: 'e.g. Ceremony lapel mics + Reception QSC/JBL line array' },
      { key: 'uplightsCount', label: 'Uplights & Color Wash', shortLabel: 'Uplights', type: 'text', placeholder: 'e.g. 24 wireless amber/warm white uplights' },
      { key: 'screensOrLed', label: 'LED Video Wall / Projector Screens', shortLabel: 'LED / Screens', type: 'text', placeholder: 'e.g. 16ft×9ft P2.9 LED wall or Dual 10ft screens' },
      { key: 'includesBaraatSound', label: 'Baraat Mobile Sound Truck/Cart', shortLabel: 'Baraat Sound', type: 'boolean' },
      { key: 'includesDhol', label: 'Live Dhol Player Included', shortLabel: 'Dhol Included', type: 'boolean' },
      { key: 'includesUplighting', label: 'Ballroom Uplighting Included', shortLabel: 'Uplighting', type: 'boolean' },
      { key: 'includesDanceFloorLighting', label: 'Intelligent Moving-Head Dance Lighting', shortLabel: 'Dance Lighting', type: 'boolean' },
      { key: 'includesPinspotting', label: 'Cake & Centerpiece Pinspotting', shortLabel: 'Pinspotting', type: 'boolean' },
      { key: 'includesMonogram', label: 'Custom Monogram / Gobo', shortLabel: 'Monogram Gobo', type: 'boolean' },
      { key: 'includesColdSparks', label: 'Cold Sparklers / Dancing on a Cloud FX', shortLabel: 'Special FX', type: 'boolean' },
    ],
  },

  'Bridal MUA & Hair': {
    sectionTitle: 'Bridal Hair & Makeup Specs',
    sectionHint: 'Record looks covered, trial details, saree/dupatta draping, touch-ups, and bridesmaid rates.',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Bridesmaid Hair & Makeup ($225/person), Bridal Trial ($250), Extra Touch-Up Hour ($150)',
    fields: [
      { key: 'looksCovered', label: 'Bridal Looks Covered', shortLabel: 'Looks', type: 'text', placeholder: 'e.g. Sangeet + Ceremony + Reception (3 looks)' },
      { key: 'bridesmaidsRate', label: 'Family / Bridesmaids Rate', shortLabel: 'Party Rate', type: 'text', placeholder: 'e.g. $220 per person (Hair + Makeup)' },
      { key: 'touchUpHours', label: 'Touch-Up / Stay-Back Coverage', shortLabel: 'Touch-Ups', type: 'text', placeholder: 'e.g. Stay through Ceremony portraits' },
      { key: 'travelFee', label: 'Travel / Early Morning Fee', shortLabel: 'Travel Fee', type: 'text', placeholder: 'e.g. Included within 50 miles; $100 before 5 AM' },
      { key: 'trialIncluded', label: 'Bridal Trial Included', shortLabel: 'Trial Included', type: 'boolean' },
      { key: 'includesDraping', label: 'Saree / Dupatta & Jewelry Setting', shortLabel: 'Draping & Jewelry', type: 'boolean' },
      { key: 'includesLashesExtensions', label: 'Lashes & Hair Padding Included', shortLabel: 'Lashes & Padding', type: 'boolean' },
    ],
  },

  'Mehendi Artist': {
    sectionTitle: 'Mehendi Artist Specs',
    sectionHint: 'Track bridal coverage length, estimated hours, guest hourly rate, and henna type.',
    supportsEventBreakdown: false,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Additional Guest Artist ($125/hr), Custom Portrait Motif ($150)',
    fields: [
      { key: 'bridalCoverage', label: 'Bridal Coverage Length', shortLabel: 'Coverage', type: 'text', placeholder: 'e.g. Up to elbows + mid-calf intricate bridal' },
      { key: 'hoursEstimated', label: 'Estimated Bridal Application Time', shortLabel: 'Duration', type: 'text', placeholder: 'e.g. 5–6 hours' },
      { key: 'guestHourlyRate', label: 'Guest Mehendi Hourly Rate', shortLabel: 'Guest Rate', type: 'text', placeholder: 'e.g. $125/hr per artist (10–12 guests/hr)' },
      { key: 'travelFee', label: 'Travel Fee', shortLabel: 'Travel', type: 'text', placeholder: 'e.g. Free within NJ/NY' },
      { key: 'organicHenna', label: '100% Organic Fresh Rajasthani Henna', shortLabel: 'Organic Henna', type: 'boolean' },
      { key: 'includesAftercare', label: 'Sealant & Aftercare Kit Included', shortLabel: 'Aftercare Kit', type: 'boolean' },
    ],
  },

  'Pandit Ji': {
    sectionTitle: 'Pandit Ji / Ceremony Specs',
    sectionHint: 'Record regional tradition, ceremony duration, English explanations, and Samagri checklist.',
    supportsEventBreakdown: true,
    supportsAddOns: false,
    sampleAddOnHint: 'e.g. Ganesh Puja / Grah Shanti day before ($500)',
    fields: [
      { key: 'tradition', label: 'Regional Tradition / Style', shortLabel: 'Tradition', type: 'text', placeholder: 'e.g. Gujarati + Odia / North Indian Vedic' },
      { key: 'ceremonyDuration', label: 'Ceremony Duration', shortLabel: 'Duration', type: 'text', placeholder: 'e.g. 60–75 minutes' },
      { key: 'samagriList', label: 'Samagri / Puja Items Note', shortLabel: 'Samagri', type: 'text', placeholder: 'e.g. Pandit provides Havan Kund; family brings coconuts/sweets' },
      { key: 'bilingualExplanation', label: 'Explains Rituals in English', shortLabel: 'English Explanations', type: 'boolean' },
      { key: 'samagriIncluded', label: 'Puja Samagri Provided by Pandit', shortLabel: 'Samagri Included', type: 'boolean' },
      { key: 'legallyOfficiates', label: 'Signs Marriage License', shortLabel: 'Signs License', type: 'boolean' },
    ],
  },

  'Lighting & AV Production': {
    sectionTitle: 'Lighting & AV Production Specs',
    sectionHint: 'Track uplights, pinspotting, LED walls, projectors, and setup timeline.',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Custom Monogram Gobo ($350), LED Wall ($2,800), Cold Sparks ($750)',
    fields: [
      { key: 'uplightsCount', label: 'Uplights & Color Wash', shortLabel: 'Uplights', type: 'text', placeholder: 'e.g. 24 wireless amber/warm white uplights' },
      { key: 'screensOrLed', label: 'Projector / Screens / LED Wall', shortLabel: 'Screens / LED', type: 'text', placeholder: 'e.g. Dual 10ft screens for Same-Day Edit' },
      { key: 'includesPinspotting', label: 'Cake & Centerpiece Pinspotting', shortLabel: 'Pinspotting', type: 'boolean' },
      { key: 'includesMonogram', label: 'Custom Monogram / Gobo', shortLabel: 'Monogram Gobo', type: 'boolean' },
      { key: 'includesCloudSparks', label: 'Low-Lying Fog / Cold Sparklers', shortLabel: 'Cloud / Sparks', type: 'boolean' },
    ],
  },

  'Baraat & Farewell Transport': {
    sectionTitle: 'Baraat & Vidai Transport Specs',
    sectionHint: 'Record horse/vintage car/exotic car model, hours, driver, and dual-use options.',
    supportsEventBreakdown: false,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Fresh Floral Car Garland ($250), Extra Hour ($300)',
    fields: [
      { key: 'vehicleOrHorse', label: 'Horse / Car Model', shortLabel: 'Vehicle / Horse', type: 'text', placeholder: 'e.g. White Marwari Horse OR Rolls-Royce Ghost' },
      { key: 'hoursIncluded', label: 'Hours Included', shortLabel: 'Hours', type: 'text', placeholder: 'e.g. 2 hrs Baraat + 1 hr Vidai' },
      { key: 'permitNotes', label: 'Venue / Municipal Permit Notes', shortLabel: 'Permits', type: 'text', placeholder: 'e.g. COI insurance provided to venue' },
      { key: 'dualUseBaraatVidai', label: 'Dual-Use Baraat & Vidai Package', shortLabel: 'Baraat + Vidai', type: 'boolean' },
      { key: 'includesHandlerDriver', label: 'Handler / Chauffeur & Decor Included', shortLabel: 'Handler / Decor', type: 'boolean' },
    ],
  },

  'Live Musicians (Nathswaram/Shehnai)': {
    sectionTitle: 'Live Musicians Specs',
    sectionHint: 'Record ensemble size, instruments, events covered, and audio requirements.',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Cocktail Hour Violinist ($600), Extra Set ($350)',
    fields: [
      { key: 'instruments', label: 'Instruments / Ensemble', shortLabel: 'Ensemble', type: 'text', placeholder: 'e.g. Shehnai + Tabla + Dhol / Sitar Duo' },
      { key: 'hoursIncluded', label: 'Performance Duration', shortLabel: 'Hours', type: 'text', placeholder: 'e.g. 2 hours (Ceremony + Cocktail Hour)' },
      { key: 'bringsOwnAudio', label: 'Brings Own Microphones / Amp', shortLabel: 'Own Audio', type: 'boolean' },
    ],
  },

  'Trousseau / Attire': {
    sectionTitle: 'Outfits & Attire Specs',
    sectionHint: 'Track garments ordered, fitting dates, alterations, and shipping timeline.',
    supportsEventBreakdown: false,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Custom Veil/Dupatta ($450), Matching Groom Safa ($150)',
    fields: [
      { key: 'outfitsList', label: 'Outfits / Pieces Ordered', shortLabel: 'Outfits', type: 'text', placeholder: 'e.g. Bridal Lehenga + Sherwani + Sangeet Outfit' },
      { key: 'deliveryDate', label: 'Expected Delivery / Pickup Date', shortLabel: 'Delivery Date', type: 'text', placeholder: 'e.g. June 2027' },
      { key: 'alterationsIncluded', label: 'Alterations & Final Fitting Included', shortLabel: 'Alterations Included', type: 'boolean' },
    ],
  },

  'Wedding Planner & Coordinator': {
    sectionTitle: 'Planner & Coordination Specs',
    sectionHint: 'Track planning tier (Full / Partial / Month-Of), team size on wedding day, and rehearsal coverage.',
    supportsEventBreakdown: true,
    supportsAddOns: true,
    sampleAddOnHint: 'e.g. Extra Day-Of Assistant ($450), Additional Event Coverage ($1,200)',
    fields: [
      { key: 'planningTier', label: 'Service Level', shortLabel: 'Level', type: 'text', placeholder: 'e.g. Month-Of Coordination / Full Planning' },
      { key: 'dayOfTeamSize', label: 'On-Site Team Size', shortLabel: 'On-Site Team', type: 'text', placeholder: 'e.g. 1 Lead Planner + 2 Assistants' },
      { key: 'eventsCovered', label: 'Events Managed', shortLabel: 'Events', type: 'text', placeholder: 'e.g. Sangeet, Ceremony & Reception' },
      { key: 'includesRehearsal', label: 'Rehearsal & Venue Walkthrough Included', shortLabel: 'Walkthrough Included', type: 'boolean' },
      { key: 'includesTimelineAndBEO', label: 'Master Timeline & Vendor BEO Management', shortLabel: 'Timeline & BEOs', type: 'boolean' },
    ],
  },
};

export const getVendorCategorySpec = (category: Vendor['category']): VendorCategorySpecConfig => {
  if (category === 'Lighting & AV Production') {
    return VENDOR_CATEGORY_SPECS['Choreographer & DJ'];
  }
  return VENDOR_CATEGORY_SPECS[category] || VENDOR_CATEGORY_SPECS['Wedding Planner & Coordinator'];
};
