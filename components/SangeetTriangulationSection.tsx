'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWedding } from '@/lib/store';
import {
  SangeetVenueOption,
  RankedSangeetVenue,
  VenueOption,
  FamilyAddressInput,
  ProfileSavedAddress,
} from '@/lib/types';
import {
  rankSangeetVenues,
  formatSangeetBriefForWhatsApp,
  SangeetSortOption,
  SangeetAnchorMode,
} from '@/lib/sangeetRecommender';
import { PRELOADED_SANGEET_VENUES } from '@/lib/preloadedSangeetVenues';
import AddressAutocompleteInput from '@/components/AddressAutocompleteInput';
import {
  Music,
  MapPin,
  Car,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  ExternalLink,
  Users,
  Copy,
  Check,
  Building2,
  DollarSign,
  Hotel,
  Flame,
  Utensils,
  Filter,
  ArrowUpDown,
  Search,
  BookmarkCheck,
  Scale,
  Navigation,
  Info,
  Calendar,
  Compass,
  Bookmark,
  History,
  BookOpen,
} from 'lucide-react';

interface SangeetTriangulationSectionProps {
  initialGroomAddress?: FamilyAddressInput;
  initialBrideAddress?: FamilyAddressInput;
  savedAddresses?: ProfileSavedAddress[];
  onSelectSavedAddress?: (saved: ProfileSavedAddress, side: 'groom' | 'bride') => void;
  onOpenAddressBook?: (side: 'groom' | 'bride') => void;
  onAddressesChange?: (groom: FamilyAddressInput, bride: FamilyAddressInput) => void;
  isLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
}

export default function SangeetTriangulationSection({
  initialGroomAddress,
  initialBrideAddress,
  savedAddresses,
  onSelectSavedAddress,
  onOpenAddressBook,
  onAddressesChange,
  isLoggedIn,
  onOpenAuthModal,
}: SangeetTriangulationSectionProps) {
  const {
    wedding,
    venues,
    officialSangeetVenue,
    setOfficialSangeetVenue,
  } = useWedding();

  // Find official confirmed wedding venue or top candidate
  const officialWeddingVenue =
    venues.find((v) => v.isSelectedOfficialVenue) ||
    venues.find((v) => v.name === wedding?.venueName) ||
    null;

  // Selected Main Wedding Venue for triangulation (can default to confirmed or user can pick another from shortlist)
  const [selectedMainVenueId, setSelectedMainVenueId] = useState<string>(
    officialWeddingVenue?.id || (venues.length > 0 ? venues[0].id : '')
  );

  const activeMainVenue =
    venues.find((v) => v.id === selectedMainVenueId) || officialWeddingVenue || null;

  // Anchor Addresses State (default to Lawrence Township, NJ for Groom and Mountain Top, PA for Bride)
  const [groomAddress, setGroomAddress] = useState<FamilyAddressInput>(
    initialGroomAddress || {
      side: 'groom',
      label: "Groom's Family Home",
      address: '254 Montgomery Street',
      city: 'Lawrence Township',
      state: 'NJ',
      zipCode: '08648',
      latitude: 40.2732,
      longitude: -74.7429,
    }
  );

  const [brideAddress, setBrideAddress] = useState<FamilyAddressInput>(
    initialBrideAddress || {
      side: 'bride',
      label: "Bride's Family Home",
      address: '88 S Mountain Blvd',
      city: 'Mountain Top',
      state: 'PA',
      zipCode: '18707',
      latitude: 41.1514,
      longitude: -75.9376,
    }
  );

  // Synchronize state if parent changes initial addresses (e.g. from address book or other tabs)
  useEffect(() => {
    if (initialGroomAddress && initialGroomAddress.address) {
      setGroomAddress((prev) => {
        if (
          prev.address === initialGroomAddress.address &&
          prev.city === initialGroomAddress.city &&
          prev.state === initialGroomAddress.state &&
          prev.latitude === initialGroomAddress.latitude &&
          prev.longitude === initialGroomAddress.longitude
        ) {
          return prev;
        }
        return initialGroomAddress;
      });
    }
  }, [
    initialGroomAddress?.address,
    initialGroomAddress?.city,
    initialGroomAddress?.state,
    initialGroomAddress?.latitude,
    initialGroomAddress?.longitude,
    initialGroomAddress?.label,
  ]);

  useEffect(() => {
    if (initialBrideAddress && initialBrideAddress.address) {
      setBrideAddress((prev) => {
        if (
          prev.address === initialBrideAddress.address &&
          prev.city === initialBrideAddress.city &&
          prev.state === initialBrideAddress.state &&
          prev.latitude === initialBrideAddress.latitude &&
          prev.longitude === initialBrideAddress.longitude
        ) {
          return prev;
        }
        return initialBrideAddress;
      });
    }
  }, [
    initialBrideAddress?.address,
    initialBrideAddress?.city,
    initialBrideAddress?.state,
    initialBrideAddress?.latitude,
    initialBrideAddress?.longitude,
    initialBrideAddress?.label,
  ]);

  const handleApplySavedAddress = (saved: ProfileSavedAddress, side: 'groom' | 'bride') => {
    const updated: FamilyAddressInput = {
      side,
      label: saved.label,
      address: saved.address,
      city: saved.city,
      state: saved.state,
      zipCode: saved.zipCode,
      latitude: saved.latitude,
      longitude: saved.longitude,
    };

    if (side === 'groom') {
      setGroomAddress(updated);
      if (onAddressesChange) {
        onAddressesChange(updated, brideAddress);
      }
    } else {
      setBrideAddress(updated);
      if (onAddressesChange) {
        onAddressesChange(groomAddress, updated);
      }
    }

    if (onSelectSavedAddress) {
      onSelectSavedAddress(saved, side);
    }
  };

  const handleUpdateGroomAddress = (updated: Partial<FamilyAddressInput>) => {
    const newGroom: FamilyAddressInput = {
      ...groomAddress,
      ...updated,
      side: 'groom',
    };
    setGroomAddress(newGroom);
    if (onAddressesChange) {
      onAddressesChange(newGroom, brideAddress);
    }
  };

  const handleUpdateBrideAddress = (updated: Partial<FamilyAddressInput>) => {
    const newBride: FamilyAddressInput = {
      ...brideAddress,
      ...updated,
      side: 'bride',
    };
    setBrideAddress(newBride);
    if (onAddressesChange) {
      onAddressesChange(groomAddress, newBride);
    }
  };

  // Guest count for Sangeet catering calculation (default to 250 or wedding profile)
  const [sangeetGuestCount, setSangeetGuestCount] = useState<number>(
    wedding?.guestCount ? Math.min(wedding.guestCount, 350) : 250
  );

  // Anchor Mode: 'groom_bride_only' (midpoint between 2 families) vs 'three_way' (including confirmed main wedding venue)
  const [anchorMode, setAnchorMode] = useState<SangeetAnchorMode>('groom_bride_only');

  // Filter & Sort State
  const [stateFilter, setStateFilter] = useState<'ALL' | 'NJ' | 'PA'>('ALL');
  const [hotelOnlyFilter, setHotelOnlyFilter] = useState<boolean>(false);
  const [liveChaatOnlyFilter, setLiveChaatOnlyFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SangeetSortOption>('triangulation');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // UI feedback states
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);
  const [selectedSuccessId, setSelectedSuccessId] = useState<string | null>(null);
  const [isEditingAnchors, setIsEditingAnchors] = useState<boolean>(false);

  // Run Triangulation Recommender Engine
  const rankedVenues: RankedSangeetVenue[] = useMemo(() => {
    return rankSangeetVenues(
      {
        groomLocation: groomAddress,
        brideLocation: brideAddress,
        mainVenue: activeMainVenue
          ? {
              name: activeMainVenue.name,
              city: activeMainVenue.city,
              state: activeMainVenue.state,
              address: activeMainVenue.address,
              latitude: activeMainVenue.latitude,
              longitude: activeMainVenue.longitude,
            }
          : null,
        guestCount: sangeetGuestCount,
        sangeetVenues: PRELOADED_SANGEET_VENUES,
        anchorMode,
      },
      sortBy,
      {
        state: stateFilter,
        hotelOnSiteOnly: hotelOnlyFilter,
        liveChaatOnly: liveChaatOnlyFilter,
        searchQuery,
      }
    );
  }, [
    groomAddress,
    brideAddress,
    activeMainVenue,
    sangeetGuestCount,
    anchorMode,
    sortBy,
    stateFilter,
    hotelOnlyFilter,
    liveChaatOnlyFilter,
    searchQuery,
  ]);

  const formatCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wedding?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSelectOfficialSangeet = (venue: SangeetVenueOption) => {
    setOfficialSangeetVenue(venue);
    setSelectedSuccessId(venue.id);
    setTimeout(() => setSelectedSuccessId(null), 3500);
  };

  const handleRemoveOfficialSangeet = () => {
    setOfficialSangeetVenue(null);
  };

  const handleCopyWhatsAppBrief = () => {
    const brief = formatSangeetBriefForWhatsApp(
      rankedVenues,
      groomAddress.label || "Groom's Family",
      brideAddress.label || "Bride's Family",
      activeMainVenue?.name || 'Main Wedding Venue',
      sangeetGuestCount,
      anchorMode
    );
    navigator.clipboard.writeText(brief);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Context Workflow */}
      <div className="relative overflow-hidden rounded-3xl bg-purple-950 bg-gradient-to-r from-purple-950 via-fuchsia-950 to-rose-950 text-white p-6 sm:p-8 shadow-xl border border-purple-500/30">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {anchorMode === 'groom_bride_only'
                ? 'Workflow: Sangeet & Garba Family Midpoint Recommender'
                : 'Workflow Step 2: Sangeet & Garba Venue Triangulation'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {anchorMode === 'groom_bride_only'
              ? 'Find Sangeet Halls Balanced Between Groom & Bride'
              : 'Find the Optimal Pre-Wedding Celebration Hall'}
          </h2>

          <p className="mt-2 text-sm sm:text-base text-purple-100 leading-relaxed font-normal">
            {anchorMode === 'groom_bride_only' ? (
              <>
                Selecting a Sangeet hall based strictly on drive-time equity between the Groom’s and Bride’s
                family homes. Dedicated Indian banquet halls offer vast dance floors, 1:30 AM curfews, in-house
                live chaat counters, and average <span className="font-bold text-amber-300">$48–$65/guest</span>{' '}
                (saving $25k–$40k!).
              </>
            ) : (
              <>
                Sangeet and Garba nights typically don’t need the $180–$250/guest expense of a formal
                estate. Dedicated Indian banquet halls offer vast dance floors, 1:30 AM curfews,
                in-house live chaat counters, and average <span className="font-bold text-amber-300">$48–$65/guest</span>{' '}
                (saving $25k–$40k!).
              </>
            )}
          </p>

          {/* Active Anchor Mode Callout Banner */}
          {anchorMode === 'groom_bride_only' ? (
            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-400/20 border border-blue-400/40 flex items-center justify-center shrink-0 text-lg">
                  ⚖️
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider">
                    Calculation Strategy: Groom & Bride Family Midpoint Only
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>Balanced directly between {groomAddress.city} & {brideAddress.city}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-400/40 text-blue-200 text-[10px] font-bold">
                      2 Anchors Active
                    </span>
                  </div>
                  <div className="text-xs text-purple-200">
                    Main wedding venue is excluded from scores so you can pick purely for family balance.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAnchorMode('three_way')}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-bold transition-all shrink-0 cursor-pointer text-center"
              >
                Switch to 3-Way Triangulation (+ Main Venue) →
              </button>
            </div>
          ) : (
            <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-purple-200 uppercase tracking-wider">
                    Anchor 3: Confirmed Wedding & Reception Venue
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{activeMainVenue?.name || 'The Rockleigh (or choose below)'}</span>
                    {officialWeddingVenue && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-purple-200">
                    {activeMainVenue
                      ? `${activeMainVenue.city}, ${activeMainVenue.state}`
                      : 'Rockleigh, NJ'}
                    {' • '}
                    <span className="text-amber-200">Out-of-town guests stay near this hotel block</span>
                  </div>
                </div>
              </div>

              {/* Quick Switcher if user has multiple shortlisted venues */}
              {venues.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-purple-200 shrink-0">Test with:</label>
                  <select
                    value={selectedMainVenueId}
                    onChange={(e) => setSelectedMainVenueId(e.target.value)}
                    className="bg-purple-900/90 border border-purple-400/50 text-white rounded-xl text-xs py-1.5 px-3 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-semibold"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id} className="bg-stone-900 text-white">
                        {v.name} ({v.city}, {v.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 to-transparent pointer-events-none" />
      </div>

      {/* 2. Official Sangeet Venue Confirmed Card (If selected) */}
      {officialSangeetVenue && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-400 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <BookmarkCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Official Sangeet Venue Confirmed</span>
              </div>
              <h3 className="text-xl font-extrabold text-stone-900">
                {officialSangeetVenue.name}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {officialSangeetVenue.address}, {officialSangeetVenue.city}, {officialSangeetVenue.state} •{' '}
                <span className="font-semibold text-emerald-800">
                  {officialSangeetVenue.highlightTag}
                </span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-900">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300">
                  💰 ~${officialSangeetVenue.pricePerGuest}/guest
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300">
                  👥 Up to {officialSangeetVenue.maxCapacity} guests
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300">
                  🌙 Sound curfew: {officialSangeetVenue.desiFeatures.soundCurfew}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-200/60 text-emerald-900">
                  ✅ Synced to Itinerary & Budget
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleRemoveOfficialSangeet}
              className="w-full md:w-auto px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-white hover:bg-stone-100 border border-stone-300 transition-all shadow-xs"
            >
              Change Sangeet Selection
            </button>
          </div>
        </div>
      )}

      {/* 3. The Anchors Control Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-700" />
              <span>
                {anchorMode === 'groom_bride_only'
                  ? 'Groom & Bride Family Midpoint Anchors'
                  : '3-Way Geographic Triangulation Anchors'}
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {anchorMode === 'groom_bride_only'
                ? "Calculating drive times & balance directly between Groom's family and Bride's family (main venue excluded)."
                : 'Calculating drive times & balance between Groom family, Bride family, and the Main Venue hotel hub.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingAnchors(!isEditingAnchors)}
              className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-all cursor-pointer"
            >
              {isEditingAnchors ? 'Collapse Address Inputs' : 'Edit Addresses / GPS'}
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsAppBrief}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 cursor-pointer ${
                copiedWhatsApp
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border-purple-200'
              }`}
            >
              {copiedWhatsApp ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied Brief!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Share WhatsApp Brief</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Calculation Preference Toggle Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-800">Anchor Calculation Preference:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  anchorMode === 'groom_bride_only'
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-purple-100 text-purple-900 border border-purple-200'
                }`}
              >
                {anchorMode === 'groom_bride_only'
                  ? '2 Anchors (Families Only)'
                  : '3 Anchors (+ Main Venue)'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {anchorMode === 'groom_bride_only'
                ? "Select a Sangeet hall based purely on convenience between the two family homes."
                : "Triangulate between both family homes and the confirmed wedding venue's hotel hub."}
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-white p-1 border border-stone-200/90 shadow-2xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setAnchorMode('groom_bride_only');
                if (sortBy === 'main_venue_closest') setSortBy('triangulation');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 tap-button active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                anchorMode === 'groom_bride_only'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <span>🤵👰</span>
              <span>Groom & Bride Only</span>
            </button>
            <button
              type="button"
              onClick={() => setAnchorMode('three_way')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 tap-button active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                anchorMode === 'three_way'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <span>🏛️</span>
              <span>3-Way (+ Main Venue)</span>
            </button>
          </div>
        </div>

        {/* Quick Select Chips from Saved Addresses */}
        {savedAddresses && savedAddresses.length > 0 && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-700" />
              <span>Fill Anchors from Saved Addresses:</span>
            </span>
            {savedAddresses.map((sa) => (
              <div
                key={sa.id}
                className="inline-flex items-center rounded-xl border border-stone-200/90 bg-white shadow-2xs overflow-hidden text-[11px]"
              >
                <span className="px-2.5 py-1 font-semibold text-stone-800 bg-stone-50/90 border-r border-stone-200 truncate max-w-[170px]">
                  {sa.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleApplySavedAddress(sa, 'groom')}
                  className="px-2.5 py-1 text-blue-700 hover:bg-blue-50 font-bold border-r border-stone-100 transition-colors cursor-pointer"
                  title={`Set Groom's anchor to ${sa.address}`}
                >
                  Fill Groom
                </button>
                <button
                  type="button"
                  onClick={() => handleApplySavedAddress(sa, 'bride')}
                  className="px-2.5 py-1 text-rose-700 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                  title={`Set Bride's anchor to ${sa.address}`}
                >
                  Fill Bride
                </button>
              </div>
            ))}
            {onOpenAddressBook && (
              <button
                type="button"
                onClick={() => onOpenAddressBook('groom')}
                className="text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline flex items-center gap-1 ml-auto cursor-pointer"
              >
                <Bookmark className="w-3 h-3" />
                <span>All Saved ({savedAddresses.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Anchor Cards Display (Dynamic 2-card or 3-card layout) */}
        <div
          className={`grid gap-3 ${
            anchorMode === 'groom_bride_only'
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {/* Anchor 1: Groom */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 interactive-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <span>🤵</span>
                <span>Groom’s Family Side</span>
              </span>
              {onOpenAddressBook && (
                <button
                  type="button"
                  onClick={() => onOpenAddressBook('groom')}
                  className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Select Saved
                </button>
              )}
            </div>
            <div className="mt-1 text-sm font-extrabold text-stone-900">
              {groomAddress.city}, {groomAddress.state}
            </div>
            <div className="text-[11px] text-stone-500 truncate">{groomAddress.address}</div>
          </div>

          {/* Anchor 2: Bride */}
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 interactive-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <span>👰</span>
                <span>Bride’s Family Side</span>
              </span>
              {onOpenAddressBook && (
                <button
                  type="button"
                  onClick={() => onOpenAddressBook('bride')}
                  className="text-[11px] font-semibold text-rose-700 hover:underline cursor-pointer"
                >
                  Select Saved
                </button>
              )}
            </div>
            <div className="mt-1 text-sm font-extrabold text-stone-900">
              {brideAddress.city}, {brideAddress.state}
            </div>
            <div className="text-[11px] text-stone-500 truncate">{brideAddress.address}</div>
          </div>

          {/* Anchor 3: Main Venue Hotel Block (Shown in 3-Way Mode) */}
          {anchorMode === 'three_way' && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 interactive-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Confirmed Wedding Venue</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                  Hotel Block
                </span>
              </div>
              <div className="mt-1 text-sm font-extrabold text-stone-900 truncate">
                {activeMainVenue ? activeMainVenue.name : 'The Rockleigh'}
              </div>
              <div className="text-[11px] text-stone-500 truncate">
                {activeMainVenue
                  ? `${activeMainVenue.city}, ${activeMainVenue.state}`
                  : 'Rockleigh, NJ'}
              </div>
            </div>
          )}
        </div>

        {/* Info banner when 2-Way Mode is active */}
        {anchorMode === 'groom_bride_only' && (
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <Building2 className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                Main Wedding Venue ({activeMainVenue ? activeMainVenue.name : 'The Rockleigh'}) is currently <strong>excluded</strong> from ranking scores.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAnchorMode('three_way')}
              className="text-purple-700 hover:text-purple-900 font-bold underline shrink-0 cursor-pointer"
            >
              Switch to 3-Way Triangulation →
            </button>
          </div>
        )}

        {/* Optional Expandable Address Edit Form */}
        {isEditingAnchors && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AddressAutocompleteInput
                  value={groomAddress}
                  onChange={handleUpdateGroomAddress}
                  label="🤵 Groom's Starting Address"
                  placeholder="Enter Groom's house address"
                  accentColor="blue"
                  savedAddresses={savedAddresses}
                  onSelectSavedAddress={(saved) => handleApplySavedAddress(saved, 'groom')}
                  isLoggedIn={isLoggedIn}
                  onOpenAuthModal={onOpenAuthModal}
                />
              </div>

              <div>
                <AddressAutocompleteInput
                  value={brideAddress}
                  onChange={handleUpdateBrideAddress}
                  label="👰 Bride's Starting Address"
                  placeholder="Enter Bride's house address"
                  accentColor="rose"
                  savedAddresses={savedAddresses}
                  onSelectSavedAddress={(saved) => handleApplySavedAddress(saved, 'bride')}
                  isLoggedIn={isLoggedIn}
                  onOpenAuthModal={onOpenAuthModal}
                />
              </div>
            </div>
          </div>
        )}

        {/* Guest Count Slider & Live Savings Preview */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-purple-700 shrink-0" />
            <div>
              <div className="text-xs font-bold text-stone-800">
                Sangeet Guest Count:{' '}
                <span className="text-purple-700 font-extrabold">{sangeetGuestCount} guests</span>
              </div>
              <div className="text-[11px] text-stone-500">
                Live catering estimates update dynamically for this headcount
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <input
              type="range"
              min="100"
              max="600"
              step="25"
              value={sangeetGuestCount}
              onChange={(e) => setSangeetGuestCount(Number(e.target.value))}
              className="w-full accent-purple-700 cursor-pointer"
            />
            <span className="text-xs font-bold text-stone-700 w-12 text-right">
              {sangeetGuestCount}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Filter, Sort & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* State Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Region:
            </span>
            <button
              type="button"
              onClick={() => setStateFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stateFilter === 'ALL'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All NJ & PA ({PRELOADED_SANGEET_VENUES.length})
            </button>
            <button
              type="button"
              onClick={() => setStateFilter('NJ')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stateFilter === 'NJ'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              New Jersey ({PRELOADED_SANGEET_VENUES.filter((v) => v.state === 'NJ').length})
            </button>
            <button
              type="button"
              onClick={() => setStateFilter('PA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                stateFilter === 'PA'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Pennsylvania ({PRELOADED_SANGEET_VENUES.filter((v) => v.state === 'PA').length})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SangeetSortOption)}
              className="bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs py-1.5 px-3 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            >
              <option value="triangulation">
                {anchorMode === 'groom_bride_only'
                  ? '⚖️ Family Midpoint Sweetspot (Best Balance)'
                  : '✨ Triangulation Sweetspot (Best Balance)'}
              </option>
              <option value="fairness">⚖️ 50/50 Family Equity (Lowest Delta)</option>
              <option value="cost_asc">💰 Lowest Package Cost ($/Guest)</option>
              <option value="groom_closest">🤵 Closest to Groom's Side</option>
              <option value="bride_closest">👰 Closest to Bride's Side</option>
              {anchorMode === 'three_way' && (
                <option value="main_venue_closest">🏛️ Closest to Main Venue Hotel Block</option>
              )}
              <option value="capacity_desc">👥 Largest Capacity (Big Dance Floor)</option>
            </select>
          </div>
        </div>

        {/* Feature Toggles & Search */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHotelOnlyFilter(!hotelOnlyFilter)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                hotelOnlyFilter
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Hotel className="w-3.5 h-3.5" />
              <span>Hotel Rooms on Site</span>
            </button>

            <button
              type="button"
              onClick={() => setLiveChaatOnlyFilter(!liveChaatOnlyFilter)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                liveChaatOnlyFilter
                  ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Live Chaat Counters</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Sangeet halls, cities..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>

      {/* 5. Ranked Sangeet Venue Cards */}
      <div className="space-y-4">
        {rankedVenues.map((item, index) => {
          const v = item.venue;
          const m = item.metrics;
          const isOfficial = officialSangeetVenue?.id === v.id;
          const isTopMatch = index === 0 && sortBy === 'triangulation';

          return (
            <div
              key={v.id}
              className={`bg-white rounded-3xl border transition-all duration-200 shadow-sm overflow-hidden interactive-card ${
                isOfficial
                  ? 'border-2 border-emerald-500 ring-4 ring-emerald-500/10'
                  : isTopMatch
                  ? 'border-purple-300 ring-2 ring-purple-600/10 hover:shadow-md'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header row: Ranking, Tags, Triangulation Score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 font-black text-xs">
                      #{index + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 font-bold text-xs border border-purple-200">
                      {v.highlightTag}
                    </span>
                    {isTopMatch && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-900 font-bold text-xs border border-amber-400/30 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {anchorMode === 'groom_bride_only'
                            ? '#1 Family Midpoint Sweetspot'
                            : '#1 Triangulated Sweetspot'}
                        </span>
                      </span>
                    )}
                    {isOfficial && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed Sangeet Venue</span>
                      </span>
                    )}
                  </div>

                  {/* Triangulation / Midpoint Equity Gauge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {anchorMode === 'groom_bride_only' ? 'Midpoint Fit' : 'Triangulation Fit'}
                      </div>
                      <div className="text-lg font-black text-purple-900">
                        {m.triangulationScore}% <span className="text-xs text-stone-500">match</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border-4 border-purple-600 flex items-center justify-center font-black text-xs text-purple-900 bg-purple-50">
                      {m.triangulationScore}
                    </div>
                  </div>
                </div>

                {/* Venue Name, City, Description */}
                <div>
                  <h3 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                    <span>{v.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {v.city}, {v.state}
                    </span>
                  </h3>
                  <p className="text-xs text-purple-900 font-semibold mt-0.5 italic">
                    "{v.tagline}"
                  </p>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {v.description}
                  </p>
                </div>

                {/* DRIVING TIME COMPARISON BAR */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-50 via-purple-50/40 to-stone-50 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-purple-700" />
                      <span>
                        {anchorMode === 'groom_bride_only'
                          ? '2-Way Family Driving Midpoint:'
                          : '3-Way Driving Triangulation:'}
                      </span>
                    </span>
                    <span className="font-semibold text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded-md text-[11px]">
                      ⚖️ {m.travelDeltaMinutes}m family drive difference ({m.fairnessScore}% equity)
                    </span>
                  </div>

                  <div
                    className={`grid gap-2.5 ${
                      anchorMode === 'groom_bride_only'
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-1 sm:grid-cols-3'
                    }`}
                  >
                    {/* Groom Travel Time */}
                    <div className="p-2.5 rounded-xl bg-white border border-blue-200">
                      <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center justify-between">
                        <span>🤵 Groom's Side</span>
                        <span className="text-stone-400">{groomAddress.city}</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-stone-900">
                          ~{m.groomDriveMinutes} min
                        </span>
                        <span className="text-xs text-stone-500">({m.groomDistanceMiles} mi)</span>
                      </div>
                    </div>

                    {/* Bride Travel Time */}
                    <div className="p-2.5 rounded-xl bg-white border border-rose-200">
                      <div className="text-[10px] font-bold text-rose-900 uppercase tracking-wider flex items-center justify-between">
                        <span>👰 Bride's Side</span>
                        <span className="text-stone-400">{brideAddress.city}</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-stone-900">
                          ~{m.brideDriveMinutes} min
                        </span>
                        <span className="text-xs text-stone-500">({m.brideDistanceMiles} mi)</span>
                      </div>
                    </div>

                    {/* Main Venue Hotel Block Travel Time (Shown in 3-Way Mode) */}
                    {anchorMode === 'three_way' && (
                      <div className="p-2.5 rounded-xl bg-white border border-amber-200">
                        <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                          <span>🏛️ Main Venue Hotel Hub</span>
                          <span className="text-stone-400 truncate max-w-[90px]">
                            {activeMainVenue ? activeMainVenue.city : 'Rockleigh'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-stone-900">
                            ~{m.mainVenueDriveMinutes} min
                          </span>
                          <span className="text-xs text-stone-500">({m.mainVenueDistanceMiles} mi)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Secondary note if 2-Way mode but user wants to know main venue drive */}
                  {anchorMode === 'groom_bride_only' && activeMainVenue && m.mainVenueDriveMinutes > 0 && (
                    <div className="text-[11px] text-stone-500 flex items-center justify-between px-1 pt-0.5">
                      <span>
                        🏛️ Travel to {activeMainVenue.name} hotel block: ~{m.mainVenueDriveMinutes} min ({m.mainVenueDistanceMiles} mi)
                      </span>
                      <span className="text-[10px] text-stone-400 italic">Excluded from 2-way score</span>
                    </div>
                  )}

                  {/* Human-friendly verdict banner */}
                  <div className="text-xs text-stone-700 font-medium flex items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>{m.fairnessVerdict}</span>
                  </div>
                </div>

                {/* Pricing & Sangeet-Specific Amenities Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Pricing Breakdown */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center justify-between">
                        <span>Sangeet Catering & Rental Package</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 font-extrabold">
                          ~65% Less Than Wedding Estate
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-stone-900">
                          ${v.pricePerGuest}
                        </span>
                        <span className="text-xs text-stone-600 font-medium">/ guest all-in</span>
                        <span className="text-xs font-bold text-emerald-800 ml-auto">
                          Total: {formatCurr(item.totalCostForGuests)} ({sangeetGuestCount} guests)
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-stone-600">
                      Hall Rental Fee:{' '}
                      <span className="font-semibold text-stone-900">
                        {v.hallRentalFee === 0 ? 'Included ($0)' : `$${v.hallRentalFee}`}
                      </span>{' '}
                      • Capacity:{' '}
                      <span className="font-semibold text-stone-900">
                        Up to {v.maxCapacity} guests
                      </span>
                    </div>
                  </div>

                  {/* Sangeet Desi Amenities Checklist */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Sangeet & Dance Floor Features
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Large Dance Floor</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>AV & Stage Lighting</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Bhangra Dhol Friendly</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Live Chaat Counters</span>
                      </div>
                    </div>
                    <div className="pt-1 text-[11px] text-stone-600 flex items-center justify-between border-t border-stone-200">
                      <span>Sound Curfew: <strong className="text-stone-900">{v.desiFeatures.soundCurfew}</strong></span>
                      <span>Hotel On-Site: <strong className="text-stone-900">{v.desiFeatures.hotelOnSite ? 'Yes' : 'No'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Curated Pro-Notes */}
                <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="font-bold text-stone-700">Curator Note: </span>
                  {v.curatedNotes}
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {v.contactPhone && (
                      <a
                        href={`tel:${v.contactPhone}`}
                        className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-purple-700" />
                        <span>{v.contactPhone}</span>
                      </a>
                    )}
                    {v.websiteUrl && (
                      <a
                        href={v.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                        <span>Website</span>
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${v.name} ${v.address} ${v.city} ${v.state}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>Directions</span>
                    </a>
                  </div>

                  <div>
                    {isOfficial ? (
                      <button
                        type="button"
                        onClick={handleRemoveOfficialSangeet}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmed Sangeet Venue</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectOfficialSangeet(v)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                          selectedSuccessId === v.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-900 text-white hover:bg-purple-800'
                        }`}
                      >
                        <BookmarkCheck className="w-4 h-4 text-amber-300" />
                        <span>
                          {selectedSuccessId === v.id
                            ? 'Official Sangeet Confirmed!'
                            : '⭐ Select as Official Sangeet Venue'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Bottom WhatsApp Action Callout */}
      <div className="p-6 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ready to discuss with both families?</span>
          </h4>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Copy the full 3-way drive times and pricing comparison to your family WhatsApp group to
            align on the best midpoint celebration hall.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyWhatsAppBrief}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 shrink-0 ${
            copiedWhatsApp
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-amber-400 text-stone-950 hover:bg-amber-300 border-amber-400'
          }`}
        >
          {copiedWhatsApp ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Family WhatsApp Brief</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
