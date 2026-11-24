'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import { WeddingSide, RsvpStatus } from '@/lib/types';
import {
  ClipboardPaste,
  Users,
  Sparkles,
  Check,
  Plus,
  Tag,
} from 'lucide-react';

export const COMMON_GUEST_GROUPS = [
  'Bridesmaids',
  'Groomsmen',
  "Bride's Family",
  "Groom's Family",
  "Bride's Friends",
  "Groom's Friends",
  "Bride's Family Friends",
  "Groom's Family Friends",
];

export const inferSideFromGroup = (groupName: string): WeddingSide => {
  const lower = groupName.toLowerCase();
  if (lower.includes('bride') || lower.includes('bridesmaid')) return 'bride';
  if (lower.includes('groom') || lower.includes('groomsmen')) return 'groom';
  return 'mutual';
};

interface ParsedGuestEntry {
  name: string;
  adultsCount: number;
}

const parsePastedGuestList = (rawText: string): ParsedGuestEntry[] => {
  if (!rawText.trim()) return [];
  // Split by newlines first; if only 1 line and has commas, split by commas
  let lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 1 && lines[0].includes(',')) {
    lines = lines[0]
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  return lines
    .map((line) => {
      // Strip leading bullets or numbering like "1.", "1)", "-", "•", "*"
      let clean = line.replace(/^(\d+[\.\)]\s*|[-•*–—]\s*)/, '').trim();
      if (!clean) return null;

      // Detect optional headcount in parentheses or trailing xN, e.g. "Patel Family (4)" or "Shah Family x3"
      let adultsCount = 1;
      const parenMatch = clean.match(/\((\d+)\)\s*$/);
      const xMatch = clean.match(/\s+[xX](\d+)\s*$/);
      if (parenMatch) {
        adultsCount = Math.max(1, parseInt(parenMatch[1], 10));
        clean = clean.replace(/\((\d+)\)\s*$/, '').trim();
      } else if (xMatch) {
        adultsCount = Math.max(1, parseInt(xMatch[1], 10));
        clean = clean.replace(/\s+[xX](\d+)\s*$/, '').trim();
      } else if (/(&|\+| and |family|couple)/i.test(clean)) {
        // Smart default: "Rohan & Priya" or "Patel Family" -> 2 adults
        adultsCount = 2;
      }

      if (!clean) return null;
      return { name: clean, adultsCount };
    })
    .filter((entry): entry is ParsedGuestEntry => entry !== null);
};

interface BulkPasteGuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableGroups: string[];
  defaultGroup?: string;
}

export const BulkPasteGuestsModal: React.FC<BulkPasteGuestsModalProps> = ({
  isOpen,
  onClose,
  availableGroups,
  defaultGroup,
}) => {
  const { events, bulkAddGuests, addCustomGuestGroup } = useWedding();

  const [rawText, setRawText] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup || "Bride's Family");
  const [newGroupInput, setNewGroupInput] = useState('');
  const [useNewGroup, setUseNewGroup] = useState(false);
  const [side, setSide] = useState<WeddingSide>('bride');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setRawText('');
    const initialGrp = defaultGroup || "Bride's Family";
    setSelectedGroup(initialGrp);
    setSide(inferSideFromGroup(initialGrp));
    setUseNewGroup(false);
    setNewGroupInput('');
    setSelectedEventIds(events.map((e) => e.id));
  }, [isOpen, defaultGroup, events]);

  const parsedEntries = useMemo(() => parsePastedGuestList(rawText), [rawText]);
  const totalHeadcount = useMemo(
    () => parsedEntries.reduce((sum, e) => sum + e.adultsCount, 0),
    [parsedEntries]
  );

  const handleGroupPick = (grp: string) => {
    setUseNewGroup(false);
    setSelectedGroup(grp);
    setSide(inferSideFromGroup(grp));
  };

  const toggleEvent = (id: string) => {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedEntries.length === 0) return;

    const finalGroup =
      useNewGroup && newGroupInput.trim()
        ? newGroupInput.trim()
        : selectedGroup === 'Unassigned'
        ? ''
        : selectedGroup;

    if (useNewGroup && newGroupInput.trim()) {
      addCustomGuestGroup(newGroupInput.trim());
    }

    const rsvpMap: Record<string, RsvpStatus> = {};
    events.forEach((ev) => {
      rsvpMap[ev.id] = selectedEventIds.includes(ev.id) ? 'invited' : 'not_sent';
    });

    bulkAddGuests(
      parsedEntries.map((entry) => ({
        name: entry.name,
        phone: '',
        email: '',
        side,
        familyGroup: finalGroup,
        adultsCount: entry.adultsCount,
        kidsCount: 0,
        dietaryPreference: 'Strict Veg',
        city: '',
        needsPickup: false,
        eventRsvps: { ...rsvpMap },
      }))
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paste Guest List"
      maxWidth="lg"
    >
      <form onSubmit={handleImport} className="space-y-4 text-xs">
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
          <ClipboardPaste className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-amber-950 leading-relaxed">
            Paste names from Notes, WhatsApp, or Excel — <strong>one per line</strong> or comma-separated. Add optional counts like <code className="px-1 py-0.5 bg-white rounded border border-amber-200">Patel Family (4)</code>. You can click any guest card afterward to fill out phone, diet, and RSVPs.
          </div>
        </div>

        {/* Paste Textarea */}
        <div>
          <label className="font-bold text-stone-700 block mb-1.5">
            Paste Names Below *
          </label>
          <textarea
            rows={6}
            required
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Example:\nRohan & Priya Shah\nMehta Family (4)\nAnanya Patel\nVikram Desai\nKiran & Neha Joshi`}
            className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs leading-relaxed"
          />

          {/* Live Detection Preview */}
          {parsedEntries.length > 0 && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-emerald-900 inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Detected {parsedEntries.length} guest {parsedEntries.length === 1 ? 'card' : 'cards'} ({totalHeadcount} people)
                </span>
              </span>
              <div className="flex flex-wrap gap-1 max-w-full">
                {parsedEntries.slice(0, 4).map((e, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-emerald-900 text-[10px] font-semibold"
                  >
                    {e.name} ({e.adultsCount})
                  </span>
                ))}
                {parsedEntries.length > 4 && (
                  <span className="text-[10px] font-bold text-emerald-700 self-center">
                    +{parsedEntries.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Starting Group Picker */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-stone-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-rose-600" />
              <span>Assign to Group</span>
            </label>
            <button
              type="button"
              onClick={() => setUseNewGroup(!useNewGroup)}
              className="text-[11px] font-bold text-rose-700 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>{useNewGroup ? 'Pick Existing Group' : 'Create Custom Group'}</span>
            </button>
          </div>

          {useNewGroup ? (
            <input
              type="text"
              value={newGroupInput}
              onChange={(e) => setNewGroupInput(e.target.value)}
              placeholder="e.g. College Crew, Work Friends, NJ Neighbors..."
              className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
              autoFocus
            />
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {availableGroups.map((grp) => {
                const active = selectedGroup === grp;
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => handleGroupPick(grp)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                      active
                        ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    {grp}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleGroupPick('Unassigned')}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                  selectedGroup === 'Unassigned'
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                }`}
              >
                Unassigned
              </button>
            </div>
          )}

          {/* Side Selector */}
          <div className="flex items-center gap-2 pt-1.5 border-t border-stone-200/80">
            <span className="text-[11px] font-semibold text-stone-500">Side:</span>
            {(
              [
                { id: 'bride', label: "Bride's Side" },
                { id: 'groom', label: "Groom's Side" },
                { id: 'mutual', label: 'Mutual / Both' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSide(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  side === opt.id
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Invite to Events (Optional) */}
        {events.length > 0 && (
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 block">
              Pre-Invite to Ceremonies (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {events.map((ev) => {
                const checked = selectedEventIds.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => toggleEvent(ev.id)}
                    className={`px-2.5 py-1 rounded-xl border text-[11px] font-semibold inline-flex items-center gap-1 transition-all ${
                      checked
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {checked ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 opacity-50" />}
                    <span>{ev.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={parsedEntries.length === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 disabled:opacity-40 text-white font-bold shadow-sm inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>
              Add {parsedEntries.length > 0 ? `${parsedEntries.length} Guests` : 'Guests'}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
