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
  ProfileSavedAddress,
  StartTimePlanningMode,
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
import ProfileAddressBookModal from '@/components/ProfileAddressBookModal';
import { AuthModal } from '@/components/AuthModal';
import { useProfileAddresses } from '@/lib/useProfileAddresses';
import { useUserVenueQuotes } from '@/lib/useUserVenueQuotes';
import { VenueCustomQuoteModal } from '@/components/VenueCustomQuoteModal';
import SangeetTriangulationSection from '@/components/SangeetTriangulationSection';
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
  Lock,
  Loader2,
  Bookmark,
  BookOpen,
  History,
  LogIn,
  BookmarkCheck,
  ChevronRight,
  Lightbulb,
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
    officialSangeetVenue,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'curated' | 'my-venues' | 'tour-planner' | 'sangeet'>('curated');
  const [statusFilter, setStatusFilter] = useState<'all' | VenueStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueOption | null>(null);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);

  // User Profile Saved Addresses Hook & Modals
  const {
    savedAddresses,
    loading: isProfileAddressesLoading,
    isLoggedIn,
    user,
    saveAddress,
    deleteAddress,
    updateAddressDetails,
    markAddressUsed,
    isAddressSaved,
  } = useProfileAddresses();

  const [isAddressBookModalOpen, setIsAddressBookModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User Venue Custom Negotiated Quotes Hook
  const {
    quotes: userVenueQuotes,
    getQuote: getUserVenueQuote,
    saveQuote: saveUserVenueQuote,
    deleteQuote: deleteUserVenueQuote,
    selectActiveDate: selectActiveVenueDate,
    getEffectivePricing,
  } = useUserVenueQuotes();

  const [quoteModalVenue, setQuoteModalVenue] = useState<VenueOption | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const handleOpenQuoteModal = (venue: VenueOption) => {
    setQuoteModalVenue(venue);
    setIsQuoteModalOpen(true);
  };

  // Verified Historical Pricing & Reddit Intel Inspection Modal
  const [inspectingPricingVenue, setInspectingPricingVenue] = useState<VenueOption | null>(null);

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
    startTimePlanningMode: (tourPlan?.startTimePlanningMode || 'venue_arrival') as StartTimePlanningMode,
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
      latitude: tourPlan?.startLocation.latitude,
      longitude: tourPlan?.startLocation.longitude,
    } as FamilyAddressInput,
    brideAddress: {
      side: 'bride' as const,
      label: "Bride's Family Home",
      address: tourPlan?.secondFamilyLocation?.address || '88 Oak Tree Road',
      city: tourPlan?.secondFamilyLocation?.city || 'Edison',
      state: tourPlan?.secondFamilyLocation?.state || 'NJ',
      zipCode: tourPlan?.secondFamilyLocation?.zipCode || '08820',
      latitude: tourPlan?.secondFamilyLocation?.latitude,
      longitude: tourPlan?.secondFamilyLocation?.longitude,
    } as FamilyAddressInput,
    meetingMode: (tourPlan?.meetingMode || 'meet_at_first_venue') as DualFamilyMeetingMode,
    selectedVenueIds: tourPlan?.selectedVenueIds || venues.slice(0, 3).map((v) => v.id),
    lockedAppointmentTimes: (tourPlan?.lockedAppointmentTimes || {}) as Record<string, string>,
    customVenueDurations: (tourPlan?.customVenueDurations || {}) as Record<string, number>,
  });

  const handleSetVenueDuration = (venueId: string, durationMinutes: number) => {
    const updatedDurations = {
      ...tourForm.customVenueDurations,
      [venueId]: durationMinutes,
    };
    const updated = {
      ...tourForm,
      customVenueDurations: updatedDurations,
    };
    setTourForm(updated);
    if (tourPlan && tourPlan.optimizedStops.length > 0) {
      recalculateTourPlan(updated);
    }
  };

  const handleResetVenueDuration = (venueId: string) => {
    const copy = { ...tourForm.customVenueDurations };
    delete copy[venueId];
    const updated = {
      ...tourForm,
      customVenueDurations: copy,
    };
    setTourForm(updated);
    if (tourPlan && tourPlan.optimizedStops.length > 0) {
      recalculateTourPlan(updated);
    }
  };

  const handleSetLockedTime = (venueId: string, time: string) => {
    const updated = {
      ...tourForm,
      lockedAppointmentTimes: {
        ...tourForm.lockedAppointmentTimes,
        [venueId]: time,
      },
    };
    setTourForm(updated);
    if (tourPlan && tourPlan.optimizedStops.length > 0) {
      recalculateTourPlan(updated);
    }
  };

  const handleClearLockedTime = (venueId: string) => {
    const copy = { ...tourForm.lockedAppointmentTimes };
    delete copy[venueId];
    const updated = {
      ...tourForm,
      lockedAppointmentTimes: copy,
    };
    setTourForm(updated);
    if (tourPlan && tourPlan.optimizedStops.length > 0) {
      recalculateTourPlan(updated);
    }
  };

  const handleClearAllLockedTimes = () => {
    const updated = {
      ...tourForm,
      lockedAppointmentTimes: {},
    };
    setTourForm(updated);
    if (tourPlan && tourPlan.optimizedStops.length > 0) {
      recalculateTourPlan(updated);
    }
  };

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
      historicalPricingIntelligence: curated.historicalPricingIntelligence,
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
      const updatedLocked = { ...prev.lockedAppointmentTimes };
      const updatedDurations = { ...prev.customVenueDurations };
      if (exists) {
        delete updatedLocked[venueId];
        delete updatedDurations[venueId];
      }
      return {
        ...prev,
        selectedVenueIds: updated,
        lockedAppointmentTimes: updatedLocked,
        customVenueDurations: updatedDurations,
      };
    });
  };

  const recalculateTourPlan = (formToUse = tourForm) => {
    const selectedVenues = venues.filter((v) => formToUse.selectedVenueIds.includes(v.id));
    if (selectedVenues.length === 0) return;

    const startLocation =
      formToUse.primarySide === 'groom' ? formToUse.groomAddress : formToUse.brideAddress;
    const secondFamilyLocation =
      formToUse.primarySide === 'groom' ? formToUse.brideAddress : formToUse.groomAddress;

    const newPlan = generateSiteTourSchedule({
      weddingId: wedding?.id || 'w-user-1',
      tourDate: formToUse.tourDate,
      startLocation,
      secondFamilyLocation,
      meetingMode: formToUse.meetingMode,
      venues: selectedVenues,
      dayStartTime: formToUse.dayStartTime,
      startTimePlanningMode: formToUse.startTimePlanningMode,
      durationPerTourMinutes: formToUse.durationPerTourMinutes,
      customVenueDurations: formToUse.customVenueDurations,
      bufferBetweenToursMinutes: formToUse.bufferBetweenToursMinutes,
      includesLunchBreak: formToUse.includesLunchBreak,
      lockedAppointmentTimes: formToUse.lockedAppointmentTimes,
    });

    saveTourPlan(newPlan);
  };

  // Auto-sanitize stale out-of-state coordinates from previous session (e.g. Florida when state is PA)
  useEffect(() => {
    if (!tourPlan) return;
    const brideState = tourForm.brideAddress.state?.toUpperCase();
    const brideCity = tourForm.brideAddress.city?.toLowerCase() || '';
    const isBrideMountainTop = brideCity.includes('mountain top') || brideCity.includes('mountaintop');
    const isBridePa = brideState === 'PA' || isBrideMountainTop;
    const brideLat = tourForm.brideAddress.latitude;

    const isStaleBrideCoords =
      isBridePa && brideLat !== undefined && (brideLat < 39.0 || brideLat > 43.0);
    const hasOutlierDistance =
      (tourPlan.dualFamilyStartPlan?.brideDeparture.distanceMilesToFirstStop || 0) > 300 && isBridePa;

    if (isStaleBrideCoords || hasOutlierDistance) {
      const fixedBride = {
        ...tourForm.brideAddress,
        city: isBrideMountainTop ? 'Mountain Top' : tourForm.brideAddress.city,
        state: 'PA',
        zipCode: isBrideMountainTop ? '18707' : tourForm.brideAddress.zipCode,
        latitude: isBrideMountainTop ? 41.1514 : 40.2732,
        longitude: isBrideMountainTop ? -75.9376 : -76.8867,
      };
      const updatedForm = { ...tourForm, brideAddress: fixedBride };
      setTourForm(updatedForm);
      recalculateTourPlan(updatedForm);
    }
  }, [tourPlan, tourForm.brideAddress.city, tourForm.brideAddress.state, tourForm.brideAddress.latitude]);

  const handleGenerateOptimalTourPlan = () => {
    const selectedVenues = venues.filter((v) => tourForm.selectedVenueIds.includes(v.id));
    if (selectedVenues.length === 0) {
      alert('Please select at least 1 or more venues to include in your site tour day.');
      return;
    }
    setIsCalculating(true);
    recalculateTourPlan(tourForm);
    setTimeout(() => {
      setIsCalculating(false);
      setJustCalculated(true);
      setTimeout(() => setJustCalculated(false), 3000);
    }, 250);
  };

  const handleCopyWhatsApp = () => {
    if (!tourPlan) return;
    const text = formatTourPlanForWhatsApp(tourPlan, venues);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  const handleSelectAddressForSide = (saved: ProfileSavedAddress, targetSide: 'groom' | 'bride' = (saved.side === 'bride' ? 'bride' : 'groom')) => {
    markAddressUsed(saved.id);
    if (targetSide === 'groom') {
      const updatedGroom: FamilyAddressInput = {
        side: 'groom',
        label: saved.label,
        address: saved.address,
        city: saved.city,
        state: saved.state,
        zipCode: saved.zipCode,
        latitude: saved.latitude,
        longitude: saved.longitude,
      };
      const updatedForm = { ...tourForm, groomAddress: updatedGroom };
      setTourForm(updatedForm);
      if (tourPlan && tourPlan.optimizedStops.length > 0) {
        recalculateTourPlan(updatedForm);
      }
    } else {
      const updatedBride: FamilyAddressInput = {
        side: 'bride',
        label: saved.label,
        address: saved.address,
        city: saved.city,
        state: saved.state,
        zipCode: saved.zipCode,
        latitude: saved.latitude,
        longitude: saved.longitude,
      };
      const updatedForm = { ...tourForm, brideAddress: updatedBride };
      setTourForm(updatedForm);
      if (tourPlan && tourPlan.optimizedStops.length > 0) {
        recalculateTourPlan(updatedForm);
      }
    }
  };

  const handleSaveGroomAddressToProfile = async (customLabel?: string) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    await saveAddress({
      label: customLabel || tourForm.groomAddress.label || "Groom's Family Home",
      side: 'groom',
      address: tourForm.groomAddress.address,
      city: tourForm.groomAddress.city,
      state: tourForm.groomAddress.state,
      zipCode: tourForm.groomAddress.zipCode,
      latitude: tourForm.groomAddress.latitude,
      longitude: tourForm.groomAddress.longitude,
    });
  };

  const handleSaveBrideAddressToProfile = async (customLabel?: string) => {
    if (!isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    await saveAddress({
      label: customLabel || tourForm.brideAddress.label || "Bride's Family Home",
      side: 'bride',
      address: tourForm.brideAddress.address,
      city: tourForm.brideAddress.city,
      state: tourForm.brideAddress.state,
      zipCode: tourForm.brideAddress.zipCode,
      latitude: tourForm.brideAddress.latitude,
      longitude: tourForm.brideAddress.longitude,
    });
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
        const costA = getEffectivePricing(a, planningGuestCount, eventFormat).estimatedTotalCost;
        const costB = getEffectivePricing(b, planningGuestCount, eventFormat).estimatedTotalCost;
        return costA - costB;
      }
      if (curatedSortBy === 'price_desc') {
        const costA = getEffectivePricing(a, planningGuestCount, eventFormat).estimatedTotalCost;
        const costB = getEffectivePricing(b, planningGuestCount, eventFormat).estimatedTotalCost;
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

            <button
              type="button"
              onClick={() => setActiveTab('sangeet')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                activeTab === 'sangeet'
                  ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-xs'
                  : 'bg-white/10 hover:bg-white/20 text-amber-200 border-white/20'
              }`}
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span>Sangeet Triangulation (NJ & PA)</span>
              {officialSangeetVenue && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
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

        <button
          type="button"
          onClick={() => setActiveTab('sangeet')}
          className={`py-3 px-4 sm:px-6 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'sangeet'
              ? 'border-purple-600 text-purple-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Sangeet & Garba Halls (Triangulated)</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
            NJ & PA
          </span>
          {officialSangeetVenue && (
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ✓ Locked
            </span>
          )}
        </button>
      </div>

      {/* Official Wedding Venue Confirmed Banner: Step 2 Callout */}
      {officialVenue && activeTab !== 'sangeet' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-purple-950 via-fuchsia-900 to-rose-950 text-white shadow-md border border-purple-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-bold text-lg shadow-sm">
              🏛️
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Wedding & Reception Venue Confirmed!</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white">
                {officialVenue.name} ({officialVenue.city}, {officialVenue.state})
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Next Workflow Step: Scout budget-friendly Sangeet & Garba halls triangulated between Groom, Bride, and {officialVenue.name}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('sangeet')}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            <Music className="w-4 h-4" />
            <span>Launch Sangeet Triangulation Engine →</span>
          </button>
        </div>
      )}

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
                        const effective = getEffectivePricing(
                          venue,
                          planningGuestCount,
                          eventFormat
                        );

                        return (
                          <div className="space-y-2">
                            <div
                              className={`p-3.5 rounded-2xl border text-xs space-y-2.5 transition-all ${
                                effective.isCustomUserQuote
                                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-amber-300 shadow-2xs'
                                  : 'bg-gradient-to-r from-amber-50/90 to-rose-50/80 border-amber-200/90'
                              }`}
                            >
                              {/* Custom Quote Banner if active */}
                              {effective.isCustomUserQuote && (
                                <div className="flex items-center justify-between pb-1.5 border-b border-amber-200 text-[10px]">
                                  <span className="font-extrabold text-amber-950 flex items-center gap-1">
                                    <span>⭐</span>
                                    <span>My Negotiated Vendor Quote (User Override Active)</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuoteModal(venue)}
                                    className="text-amber-800 font-bold underline hover:text-amber-950 cursor-pointer"
                                  >
                                    Edit Quote
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                                    <Calculator className="w-3 h-3 text-rose-700" />
                                    <span>
                                      {effective.isCustomUserQuote
                                        ? `My Quoted Price for ${planningGuestCount} Guests (${effective.quoteLabel}):`
                                        : eventFormat === 'all_day'
                                        ? `Est. All-Day Package for ${planningGuestCount} Guests:`
                                        : eventFormat === 'reception_only'
                                        ? `Est. Evening Reception for ${planningGuestCount} Guests:`
                                        : `Est. Morning Ceremony for ${planningGuestCount} Guests:`}
                                    </span>
                                  </span>
                                  <strong className="text-stone-900 text-xl font-extrabold block">
                                    {formatCurr(effective.estimatedTotalCost)}
                                  </strong>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-lg border font-extrabold text-xs shadow-2xs ${
                                      effective.isCustomUserQuote
                                        ? 'bg-amber-100 border-amber-400 text-amber-950'
                                        : 'bg-white border-amber-300 text-rose-900'
                                    }`}
                                  >
                                    ~{formatCurr(effective.costPerGuest)} / guest
                                  </span>
                                  <span className="block text-[10px] text-stone-500 mt-0.5">
                                    {effective.isCustomUserQuote ? 'negotiated vendor rate' : 'all-in verified quote'}
                                  </span>
                                </div>
                              </div>

                              {/* Coordinator & Call Notes if logged */}
                              {(effective.coordinatorName || effective.callNotes) && (
                                <div className="p-2 rounded-xl bg-white/80 border border-amber-200/80 text-[11px] text-stone-700 space-y-1">
                                  {effective.coordinatorName && (
                                    <div className="flex items-center justify-between text-stone-900 font-semibold text-[11px]">
                                      <span>👤 Coordinator: {effective.coordinatorName}</span>
                                      {effective.coordinatorPhone && (
                                        <a href={`tel:${effective.coordinatorPhone}`} className="text-rose-700 hover:underline">
                                          📞 {effective.coordinatorPhone}
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {effective.callNotes && (
                                    <p className="italic text-stone-600 text-[10px] leading-relaxed">
                                      💬 &ldquo;{effective.callNotes}&rdquo;
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Available Dates Logged */}
                              {effective.availableDates && effective.availableDates.length > 0 && (
                                <div className="pt-1.5 border-t border-amber-200/60">
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="font-bold text-stone-800 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-rose-600" />
                                      <span>Available Dates ({effective.availableDates.length}):</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuoteModal(venue)}
                                      className="text-amber-800 font-semibold hover:underline cursor-pointer"
                                    >
                                      + Manage Dates
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {effective.availableDates.slice(0, 4).map((d) => {
                                      const hasPrice = Number(d.customPriceOverride) > 0;
                                      const isActiveDate = effective.activeDate?.id === d.id && hasPrice;

                                      return (
                                        <button
                                          type="button"
                                          key={d.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            selectActiveVenueDate(venue.id, d.id);
                                          }}
                                          title={hasPrice ? `Click to calculate estimate for ${d.seasonLabel || d.date}` : undefined}
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                                            isActiveDate
                                              ? 'bg-amber-200 text-amber-950 border-amber-400 ring-2 ring-amber-400/40 shadow-2xs'
                                              : d.isHold
                                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                              : d.isPreferred
                                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                              : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                                          }`}
                                        >
                                          <span>📅 {d.date}</span>
                                          {d.dayOfWeek && <span className="opacity-80">({d.dayOfWeek.slice(0, 3)})</span>}
                                          {hasPrice && (
                                            <span className="font-mono text-rose-950 font-extrabold bg-amber-300/90 px-1 rounded text-[10px]">
                                              {d.pricingOverrideType === 'per_person'
                                                ? `$${d.customPriceOverride}/pp`
                                                : `$${(d.customPriceOverride! / 1000).toFixed(0)}k`}
                                            </span>
                                          )}
                                          {d.seasonLabel && (
                                            <span className="text-[9px] text-stone-600 font-semibold truncate max-w-[80px]">
                                              {d.seasonLabel}
                                            </span>
                                          )}
                                          {d.isHold && <span className="text-[9px] text-amber-800">⏳ Hold</span>}
                                          {d.isPreferred && <span className="text-[9px] text-emerald-800">⭐ Top</span>}
                                        </button>
                                      );
                                    })}
                                    {effective.availableDates.length > 4 && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenQuoteModal(venue)}
                                        className="text-[10px] text-stone-500 hover:text-stone-800 font-medium py-0.5 underline cursor-pointer"
                                      >
                                        +{effective.availableDates.length - 4} more
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Breakdown Pills */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 text-[10px] text-stone-600 border-t border-amber-200/60">
                                <div>
                                  <span className="text-stone-400 block">Morning Ceremony:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.morningCeremonyTotal ? formatCurr(effective.morningCeremonyTotal) : 'Included in quote'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Evening Reception:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.eveningReceptionTotal ? formatCurr(effective.eveningReceptionTotal) : 'Included in quote'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Svc &amp; Admin:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.isTaxAndServiceIncluded ? 'Included in quote' : `${effective.serviceChargePercent}%`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Tax:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.isTaxAndServiceIncluded ? 'Included in quote' : `${effective.taxPercent}%`}
                                  </span>
                                </div>
                              </div>

                              {/* Historical Day-of-Week Variance & Reddit Intel Quick Bar */}
                              {venue.historicalPricingIntelligence && (
                                <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-950 font-bold text-[9px] uppercase tracking-wider">
                                      Market Benchmark
                                    </span>
                                    <span className="font-semibold text-stone-700">
                                      <span className="font-bold text-amber-950">Sat:</span> {venue.historicalPricingIntelligence.peakSaturdayRate.split('(')[0].trim()}
                                    </span>
                                    <span className="text-stone-300">•</span>
                                    <span className="font-semibold text-emerald-800">
                                      <span className="font-bold text-emerald-950">Fri:</span> {venue.historicalPricingIntelligence.fridayRate.split('(')[0].trim()}
                                    </span>
                                    {effective.isCustomUserQuote && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px] border border-amber-300">
                                        Your quote active
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setInspectingPricingVenue(venue)}
                                    className="text-amber-900 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span>💬 {venue.historicalPricingIntelligence.realCouplesRedditQuotes.length} Reddit Reports &amp; Intel</span>
                                    <ChevronRight className="w-3 h-3 text-amber-700" />
                                  </button>
                                </div>
                              )}
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
                      <div className="flex flex-wrap items-center gap-2">
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

                        <button
                          type="button"
                          onClick={() => handleOpenQuoteModal(venue)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                            getUserVenueQuote(venue.id)
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                          <span>{getUserVenueQuote(venue.id) ? '✏️ Edit My Quote & Dates' : '📝 Log Vendor Call / Quote'}</span>
                        </button>
                      </div>

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
                        const effective = getEffectivePricing(
                          venue,
                          planningGuestCount,
                          eventFormat
                        );

                        return (
                          <div className="space-y-2">
                            <div
                              className={`p-3.5 rounded-2xl border text-xs space-y-2.5 transition-all ${
                                effective.isCustomUserQuote
                                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-amber-300 shadow-2xs'
                                  : 'bg-gradient-to-r from-amber-50/90 to-rose-50/80 border-amber-200/90'
                              }`}
                            >
                              {/* Custom Quote Banner if active */}
                              {effective.isCustomUserQuote && (
                                <div className="flex items-center justify-between pb-1.5 border-b border-amber-200 text-[10px]">
                                  <span className="font-extrabold text-amber-950 flex items-center gap-1">
                                    <span>⭐</span>
                                    <span>My Negotiated Vendor Quote (User Override Active)</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuoteModal(venue)}
                                    className="text-amber-800 font-bold underline hover:text-amber-950 cursor-pointer"
                                  >
                                    Edit Quote
                                  </button>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                                    <Calculator className="w-3 h-3 text-rose-700" />
                                    <span>
                                      {effective.isCustomUserQuote
                                        ? `My Quoted Price for ${planningGuestCount} Guests (${effective.quoteLabel}):`
                                        : eventFormat === 'all_day'
                                        ? `Est. All-Day Package for ${planningGuestCount} Guests:`
                                        : eventFormat === 'reception_only'
                                        ? `Est. Evening Reception for ${planningGuestCount} Guests:`
                                        : `Est. Morning Ceremony for ${planningGuestCount} Guests:`}
                                    </span>
                                  </span>
                                  <strong className="text-stone-900 text-xl font-extrabold block">
                                    {formatCurr(effective.estimatedTotalCost)}
                                  </strong>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-lg border font-extrabold text-xs shadow-2xs ${
                                      effective.isCustomUserQuote
                                        ? 'bg-amber-100 border-amber-400 text-amber-950'
                                        : 'bg-white border-amber-300 text-rose-900'
                                    }`}
                                  >
                                    ~{formatCurr(effective.costPerGuest)} / guest
                                  </span>
                                  <span className="block text-[10px] text-stone-500 mt-0.5">
                                    {effective.isCustomUserQuote ? 'negotiated vendor rate' : 'all-in verified quote'}
                                  </span>
                                </div>
                              </div>

                              {/* Coordinator & Call Notes if logged */}
                              {(effective.coordinatorName || effective.callNotes) && (
                                <div className="p-2 rounded-xl bg-white/80 border border-amber-200/80 text-[11px] text-stone-700 space-y-1">
                                  {effective.coordinatorName && (
                                    <div className="flex items-center justify-between text-stone-900 font-semibold text-[11px]">
                                      <span>👤 Coordinator: {effective.coordinatorName}</span>
                                      {effective.coordinatorPhone && (
                                        <a href={`tel:${effective.coordinatorPhone}`} className="text-rose-700 hover:underline">
                                          📞 {effective.coordinatorPhone}
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {effective.callNotes && (
                                    <p className="italic text-stone-600 text-[10px] leading-relaxed">
                                      💬 &ldquo;{effective.callNotes}&rdquo;
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Available Dates Logged */}
                              {effective.availableDates && effective.availableDates.length > 0 && (
                                <div className="pt-1.5 border-t border-amber-200/60">
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="font-bold text-stone-800 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-rose-600" />
                                      <span>Available Dates ({effective.availableDates.length}):</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuoteModal(venue)}
                                      className="text-amber-800 font-semibold hover:underline cursor-pointer"
                                    >
                                      + Manage Dates
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {effective.availableDates.slice(0, 4).map((d) => {
                                      const hasPrice = Number(d.customPriceOverride) > 0;
                                      const isActiveDate = effective.activeDate?.id === d.id && hasPrice;

                                      return (
                                        <button
                                          type="button"
                                          key={d.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            selectActiveVenueDate(venue.id, d.id);
                                          }}
                                          title={hasPrice ? `Click to calculate estimate for ${d.seasonLabel || d.date}` : undefined}
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-all ${
                                            isActiveDate
                                              ? 'bg-amber-200 text-amber-950 border-amber-400 ring-2 ring-amber-400/40 shadow-2xs'
                                              : d.isHold
                                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                              : d.isPreferred
                                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                                              : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
                                          }`}
                                        >
                                          <span>📅 {d.date}</span>
                                          {d.dayOfWeek && <span className="opacity-80">({d.dayOfWeek.slice(0, 3)})</span>}
                                          {hasPrice && (
                                            <span className="font-mono text-rose-950 font-extrabold bg-amber-300/90 px-1 rounded text-[10px]">
                                              {d.pricingOverrideType === 'per_person'
                                                ? `$${d.customPriceOverride}/pp`
                                                : `$${(d.customPriceOverride! / 1000).toFixed(0)}k`}
                                            </span>
                                          )}
                                          {d.seasonLabel && (
                                            <span className="text-[9px] text-stone-600 font-semibold truncate max-w-[80px]">
                                              {d.seasonLabel}
                                            </span>
                                          )}
                                          {d.isHold && <span className="text-[9px] text-amber-800">⏳ Hold</span>}
                                          {d.isPreferred && <span className="text-[9px] text-emerald-800">⭐ Top</span>}
                                        </button>
                                      );
                                    })}
                                    {effective.availableDates.length > 4 && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenQuoteModal(venue)}
                                        className="text-[10px] text-stone-500 hover:text-stone-800 font-medium py-0.5 underline cursor-pointer"
                                      >
                                        +{effective.availableDates.length - 4} more
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Breakdown Pills */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1.5 text-[10px] text-stone-600 border-t border-amber-200/60">
                                <div>
                                  <span className="text-stone-400 block">Morning Ceremony:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.morningCeremonyTotal ? formatCurr(effective.morningCeremonyTotal) : 'Included in quote'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Evening Reception:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.eveningReceptionTotal ? formatCurr(effective.eveningReceptionTotal) : 'Included in quote'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Svc &amp; Admin:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.isTaxAndServiceIncluded ? 'Included in quote' : `${effective.serviceChargePercent}%`}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-stone-400 block">Tax:</span>
                                  <span className="font-semibold text-stone-800">
                                    {effective.isTaxAndServiceIncluded ? 'Included in quote' : `${effective.taxPercent}%`}
                                  </span>
                                </div>
                              </div>

                              {/* Historical Day-of-Week Variance & Reddit Intel Quick Bar */}
                              {venue.historicalPricingIntelligence && (
                                <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-950 font-bold text-[9px] uppercase tracking-wider">
                                      Market Benchmark
                                    </span>
                                    <span className="font-semibold text-stone-700">
                                      <span className="font-bold text-amber-950">Sat:</span> {venue.historicalPricingIntelligence.peakSaturdayRate.split('(')[0].trim()}
                                    </span>
                                    <span className="text-stone-300">•</span>
                                    <span className="font-semibold text-emerald-800">
                                      <span className="font-bold text-emerald-950">Fri:</span> {venue.historicalPricingIntelligence.fridayRate.split('(')[0].trim()}
                                    </span>
                                    {effective.isCustomUserQuote && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[9px] border border-amber-300">
                                        Your quote active
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setInspectingPricingVenue(venue)}
                                    className="text-amber-900 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <span>💬 {venue.historicalPricingIntelligence.realCouplesRedditQuotes.length} Reddit Reports &amp; Intel</span>
                                    <ChevronRight className="w-3 h-3 text-amber-700" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                          <input
                            type="checkbox"
                            checked={isIncludedInTour}
                            onChange={() => handleToggleVenueSelectionForTour(venue.id)}
                            className="w-4 h-4 rounded-md text-rose-600 focus:ring-rose-500"
                          />
                          <span>Include in Site Tour Day</span>
                        </label>

                        {venue.historicalPricingIntelligence && (
                          <button
                            type="button"
                            onClick={() => setInspectingPricingVenue(venue)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 shadow-2xs"
                            title="View verified Reddit historical contracts and Saturday vs Friday pricing"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reddit Intel &amp; Day Rates</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenQuoteModal(venue)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                            getUserVenueQuote(venue.id)
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                          <span>{getUserVenueQuote(venue.id) ? '✏️ Edit My Quote & Dates' : '📝 Log Vendor Call / Quote'}</span>
                        </button>
                      </div>

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
                  onClick={() => {
                    const updated = { ...tourForm, meetingMode: 'meet_at_first_venue' as const };
                    setTourForm(updated);
                    if (tourPlan && tourPlan.optimizedStops.length > 0) recalculateTourPlan(updated);
                  }}
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
                  onClick={() => {
                    const updated = { ...tourForm, meetingMode: 'carpool_pickup' as const };
                    setTourForm(updated);
                    if (tourPlan && tourPlan.optimizedStops.length > 0) recalculateTourPlan(updated);
                  }}
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
                  onClick={() => {
                    const updated = { ...tourForm, meetingMode: 'single_family_start' as const };
                    setTourForm(updated);
                    if (tourPlan && tourPlan.optimizedStops.length > 0) recalculateTourPlan(updated);
                  }}
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

            {/* Profile Address Book & Quick Historical Selector Toolbar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-stone-50 to-rose-50/90 border border-amber-200/80 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <Bookmark className="w-4 h-4 text-amber-700" />
                  </span>
                  <div>
                    <div className="font-bold text-stone-900 text-xs flex items-center gap-2">
                      <span>Profile Address Memory</span>
                      {isLoggedIn ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.2 rounded-full border border-emerald-300">
                          {savedAddresses.length} Saved in Profile
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-stone-600 bg-stone-200/80 px-2 py-0.2 rounded-full">
                          Sign in to save addresses
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 leading-snug mt-0.5">
                      {isLoggedIn
                        ? `Private to your account (${user?.email || 'Active User'}). Select past family addresses without retyping.`
                        : 'Addresses entered can be saved directly under your user profile for 1-click historical auto-fill.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => setIsAddressBookModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 hover:border-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span>Manage Address Book ({savedAddresses.length})</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In to Save</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Select Chips from Saved Addresses */}
              {isLoggedIn && savedAddresses.length > 0 && (
                <div className="pt-2 border-t border-amber-200/50 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                    <History className="w-3 h-3 text-amber-700" />
                    <span>Quick Autofill:</span>
                  </span>
                  {savedAddresses.map((sa) => (
                    <div
                      key={sa.id}
                      className="inline-flex items-center rounded-xl border border-stone-200/90 bg-white shadow-2xs overflow-hidden text-[11px]"
                    >
                      <span className="px-2.5 py-1 font-semibold text-stone-800 bg-stone-50/80 border-r border-stone-200 truncate max-w-[170px]">
                        {sa.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectAddressForSide(sa, 'groom')}
                        className="px-2 py-1 text-blue-700 hover:bg-blue-50 font-bold border-r border-stone-100 transition-colors cursor-pointer"
                        title={`Autofill Groom's side with ${sa.address}`}
                      >
                        Fill Groom
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectAddressForSide(sa, 'bride')}
                        className="px-2 py-1 text-rose-700 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                        title={`Autofill Bride's side with ${sa.address}`}
                      >
                        Fill Bride
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  onChange={(updated) => {
                    const newGroom = {
                      ...tourForm.groomAddress,
                      ...updated,
                    };
                    const updatedForm = {
                      ...tourForm,
                      groomAddress: newGroom,
                    };
                    setTourForm(updatedForm);
                    if (tourPlan && tourPlan.optimizedStops.length > 0) {
                      recalculateTourPlan(updatedForm);
                    }
                  }}
                  label="Groom's Home Address"
                  placeholder="Start typing (e.g. 254 Montgomery St or Lawrence Township)..."
                  accentColor="blue"
                  savedAddresses={savedAddresses}
                  onSelectSavedAddress={(saved) => markAddressUsed(saved.id)}
                  onSaveToProfile={handleSaveGroomAddressToProfile}
                  isSavedInProfile={isAddressSaved(tourForm.groomAddress.address, tourForm.groomAddress.city)}
                  isLoggedIn={isLoggedIn}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
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
                        onChange={() => {
                          const updated = { ...tourForm, primarySide: 'bride' as const };
                          setTourForm(updated);
                          if (tourPlan && tourPlan.optimizedStops.length > 0) {
                            recalculateTourPlan(updated);
                          }
                        }}
                      />
                      <span>{tourForm.meetingMode === 'carpool_pickup' ? 'Driver (Starts Here)' : 'Start Day Here'}</span>
                    </label>
                  )}
                </div>

                <AddressAutocompleteInput
                  value={tourForm.brideAddress}
                  onChange={(updated) => {
                    const newBride = {
                      ...tourForm.brideAddress,
                      ...updated,
                    };
                    const updatedForm = {
                      ...tourForm,
                      brideAddress: newBride,
                    };
                    setTourForm(updatedForm);
                    if (tourPlan && tourPlan.optimizedStops.length > 0) {
                      recalculateTourPlan(updatedForm);
                    }
                  }}
                  label="Bride's Home Address"
                  placeholder="Start typing (e.g. 88 Oak Tree Rd or Mountain Top PA)..."
                  accentColor="rose"
                  savedAddresses={savedAddresses}
                  onSelectSavedAddress={(saved) => markAddressUsed(saved.id)}
                  onSaveToProfile={handleSaveBrideAddressToProfile}
                  isSavedInProfile={isAddressSaved(tourForm.brideAddress.address, tourForm.brideAddress.city)}
                  isLoggedIn={isLoggedIn}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  quickSuggestions={[
                    { label: 'Mountain Top, PA', address: 'Mountain Top Area', city: 'Mountain Top', state: 'PA', zipCode: '18707', lat: 41.1514, lon: -75.9376 },
                    { label: 'Edison (Oak Tree Rd)', address: '88 Oak Tree Road', city: 'Edison', state: 'NJ', zipCode: '08820', lat: 40.5701, lon: -74.3418 },
                    { label: 'Somerset (Davidson Ave)', address: '333 Davidson Avenue', city: 'Somerset', state: 'NJ', zipCode: '08873', lat: 40.5284, lon: -74.5218 },
                    { label: 'Livingston (Northfield)', address: '315 E Northfield Road', city: 'Livingston', state: 'NJ', zipCode: '07039', lat: 40.7891, lon: -74.3418 },
                    { label: 'Philadelphia (Broad St)', address: '1400 S Broad Street', city: 'Philadelphia', state: 'PA', zipCode: '19146', lat: 39.9365, lon: -75.1672 },
                  ]}
                />
              </div>
            </div>

            {/* Tour Day Timing & Target Mode Parameters */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-stone-100/90 border border-stone-200 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold text-stone-900 block">
                      Tour Schedule Target Mode
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Choose whether your start time specifies venue arrival or home departure
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 bg-stone-200/80 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...tourForm, startTimePlanningMode: 'venue_arrival' as const };
                      setTourForm(updated);
                      recalculateTourPlan(updated);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tourForm.startTimePlanningMode !== 'family_departure'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🏛️ Arrive at Stop #1 at {tourForm.dayStartTime}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...tourForm, startTimePlanningMode: 'family_departure' as const };
                      setTourForm(updated);
                      recalculateTourPlan(updated);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tourForm.startTimePlanningMode === 'family_departure'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🚗 Leave Home at {tourForm.dayStartTime}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Tour Date *</label>
                  <input
                    type="date"
                    value={tourForm.tourDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const updated = { ...tourForm, tourDate: newDate };
                      setTourForm(updated);
                      if (tourPlan && tourPlan.optimizedStops.length > 0) {
                        recalculateTourPlan(updated);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    {tourForm.startTimePlanningMode === 'family_departure'
                      ? 'Morning Departure Time *'
                      : 'Stop #1 Tour Start Time *'}
                  </label>
                  <select
                    value={tourForm.dayStartTime}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      const updated = { ...tourForm, dayStartTime: newTime };
                      setTourForm(updated);
                      if (tourPlan && tourPlan.optimizedStops.length > 0) {
                        recalculateTourPlan(updated);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                  >
                    <option value="08:00 AM">08:00 AM (Early Start)</option>
                    <option value="08:30 AM">08:30 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM (Popular)</option>
                    <option value="10:00 AM">10:00 AM (Standard)</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM (Late Start)</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM (Noon)</option>
                  </select>
                </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Default Tour Length</label>
                <select
                  value={tourForm.durationPerTourMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...tourForm, durationPerTourMinutes: val };
                    setTourForm(updated);
                    if (tourPlan && tourPlan.optimizedStops.length > 0) {
                      recalculateTourPlan(updated);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value={30}>30 mins (Quick Walkthrough)</option>
                  <option value={45}>45 mins (Short Walkthrough)</option>
                  <option value={60}>60 mins (Standard Tour + Q&A)</option>
                  <option value={75}>75 mins (Deep Dive & Catering)</option>
                  <option value={90}>90 mins (Comprehensive Tour)</option>
                </select>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  Customize per venue below
                </span>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Drive Buffer / Padding</label>
                <select
                  value={tourForm.bufferBetweenToursMinutes}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...tourForm, bufferBetweenToursMinutes: val };
                    setTourForm(updated);
                    if (tourPlan && tourPlan.optimizedStops.length > 0) {
                      recalculateTourPlan(updated);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-base sm:text-xs"
                >
                  <option value={10}>10 mins buffer</option>
                  <option value={15}>15 mins buffer</option>
                  <option value={20}>20 mins buffer (Recommended)</option>
                </select>
              </div>
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
                      {isSat ? 'Saturday Touring Hours (10:00 AM – 5:00 PM)' : isSun ? 'Sunday Touring Hours (10:00 AM – 4:30 PM)' : 'Full Day Appointments (10:00 AM – 6:00 PM)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    {isSat ? (
                      <>
                        <strong>Saturday Tour Policy:</strong> Tri-State luxury wedding estates (e.g., The Legacy Castle, The Palace at Somerset, Florentine Gardens, The Rockleigh, Crystal Plaza) conduct walkthrough appointments throughout the day until <strong>5:00 PM</strong> (with latest tour start around 4:15 PM before evening receptions begin). The route optimizer automatically arranges your stops to fit available hours. We recommend selecting <strong>maximum 2 to 3 venues</strong>.
                      </>
                    ) : isSun ? (
                      <>
                        <strong>Sunday Walkthrough Window:</strong> Venues open tour appointments between <strong>10:00 AM and 4:30 PM</strong>.
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
                  const lockedTime = tourForm.lockedAppointmentTimes?.[v.id];
                  const touring = getDefaultTouringHours(v);
                  const effective = getEffectivePricing(v, planningGuestCount, eventFormat);
                  return (
                    <div
                      key={v.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isChecked
                          ? lockedTime
                            ? 'border-indigo-500 bg-indigo-50/40 text-stone-900 shadow-sm ring-1 ring-indigo-500/30'
                            : 'border-rose-600 bg-rose-50/40 text-stone-900 shadow-2xs'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleVenueSelectionForTour(v.id)}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 mt-0.5"
                        />
                        <div className="truncate flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate block text-stone-900">{v.name}</span>
                            {lockedTime && (
                              <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 text-[10px] font-bold border border-indigo-200 shrink-0 flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Fixed</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-500 truncate block">
                            {v.city}, {v.state} • {formatCurr(effective.estimatedTotalCost)}
                            {effective.isCustomUserQuote && (
                              <span className="text-amber-800 font-bold ml-1">⭐ (My Quote)</span>
                            )}
                          </span>
                          <span className="text-[9px] text-amber-800 font-semibold truncate block mt-0.5">
                            Sat: {touring.saturdayHours.split('(')[0].trim()}
                          </span>
                        </div>
                      </label>

                      {isChecked && (
                        <div className="mt-2.5 pt-2 border-t border-stone-200/70 space-y-2 text-xs">
                          {/* Row 1: Hard vs Flexible Appointment */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>Tour Slot:</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              {lockedTime ? (
                                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-indigo-300 shadow-2xs">
                                  <span className="font-mono font-bold text-[11px] text-indigo-950 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5 text-indigo-600" />
                                    <span>{lockedTime}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClearLockedTime(v.id);
                                    }}
                                    className="text-stone-400 hover:text-stone-800 text-xs px-0.5 font-bold"
                                    title="Clear hard appointment (make flexible)"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleSetLockedTime(v.id, e.target.value);
                                    }
                                  }}
                                  className="text-[10px] font-semibold py-0.5 px-2 rounded-lg bg-white border border-stone-300 text-stone-700 hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                                >
                                  <option value="">✨ Flexible Slot</option>
                                  <option value="10:00 AM">🔒 Hard Appt: 10:00 AM</option>
                                  <option value="10:30 AM">🔒 Hard Appt: 10:30 AM</option>
                                  <option value="11:00 AM">🔒 Hard Appt: 11:00 AM</option>
                                  <option value="11:30 AM">🔒 Hard Appt: 11:30 AM</option>
                                  <option value="12:00 PM">🔒 Hard Appt: 12:00 PM</option>
                                  <option value="12:30 PM">🔒 Hard Appt: 12:30 PM</option>
                                  <option value="01:00 PM">🔒 Hard Appt: 1:00 PM</option>
                                  <option value="01:30 PM">🔒 Hard Appt: 1:30 PM</option>
                                  <option value="02:00 PM">🔒 Hard Appt: 2:00 PM</option>
                                  <option value="02:30 PM">🔒 Hard Appt: 2:30 PM</option>
                                  <option value="03:00 PM">🔒 Hard Appt: 3:00 PM</option>
                                  <option value="03:30 PM">🔒 Hard Appt: 3:30 PM</option>
                                  <option value="04:00 PM">🔒 Hard Appt: 4:00 PM</option>
                                </select>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Custom Time Options Spent at Venue */}
                          {(() => {
                            const venueDuration = tourForm.customVenueDurations?.[v.id] || tourForm.durationPerTourMinutes;
                            const isCustom = Boolean(tourForm.customVenueDurations?.[v.id]);
                            return (
                              <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-dashed border-stone-200">
                                <span className="text-[10px] font-bold text-stone-700 flex items-center gap-1">
                                  <span>⏱️ Time:</span>
                                  {venueDuration <= 30 ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                      ⚡ Low Interest (30m)
                                    </span>
                                  ) : venueDuration >= 75 ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-300">
                                      🔥 Priority ({venueDuration}m)
                                    </span>
                                  ) : isCustom ? (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300">
                                      Custom ({venueDuration}m)
                                    </span>
                                  ) : null}
                                </span>

                                <div className="flex items-center gap-1">
                                  <select
                                    value={venueDuration}
                                    onChange={(e) => handleSetVenueDuration(v.id, Number(e.target.value))}
                                    className={`text-[10px] font-semibold py-0.5 px-2 rounded-lg bg-white border cursor-pointer ${
                                      isCustom
                                        ? 'border-amber-500 font-bold text-amber-950 bg-amber-50/50'
                                        : 'border-stone-300 text-stone-700 hover:border-amber-400'
                                    }`}
                                  >
                                    <option value={30}>⚡ 30m (Quick Look / Lower Interest)</option>
                                    <option value={45}>⏱️ 45m (Short Walkthrough)</option>
                                    <option value={60}>⭐ 60m (Standard Tour + Q&A)</option>
                                    <option value={75}>✨ 75m (In-Depth Tour & Catering)</option>
                                    <option value={90}>🔥 90m (Top Priority / VIP)</option>
                                    <option value={120}>💎 120m (Full Consultation)</option>
                                  </select>
                                  {isCustom && (
                                    <button
                                      type="button"
                                      onClick={() => handleResetVenueDuration(v.id)}
                                      className="text-[9px] text-stone-400 hover:text-stone-700 font-bold px-1"
                                      title="Reset to default duration"
                                    >
                                      ↺
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
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
                onChange={(e) => {
                  const updated = { ...tourForm, includesLunchBreak: e.target.checked };
                  setTourForm(updated);
                  if (tourPlan && tourPlan.optimizedStops.length > 0) {
                    recalculateTourPlan(updated);
                  }
                }}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 ml-4 shrink-0 cursor-pointer"
              />
            </div>

            {/* Active Locked Slot Advisory */}
            {Object.keys(tourForm.lockedAppointmentTimes || {}).length > 0 && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-950">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>{Object.keys(tourForm.lockedAppointmentTimes).length} Fixed Appointment Active</strong>: Schedule works backwards from your locked venue appointment.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllLockedTimes}
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-300 hover:bg-indigo-100 text-[11px] font-bold text-indigo-800 transition-colors shrink-0 shadow-2xs"
                >
                  Clear Fixed Slot (Make All Flexible)
                </button>
              </div>
            )}

            {/* Action to Calculate Optimal Route */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isCalculating}
                onClick={handleGenerateOptimalTourPlan}
                className={`w-full sm:w-auto px-7 py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  justCalculated
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
                    : 'bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 hover:from-rose-800 hover:to-amber-800 shadow-rose-900/25'
                }`}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Recalculating Schedule &amp; Route...</span>
                  </>
                ) : justCalculated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>✓ Schedule &amp; Route Updated!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>⚡ Calculate Optimal Route &amp; Schedule</span>
                  </>
                )}
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

              {/* Hard Appointment Anchoring Banner */}
              {tourPlan.hasLockedAppointments && (
                <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3 shadow-2xs">
                  <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-indigo-950">
                        Hard Appointment Anchoring Active
                      </h5>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-900 text-[10px] font-bold">
                        {Object.keys(tourPlan.lockedAppointmentTimes || {}).length} Confirmed Fixed Slot
                      </span>
                    </div>
                    <p className="text-indigo-900/90 leading-relaxed text-xs">
                      The optimizer has fixed your confirmed venue appointment times and automatically calculated the surrounding schedule. Flexible venues have been recommended with specific appointment times and driving buffers so you arrive on schedule without rushing.
                    </p>
                  </div>
                </div>
              )}

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
                    <div className="space-y-3">
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

                      {/* Long distance travel advisory explanation */}
                      <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/80 text-xs text-stone-300 flex items-start gap-2.5">
                        <span className="text-amber-400 text-sm mt-0.5 shrink-0">💡</span>
                        <div className="space-y-1 leading-relaxed">
                          <p>
                            <span className="font-bold text-amber-200">Why departure times differ: </span>
                            <span>
                              {tourPlan.dualFamilyStartPlan.brideDeparture.distanceMilesToFirstStop > tourPlan.dualFamilyStartPlan.groomDeparture.distanceMilesToFirstStop
                                ? `Bride's family in ${tourPlan.dualFamilyStartPlan.brideDeparture.homeCity} has a ${tourPlan.dualFamilyStartPlan.brideDeparture.distanceMilesToFirstStop}-mile drive (~${tourPlan.dualFamilyStartPlan.brideDeparture.drivingMinutesToFirstStop} mins) to ${tourPlan.dualFamilyStartPlan.firstMeetingPointName}, while Groom's family in ${tourPlan.dualFamilyStartPlan.groomDeparture.homeCity} has a ${tourPlan.dualFamilyStartPlan.groomDeparture.distanceMilesToFirstStop}-mile drive (~${tourPlan.dualFamilyStartPlan.groomDeparture.drivingMinutesToFirstStop} mins).`
                                : `Both departure times are calculated backwards to ensure synchronous arrival at your first appointment.`}
                            </span>
                          </p>
                          {tourForm.startTimePlanningMode !== 'family_departure' ? (
                            <p className="text-stone-400 text-[11px]">
                              Prefer families not to leave before 10:00 AM? Switch above to{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = { ...tourForm, startTimePlanningMode: 'family_departure' as const };
                                  setTourForm(updated);
                                  recalculateTourPlan(updated);
                                }}
                                className="text-amber-300 font-bold underline hover:text-amber-200 cursor-pointer"
                              >
                                "Leave Home at {tourForm.dayStartTime}"
                              </button>
                              , and Stop #1 will be scheduled around ~11:45 AM.
                            </p>
                          ) : (
                            <p className="text-stone-400 text-[11px]">
                              Currently set to <span className="text-emerald-300 font-bold">Leave Home at {tourForm.dayStartTime}</span>. Stop #1 walkthrough starts when everyone arrives.
                            </p>
                          )}
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
                                {stop.isLockedTime ? (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5 text-indigo-700" />
                                    <span>Confirmed Appt #{stop.stopOrder}</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                                    Appointment #{stop.stopOrder}
                                  </span>
                                )}
                                <span className={`text-xs font-bold ${stop.isLockedTime ? 'text-indigo-950 font-mono' : 'text-amber-800'}`}>
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

                          {/* Interactive Custom Time Spent per Venue Control */}
                          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                                <span>⏱️</span>
                                <span>Time Allocated:</span>
                              </span>
                              {(() => {
                                const curDur = stop.tourDurationMinutes || tourForm.durationPerTourMinutes;
                                if (curDur <= 30) {
                                  return (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                                      ⚡ 30m (Quick Walkthrough — Lower Interest)
                                    </span>
                                  );
                                }
                                if (curDur <= 45) {
                                  return (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-950 border border-blue-300">
                                      ⏱️ 45m (Short Tour)
                                    </span>
                                  );
                                }
                                if (curDur >= 75) {
                                  return (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-950 border border-purple-300">
                                      🔥 {curDur}m (Top Contender / Detailed)
                                    </span>
                                  );
                                }
                                return (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 text-stone-800">
                                    ⭐ 60m (Standard Tour)
                                  </span>
                                );
                              })()}
                            </div>

                            {/* 1-Click Duration Switcher Pills */}
                            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-300 shadow-2xs">
                              <span className="text-[10px] font-semibold text-stone-500 pl-1.5 pr-0.5">Adjust time:</span>
                              {[30, 45, 60, 75, 90].map((mins) => {
                                const currentDur = stop.tourDurationMinutes || tourForm.durationPerTourMinutes;
                                const isCurrent = currentDur === mins;
                                return (
                                  <button
                                    key={mins}
                                    type="button"
                                    onClick={() => handleSetVenueDuration(stop.venueId, mins)}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                      isCurrent
                                        ? mins <= 30
                                          ? 'bg-amber-400 text-stone-950 shadow-2xs'
                                          : mins >= 75
                                          ? 'bg-purple-900 text-white shadow-2xs'
                                          : 'bg-stone-900 text-white shadow-2xs'
                                        : 'text-stone-600 hover:bg-stone-100'
                                    }`}
                                    title={mins <= 30 ? 'Allocate less time for lower interest venue' : `${mins} minutes`}
                                  >
                                    {mins}m
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Booking Advice Card with Lock Slot button */}
                          {stop.appointmentBookingAdvice && (
                            <div className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                              stop.isLockedTime
                                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                                : 'bg-amber-50/70 border-amber-200 text-amber-950'
                            }`}>
                              <div className="flex items-start gap-2.5">
                                {stop.isLockedTime ? (
                                  <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                ) : (
                                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                )}
                                <div className="space-y-0.5">
                                  <strong className="font-bold text-xs block text-stone-900">
                                    {stop.isLockedTime ? 'Appointment Confirmed with Venue:' : 'Booking Recommendation for Venue Coordinator:'}
                                  </strong>
                                  <p className="text-[11px] text-stone-700 leading-relaxed">
                                    {stop.appointmentBookingAdvice}
                                  </p>
                                </div>
                              </div>

                              {!stop.isLockedTime && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSetLockedTime(stop.venueId, stop.suggestedArrivalTime);
                                    const updatedLocked = {
                                      ...tourForm.lockedAppointmentTimes,
                                      [stop.venueId]: stop.suggestedArrivalTime,
                                    };
                                    const startLoc = tourForm.primarySide === 'groom' ? tourForm.groomAddress : tourForm.brideAddress;
                                    const secondLoc = tourForm.primarySide === 'groom' ? tourForm.brideAddress : tourForm.groomAddress;
                                    const selectedVenues = venues.filter((v) => tourForm.selectedVenueIds.includes(v.id));
                                    const plan = generateSiteTourSchedule({
                                      weddingId: wedding?.id || 'w-user-1',
                                      tourDate: tourForm.tourDate,
                                      startLocation: startLoc,
                                      secondFamilyLocation: secondLoc,
                                      meetingMode: tourForm.meetingMode,
                                      venues: selectedVenues,
                                      dayStartTime: tourForm.dayStartTime,
                                      startTimePlanningMode: tourForm.startTimePlanningMode,
                                      durationPerTourMinutes: tourForm.durationPerTourMinutes,
                                      customVenueDurations: tourForm.customVenueDurations,
                                      bufferBetweenToursMinutes: tourForm.bufferBetweenToursMinutes,
                                      includesLunchBreak: tourForm.includesLunchBreak,
                                      lockedAppointmentTimes: updatedLocked,
                                    });
                                    saveTourPlan(plan);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-[10px] shrink-0 shadow-2xs flex items-center gap-1 transition-colors"
                                  title="Lock this recommended time slot once confirmed"
                                >
                                  <Lock className="w-3 h-3 text-amber-700" />
                                  <span>Lock slot</span>
                                </button>
                              )}
                            </div>
                          )}

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
      {/* TAB 4: SANGEET & PRE-WEDDING VENUES TRIANGULATION             */}
      {/* ============================================================= */}
      {activeTab === 'sangeet' && (
        <SangeetTriangulationSection
          initialGroomAddress={tourForm.groomAddress}
          initialBrideAddress={tourForm.brideAddress}
          onOpenAddressBook={() => setIsAddressBookModalOpen(true)}
        />
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

      {/* Profile Address Book Modal */}
      <ProfileAddressBookModal
        isOpen={isAddressBookModalOpen}
        onClose={() => setIsAddressBookModalOpen(false)}
        savedAddresses={savedAddresses}
        userEmail={user?.email}
        onSelectAddress={handleSelectAddressForSide}
        onDeleteAddress={deleteAddress}
        onUpdateDetails={updateAddressDetails}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Custom Venue Quote & Available Dates Modal */}
      <VenueCustomQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setQuoteModalVenue(null);
        }}
        venue={quoteModalVenue}
        existingQuote={quoteModalVenue ? getUserVenueQuote(quoteModalVenue.id) : undefined}
        planningGuestCount={planningGuestCount}
        onSaveQuote={saveUserVenueQuote}
        onDeleteQuote={deleteUserVenueQuote}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Verified Reddit Pricing Intelligence & Day-of-Week Variance Modal */}
      {inspectingPricingVenue && inspectingPricingVenue.historicalPricingIntelligence && (
        <Modal
          isOpen={!!inspectingPricingVenue}
          onClose={() => setInspectingPricingVenue(null)}
          title={inspectingPricingVenue.name}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs text-stone-800 max-h-[75vh] overflow-y-auto pr-1">
            {/* Top Identity Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                  📍 {inspectingPricingVenue.city}, {inspectingPricingVenue.state}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                  Tier: {inspectingPricingVenue.historicalPriceTier}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white text-stone-700 border border-stone-200">
                  {inspectingPricingVenue.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-amber-950 font-medium">
                Verified Historical Contract Intelligence &amp; Day-of-Week Pricing Variance (Researched from r/DesiWeddings &amp; r/WedditNYC)
              </p>
            </div>

            {/* Day-of-Week Pricing Variance Table */}
            <div>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Day-of-Week Pricing Variance &amp; Guest Minimums</span>
              </h4>
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200">
                {/* Saturday */}
                <div className="p-3 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">Peak Saturday Evening</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 text-amber-950">
                        Peak Benchmark
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Strict Minimum: <strong>{inspectingPricingVenue.historicalPricingIntelligence.saturdayMinGuestCount} guests</strong>
                    </div>
                  </div>
                  <div className="font-bold text-amber-900 text-xs sm:text-sm font-mono shrink-0">
                    {inspectingPricingVenue.historicalPricingIntelligence.peakSaturdayRate}
                  </div>
                </div>

                {/* Friday */}
                <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">Friday Evening</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900">
                        Save ~20% – 25%
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Reduced Minimum: <strong>{inspectingPricingVenue.historicalPricingIntelligence.fridayMinGuestCount} guests</strong>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-800 text-xs sm:text-sm font-mono shrink-0">
                    {inspectingPricingVenue.historicalPricingIntelligence.fridayRate}
                  </div>
                </div>

                {/* Sunday */}
                <div className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">Sunday Slot (Day or Evening)</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        Save ~18% – 22%
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Reduced Minimum: <strong>{inspectingPricingVenue.historicalPricingIntelligence.sundayMinGuestCount} guests</strong>
                    </div>
                  </div>
                  <div className="font-bold text-stone-800 text-xs sm:text-sm font-mono shrink-0">
                    {inspectingPricingVenue.historicalPricingIntelligence.sundayRate}
                  </div>
                </div>

                {/* Weekday */}
                {inspectingPricingVenue.historicalPricingIntelligence.weekdayRate && (
                  <div className="p-3 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-700">Weekday (Mon – Thu)</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-700">
                          Deepest Discount
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">Ideal for pre-wedding Pujas or Sangeets</div>
                    </div>
                    <div className="font-bold text-stone-700 text-xs sm:text-sm font-mono shrink-0">
                      {inspectingPricingVenue.historicalPricingIntelligence.weekdayRate}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seasonal Variance */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Seasonal Variance &amp; Off-Peak Windows</span>
              </div>
              <div className="text-stone-700 text-[11px] leading-relaxed">
                <div>• <strong className="text-stone-900">Peak Season:</strong> {inspectingPricingVenue.historicalPricingIntelligence.peakSeasonMonths}</div>
                <div>• <strong className="text-stone-900">Off-Peak Window:</strong> {inspectingPricingVenue.historicalPricingIntelligence.offPeakSeasonDiscount}</div>
              </div>
            </div>

            {/* Verified Reddit Community Quotes */}
            <div>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Real Couples&apos; Reddit Quotes &amp; Historical Contract Reports</span>
              </h4>
              <div className="space-y-2">
                {inspectingPricingVenue.historicalPricingIntelligence.realCouplesRedditQuotes.map((quote, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-stone-800 italic leading-relaxed">
                    &ldquo;{quote.replace(/^"|"$/g, '')}&rdquo;
                  </div>
                ))}
              </div>
            </div>

            {/* Fine Print, Hidden Surcharges & Outside Catering */}
            {inspectingPricingVenue.historicalPricingIntelligence.hiddenFeesAndSurcharges.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-950 text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Fine Print, Surcharges &amp; Catering Royalties</span>
                </div>
                <ul className="space-y-1 text-stone-700 text-[11px]">
                  {inspectingPricingVenue.historicalPricingIntelligence.hiddenFeesAndSurcharges.map((surcharge, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-700 font-bold">•</span>
                      <span>{surcharge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insider Negotiation Tips */}
            {inspectingPricingVenue.historicalPricingIntelligence.insiderNegotiationTips.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-[11px] uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  <span>How to Negotiate &amp; Save Money with This Venue</span>
                </div>
                <ul className="space-y-1 text-stone-800 text-[11px]">
                  {inspectingPricingVenue.historicalPricingIntelligence.insiderNegotiationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-700 font-bold">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectingPricingVenue(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {inspectingPricingVenue.contactPhone && (
                  <a
                    href={`tel:${inspectingPricingVenue.contactPhone}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5 text-stone-600" />
                    <span>Call Venue</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const v = inspectingPricingVenue;
                    setInspectingPricingVenue(null);
                    handleOpenQuoteModal(v);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 hover:opacity-95 text-white font-bold shadow-sm flex items-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Log My Custom Quote / Dates</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
