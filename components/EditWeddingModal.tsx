'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import { Sparkles, Heart, CalendarRange, Calendar, Check } from 'lucide-react';
import { WeddingTradition } from '@/lib/types';

interface EditWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditWeddingModal: React.FC<EditWeddingModalProps> = ({ isOpen, onClose }) => {
  const { wedding, updateWeddingProfile } = useWedding();

  const [datesNotFinalized, setDatesNotFinalized] = useState(false);
  const [form, setForm] = useState<{
    brideName: string;
    groomName: string;
    tradition: WeddingTradition;
    startDate: string;
    endDate: string;
    city: string;
    venueName: string;
    targetBudget: number;
    hashtag: string;
    story: string;
  }>({
    brideName: '',
    groomName: '',
    tradition: 'traditional_desi',
    startDate: '',
    endDate: '',
    city: '',
    venueName: '',
    targetBudget: 150000,
    hashtag: '',
    story: '',
  });

  useEffect(() => {
    if (wedding) {
      const hasStart = Boolean(wedding.startDate && wedding.startDate.trim() !== '');
      setDatesNotFinalized(!hasStart);
      setForm({
        brideName: wedding.brideName || '',
        groomName: wedding.groomName || '',
        tradition: wedding.tradition || 'traditional_desi',
        startDate: wedding.startDate || '',
        endDate: wedding.endDate || '',
        city: wedding.city || '',
        venueName: wedding.venueName || '',
        targetBudget: wedding.targetBudget || 150000,
        hashtag: wedding.hashtag || '',
        story: wedding.story || '',
      });
    }
  }, [wedding, isOpen]);

  const handleStartDateChange = (newStart: string) => {
    if (!newStart) {
      setForm((prev) => ({ ...prev, startDate: '', endDate: '' }));
      return;
    }
    const startObj = new Date(newStart);
    if (!isNaN(startObj.getTime())) {
      const endObj = new Date(startObj);
      endObj.setDate(endObj.getDate() + 2); // Default to 3-day weekend
      const endStr = endObj.toISOString().split('T')[0];
      setForm((prev) => ({ ...prev, startDate: newStart, endDate: endStr }));
    } else {
      setForm((prev) => ({ ...prev, startDate: newStart }));
    }
  };

  const handleDurationPreset = (days: number) => {
    if (form.startDate) {
      const startObj = new Date(form.startDate);
      if (!isNaN(startObj.getTime())) {
        const endObj = new Date(startObj);
        endObj.setDate(endObj.getDate() + (days - 1));
        const endStr = endObj.toISOString().split('T')[0];
        setForm((prev) => ({ ...prev, endDate: endStr }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bride = form.brideName.trim();
    const groom = form.groomName.trim();
    const generatedSlug =
      groom && bride
        ? `${groom.toLowerCase()}-weds-${bride.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-')
        : 'our-wedding';

    const defaultHashtag =
      form.hashtag.trim() ||
      (groom && bride ? `#${groom.replace(/\s+/g, '')}Ki${bride.replace(/\s+/g, '')}` : '#ShubhVivah');

    const startDate = datesNotFinalized ? '' : form.startDate;
    const endDate = datesNotFinalized ? '' : form.endDate || form.startDate;

    updateWeddingProfile({
      brideName: bride,
      groomName: groom,
      tradition: form.tradition,
      slug: generatedSlug,
      startDate: startDate,
      endDate: endDate,
      city: form.city.trim() || 'USA',
      venueName: form.venueName.trim() || 'Venue to be decided',
      targetBudget: Number(form.targetBudget) || 0,
      hashtag: defaultHashtag,
      story: form.story.trim(),
      currency: 'USD',
      isConfigured: true,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={wedding?.isConfigured ? 'Edit Wedding Details' : 'Set Up Your Wedding Profile'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Enter the couple's names, cultural tradition, and optional dates. Dates and venue bookings can be updated anytime as you compare venue availability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Bride's Full Name *</label>
            <input
              type="text"
              required
              value={form.brideName}
              onChange={(e) => setForm({ ...form, brideName: e.target.value })}
              placeholder="e.g. Ananya Sharma"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Groom's Full Name *</label>
            <input
              type="text"
              required
              value={form.groomName}
              onChange={(e) => setForm({ ...form, groomName: e.target.value })}
              placeholder="e.g. Arjun Mehta"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>
        </div>

        {/* Cultural Tradition Selector */}
        <div className="space-y-1.5">
          <label className="font-semibold text-stone-700 block">Cultural Tradition & Ceremony Style</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'traditional_desi', label: '🌟 Traditional Desi', desc: 'North Indian / Punjabi / Gujarati' },
              { id: 'south_indian', label: '🪔 South Indian', desc: 'Tamil / Telugu / Kannada / Malayalam' },
              { id: 'fusion_mixed', label: '💫 Cross-Cultural', desc: 'Blended traditions & rituals' },
            ].map((trad) => (
              <div
                key={trad.id}
                onClick={() => setForm({ ...form, tradition: trad.id as WeddingTradition })}
                className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                  form.tradition === trad.id
                    ? 'border-rose-600 bg-rose-50/60 shadow-2xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-stone-900 font-serif">{trad.label}</span>
                  {form.tradition === trad.id && <Check className="w-3 h-3 text-rose-700" />}
                </div>
                <p className="text-[10px] text-stone-500 leading-tight">{trad.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range & Flexible Option */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-700 flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-amber-700" />
              <span>Celebration Dates (Optional)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-stone-200">
            <input
              type="checkbox"
              id="editDatesNotFinalized"
              checked={datesNotFinalized}
              onChange={(e) => setDatesNotFinalized(e.target.checked)}
              className="w-4 h-4 rounded text-rose-700 focus:ring-rose-500 border-stone-300 cursor-pointer"
            />
            <label htmlFor="editDatesNotFinalized" className="text-xs font-medium text-stone-700 cursor-pointer">
              Dates not finalized yet • Comparing venue availability & ceremony dates
            </label>
          </div>

          {!datesNotFinalized && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                <span>Presets:</span>
                {[
                  { label: '1 Day', days: 1 },
                  { label: '2 Days', days: 2 },
                  { label: '3 Days (Weekend)', days: 3 },
                  { label: '4 Days', days: 4 },
                ].map((p) => (
                  <button
                    key={p.days}
                    type="button"
                    onClick={() => handleDurationPreset(p.days)}
                    className="px-2.5 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 font-medium"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-600 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">City / Region (USA)</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Somerset, NJ or Chicago, IL"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Primary Venue / Resort</label>
            <input
              type="text"
              value={form.venueName}
              onChange={(e) => setForm({ ...form, venueName: e.target.value })}
              placeholder="e.g. Hyatt Regency or The Palace"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Target Budget ($ USD)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={form.targetBudget}
              onChange={(e) => setForm({ ...form, targetBudget: Number(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Wedding Hashtag</label>
            <input
              type="text"
              value={form.hashtag}
              onChange={(e) => setForm({ ...form, hashtag: e.target.value })}
              placeholder="e.g. #ArjunKiAnanya"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-stone-700 block mb-1">Couple's Note / Story</label>
          <textarea
            rows={2}
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
            placeholder="A short note or welcome message for your families and guests..."
            className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 text-white font-semibold shadow-md flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>{wedding?.isConfigured ? 'Save Changes' : 'Create Wedding Profile'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
