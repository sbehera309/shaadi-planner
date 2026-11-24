'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import {
  WeddingEvent,
  EventChecklistItem,
  RequirementCategory,
  RsvpStatus,
  WeddingSide,
} from '@/lib/types';
import { getEventBlueprintsForTradition, EVENT_BLUEPRINTS } from '@/lib/eventBlueprints';
import {
  Calendar,
  Clock,
  MapPin,
  Shirt,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Users,
  Search,
  Sparkles,
  UserPlus,
  SlidersHorizontal,
  ListChecks,
  Check,
  Building2,
} from 'lucide-react';

interface EventDetailModalProps {
  eventId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenGuidedWizard?: (event: WeddingEvent) => void;
  onOpenVenuePicker?: () => void;
}

const CHECKLIST_CATEGORIES: RequirementCategory[] = [
  'Decor, Props & Staging',
  'Food, Drinks & Favors',
  'Music, Sound & FX',
  'Puja Samagri & Rituals',
  'Transport & Entry',
  'Attire, Saafa & Jewellery',
];

const RSVP_BADGE: Record<RsvpStatus, { label: string; cls: string }> = {
  attending: { label: 'Attending', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  invited: { label: 'Invited', cls: 'bg-amber-100 text-amber-900 border-amber-200' },
  tentative: { label: 'Tentative', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  declined: { label: 'Declined', cls: 'bg-rose-100 text-rose-800 border-rose-200' },
  not_sent: { label: 'Not Invited', cls: 'bg-stone-100 text-stone-500 border-stone-200' },
};

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  eventId,
  isOpen,
  onClose,
  onOpenGuidedWizard,
  onOpenVenuePicker,
}) => {
  const {
    wedding,
    events,
    guests,
    venues,
    officialSangeetVenue,
    isReadOnly,
    updateEvent,
    rescheduleEventDate,
    addChecklistItem,
    toggleChecklistItem,
    toggleChecklistSubItem,
    deleteChecklistItem,
    addGuest,
    updateGuestRsvp,
  } = useWedding();

  const liveEvent = useMemo(
    () => (eventId ? events.find((e) => e.id === eventId) || null : null),
    [eventId, events]
  );

  const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'guests'>('details');

  // Tab 1: Details form
  const [detailsForm, setDetailsForm] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    muhuratTime: '',
    venueName: '',
    venueAddress: '',
    dressCode: '',
    coordinatorName: '',
    coordinatorPhone: '',
    description: '',
  });
  const [savedToast, setSavedToast] = useState(false);

  // Tab 2: Checklist add form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<RequirementCategory>('Decor, Props & Staging');

  // Tab 3: Guest search, filter & quick-add
  const [guestSearch, setGuestSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | WeddingSide>('all');
  const [showQuickAddGuest, setShowQuickAddGuest] = useState(false);
  const [quickGuest, setQuickGuest] = useState({
    name: '',
    side: 'bride' as WeddingSide,
    adultsCount: 2,
    kidsCount: 0,
    city: '',
  });

  useEffect(() => {
    if (!isOpen || !liveEvent) return;
    setDetailsForm({
      name: liveEvent.name || '',
      date: liveEvent.date || '',
      startTime: liveEvent.startTime || '18:00',
      endTime: liveEvent.endTime || '23:00',
      muhuratTime: liveEvent.muhuratTime || '',
      venueName: liveEvent.venueName || '',
      venueAddress: liveEvent.venueAddress || '',
      dressCode: liveEvent.dressCode || '',
      coordinatorName: liveEvent.coordinatorName || '',
      coordinatorPhone: liveEvent.coordinatorPhone || '',
      description: liveEvent.description || '',
    });
    setSavedToast(false);
    setShowQuickAddGuest(false);
  }, [isOpen, liveEvent?.id]);

  // Quick venue suggestions
  const quickVenueChoices = useMemo(() => {
    const list: Array<{ label: string; name: string; address: string }> = [];
    if (officialSangeetVenue) {
      list.push({
        label: `⭐ Official Sangeet Venue: ${officialSangeetVenue.name}`,
        name: officialSangeetVenue.name,
        address: `${officialSangeetVenue.address}, ${officialSangeetVenue.city}, ${officialSangeetVenue.state}`,
      });
    }
    if (
      wedding?.venueName &&
      !wedding.venueName.toLowerCase().includes('scouting') &&
      !wedding.venueName.toLowerCase().includes('decided')
    ) {
      list.push({
        label: `⭐ Official Wedding Venue: ${wedding.venueName}`,
        name: wedding.venueName,
        address: wedding.city || '',
      });
    }
    venues.forEach((v) => {
      if (!list.some((i) => i.name.toLowerCase() === v.name.toLowerCase())) {
        list.push({
          label: `${v.name}${v.city ? ` (${v.city}, ${v.state})` : ''}`,
          name: v.name,
          address: [v.address, v.city, v.state].filter(Boolean).join(', '),
        });
      }
    });
    return list;
  }, [wedding, officialSangeetVenue, venues]);

  // Checklist metrics
  const checklist = liveEvent?.checklist || [];
  const arrangedCount = checklist.filter((c) => c.isArranged).length;
  const checklistPct = checklist.length > 0 ? Math.round((arrangedCount / checklist.length) * 100) : 0;

  // Guest metrics for THIS specific event
  const isGuestInvitedToEvent = (g: (typeof guests)[0], evId: string) => {
    const status = g.eventRsvps?.[evId];
    return Boolean(status && status !== 'not_sent');
  };

  const invitedGuestsForEvent = useMemo(() => {
    if (!liveEvent) return [];
    return guests.filter((g) => isGuestInvitedToEvent(g, liveEvent.id));
  }, [guests, liveEvent]);

  const invitedHeadcount = useMemo(
    () => invitedGuestsForEvent.reduce((sum, g) => sum + (g.adultsCount || 0) + (g.kidsCount || 0), 0),
    [invitedGuestsForEvent]
  );

  const filteredGuests = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();
    return guests.filter((g) => {
      if (sideFilter !== 'all' && g.side !== sideFilter) return false;
      if (q && !g.name.toLowerCase().includes(q) && !g.city?.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [guests, guestSearch, sideFilter]);

  if (!liveEvent) return null;

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    updateEvent(liveEvent.id, {
      name: detailsForm.name.trim() || liveEvent.name,
      startTime: detailsForm.startTime,
      endTime: detailsForm.endTime,
      muhuratTime: detailsForm.muhuratTime.trim(),
      venueName: detailsForm.venueName.trim(),
      venueAddress: detailsForm.venueAddress.trim(),
      dressCode: detailsForm.dressCode.trim(),
      coordinatorName: detailsForm.coordinatorName.trim(),
      coordinatorPhone: detailsForm.coordinatorPhone.trim(),
      description: detailsForm.description.trim(),
    });
    if (detailsForm.date !== liveEvent.date) {
      rescheduleEventDate(liveEvent.id, detailsForm.date);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleLoadBlueprintChecklist = () => {
    if (isReadOnly) return;
    const traditionBlueprints = getEventBlueprintsForTradition(wedding?.tradition);
    const bp = traditionBlueprints[liveEvent.type] || EVENT_BLUEPRINTS[liveEvent.type];
    if (!bp || !bp.decisions) return;
    const seeded: EventChecklistItem[] = bp.decisions.map((d, idx) => ({
      id: `c-${liveEvent.id}-${Date.now()}-${idx}`,
      title: d.title,
      category: d.category,
      isArranged: false,
      notes: d.tip || d.description,
      subItems: d.subItems ? d.subItems.map((s) => ({ ...s })) : undefined,
    }));
    updateEvent(liveEvent.id, { checklist: [...checklist, ...seeded] });
  };

  const handleAddChecklistTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !newTaskTitle.trim()) return;
    addChecklistItem(liveEvent.id, {
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      isArranged: false,
    });
    setNewTaskTitle('');
  };

  const handleToggleGuestInvite = (guestId: string, currentlyInvited: boolean) => {
    if (isReadOnly) return;
    updateGuestRsvp(guestId, liveEvent.id, currentlyInvited ? 'not_sent' : 'invited');
  };

  const handleBulkInvite = (side: 'all' | 'bride' | 'groom') => {
    if (isReadOnly) return;
    guests.forEach((g) => {
      if (side === 'all' || g.side === side) {
        if (!isGuestInvitedToEvent(g, liveEvent.id)) {
          updateGuestRsvp(g.id, liveEvent.id, 'invited');
        }
      }
    });
  };

  const handleQuickAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !quickGuest.name.trim()) return;
    addGuest({
      name: quickGuest.name.trim(),
      phone: '',
      side: quickGuest.side,
      familyGroup: quickGuest.side === 'bride' ? "Bride's Family" : quickGuest.side === 'groom' ? "Groom's Family" : 'Friends & Mutual',
      adultsCount: Number(quickGuest.adultsCount) || 1,
      kidsCount: Number(quickGuest.kidsCount) || 0,
      dietaryPreference: 'Strict Veg',
      city: quickGuest.city.trim() || 'NJ',
      needsPickup: false,
      eventRsvps: {
        [liveEvent.id]: 'invited',
      },
    });
    setQuickGuest({ name: '', side: quickGuest.side, adultsCount: 2, kidsCount: 0, city: '' });
    setShowQuickAddGuest(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={liveEvent.name}
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Top Segmented Tabs: Details | Checklist | Invited Guests */}
        <div className="flex p-1 rounded-xl bg-stone-100 border border-stone-200/80 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all inline-flex items-center justify-center gap-1.5 ${
              activeTab === 'details'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
            <span>Details &amp; Venue</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all inline-flex items-center justify-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-amber-600" />
            <span>
              Checklist ({arrangedCount}/{checklist.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guests')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all inline-flex items-center justify-center gap-1.5 ${
              activeTab === 'guests'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Guests ({invitedHeadcount})
            </span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: EVENT DETAILS, TIMING & VENUE                         */}
        {/* ============================================================ */}
        {activeTab === 'details' && (
          <form onSubmit={handleSaveDetails} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-600 block mb-1">Ceremony Name</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={detailsForm.name}
                  onChange={(e) => setDetailsForm({ ...detailsForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold disabled:bg-stone-100"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 block mb-1">Date</label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  value={detailsForm.date}
                  onChange={(e) => setDetailsForm({ ...detailsForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-medium disabled:bg-stone-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="font-semibold text-stone-600 block mb-1">Start Time</label>
                <input
                  type="time"
                  disabled={isReadOnly}
                  value={detailsForm.startTime}
                  onChange={(e) => setDetailsForm({ ...detailsForm, startTime: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 block mb-1">End Time</label>
                <input
                  type="time"
                  disabled={isReadOnly}
                  value={detailsForm.endTime}
                  onChange={(e) => setDetailsForm({ ...detailsForm, endTime: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 block mb-1">Muhurat (Optional)</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={detailsForm.muhuratTime}
                  onChange={(e) => setDetailsForm({ ...detailsForm, muhuratTime: e.target.value })}
                  placeholder="e.g. 10:42 AM"
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Venue &amp; Location</span>
                </label>
                {!isReadOnly && onOpenVenuePicker && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenVenuePicker();
                    }}
                    className="text-[11px] font-semibold text-rose-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>Browse Venues</span>
                  </button>
                )}
              </div>
              {!isReadOnly && quickVenueChoices.length > 0 && (
                <select
                  value={
                    quickVenueChoices.some(
                      (c) => c.name.toLowerCase() === detailsForm.venueName.toLowerCase()
                    )
                      ? quickVenueChoices.find(
                          (c) => c.name.toLowerCase() === detailsForm.venueName.toLowerCase()
                        )?.name || ''
                      : ''
                  }
                  onChange={(e) => {
                    const picked = quickVenueChoices.find((c) => c.name === e.target.value);
                    if (picked) {
                      setDetailsForm({
                        ...detailsForm,
                        venueName: picked.name,
                        venueAddress: picked.address,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-amber-50/50 text-stone-800 font-semibold text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">— Select Official Sangeet / Wedding / Saved Venue —</option>
                  {quickVenueChoices.map((choice, idx) => (
                    <option key={idx} value={choice.name}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={detailsForm.venueName}
                  onChange={(e) => setDetailsForm({ ...detailsForm, venueName: e.target.value })}
                  placeholder="Or type custom venue name..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold disabled:bg-stone-100"
                />
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={detailsForm.venueAddress}
                  onChange={(e) => setDetailsForm({ ...detailsForm, venueAddress: e.target.value })}
                  placeholder="Address (optional)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-600 block mb-1">Dress Code</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={detailsForm.dressCode}
                  onChange={(e) => setDetailsForm({ ...detailsForm, dressCode: e.target.value })}
                  placeholder="e.g. Shades of Yellow / Black Tie"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-600 block mb-1">Point of Contact / Coordinator</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={detailsForm.coordinatorName}
                  onChange={(e) => setDetailsForm({ ...detailsForm, coordinatorName: e.target.value })}
                  placeholder="e.g. Cousin / Planner name"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-stone-600 block mb-1">Notes &amp; Details</label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={detailsForm.description}
                onChange={(e) => setDetailsForm({ ...detailsForm, description: e.target.value })}
                placeholder="Timing notes, special performances, catering notes..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white disabled:bg-stone-100"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200">
              {onOpenGuidedWizard ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenGuidedWizard(liveEvent);
                  }}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Open Full Guided Ceremony Wizard</span>
                </button>
              ) : (
                <span />
              )}

              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  {savedToast && (
                    <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 text-white font-bold shadow-xs"
                  >
                    Save Details
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* TAB 2: CEREMONY CHECKLIST & TASKS                            */}
        {/* ============================================================ */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            {/* Progress Header */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-bold text-stone-900 text-sm">
                  {arrangedCount} of {checklist.length} Items Arranged ({checklistPct}%)
                </div>
                <div className="w-48 sm:w-64 bg-stone-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${checklistPct}%` }}
                  />
                </div>
              </div>

              {!isReadOnly && checklist.length === 0 && (
                <button
                  type="button"
                  onClick={handleLoadBlueprintChecklist}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Recommended Checklist</span>
                </button>
              )}
            </div>

            {/* Quick Add Task Form */}
            {!isReadOnly && (
              <form onSubmit={handleAddChecklistTask} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a checklist item (e.g. Confirm dhol player, Order marigold garlands)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as RequirementCategory)}
                  className="px-2.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 font-medium"
                >
                  {CHECKLIST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-bold inline-flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            )}

            {/* Checklist Items */}
            {checklist.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-stone-300 text-center space-y-2">
                <ListChecks className="w-7 h-7 text-stone-400 mx-auto" />
                <p className="font-bold text-stone-800">No checklist items yet for {liveEvent.name}</p>
                <p className="text-stone-500">
                  Add your own tasks above or load the recommended Desi ceremony checklist in one click.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                      item.isArranged
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => toggleChecklistItem(liveEvent.id, item.id)}
                        className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                      >
                        {item.isArranged ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div
                            className={`font-semibold text-xs ${
                              item.isArranged ? 'line-through text-stone-500' : 'text-stone-900'
                            }`}
                          >
                            {item.title}
                          </div>
                          <span className="text-[10px] font-semibold text-stone-400">
                            {item.category}
                          </span>
                          {item.notes && (
                            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </button>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => deleteChecklistItem(liveEvent.id, item.id)}
                          className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                          aria-label="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Sub-items if present */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="pl-6 space-y-1 border-t border-stone-100 pt-1.5">
                        {item.subItems.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => toggleChecklistSubItem(liveEvent.id, item.id, sub.id)}
                            className="flex items-center gap-2 text-[11px] text-stone-700 hover:text-stone-950 w-full text-left"
                          >
                            {sub.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                            )}
                            <span className={sub.completed ? 'line-through text-stone-400' : ''}>
                              {sub.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: EVENT-SPECIFIC GUEST INVITE LIST                      */}
        {/* ============================================================ */}
        {activeTab === 'guests' && (
          <div className="space-y-3.5">
            {/* Summary & Quick Add Row */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-bold text-stone-900 text-sm">
                  {invitedGuestsForEvent.length} Families / Units Invited • {invitedHeadcount} Total Guests
                </div>
                <p className="text-[11px] text-stone-600">
                  Toggle exactly who is invited to <strong>{liveEvent.name}</strong> (great for keeping Haldi/Mehendi intimate vs. full Reception).
                </p>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setShowQuickAddGuest(!showQuickAddGuest)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold inline-flex items-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Guest to Event</span>
                </button>
              )}
            </div>

            {/* Quick Add New Guest Form */}
            {showQuickAddGuest && !isReadOnly && (
              <form
                onSubmit={handleQuickAddGuest}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="font-bold text-stone-800">Quick-Add Guest / Family to {liveEvent.name}</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    value={quickGuest.name}
                    onChange={(e) => setQuickGuest({ ...quickGuest, name: e.target.value })}
                    placeholder="Name (e.g. Patel Family)"
                    className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
                  />
                  <select
                    value={quickGuest.side}
                    onChange={(e) => setQuickGuest({ ...quickGuest, side: e.target.value as WeddingSide })}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="bride">Bride&apos;s Side</option>
                    <option value="groom">Groom&apos;s Side</option>
                    <option value="mutual">Mutual / Friends</option>
                  </select>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      value={quickGuest.adultsCount}
                      onChange={(e) => setQuickGuest({ ...quickGuest, adultsCount: Number(e.target.value) || 1 })}
                      className="w-1/2 px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-center"
                      title="Adults"
                    />
                    <input
                      type="number"
                      min={0}
                      value={quickGuest.kidsCount}
                      onChange={(e) => setQuickGuest({ ...quickGuest, kidsCount: Number(e.target.value) || 0 })}
                      className="w-1/2 px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-center"
                      title="Kids"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddGuest(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold"
                  >
                    Add &amp; Invite
                  </button>
                </div>
              </form>
            )}

            {/* Search, Side Filter & Bulk Invite Actions */}
            {guests.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={guestSearch}
                      onChange={(e) => setGuestSearch(e.target.value)}
                      placeholder="Search guests..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                    />
                  </div>
                  <select
                    value={sideFilter}
                    onChange={(e) => setSideFilter(e.target.value as 'all' | WeddingSide)}
                    className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-semibold text-stone-700"
                  >
                    <option value="all">All Sides</option>
                    <option value="bride">Bride&apos;s Side</option>
                    <option value="groom">Groom&apos;s Side</option>
                    <option value="mutual">Mutual</option>
                  </select>
                </div>

                {!isReadOnly && (
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleBulkInvite('all')}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold"
                    >
                      Invite All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkInvite('bride')}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold"
                    >
                      + Bride Side
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkInvite('groom')}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold"
                    >
                      + Groom Side
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Guest Toggle List */}
            {guests.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-stone-300 text-center space-y-2">
                <Users className="w-7 h-7 text-stone-400 mx-auto" />
                <p className="font-bold text-stone-800">No guests in your guest list yet</p>
                <p className="text-stone-500">
                  Click <strong>Add Guest to Event</strong> above to start adding families and friends directly to {liveEvent.name}.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white max-h-[300px] overflow-y-auto">
                {filteredGuests.map((g) => {
                  const status: RsvpStatus = g.eventRsvps?.[liveEvent.id] || 'not_sent';
                  const invited = status !== 'not_sent';
                  const headcount = (g.adultsCount || 0) + (g.kidsCount || 0);

                  return (
                    <div
                      key={g.id}
                      className={`p-3 flex items-center justify-between gap-2.5 transition-colors ${
                        invited ? 'bg-emerald-50/25' : ''
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleToggleGuestInvite(g.id, invited)}
                        className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                            invited
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {invited && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 truncate">{g.name}</div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                            <span>{headcount} {headcount === 1 ? 'person' : 'people'}</span>
                            <span>•</span>
                            <span className="capitalize">{g.side} side</span>
                            {g.city && (
                              <>
                                <span>•</span>
                                <span className="truncate">{g.city}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>

                      {invited ? (
                        isReadOnly ? (
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${RSVP_BADGE[status].cls}`}
                          >
                            {RSVP_BADGE[status].label}
                          </span>
                        ) : (
                          <select
                            value={status}
                            onChange={(e) =>
                              updateGuestRsvp(g.id, liveEvent.id, e.target.value as RsvpStatus)
                            }
                            className={`px-2 py-1 rounded-lg border text-[11px] font-bold ${RSVP_BADGE[status].cls}`}
                          >
                            <option value="invited">Invited</option>
                            <option value="attending">Attending</option>
                            <option value="tentative">Tentative</option>
                            <option value="declined">Declined</option>
                            <option value="not_sent">Remove</option>
                          </select>
                        )
                      ) : (
                        <span className="text-[10px] font-semibold text-stone-400 shrink-0">
                          Not invited
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
