'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import { PRELOADED_CURATED_VENUES } from '@/lib/preloadedVenues';
import { VenueOption } from '@/lib/types';
import {
  Building2,
  Check,
  MapPin,
  Search,
  Sparkles,
  Star,
  Calendar,
  Plus,
} from 'lucide-react';

interface QuickVenuePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickVenuePickerModal: React.FC<QuickVenuePickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { wedding, venues, events, applyVenueSelection, addEvent } = useWedding();

  const [sourceTab, setSourceTab] = useState<'shortlist' | 'directory' | 'custom'>('shortlist');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedShortlistId, setSelectedShortlistId] = useState<string | null>(null);
  const [selectedCuratedVenue, setSelectedCuratedVenue] = useState<VenueOption | null>(null);
  const [customVenue, setCustomVenue] = useState({
    name: '',
    address: '',
    city: '',
    state: 'NJ',
  });

  // Which existing events to apply this venue to (defaults to Wedding Ceremony & Reception)
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  // Starter ceremonies to auto-create when user has 0 events yet
  const [starterCeremonies, setStarterCeremonies] = useState<string[]>([
    'pheras',
    'reception',
    'sangeet',
    'haldi',
  ]);
  const [weddingDayDate, setWeddingDayDate] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Default tab: shortlist if user has shortlisted venues, otherwise directory
    if (venues.length > 0) {
      setSourceTab('shortlist');
      const currentOfficial = venues.find((v) => v.isSelectedOfficialVenue);
      setSelectedShortlistId(currentOfficial?.id || null);
    } else {
      setSourceTab('directory');
      setSelectedShortlistId(null);
    }

    setSelectedCuratedVenue(null);
    setSearchQuery('');

    // Pre-check Wedding Ceremony (Baraat/Pheras/Vidaai) & Reception events
    const primaryEvents = events.filter(
      (ev) =>
        ev.type === 'pheras' ||
        ev.type === 'baraat' ||
        ev.type === 'vidaai' ||
        ev.type === 'reception'
    );
    setSelectedEventIds(primaryEvents.map((ev) => ev.id));

    // Pre-fill date from ceremony/reception if set
    const existingPrimaryDate =
      primaryEvents.find((ev) => ev.date && ev.date !== 'TBD')?.date || '';
    setWeddingDayDate(existingPrimaryDate);

    // Pre-fill custom venue if wedding has one that isn't in shortlist
    if (
      wedding?.venueName &&
      !wedding.venueName.toLowerCase().includes('scouting') &&
      !wedding.venueName.toLowerCase().includes('decided')
    ) {
      setCustomVenue((prev) => ({
        ...prev,
        name: wedding.venueName,
        city: wedding.city || '',
      }));
    }
  }, [isOpen, venues, events, wedding]);

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return PRELOADED_CURATED_VENUES.slice(0, 12);
    return PRELOADED_CURATED_VENUES.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.state.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleEventId = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleStarterCeremony = (typeKey: string) => {
    setStarterCeremonies((prev) =>
      prev.includes(typeKey) ? prev.filter((item) => item !== typeKey) : [...prev, typeKey]
    );
  };

  const canSave =
    (sourceTab === 'shortlist' && Boolean(selectedShortlistId)) ||
    (sourceTab === 'directory' && Boolean(selectedCuratedVenue)) ||
    (sourceTab === 'custom' && customVenue.name.trim().length > 0);

  const handleSave = () => {
    if (!canSave) return;

    // Resolve chosen venue details so we can also seed starter events if events.length === 0
    let resolvedVenueName = '';
    let resolvedVenueAddress = '';
    if (sourceTab === 'shortlist' && selectedShortlistId) {
      const v = venues.find((item) => item.id === selectedShortlistId);
      if (v) {
        resolvedVenueName = v.name;
        resolvedVenueAddress = [v.address, v.city, v.state, v.zipCode].filter(Boolean).join(', ');
      }
      applyVenueSelection({
        venueId: selectedShortlistId,
        eventIds: selectedEventIds,
        eventDate: weddingDayDate || undefined,
        isPrimaryWeddingVenue: true,
      });
    } else if (sourceTab === 'directory' && selectedCuratedVenue) {
      resolvedVenueName = selectedCuratedVenue.name;
      resolvedVenueAddress = [
        selectedCuratedVenue.address,
        selectedCuratedVenue.city,
        selectedCuratedVenue.state,
        selectedCuratedVenue.zipCode,
      ]
        .filter(Boolean)
        .join(', ');
      applyVenueSelection({
        curatedVenue: selectedCuratedVenue,
        eventIds: selectedEventIds,
        eventDate: weddingDayDate || undefined,
        isPrimaryWeddingVenue: true,
      });
    } else if (sourceTab === 'custom' && customVenue.name.trim()) {
      resolvedVenueName = customVenue.name.trim();
      resolvedVenueAddress = [customVenue.address, customVenue.city, customVenue.state]
        .filter(Boolean)
        .join(', ');
      applyVenueSelection({
        customVenue: {
          name: customVenue.name.trim(),
          address: customVenue.address.trim(),
          city: customVenue.city.trim(),
          state: customVenue.state.trim(),
        },
        eventIds: selectedEventIds,
        eventDate: weddingDayDate || undefined,
        isPrimaryWeddingVenue: true,
      });
    }

    // If user had 0 events yet, auto-create their selected starter ceremonies so the calendar is immediately populated!
    if (events.length === 0 && starterCeremonies.length > 0) {
      const templates: Record<
        string,
        {
          name: string;
          type: 'pheras' | 'reception' | 'sangeet' | 'haldi' | 'mehendi';
          startTime: string;
          endTime: string;
          dressCode: string;
          usesMainVenue: boolean;
        }
      > = {
        sangeet: {
          name: 'Sangeet & Garba Night',
          type: 'sangeet',
          startTime: '18:30',
          endTime: '23:30',
          dressCode: 'Indo-Western / Lehengas & Kurtas',
          usesMainVenue: false,
        },
        haldi: {
          name: 'Haldi Ceremony',
          type: 'haldi',
          startTime: '10:30',
          endTime: '13:30',
          dressCode: 'Shades of Yellow & Marigold',
          usesMainVenue: false,
        },
        mehendi: {
          name: 'Mehendi & Chai',
          type: 'mehendi',
          startTime: '14:00',
          endTime: '18:00',
          dressCode: 'Pastels / Floral Festive',
          usesMainVenue: false,
        },
        pheras: {
          name: 'Baraat & Wedding Ceremony',
          type: 'pheras',
          startTime: '09:00',
          endTime: '13:30',
          dressCode: 'Traditional Indian Formal',
          usesMainVenue: true,
        },
        reception: {
          name: 'Cocktail Hour & Reception',
          type: 'reception',
          startTime: '18:30',
          endTime: '23:30',
          dressCode: 'Black Tie / Indian Evening Glam',
          usesMainVenue: true,
        },
      };

      starterCeremonies.forEach((key) => {
        const tpl = templates[key];
        if (!tpl) return;
        addEvent({
          name: tpl.name,
          type: tpl.type,
          date: tpl.usesMainVenue ? weddingDayDate || '' : '',
          startTime: tpl.startTime,
          endTime: tpl.endTime,
          venueName: tpl.usesMainVenue ? resolvedVenueName || 'Venue TBD' : 'Venue TBD',
          venueAddress: tpl.usesMainVenue ? resolvedVenueAddress : '',
          dressCode: tpl.dressCode,
          colorTheme: '',
          bannerGradient: 'from-rose-600 to-amber-600',
          description: '',
          coordinatorName: '',
          coordinatorPhone: '',
          checklist: [],
        });
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Wedding & Reception Venue"
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs">
        <p className="text-stone-600 leading-relaxed">
          Pick your finalized venue below. It will automatically update your wedding profile and the ceremonies you choose — while leaving your Sangeet or Haldi free to use a separate venue or date.
        </p>

        {/* Source Tabs */}
        <div className="flex p-1 rounded-xl bg-stone-100 border border-stone-200/80 gap-1">
          <button
            type="button"
            onClick={() => setSourceTab('shortlist')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all text-xs ${
              sourceTab === 'shortlist'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            My Shortlist ({venues.length})
          </button>
          <button
            type="button"
            onClick={() => setSourceTab('directory')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all text-xs ${
              sourceTab === 'directory'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            NJ / PA Directory
          </button>
          <button
            type="button"
            onClick={() => setSourceTab('custom')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all text-xs ${
              sourceTab === 'custom'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            + Custom Venue
          </button>
        </div>

        {/* Tab 1: Shortlisted Venues */}
        {sourceTab === 'shortlist' && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {venues.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-stone-300 text-center space-y-2">
                <Building2 className="w-6 h-6 text-stone-400 mx-auto" />
                <p className="font-semibold text-stone-700">No shortlisted venues yet</p>
                <p className="text-[11px] text-stone-500">
                  Switch to <strong>NJ / PA Directory</strong> or <strong>Custom Venue</strong> to set your venue right away.
                </p>
              </div>
            ) : (
              venues.map((v) => {
                const isSelected = selectedShortlistId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedShortlistId(v.id)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60 shadow-2xs'
                        : 'border-stone-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 truncate">
                          {v.name}
                        </span>
                        {v.isSelectedOfficialVenue && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {v.city}, {v.state}
                        </span>
                        {(v.rating ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-amber-700 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {v.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-rose-600 bg-rose-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Curated Directory Search */}
        {sourceTab === 'directory' && (
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by venue name or city (e.g. Legacy Castle, Rockleigh, Somerset)..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-xs"
              />
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredDirectory.map((v) => {
                const isSelected = selectedCuratedVenue?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedCuratedVenue(v)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60'
                        : 'border-stone-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-stone-900 truncate">{v.name}</div>
                      <div className="text-[11px] text-stone-500 truncate">
                        {v.address}, {v.city}, {v.state}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-rose-600 bg-rose-600 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
              {filteredDirectory.length === 0 && (
                <p className="text-center text-stone-500 py-4">
                  No matches found. Try the <strong>+ Custom Venue</strong> tab!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Custom Venue */}
        {sourceTab === 'custom' && (
          <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Venue Name *</label>
              <input
                type="text"
                value={customVenue.name}
                onChange={(e) => setCustomVenue({ ...customVenue, name: e.target.value })}
                placeholder="e.g. The Palace at Somerset Park"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Street Address (Optional)</label>
              <input
                type="text"
                value={customVenue.address}
                onChange={(e) => setCustomVenue({ ...customVenue, address: e.target.value })}
                placeholder="e.g. 333 Davidson Ave"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">City</label>
                <input
                  type="text"
                  value={customVenue.city}
                  onChange={(e) => setCustomVenue({ ...customVenue, city: e.target.value })}
                  placeholder="e.g. Somerset"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="font-semibold text-stone-700 block mb-1">State</label>
                <input
                  type="text"
                  value={customVenue.state}
                  onChange={(e) => setCustomVenue({ ...customVenue, state: e.target.value })}
                  placeholder="e.g. NJ"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ceremonies to apply + Optional Date */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-3.5">
          {events.length > 0 ? (
            <div>
              <label className="font-bold text-stone-800 block mb-1.5">
                Apply this venue to which ceremonies?
              </label>
              <div className="flex flex-wrap gap-2">
                {events.map((ev) => {
                  const checked = selectedEventIds.includes(ev.id);
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => toggleEventId(ev.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                        checked
                          ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {checked ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{ev.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Tip: Leave Sangeet or Haldi unchecked if they are at a different venue or on a different week.
              </p>
            </div>
          ) : (
            <div>
              <label className="font-bold text-stone-800 block mb-1.5">
                Which ceremonies are you hosting?
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'pheras', label: 'Wedding Ceremony (at this venue)' },
                  { key: 'reception', label: 'Reception (at this venue)' },
                  { key: 'sangeet', label: 'Sangeet / Garba' },
                  { key: 'haldi', label: 'Haldi' },
                  { key: 'mehendi', label: 'Mehendi' },
                ].map((item) => {
                  const checked = starterCeremonies.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleStarterCeremony(item.key)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                        checked
                          ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {checked ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3 h-3 text-stone-400" />
                      )}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Wedding & Reception will use this venue; Sangeet, Haldi & Mehendi will appear ready to drag onto any day on your calendar.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-amber-200/60">
            <label className="font-bold text-stone-800 flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600" />
              <span>Wedding & Reception Date (Optional)</span>
            </label>
            <input
              type="date"
              value={weddingDayDate}
              onChange={(e) => setWeddingDayDate(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              You can drag & drop or adjust any individual event date on your Overview Calendar anytime.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 disabled:opacity-40 text-white font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Confirm Venue & Update Plan</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
