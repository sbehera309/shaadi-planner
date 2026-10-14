'use client';

import React, { useState, useEffect } from 'react';
import { useWedding } from '@/lib/store';
import { WeddingEvent, EventChecklistItem, RequirementCategory } from '@/lib/types';
import { EVENT_BLUEPRINTS, EventBlueprint } from '@/lib/eventBlueprints';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Music,
  CheckCircle2,
  X,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  Tag,
  AlertCircle,
  HelpCircle,
  Hotel,
  Gift,
  Shirt,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Circle,
} from 'lucide-react';

interface EventPlanningWizardProps {
  event: WeddingEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventPlanningWizard: React.FC<EventPlanningWizardProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const { updateEvent, addBudgetItem } = useWedding();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState({
    venueName: '',
    venueAddress: '',
    date: '',
    startTime: '',
    endTime: '',
    muhuratTime: '',
    dressCode: '',
    description: '',
    coordinatorName: '',
    coordinatorPhone: '',
    foodStyle: '',
    catererStatus: 'searching',
    estimatedBudget: 0,
    hotelBlockName: '',
    hasWelcomeBags: false,
    hasWelcomeDinner: false,
  });

  // Decision Checklist items
  const [checklistItems, setChecklistItems] = useState<EventChecklistItem[]>([]);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomCategory, setNewCustomCategory] = useState<RequirementCategory>('Decor, Props & Staging');

  // Load existing event data when opened
  useEffect(() => {
    if (event) {
      const blueprint: EventBlueprint | undefined = EVENT_BLUEPRINTS[event.type];

      setFormData({
        venueName: event.venueName || blueprint?.venueType || '',
        venueAddress: event.venueAddress || '',
        date: event.date || '',
        startTime: event.startTime || blueprint?.defaultTime.start || '18:00',
        endTime: event.endTime || blueprint?.defaultTime.end || '23:00',
        muhuratTime: event.muhuratTime || '',
        dressCode: event.dressCode || blueprint?.dressCode || '',
        description: event.description || blueprint?.description || '',
        coordinatorName: event.coordinatorName || '',
        coordinatorPhone: event.coordinatorPhone || '',
        foodStyle: '',
        catererStatus: 'searching',
        estimatedBudget: 0,
        hotelBlockName: event.hotelBlockName || '',
        hasWelcomeBags: event.hasWelcomeBags || false,
        hasWelcomeDinner: event.hasWelcomeDinner || false,
      });

      // If event already has checklist items, load them; otherwise pre-populate from blueprint decisions
      if (event.checklist && event.checklist.length > 0) {
        setChecklistItems(event.checklist);
      } else if (blueprint) {
        const generated = blueprint.decisions.map((d, idx) => ({
          id: `c-${event.id}-${idx}`,
          title: d.title,
          category: d.category,
          isArranged: false,
          notes: d.tip || d.description,
          subItems: d.subItems ? d.subItems.map((s) => ({ ...s })) : undefined,
        }));
        setChecklistItems(generated);
      } else {
        setChecklistItems([]);
      }

      setCurrentStep(1);
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const blueprint: EventBlueprint | undefined = EVENT_BLUEPRINTS[event.type];

  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isArranged: !item.isArranged } : item
      )
    );
  };

  const handleToggleSubItem = (itemId: string, subId: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId || !item.subItems) return item;
        const updatedSubs = item.subItems.map((s) =>
          s.id === subId ? { ...s, completed: !s.completed } : s
        );
        const allDone = updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);
        return {
          ...item,
          subItems: updatedSubs,
          isArranged: allDone ? true : item.isArranged,
        };
      })
    );
  };

  const handleAddCustomChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomTitle.trim()) return;

    const newItem: EventChecklistItem = {
      id: `c-custom-${Date.now()}`,
      title: newCustomTitle.trim(),
      category: newCustomCategory,
      isArranged: false,
    };
    setChecklistItems((prev) => [...prev, newItem]);
    setNewCustomTitle('');
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveEventPlan = () => {
    // 1. Update the event with all refined decisions and checklist
    updateEvent(event.id, {
      venueName: formData.venueName.trim() || event.venueName,
      venueAddress: formData.venueAddress.trim() || event.venueAddress,
      date: formData.date || event.date,
      startTime: formData.startTime || event.startTime,
      endTime: formData.endTime || event.endTime,
      muhuratTime: formData.muhuratTime.trim() || undefined,
      dressCode: formData.dressCode.trim() || event.dressCode,
      description: formData.description.trim() || event.description,
      coordinatorName: formData.coordinatorName.trim() || event.coordinatorName,
      coordinatorPhone: formData.coordinatorPhone.trim() || event.coordinatorPhone,
      hotelBlockName: formData.hotelBlockName.trim() || undefined,
      hasWelcomeBags: formData.hasWelcomeBags,
      hasWelcomeDinner: formData.hasWelcomeDinner,
      checklist: checklistItems,
    });

    // 2. Optionally record an estimated budget item if user provided one
    if (formData.estimatedBudget > 0) {
      addBudgetItem({
        category:
          event.type === 'sangeet'
            ? 'Music, Dhol & Entertainment'
            : event.type === 'pheras'
            ? 'Decor & Mandap'
            : event.type === 'reception'
            ? 'Venue & Catering'
            : 'Venue & Catering',
        title: `${event.name} — Budget Allocation`,
        estimatedCost: Number(formData.estimatedBudget),
        actualCost: Number(formData.estimatedBudget),
        paidAmount: 0,
        paidBy: 'split_50_50',
        dueDate: formData.date || new Date().toISOString().split('T')[0],
        status: 'pending',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header with event theme gradient */}
        <div className={`p-5 sm:p-6 bg-gradient-to-r ${blueprint?.bannerGradient || 'from-rose-800 to-amber-800'} text-white shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                {event.type.toUpperCase()} GUIDE
              </span>
              <span className="text-xs text-white/80">• Step {currentStep} of 4</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
              aria-label="Close planning assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif mt-2">{event.name}</h2>
          <p className="text-xs text-white/90 mt-1 max-w-xl leading-relaxed">
            {blueprint?.tagline || 'Plan this celebration step-by-step: venue, food, music, and key decision checklist.'}
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 3 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1.5 rounded-full transition-all ${currentStep >= 4 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 overscroll-contain">
          {/* STEP 1: Venue & Timing Setup */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Step 1: Venue & Timing Decisions</h4>
                  <p className="text-xs text-amber-900 leading-relaxed mt-0.5">
                    {event.type === 'sangeet' && 'For Sangeet, ensure the venue has adequate hardwood dance floor space and permit amplified sound past 10 PM.'}
                    {event.type === 'pheras' && 'For Baraat & Wedding, confirm outdoor procession permits with the city/hotel and open-flame clearance for the sacred Havan Kund.'}
                    {event.type === 'haldi' && 'For Haldi, ensure splash-safe outdoor lawn or easily washable patio floors.'}
                    {event.type === 'mehendi' && 'For Mehndi, book a cozy lounge or garden with comfortable seating for the bride and guests.'}
                    {event.type === 'reception' && 'For Reception, ensure the ballroom accommodates stage presentation, cake table, and all guest tables.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1.5">Venue / Hotel / Resort Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    placeholder="e.g. Hyatt Regency Ballroom or 'Venue scouting in progress'"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1.5">Venue Address / US City (Optional)</label>
                  <input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                    placeholder="e.g. Somerset, NJ (USA) or Austin, TX"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Event Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Auspicious Muhurat (Optional)</label>
                  <input
                    type="text"
                    value={formData.muhuratTime}
                    onChange={(e) => setFormData({ ...formData, muhuratTime: e.target.value })}
                    placeholder="e.g. Auspicious Pheras: 17:15 - 18:00"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                {/* Hotel Room Block & Hospitality */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-3">
                  <div className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-stone-900 text-xs">
                      Guest Hotel Room Block & Hospitality (Optional)
                    </span>
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1 text-xs">
                      Hotel Partner Name & Room Block Code
                    </label>
                    <input
                      type="text"
                      value={formData.hotelBlockName}
                      onChange={(e) => setFormData({ ...formData, hotelBlockName: e.target.value })}
                      placeholder="e.g. Westin Jersey City Newport (Group Rate Code: SHAH2026)"
                      className="w-full px-4 py-2 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs bg-white"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasWelcomeDinner}
                        onChange={(e) => setFormData({ ...formData, hasWelcomeDinner: e.target.checked })}
                        className="w-4 h-4 rounded text-rose-700 focus:ring-rose-500"
                      />
                      <span>Include Welcome Dinner / Hospitality Suite</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasWelcomeBags}
                        onChange={(e) => setFormData({ ...formData, hasWelcomeBags: e.target.checked })}
                        className="w-4 h-4 rounded text-rose-700 focus:ring-rose-500"
                      />
                      <span>In-Room Guest Welcome Bags Planned</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Food & Catering Decisions */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/70 flex items-start gap-3">
                <Utensils className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">Step 2: Food & Catering Decisions</h4>
                  <p className="text-xs text-emerald-900 leading-relaxed mt-0.5">
                    Food is the cornerstone of every Indian celebration. Specify your service style, dietary accommodations (Jain/Strict Veg), and bar packages.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Catering & Menu Concept</label>
                  <input
                    type="text"
                    value={formData.foodStyle}
                    onChange={(e) => setFormData({ ...formData, foodStyle: e.target.value })}
                    placeholder={
                      event.type === 'sangeet'
                        ? 'e.g. Live Chaat Street Stations, Indo-Fusion Sliders, Open Cocktail Bar'
                        : event.type === 'pheras'
                        ? 'e.g. Authentic Gujarati/Punjabi Pure Vegetarian Wedding Feast'
                        : event.type === 'reception'
                        ? 'e.g. 4-Course Plated Banquet Dinner, Cake, Top-Shelf Bar'
                        : 'e.g. South Indian Idli/Dosa & Fresh Chai Brunch'
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">Food Vendor Status</label>
                    <select
                      value={formData.catererStatus}
                      onChange={(e) => setFormData({ ...formData, catererStatus: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-sm"
                    >
                      <option value="searching">Still Searching / Shortlisting</option>
                      <option value="tasting">Tasting Scheduled</option>
                      <option value="contract_pending">Contract In Review</option>
                      <option value="booked">Caterer Confirmed & Booked</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">Estimated Cost for This Event ($ USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 font-bold text-stone-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={formData.estimatedBudget || ''}
                        onChange={(e) => setFormData({ ...formData, estimatedBudget: Number(e.target.value) || 0 })}
                        placeholder="e.g. 25000"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <span className="font-bold text-stone-800 block text-xs">Dietary Reminders for Indian Weddings in the USA:</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-medium">
                      🌱 Jain (No Onion, Garlic, Root Vegetables)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-medium">
                      🥦 Strict Vegetarian (Separate Serving Spoons)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-800 font-medium">
                      🍷 Open Bar & Signature Cocktails
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Entertainment, Decor & Attire */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/70 flex items-start gap-3">
                <Music className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-purple-950 text-sm">Step 3: Entertainment, Decor & Traditions</h4>
                  <p className="text-xs text-purple-900 leading-relaxed mt-0.5">
                    Define the vibe, music acts, staging visual themes, and guest attire recommendations.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Guest Dress Code Recommendation</label>
                  <input
                    type="text"
                    value={formData.dressCode}
                    onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                    placeholder="e.g. Glamorous Indo-Western, Mirror-Work Lehengas or Formal Sherwanis"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1.5">Event Description / Guest Note</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description displayed on the guest website and invitation..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">Family Coordinator Name (Point of Contact)</label>
                    <input
                      type="text"
                      value={formData.coordinatorName}
                      onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                      placeholder="e.g. Kunal Shah (Best Man)"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">Coordinator Phone Number</label>
                    <input
                      type="tel"
                      value={formData.coordinatorPhone}
                      onChange={(e) => setFormData({ ...formData, coordinatorPhone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Action Checklist & Decisions Review */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/70 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">Step 4: Decisions & Essentials Checklist</h4>
                  <p className="text-xs text-rose-900 leading-relaxed mt-0.5">
                    Check off decisions already arranged, or keep items pending as a reminder to handle before the wedding.
                  </p>
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-2.5">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 group hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => handleToggleChecklist(item.id)}
                        className="flex items-start gap-3 cursor-pointer flex-1"
                      >
                        <input
                          type="checkbox"
                          checked={item.isArranged}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="mt-1 w-4 h-4 rounded text-rose-700 focus:ring-rose-500 border-stone-300 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${item.isArranged ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                            {item.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600 font-medium">
                              {item.category}
                            </span>
                            {item.notes && (
                              <span className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-flex items-center gap-1 font-normal">
                                <Lightbulb className="w-3 h-3 text-amber-600" />
                                <span>{item.notes}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-stone-200/50 transition-colors shrink-0"
                        title="Remove decision item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Micro-tasks / Sub-items breakdown */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-stone-200/60 pl-6 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
                          <span>Packing & Detail Checklist ({item.subItems.filter((s) => s.completed).length}/{item.subItems.length}):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {item.subItems.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleToggleSubItem(item.id, sub.id)}
                              className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-[11px] transition-colors ${
                                sub.completed
                                  ? 'bg-emerald-50/80 border-emerald-200 text-stone-400 line-through'
                                  : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-100'
                              }`}
                            >
                              {sub.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                              )}
                              <span className="truncate">{sub.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Custom Decision item */}
              <form onSubmit={handleAddCustomChecklistItem} className="pt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  placeholder="+ Add another custom decision or requirement..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <select
                  value={newCustomCategory}
                  onChange={(e) => setNewCustomCategory(e.target.value as RequirementCategory)}
                  className="px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-700 bg-white"
                >
                  <option value="Decor, Props & Staging">Decor & Staging</option>
                  <option value="Food, Drinks & Favors">Food & Drinks</option>
                  <option value="Music, Sound & FX">Music & Entertainment</option>
                  <option value="Transport & Entry">Transport & Permits</option>
                  <option value="Puja Samagri & Rituals">Rituals & Puja</option>
                  <option value="Attire, Saafa & Jewellery">Attire & Jewelry</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs transition-colors shrink-0"
                >
                  Add
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 sm:p-6 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-500 hover:text-stone-700 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-800 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-rose-900/20 transition-all flex items-center gap-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveEventPlan}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-700 via-rose-700 to-amber-700 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-900/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Complete {event.name.split(' ')[0]} Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
