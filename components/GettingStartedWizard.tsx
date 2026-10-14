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
  Heart,
  PartyPopper,
  Clock,
  Plus,
  Trash2,
  CalendarRange,
  HelpCircle,
  Tag,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  Music,
  Sun,
  Palmtree,
  Crown,
  Building2,
  Shirt,
  UtensilsCrossed,
  Gift,
  Check,
  Lightbulb,
} from 'lucide-react';
import { SubEventType, RequirementCategory, EventChecklistItem, WeddingEvent } from '@/lib/types';
import {
  EVENT_BLUEPRINTS,
  EventBlueprint,
  CHRONOLOGICAL_EVENT_TYPES,
  sortEventTypesChronologically,
} from '@/lib/eventBlueprints';

interface WizardDecisionItem {
  id?: string;
  title: string;
  category: RequirementCategory;
  checked: boolean;
  isItemToGet?: boolean;
  notes?: string;
  subItems?: { id: string; title: string; completed: boolean }[];
}

interface GettingStartedWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GettingStartedWizard: React.FC<GettingStartedWizardProps> = ({
  isOpen,
  onClose,
}) => {
  const { initializeGuidedWedding } = useWedding();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Couple & Target Window State
  const [datesNotFinalized, setDatesNotFinalized] = useState(true);
  const [tentativeTimeframe, setTentativeTimeframe] = useState('Fall 2026');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    durationDays: 3, // Standard 3-day Indian wedding weekend (Fri-Sun)
  });

  const [profileData, setProfileData] = useState({
    brideName: '',
    groomName: '',
    city: 'New Jersey / New York Metro, USA',
    venueName: '',
    targetBudget: 150000,
    hashtag: '',
    story: '',
  });

  // Step 2: Selected Events (defaults in chronological sequence: Mehndi -> Sangeet -> Pheras -> Reception)
  const [selectedEventTypes, setSelectedEventTypes] = useState<SubEventType[]>([
    'mehendi',
    'sangeet',
    'pheras',
    'reception',
  ]);

  // Step 3: Active Event Tab for viewing & editing decisions (defaults to first chronological event)
  const [activeEventTab, setActiveEventTab] = useState<SubEventType>('mehendi');

  // Step 3: Expanded items for sub-item details (e.g. welcome bags, jewelry)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpandItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Step 3: Decisions Checklist by Event
  const [decisionsByEvent, setDecisionsByEvent] = useState<
    Record<SubEventType, WizardDecisionItem[]>
  >(() => {
    const initial: any = {};
    (['mehendi', 'sangeet', 'haldi', 'pheras', 'reception', 'roka'] as SubEventType[]).forEach((type) => {
      const blueprint = EVENT_BLUEPRINTS[type];
      if (blueprint) {
        initial[type] = blueprint.decisions.map((d) => {
          const isItem =
            d.category === 'Attire, Saafa & Jewellery' ||
            d.category === 'Puja Samagri & Rituals' ||
            d.title.toLowerCase().includes('bag') ||
            d.title.toLowerCase().includes('favor') ||
            d.title.toLowerCase().includes('saafa') ||
            d.title.toLowerCase().includes('samagri') ||
            d.title.toLowerCase().includes('milni');

          return {
            id: d.id,
            title: d.title,
            category: d.category,
            checked: true,
            isItemToGet: isItem,
            notes: d.tip || d.description,
            subItems: d.subItems ? d.subItems.map((s) => ({ ...s })) : undefined,
          };
        });
      }
    });
    return initial;
  });

  // Quick custom item input per event in Step 3
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<RequirementCategory>('Decor, Props & Staging');

  if (!isOpen) return null;

  // Helper to handle date range selection easily
  const handleStartDateChange = (newStart: string) => {
    if (!newStart) {
      setDateRange({ ...dateRange, startDate: '', endDate: '' });
      return;
    }
    const startObj = new Date(newStart);
    if (!isNaN(startObj.getTime())) {
      const endObj = new Date(startObj);
      endObj.setDate(endObj.getDate() + (dateRange.durationDays - 1));
      const endStr = endObj.toISOString().split('T')[0];
      setDateRange({ ...dateRange, startDate: newStart, endDate: endStr });
    } else {
      setDateRange({ ...dateRange, startDate: newStart });
    }
  };

  const handleDurationChange = (days: number) => {
    if (dateRange.startDate) {
      const startObj = new Date(dateRange.startDate);
      if (!isNaN(startObj.getTime())) {
        const endObj = new Date(startObj);
        endObj.setDate(endObj.getDate() + (days - 1));
        const endStr = endObj.toISOString().split('T')[0];
        setDateRange({ startDate: dateRange.startDate, endDate: endStr, durationDays: days });
        return;
      }
    }
    setDateRange({ ...dateRange, durationDays: days });
  };

  const toggleEventType = (type: SubEventType) => {
    if (selectedEventTypes.includes(type)) {
      if (selectedEventTypes.length === 1) {
        alert('Please select at least one wedding event.');
        return;
      }
      const updated = sortEventTypesChronologically(selectedEventTypes.filter((t) => t !== type));
      setSelectedEventTypes(updated);
      if (activeEventTab === type && updated.length > 0) {
        setActiveEventTab(updated[0]);
      }
    } else {
      const updated = sortEventTypesChronologically([...selectedEventTypes, type]);
      setSelectedEventTypes(updated);
      setActiveEventTab(type);

      if (!decisionsByEvent[type]) {
        const bp = EVENT_BLUEPRINTS[type];
        if (bp) {
          setDecisionsByEvent((prev) => ({
            ...prev,
            [type]: bp.decisions.map((d) => ({
              id: d.id,
              title: d.title,
              category: d.category,
              checked: true,
              isItemToGet:
                d.category === 'Attire, Saafa & Jewellery' ||
                d.category === 'Puja Samagri & Rituals' ||
                d.title.toLowerCase().includes('bag') ||
                d.title.toLowerCase().includes('favor') ||
                d.title.toLowerCase().includes('saafa'),
              notes: d.tip || d.description,
              subItems: d.subItems ? d.subItems.map((s) => ({ ...s })) : undefined,
            })),
          }));
        }
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

  const toggleWizardSubItem = (eventType: SubEventType, itemIdx: number, subItemId: string) => {
    setDecisionsByEvent((prev) => {
      const items = [...(prev[eventType] || [])];
      const target = items[itemIdx];
      if (!target || !target.subItems) return prev;
      const updatedSub = target.subItems.map((s) =>
        s.id === subItemId ? { ...s, completed: !s.completed } : s
      );
      items[itemIdx] = { ...target, subItems: updatedSub };
      return { ...prev, [eventType]: items };
    });
  };

  const handleAddCustomItem = (eventType: SubEventType) => {
    if (!newCustomTitle.trim()) return;
    setDecisionsByEvent((prev) => {
      const existing = prev[eventType] || [];
      return {
        ...prev,
        [eventType]: [
          ...existing,
          {
            title: newCustomTitle.trim(),
            category: newCustomCategory,
            checked: true,
            isItemToGet: true,
            notes: 'Custom item added during setup',
          },
        ],
      };
    });
    setNewCustomTitle('');
  };

  const handleFinishWizard = () => {
    const bride = profileData.brideName.trim() || 'Bride';
    const groom = profileData.groomName.trim() || 'Groom';
    const defaultHashtag =
      profileData.hashtag.trim() ||
      `#${groom.replace(/\s+/g, '')}Ki${bride.replace(/\s+/g, '')}`;

    const startDate = datesNotFinalized ? '' : dateRange.startDate;
    const endDate = datesNotFinalized ? '' : dateRange.endDate || dateRange.startDate;

    // Build the events list in guaranteed chronological order: Roka -> Mehndi -> Haldi -> Sangeet -> Pheras -> Reception
    const orderedTypes = sortEventTypesChronologically(selectedEventTypes);
    const builtEvents: Array<Omit<WeddingEvent, 'id' | 'weddingId'>> = orderedTypes.map((type, idx) => {
      const bp = EVENT_BLUEPRINTS[type];
      const decisions = decisionsByEvent[type] || bp.decisions.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        checked: true,
        notes: d.tip,
        subItems: d.subItems,
      }));

      const checklistItems: EventChecklistItem[] = decisions
        .filter((d) => d.checked)
        .map((d, itemIdx) => ({
          id: `c-w-${idx}-${itemIdx}`,
          title: d.title,
          category: d.category,
          isArranged: false,
          notes: d.notes,
          subItems: d.subItems ? d.subItems.map((s) => ({ ...s })) : undefined,
        }));

      const hasWelcomeBags = decisions.some(
        (d) => d.checked && d.title.toLowerCase().includes('welcome bag')
      );
      const hasWelcomeDinner = decisions.some(
        (d) =>
          d.checked &&
          (d.title.toLowerCase().includes('welcome hospitality') ||
            d.title.toLowerCase().includes('hotel room block'))
      );

      return {
        name: bp.name,
        type: bp.type,
        date: startDate || '', // Dates can be empty if scouting venues
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
        hotelBlockName:
          type === 'pheras' || type === 'reception'
            ? profileData.venueName
              ? `${profileData.venueName} & Room Block`
              : 'Partner Hotel Room Block'
            : undefined,
        hasWelcomeBags,
        hasWelcomeDinner,
        checklist: checklistItems,
      };
    });

    initializeGuidedWedding({
      profile: {
        brideName: bride,
        groomName: groom,
        slug: `${groom.toLowerCase()}-weds-${bride.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-'),
        startDate: startDate,
        endDate: endDate,
        city: profileData.city,
        venueName: profileData.venueName.trim() || 'Celebration Venue (Scouting in progress)',
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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-stone-900 font-serif">
                  Wedding Planning Starter Guide
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  Step {currentStep} of 3:{' '}
                  {currentStep === 1
                    ? 'Couple & Celebration Window'
                    : currentStep === 2
                    ? 'Select Celebrations to Host'
                    : 'Event Decisions & Items to Get'}
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
          {/* STEP 1: Couple & Flexible Date Window */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/70 flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">Welcome to Your Wedding Setup</h4>
                  <p className="text-xs text-rose-900 leading-relaxed mt-0.5">
                    Enter the couple's names to get started. In the early planning phase, couples frequently compare venue dates before locking them in—so dates and venue bookings are completely optional right now!
                  </p>
                </div>
              </div>

              {/* Names Row */}
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
              </div>

              {/* CELEBRATION DATES: Flexible Unified Range Component */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-stone-900 text-xs">
                      Celebration Dates & Weekend Window (Optional)
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Not locked into dates yet? No problem!
                  </span>
                </div>

                {/* Option 1: Dates not finalized toggle */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-200">
                  <input
                    type="checkbox"
                    id="datesNotFinalized"
                    checked={datesNotFinalized}
                    onChange={(e) => setDatesNotFinalized(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-700 focus:ring-rose-500 border-stone-300 cursor-pointer"
                  />
                  <label htmlFor="datesNotFinalized" className="text-xs font-semibold text-stone-800 cursor-pointer flex-1">
                    Dates not finalized yet • Currently scouting venues and comparing auspicious weekends
                  </label>
                </div>

                {/* If dates not finalized: show tentative season/timeframe input */}
                {datesNotFinalized ? (
                  <div className="pl-1 text-xs">
                    <label className="font-semibold text-stone-600 block mb-1">
                      Tentative Season / Target Timeframe (Optional)
                    </label>
                    <input
                      type="text"
                      value={tentativeTimeframe}
                      onChange={(e) => setTentativeTimeframe(e.target.value)}
                      placeholder="e.g. Fall 2026, Thanksgiving Weekend 2026, or Spring 2027"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-xs"
                    />
                  </div>
                ) : (
                  /* If dates are known: sleek unified Date Range selector */
                  <div className="space-y-3 animate-in fade-in duration-150 pt-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-stone-500 font-medium">Quick Weekend Presets:</span>
                      {[
                        { label: '1 Day Ceremony', days: 1 },
                        { label: '2 Days', days: 2 },
                        { label: '3 Days (Fri-Sun Weekend)', days: 3 },
                        { label: '4 Days (Thu-Sun Multi-Day)', days: 4 },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => handleDurationChange(preset.days)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            dateRange.durationDays === preset.days
                              ? 'bg-rose-700 text-white'
                              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">
                          Celebration Start Date (e.g. Mehndi / Welcome)
                        </label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-stone-700 block mb-1">
                          Celebration End Date (e.g. Reception)
                        </label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                        />
                      </div>
                    </div>

                    {dateRange.startDate && dateRange.endDate && (
                      <div className="text-[11px] text-amber-900 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/70 inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>
                          {dateRange.durationDays}-day celebration window from{' '}
                          {new Date(dateRange.startDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          to{' '}
                          {new Date(dateRange.endDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* City & Budget (USD) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Target Location / US Metro (Optional)</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="e.g. New Jersey / New York Metro, USA"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Estimated Overall Budget ($ USD)</label>
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
              </div>
            </div>
          )}

          {/* STEP 2: Pick Which Events To Do */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 flex items-start gap-3">
                <PartyPopper className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Which Ceremonies Are You Planning to Host?</h4>
                  <p className="text-xs text-amber-900 leading-relaxed mt-0.5">
                    Select your ceremonies in chronological order — starting with events that happen first and finishing with the reception on the last day. In the next step, you can customize decisions and essentials for each event!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CHRONOLOGICAL_EVENT_TYPES.map((type, index) => {
                  const bp = EVENT_BLUEPRINTS[type];
                  if (!bp) return null;
                  const isSelected = selectedEventTypes.includes(type);

                  return (
                    <div
                      key={type}
                      onClick={() => toggleEventType(type)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/40 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300 opacity-80'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-sans">
                              {type.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-sans">
                              #{index + 1} • {bp.timelinePhase}
                            </span>
                            {type === 'reception' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 font-sans">
                                Finale • Last Day
                              </span>
                            )}
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
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
                        <span className="font-bold text-rose-800">
                          {bp.decisions.length} Decisions & Essentials
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Event-by-Event Interactive Decisions & Essentials Guide */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Guidance Callout */}
              <div className="bg-gradient-to-r from-rose-50/80 via-amber-50/50 to-orange-50/60 p-4 sm:p-5 rounded-2xl border border-rose-200/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    Customize Decisions & Essentials for Each Ceremony
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed mt-0.5">
                    Click any ceremony tab below to review decisions for that event (venues, sound curfews, catering, attire, and decor). Expand any item to customize the deep details like hotel welcome bags and jewelry packing!
                  </p>
                </div>
              </div>

              {/* Event Tabs Switcher in Chronological Sequence */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {sortEventTypesChronologically(selectedEventTypes).map((type, idx) => {
                  const bp = EVENT_BLUEPRINTS[type];
                  const isActive = activeEventTab === type;
                  const decisions = decisionsByEvent[type] || [];
                  const count = decisions.filter((d) => d.checked).length;

                    const renderIcon = () => {
                      const iconClass = `w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-stone-500'}`;
                      switch (type) {
                        case 'pheras':
                          return <Flame className={iconClass} />;
                        case 'sangeet':
                          return <Music className={iconClass} />;
                        case 'reception':
                          return <Sparkles className={iconClass} />;
                        case 'mehendi':
                          return <Palmtree className={iconClass} />;
                        case 'haldi':
                          return <Sun className={iconClass} />;
                        case 'roka':
                          return <Crown className={iconClass} />;
                        default:
                          return <Sparkles className={iconClass} />;
                      }
                    };

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setActiveEventTab(type)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                          isActive
                            ? 'bg-rose-950 text-white shadow-md shadow-rose-950/25 ring-2 ring-rose-500/50'
                            : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 shadow-2xs'
                        }`}
                      >
                        {renderIcon()}
                        <span>{bp?.name.split('(')[0].trim() || type}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-rose-800 text-rose-100 border border-rose-700/60'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {count} items
                        </span>
                      </button>
                    );
                  })}
              </div>

              {/* Active Event Details & Checklist */}
              {activeEventTab && EVENT_BLUEPRINTS[activeEventTab] && (() => {
                const bp = EVENT_BLUEPRINTS[activeEventTab];
                const activeDecisions = decisionsByEvent[activeEventTab] || [];
                const categoriesPresent = Array.from(new Set(activeDecisions.map((d) => d.category)));

                const getCategoryMeta = (cat: RequirementCategory) => {
                  switch (cat) {
                    case 'Attire, Saafa & Jewellery':
                      return {
                        label: 'Attire, Jewelry & Groom Regalia',
                        icon: <Shirt className="w-4 h-4 text-rose-700 shrink-0" />,
                        accent: 'border-rose-200/80 bg-rose-50/30',
                      };
                    case 'Transport & Entry':
                      return {
                        label: 'Venue, Hotel Room Block & Baraat Permits',
                        icon: <Building2 className="w-4 h-4 text-amber-700 shrink-0" />,
                        accent: 'border-amber-200/80 bg-amber-50/30',
                      };
                    case 'Food, Drinks & Favors':
                      return {
                        label: 'Catering, Welcome Hospitality & Favors',
                        icon: <UtensilsCrossed className="w-4 h-4 text-emerald-700 shrink-0" />,
                        accent: 'border-emerald-200/80 bg-emerald-50/30',
                      };
                    case 'Music, Sound & FX':
                      return {
                        label: 'Music, Sound Curfew & DJ Entertainment',
                        icon: <Music className="w-4 h-4 text-purple-700 shrink-0" />,
                        accent: 'border-purple-200/80 bg-purple-50/30',
                      };
                    case 'Decor, Props & Staging':
                      return {
                        label: 'Decor, Mandap, Centerpieces & Dance Floor',
                        icon: <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />,
                        accent: 'border-amber-200/80 bg-amber-50/30',
                      };
                    case 'Puja Samagri & Rituals':
                      return {
                        label: 'Sacred Rituals, Havan & Samagri Kit',
                        icon: <Flame className="w-4 h-4 text-rose-700 shrink-0" />,
                        accent: 'border-rose-200/80 bg-rose-50/30',
                      };
                    default:
                      return {
                        label: cat,
                        icon: <Tag className="w-4 h-4 text-stone-600 shrink-0" />,
                        accent: 'border-stone-200/80 bg-stone-50/30',
                      };
                  }
                };

                return (
                  <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs space-y-5">
                    {/* Event Banner with High-Contrast Overlay */}
                    <div
                      className={`relative overflow-hidden p-5 sm:p-6 bg-gradient-to-r ${bp.bannerGradient} text-white`}
                    >
                      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                              {activeEventTab.toUpperCase()}
                            </span>
                            {bp.priorityBadge && (
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/40 border border-white/20 text-white flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-300" />
                                <span>{bp.priorityBadge.label.replace(/[🔥⚡🥂🌿💛💍🐎🚗]/g, '').trim()}</span>
                              </span>
                            )}
                            <span className="text-xs text-white/95 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-300" />
                              <span>
                                {bp.defaultTime.start} – {bp.defaultTime.end}
                              </span>
                            </span>
                          </div>
                          <h3 className="font-bold text-xl sm:text-2xl font-sans tracking-tight text-white mt-1.5">
                            {bp.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-stone-100/90 leading-relaxed mt-1 max-w-2xl font-normal">
                            {bp.description}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <span className="text-xs bg-black/40 border border-white/25 px-3.5 py-2 rounded-xl font-semibold backdrop-blur-md inline-flex items-center gap-2 text-white shadow-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>
                              {activeDecisions.filter((d) => d.checked).length} Decisions Selected
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Grouped Decisions by Category */}
                    <div className="p-4 sm:p-6 space-y-6">
                      {categoriesPresent.map((category) => {
                        const meta = getCategoryMeta(category);
                        const categoryItems = activeDecisions
                          .map((item, originalIdx) => ({ item, originalIdx }))
                          .filter(({ item }) => item.category === category);

                        if (categoryItems.length === 0) return null;

                        return (
                          <div key={category} className="space-y-3">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-stone-100">
                              <div className="p-1 rounded-md bg-stone-100">
                                {meta.icon}
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                                {meta.label}
                              </span>
                              <span className="text-[11px] font-medium text-stone-400">
                                ({categoryItems.length})
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              {categoryItems.map(({ item, originalIdx }) => {
                                const itemKey = `${activeEventTab}-${originalIdx}`;
                                const isExpanded = Boolean(expandedItems[itemKey]);

                                return (
                                  <div
                                    key={originalIdx}
                                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                                      item.checked
                                        ? 'bg-white border-stone-200/90 shadow-2xs hover:border-stone-300'
                                        : 'bg-stone-50/70 border-stone-200/50 opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={() => toggleDecisionItem(activeEventTab, originalIdx)}
                                        className="mt-1 w-4 h-4 rounded-md text-rose-700 focus:ring-rose-500 border-stone-300 cursor-pointer shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p
                                          onClick={() => toggleDecisionItem(activeEventTab, originalIdx)}
                                          className={`text-sm font-semibold cursor-pointer ${
                                            item.checked ? 'text-stone-900' : 'text-stone-400 line-through'
                                          }`}
                                        >
                                          {item.title}
                                        </p>

                                        {item.notes && (
                                          <div className="flex items-start gap-2 mt-2 text-xs text-amber-950 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/60 leading-relaxed font-normal">
                                            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                            <span>{item.notes}</span>
                                          </div>
                                        )}

                                        {/* Progressive Disclosure: Expandable Sub-items (Welcome bags, attire, jewelry, centerpieces) */}
                                        {item.subItems && item.subItems.length > 0 && (
                                          <div className="mt-3">
                                            <button
                                              type="button"
                                              onClick={() => toggleExpandItem(itemKey)}
                                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors"
                                            >
                                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                              <span>
                                                {item.subItems.filter((s) => s.completed).length} of {item.subItems.length} tasks/items completed
                                              </span>
                                              <span className="text-stone-400 font-normal">
                                                • {isExpanded ? 'Hide breakdown' : 'Click to customize details'}
                                              </span>
                                              {isExpanded ? (
                                                <ChevronUp className="w-3.5 h-3.5 text-stone-600 ml-1" />
                                              ) : (
                                                <ChevronDown className="w-3.5 h-3.5 text-stone-600 ml-1" />
                                              )}
                                            </button>

                                            {isExpanded && (
                                              <div className="mt-2.5 p-3 sm:p-4 rounded-2xl bg-stone-50/90 border border-stone-200 space-y-2.5 animate-in fade-in duration-150">
                                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500">
                                                  <span>Detailed Checklist & Packing Items:</span>
                                                  <span>{item.subItems.length} sub-items</span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                  {item.subItems.map((sub) => (
                                                    <label
                                                      key={sub.id}
                                                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-stone-200/80 hover:bg-stone-50 text-xs cursor-pointer transition-colors"
                                                    >
                                                      <input
                                                        type="checkbox"
                                                        checked={sub.completed}
                                                        onChange={() =>
                                                          toggleWizardSubItem(activeEventTab, originalIdx, sub.id)
                                                        }
                                                        className="w-4 h-4 rounded-md text-rose-700 focus:ring-rose-500 border-stone-300"
                                                      />
                                                      <span
                                                        className={
                                                          sub.completed
                                                            ? 'text-stone-400 line-through'
                                                            : 'text-stone-800 font-medium'
                                                        }
                                                      >
                                                        {sub.title}
                                                      </span>
                                                    </label>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Custom Item Row */}
                      <div className="pt-4 border-t border-stone-200">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            value={newCustomTitle}
                            onChange={(e) => setNewCustomTitle(e.target.value)}
                            placeholder={`+ Add custom decision or item to get for ${bp.name}...`}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                          />
                          <select
                            value={newCustomCategory}
                            onChange={(e) => setNewCustomCategory(e.target.value as any)}
                            className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white text-stone-800 font-medium"
                          >
                            <option value="Attire, Saafa & Jewellery">Attire & Jewellery</option>
                            <option value="Food, Drinks & Favors">Food & Favors</option>
                            <option value="Transport & Entry">Hotel & Transport</option>
                            <option value="Music, Sound & FX">Music & Sound</option>
                            <option value="Decor, Props & Staging">Decor & Staging</option>
                            <option value="Puja Samagri & Rituals">Rituals & Samagri</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleAddCustomItem(activeEventTab)}
                            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shrink-0"
                          >
                            Add Item
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
              <span>Next: {currentStep === 1 ? 'Choose Celebrations' : 'Review Event Checklists'}</span>
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
