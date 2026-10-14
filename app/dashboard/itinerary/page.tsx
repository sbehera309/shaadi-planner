'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { WeddingEvent, SubEventType, EventChecklistItem, RequirementCategory } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { EventPlanningWizard } from '@/components/EventPlanningWizard';
import { EVENT_BLUEPRINTS, EventSortOrder, sortEventsBy } from '@/lib/eventBlueprints';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Car,
  Package,
  ChevronDown,
  ChevronUp,
  Tag,
  UserCheck,
  ArrowUpDown,
} from 'lucide-react';

export default function ItineraryPage() {
  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    loadSampleTemplate,
  } = useWedding();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null);
  const [eventToPlan, setEventToPlan] = useState<WeddingEvent | null>(null);
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('priority');

  // Expanded checklist section state per event
  const [expandedChecklists, setExpandedChecklists] = useState<Record<string, boolean>>({
    'e-4': true, // Keep Baraat & Pheras expanded by default as requested!
    'e-1': true,
  });

  // Add Item Modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedEventForNewItem, setSelectedEventForNewItem] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({
    title: '',
    category: 'Transport & Entry' as RequirementCategory,
    assignedTo: '',
    notes: '',
  });

  // Form State for Event Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    type: 'sangeet' as SubEventType,
    date: '2026-11-20',
    startTime: '18:00',
    endTime: '22:00',
    muhuratTime: '',
    venueName: '',
    venueAddress: '',
    dressCode: '',
    colorTheme: '#D4AF37',
    bannerGradient: 'from-amber-600 to-rose-700',
    description: '',
    coordinatorName: '',
    coordinatorPhone: '',
  });

  const toggleChecklistExpansion = (eventId: string) => {
    setExpandedChecklists((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      type: 'sangeet',
      date: '2026-11-20',
      startTime: '18:00',
      endTime: '22:00',
      muhuratTime: '',
      venueName: '',
      venueAddress: '',
      dressCode: '',
      colorTheme: '#D4AF37',
      bannerGradient: 'from-amber-600 to-rose-700',
      description: '',
      coordinatorName: '',
      coordinatorPhone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditEvent = (event: WeddingEvent) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      type: event.type,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      muhuratTime: event.muhuratTime || '',
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      dressCode: event.dressCode,
      colorTheme: event.colorTheme,
      bannerGradient: event.bannerGradient,
      description: event.description,
      coordinatorName: event.coordinatorName,
      coordinatorPhone: event.coordinatorPhone,
    });
    setIsModalOpen(true);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        ...formData,
        checklist: editingEvent.checklist || [],
      });
    } else {
      addEvent({
        ...formData,
        checklist: [],
      });
    }
    setIsModalOpen(false);
  };

  const handleOpenAddItem = (eventId: string) => {
    setSelectedEventForNewItem(eventId);
    setNewItemData({
      title: '',
      category: 'Transport & Entry',
      assignedTo: '',
      notes: '',
    });
    setIsAddItemModalOpen(true);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEventForNewItem && newItemData.title.trim()) {
      addChecklistItem(selectedEventForNewItem, {
        title: newItemData.title.trim(),
        category: newItemData.category,
        assignedTo: newItemData.assignedTo.trim() || undefined,
        notes: newItemData.notes.trim() || undefined,
        isArranged: false,
      });
      // Make sure the event checklist is expanded
      setExpandedChecklists((prev) => ({ ...prev, [selectedEventForNewItem]: true }));
      setIsAddItemModalOpen(false);
    }
  };

  const getCategoryColor = (category: RequirementCategory) => {
    switch (category) {
      case 'Transport & Entry':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Puja Samagri & Rituals':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Decor, Props & Staging':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Music, Sound & FX':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Attire, Saafa & Jewellery':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Food, Drinks & Favors':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Multi-Event Itinerary & Essentials Tracker
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track traditional rituals, muhurat timings, and item requirements (e.g. Baraat horse/car, puja samagri, saafas, dhol squad).
          </p>
        </div>
        <button
          onClick={handleOpenAddEvent}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Wedding Ceremony</span>
        </button>
      </div>

      {/* Events Timeline List */}
      {events.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-3xl flex items-center justify-center mx-auto">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-stone-900 font-serif">No Ceremonies Scheduled Yet</h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
            Your wedding itinerary is currently clean. Add your ceremonies (Sangeet, Haldi, Baraat & Pheras, Reception) along with event essentials (car/horse, dhol squad, havan samagri).
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleOpenAddEvent}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold text-xs shadow-sm hover:opacity-95"
            >
              + Add First Ceremony
            </button>
            <button
              onClick={loadSampleTemplate}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 font-semibold text-xs border border-stone-200 transition-colors"
            >
              ✨ Load USA Wedding Template (Optional)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sorting & Prioritization Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2 text-stone-600 font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <span>Order Ceremonies By:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSortOrder('priority')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  sortOrder === 'priority'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                🏆 Planning Priority (Lead Time First)
              </button>
              <button
                type="button"
                onClick={() => setSortOrder('chronological')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  sortOrder === 'chronological'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                📅 Weekend Timeline
              </button>
              <button
                type="button"
                onClick={() => setSortOrder('needs_planning')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  sortOrder === 'needs_planning'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                ⚡ Needs Planning First
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortEventsBy(events, sortOrder).map((event, index) => {
              const checklist = event.checklist || [];
              const totalItems = checklist.length;
              const arrangedItems = checklist.filter((item) => item.isArranged).length;
              const pctArranged = totalItems > 0 ? Math.round((arrangedItems / totalItems) * 100) : 0;
              const isExpanded = expandedChecklists[event.id] ?? false;
              const blueprint = EVENT_BLUEPRINTS[event.type];

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Banner */}
                    <div className={`p-6 bg-gradient-to-r ${event.bannerGradient} text-white`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white">
                            {event.type.toUpperCase()}
                          </span>
                          {blueprint?.priorityBadge && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-xs border border-white/20 text-white">
                              {blueprint.priorityBadge.label}
                            </span>
                          )}
                        </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEventToPlan(event)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold transition-all shadow-xs"
                        title="Open step-by-step guided planning for this ceremony"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                        <span>Plan Decisions</span>
                      </button>
                      <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
                        <button
                          onClick={() => handleOpenEditEvent(event)}
                          className="p-1 hover:bg-white/20 rounded text-white/90 hover:text-white transition-colors"
                          title="Edit ceremony"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${event.name}"?`)) deleteEvent(event.id);
                          }}
                          className="p-1 hover:bg-rose-500/40 rounded text-white/90 hover:text-rose-200 transition-colors"
                          title="Delete ceremony"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold font-serif">{event.name}</h2>
                  {event.muhuratTime && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-900 text-xs font-bold shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                      <span>Muhurat: {event.muhuratTime}</span>
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-stone-600 leading-relaxed">{event.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-900 block">Date & Timing</span>
                        <span className="text-stone-500">
                          {event.date && event.date.trim() !== '' && event.date !== 'TBD' ? (
                            new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          ) : (
                            'Date to be decided'
                          )}
                        </span>
                        <span className="block text-stone-700 font-medium">
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-900 block">Venue</span>
                        <span className="text-stone-700 font-medium">{event.venueName}</span>
                        <span className="text-stone-500 block truncate">{event.venueAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dress Code Highlight */}
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                    <span className="text-xs font-bold text-rose-900 block mb-0.5">
                      👗 Dress Code & Color Palette
                    </span>
                    <span className="text-xs text-rose-800">{event.dressCode}</span>
                  </div>

                  {/* Ceremony Essentials Checklist Card */}
                  <div className="pt-2 border-t border-stone-100">
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-700" />
                          <span className="font-bold text-stone-900 text-xs font-serif">
                            Ceremony Essentials & Item Checklist
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-stone-600">
                            {arrangedItems}/{totalItems} Arranged
                          </span>
                          <button
                            onClick={() => toggleChecklistExpansion(event.id)}
                            className="p-1 rounded-md hover:bg-stone-200 text-stone-500 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mb-3">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pctArranged}%` }}
                        />
                      </div>

                      {/* Expandable items list */}
                      {isExpanded && (
                        <div className="space-y-2 mt-3 pt-2 border-t border-stone-200/60">
                          {checklist.length > 0 ? (
                            checklist.map((item) => (
                              <div
                                key={item.id}
                                className={`p-2.5 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
                                  item.isArranged
                                    ? 'bg-emerald-50/60 border-emerald-200/80'
                                    : 'bg-white border-stone-200'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                  <button
                                    onClick={() => toggleChecklistItem(event.id, item.id)}
                                    className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                                    title={item.isArranged ? 'Mark Pending' : 'Mark Arranged'}
                                  >
                                    {item.isArranged ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-stone-400" />
                                    )}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                      <span
                                        className={`font-semibold ${
                                          item.isArranged
                                            ? 'text-stone-600 line-through'
                                            : 'text-stone-900'
                                        }`}
                                      >
                                        {item.title}
                                      </span>
                                      <span
                                        className={`px-2 py-0.2 rounded-md text-[10px] font-semibold border ${getCategoryColor(
                                          item.category
                                        )}`}
                                      >
                                        {item.category}
                                      </span>
                                    </div>

                                    {item.assignedTo && (
                                      <div className="text-[11px] text-stone-500 flex items-center gap-1">
                                        <UserCheck className="w-3 h-3 text-stone-400" />
                                        <span>In Charge: {item.assignedTo}</span>
                                      </div>
                                    )}

                                    {item.notes && (
                                      <div className="text-[11px] text-stone-400 italic mt-0.5">
                                        Note: {item.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => deleteChecklistItem(event.id, item.id)}
                                  className="p-1 text-stone-300 hover:text-rose-600 transition-colors shrink-0"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-[11px] text-stone-400 italic text-center py-2">
                              No items added yet. Click below to track requirements.
                            </p>
                          )}

                          {/* Add Item Button */}
                          <button
                            onClick={() => handleOpenAddItem(event.id)}
                            className="w-full py-2 rounded-xl border border-dashed border-stone-300 hover:border-amber-500 hover:bg-amber-50/50 text-stone-600 hover:text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all mt-2"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-600" />
                            <span>Add Requirement / Essential Item</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Coordinator */}
              <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                    Family Coordinator
                  </span>
                  <span className="font-semibold text-stone-800">{event.coordinatorName}</span>
                </div>
                <a
                  href={`tel:${event.coordinatorPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-200/70 hover:bg-stone-300/80 text-stone-800 font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>{event.coordinatorPhone}</span>
                </a>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    )}

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Wedding Ceremony' : 'Add New Wedding Ceremony'}
        maxWidth="xl"
      >
        <form onSubmit={handleEventSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Ceremony Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Haldi & Phoolon Ki Holi"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Ceremony Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SubEventType })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="roka">Roka / Tilak</option>
                <option value="mehendi">Mehendi</option>
                <option value="haldi">Haldi</option>
                <option value="sangeet">Sangeet & Cocktail</option>
                <option value="pheras">Shubh Vivah (Pheras / Mandap)</option>
                <option value="baraat">Baraat</option>
                <option value="reception">Reception</option>
                <option value="custom">Custom Ritual</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Auspicious Muhurat (Optional)
              </label>
              <input
                type="text"
                value={formData.muhuratTime}
                onChange={(e) => setFormData({ ...formData, muhuratTime: e.target.value })}
                placeholder="e.g. Godhuli Bela: 17:42 - 18:25"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Venue Name *</label>
              <input
                type="text"
                required
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                placeholder="e.g. Lake Pichola Mandap Deck"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Venue Address</label>
              <input
                type="text"
                value={formData.venueAddress}
                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                placeholder="Address or Google Maps landmark"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Dress Code & Theme Colors *
            </label>
            <input
              type="text"
              required
              value={formData.dressCode}
              onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
              placeholder="e.g. Sindoori Red & Royal Gold Sherwanis"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Description / Run of Show</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ceremonial steps, dance performances, DJ cues..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Family Coordinator Name</label>
              <input
                type="text"
                value={formData.coordinatorName}
                onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                placeholder="e.g. Rohit Verma (Brother)"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Coordinator Phone</label>
              <input
                type="text"
                value={formData.coordinatorPhone}
                onChange={(e) => setFormData({ ...formData, coordinatorPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
            >
              {editingEvent ? 'Save Changes' : 'Create Ceremony'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Checklist Requirement Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Ceremony Requirement / Essential"
        maxWidth="md"
      >
        <form onSubmit={handleAddItemSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Item / Requirement Name *
            </label>
            <input
              type="text"
              required
              value={newItemData.title}
              onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
              placeholder="e.g. Decorated Ghodi / Mare or Vintage Car for Baraat"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Category *</label>
            <select
              value={newItemData.category}
              onChange={(e) =>
                setNewItemData({ ...newItemData, category: e.target.value as RequirementCategory })
              }
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="Transport & Entry">Transport & Entry (e.g. Ghodi, Vintage Car, Doli)</option>
              <option value="Puja Samagri & Rituals">Puja Samagri & Rituals (Havan, Varmala, Ghee, Gangajal)</option>
              <option value="Decor, Props & Staging">Decor, Props & Staging (Chhatri, Urli, Stage couch)</option>
              <option value="Music, Sound & FX">Music, Sound & FX (Dhol squad, Brass band, Pyro, Mics)</option>
              <option value="Attire, Saafa & Jewellery">Attire, Saafa & Jewellery (Pagdi, Mangalsutra, Sindoor)</option>
              <option value="Food, Drinks & Favors">Food, Drinks & Favors (Cake, Cocktails, Mithai boxes)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Assigned Person / In Charge
            </label>
            <input
              type="text"
              value={newItemData.assignedTo}
              onChange={(e) => setNewItemData({ ...newItemData, assignedTo: e.target.value })}
              placeholder="e.g. Vintage Wheels Vendor, Groom's Brother, Pandit Ji"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Notes / Special Instructions</label>
            <textarea
              rows={2}
              value={newItemData.notes}
              onChange={(e) => setNewItemData({ ...newItemData, notes: e.target.value })}
              placeholder="e.g. Must arrive at hotel porch by 4:00 PM with floral garland decoration"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
            >
              Add Requirement
            </button>
          </div>
        </form>
      </Modal>

      <EventPlanningWizard
        event={eventToPlan}
        isOpen={!!eventToPlan}
        onClose={() => setEventToPlan(null)}
      />
    </div>
  );
}
