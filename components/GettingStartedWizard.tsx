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
} from 'lucide-react';
import { SubEventType, RequirementCategory, EventChecklistItem, WeddingEvent } from '@/lib/types';
import { EVENT_BLUEPRINTS, EventBlueprint } from '@/lib/eventBlueprints';

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
      if (blueprint) {
        initial[type] = blueprint.decisions.map((d) => ({
          title: d.title,
          category: d.category,
          checked: true,
          notes: d.tip || d.description,
        }));
      }
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
        if (bp) {
          setDecisionsByEvent((prev) => ({
            ...prev,
            [type]: bp.decisions.map((d) => ({
              title: d.title,
              category: d.category,
              checked: true,
              notes: d.tip || d.description,
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
      const decisions = decisionsByEvent[type] || bp.decisions.map((d) => ({
        title: d.title,
        category: d.category,
        checked: true,
        notes: d.tip,
      }));

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
                  if (!bp) return null;
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
                          {bp.decisions.length} Critical Decisions
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
                  if (!bp) return null;
                  const decisions = decisionsByEvent[type] || bp.decisions.map((d) => ({
                    title: d.title,
                    category: d.category,
                    checked: true,
                    notes: d.tip,
                  }));

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
