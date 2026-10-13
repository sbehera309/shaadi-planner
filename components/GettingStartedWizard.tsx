'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Music,
  Heart,
  PartyPopper,
  Flame,
  Award,
  Plus,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { SubEventType, RequirementCategory, EventChecklistItem, WeddingEvent } from '@/lib/types';

interface GettingStartedWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventBlueprint {
  type: SubEventType;
  name: string;
  defaultTime: { start: string; end: string };
  bannerGradient: string;
  description: string;
  dressCode: string;
  colorTheme: string;
  venueType: string;
  keyDecisions: {
    title: string;
    category: RequirementCategory;
    notes?: string;
  }[];
}

const EVENT_BLUEPRINTS: Record<SubEventType, EventBlueprint> = {
  sangeet: {
    type: 'sangeet',
    name: 'Sangeet & Garba Celebration Night',
    defaultTime: { start: '18:30', end: '23:30' },
    bannerGradient: 'from-amber-600 via-rose-700 to-purple-800',
    description: 'High-energy music and family dance performances, DJ beats, live Chaat stations, and cocktails.',
    dressCode: 'Glamorous Indo-Western, Lehengas & Kurta Sets with Mirror Work',
    colorTheme: '#D97706',
    venueType: 'Ballroom with Hardwood Dance Floor & Sound Permit',
    keyDecisions: [
      {
        title: 'Decide Venue with Large Dance Floor & Amplified Sound Permit',
        category: 'Decor, Props & Staging',
        notes: 'Check curfew hours for live DJ & sound limits in USA municipal zones',
      },
      {
        title: 'Hire Sangeet DJ, Sound System, Intelligent Lighting & Live Dhol Squad',
        category: 'Music, Sound & FX',
        notes: 'Include wireless mics for speeches and family MCs',
      },
      {
        title: 'Confirm Food Vendor: Live Chaat Counter, Indo-Fusion Appetizers & Open Bar',
        category: 'Food, Drinks & Favors',
      },
      {
        title: 'Book Staging & LED Wall Decor with Custom Dance Floor Monogram',
        category: 'Decor, Props & Staging',
      },
      {
        title: 'Assign Sangeet Choreographer & Finalize Family Performance Order',
        category: 'Music, Sound & FX',
      },
    ],
  },
  mehendi: {
    type: 'mehendi',
    name: 'Mehndi Ceremony & Lounge',
    defaultTime: { start: '13:00', end: '17:00' },
    bannerGradient: 'from-emerald-700 to-teal-800',
    description: 'Intimate Henna ritual with folk songs, colorful lounge seating, and festive refreshments.',
    dressCode: 'Bright Jewel Tones: Parrot Green, Fuchsia Pink & Mustard',
    colorTheme: '#059669',
    venueType: 'Garden Terrace or Boutique Banquet Lounge',
    keyDecisions: [
      {
        title: 'Book Bridal Henna Artist & 2+ Fast Henna Artists for Guests',
        category: 'Attire, Saafa & Jewellery',
        notes: 'Estimate ~5-8 mins per guest hand to prevent long queues',
      },
      {
        title: 'Design Mehndi Lounge Decor: Low Seating, Bolsters & Floral Swing',
        category: 'Decor, Props & Staging',
      },
      {
        title: 'Arrange Refreshments: Masala Chai, Mocktails & Street Snacks',
        category: 'Food, Drinks & Favors',
      },
      {
        title: 'Curate Traditional Dholki Songs & Acoustic Indian Music Playlist',
        category: 'Music, Sound & FX',
      },
      {
        title: 'Prepare Guest Favors: Floral Jewelry, Bangles & Embroidered Potlis',
        category: 'Food, Drinks & Favors',
      },
    ],
  },
  haldi: {
    type: 'haldi',
    name: 'Haldi & Chooda Blessing Ritual',
    defaultTime: { start: '10:00', end: '12:30' },
    bannerGradient: 'from-amber-500 to-orange-600',
    description: 'Auspicious turmeric application with flower shower, morning brunch, and emotional blessings.',
    dressCode: 'Sunshine Yellow, Ochre & Floral Prints',
    colorTheme: '#F59E0B',
    venueType: 'Courtyard, Lawn or Poolside Area with Wash Stations',
    keyDecisions: [
      {
        title: 'Procure Organic Ubtan / Turmeric Paste, Rosewater & Traditional Brass Urli Bowl',
        category: 'Puja Samagri & Rituals',
      },
      {
        title: 'Order Fresh Marigold Petal Baskets for Floral Splash Photos',
        category: 'Decor, Props & Staging',
      },
      {
        title: 'Book Yellow Floral Backdrop & Splash-Safe Flooring Mats',
        category: 'Decor, Props & Staging',
      },
      {
        title: 'Arrange Breakfast / Brunch Catering with South/North Indian Specialties',
        category: 'Food, Drinks & Favors',
      },
      {
        title: 'Designate Changing Room & Towels for Couple Post-Haldi',
        category: 'Transport & Entry',
      },
    ],
  },
  pheras: {
    type: 'pheras',
    name: 'Baraat, Mandap Ceremony & Pheras (Wedding Day)',
    defaultTime: { start: '15:30', end: '20:30' },
    bannerGradient: 'from-rose-800 via-crimson-800 to-red-900',
    description: 'Grand groom Baraat procession, Milni, Vedic Mandap ceremony with sacred fire pheras and vows.',
    dressCode: 'Regal Traditional Heritage: Royal Crimson, Maroon, Gold & Ivory Sherwanis',
    colorTheme: '#DC2626',
    venueType: 'Grand Mandap Lawn or Palace Castle Grounds',
    keyDecisions: [
      {
        title: 'Baraat Transport Decision: Decorated Horse (Ghodi) or Vintage Car + City Street Permit',
        category: 'Transport & Entry',
        notes: 'Crucial in USA: verify local town permit for street/parking procession',
      },
      {
        title: 'Hire Live Baraat Dhol Players & Mobile Sound Truck',
        category: 'Music, Sound & FX',
      },
      {
        title: 'Order Matching Saafas (Turbans) for Ladkewale & Book Tying Specialist',
        category: 'Attire, Saafa & Jewellery',
      },
      {
        title: 'Consult Pandit Ji & Arrange Vedic Havan Kund Samagri Kit (Ghee, Camphor, Coconut)',
        category: 'Puja Samagri & Rituals',
      },
      {
        title: 'Order Fresh Lotus & Rose Varmalas (Jaimala Garlands)',
        category: 'Puja Samagri & Rituals',
      },
      {
        title: 'Assign Trusted Family Keeper for Mangalsutra, Sindoor Box & Wedding Rings',
        category: 'Attire, Saafa & Jewellery',
      },
      {
        title: 'Confirm Pure Vegetarian Traditional Wedding Feast Catering',
        category: 'Food, Drinks & Favors',
      },
    ],
  },
  reception: {
    type: 'reception',
    name: 'Black-Tie Grand Wedding Reception',
    defaultTime: { start: '19:00', end: '00:30' },
    bannerGradient: 'from-stone-900 via-zinc-900 to-slate-950',
    description: 'Formal speeches, grand couple entrance, multi-course dinner banquet, open bar, and all-night dancing.',
    dressCode: 'Black Tie Tuxedos, Sleek Suits & Designer Evening Gowns / Lehengas',
    colorTheme: '#1F2937',
    venueType: 'Luxury Hotel Ballroom / Country Club Estate',
    keyDecisions: [
      {
        title: 'Book Luxury Ballroom Venue & Design Table Seating Chart',
        category: 'Decor, Props & Staging',
      },
      {
        title: 'Finalize 4-Course Gourmet Dinner Banquet & Top-Shelf Open Bar Package',
        category: 'Food, Drinks & Favors',
      },
      {
        title: 'Order Custom 3-Tier Wedding Cake & Cake Table Floral Staging',
        category: 'Food, Drinks & Favors',
      },
      {
        title: 'Hire Reception DJ, MC for Grand Entrances, First Dance & Toasts',
        category: 'Music, Sound & FX',
      },
      {
        title: 'Coordinate Photographer / Videographer for Sunset Couple Portraits',
        category: 'Decor, Props & Staging',
      },
    ],
  },
  roka: {
    type: 'roka',
    name: 'Roka & Sagan Ceremony',
    defaultTime: { start: '11:00', end: '15:00' },
    bannerGradient: 'from-amber-700 to-yellow-800',
    description: 'Intimate family formalization of the match with Chunni ceremony, dry fruit hampers, and lunch.',
    dressCode: 'Semi-Formal Traditional / Smart Ethnic',
    colorTheme: '#B45309',
    venueType: 'Private Dining Room, Banquet Lounge or Family Residence',
    keyDecisions: [
      {
        title: 'Select Intimate Venue or Private Dining Hall for Close Families',
        category: 'Decor, Props & Staging',
      },
      {
        title: 'Prepare Gift Baskets: Silver Coins, Dry Fruits, Mithai & Sagan Envelopes',
        category: 'Food, Drinks & Favors',
      },
      {
        title: 'Coordinate Chunni & Shagun Ritual Blessings with Elders',
        category: 'Puja Samagri & Rituals',
      },
    ],
  },
  baraat: {
    type: 'baraat',
    name: 'Standalone Baraat Procession',
    defaultTime: { start: '14:30', end: '16:00' },
    bannerGradient: 'from-orange-700 to-amber-900',
    description: 'High-energy procession with groom transport, music, and welcoming milni.',
    dressCode: 'Sherwanis & Festive Attire',
    colorTheme: '#C2410C',
    venueType: 'Hotel Entrance Driveway or Designated Street Route',
    keyDecisions: [
      {
        title: 'Secure Municipality & Venue Permission for Outdoor Baraat Procession',
        category: 'Transport & Entry',
      },
      {
        title: 'Book Dhol Squad & Portable Sound System Truck',
        category: 'Music, Sound & FX',
      },
    ],
  },
  vidaai: {
    type: 'vidaai',
    name: 'Vidaai & Doli Farewell',
    defaultTime: { start: '20:30', end: '21:30' },
    bannerGradient: 'from-rose-950 to-stone-900',
    description: 'Emotional bride farewell ceremony with rice tossing ritual and getaway vehicle.',
    dressCode: 'Wedding Ceremony Attire',
    colorTheme: '#4C0519',
    venueType: 'Mandap Venue Exit / Portico',
    keyDecisions: [
      {
        title: 'Prepare Rice / Puffed Grain Baskets for Traditional Tossing Ritual',
        category: 'Puja Samagri & Rituals',
      },
      {
        title: 'Arrange Decorated Farewell Getaway Car (Doli Vehicle)',
        category: 'Transport & Entry',
      },
    ],
  },
  custom: {
    type: 'custom',
    name: 'Custom Celebration',
    defaultTime: { start: '18:00', end: '22:00' },
    bannerGradient: 'from-stone-800 to-stone-950',
    description: 'Personalized wedding gathering or dinner.',
    dressCode: 'Festive Attire',
    colorTheme: '#374151',
    venueType: 'Private Venue',
    keyDecisions: [
      {
        title: 'Reserve Venue & Plan Catering Menu',
        category: 'Food, Drinks & Favors',
      },
    ],
  },
};

export const GettingStartedWizard: React.FC<GettingStartedWizardProps> = ({
  isOpen,
  onClose,
}) => {
  const { initializeGuidedWedding } = useWedding();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Couple & Core Info
  const [profileData, setProfileData] = useState({
    brideName: '',
    groomName: '',
    startDate: '',
    endDate: '',
    city: 'New Jersey / New York Metro, USA',
    venueName: '',
    targetBudget: 150000,
    hashtag: '',
    story: '',
  });

  // Step 2: Selected Events (defaults to the common 4 Indian-American wedding events)
  const [selectedEventTypes, setSelectedEventTypes] = useState<SubEventType[]>([
    'mehendi',
    'sangeet',
    'pheras',
    'reception',
  ]);

  // Step 3: Decisions Checklist Customization (key: eventType, value: list of decisions)
  const [decisionsByEvent, setDecisionsByEvent] = useState<
    Record<SubEventType, { title: string; category: RequirementCategory; checked: boolean; notes?: string }[]>
  >(() => {
    const initial: any = {};
    (['mehendi', 'sangeet', 'haldi', 'pheras', 'reception', 'roka'] as SubEventType[]).forEach((type) => {
      const blueprint = EVENT_BLUEPRINTS[type];
      initial[type] = blueprint.keyDecisions.map((d) => ({
        ...d,
        checked: true,
      }));
    });
    return initial;
  });

  if (!isOpen) return null;

  const toggleEventType = (type: SubEventType) => {
    if (selectedEventTypes.includes(type)) {
      if (selectedEventTypes.length === 1) {
        alert('Please select at least one wedding event.');
        return;
      }
      setSelectedEventTypes(selectedEventTypes.filter((t) => t !== type));
    } else {
      setSelectedEventTypes([...selectedEventTypes, type]);
      // Initialize decisions for newly selected event if not present
      if (!decisionsByEvent[type]) {
        const bp = EVENT_BLUEPRINTS[type];
        setDecisionsByEvent((prev) => ({
          ...prev,
          [type]: bp.keyDecisions.map((d) => ({ ...d, checked: true })),
        }));
      }
    }
  };

  const toggleDecisionItem = (eventType: SubEventType, index: number) => {
    setDecisionsByEvent((prev) => {
      const items = [...(prev[eventType] || [])];
      if (items[index]) {
        items[index] = { ...items[index], checked: !items[index].checked };
      }
      return { ...prev, [eventType]: items };
    });
  };

  const handleFinishWizard = () => {
    const bride = profileData.brideName.trim() || 'Bride';
    const groom = profileData.groomName.trim() || 'Groom';
    const defaultHashtag =
      profileData.hashtag.trim() ||
      `#${groom.replace(/\s+/g, '')}Ki${bride.replace(/\s+/g, '')}`;

    const date = profileData.startDate || new Date().toISOString().split('T')[0];

    // Build the events list from the selected blueprints and decisions
    const builtEvents: Array<Omit<WeddingEvent, 'id' | 'weddingId'>> = selectedEventTypes.map((type, idx) => {
      const bp = EVENT_BLUEPRINTS[type];
      const decisions = decisionsByEvent[type] || bp.keyDecisions.map((d) => ({ ...d, checked: true }));

      const checklistItems: EventChecklistItem[] = decisions
        .filter((d) => d.checked)
        .map((d, itemIdx) => ({
          id: `c-w-${idx}-${itemIdx}`,
          title: d.title,
          category: d.category,
          isArranged: false,
          notes: d.notes,
        }));

      return {
        name: bp.name,
        type: bp.type,
        date: date,
        startTime: bp.defaultTime.start,
        endTime: bp.defaultTime.end,
        venueName: profileData.venueName.trim() || bp.venueType,
        venueAddress: profileData.city,
        dressCode: bp.dressCode,
        colorTheme: bp.colorTheme,
        bannerGradient: bp.bannerGradient,
        description: bp.description,
        coordinatorName: `${bride} & ${groom}`,
        coordinatorPhone: '',
        checklist: checklistItems,
      };
    });

    initializeGuidedWedding({
      profile: {
        brideName: bride,
        groomName: groom,
        slug: `${groom.toLowerCase()}-weds-${bride.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-'),
        startDate: date,
        endDate: profileData.endDate || date,
        city: profileData.city,
        venueName: profileData.venueName.trim() || 'Celebration Resort',
        targetBudget: Number(profileData.targetBudget) || 150000,
        currency: 'USD',
        hashtag: defaultHashtag,
        story: profileData.story.trim(),
        isConfigured: true,
      },
      events: builtEvents,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Wizard Header with Progress Bar */}
        <div className="p-5 sm:p-6 border-b border-stone-100 bg-stone-50/70 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-stone-900 font-serif">
                  Wedding Planning Starter Guide
                </h2>
                <p className="text-xs text-stone-500">
                  Step {currentStep} of 3: {
                    currentStep === 1
                      ? 'Couple & Details'
                      : currentStep === 2
                      ? 'Select Ceremonies'
                      : 'Key Decisions & Event Checklists'
                  }
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
              aria-label="Close guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress bar */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'bg-rose-700' : 'bg-stone-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'bg-rose-700' : 'bg-stone-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? 'bg-rose-700' : 'bg-stone-200'}`} />
          </div>
        </div>

        {/* Wizard Content Body */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 overscroll-contain">
          {/* STEP 1: Couple & Core Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/60 flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">Tell Us About Your Celebration</h4>
                  <p className="text-xs text-rose-800 leading-relaxed mt-0.5">
                    Enter the bride and groom names, celebration dates, and location in the USA. We will personalize your entire planner, budget splits, and guest invites.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Bride's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileData.brideName}
                    onChange={(e) => setProfileData({ ...profileData, brideName: e.target.value })}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Groom's Full Name *</label>
                  <input
                    type="text"
                    required
                    value={profileData.groomName}
                    onChange={(e) => setProfileData({ ...profileData, groomName: e.target.value })}
                    placeholder="e.g. Arjun Mehta"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Celebration Start Date *</label>
                  <input
                    type="date"
                    required
                    value={profileData.startDate}
                    onChange={(e) => setProfileData({ ...profileData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Celebration End Date</label>
                  <input
                    type="date"
                    value={profileData.endDate}
                    onChange={(e) => setProfileData({ ...profileData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">City / Region (USA) *</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="e.g. Somerset, NJ or Chicago, IL"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Primary Venue / Resort</label>
                  <input
                    type="text"
                    value={profileData.venueName}
                    onChange={(e) => setProfileData({ ...profileData, venueName: e.target.value })}
                    placeholder="e.g. Hyatt Regency or The Legacy Castle"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Target Budget ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-stone-500">$</span>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={profileData.targetBudget}
                      onChange={(e) => setProfileData({ ...profileData, targetBudget: Number(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Wedding Hashtag (Optional)</label>
                  <input
                    type="text"
                    value={profileData.hashtag}
                    onChange={(e) => setProfileData({ ...profileData, hashtag: e.target.value })}
                    placeholder="e.g. #ArjunKiAnanya"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pick Wedding Events */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 flex items-start gap-3">
                <PartyPopper className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Select Your Wedding Ceremonies</h4>
                  <p className="text-xs text-amber-900 leading-relaxed mt-0.5">
                    Pick which traditional ceremonies you plan to host. In the next step, we will automatically generate the essential decisions (venues, sound permits, horse/car, catering, and DJ) for each one!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['mehendi', 'sangeet', 'haldi', 'pheras', 'reception', 'roka'] as SubEventType[]).map((type) => {
                  const bp = EVENT_BLUEPRINTS[type];
                  const isSelected = selectedEventTypes.includes(type);

                  return (
                    <div
                      key={type}
                      onClick={() => toggleEventType(type)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/40 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-sans">
                            {type.toUpperCase()}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-rose-700 text-white' : 'border-2 border-stone-300'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </div>
                        </div>

                        <h3 className="font-bold text-stone-900 text-base font-serif">{bp.name}</h3>
                        <p className="text-xs text-stone-600 leading-relaxed">{bp.description}</p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <span>🕒 {bp.defaultTime.start} - {bp.defaultTime.end}</span>
                        <span className="font-medium text-rose-800">
                          {bp.keyDecisions.length} Critical Decisions
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Key Decisions & Event Checklists */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">Key Decisions Checklist for Your Chosen Events</h4>
                  <p className="text-xs text-emerald-900 leading-relaxed mt-0.5">
                    We've curated the critical decisions for each event you selected (e.g. Sangeet DJ & sound license, Baraat horse/car permit, Pandit ji samagri). Keep what you need and uncheck what doesn't apply.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {selectedEventTypes.map((type) => {
                  const bp = EVENT_BLUEPRINTS[type];
                  const decisions = decisionsByEvent[type] || bp.keyDecisions.map((d) => ({ ...d, checked: true }));

                  return (
                    <div
                      key={type}
                      className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs"
                    >
                      {/* Event Card Header */}
                      <div className={`p-4 bg-gradient-to-r ${bp.bannerGradient} text-white flex items-center justify-between`}>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20">
                            {type.toUpperCase()}
                          </span>
                          <h4 className="font-bold text-base font-serif mt-1">{bp.name}</h4>
                        </div>
                        <span className="text-xs bg-black/20 px-3 py-1 rounded-full font-medium">
                          {decisions.filter((d) => d.checked).length} Decisions Included
                        </span>
                      </div>

                      {/* Decisions Checklist Items */}
                      <div className="p-4 space-y-2.5 divide-y divide-stone-100">
                        {decisions.map((decision, dIdx) => (
                          <div
                            key={dIdx}
                            onClick={() => toggleDecisionItem(type, dIdx)}
                            className="pt-2.5 first:pt-0 flex items-start gap-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={decision.checked}
                              onChange={() => toggleDecisionItem(type, dIdx)}
                              className="mt-1 w-4 h-4 rounded text-rose-700 focus:ring-rose-500 border-stone-300 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold ${decision.checked ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                                {decision.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                                  📂 {decision.category}
                                </span>
                                {decision.notes && (
                                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 font-medium">
                                    💡 {decision.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-stone-500 hover:text-stone-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1) {
                  if (!profileData.brideName.trim() || !profileData.groomName.trim()) {
                    alert('Please enter both bride and groom names.');
                    return;
                  }
                }
                setCurrentStep((prev) => (prev + 1) as any);
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-800 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-rose-900/20 transition-all flex items-center gap-2"
            >
              <span>Next: {currentStep === 1 ? 'Choose Events' : 'Review Decisions'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishWizard}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-700 via-rose-700 to-amber-700 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-rose-900/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Generate My Custom Wedding Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
