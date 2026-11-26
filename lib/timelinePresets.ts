import { SubEventType, TimelineSegment, TimelineSegmentCategory } from './types';

export interface TimelinePresetItem {
  title: string;
  durationMinutes: number;
  category: TimelineSegmentCategory;
  location?: string;
  participants?: string;
  leadPerson?: string;
  songOrCue?: string;
  notes?: string;
  inStarterTemplate?: boolean;
}

export const TIMELINE_CATEGORY_META: Record<
  TimelineSegmentCategory,
  {
    label: string;
    badgeClass: string;
    borderClass: string;
    dotClass: string;
  }
> = {
  entrance: {
    label: 'Entrance',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-200',
    borderClass: 'border-l-rose-500',
    dotClass: 'bg-rose-500',
  },
  ritual: {
    label: 'Ritual',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    borderClass: 'border-l-amber-500',
    dotClass: 'bg-amber-500',
  },
  dance: {
    label: 'Dance / Show',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
    borderClass: 'border-l-purple-500',
    dotClass: 'bg-purple-500',
  },
  speech: {
    label: 'Speech / Toast',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-200',
    borderClass: 'border-l-sky-500',
    dotClass: 'bg-sky-500',
  },
  food: {
    label: 'Food & Drinks',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    borderClass: 'border-l-emerald-500',
    dotClass: 'bg-emerald-500',
  },
  photo: {
    label: 'Photo & Video',
    badgeClass: 'bg-pink-100 text-pink-900 border-pink-200',
    borderClass: 'border-l-pink-500',
    dotClass: 'bg-pink-500',
  },
  music: {
    label: 'Music / Party',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    borderClass: 'border-l-indigo-500',
    dotClass: 'bg-indigo-500',
  },
  logistics: {
    label: 'Logistics',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
    borderClass: 'border-l-stone-400',
    dotClass: 'bg-stone-400',
  },
};

export const TIMELINE_PRESETS_BY_TYPE: Record<SubEventType, TimelinePresetItem[]> = {
  reception: [
    {
      title: 'Bride Hair, Makeup & Draping for Reception',
      durationMinutes: 180,
      category: 'logistics',
      location: 'Bridal Suite',
      leadPerson: 'Bridal MUA & Draper',
      notes: 'Arrive 15 min early; wear button-down/zip-up top',
      inStarterTemplate: false,
    },
    {
      title: 'Groom Relocates to Venue & Changes into Reception Outfit',
      durationMinutes: 55,
      category: 'logistics',
      location: 'Bridal / Groom Suite',
      leadPerson: 'Groom & Groomsmen',
      inStarterTemplate: false,
    },
    {
      title: 'Bride & Groom + Family & Bridal Party Portraits',
      durationMinutes: 50,
      category: 'photo',
      location: 'Ballroom / Grounds',
      leadPerson: 'Photo & Video Team',
      notes: 'Bridal party & immediate family arrive outside ballroom 10–15 min prior',
      inStarterTemplate: false,
    },
    {
      title: 'Cocktail Hour + Speaker Sound/Mic Check with DJ',
      durationMinutes: 90,
      category: 'food',
      location: 'Pre-Function / Foyer',
      leadPerson: 'Banquet Captain, DJ & Coordinator',
      notes: 'Guests check seating chart; anyone giving a speech does a quick mic check with DJ',
      inStarterTemplate: true,
    },
    {
      title: 'Family & Bridal Party Lineup for Reception Entrances',
      durationMinutes: 10,
      category: 'logistics',
      location: 'Foyer',
      leadPerson: 'Day-of Coordinator',
      notes: 'Line up in exact entrance order outside ballroom doors',
      inStarterTemplate: true,
    },
    {
      title: 'MC Name Check & Pronunciation / Lineup Check',
      durationMinutes: 5,
      category: 'logistics',
      location: 'Foyer',
      leadPerson: 'MC & Coordinator',
      notes: 'MC confirms every name pronunciation and pair order before doors open',
      inStarterTemplate: true,
    },
    {
      title: "Groom's Parents Grand Entrance",
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: "Groom's Parents",
      leadPerson: 'MC & DJ',
      songOrCue: 'Add YouTube link + start timestamp (e.g. 0:48)',
      notes: 'Walk in with high energy and stay standing by dance floor/stage until Couple enters',
      inStarterTemplate: true,
    },
    {
      title: "Bride's Parents Grand Entrance",
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: "Bride's Parents",
      leadPerson: 'MC & DJ',
      songOrCue: 'Add YouTube link + start timestamp (e.g. 0:35)',
      inStarterTemplate: true,
    },
    {
      title: "Groom's Siblings Entrance",
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: "Groom's Siblings",
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: false,
    },
    {
      title: "Bride's Siblings Entrance",
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: "Bride's Siblings",
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: false,
    },
    {
      title: 'All Bridesmaids & Groomsmen Entrance',
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: 'Bridesmaids & Groomsmen',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add group entrance track',
      inStarterTemplate: true,
    },
    {
      title: 'Bridesmaids Entrance (Separate)',
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: 'Bridesmaids',
      leadPerson: 'MC & DJ',
      inStarterTemplate: false,
    },
    {
      title: 'Groomsmen Entrance (Separate)',
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: 'Groomsmen',
      leadPerson: 'MC & DJ',
      inStarterTemplate: false,
    },
    {
      title: 'Brother of the Bride & Maid of Honor Entrance',
      durationMinutes: 2,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: 'Brother of Bride & MOH',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance track + timestamp',
      inStarterTemplate: true,
    },
    {
      title: 'Pre-Wedding Trailer Screening (Before Couple Enters)',
      durationMinutes: 3,
      category: 'photo',
      location: 'Grand Ballroom',
      leadPerson: 'Cinema Team & AV Tech',
      notes: 'Plays right before Couple is announced; Dhol player gets to center of dance floor',
      inStarterTemplate: false,
    },
    {
      title: 'Bride & Groom Grand Entrance (with Dhol Player)',
      durationMinutes: 3,
      category: 'entrance',
      location: 'Grand Ballroom',
      participants: 'Bride & Groom',
      leadPerson: 'MC, DJ, Dhol & Cold Sparks',
      songOrCue: 'Couple entrance anthem + Dhol cue',
      notes: 'Announced as newlyweds; all family joins at end for group photo before taking seats',
      inStarterTemplate: true,
    },
    {
      title: 'Couple First Dance',
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      participants: 'Bride & Groom',
      leadPerson: 'DJ & Cloud FX Tech',
      songOrCue: 'First dance song + dancing on a cloud cue',
      inStarterTemplate: true,
    },
    {
      title: 'Cake Cutting Ceremony',
      durationMinutes: 7,
      category: 'food',
      location: 'Grand Ballroom',
      participants: 'Bride & Groom',
      leadPerson: 'Photo/Video & Banquet Captain',
      inStarterTemplate: true,
    },
    {
      title: "Bride's Parents Welcome Speech",
      durationMinutes: 5,
      category: 'speech',
      location: 'Grand Ballroom',
      participants: "Bride's Parents",
      leadPerson: 'MC (Handheld Mic)',
      inStarterTemplate: true,
    },
    {
      title: "Groom's Parents Welcome Speech",
      durationMinutes: 5,
      category: 'speech',
      location: 'Grand Ballroom',
      participants: "Groom's Parents",
      leadPerson: 'MC (Handheld Mic)',
      inStarterTemplate: true,
    },
    {
      title: 'MOH & Sibling Speech',
      durationMinutes: 5,
      category: 'speech',
      location: 'Grand Ballroom',
      participants: 'Maid of Honor & Sibling',
      leadPerson: 'MC (Handheld Mic)',
      inStarterTemplate: true,
    },
    {
      title: 'Best Man Speech',
      durationMinutes: 5,
      category: 'speech',
      location: 'Grand Ballroom',
      participants: 'Best Man',
      leadPerson: 'MC (Handheld Mic)',
      inStarterTemplate: false,
    },
    {
      title: 'Couple Thank-You Speech & Champagne Toast',
      durationMinutes: 5,
      category: 'speech',
      location: 'Grand Ballroom',
      participants: 'Bride & Groom',
      leadPerson: 'Banquet Captain (Toasting Flutes)',
      notes: 'Ensure Bride & Groom receive toasting flutes right before speech',
      inStarterTemplate: true,
    },
    {
      title: 'Same-Day / Next-Day Edit (NDE) Film Screening',
      durationMinutes: 8,
      category: 'photo',
      location: 'Grand Ballroom',
      leadPerson: 'Cinema Team & AV Tech',
      notes: 'Dim ballroom lights for projector / LED wall',
      inStarterTemplate: true,
    },
    {
      title: 'Father-Daughter Dance',
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      participants: 'Bride & Father',
      leadPerson: 'DJ & Photo/Video',
      songOrCue: 'Father-daughter song',
      inStarterTemplate: false,
    },
    {
      title: 'Mother-Son Dance',
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      participants: 'Groom & Mother',
      leadPerson: 'DJ & Photo/Video',
      songOrCue: 'Mother-son song',
      inStarterTemplate: false,
    },
    {
      title: "Groom's Family Friends Dance Performance",
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      leadPerson: 'DJ & MC',
      inStarterTemplate: false,
    },
    {
      title: 'Bridesmaids Dance Performance',
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      participants: 'Bridesmaids',
      leadPerson: 'DJ & MC',
      inStarterTemplate: false,
    },
    {
      title: 'Groomsmen Dance Performance',
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      participants: 'Groomsmen',
      leadPerson: 'DJ & MC',
      inStarterTemplate: true,
    },
    {
      title: 'Bridal Party Performance (+ Remain Standing for Group Photo)',
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      participants: 'Full Bridal Party',
      leadPerson: 'DJ, MC & Photographer',
      notes: 'Everyone remains standing at end for full bridal party group photo',
      inStarterTemplate: true,
    },
    {
      title: "Bride's Family / Cousins Performance",
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      leadPerson: 'DJ & MC',
      inStarterTemplate: false,
    },
    {
      title: 'Couple Surprise Dance Performance',
      durationMinutes: 5,
      category: 'dance',
      location: 'Grand Ballroom',
      participants: 'Bride & Groom',
      leadPerson: 'DJ & Photo/Video',
      inStarterTemplate: false,
    },
    {
      title: 'Couple Shoe Game / Trivia',
      durationMinutes: 10,
      category: 'speech',
      location: 'Grand Ballroom',
      leadPerson: 'MC',
      inStarterTemplate: false,
    },
    {
      title: 'Dinner, Open Dance Floor & Dessert',
      durationMinutes: 150,
      category: 'music',
      location: 'Grand Ballroom',
      leadPerson: 'Caterer, DJ & Lighting Tech',
      notes: 'Release VIP tables first; confirm final guest clear-out time (e.g. 12:00 AM)',
      inStarterTemplate: true,
    },
    {
      title: 'Last Dance & Grand Send-Off',
      durationMinutes: 10,
      category: 'entrance',
      location: 'Main Entrance',
      leadPerson: 'MC & Coordinator',
      inStarterTemplate: false,
    },
  ],

  pheras: [
    {
      title: 'Bride Hair, Makeup & Draping',
      durationMinutes: 180,
      category: 'logistics',
      location: 'Bridal Suite / Airbnb',
      leadPerson: 'Bridal MUA & Draper',
      notes: 'Clean makeup-free face & dry hair night before; wear button-down/zip-up top',
      inStarterTemplate: false,
    },
    {
      title: 'Family & Bridesmaids Makeup + Saree/Dupatta Draping',
      durationMinutes: 120,
      category: 'logistics',
      location: 'Bridal Suite / Airbnb',
      leadPerson: 'Hair, Makeup & Draping Team',
      notes: 'Budget ~60m per person for makeup & ~10m per person for draping (arrive 15m early)',
      inStarterTemplate: false,
    },
    {
      title: "Groom's Getting Ready Shots with Parents",
      durationMinutes: 60,
      category: 'photo',
      location: "Groom's Suite / House",
      participants: "Groom & Groom's Parents",
      leadPerson: 'Photo & Video Team',
      inStarterTemplate: true,
    },
    {
      title: "Bride's First Look with Parents & Bridesmaids (Before Dupatta)",
      durationMinutes: 30,
      category: 'photo',
      location: 'Bridal Suite / Stairs',
      participants: "Bride, Bride's Parents & Bridesmaids",
      leadPerson: 'Photographer',
      inStarterTemplate: true,
    },
    {
      title: 'Family Relocates to Venue & Morning Breakfast',
      durationMinutes: 45,
      category: 'food',
      location: 'Venue / Dining Hall',
      leadPerson: 'Coordinator & Caterer',
      inStarterTemplate: true,
    },
    {
      title: 'Turban / Sehra Bandi',
      durationMinutes: 15,
      category: 'ritual',
      location: "Groom's Suite / Staging Area",
      leadPerson: "Groom's Family",
      inStarterTemplate: false,
    },
    {
      title: 'Baraat Assembly & Lineup',
      durationMinutes: 15,
      category: 'logistics',
      location: 'Front Parking Lot',
      participants: "Groom, Groom's Family & Friends",
      leadPerson: 'Dhol Player & Coordinator',
      inStarterTemplate: true,
    },
    {
      title: 'Baraat Procession',
      durationMinutes: 30,
      category: 'entrance',
      location: 'Main Pathway / Driveway',
      leadPerson: 'Mobile DJ + Dhol + Baraat Car/Horse',
      inStarterTemplate: true,
    },
    {
      title: 'Milni (Both Dads & Immediate Families)',
      durationMinutes: 5,
      category: 'ritual',
      location: 'Baraat Gate',
      participants: 'Both Dads & Families',
      leadPerson: 'Coordinator & Photo/Video',
      inStarterTemplate: true,
    },
    {
      title: 'Groom Welcoming & Ribbon Cutting (Pokhwanu / Ponkvu)',
      durationMinutes: 10,
      category: 'ritual',
      location: 'Baraat Gate',
      participants: "Bride's Mom & Sisters",
      leadPerson: "Bride's Family & Photo/Video",
      inStarterTemplate: true,
    },
    {
      title: "Ceremony Entrances (Groom & Parents → Bridesmaids → Bride's Brother → Bride & Parents)",
      durationMinutes: 10,
      category: 'entrance',
      location: 'Down Aisle',
      participants: 'Groom, Parents, Bridesmaids, Brother & Bride',
      leadPerson: 'Coordinator & DJ',
      notes: 'Groom & parents enter first; 5m later Bridesmaids; then Brother; then Bride & Parents',
      inStarterTemplate: true,
    },
    {
      title: 'Wedding Ceremony (Pheras / Anand Karaj)',
      durationMinutes: 60,
      category: 'ritual',
      location: 'Mandap / Main Hall',
      leadPerson: 'Pandit Ji / Gyaniji',
      inStarterTemplate: true,
    },
    {
      title: 'Wedding Lunch Served to Guests',
      durationMinutes: 90,
      category: 'food',
      location: 'Dining / Langar Hall',
      leadPerson: 'Caterer',
      inStarterTemplate: true,
    },
    {
      title: 'Invited Family & Guest Group Photos (Photo-Group Cards)',
      durationMinutes: 45,
      category: 'photo',
      location: 'Mandap / Stage',
      leadPerson: 'Photo Team & Family Wrangler',
      notes: 'Anyone with a photo-group card stays back for quick organized family portraits',
      inStarterTemplate: true,
    },
    {
      title: 'Shoe Negotiations (Joota Chupai) & Vidaai (Doli)',
      durationMinutes: 25,
      category: 'entrance',
      location: 'Main Entrance',
      participants: "Bride, Groom, Sisters & Both Families",
      leadPerson: 'Coordinator & Vidai Car',
      inStarterTemplate: true,
    },
    {
      title: 'Post-Ceremony Couple & Bridal Party Photo Session',
      durationMinutes: 60,
      category: 'photo',
      location: "Photographer's Discretion",
      leadPerson: 'Photo & Video Team',
      inStarterTemplate: false,
    },
  ],

  baraat: [
    {
      title: 'Groom Turban / Sehra Bandi',
      durationMinutes: 20,
      category: 'ritual',
      leadPerson: "Groom's Family",
      inStarterTemplate: true,
    },
    {
      title: 'Baraat Lineup & Dhol Warm-Up',
      durationMinutes: 15,
      category: 'logistics',
      leadPerson: 'Dhol Player & Baraat Coordinator',
      inStarterTemplate: true,
    },
    {
      title: 'Baraat Procession to Venue Entrance',
      durationMinutes: 45,
      category: 'entrance',
      leadPerson: 'Mobile DJ + Dhol + Baraat Car/Horse',
      inStarterTemplate: true,
    },
    {
      title: 'Milni & Groom Welcome',
      durationMinutes: 15,
      category: 'ritual',
      leadPerson: "Bride's Family",
      inStarterTemplate: true,
    },
  ],

  sangeet: [
    {
      title: 'Doors Open, Masala Chai & Live Chaat Stations',
      durationMinutes: 45,
      category: 'food',
      leadPerson: 'Caterer & Venue Staff',
      inStarterTemplate: true,
    },
    {
      title: 'Bride & Groom Grand Sangeet Entry',
      durationMinutes: 5,
      category: 'entrance',
      leadPerson: 'DJ & MC',
      songOrCue: 'Upbeat Sangeet entry track',
      inStarterTemplate: true,
    },
    {
      title: 'Welcome Toast by Hosts',
      durationMinutes: 5,
      category: 'speech',
      leadPerson: 'Parents / MC',
      inStarterTemplate: true,
    },
    {
      title: "Bride's Family Performance",
      durationMinutes: 10,
      category: 'dance',
      leadPerson: 'DJ & MC',
      inStarterTemplate: true,
    },
    {
      title: "Groom's Family Performance",
      durationMinutes: 10,
      category: 'dance',
      leadPerson: 'DJ & MC',
      inStarterTemplate: true,
    },
    {
      title: 'Bridesmaids & Groomsmen Performances',
      durationMinutes: 15,
      category: 'dance',
      leadPerson: 'DJ & MC',
      inStarterTemplate: true,
    },
    {
      title: 'Couple Sangeet Performance',
      durationMinutes: 5,
      category: 'dance',
      leadPerson: 'DJ & Photo/Video',
      inStarterTemplate: true,
    },
    {
      title: 'Dinner Buffet Opens',
      durationMinutes: 45,
      category: 'food',
      leadPerson: 'Caterer',
      inStarterTemplate: true,
    },
    {
      title: 'Garba & Dandiya Raas Circle',
      durationMinutes: 45,
      category: 'dance',
      leadPerson: 'DJ & Dhol Player',
      inStarterTemplate: true,
    },
    {
      title: 'Open Bollywood & Bhangra Dance Floor',
      durationMinutes: 60,
      category: 'music',
      leadPerson: 'DJ',
      inStarterTemplate: true,
    },
  ],

  haldi: [
    {
      title: 'Guest Arrival, Chai & Light Breakfast',
      durationMinutes: 30,
      category: 'food',
      leadPerson: 'Family Hosts',
      inStarterTemplate: true,
    },
    {
      title: 'Ganesh Puja & Haldi Bowl Blessing',
      durationMinutes: 15,
      category: 'ritual',
      leadPerson: 'Elders / Pandit Ji',
      inStarterTemplate: true,
    },
    {
      title: 'Parents & Elders Haldi Application',
      durationMinutes: 30,
      category: 'ritual',
      leadPerson: 'Photo & Video Team',
      inStarterTemplate: true,
    },
    {
      title: 'Siblings, Cousins & Friends Haldi + Flower Shower',
      durationMinutes: 30,
      category: 'dance',
      leadPerson: 'DJ / Playlist + Marigold Petals',
      inStarterTemplate: true,
    },
    {
      title: 'Group Photos & Candid Portraits',
      durationMinutes: 15,
      category: 'photo',
      leadPerson: 'Photo & Video Team',
      inStarterTemplate: true,
    },
    {
      title: 'Haldi Lunch / Snacks Served',
      durationMinutes: 45,
      category: 'food',
      leadPerson: 'Caterer / Family',
      inStarterTemplate: true,
    },
  ],

  mehendi: [
    {
      title: 'Bridal Mehendi Application Begins',
      durationMinutes: 60,
      category: 'ritual',
      leadPerson: 'Bridal Mehendi Artist',
      inStarterTemplate: true,
    },
    {
      title: 'Guest Arrival, Chai & Street Snacks',
      durationMinutes: 30,
      category: 'food',
      leadPerson: 'Family Hosts',
      inStarterTemplate: true,
    },
    {
      title: 'Guest Henna Stations & Folk Songs (Dholki)',
      durationMinutes: 90,
      category: 'music',
      leadPerson: 'Assistant Henna Artists',
      inStarterTemplate: true,
    },
    {
      title: 'Bridal Henna Reveal & Candid Photos',
      durationMinutes: 20,
      category: 'photo',
      leadPerson: 'Photographer',
      inStarterTemplate: true,
    },
  ],

  after_party: [
    {
      title: 'Reception Wrap & Shuttle Drop-Off at Hotel',
      durationMinutes: 15,
      category: 'logistics',
      leadPerson: 'Shuttle / Coordinator',
      inStarterTemplate: true,
    },
    {
      title: 'Late-Night Bar / Suite Drinks Open',
      durationMinutes: 15,
      category: 'food',
      leadPerson: 'Hotel Bar / Groomsmen',
      inStarterTemplate: true,
    },
    {
      title: 'Late-Night Food Arrives (Pizza, Sliders, Maggi & Chai)',
      durationMinutes: 30,
      category: 'food',
      leadPerson: 'Assigned Coordinator',
      inStarterTemplate: true,
    },
    {
      title: 'After-Party Music & Late-Night Hangout',
      durationMinutes: 90,
      category: 'music',
      leadPerson: 'DJ / Party Speaker Playlist',
      inStarterTemplate: true,
    },
  ],

  roka: [
    {
      title: 'Family Welcome & Tilak Ceremony',
      durationMinutes: 20,
      category: 'ritual',
      leadPerson: 'Parents',
      inStarterTemplate: true,
    },
    {
      title: 'Ring / Gift Exchange & Blessings',
      durationMinutes: 30,
      category: 'ritual',
      leadPerson: 'Both Families',
      inStarterTemplate: true,
    },
    {
      title: 'Family Portraits & Celebratory Lunch',
      durationMinutes: 60,
      category: 'food',
      leadPerson: 'Hosts',
      inStarterTemplate: true,
    },
  ],

  vidaai: [
    {
      title: 'Rice Tossing Ritual (Puffed Rice)',
      durationMinutes: 10,
      category: 'ritual',
      leadPerson: "Bride's Family",
      inStarterTemplate: true,
    },
    {
      title: 'Car Push & Farewell Send-Off',
      durationMinutes: 15,
      category: 'entrance',
      leadPerson: "Bride's Brothers & Cousins",
      inStarterTemplate: true,
    },
  ],

  custom: [
    {
      title: 'Guest Arrival & Welcome Drinks',
      durationMinutes: 30,
      category: 'food',
      inStarterTemplate: true,
    },
    {
      title: 'Welcome Remarks & Toasts',
      durationMinutes: 15,
      category: 'speech',
      inStarterTemplate: true,
    },
    {
      title: 'Main Meal / Buffet',
      durationMinutes: 60,
      category: 'food',
      inStarterTemplate: true,
    },
    {
      title: 'Music & Mingling',
      durationMinutes: 60,
      category: 'music',
      inStarterTemplate: true,
    },
  ],
};

export const getPresetsForEvent = (eventType: SubEventType, eventName?: string): TimelinePresetItem[] => {
  const lower = (eventName || '').toLowerCase();
  if (lower.includes('after-party') || lower.includes('after party')) {
    return TIMELINE_PRESETS_BY_TYPE.after_party;
  }
  if (lower.includes('reception') || lower.includes('cocktail')) {
    return TIMELINE_PRESETS_BY_TYPE.reception;
  }
  if (lower.includes('sangeet') || lower.includes('garba')) {
    return TIMELINE_PRESETS_BY_TYPE.sangeet;
  }
  if (lower.includes('haldi')) {
    return TIMELINE_PRESETS_BY_TYPE.haldi;
  }
  if (lower.includes('mehendi') || lower.includes('mehndi')) {
    return TIMELINE_PRESETS_BY_TYPE.mehendi;
  }
  return TIMELINE_PRESETS_BY_TYPE[eventType] || TIMELINE_PRESETS_BY_TYPE.custom;
};

export const buildStarterSegments = (eventType: SubEventType, eventName?: string): TimelineSegment[] => {
  const presets = getPresetsForEvent(eventType, eventName).filter((p) => p.inStarterTemplate !== false);
  const now = Date.now();
  return presets.map((p, idx) => ({
    id: `seg-${now}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    title: p.title,
    durationMinutes: p.durationMinutes,
    category: p.category,
    location: p.location || '',
    participants: p.participants || '',
    leadPerson: p.leadPerson || '',
    songOrCue: p.songOrCue || '',
    notes: p.notes || '',
  }));
};

/** Parse "HH:mm" (24h) into minutes from midnight */
export const parseTimeToMinutes = (hhmm?: string): number => {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm.trim())) return 18 * 60; // default 6:00 PM
  const [h, m] = hhmm.trim().split(':').map(Number);
  return h * 60 + m;
};

/** Format minutes from midnight (wraps cleanly past midnight!) into "6:30 PM" */
export const formatMinutesTo12h = (totalMinutes: number): string => {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

export const formatDurationLabel = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};
