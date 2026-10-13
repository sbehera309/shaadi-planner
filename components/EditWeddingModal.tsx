'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import { Sparkles, Heart } from 'lucide-react';

interface EditWeddingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditWeddingModal: React.FC<EditWeddingModalProps> = ({ isOpen, onClose }) => {
  const { wedding, updateWeddingProfile } = useWedding();

  const [form, setForm] = useState({
    brideName: '',
    groomName: '',
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
      setForm({
        brideName: wedding.brideName || '',
        groomName: wedding.groomName || '',
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

    updateWeddingProfile({
      brideName: bride,
      groomName: groom,
      slug: generatedSlug,
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      city: form.city.trim() || 'USA',
      venueName: form.venueName.trim() || 'Wedding Venue',
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
            Enter the couple's names and celebration dates to personalize your planning dashboard, budget allocations, and guest invitations.
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
              placeholder="e.g. Priya Patel"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Groom's Full Name *</label>
            <input
              type="text"
              required
              value={form.groomName}
              onChange={(e) => setForm({ ...form, groomName: e.target.value })}
              placeholder="e.g. Rohan Shah"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">City / Region (USA) *</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Somerset, NJ or Chicago, IL"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Primary Venue / Resort *</label>
            <input
              type="text"
              required
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
              placeholder="e.g. #PriyaKiShaadi"
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
