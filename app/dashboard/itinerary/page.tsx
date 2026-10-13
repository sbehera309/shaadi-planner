'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { WeddingEvent, SubEventType } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  Trash2,
  Edit2,
  Share2,
} from 'lucide-react';

export default function ItineraryPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useWedding();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null);

  // Form State
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

  const handleOpenAdd = () => {
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

  const handleOpenEdit = (event: WeddingEvent) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      updateEvent(editingEvent.id, formData);
    } else {
      addEvent(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Multi-Event Itinerary & Muhurat
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Plan multi-day traditional rituals, auspicious muhurats, dress codes, and event run-of-show.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Wedding Ceremony</span>
        </button>
      </div>

      {/* Events Timeline List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Header Banner */}
            <div className={`p-6 bg-gradient-to-r ${event.bannerGradient} text-white`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white">
                  Event {index + 1}: {event.type}
                </span>
                <div className="flex items-center gap-1.5 bg-black/20 rounded-lg p-1">
                  <button
                    onClick={() => handleOpenEdit(event)}
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
              <h2 className="text-xl font-bold font-serif">{event.name}</h2>
              {event.muhuratTime && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-900 text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                  <span>Muhurat: {event.muhuratTime}</span>
                </div>
              )}
            </div>

            {/* Body Details */}
            <div className="p-6 space-y-4 flex-1">
              <p className="text-xs text-stone-600 leading-relaxed">{event.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-stone-900 block">Date & Timing</span>
                    <span className="text-stone-500">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
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
        ))}
      </div>

      {/* Add / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Wedding Ceremony' : 'Add New Wedding Ceremony'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              <label className="font-semibold text-stone-700 block mb-1">Auspicious Muhurat (Optional)</label>
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
            <label className="font-semibold text-stone-700 block mb-1">Dress Code & Theme Colors *</label>
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
    </div>
  );
}
