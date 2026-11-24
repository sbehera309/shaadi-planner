import { Guest, GuestCardColor, GuestTier } from './types';

export const GUEST_TIER_META: Record<
  GuestTier,
  {
    label: string;
    shortLabel: string;
    description: string;
    defaultColor: GuestCardColor;
    badgeClass: string;
    activeClass: string;
  }
> = {
  A: {
    label: 'Tier A — Must Invite',
    shortLabel: 'Tier A',
    description: 'Core / guaranteed invite list',
    defaultColor: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
  },
  B: {
    label: 'Tier B — If Space Allows',
    shortLabel: 'Tier B',
    description: 'Invite when Tier A declines or space opens',
    defaultColor: 'amber',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    activeClass: 'bg-amber-500 text-white border-amber-500',
  },
  C: {
    label: 'Tier C — Backup / Waitlist',
    shortLabel: 'Tier C',
    description: 'Later wave / backup guest list',
    defaultColor: 'purple',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    activeClass: 'bg-purple-600 text-white border-purple-600',
  },
};

export const GUEST_CARD_COLORS: Record<
  GuestCardColor,
  {
    label: string;
    swatchClass: string;
    cardClass: string;
    rowClass: string;
    dotClass: string;
  }
> = {
  default: {
    label: 'White',
    swatchClass: 'bg-white border-stone-300',
    cardClass: 'bg-white border-stone-200 hover:border-rose-300',
    rowClass: '',
    dotClass: 'bg-stone-300',
  },
  emerald: {
    label: 'Green (Tier A)',
    swatchClass: 'bg-emerald-500 border-emerald-600',
    cardClass: 'bg-emerald-50/70 border-emerald-300 border-l-4 border-l-emerald-500 hover:border-emerald-400',
    rowClass: 'bg-emerald-50/35',
    dotClass: 'bg-emerald-500',
  },
  amber: {
    label: 'Gold (Tier B)',
    swatchClass: 'bg-amber-400 border-amber-500',
    cardClass: 'bg-amber-50/80 border-amber-300 border-l-4 border-l-amber-500 hover:border-amber-400',
    rowClass: 'bg-amber-50/35',
    dotClass: 'bg-amber-500',
  },
  purple: {
    label: 'Purple (Tier C)',
    swatchClass: 'bg-purple-500 border-purple-600',
    cardClass: 'bg-purple-50/75 border-purple-300 border-l-4 border-l-purple-500 hover:border-purple-400',
    rowClass: 'bg-purple-50/35',
    dotClass: 'bg-purple-500',
  },
  sky: {
    label: 'Blue',
    swatchClass: 'bg-sky-500 border-sky-600',
    cardClass: 'bg-sky-50/75 border-sky-300 border-l-4 border-l-sky-500 hover:border-sky-400',
    rowClass: 'bg-sky-50/35',
    dotClass: 'bg-sky-500',
  },
  rose: {
    label: 'Rose',
    swatchClass: 'bg-rose-500 border-rose-600',
    cardClass: 'bg-rose-50/75 border-rose-300 border-l-4 border-l-rose-500 hover:border-rose-400',
    rowClass: 'bg-rose-50/35',
    dotClass: 'bg-rose-500',
  },
};

export const getEffectiveCardColor = (
  guest: Pick<Guest, 'tier' | 'cardColor'>
): GuestCardColor => {
  if (guest.cardColor && guest.cardColor !== 'default') {
    return guest.cardColor;
  }
  if (guest.tier) {
    return GUEST_TIER_META[guest.tier].defaultColor;
  }
  return 'default';
};

export const getNextTier = (current?: GuestTier): GuestTier | undefined => {
  if (!current) return 'A';
  if (current === 'A') return 'B';
  if (current === 'B') return 'C';
  return undefined;
};
