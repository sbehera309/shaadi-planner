import { SubEventType, TimelineSegment, TimelineSegmentCategory } from './types';

export interface TimelinePresetItem {
  title: string;
  durationMinutes: number;
  category: TimelineSegmentCategory;
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
      title: 'Couple & Immediate Family Formal Portraits',
      durationMinutes: 30,
      category: 'photo',
      leadPerson: 'Photo & Video Team',
      notes: 'Before guests enter the main ballroom',
      inStarterTemplate: false,
    },
    {
      title: "Cocktail Hour & Passed Hors d'oeuvres",
      durationMinutes: 60,
      category: 'food',
      leadPerson: 'Banquet Captain & Caterer',
      notes: 'Open bar + live chaat / appetizer stations',
      inStarterTemplate: true,
    },
    {
      title: 'Ballroom Doors Open & Guest Seating',
      durationMinutes: 15,
      category: 'logistics',
      leadPerson: 'Coordinator & Ushers',
      notes: 'Line up bridal party & parents in foyer 5 min prior',
      inStarterTemplate: true,
    },
    {
      title: "Groom's Parents Grand Entrance",
      durationMinutes: 3,
      category: 'entrance',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: true,
    },
    {
      title: "Bride's Parents Grand Entrance",
      durationMinutes: 3,
      category: 'entrance',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: true,
    },
    {
      title: "Groom's Siblings Entrance",
      durationMinutes: 3,
      category: 'entrance',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: true,
    },
    {
      title: "Bride's Siblings Entrance",
      durationMinutes: 3,
      category: 'entrance',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: true,
    },
    {
      title: 'Bridesmaids Entrance',
      durationMinutes: 4,
      category: 'entrance',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: true,
    },
    {
      title: 'Groomsmen Entrance',
      durationMinutes: 4,
      category: 'entrance',
      leadPerson: 'MC & DJ',
      songOrCue: 'Add entrance song + timestamp',
      inStarterTemplate: true,
    },
    {
      title: 'Bridesmaids & Groomsmen Paired Entrance',
      durationMinutes: 5,
      category: 'entrance',
      leadPerson: 'MC & DJ',
      notes: 'Alternative if entering in pairs instead of separately',
      inStarterTemplate: false,
    },
    {
      title: 'Bride & Groom Grand Entrance',
      durationMinutes: 5,
      category: 'entrance',
      leadPerson: 'MC, DJ & Cold Sparks Tech',
      songOrCue: 'Couple entrance anthem + cold sparklers cue',
      inStarterTemplate: true,
    },
    {
      title: 'Couple First Dance',
      durationMinutes: 5,
      category: 'dance',
      leadPerson: 'DJ & Cloud FX Tech',
      songOrCue: 'First dance song + dancing on a cloud cue',
      inStarterTemplate: true,
    },
    {
      title: 'Welcome Speech & Champagne Toast',
      durationMinutes: 10,
      category: 'speech',
      leadPerson: "Parents / Couple",
      inStarterTemplate: true,
    },
    {
      title: 'Cake Cutting Ceremony',
      durationMinutes: 10,
      category: 'food',
      leadPerson: 'Photo/Video & Banquet Captain',
      inStarterTemplate: true,
    },
    {
      title: 'Dinner Service / Buffet Opens',
      durationMinutes: 45,
      category: 'food',
      leadPerson: 'Caterer & Banquet Captain',
      notes: 'Release VIP / immediate family tables first',
      inStarterTemplate: true,
    },
    {
      title: 'Father-Daughter Dance',
      durationMinutes: 5,
      category: 'dance',
      leadPerson: 'DJ & Photo/Video',
      songOrCue: 'Father-daughter song',
      inStarterTemplate: true,
    },
    {
      title: 'Mother-Son Dance',
      durationMinutes: 5,
      category: 'dance',
      leadPerson: 'DJ & Photo/Video',
      songOrCue: 'Mother-son song',
      inStarterTemplate: true,
    },
    {
      title: 'Best Man, Maid of Honor & Sibling Speeches',
      durationMinutes: 15,
      category: 'speech',
      leadPerson: 'MC (Handheld Mics)',
      inStarterTemplate: true,
    },
    {
      title: 'Reception Dance Performances',
      durationMinutes: 20,
      category: 'dance',
      leadPerson: 'DJ & MC',
      notes: 'Confirm order of performances + audio tracks with DJ',
      inStarterTemplate: true,
    },
    {
      title: 'Same-Day Edit Film Screening',
      durationMinutes: 10,
      category: 'photo',
      leadPerson: 'Cinema Team & AV Tech',
      notes: 'Dim ballroom lights for projector/LED wall',
      inStarterTemplate: false,
    },
    {
      title: 'Couple Shoe Game / Trivia',
      durationMinutes: 10,
      category: 'speech',
      leadPerson: 'MC',
      inStarterTemplate: false,
    },
    {
      title: 'Open Dance Floor & Late-Night Snacks',
      durationMinutes: 90,
      category: 'music',
      leadPerson: 'DJ & Lighting Tech',
      inStarterTemplate: true,
    },
    {
      title: 'Last Dance & Grand Send-Off',
      durationMinutes: 10,
      category: 'entrance',
      leadPerson: 'MC & Coordinator',
      inStarterTemplate: true,
    },
  ],

  pheras: [
    {
      title: 'Bride & Groom Getting Ready + Detail Shots',
      durationMinutes: 45,
      category: 'photo',
      leadPerson: 'Photo & Video Team',
      inStarterTemplate: true,
    },
    {
      title: 'Turban / Sehra Bandi',
      durationMinutes: 15,
      category: 'ritual',
      leadPerson: "Groom's Family",
      inStarterTemplate: true,
    },
    {
      title: 'Couple First Look & Bridal Party Portraits',
      durationMinutes: 30,
      category: 'photo',
      leadPerson: 'Photo & Video Team',
      inStarterTemplate: false,
    },
    {
      title: 'Baraat Lineup & Procession',
      durationMinutes: 45,
      category: 'entrance',
      leadPerson: 'DJ Mobile Sound + Dhol + Baraat Car/Horse',
      inStarterTemplate: true,
    },
    {
      title: 'Milni & Groom Welcome (Pokhwanu / Ponkvu)',
      durationMinutes: 15,
      category: 'ritual',
      leadPerson: "Bride's Parents & Pandit Ji",
      inStarterTemplate: true,
    },
    {
      title: 'Groom Entrance to Mandap & Ganesh Puja',
      durationMinutes: 15,
      category: 'ritual',
      leadPerson: 'Pandit Ji',
      inStarterTemplate: true,
    },
    {
      title: 'Bridal Party & Bride Grand Entrance',
      durationMinutes: 10,
      category: 'entrance',
      leadPerson: 'DJ & Coordinator',
      songOrCue: 'Bridal entrance song (under Phoolon ki Chadar)',
      inStarterTemplate: true,
    },
    {
      title: 'Jaimala / Varmala (Garland Exchange)',
      durationMinutes: 10,
      category: 'ritual',
      leadPerson: 'Pandit Ji & Photo/Video',
      inStarterTemplate: true,
    },
    {
      title: 'Kanyadaan & Hastamelap',
      durationMinutes: 15,
      category: 'ritual',
      leadPerson: "Bride's Parents & Pandit Ji",
      inStarterTemplate: true,
    },
    {
      title: 'Mangal Pheras & Saptapadi (7 Vows)',
      durationMinutes: 25,
      category: 'ritual',
      leadPerson: 'Pandit Ji',
      inStarterTemplate: true,
    },
    {
      title: 'Mangalsutra, Sindoor & Aashirwad',
      durationMinutes: 10,
      category: 'ritual',
      leadPerson: 'Pandit Ji',
      inStarterTemplate: true,
    },
    {
      title: 'Immediate Family Group Photos at Mandap',
      durationMinutes: 15,
      category: 'photo',
      leadPerson: 'Photo Team & Family Wrangler',
      inStarterTemplate: true,
    },
    {
      title: 'Joota Chupai (Shoe Hiding Game)',
      durationMinutes: 10,
      category: 'ritual',
      leadPerson: "Bride's Sisters & Cousins",
      inStarterTemplate: false,
    },
    {
      title: 'Bidaai / Vidaai Send-Off',
      durationMinutes: 15,
      category: 'entrance',
      leadPerson: 'Both Families & Vidai Car',
      inStarterTemplate: true,
    },
    {
      title: 'Wedding Lunch Served',
      durationMinutes: 60,
      category: 'food',
      leadPerson: 'Caterer',
      inStarterTemplate: true,
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
