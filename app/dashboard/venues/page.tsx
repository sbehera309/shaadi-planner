'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWedding } from '@/lib/store';
import {
  VenueOption,
  VenueStatus,
  FamilyAddressInput,
  SiteTourDayPlan,
} from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  generateSiteTourSchedule,
  formatTourPlanForWhatsApp,
  getQuestionsForVenue,
} from '@/lib/venueRouteOptimizer';
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
  Share2,
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
} from 'lucide-react';

export default function VenuesPage() {
  const {
    wedding,
    venues,
    tourPlan,
    addVenue,
    updateVenue,
    deleteVenue,
    setOfficialVenue,
    saveTourPlan,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'venues' | 'tour-planner'>('venues');
  const [statusFilter, setStatusFilter] = useState<'all' | VenueStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueOption | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Form State for Add / Edit Venue
  const [formData, setFormData] = useState({
    name: '',
    type: 'hotel_ballroom' as VenueOption['type'],
    address: '',
    city: '',
    state: 'NJ',
    zipCode: '',
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
    baraatRouteType: 'outdoor_driveway' as 'outdoor_driveway' | 'parking_lot' | 'indoor_hallway' | 'prohibited',
    soundCurfewTime: '12:00 AM',
    maxCeremonyCapacity: 450,
    maxReceptionCapacity: 600,
    hasBridalSuite: true,
    hasGroomSuite: true,
    hotelRoomsOnSite: true,
    hotelRoomBlockDiscount: '',
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

    // Calculate total if not provided
    const baseCost = formData.rentalFee + formData.foodAndBeverageMinimum;
    const estimatedTotalCost =
      formData.estimatedTotalCost > 0
        ? formData.estimatedTotalCost
        : Math.round(baseCost * (1 + formData.serviceChargePercent / 100) * (1 + formData.taxPercent / 100));

    const payload: Omit<VenueOption, 'id' | 'weddingId'> = {
      name: formData.name,
      type: formData.type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
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

  const filteredVenues =
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
            <span>Phase 1 • Venue Scouting & Multi-Site Tour Day</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-amber-100">
            Wedding & Reception Venue Scouting
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
            Compare prospective venues across critical Desi wedding requirements (outside Indian catering permissions, havan open flame havan permits, grand Baraat driveway access, and midnight sound curfews).
            Plan a seamless 1-day multi-venue site tour with family, complete with turnkey Google Maps GPS route navigation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Venue to Compare</span>
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
              <Car className="w-4 h-4 text-amber-300" />
              <span>⚡ Optimize Site Tour Day Route</span>
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
            Shortlisted Venues
          </span>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-stone-900">
            {venues.length} <span className="text-xs font-medium text-stone-400">locations</span>
          </div>
          <div className="mt-1 text-[11px] text-amber-800 font-medium">
            {shortlistedCount} ready for site visits
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Tours on Schedule
          </span>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-stone-900">
            {tourPlan ? tourPlan.optimizedStops.length : tourScheduledCount}{' '}
            <span className="text-xs font-medium text-stone-400">stops</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-800 font-medium">
            {tourPlan?.tourDate ? `Set for ${tourPlan.tourDate}` : 'Select date to tour'}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Est Tour Day Drive Time
          </span>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-stone-900">
            {tourPlan ? `~${tourPlan.totalEstDrivingMinutes}m` : '--'}{' '}
            <span className="text-xs font-medium text-stone-400">
              {tourPlan ? `(${tourPlan.totalEstDistanceMiles} mi)` : ''}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-800 font-medium">
            {tourPlan ? 'Optimized sequential route' : 'Add stops to calculate'}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
            Official Selected Venue
          </span>
          <div className="mt-1.5 text-base sm:text-lg font-extrabold text-stone-900 truncate">
            {officialVenue ? officialVenue.name : wedding?.venueName || 'Not finalized'}
          </div>
          <div className="mt-1 text-[11px] text-stone-500 truncate">
            {officialVenue ? `${officialVenue.city}, ${officialVenue.state}` : 'Comparing quotes'}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-stone-200 text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('venues')}
          className={`py-3 px-4 sm:px-6 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'venues'
              ? 'border-rose-700 text-rose-800 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Compare Venues & Quotes ({venues.length})</span>
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: VENUE COMPARISON MATRIX & DIRECTORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'venues' && (
        <div className="space-y-6">
          {/* Filter Pills Bar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
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
                      {status === 'all' ? 'All Venues' : status.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="text-stone-500 text-[11px]">
              Showing {filteredVenues.length} of {venues.length} venues
            </div>
          </div>

          {/* Venues Grid */}
          {filteredVenues.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-dashed border-stone-300 text-center space-y-3">
              <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">No venues matching this filter</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Add prospective hotels, historic estates, and banquet halls you are considering for your Mandap ceremony and reception.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs"
              >
                + Add First Venue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {filteredVenues.map((venue) => {
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

                      {/* Pricing Snapshot */}
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                            Estimated All-In Package Cost
                          </span>
                          <strong className="text-stone-900 text-lg font-extrabold">
                            {formatCurr(venue.pricing.estimatedTotalCost)}
                          </strong>
                        </div>
                        <div className="text-right text-[11px] text-stone-600">
                          <div>Rental: {formatCurr(venue.pricing.rentalFee)}</div>
                          <div>F&B Min: {formatCurr(venue.pricing.foodAndBeverageMinimum)}</div>
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      {(venue.pros?.length > 0 || venue.cons?.length > 0) && (
                        <div className="space-y-1.5 text-xs">
                          {venue.pros?.map((pro, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-stone-700">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span className="text-[11px]">{pro}</span>
                            </div>
                          ))}
                          {venue.cons?.map((con, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-rose-700">
                              <span className="text-rose-500 font-bold">✗</span>
                              <span className="text-[11px]">{con}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Available Dates */}
                      {venue.availableDates?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-stone-500">Open Dates:</span>
                          {venue.availableDates.map((dateStr, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-medium"
                            >
                              {dateStr}
                            </span>
                          ))}
                        </div>
                      )}
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

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DAY-OF SITE TOUR ROUTE & SCHEDULE OPTIMIZER */}
      {/* ------------------------------------------------------------- */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Family Address 1: Groom's Side */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Family Address 1 (Groom's Side)</span>
                  </span>
                  <label className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="primarySide"
                      checked={tourForm.primarySide === 'groom'}
                      onChange={() => setTourForm({ ...tourForm, primarySide: 'groom' })}
                    />
                    <span>Start Day Here</span>
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={tourForm.groomAddress.address}
                    onChange={(e) =>
                      setTourForm({
                        ...tourForm,
                        groomAddress: { ...tourForm.groomAddress, address: e.target.value },
                      })
                    }
                    placeholder="Street Address (e.g. 254 Montgomery St)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={tourForm.groomAddress.city}
                      onChange={(e) =>
                        setTourForm({
                          ...tourForm,
                          groomAddress: { ...tourForm.groomAddress, city: e.target.value },
                        })
                      }
                      placeholder="City"
                      className="col-span-2 px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                    />
                    <input
                      type="text"
                      value={tourForm.groomAddress.state}
                      onChange={(e) =>
                        setTourForm({
                          ...tourForm,
                          groomAddress: { ...tourForm.groomAddress, state: e.target.value },
                        })
                      }
                      placeholder="State (NJ)"
                      className="px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Family Address 2: Bride's Side */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/70 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Family Address 2 (Bride's Side)</span>
                  </span>
                  <label className="text-[11px] font-semibold text-stone-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="primarySide"
                      checked={tourForm.primarySide === 'bride'}
                      onChange={() => setTourForm({ ...tourForm, primarySide: 'bride' })}
                    />
                    <span>Start Day Here</span>
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={tourForm.brideAddress.address}
                    onChange={(e) =>
                      setTourForm({
                        ...tourForm,
                        brideAddress: { ...tourForm.brideAddress, address: e.target.value },
                      })
                    }
                    placeholder="Street Address (e.g. 88 Oak Tree Rd)"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={tourForm.brideAddress.city}
                      onChange={(e) =>
                        setTourForm({
                          ...tourForm,
                          brideAddress: { ...tourForm.brideAddress, city: e.target.value },
                        })
                      }
                      placeholder="City"
                      className="col-span-2 px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                    />
                    <input
                      type="text"
                      value={tourForm.brideAddress.state}
                      onChange={(e) =>
                        setTourForm({
                          ...tourForm,
                          brideAddress: { ...tourForm.brideAddress, state: e.target.value },
                        })
                      }
                      placeholder="State (NJ)"
                      className="px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                    />
                  </div>
                </div>
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

            {/* Venues Selection Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="font-bold text-stone-800 text-xs block">
                Select Venues to Visit on Tour Day ({tourForm.selectedVenueIds.length} selected):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {venues.map((v) => {
                  const isChecked = tourForm.selectedVenueIds.includes(v.id);
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
                      <div className="truncate">
                        <span className="font-bold text-xs truncate block">{v.name}</span>
                        <span className="text-[10px] text-stone-500 truncate block">
                          {v.city}, {v.state} • {formatCurr(v.pricing.estimatedTotalCost)}
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

              {/* Sequential Stops Timeline */}
              <div className="space-y-4">
                {/* Starting Origin */}
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

                {/* Stops in optimal order */}
                {tourPlan.optimizedStops.map((stop, index) => {
                  const venue = venues.find((v) => v.id === stop.venueId);
                  const isLast = index === tourPlan.optimizedStops.length - 1;

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
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                                  Appointment #{stop.stopOrder}
                                </span>
                                <span className="text-xs font-bold text-amber-800">
                                  ⏰ {stop.suggestedTourWindow}
                                </span>
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

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT VENUE MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVenue ? 'Edit Venue Details' : 'Add Prospective Wedding & Reception Venue'}
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
                <label className="font-semibold text-stone-700 block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 141 Route 23 South"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Pompton Plains or Jersey City"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. NJ"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Zip Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="07444"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Desi Capabilities */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
              2. Desi Wedding Capabilities & Policies
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

          {/* Section 3: Pricing & Package Quote */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
              3. Pricing & Financial Estimates ($ USD)
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
                <label className="font-semibold text-stone-700 block mb-1">
                  Estimated All-In Package Total ($)
                </label>
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

          {/* Section 4: Pros, Cons, and Dates */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-1">
              4. Pros, Cons & Open Auspicious Dates
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
