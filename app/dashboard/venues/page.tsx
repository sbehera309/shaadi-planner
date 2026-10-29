'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWedding } from '@/lib/store';
import {
  VenueOption,
  VenueStatus,
  FamilyAddressInput,
  SiteTourDayPlan,
  NearestHotelInfo,
  DualFamilyMeetingMode,
  DualFamilyStartPlan,
} from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  generateSiteTourSchedule,
  formatTourPlanForWhatsApp,
  getDefaultTouringHours,
} from '@/lib/venueRouteOptimizer';
import {
  PRELOADED_CURATED_VENUES,
  syncCuratedVenuesToFirebase,
  getCuratedVenues,
} from '@/lib/preloadedVenues';
import {
  calculateVenueEstimateForGuests,
  EventPackageFormat,
  getVenueTierInfo,
} from '@/lib/venuePricingCalculator';
import AddressAutocompleteInput from '@/components/AddressAutocompleteInput';
import TourDayRouteMap from '@/components/TourDayRouteMap';
import {
  Building2,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  ExternalLink,
  Trash2,
  Edit2,
  Heart,
  Star,
  Navigation,
  DollarSign,
  Utensils,
  Flame,
  Music,
  Users,
  Hotel,
  Coffee,
  Check,
  Copy,
  ArrowRight,
  Filter,
  ArrowUpDown,
  Search,
  BookmarkPlus,
  Compass,
  Bus,
  Calculator,
  AlertTriangle,
} from 'lucide-react';

type CuratedSortOption = 'best' | 'service_desc' | 'price_asc' | 'price_desc' | 'capacity_desc';

export default function VenuesPage() {
  const {
    wedding,
    venues,
    guests,
    tourPlan,
    addVenue,
    updateVenue,
    deleteVenue,
    setOfficialVenue,
    saveTourPlan,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'curated' | 'my-venues' | 'tour-planner'>('curated');
  const [statusFilter, setStatusFilter] = useState<'all' | VenueStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueOption | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  // Curated Database Filters & Sorting
  const [curatedVenues, setCuratedVenues] = useState<VenueOption[]>(PRELOADED_CURATED_VENUES);
  const [curatedStateFilter, setCuratedStateFilter] = useState<'ALL' | 'NJ' | 'PA'>('ALL');
  const [curatedSortBy, setCuratedSortBy] = useState<CuratedSortOption>('best');
  const [curatedSearch, setCuratedSearch] = useState('');
  const [filterOutsideCateringOnly, setFilterOutsideCateringOnly] = useState(false);
  const [filterHavanOnly, setFilterHavanOnly] = useState(false);

  // Guest Count Pricing Estimator State (uses guest list headcount if available, else 350 default)
  const totalGuestHeadcount =
    guests && guests.length > 0
      ? guests.reduce((acc, g) => acc + (g.adultsCount || 1) + (g.kidsCount || 0), 0)
      : wedding?.guestCount || 350;

  const [planningGuestCount, setPlanningGuestCount] = useState<number>(totalGuestHeadcount);
  const [eventFormat, setEventFormat] = useState<EventPackageFormat>('all_day');

  useEffect(() => {
    if (guests && guests.length > 0) {
      const count = guests.reduce((acc, g) => acc + (g.adultsCount || 1) + (g.kidsCount || 0), 0);
      if (count > 0) setPlanningGuestCount(count);
    } else if (wedding?.guestCount && wedding.guestCount > 0) {
      setPlanningGuestCount(wedding.guestCount);
    }
  }, [guests, wedding?.guestCount]);

  // Sync to Firebase on client mount
  useEffect(() => {
    syncCuratedVenuesToFirebase().catch(() => {});
    getCuratedVenues().then((res) => {
      if (res && res.length > 0) setCuratedVenues(res);
    });
  }, []);

  // Form State for Add / Edit Custom Venue
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel_ballroom' as VenueOption['type'],
    address: '',
    city: '',
    state: 'NJ',
    zipCode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    rentalFee: 20000,
    foodAndBeverageMinimum: 50000,
    cateringBuyoutFeePerGuest: 15,
    serviceChargePercent: 22,
    taxPercent: 6.625,
    estimatedTotalCost: 85000,
    allowsOutsideIndianCatering: true,
    cateringKitchenAccess: 'full_kitchen' as 'full_kitchen' | 'prep_only' | 'warming_only' | 'none',
    allowsOpenFlameHavan: true,
    firePermitRequired: true,
    allowsBaraatProcession: true,
    baraatRouteType: 'outdoor_driveway' as 'outdoor_driveway' | 'parking_lot' | 'indoor_hallway' | 'courtyard' | 'prohibited',
    soundCurfewTime: '12:00 AM',
    maxCeremonyCapacity: 450,
    maxReceptionCapacity: 600,
    hasBridalSuite: true,
    hasGroomSuite: true,
    hotelRoomsOnSite: true,
    hotelRoomBlockDiscount: '',
    nearestHotelName: '',
    nearestHotelDistance: 0,
    nearestHotelNotes: '',
    nearestHotelShuttle: true,
    availableDatesString: '',
    tourStatus: 'shortlisted' as VenueStatus,
    prosString: '',
    consString: '',
    rating: 5,
    notes: '',
  });

  // Tour Planner Form State
  const [tourForm, setTourForm] = useState({
    tourDate: tourPlan?.tourDate || '2026-11-14',
    dayStartTime: tourPlan?.dayStartTime || '09:30 AM',
    durationPerTourMinutes: tourPlan?.durationPerTourMinutes || 60,
    bufferBetweenToursMinutes: tourPlan?.bufferBetweenToursMinutes || 15,
    includesLunchBreak: tourPlan?.includesLunchBreak ?? true,
    primarySide: 'groom' as 'groom' | 'bride',
    groomAddress: {
      side: 'groom' as const,
      label: "Groom's Parents Home",
      address: tourPlan?.startLocation.address || '254 Montgomery Street',
      city: tourPlan?.startLocation.city || 'Jersey City',
      state: tourPlan?.startLocation.state || 'NJ',
      zipCode: tourPlan?.startLocation.zipCode || '07302',
    },
    brideAddress: {
      side: 'bride' as const,
      label: "Bride's Family Home",
      address: tourPlan?.secondFamilyLocation?.address || '88 Oak Tree Road',
      city: tourPlan?.secondFamilyLocation?.city || 'Edison',
      state: tourPlan?.secondFamilyLocation?.state || 'NJ',
      zipCode: tourPlan?.secondFamilyLocation?.zipCode || '08820',
    },
    meetingMode: (tourPlan?.meetingMode || 'meet_at_first_venue') as DualFamilyMeetingMode,
    selectedVenueIds: tourPlan?.selectedVenueIds || venues.slice(0, 3).map((v) => v.id),
  });

  // Quick stats
  const shortlistedCount = venues.filter((v) => v.tourStatus === 'shortlisted').length;
  const tourScheduledCount = venues.filter((v) => v.tourStatus === 'tour_scheduled').length;
  const officialVenue = venues.find((v) => v.isSelectedOfficialVenue) || venues.find((v) => v.name === wedding?.venueName);

  const formatCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wedding?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenAdd = () => {
    setEditingVenue(null);
    setFormData({
      name: '',
      type: 'hotel_ballroom',
      address: '',
      city: wedding?.city ? wedding.city.split(',')[0].trim() : 'Jersey City',
      state: 'NJ',
      zipCode: '',
      latitude: undefined as number | undefined,
      longitude: undefined as number | undefined,
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      websiteUrl: '',
      rentalFee: 18000,
      foodAndBeverageMinimum: 45000,
      cateringBuyoutFeePerGuest: 15,
      serviceChargePercent: 22,
      taxPercent: 6.625,
      estimatedTotalCost: 75000,
      allowsOutsideIndianCatering: true,
      cateringKitchenAccess: 'full_kitchen',
      allowsOpenFlameHavan: true,
      firePermitRequired: true,
      allowsBaraatProcession: true,
      baraatRouteType: 'outdoor_driveway',
      soundCurfewTime: '12:00 AM',
      maxCeremonyCapacity: 450,
      maxReceptionCapacity: 550,
      hasBridalSuite: true,
      hasGroomSuite: true,
      hotelRoomsOnSite: true,
      hotelRoomBlockDiscount: '$199/night room block',
      nearestHotelName: '',
      nearestHotelDistance: 0,
      nearestHotelNotes: '',
      nearestHotelShuttle: true,
      availableDatesString: '2026-10-24 (Sat), 2026-11-07 (Sat)',
      tourStatus: 'shortlisted',
      prosString: 'Outside Indian catering permitted; Large ballroom for 450 guests',
      consString: 'Strict midnight sound curfew',
      rating: 5,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VenueOption) => {
    setEditingVenue(v);
    setFormData({
      name: v.name,
      type: v.type,
      address: v.address,
      city: v.city,
      state: v.state,
      zipCode: v.zipCode || '',
      latitude: v.latitude,
      longitude: v.longitude,
      contactPerson: v.contactPerson || '',
      contactEmail: v.contactEmail || '',
      contactPhone: v.contactPhone || '',
      websiteUrl: v.websiteUrl || '',
      rentalFee: v.pricing.rentalFee,
      foodAndBeverageMinimum: v.pricing.foodAndBeverageMinimum,
      cateringBuyoutFeePerGuest: v.pricing.cateringBuyoutFeePerGuest || 0,
      serviceChargePercent: v.pricing.serviceChargePercent,
      taxPercent: v.pricing.taxPercent,
      estimatedTotalCost: v.pricing.estimatedTotalCost,
      allowsOutsideIndianCatering: v.desiFeatures.allowsOutsideIndianCatering,
      cateringKitchenAccess: v.desiFeatures.cateringKitchenAccess || 'full_kitchen',
      allowsOpenFlameHavan: v.desiFeatures.allowsOpenFlameHavan,
      firePermitRequired: v.desiFeatures.firePermitRequired,
      allowsBaraatProcession: v.desiFeatures.allowsBaraatProcession,
      baraatRouteType: v.desiFeatures.baraatRouteType || 'outdoor_driveway',
      soundCurfewTime: v.desiFeatures.soundCurfewTime,
      maxCeremonyCapacity: v.desiFeatures.maxCeremonyCapacity,
      maxReceptionCapacity: v.desiFeatures.maxReceptionCapacity,
      hasBridalSuite: v.desiFeatures.hasBridalSuite,
      hasGroomSuite: v.desiFeatures.hasGroomSuite,
      hotelRoomsOnSite: v.desiFeatures.hotelRoomsOnSite,
      hotelRoomBlockDiscount: v.desiFeatures.hotelRoomBlockDiscount || '',
      nearestHotelName: v.nearestHotel?.hotelName || '',
      nearestHotelDistance: v.nearestHotel?.distanceMiles || 0,
      nearestHotelNotes: v.nearestHotel?.roomBlockDiscountNote || '',
      nearestHotelShuttle: v.nearestHotel?.shuttleProvided ?? true,
      availableDatesString: (v.availableDates || []).join(', '),
      tourStatus: v.tourStatus,
      prosString: (v.pros || []).join('; '),
      consString: (v.cons || []).join('; '),
      rating: v.rating || 5,
      notes: v.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmitVenue = (e: React.FormEvent) => {
    e.preventDefault();
    const availableDates = formData.availableDatesString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const pros = formData.prosString
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    const cons = formData.consString
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    const baseCost = formData.rentalFee + formData.foodAndBeverageMinimum;
    const estimatedTotalCost =
      formData.estimatedTotalCost > 0
        ? formData.estimatedTotalCost
        : Math.round(baseCost * (1 + formData.serviceChargePercent / 100) * (1 + formData.taxPercent / 100));

    let nearestHotel: NearestHotelInfo | undefined = undefined;
    if (formData.nearestHotelName.trim() !== '') {
      nearestHotel = {
        hotelName: formData.nearestHotelName,
        distanceMiles: Number(formData.nearestHotelDistance),
        approxDriveMinutes: Math.round(Number(formData.nearestHotelDistance) * 2 + 2),
        roomBlockDiscountNote: formData.nearestHotelNotes,
        shuttleProvided: formData.nearestHotelShuttle,
      };
    }

    const payload: Omit<VenueOption, 'id' | 'weddingId'> = {
      name: formData.name,
      type: formData.type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      latitude: formData.latitude,
      longitude: formData.longitude,
      contactPerson: formData.contactPerson,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      websiteUrl: formData.websiteUrl,
      pricing: {
        rentalFee: Number(formData.rentalFee),
        foodAndBeverageMinimum: Number(formData.foodAndBeverageMinimum),
        cateringBuyoutFeePerGuest: Number(formData.cateringBuyoutFeePerGuest),
        serviceChargePercent: Number(formData.serviceChargePercent),
        taxPercent: Number(formData.taxPercent),
        estimatedTotalCost,
      },
      desiFeatures: {
        allowsOutsideIndianCatering: formData.allowsOutsideIndianCatering,
        cateringKitchenAccess: formData.cateringKitchenAccess,
        allowsOpenFlameHavan: formData.allowsOpenFlameHavan,
        firePermitRequired: formData.firePermitRequired,
        allowsBaraatProcession: formData.allowsBaraatProcession,
        baraatRouteType: formData.baraatRouteType,
        soundCurfewTime: formData.soundCurfewTime,
        maxCeremonyCapacity: Number(formData.maxCeremonyCapacity),
        maxReceptionCapacity: Number(formData.maxReceptionCapacity),
        hasBridalSuite: formData.hasBridalSuite,
        hasGroomSuite: formData.hasGroomSuite,
        hotelRoomsOnSite: formData.hotelRoomsOnSite,
        hotelRoomBlockDiscount: formData.hotelRoomBlockDiscount,
      },
      nearestHotel,
      availableDates,
      tourStatus: formData.tourStatus,
      pros,
      cons,
      rating: formData.rating,
      notes: formData.notes,
      isSelectedOfficialVenue: editingVenue?.isSelectedOfficialVenue || false,
    };

    if (editingVenue) {
      updateVenue(editingVenue.id, payload);
    } else {
      addVenue(payload);
    }
    setIsModalOpen(false);
  };

  // Add curated venue into user's personal shortlist
  const handleAddCuratedToMyShortlist = (curated: VenueOption) => {
    const isAlreadyAdded = venues.some(
      (v) => v.name.toLowerCase() === curated.name.toLowerCase()
    );
    if (isAlreadyAdded) {
      alert(`"${curated.name}" is already in your shortlist!`);
      return;
    }

    addVenue({
      name: curated.name,
      type: curated.type,
      address: curated.address,
      city: curated.city,
      state: curated.state,
      zipCode: curated.zipCode,
      latitude: curated.latitude,
      longitude: curated.longitude,
      contactPerson: curated.contactPerson,
      contactEmail: curated.contactEmail,
      contactPhone: curated.contactPhone,
      websiteUrl: curated.websiteUrl,
      pricing: curated.pricing,
      desiFeatures: curated.desiFeatures,
      nearestHotel: curated.nearestHotel,
      curatedState: curated.curatedState,
      popularityScore: curated.popularityScore,
      historicalPriceTier: curated.historicalPriceTier,
      availableDates: curated.availableDates,
      tourStatus: 'shortlisted',
      pros: curated.pros,
      cons: curated.cons,
      rating: curated.rating,
      notes: curated.notes,
      isFavorite: true,
    });

    setAddedSuccessId(curated.id);
    setTimeout(() => setAddedSuccessId(null), 3000);
  };

  const handleToggleVenueSelectionForTour = (venueId: string) => {
    setTourForm((prev) => {
      const exists = prev.selectedVenueIds.includes(venueId);
      const updated = exists
        ? prev.selectedVenueIds.filter((id) => id !== venueId)
        : [...prev.selectedVenueIds, venueId];
      return { ...prev, selectedVenueIds: updated };
    });
  };

  const handleGenerateOptimalTourPlan = () => {
    const selectedVenues = venues.filter((v) => tourForm.selectedVenueIds.includes(v.id));
    if (selectedVenues.length === 0) {
      alert('Please select at least 1 or more venues to include in your site tour day.');
      return;
    }

    const startLocation =
      tourForm.primarySide === 'groom' ? tourForm.groomAddress : tourForm.brideAddress;
    const secondFamilyLocation =
      tourForm.primarySide === 'groom' ? tourForm.brideAddress : tourForm.groomAddress;

    const newPlan = generateSiteTourSchedule({
      weddingId: wedding?.id || 'w-user-1',
      tourDate: tourForm.tourDate,
      startLocation,
      secondFamilyLocation,
      meetingMode: tourForm.meetingMode,
      venues: selectedVenues,
      dayStartTime: tourForm.dayStartTime,
      durationPerTourMinutes: tourForm.durationPerTourMinutes,
      bufferBetweenToursMinutes: tourForm.bufferBetweenToursMinutes,
      includesLunchBreak: tourForm.includesLunchBreak,
    });

    saveTourPlan(newPlan);
  };

  const handleCopyWhatsApp = () => {
    if (!tourPlan) return;
    const text = formatTourPlanForWhatsApp(tourPlan, venues);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  // Filter & Sort Curated Venues List
  const processedCuratedVenues = curatedVenues
    .filter((v) => {
      if (curatedStateFilter !== 'ALL' && v.curatedState !== curatedStateFilter && v.state !== curatedStateFilter) {
        return false;
      }
      if (filterOutsideCateringOnly && !v.desiFeatures.allowsOutsideIndianCatering) {
        return false;
      }
      if (filterHavanOnly && !v.desiFeatures.allowsOpenFlameHavan) {
        return false;
      }
      if (curatedSearch.trim() !== '') {
        const q = curatedSearch.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesCity = v.city.toLowerCase().includes(q);
        const matchesHotel = v.nearestHotel?.hotelName.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesHotel) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (curatedSortBy === 'best') {
        return (b.popularityScore || 90) - (a.popularityScore || 90);
      }
      if (curatedSortBy === 'service_desc') {
        return (b.serviceRating?.score || 80) - (a.serviceRating?.score || 80);
      }
      if (curatedSortBy === 'price_asc') {
        const costA = calculateVenueEstimateForGuests(a, planningGuestCount, eventFormat).estimatedTotalCost;
        const costB = calculateVenueEstimateForGuests(b, planningGuestCount, eventFormat).estimatedTotalCost;
        return costA - costB;
      }
      if (curatedSortBy === 'price_desc') {
        const costA = calculateVenueEstimateForGuests(a, planningGuestCount, eventFormat).estimatedTotalCost;
        const costB = calculateVenueEstimateForGuests(b, planningGuestCount, eventFormat).estimatedTotalCost;
        return costB - costA;
      }
      if (curatedSortBy === 'capacity_desc') {
        return b.desiFeatures.maxReceptionCapacity - a.desiFeatures.maxReceptionCapacity;
      }
      return 0;
    });

  const filteredMyVenues =
    statusFilter === 'all'
      ? venues
      : venues.filter((v) => v.tourStatus === statusFilter);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-amber-900/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Phase 1 • Preloaded Venue Directory & Multi-Site Tour Day</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-amber-100">
            Wedding & Reception Venue Scouting
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
            Explore curated, preloaded venue intelligence for <strong>New Jersey (NJ)</strong> and <strong>Pennsylvania (PA)</strong>.
            Compare outside Indian catering policies, havan open-flame permissions, sound curfews, and closest hotel accommodations without having to spend hours cold-calling sales offices.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('curated')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                activeTab === 'curated'
                  ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-amber-200 border-white/20'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Browse Preloaded Venues (NJ & PA)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('my-venues')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                activeTab === 'my-venues'
                  ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-amber-200 border-white/20'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>My Shortlist ({venues.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tour-planner')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                activeTab === 'tour-planner'
                  ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-amber-200 border-white/20'
              }`}
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span>Optimize Site Tour Route</span>
            </button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Preloaded Venues (NJ & PA)
          </span>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-stone-900">
            {curatedVenues.length} <span className="text-xs font-medium text-stone-400">verified</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-800 font-medium">
            {curatedVenues.filter((v) => v.curatedState === 'NJ' || v.state === 'NJ').length} in NJ •{' '}
            {curatedVenues.filter((v) => v.curatedState === 'PA' || v.state === 'PA').length} in PA
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
            My Shortlist
          </span>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-stone-900">
            {venues.length} <span className="text-xs font-medium text-stone-400">candidates</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-800 font-medium">
            {shortlistedCount} ready for site visits
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Site Tour Day Stops
          </span>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-stone-900">
            {tourPlan ? tourPlan.optimizedStops.length : tourScheduledCount}{' '}
            <span className="text-xs font-medium text-stone-400">stops</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-800 font-medium">
            {tourPlan ? `~${tourPlan.totalEstDrivingMinutes}m total drive` : 'Select stops to schedule'}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Official Selected Venue
          </span>
          <div className="mt-1.5 text-base sm:text-lg font-extrabold text-stone-900 truncate">
            {officialVenue ? officialVenue.name : wedding?.venueName || 'Not finalized yet'}
          </div>
          <div className="mt-1 text-[11px] text-stone-500 truncate">
            {officialVenue ? `${officialVenue.city}, ${officialVenue.state}` : 'Scouting prospective venues'}
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-stone-200 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('curated')}
          className={`py-3 px-4 sm:px-6 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'curated'
              ? 'border-rose-700 text-rose-800 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore Curated Venues (NJ & PA)</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
            {curatedVenues.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-venues')}
          className={`py-3 px-4 sm:px-6 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'my-venues'
              ? 'border-rose-700 text-rose-800 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Shortlist ({venues.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tour-planner')}
          className={`py-3 px-4 sm:px-6 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tour-planner'
              ? 'border-rose-700 text-rose-800 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Site Tour Route & Day Schedule</span>
          {tourPlan && (
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
              Active Plan
            </span>
          )}
        </button>
      </div>

      {/* Interactive Guest Count & Pricing Estimator Bar */}
      {(activeTab === 'curated' || activeTab === 'my-venues') && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-700 text-white shadow-2xs">
                  <Calculator className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Live Venue Contract &amp; Capacity Estimator
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  Verified Contract Quotes
                </span>
              </div>
              <p className="text-xs text-stone-600 max-w-xl">
                Enter your planned guest count. Pricing dynamically reflects verified 2026–2027 Desi wedding contracts (Morning Baraat/Ceremony &amp; Luncheon + Evening Cocktail Hour &amp; Dinner Reception with Premium Liquor Bar, 22–24% service, and state taxes).
              </p>
            </div>

            {/* Event Format Selector, Inputs & Presets */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Event Format Toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-stone-300 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setEventFormat('all_day')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    eventFormat === 'all_day'
                      ? 'bg-rose-950 text-white shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Full All-Day Event: Morning Baraat/Ceremony/Lunch + Evening Reception/Bar"
                >
                  <span>☀️🌙 Full All-Day Wedding</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEventFormat('reception_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    eventFormat === 'reception_only'
                      ? 'bg-rose-950 text-white shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Evening Reception Only: Cocktail Hour + Dinner & Dancing + Open Bar"
                >
                  <span>🌙 Reception Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEventFormat('ceremony_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    eventFormat === 'ceremony_only'
                      ? 'bg-rose-950 text-white shadow-2xs'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                  title="Morning Ceremony Only: Baraat + Mandap Pheras + Luncheon"
                >
                  <span>☀️ Ceremony Only</span>
                </button>
              </div>

              {/* Guests Input */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-stone-300 shadow-2xs">
                <Users className="w-4 h-4 text-rose-700 shrink-0" />
                <label className="text-xs font-bold text-stone-700">Guests:</label>
                <input
                  type="number"
                  min={50}
                  max={1500}
                  step={25}
                  value={planningGuestCount}
                  onChange={(e) => setPlanningGuestCount(Math.max(1, Number(e.target.value)))}
                  className="w-20 px-1 py-0.5 text-center font-extrabold text-stone-900 text-base sm:text-sm bg-transparent border-b-2 border-rose-500 focus:outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-stone-200">
                {[200, 300, 350, 450, 600].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setPlanningGuestCount(count)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      planningGuestCount === count
                        ? 'bg-rose-950 text-white shadow-2xs scale-105'
                        : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 1: CURATED VENUES DIRECTORY (NJ & PA)                     */}
      {/* ============================================================= */}
      {activeTab === 'curated' && (
        <div className="space-y-6">
          {/* Controls Bar: State Switcher + Search + Sorting */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* State Pills */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-stone-500">State:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCuratedStateFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      curatedStateFilter === 'ALL'
                        ? 'bg-rose-950 text-white shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    All States ({curatedVenues.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCuratedStateFilter('NJ')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      curatedStateFilter === 'NJ'
                        ? 'bg-rose-950 text-white shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    New Jersey ({curatedVenues.filter((v) => v.curatedState === 'NJ' || v.state === 'NJ').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCuratedStateFilter('PA')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      curatedStateFilter === 'PA'
                        ? 'bg-rose-950 text-white shadow-2xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    Pennsylvania ({curatedVenues.filter((v) => v.curatedState === 'PA' || v.state === 'PA').length})
                  </button>
                </div>
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                <span>Sort By:</span>
                <select
                  value={curatedSortBy}
                  onChange={(e) => setCuratedSortBy(e.target.value as CuratedSortOption)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs focus:ring-2 focus:ring-rose-500"
                >
                  <option value="best">⭐ Best Overall (Desi Rank)</option>
                  <option value="service_desc">👑 Highest Service &amp; Hospitality Rating</option>
                  <option value="price_asc">💰 Historical Pricing (Low to High)</option>
                  <option value="price_desc">💎 Historical Pricing (High to Low)</option>
                  <option value="capacity_desc">👥 Guest Capacity (Largest First)</option>
                </select>
              </div>
            </div>

            {/* Search Input & Quick Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={curatedSearch}
                  onChange={(e) => setCuratedSearch(e.target.value)}
                  placeholder="Search by venue name, city, or nearest hotel..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={filterOutsideCateringOnly}
                    onChange={(e) => setFilterOutsideCateringOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Outside Catering Allowed</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={filterHavanOnly}
                    onChange={(e) => setFilterHavanOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Agni Havan Permitted</span>
                </label>
              </div>
            </div>
          </div>

          {/* Success Notification Banner */}
          {addedSuccessId && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Venue added to your personal Shortlist! You can now schedule it for site tours or compare quotes.</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('my-venues')}
                className="underline font-bold text-emerald-800 hover:text-emerald-950"
              >
                View My Shortlist →
              </button>
            </div>
          )}

          {/* Curated Venues Grid */}
          {processedCuratedVenues.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-dashed border-stone-300 text-center space-y-3">
              <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">No venues matching these filters</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try switching the state filter or clearing your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {processedCuratedVenues.map((venue) => {
                const isAlreadyShortlisted = venues.some(
                  (v) => v.name.toLowerCase() === venue.name.toLowerCase()
                );
                const tierInfo = venue.popularityScore ? getVenueTierInfo(venue.popularityScore) : null;

                return (
                  <div
                    key={venue.id}
                    className="bg-white rounded-3xl border border-stone-200 hover:border-amber-400/90 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                              {venue.curatedState === 'NJ' ? 'New Jersey (NJ)' : 'Pennsylvania (PA)'}
                            </span>

                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                              {venue.type.replace('_', ' ')}
                            </span>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                              <span>{venue.popularityScore}/100 Desi Rank</span>
                            </span>

                            {tierInfo && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${tierInfo.pillBg} ${tierInfo.pillText} ${tierInfo.pillBorder}`}
                                title={tierInfo.label}
                              >
                                <span>{tierInfo.badgeLabel}</span>
                              </span>
                            )}

                            {venue.serviceRating && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1"
                                title={`Service Score: ${venue.serviceRating.score}/100 • Server Ratio: ${venue.serviceRating.serverToGuestRatio}`}
                              >
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                <span>{venue.serviceRating.score}/100 Service</span>
                              </span>
                            )}

                            {venue.historicalPriceTier && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                                {venue.historicalPriceTier}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-xl text-stone-900 font-serif leading-tight">
                            {venue.name}
                          </h3>

                          <p className="text-xs text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>
                              {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
                            </span>
                          </p>
                        </div>

                        {/* Direct website link */}
                        {venue.websiteUrl && (
                          <a
                            href={venue.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-stone-400 hover:text-rose-700 hover:bg-stone-50 transition-colors shrink-0"
                            title="Open Official Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      {/* Desi Wedding Capabilities Checklist */}
                      <div className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Verified Desi Wedding Specs:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {/* Outside Indian Catering */}
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Indian Catering
                              </span>
                              <span className="text-[10px] text-stone-500">
                                Allowed (${venue.pricing.cateringBuyoutFeePerGuest}/pp)
                              </span>
                            </div>
                          </div>

                          {/* Open Flame Havan */}
                          <div className="flex items-start gap-1.5">
                            <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Sacred Flame Havan
                              </span>
                              <span className="text-[10px] text-stone-500">
                                Permitted for Pheras
                              </span>
                            </div>
                          </div>

                          {/* Baraat Procession */}
                          <div className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Grand Baraat
                              </span>
                              <span className="text-[10px] text-stone-500 capitalize">
                                {venue.desiFeatures.baraatRouteType?.replace('_', ' ') || 'Driveway'}
                              </span>
                            </div>
                          </div>

                          {/* Sound Curfew */}
                          <div className="flex items-start gap-1.5">
                            <Music className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Sound Curfew
                              </span>
                              <span className="text-[10px] text-stone-500">
                                Until {venue.desiFeatures.soundCurfewTime}
                              </span>
                            </div>
                          </div>

                          {/* Capacity */}
                          <div className="flex items-start gap-1.5">
                            <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Guest Capacity
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {venue.desiFeatures.maxCeremonyCapacity} Mandap /{' '}
                                {venue.desiFeatures.maxReceptionCapacity} Banquet
                              </span>
                            </div>
                          </div>

                          {/* Hotel lodging on site */}
                          <div className="flex items-start gap-1.5">
                            <Hotel className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Hotel Lodging
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {venue.desiFeatures.hotelRoomsOnSite ? 'On-site rooms' : 'Partner hotel'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nearest / Preferred Hotel Card (CRUCIAL USER REQUEST) */}
                      {venue.nearestHotel && (
                        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                              <Hotel className="w-3.5 h-3.5 text-blue-700" />
                              <span>Nearest / Preferred Hotel Accommodations:</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                              {venue.nearestHotel.distanceMiles === 0
                                ? 'On-Site Hotel'
                                : `${venue.nearestHotel.distanceMiles} mi away (~${venue.nearestHotel.approxDriveMinutes}m)`}
                            </span>
                          </div>

                          <div className="font-semibold text-stone-900 text-xs">
                            {venue.nearestHotel.hotelName}
                          </div>

                          {venue.nearestHotel.roomBlockDiscountNote && (
                            <p className="text-[11px] text-stone-600">
                              🏷️ {venue.nearestHotel.roomBlockDiscountNote}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-between pt-1 text-[10px] text-stone-500">
                            {venue.nearestHotel.shuttleProvided ? (
                              <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold">
                                <Bus className="w-3 h-3 text-emerald-600" />
                                <span>Complimentary wedding shuttle provided</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-stone-500">
                                <Car className="w-3 h-3" />
                                <span>Short Uber / drive transfer</span>
                              </span>
                            )}
                            {venue.nearestHotel.phone && (
                              <a href={`tel:${venue.nearestHotel.phone}`} className="hover:underline">
                                📞 {venue.nearestHotel.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Service & Hospitality Excellence Card */}
                      {venue.serviceRating && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-stone-50/60 to-rose-50/40 border border-amber-200/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Service &amp; Hospitality Rating:</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                ⭐ {venue.serviceRating.starRating} / 5.0
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-bold">
                                {venue.serviceRating.score}/100 Score
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5 text-[11px]">
                            <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
                              <span className="text-stone-500 block text-[10px] font-medium">Server Ratio:</span>
                              <span className="font-bold text-stone-900">{venue.serviceRating.serverToGuestRatio}</span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60">
                              <span className="text-stone-500 block text-[10px] font-medium">Bridal Attendant:</span>
                              <span className="font-bold text-stone-900">
                                {venue.serviceRating.hasDedicatedBridalAttendant ? '✓ Dedicated Butler' : 'Shared / Standard Staff'}
                              </span>
                            </div>
                            <div className="bg-white/80 p-2 rounded-xl border border-stone-200/60 col-span-2 sm:col-span-1">
                              <span className="text-stone-500 block text-[10px] font-medium">Vendor Coordination:</span>
                              <span className="font-bold text-stone-900">{venue.serviceRating.vendorCoordinationScore}/100 Mandap &amp; DJ</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-amber-950/90 italic pt-1 border-t border-amber-200/60">
                            &ldquo;{venue.serviceRating.highlight}&rdquo;
                          </p>
                        </div>
                      )}
                      {(() => {
                        const estimate = calculateVenueEstimateForGuests(
                          venue,
                          planningGuestCount,
                          eventFormat
                        );

                        return (
                          <div className="space-y-2">
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-rose-50/80 border border-amber-200/90 text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                                    <Calculator className="w-3 h-3 text-rose-700" />
                                    <span>
                                      {eventFormat === 'all_day'
                                        ? `Est. All-Day Package for ${planningGuestCount} Guests:`
                                        : eventFormat === 'reception_only'
                                        ? `Est. Evening Reception for ${planningGuestCount} Guests:`
                                        : `Est. Morning Ceremony for ${planningGuestCount} Guests:`}
                                    </span>
                                  </span>
                                  <strong className="text-stone-900 text-xl font-extrabold block">
                                    {formatCurr(estimate.estimatedTotalCost)}
                                  </strong>
                                </div>
                                <div className="text-right">
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-extrabold text-xs text-rose-900 shadow-2xs">
                                    ~{formatCurr(estimate.costPerGuest)} / guest
                                  </span>
                                  <span className="block text-[10px] text-stone-500 mt-0.5">all-in verified quote</span>
                                </div>
                              </div>

                              {/* Capacity Warning Alert */}
                              {estimate.isOverCapacity && (
                                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-950 text-[11px] font-semibold flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>
                                    {planningGuestCount} guests exceeds banquet capacity ({estimate.maxCapacity} max).
                                  </span>
                                </div>
                              )}

                              {/* Breakdown Pills */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 text-[10px] text-stone-600 border-t border-amber-200/60">
                                <div>
                                  <span className="text-stone-400 block">Morning Ceremony:</span>
                                  <span className="font-semibold text-stone-800">
                                    {formatCurr(estimate.morningCeremonyTotal)} (~${estimate.morningRatePerGuest}/pp)
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Evening Reception:</span>
                                  <span className="font-semibold text-stone-800">
                                    {formatCurr(estimate.eveningReceptionTotal)} (~${estimate.eveningRatePerGuest}/pp)
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Svc &amp; Admin:</span>
                                  <span className="font-semibold text-stone-800">
                                    {estimate.serviceChargePercent}% ({formatCurr(estimate.serviceChargeAmount)})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Tax &amp; Gratuity:</span>
                                  <span className="font-semibold text-stone-800">
                                    {estimate.taxPercent}% + {estimate.tipPercent}% tip
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] text-stone-500 italic pt-1 border-t border-amber-200/40">
                                <span>* Real verified contract package: Baraat, Mandap ceremony, luncheon, 5-hr evening reception with premium open bar &amp; maître d&apos;.</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Pros & Notes */}
                      <div className="space-y-1.5 text-xs">
                        {venue.pros?.slice(0, 3).map((pro, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-stone-700">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span className="text-[11px]">{pro}</span>
                          </div>
                        ))}
                        {venue.notes && (
                          <p className="text-[11px] text-stone-600 italic pt-1 border-t border-stone-100">
                            💡 {venue.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
                      {venue.contactPhone ? (
                        <a
                          href={`tel:${venue.contactPhone}`}
                          className="text-stone-600 hover:text-stone-900 font-semibold text-xs flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-rose-600" />
                          <span>{venue.contactPhone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-stone-400">Contact office</span>
                      )}

                      <div>
                        {isAlreadyShortlisted ? (
                          <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-300 inline-flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Your Shortlist</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddCuratedToMyShortlist(venue)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-800 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-rose-900/20 transition-all flex items-center gap-1.5"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                            <span>+ Add to My Shortlist</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: MY SHORTLIST & COMPARISON MATRIX                       */}
      {/* ============================================================= */}
      {activeTab === 'my-venues' && (
        <div className="space-y-6">
          {/* Header row with Add Custom button */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-stone-600">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <span>Status Filter:</span>
              <div className="flex flex-wrap gap-1.5 ml-1">
                {(['all', 'shortlisted', 'tour_scheduled', 'toured', 'selected', 'declined'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-xl capitalize font-semibold transition-colors ${
                        statusFilter === status
                          ? 'bg-rose-950 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Custom Venue</span>
            </button>
          </div>

          {/* Venues Grid */}
          {filteredMyVenues.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-dashed border-stone-300 text-center space-y-3">
              <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">Your shortlist is currently empty</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Explore our preloaded directory of New Jersey and Pennsylvania venues to add candidate locations, or manually add a custom venue.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('curated')}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs"
                >
                  Explore NJ & PA Venues
                </button>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
                >
                  + Add Custom Venue
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {filteredMyVenues.map((venue) => {
                const isSelected = venue.isSelectedOfficialVenue || venue.name === wedding?.venueName;
                const isIncludedInTour = tourForm.selectedVenueIds.includes(venue.id);

                return (
                  <div
                    key={venue.id}
                    className={`bg-white rounded-3xl border transition-all hover:shadow-md p-5 sm:p-6 flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                              {venue.type.replace('_', ' ')}
                            </span>

                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                venue.tourStatus === 'selected' || isSelected
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : venue.tourStatus === 'tour_scheduled'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : venue.tourStatus === 'toured'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : venue.tourStatus === 'declined'
                                  ? 'bg-stone-200 text-stone-600 line-through'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {venue.tourStatus.replace('_', ' ')}
                            </span>

                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Official Venue</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-xl text-stone-900 font-serif leading-tight">
                            {venue.name}
                          </h3>

                          <p className="text-xs text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>
                              {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
                            </span>
                          </p>
                        </div>

                        {/* Top Action Icons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              updateVenue(venue.id, { isFavorite: !venue.isFavorite })
                            }
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                            title="Favorite"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                venue.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(venue)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove "${venue.name}" from shortlisted venues?`)) {
                                deleteVenue(venue.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Desi Wedding Capabilities Badges */}
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                          Desi Wedding Compatibility Checklist:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {/* Outside Indian Catering */}
                          <div className="flex items-start gap-1.5">
                            {venue.desiFeatures.allowsOutsideIndianCatering ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Indian Catering
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {venue.desiFeatures.allowsOutsideIndianCatering
                                  ? `Allowed ($${venue.pricing.cateringBuyoutFeePerGuest || 0}/pp)`
                                  : 'In-House Only'}
                              </span>
                            </div>
                          </div>

                          {/* Open Flame Havan */}
                          <div className="flex items-start gap-1.5">
                            {venue.desiFeatures.allowsOpenFlameHavan ? (
                              <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Agni Havan Kund
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {venue.desiFeatures.allowsOpenFlameHavan
                                  ? 'Permitted for Pheras'
                                  : 'No open flame'}
                              </span>
                            </div>
                          </div>

                          {/* Baraat Access */}
                          <div className="flex items-start gap-1.5">
                            {venue.desiFeatures.allowsBaraatProcession ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Baraat Procession
                              </span>
                              <span className="text-[10px] text-stone-500 capitalize">
                                {venue.desiFeatures.allowsBaraatProcession
                                  ? venue.desiFeatures.baraatRouteType?.replace('_', ' ') || 'Driveway'
                                  : 'Prohibited'}
                              </span>
                            </div>
                          </div>

                          {/* Sound Curfew */}
                          <div className="flex items-start gap-1.5">
                            <Music className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Sound Curfew
                              </span>
                              <span className="text-[10px] text-stone-500">
                                Until {venue.desiFeatures.soundCurfewTime}
                              </span>
                            </div>
                          </div>

                          {/* Guest Capacity */}
                          <div className="flex items-start gap-1.5">
                            <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Guest Capacity
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {venue.desiFeatures.maxCeremonyCapacity} Pheras /{' '}
                                {venue.desiFeatures.maxReceptionCapacity} Rec
                              </span>
                            </div>
                          </div>

                          {/* Hotel Rooms on Site */}
                          <div className="flex items-start gap-1.5">
                            <Hotel className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-stone-800 block text-[11px]">
                                Hotel Rooms
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {venue.desiFeatures.hotelRoomsOnSite
                                  ? 'On-site hotel block'
                                  : 'Off-site shuttle'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nearest Hotel Card if available */}
                      {venue.nearestHotel && (
                        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/70 space-y-1 text-xs">
                          <span className="font-bold text-blue-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                            <Hotel className="w-3.5 h-3.5 text-blue-700" />
                            <span>Preferred Accommodations: {venue.nearestHotel.hotelName}</span>
                          </span>
                          <p className="text-[11px] text-stone-600">
                            {venue.nearestHotel.roomBlockDiscountNote || `${venue.nearestHotel.distanceMiles} miles from venue`}
                          </p>
                        </div>
                      )}

                      {/* Live Calculated Estimate for Guest Count */}
                      {(() => {
                        const estimate = calculateVenueEstimateForGuests(
                          venue,
                          planningGuestCount,
                          eventFormat
                        );

                        return (
                          <div className="space-y-2">
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-rose-50/80 border border-amber-200/90 text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                                    <Calculator className="w-3 h-3 text-rose-700" />
                                    <span>
                                      {eventFormat === 'all_day'
                                        ? `Est. All-Day Package for ${planningGuestCount} Guests:`
                                        : eventFormat === 'reception_only'
                                        ? `Est. Evening Reception for ${planningGuestCount} Guests:`
                                        : `Est. Morning Ceremony for ${planningGuestCount} Guests:`}
                                    </span>
                                  </span>
                                  <strong className="text-stone-900 text-xl font-extrabold block">
                                    {formatCurr(estimate.estimatedTotalCost)}
                                  </strong>
                                </div>
                                <div className="text-right">
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-extrabold text-xs text-rose-900 shadow-2xs">
                                    ~{formatCurr(estimate.costPerGuest)} / guest
                                  </span>
                                  <span className="block text-[10px] text-stone-500 mt-0.5">all-in verified quote</span>
                                </div>
                              </div>

                              {/* Capacity Warning Alert */}
                              {estimate.isOverCapacity && (
                                <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-950 text-[11px] font-semibold flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>
                                    {planningGuestCount} guests exceeds banquet capacity ({estimate.maxCapacity} max).
                                  </span>
                                </div>
                              )}

                              {/* Breakdown Pills */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 text-[10px] text-stone-600 border-t border-amber-200/60">
                                <div>
                                  <span className="text-stone-400 block">Morning Ceremony:</span>
                                  <span className="font-semibold text-stone-800">
                                    {formatCurr(estimate.morningCeremonyTotal)} (~${estimate.morningRatePerGuest}/pp)
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Evening Reception:</span>
                                  <span className="font-semibold text-stone-800">
                                    {formatCurr(estimate.eveningReceptionTotal)} (~${estimate.eveningRatePerGuest}/pp)
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Svc &amp; Admin:</span>
                                  <span className="font-semibold text-stone-800">
                                    {estimate.serviceChargePercent}% ({formatCurr(estimate.serviceChargeAmount)})
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Tax &amp; Gratuity:</span>
                                  <span className="font-semibold text-stone-800">
                                    {estimate.taxPercent}% + {estimate.tipPercent}% tip
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] text-stone-500 italic pt-1 border-t border-amber-200/40">
                                <span>* Real verified contract package: Baraat route, Mandap ceremony, luncheon, 5-hr evening reception with premium open bar &amp; maître d&apos;.</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                        <input
                          type="checkbox"
                          checked={isIncludedInTour}
                          onChange={() => handleToggleVenueSelectionForTour(venue.id)}
                          className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500"
                        />
                        <span>Include in Site Tour Day</span>
                      </label>

                      <div className="flex items-center gap-2">
                        {!isSelected ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Lock in "${venue.name}" as your official wedding venue? This will update your profile and create a budget entry.`
                                )
                              ) {
                                setOfficialVenue(venue.id);
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <span>Select as Official Venue</span>
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Chosen Wedding Venue</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: SITE TOUR ROUTE & SCHEDULE OPTIMIZER                   */}
      {/* ============================================================= */}
      {activeTab === 'tour-planner' && (
        <div className="space-y-8">
          {/* Settings & Route Parameters Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-rose-700 font-bold text-xs uppercase tracking-wider">
                <Car className="w-4 h-4" />
                <span>Multi-Venue Day Tour Scheduler</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                Plan Your Family Site Tour Day & Optimal Route
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Touring 2 to 4 wedding venues with both sets of parents in a single day is a major logistical milestone.
                Enter both family addresses and select the venues you wish to tour. The engine calculates the optimal driving sequence, avoids backtracking, suggests professional appointment time windows, and builds a multi-stop turn-by-turn Google Maps link.
              </p>
            </div>

            {/* Dual-Family Route Planning Strategy Selection */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Dual-Family Route Planning Strategy
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1: Balanced Stop #1 */}
                <button
                  type="button"
                  onClick={() => setTourForm({ ...tourForm, meetingMode: 'meet_at_first_venue' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    tourForm.meetingMode === 'meet_at_first_venue'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100/70 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <span>🤝</span>
                      <span>Meet at Balanced Stop #1</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Picks a fair, central 1st venue between both homes. Computes synchronized departure times so Groom and Bride families arrive together without waiting.
                  </p>
                </button>

                {/* Option 2: Carpool Morning Chai */}
                <button
                  type="button"
                  onClick={() => setTourForm({ ...tourForm, meetingMode: 'carpool_pickup' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    tourForm.meetingMode === 'carpool_pickup'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100/70 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <span>🚙</span>
                      <span>Carpool &amp; Morning Chai</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-700 font-semibold">
                      20m Chai
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    One family drives to the other for a 20-min morning chai break. Auto-selects driver to minimize driving and eliminate backtracking.
                  </p>
                </button>

                {/* Option 3: Single Family Origin */}
                <button
                  type="button"
                  onClick={() => setTourForm({ ...tourForm, meetingMode: 'single_family_start' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    tourForm.meetingMode === 'single_family_start'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100/70 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <span>🏠</span>
                      <span>Single Family Origin</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Caravan starts directly from the selected primary family residence.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Family Address 1: Groom's Side */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Family Address 1 (Groom's Side)</span>
                  </span>
                  {tourForm.meetingMode === 'meet_at_first_venue' ? (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Simultaneous Departure
                    </span>
                  ) : (
                    <label className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="primarySide"
                        checked={tourForm.primarySide === 'groom'}
                        onChange={() => setTourForm({ ...tourForm, primarySide: 'groom' })}
                      />
                      <span>{tourForm.meetingMode === 'carpool_pickup' ? 'Driver (Starts Here)' : 'Start Day Here'}</span>
                    </label>
                  )}
                </div>

                <AddressAutocompleteInput
                  value={tourForm.groomAddress}
                  onChange={(updated) =>
                    setTourForm({
                      ...tourForm,
                      groomAddress: {
                        ...tourForm.groomAddress,
                        ...updated,
                      },
                    })
                  }
                  label="Groom's Home Address"
                  placeholder="Start typing (e.g. 254 Montgomery St or Parsippany)..."
                  accentColor="blue"
                  quickSuggestions={[
                    { label: 'Jersey City (Montgomery)', address: '254 Montgomery Street', city: 'Jersey City', state: 'NJ', zipCode: '07302', lat: 40.7188, lon: -74.0435 },
                    { label: 'Parsippany (Smith Rd)', address: '199 Smith Road', city: 'Parsippany', state: 'NJ', zipCode: '07054', lat: 40.8653, lon: -74.4174 },
                    { label: 'Morristown (Whippany)', address: '2 Whippany Road', city: 'Morristown', state: 'NJ', zipCode: '07960', lat: 40.8035, lon: -74.4532 },
                    { label: 'Princeton (Nassau)', address: '100 Nassau Street', city: 'Princeton', state: 'NJ', zipCode: '08542', lat: 40.3499, lon: -74.6598 },
                  ]}
                />
              </div>

              {/* Family Address 2: Bride's Side */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Family Address 2 (Bride's Side)</span>
                  </span>
                  {tourForm.meetingMode === 'meet_at_first_venue' ? (
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      Simultaneous Departure
                    </span>
                  ) : (
                    <label className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="primarySide"
                        checked={tourForm.primarySide === 'bride'}
                        onChange={() => setTourForm({ ...tourForm, primarySide: 'bride' })}
                      />
                      <span>{tourForm.meetingMode === 'carpool_pickup' ? 'Driver (Starts Here)' : 'Start Day Here'}</span>
                    </label>
                  )}
                </div>

                <AddressAutocompleteInput
                  value={tourForm.brideAddress}
                  onChange={(updated) =>
                    setTourForm({
                      ...tourForm,
                      brideAddress: {
                        ...tourForm.brideAddress,
                        ...updated,
                      },
                    })
                  }
                  label="Bride's Home Address"
                  placeholder="Start typing (e.g. 88 Oak Tree Rd or Somerset)..."
                  accentColor="rose"
                  quickSuggestions={[
                    { label: 'Edison (Oak Tree Rd)', address: '88 Oak Tree Road', city: 'Edison', state: 'NJ', zipCode: '08820', lat: 40.5701, lon: -74.3418 },
                    { label: 'Somerset (Davidson Ave)', address: '333 Davidson Avenue', city: 'Somerset', state: 'NJ', zipCode: '08873', lat: 40.5284, lon: -74.5218 },
                    { label: 'Livingston (Northfield)', address: '315 E Northfield Road', city: 'Livingston', state: 'NJ', zipCode: '07039', lat: 40.7891, lon: -74.3418 },
                    { label: 'Philadelphia (Broad St)', address: '1400 S Broad Street', city: 'Philadelphia', state: 'PA', zipCode: '19146', lat: 39.9365, lon: -75.1672 },
                  ]}
                />
              </div>
            </div>

            {/* Tour Day Timing & Buffer Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Tour Date *</label>
                <input
                  type="date"
                  value={tourForm.tourDate}
                  onChange={(e) => setTourForm({ ...tourForm, tourDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Day Start Time *</label>
                <select
                  value={tourForm.dayStartTime}
                  onChange={(e) => setTourForm({ ...tourForm, dayStartTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Tour Length per Venue</label>
                <select
                  value={tourForm.durationPerTourMinutes}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, durationPerTourMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value={45}>45 mins (Quick Walkthrough)</option>
                  <option value={60}>60 mins (Standard Tour + Q&A)</option>
                  <option value={75}>75 mins (Deep Dive & Catering)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Drive Buffer / Padding</label>
                <select
                  value={tourForm.bufferBetweenToursMinutes}
                  onChange={(e) =>
                    setTourForm({ ...tourForm, bufferBetweenToursMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value={10}>10 mins buffer</option>
                  <option value={15}>15 mins buffer</option>
                  <option value={20}>20 mins buffer (Recommended)</option>
                </select>
              </div>
            </div>

            {/* Real-world Venue Touring Hours Guidance Alert */}
            {(() => {
              const d = new Date(`${tourForm.tourDate}T12:00:00`);
              const dayIndex = isNaN(d.getTime()) ? 6 : d.getDay();
              const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
              const isSat = dayIndex === 6;
              const isSun = dayIndex === 0;

              return (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                      <Clock className="w-4 h-4 text-amber-700" />
                      <span>Operating Tour Windows for {dayName}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {isSat ? 'Morning Walkthroughs Only (9:30 AM – 1:30 PM)' : isSun ? 'Morning & Midday Tours (10:00 AM – 2:30 PM)' : 'Full Day Appointments (10:00 AM – 6:00 PM)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    {isSat ? (
                      <>
                        <strong>Saturday Peak Wedding Policy:</strong> Tri-State luxury wedding estates (e.g., The Legacy Castle, The Palace at Somerset, Florentine Gardens, Rockleigh) only conduct tours between <strong>9:30 AM and 1:30 PM</strong>. By 2:00 PM, ballrooms strictly lock down for evening Mandap decor, Baraat arrivals, and wedding guests. The route optimizer automatically arranges your stops to fit available hours. We recommend selecting <strong>maximum 2 to 3 venues</strong>.
                      </>
                    ) : isSun ? (
                      <>
                        <strong>Sunday Walkthrough Window:</strong> Venues typically open tour appointments between <strong>10:00 AM and 2:30 PM</strong>. Afternoon slots may be restricted if daytime wedding receptions or Sangeet events are in progress.
                      </>
                    ) : (
                      <>
                        <strong>Weekday Flexibility ({dayName}):</strong> Weekday appointments (typically <strong>10:00 AM – 6:00 PM</strong>, Tue–Fri) offer the best opportunity to see completely empty ballrooms without wedding noise. Note: Many independent catering halls are closed on Mondays.
                      </>
                    )}
                  </p>
                </div>
              );
            })()}

            {/* Venues Selection Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="font-bold text-stone-800 text-xs block">
                Select Venues to Visit on Tour Day ({tourForm.selectedVenueIds.length} selected):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {venues.map((v) => {
                  const isChecked = tourForm.selectedVenueIds.includes(v.id);
                  const touring = getDefaultTouringHours(v);
                  return (
                    <label
                      key={v.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-rose-600 bg-rose-50/40 text-stone-900 shadow-2xs'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleVenueSelectionForTour(v.id)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div className="truncate flex-1">
                        <span className="font-bold text-xs truncate block">{v.name}</span>
                        <span className="text-[10px] text-stone-500 truncate block">
                          {v.city}, {v.state} • {formatCurr(v.pricing.estimatedTotalCost)}
                        </span>
                        <span className="text-[9px] text-amber-800 font-semibold truncate block mt-0.5">
                          Sat: {touring.saturdayHours.split('(')[0].trim()}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Lunch break toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs">
              <div className="flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-amber-950 block">
                    Schedule Family Lunch & Chai Debrief Break (~12:30 PM - 1:30 PM)
                  </span>
                  <span className="text-[11px] text-stone-600">
                    Inserts a 60-minute window for both families to discuss morning venue pros & cons away from venue sales staff.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={tourForm.includesLunchBreak}
                onChange={(e) => setTourForm({ ...tourForm, includesLunchBreak: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 ml-4 shrink-0"
              />
            </div>

            {/* Action to Calculate Optimal Route */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGenerateOptimalTourPlan}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 hover:from-rose-800 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-rose-900/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Calculate Optimal Route & Schedule</span>
              </button>
            </div>
          </div>

          {/* Optimized Output Schedule & Navigation Link */}
          {tourPlan && tourPlan.optimizedStops.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 animate-in fade-in duration-300">
              {/* Header and Quick Sharing Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Optimal Sequential Route Ready</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                    Tour Day Itinerary: {tourPlan.tourDate}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Starting from {tourPlan.startLocation.label} ({tourPlan.startLocation.city}) • Total driving: ~{tourPlan.totalEstDrivingMinutes} mins across {tourPlan.totalEstDistanceMiles} miles
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={tourPlan.googleMapsMultiStopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-md shadow-blue-900/20 transition-all flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4 text-blue-200" />
                    <span>Open in Google Maps GPS</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    {copiedWhatsApp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWhatsApp ? 'Copied to Clipboard!' : 'Share to WhatsApp'}</span>
                  </button>
                </div>
              </div>

              {/* Timing Warnings Advisory Banner */}
              {tourPlan.hasTimingWarnings && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-amber-900">
                      Site Tour Operating Hours Advisory ({tourPlan.timingWarningsCount} {tourPlan.timingWarningsCount === 1 ? 'stop' : 'stops'} flagged)
                    </h5>
                    <p className="text-amber-800 leading-relaxed text-xs">
                      One or more scheduled walkthroughs extend close to or past the venue’s standard weekend touring window. Remember that luxury wedding venues (like Legacy Castle, Florentine Gardens, Rockleigh, and Palace at Somerset) typically shut down ballroom tours by 1:30 PM – 2:00 PM on Saturdays for evening Baraats, decorator load-in, and Mandap ceremonies. Please call the sales director in advance to confirm your appointment window.
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive All-in-One Route & Stop Map */}
              <TourDayRouteMap
                groomAddress={tourForm.groomAddress}
                brideAddress={tourForm.brideAddress}
                primarySide={tourForm.primarySide}
                meetingMode={tourPlan.meetingMode || tourForm.meetingMode}
                dualFamilyStartPlan={tourPlan.dualFamilyStartPlan}
                tourDate={tourPlan.tourDate}
                stops={tourPlan.optimizedStops}
                lunchBreakWindow={tourPlan.lunchBreakWindow}
                totalDistanceMiles={tourPlan.totalEstDistanceMiles}
                totalDrivingMinutes={tourPlan.totalEstDrivingMinutes}
                googleMapsMultiStopUrl={tourPlan.googleMapsMultiStopUrl}
                allShortlistedVenues={venues}
              />

              {/* Dual-Family Starting & Departure Coordination Card */}
              {tourPlan.dualFamilyStartPlan ? (
                <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-5 sm:p-6 border border-stone-800 shadow-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-base border border-amber-500/30">
                        {tourPlan.meetingMode === 'meet_at_first_venue' ? '🤝' : tourPlan.meetingMode === 'carpool_pickup' ? '🚙' : '🏠'}
                      </span>
                      <div>
                        <h4 className="font-bold text-base text-amber-100 font-serif">
                          {tourPlan.meetingMode === 'meet_at_first_venue'
                            ? 'Dual-Family Simultaneous Departure Coordination'
                            : tourPlan.meetingMode === 'carpool_pickup'
                            ? 'Carpool Caravan with Morning Chai'
                            : 'Single Family Starting Point'}
                        </h4>
                        <p className="text-xs text-stone-400">
                          {tourPlan.dualFamilyStartPlan.fairnessSummary}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30 self-start sm:self-auto flex items-center gap-1.5">
                      <span>📍 Rendezvous at Stop #1:</span>
                      <span className="underline decoration-amber-400 font-mono text-sm">{tourPlan.dualFamilyStartPlan.rendezvousArrivalTime}</span>
                    </div>
                  </div>

                  {tourPlan.meetingMode === 'meet_at_first_venue' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Groom side departure card */}
                      <div className="p-4 rounded-2xl bg-stone-800/60 border border-blue-900/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span>🤵 Groom's Family Departure</span>
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-blue-950 text-blue-200 border border-blue-800/60">
                            ~{tourPlan.dualFamilyStartPlan.groomDeparture.drivingMinutesToFirstStop} min drive
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold font-mono text-white">
                            {tourPlan.dualFamilyStartPlan.groomDeparture.recommendedDepartureTime}
                          </span>
                          <span className="text-xs text-stone-400">
                            from {tourPlan.dualFamilyStartPlan.groomDeparture.homeCity}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          📍 {tourPlan.dualFamilyStartPlan.groomDeparture.homeAddress} ({tourPlan.dualFamilyStartPlan.groomDeparture.distanceMilesToFirstStop} mi to {tourPlan.dualFamilyStartPlan.firstMeetingPointName})
                        </div>
                      </div>

                      {/* Bride side departure card */}
                      <div className="p-4 rounded-2xl bg-stone-800/60 border border-rose-900/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span>👰 Bride's Family Departure</span>
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-rose-950 text-rose-200 border border-rose-800/60">
                            ~{tourPlan.dualFamilyStartPlan.brideDeparture.drivingMinutesToFirstStop} min drive
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold font-mono text-white">
                            {tourPlan.dualFamilyStartPlan.brideDeparture.recommendedDepartureTime}
                          </span>
                          <span className="text-xs text-stone-400">
                            from {tourPlan.dualFamilyStartPlan.brideDeparture.homeCity}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          📍 {tourPlan.dualFamilyStartPlan.brideDeparture.homeAddress} ({tourPlan.dualFamilyStartPlan.brideDeparture.distanceMilesToFirstStop} mi to {tourPlan.dualFamilyStartPlan.firstMeetingPointName})
                        </div>
                      </div>
                    </div>
                  )}

                  {tourPlan.meetingMode === 'carpool_pickup' && tourPlan.dualFamilyStartPlan.pickupOrder && (
                    <div className="p-4 rounded-2xl bg-stone-800/60 border border-amber-900/40 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">☕</span>
                          <div>
                            <div className="font-bold text-xs text-amber-200">
                              Morning Chai &amp; Carpool Stop in {tourPlan.dualFamilyStartPlan.pickupOrder.pickupCity}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {tourPlan.dualFamilyStartPlan.pickupOrder.driverSide === 'groom' ? "Groom's family" : "Bride's family"} arrives at {tourPlan.dualFamilyStartPlan.pickupOrder.pickupTime} ({tourPlan.dualFamilyStartPlan.pickupOrder.chaiBufferMinutes}-min chai buffer)
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <span className="font-bold text-stone-300">Caravan departs together: </span>
                          <span className="font-mono text-amber-300 font-bold">
                            {tourPlan.dualFamilyStartPlan.groomDeparture.side === tourPlan.dualFamilyStartPlan.pickupOrder.passengerSide
                              ? tourPlan.dualFamilyStartPlan.groomDeparture.recommendedDepartureTime
                              : tourPlan.dualFamilyStartPlan.brideDeparture.recommendedDepartureTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold shrink-0">
                    🏁
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Departing Point ({tourPlan.dayStartTime})
                    </span>
                    <strong className="text-stone-900 text-sm block">
                      {tourPlan.startLocation.label}
                    </strong>
                    <span className="text-stone-500">
                      {tourPlan.startLocation.address}, {tourPlan.startLocation.city},{' '}
                      {tourPlan.startLocation.state}
                    </span>
                  </div>
                </div>
              )}

              {/* Sequential Stops Timeline */}
              <div className="space-y-4">

                {/* Stops in optimal order */}
                {tourPlan.optimizedStops.map((stop, index) => {
                  const venue = venues.find((v) => v.id === stop.venueId);

                  return (
                    <React.Fragment key={stop.venueId}>
                      <div className="relative pl-11 sm:pl-14">
                        {/* Connecting Line */}
                        <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-stone-200" />

                        {/* Stop Number Circle */}
                        <div className="absolute left-1.5 sm:left-2.5 top-5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-700 text-white font-bold text-xs flex items-center justify-center shadow-md">
                          {stop.stopOrder}
                        </div>

                        {/* Stop Card */}
                        <div className="bg-white p-5 rounded-2xl border border-stone-200 hover:border-amber-400 shadow-2xs space-y-3 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                                  Appointment #{stop.stopOrder}
                                </span>
                                <span className="text-xs font-bold text-amber-800">
                                  ⏰ {stop.suggestedTourWindow}
                                </span>
                                {stop.touringStatus && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      stop.touringStatus.isWithinHours
                                        ? stop.touringStatus.status === 'closing_soon'
                                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                                          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-rose-100 text-rose-900 border-rose-300'
                                    }`}
                                  >
                                    <span>
                                      {stop.touringStatus.isWithinHours
                                        ? stop.touringStatus.status === 'closing_soon'
                                          ? '⚠️'
                                          : '✓'
                                        : '⚠️'}
                                    </span>
                                    <span>{stop.touringStatus.badgeLabel}</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-lg text-stone-900 font-serif mt-1">
                                {stop.venueName}
                              </h4>
                              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>
                                  {stop.address}, {stop.city}
                                </span>
                              </p>
                            </div>

                            {/* Contact info */}
                            {venue && (
                              <div className="text-right text-xs shrink-0 text-stone-600">
                                {venue.contactPerson && (
                                  <div className="font-semibold text-stone-900">
                                    {venue.contactPerson}
                                  </div>
                                )}
                                {venue.contactPhone && (
                                  <a
                                    href={`tel:${venue.contactPhone}`}
                                    className="text-stone-500 hover:text-stone-900 flex items-center gap-1 justify-end mt-0.5"
                                  >
                                    <Phone className="w-3 h-3" />
                                    <span>{venue.contactPhone}</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Warning Alert if tour is outside venue's standard hours */}
                          {stop.touringStatus && !stop.touringStatus.isWithinHours && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <strong className="font-bold text-xs">Site Tour Operating Hours Warning:</strong>
                                <p className="text-[11px] text-rose-800 leading-relaxed">
                                  {stop.touringStatus.warningMessage}
                                </p>
                                {stop.touringStatus.recommendedTimeWindow && (
                                  <span className="text-[10px] text-stone-600 block mt-0.5">
                                    Recommended Window: <strong>{stop.touringStatus.recommendedTimeWindow}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Official Venue Touring Hours Summary */}
                          {stop.touringHours && (
                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-medium text-stone-700">
                                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                <span>
                                  <strong>Touring Windows:</strong> Sat: {stop.touringHours.saturdayHours} • Sun: {stop.touringHours.sundayHours} • Weekdays: {stop.touringHours.weekdayHours}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-stone-200/70 shrink-0">
                                {stop.touringHours.appointmentRequirement === 'appointment_only' ? 'Appointment Required' : 'Advance Booking'}
                              </span>
                            </div>
                          )}

                          {/* Specific Questions to Ask on Site */}
                          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1.5 text-xs">
                            <span className="font-bold text-amber-950 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                              <span>Key Questions to Ask on Site:</span>
                            </span>
                            <ul className="space-y-1 text-stone-700 text-[11px] list-disc list-inside">
                              {stop.notesOrQuestionsToAsk.slice(0, 3).map((q, qi) => (
                                <li key={qi}>{q}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Driving time to next stop */}
                          {stop.drivingTimeToNextMinutes && stop.nextStopName && (
                            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                              <span className="flex items-center gap-1 text-blue-700 font-medium">
                                <Car className="w-3.5 h-3.5" />
                                <span>
                                  Drive to next stop: ~{stop.drivingTimeToNextMinutes} mins (
                                  {stop.distanceToNextMiles} miles)
                                </span>
                              </span>
                              <span className="text-[11px] text-stone-400">
                                Next: {stop.nextStopName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lunch Break Slot between stops if scheduled */}
                      {tourPlan.lunchBreakWindow &&
                        index === 0 &&
                        tourPlan.optimizedStops.length > 1 && (
                          <div className="relative pl-11 sm:pl-14">
                            <div className="absolute left-4 sm:left-5 top-0 bottom-0 w-0.5 bg-stone-200" />
                            <div className="absolute left-2.5 sm:left-3.5 top-4 w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                              ☕
                            </div>
                            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-950 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                                <div>
                                  <strong className="block font-bold">
                                    Family Lunch & Chai Debrief Break (
                                    {tourPlan.lunchBreakWindow.startTime})
                                  </strong>
                                  <span className="text-[11px] text-stone-600">
                                    {tourPlan.lunchBreakWindow.note}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-1 rounded-md bg-amber-200/80 text-amber-900 font-bold text-[10px]">
                                60 mins
                              </span>
                            </div>
                          </div>
                        )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* ADD / EDIT CUSTOM VENUE MODAL                                 */}
      {/* ============================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVenue ? 'Edit Venue Details' : 'Add Custom Venue to Compare'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitVenue} className="space-y-4 text-xs">
          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
              1. Venue Location & Type
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. The Legacy Castle or Hyatt Regency"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Venue Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as VenueOption['type'] })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value="hotel_ballroom">Hotel Ballroom (with guest rooms)</option>
                  <option value="historic_estate">Historic Estate / Castle</option>
                  <option value="banquet_hall">Banquet Hall / Event Center</option>
                  <option value="resort">Destination Resort</option>
                  <option value="golf_club">Country / Golf Club</option>
                  <option value="convention_center">Convention Center</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Tour / Decision Status</label>
                <select
                  value={formData.tourStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, tourStatus: e.target.value as VenueStatus })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value="researching">Researching</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="tour_scheduled">Tour Scheduled</option>
                  <option value="toured">Toured</option>
                  <option value="selected">Selected Official Venue</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <AddressAutocompleteInput
                  value={{
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  }}
                  onChange={(updated) =>
                    setFormData({
                      ...formData,
                      address: updated.address,
                      city: updated.city,
                      state: updated.state,
                      zipCode: updated.zipCode || '',
                      latitude: updated.latitude,
                      longitude: updated.longitude,
                    })
                  }
                  label="Venue Street Address *"
                  placeholder="Start typing venue address or name (e.g. 141 Route 23 or Pompton Plains)..."
                  accentColor="amber"
                  quickSuggestions={[
                    { label: 'Pompton Plains (Legacy)', address: '141 Route 23 South', city: 'Pompton Plains', state: 'NJ', zipCode: '07444', lat: 40.9701, lon: -74.2982 },
                    { label: 'Somerset (Palace)', address: '333 Davidson Avenue', city: 'Somerset', state: 'NJ', zipCode: '08873', lat: 40.5284, lon: -74.5218 },
                    { label: 'River Vale (Florentine)', address: '97 Rivervale Road', city: 'River Vale', state: 'NJ', zipCode: '07675', lat: 41.0116, lon: -74.0093 },
                    { label: 'Livingston (Crystal Plaza)', address: '305 W Northfield Road', city: 'Livingston', state: 'NJ', zipCode: '07039', lat: 40.7891, lon: -74.3418 },
                    { label: 'Morristown (Westin)', address: '2 Whippany Road', city: 'Morristown', state: 'NJ', zipCode: '07960', lat: 40.8035, lon: -74.4532 },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Closest / Preferred Hotel Accommodations */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1 flex items-center gap-2">
              <Hotel className="w-4 h-4 text-blue-600" />
              <span>2. Closest / Preferred Hotel & Room Block Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">
                  Nearest / Preferred Hotel Name
                </label>
                <input
                  type="text"
                  value={formData.nearestHotelName}
                  onChange={(e) => setFormData({ ...formData, nearestHotelName: e.target.value })}
                  placeholder="e.g. DoubleTree by Hilton Somerset or Marriott"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Distance (Miles)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.nearestHotelDistance}
                  onChange={(e) =>
                    setFormData({ ...formData, nearestHotelDistance: Number(e.target.value) })
                  }
                  placeholder="0 if on-site"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">
                  Room Block Discount & Shuttle Note
                </label>
                <input
                  type="text"
                  value={formData.nearestHotelNotes}
                  onChange={(e) => setFormData({ ...formData, nearestHotelNotes: e.target.value })}
                  placeholder="e.g. $159/night guaranteed block with complimentary wedding shuttle"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="hotelShuttle"
                  checked={formData.nearestHotelShuttle}
                  onChange={(e) =>
                    setFormData({ ...formData, nearestHotelShuttle: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="hotelShuttle" className="font-semibold text-stone-800 cursor-pointer">
                  Shuttle Service Provided
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Desi Capabilities */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
              3. Desi Wedding Capabilities & Policies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50">
                <input
                  type="checkbox"
                  id="outsideCatering"
                  checked={formData.allowsOutsideIndianCatering}
                  onChange={(e) =>
                    setFormData({ ...formData, allowsOutsideIndianCatering: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="outsideCatering" className="font-semibold text-stone-800 cursor-pointer">
                  Allows Outside Indian Catering
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50">
                <input
                  type="checkbox"
                  id="openFlame"
                  checked={formData.allowsOpenFlameHavan}
                  onChange={(e) =>
                    setFormData({ ...formData, allowsOpenFlameHavan: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="openFlame" className="font-semibold text-stone-800 cursor-pointer">
                  Permits Sacred Agni Havan for Pheras
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50">
                <input
                  type="checkbox"
                  id="allowsBaraat"
                  checked={formData.allowsBaraatProcession}
                  onChange={(e) =>
                    setFormData({ ...formData, allowsBaraatProcession: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="allowsBaraat" className="font-semibold text-stone-800 cursor-pointer">
                  Allows Baraat (Horse/Car & Dhol)
                </label>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50">
                <input
                  type="checkbox"
                  id="hotelRooms"
                  checked={formData.hotelRoomsOnSite}
                  onChange={(e) =>
                    setFormData({ ...formData, hotelRoomsOnSite: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="hotelRooms" className="font-semibold text-stone-800 cursor-pointer">
                  Hotel Guest Rooms on Site
                </label>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Evening Sound Curfew</label>
                <select
                  value={formData.soundCurfewTime}
                  onChange={(e) => setFormData({ ...formData, soundCurfewTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value="11:00 PM">11:00 PM (Strict)</option>
                  <option value="11:30 PM">11:30 PM</option>
                  <option value="12:00 AM">12:00 AM (Midnight)</option>
                  <option value="01:00 AM">01:00 AM (Late dancing)</option>
                  <option value="02:00 AM">02:00 AM (Afterparty permitted)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Max Ceremony / Reception Capacity</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={formData.maxCeremonyCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxCeremonyCapacity: Number(e.target.value) })
                    }
                    placeholder="Ceremony"
                    className="px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  />
                  <input
                    type="number"
                    value={formData.maxReceptionCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxReceptionCapacity: Number(e.target.value) })
                    }
                    placeholder="Reception"
                    className="px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Pricing */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
              4. Pricing & Financial Estimates ($ USD)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Hall Rental Fee ($)</label>
                <input
                  type="number"
                  value={formData.rentalFee}
                  onChange={(e) => setFormData({ ...formData, rentalFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">F&B Minimum ($)</label>
                <input
                  type="number"
                  value={formData.foodAndBeverageMinimum}
                  onChange={(e) =>
                    setFormData({ ...formData, foodAndBeverageMinimum: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Outside Catering Buyout/Guest ($)
                </label>
                <input
                  type="number"
                  value={formData.cateringBuyoutFeePerGuest}
                  onChange={(e) =>
                    setFormData({ ...formData, cateringBuyoutFeePerGuest: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-stone-700 block">
                    Estimated All-In Package Total ($)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const calculated = calculateVenueEstimateForGuests(
                        {
                          ...formData,
                          id: 'temp',
                          weddingId: 'temp',
                          pricing: {
                            rentalFee: formData.rentalFee,
                            foodAndBeverageMinimum: formData.foodAndBeverageMinimum,
                            cateringBuyoutFeePerGuest: formData.cateringBuyoutFeePerGuest,
                            serviceChargePercent: formData.serviceChargePercent,
                            taxPercent: formData.taxPercent,
                            estimatedTotalCost: 0,
                          },
                          desiFeatures: {
                            ...formData,
                            maxReceptionCapacity: formData.maxReceptionCapacity,
                          } as any,
                          availableDates: [],
                          tourStatus: 'shortlisted',
                        } as any,
                        planningGuestCount,
                        eventFormat
                      );
                      setFormData({ ...formData, estimatedTotalCost: calculated.estimatedTotalCost });
                    }}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Auto-calculate for {planningGuestCount} guests</span>
                  </button>
                </div>
                <input
                  type="number"
                  value={formData.estimatedTotalCost}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedTotalCost: Number(e.target.value) })
                  }
                  placeholder="e.g. 85000"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-bold text-base sm:text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Pros, Cons, Dates and Notes */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
              5. Pros, Cons & Open Auspicious Dates
            </h4>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Pros (separate with semicolon ';')
                </label>
                <input
                  type="text"
                  value={formData.prosString}
                  onChange={(e) => setFormData({ ...formData, prosString: e.target.value })}
                  placeholder="e.g. Gorgeous ballroom ceiling; Manhattan skyline views; Free guest parking"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Cons (separate with semicolon ';')
                </label>
                <input
                  type="text"
                  value={formData.consString}
                  onChange={(e) => setFormData({ ...formData, consString: e.target.value })}
                  placeholder="e.g. Strict midnight curfew; No on-site hotel rooms"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Available Dates (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.availableDatesString}
                  onChange={(e) => setFormData({ ...formData, availableDatesString: e.target.value })}
                  placeholder="e.g. 2026-10-24 (Sat), 2026-11-07 (Sat)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contact notes, coordinator names, or negotiation thoughts..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 text-white font-bold text-xs shadow-md"
            >
              {editingVenue ? 'Save Changes' : 'Add Venue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
