'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useWedding } from '@/lib/store';
import { TimelineSegment, TimelineSegmentCategory, WeddingEvent } from '@/lib/types';
import {
  TIMELINE_CATEGORY_META,
  TimelinePresetItem,
  buildStarterSegments,
  formatDurationLabel,
  formatMinutesTo12h,
  getPresetsForEvent,
  parseTimeToMinutes,
} from '@/lib/timelinePresets';
import {
  Clock,
  GripVertical,
  Plus,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Music,
  User,
  ArrowUp,
  ArrowDown,
  Edit2,
  RotateCcw,
  CalendarDays,
  MapPin,
  AlertTriangle,
  ListOrdered,
  X,
} from 'lucide-react';

export default function EventTimelinesPage() {
  const { events, updateEvent, isReadOnly } = useWedding();

  // Sort ceremonies chronologically
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const da = a.date || '9999-12-31';
      const db = b.date || '9999-12-31';
      if (da !== db) return da.localeCompare(db);
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [events]);

  // Default to Reception if available, else first event
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  useEffect(() => {
    if (sortedEvents.length === 0) return;
    if (!selectedEventId || !sortedEvents.some((e) => e.id === selectedEventId)) {
      const reception = sortedEvents.find(
        (e) => e.type === 'reception' || e.name.toLowerCase().includes('reception')
      );
      setSelectedEventId(reception ? reception.id : sortedEvents[0].id);
    }
  }, [sortedEvents, selectedEventId]);

  const activeEvent: WeddingEvent | null = useMemo(
    () => sortedEvents.find((e) => e.id === selectedEventId) || null,
    [sortedEvents, selectedEventId]
  );

  const segments: TimelineSegment[] = activeEvent?.runOfShow || [];

  // Drag-and-drop state (supports dragging existing segments AND dragging preset pieces from library!)
  const [draggingSegmentId, setDraggingSegmentId] = useState<string | null>(null);
  const [draggingPreset, setDraggingPreset] = useState<TimelinePresetItem | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  // Inline segment editor
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<TimelineSegment | null>(null);

  // Custom piece form
  const [customTitle, setCustomTitle] = useState('');
  const [customDuration, setCustomDuration] = useState(10);
  const [customCategory, setCustomCategory] = useState<TimelineSegmentCategory>('entrance');
  const [customSong, setCustomSong] = useState('');
  const [customLead, setCustomLead] = useState('');
  const [copiedTimeline, setCopiedTimeline] = useState(false);

  // Reset editing state when switching events
  useEffect(() => {
    setEditingSegmentId(null);
    setEditDraft(null);
    setDraggingSegmentId(null);
    setDraggingPreset(null);
    setDropTargetIndex(null);
  }, [selectedEventId]);

  const saveSegments = (nextSegments: TimelineSegment[]) => {
    if (!activeEvent || isReadOnly) return;
    updateEvent(activeEvent.id, { runOfShow: nextSegments });
  };

  // Compute cascading clock times for every segment
  const startMinutes = parseTimeToMinutes(activeEvent?.startTime);
  const scheduledEndMinutes = useMemo(() => {
    if (!activeEvent?.endTime) return null;
    let endM = parseTimeToMinutes(activeEvent.endTime);
    // Handle events crossing midnight (e.g. 23:30 to 02:00)
    if (endM <= startMinutes) endM += 1440;
    return endM;
  }, [activeEvent?.endTime, startMinutes]);

  const computedSegments = useMemo(() => {
    let cursor = startMinutes;
    return segments.map((seg) => {
      const segStart = cursor;
      const dur = Math.max(1, seg.durationMinutes || 5);
      const segEnd = segStart + dur;
      cursor = segEnd;
      return {
        ...seg,
        startMins: segStart,
        endMins: segEnd,
        startLabel: formatMinutesTo12h(segStart),
        endLabel: formatMinutesTo12h(segEnd),
      };
    });
  }, [segments, startMinutes]);

  const totalDurationMinutes = useMemo(
    () => segments.reduce((sum, s) => sum + Math.max(1, s.durationMinutes || 5), 0),
    [segments]
  );
  const calculatedEndMinutes = startMinutes + totalDurationMinutes;
  const overrunMinutes =
    scheduledEndMinutes !== null ? calculatedEndMinutes - scheduledEndMinutes : 0;

  const commonPresets = useMemo(
    () => (activeEvent ? getPresetsForEvent(activeEvent.type, activeEvent.name) : []),
    [activeEvent]
  );

  // Handlers
  const handleLoadStarter = () => {
    if (!activeEvent || isReadOnly) return;
    const starter = buildStarterSegments(activeEvent.type, activeEvent.name);
    saveSegments(starter);
  };

  const handleAddPreset = (preset: TimelinePresetItem, insertAt?: number) => {
    if (!activeEvent || isReadOnly) return;
    const newSeg: TimelineSegment = {
      id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: preset.title,
      durationMinutes: preset.durationMinutes,
      category: preset.category,
      leadPerson: preset.leadPerson || '',
      songOrCue: preset.songOrCue || '',
      notes: preset.notes || '',
    };
    const next = [...segments];
    if (typeof insertAt === 'number' && insertAt >= 0 && insertAt <= next.length) {
      next.splice(insertAt, 0, newSeg);
    } else {
      next.push(newSeg);
    }
    saveSegments(next);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || isReadOnly || !customTitle.trim()) return;
    const newSeg: TimelineSegment = {
      id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: customTitle.trim(),
      durationMinutes: Math.max(1, customDuration || 5),
      category: customCategory,
      songOrCue: customSong.trim(),
      leadPerson: customLead.trim(),
      notes: '',
    };
    saveSegments([...segments, newSeg]);
    setCustomTitle('');
    setCustomSong('');
    setCustomLead('');
  };

  const handleMoveSegment = (fromIdx: number, toIdx: number) => {
    if (isReadOnly || fromIdx === toIdx || toIdx < 0 || toIdx >= segments.length) return;
    const next = [...segments];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    saveSegments(next);
  };

  const handleAdjustDuration = (segId: string, delta: number) => {
    if (isReadOnly) return;
    saveSegments(
      segments.map((s) =>
        s.id === segId ? { ...s, durationMinutes: Math.max(1, (s.durationMinutes || 5) + delta) } : s
      )
    );
  };

  const handleDeleteSegment = (segId: string) => {
    if (isReadOnly) return;
    saveSegments(segments.filter((s) => s.id !== segId));
    if (editingSegmentId === segId) {
      setEditingSegmentId(null);
      setEditDraft(null);
    }
  };

  const handleStartEdit = (seg: TimelineSegment) => {
    if (isReadOnly) return;
    setEditingSegmentId(seg.id);
    setEditDraft({ ...seg });
  };

  const handleSaveEdit = () => {
    if (!editDraft || isReadOnly) return;
    saveSegments(
      segments.map((s) =>
        s.id === editDraft.id
          ? {
              ...editDraft,
              title: editDraft.title.trim() || s.title,
              durationMinutes: Math.max(1, editDraft.durationMinutes || 5),
            }
          : s
      )
    );
    setEditingSegmentId(null);
    setEditDraft(null);
  };

  const handleDropAt = (targetIndex: number) => {
    if (isReadOnly) return;
    if (draggingPreset) {
      handleAddPreset(draggingPreset, targetIndex);
    } else if (draggingSegmentId) {
      const fromIdx = segments.findIndex((s) => s.id === draggingSegmentId);
      if (fromIdx !== -1 && fromIdx !== targetIndex) {
        const next = [...segments];
        const [moved] = next.splice(fromIdx, 1);
        const adjustedTarget = fromIdx < targetIndex ? targetIndex - 1 : targetIndex;
        next.splice(Math.max(0, Math.min(next.length, adjustedTarget)), 0, moved);
        saveSegments(next);
      }
    }
    setDraggingSegmentId(null);
    setDraggingPreset(null);
    setDropTargetIndex(null);
  };

  const handleCopyRunOfShow = async () => {
    if (!activeEvent || computedSegments.length === 0) return;
    const header = [
      `RUN OF SHOW — ${activeEvent.name.toUpperCase()}`,
      activeEvent.date ? `Date: ${activeEvent.date}` : '',
      activeEvent.venueName ? `Venue: ${activeEvent.venueName}` : '',
      `Schedule: ${formatMinutesTo12h(startMinutes)} – ${formatMinutesTo12h(calculatedEndMinutes)} (${formatDurationLabel(totalDurationMinutes)})`,
      '--------------------------------------------------',
    ]
      .filter(Boolean)
      .join('\n');

    const lines = computedSegments.map((seg, i) => {
      const extras = [
        seg.leadPerson ? `Lead: ${seg.leadPerson}` : '',
        seg.songOrCue ? `Cue/Song: ${seg.songOrCue}` : '',
        seg.notes ? `Note: ${seg.notes}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
      return `${i + 1}. ${seg.startLabel} – ${seg.endLabel} (${seg.durationMinutes}m) • ${seg.title}${extras ? `\n   ↳ ${extras}` : ''}`;
    });

    try {
      await navigator.clipboard.writeText(`${header}\n${lines.join('\n')}`);
      setCopiedTimeline(true);
      setTimeout(() => setCopiedTimeline(false), 2500);
    } catch {
      alert('Could not copy automatically.');
    }
  };

  const formatShortDate = (iso?: string) => {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return 'Date TBD';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-rose-700" />
            <span>Event Run-of-Show &amp; Timelines</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Build a minute-by-minute vertical timeline for each ceremony. Drag &amp; drop entrances, speeches, dances, and food service — clock times recalculate automatically.
          </p>
        </div>

        {activeEvent && computedSegments.length > 0 && (
          <button
            type="button"
            onClick={handleCopyRunOfShow}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
          >
            {copiedTimeline ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied for DJ / MC / Photo!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-300" />
                <span>Copy Run-of-Show</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Event Selector Pills */}
      {sortedEvents.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-dashed border-stone-300 text-center space-y-2">
          <p className="text-sm font-bold text-stone-800">No ceremonies added yet</p>
          <p className="text-xs text-stone-500">
            Add your wedding ceremonies on Overview or Itinerary &amp; Timings first, then return here to plan each event&apos;s vertical Run-of-Show.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {sortedEvents.map((ev) => {
                const isSelected = ev.id === activeEvent?.id;
                const count = ev.runOfShow?.length || 0;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`px-3.5 py-2 rounded-xl text-left border transition-all shrink-0 flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-700 to-amber-600 text-white border-transparent shadow-sm'
                        : 'bg-stone-50 hover:bg-amber-50/70 text-stone-800 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs whitespace-nowrap">{ev.name}</div>
                      <div
                        className={`text-[10px] whitespace-nowrap ${
                          isSelected ? 'text-amber-100' : 'text-stone-500'
                        }`}
                      >
                        {formatShortDate(ev.date)} • {formatMinutesTo12h(parseTimeToMinutes(ev.startTime))}
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : count > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200/80 text-stone-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeEvent && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ================================================================ */}
              {/* LEFT PANE (8 cols): VERTICAL DRAG-AND-DROP TIMELINE              */}
              {/* ================================================================ */}
              <div className="lg:col-span-8 space-y-4">
                {/* Active Event Summary & Clock Strip */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h2 className="text-lg font-bold font-serif text-stone-900 truncate">
                      {activeEvent.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-rose-600" />
                        <span>{formatShortDate(activeEvent.date)}</span>
                      </span>
                      {activeEvent.venueName && (
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span className="truncate">{activeEvent.venueName}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Start Time Control & End-Time Status */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs shrink-0">
                    <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px] font-semibold text-stone-500">Starts:</span>
                      <input
                        type="time"
                        disabled={isReadOnly}
                        value={activeEvent.startTime || '18:30'}
                        onChange={(e) => updateEvent(activeEvent.id, { startTime: e.target.value })}
                        className="bg-transparent font-bold text-stone-900 focus:outline-hidden text-xs"
                      />
                    </div>

                    {segments.length > 0 && (
                      <div
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold inline-flex items-center gap-1.5 ${
                          overrunMinutes > 0
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {overrunMinutes > 0 && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        <span>
                          Ends {formatMinutesTo12h(calculatedEndMinutes)} ({formatDurationLabel(totalDurationMinutes)})
                          {overrunMinutes > 0 ? ` • +${overrunMinutes}m over` : ''}
                        </span>
                      </div>
                    )}

                    {!isReadOnly && segments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Clear all ${segments.length} timeline items for "${activeEvent.name}"?`)) {
                            saveSegments([]);
                          }
                        }}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 transition-colors"
                        title="Clear timeline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Vertical Timeline Canvas */}
                {computedSegments.length === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropTargetIndex(0);
                    }}
                    onDragLeave={() => setDropTargetIndex(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDropAt(0);
                    }}
                    className={`bg-white p-10 rounded-3xl border-2 border-dashed text-center space-y-4 transition-colors ${
                      dropTargetIndex === 0
                        ? 'border-rose-500 bg-rose-50/40'
                        : 'border-amber-300/80'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="text-base font-bold font-serif text-stone-900">
                        Start Your {activeEvent.name} Run-of-Show
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Load our curated Desi-American starter timeline (complete with grand entrances, dances, speeches &amp; food) in 1 click, or drag pieces from the right panel!
                      </p>
                    </div>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={handleLoadStarter}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-900/15 hover:opacity-95 inline-flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>Load Starter Run-of-Show for {activeEvent.name}</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs relative">
                    <div className="space-y-1.5">
                      {computedSegments.map((seg, idx) => {
                        const catMeta = TIMELINE_CATEGORY_META[seg.category] || TIMELINE_CATEGORY_META.logistics;
                        const isDragging = draggingSegmentId === seg.id;
                        const isEditing = editingSegmentId === seg.id && editDraft;

                        return (
                          <div key={seg.id}>
                            {/* Top Drop Insertion Zone */}
                            {!isReadOnly && (draggingSegmentId || draggingPreset) && (
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setDropTargetIndex(idx);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  handleDropAt(idx);
                                }}
                                className={`h-3 -my-0.5 rounded-full transition-all flex items-center ${
                                  dropTargetIndex === idx
                                    ? 'bg-rose-500/20 my-1'
                                    : ''
                                }`}
                              >
                                {dropTargetIndex === idx && (
                                  <div className="w-full h-1 bg-rose-600 rounded-full shadow-xs" />
                                )}
                              </div>
                            )}

                            <div
                              draggable={!isReadOnly && !isEditing}
                              onDragStart={(e) => {
                                setDraggingSegmentId(seg.id);
                                setDraggingPreset(null);
                                e.dataTransfer.setData('text/plain', seg.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                if (isReadOnly) return;
                                e.preventDefault();
                                const rect = e.currentTarget.getBoundingClientRect();
                                const isLowerHalf = e.clientY - rect.top > rect.height / 2;
                                setDropTargetIndex(isLowerHalf ? idx + 1 : idx);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                if (dropTargetIndex !== null) {
                                  handleDropAt(dropTargetIndex);
                                }
                              }}
                              onDragEnd={() => {
                                setDraggingSegmentId(null);
                                setDraggingPreset(null);
                                setDropTargetIndex(null);
                              }}
                              className={`flex items-stretch gap-3 sm:gap-4 transition-opacity ${
                                isDragging ? 'opacity-40' : ''
                              }`}
                            >
                              {/* Left Vertical Time Column */}
                              <div className="w-20 sm:w-24 shrink-0 flex flex-col items-end pt-3 pr-1 relative">
                                <span className="text-xs font-extrabold text-stone-900 font-mono whitespace-nowrap">
                                  {seg.startLabel}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono whitespace-nowrap">
                                  to {seg.endLabel}
                                </span>
                              </div>

                              {/* Vertical Rail + Node Dot */}
                              <div className="flex flex-col items-center shrink-0">
                                <div className={`w-3 h-3 rounded-full mt-3.5 ring-4 ring-white shrink-0 ${catMeta.dotClass}`} />
                                {idx < computedSegments.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-stone-200 my-1 min-h-[24px]" />
                                )}
                              </div>

                              {/* Draggable Segment Card */}
                              <div
                                className={`flex-1 min-w-0 mb-2 rounded-2xl border border-stone-200 border-l-4 ${catMeta.borderClass} bg-stone-50/40 hover:bg-white hover:shadow-xs transition-all p-3 sm:p-3.5`}
                              >
                                {isEditing && editDraft ? (
                                  /* Inline Edit Mode */
                                  <div className="space-y-3 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-stone-700">Edit Timeline Piece</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingSegmentId(null);
                                          setEditDraft(null);
                                        }}
                                        className="text-stone-400 hover:text-stone-700"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                      <input
                                        type="text"
                                        value={editDraft.title}
                                        onChange={(e) =>
                                          setEditDraft({ ...editDraft, title: e.target.value })
                                        }
                                        placeholder="Segment title"
                                        className="sm:col-span-6 px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-semibold"
                                      />
                                      <select
                                        value={editDraft.category}
                                        onChange={(e) =>
                                          setEditDraft({
                                            ...editDraft,
                                            category: e.target.value as TimelineSegmentCategory,
                                          })
                                        }
                                        className="sm:col-span-3 px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-semibold"
                                      >
                                        {(Object.keys(TIMELINE_CATEGORY_META) as TimelineSegmentCategory[]).map(
                                          (k) => (
                                            <option key={k} value={k}>
                                              {TIMELINE_CATEGORY_META[k].label}
                                            </option>
                                          )
                                        )}
                                      </select>
                                      <div className="sm:col-span-3 flex items-center gap-1">
                                        <input
                                          type="number"
                                          min={1}
                                          max={480}
                                          value={editDraft.durationMinutes}
                                          onChange={(e) =>
                                            setEditDraft({
                                              ...editDraft,
                                              durationMinutes: Math.max(1, parseInt(e.target.value) || 5),
                                            })
                                          }
                                          className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white font-bold"
                                        />
                                        <span className="text-stone-500 font-semibold">min</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      <input
                                        type="text"
                                        value={editDraft.songOrCue || ''}
                                        onChange={(e) =>
                                          setEditDraft({ ...editDraft, songOrCue: e.target.value })
                                        }
                                        placeholder="Song / DJ Cue (e.g. Kala Chashma 0:30)"
                                        className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                                      />
                                      <input
                                        type="text"
                                        value={editDraft.leadPerson || ''}
                                        onChange={(e) =>
                                          setEditDraft({ ...editDraft, leadPerson: e.target.value })
                                        }
                                        placeholder="Lead / Vendor (e.g. MC & DJ, Coordinator)"
                                        className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                                      />
                                    </div>

                                    <input
                                      type="text"
                                      value={editDraft.notes || ''}
                                      onChange={(e) =>
                                        setEditDraft({ ...editDraft, notes: e.target.value })
                                      }
                                      placeholder="Notes (e.g. Line up at foyer doors 5 min prior)"
                                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                                    />

                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingSegmentId(null);
                                          setEditDraft(null);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleSaveEdit}
                                        className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Display Mode */
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 min-w-0">
                                      {!isReadOnly && (
                                        <GripVertical className="w-4 h-4 text-stone-300 hover:text-stone-600 shrink-0 mt-0.5 cursor-grab active:cursor-grabbing" />
                                      )}
                                      <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-bold text-xs sm:text-sm text-stone-900">
                                            {seg.title}
                                          </span>
                                          <span
                                            className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${catMeta.badgeClass}`}
                                          >
                                            {catMeta.label}
                                          </span>
                                        </div>

                                        {(seg.songOrCue || seg.leadPerson) && (
                                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-stone-600">
                                            {seg.songOrCue && (
                                              <span className="inline-flex items-center gap-1 text-purple-800 font-medium">
                                                <Music className="w-3 h-3 shrink-0" />
                                                <span>{seg.songOrCue}</span>
                                              </span>
                                            )}
                                            {seg.leadPerson && (
                                              <span className="inline-flex items-center gap-1 text-stone-600">
                                                <User className="w-3 h-3 shrink-0 text-stone-400" />
                                                <span>{seg.leadPerson}</span>
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        {seg.notes && (
                                          <p className="text-[11px] text-stone-500 leading-snug">
                                            {seg.notes}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Right Controls: Duration Stepper + Up/Down + Edit/Delete */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      <div className="inline-flex items-center rounded-lg bg-white border border-stone-200 text-[11px] font-bold text-stone-700 overflow-hidden">
                                        {!isReadOnly && (
                                          <button
                                            type="button"
                                            onClick={() => handleAdjustDuration(seg.id, -5)}
                                            className="px-1.5 py-1 hover:bg-stone-100 text-stone-500"
                                            title="-5 minutes"
                                          >
                                            −
                                          </button>
                                        )}
                                        <span className="px-1.5 py-1 font-mono text-[11px]">
                                          {seg.durationMinutes}m
                                        </span>
                                        {!isReadOnly && (
                                          <button
                                            type="button"
                                            onClick={() => handleAdjustDuration(seg.id, 5)}
                                            className="px-1.5 py-1 hover:bg-stone-100 text-stone-500"
                                            title="+5 minutes"
                                          >
                                            +
                                          </button>
                                        )}
                                      </div>

                                      {!isReadOnly && (
                                        <>
                                          <button
                                            type="button"
                                            disabled={idx === 0}
                                            onClick={() => handleMoveSegment(idx, idx - 1)}
                                            className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-30"
                                            title="Move up"
                                          >
                                            <ArrowUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={idx === computedSegments.length - 1}
                                            onClick={() => handleMoveSegment(idx, idx + 1)}
                                            className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-30"
                                            title="Move down"
                                          >
                                            <ArrowDown className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleStartEdit(seg)}
                                            className="p-1 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50"
                                            title="Edit details, song cue, or lead"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteSegment(seg.id)}
                                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                                            title="Remove piece"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Bottom Drop Insertion Zone */}
                      {!isReadOnly && (draggingSegmentId || draggingPreset) && (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTargetIndex(computedSegments.length);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDropAt(computedSegments.length);
                          }}
                          className={`h-8 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-semibold transition-all ${
                            dropTargetIndex === computedSegments.length
                              ? 'border-rose-500 bg-rose-50 text-rose-700'
                              : 'border-stone-200 text-stone-400'
                          }`}
                        >
                          Drop here to add at the end ({formatMinutesTo12h(calculatedEndMinutes)})
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================================ */}
              {/* RIGHT PANE (4 cols): CUSTOM PIECE + COMMON PIECES PALETTE        */}
              {/* ================================================================ */}
              {!isReadOnly && (
                <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
                  {/* Add Custom Piece Form */}
                  <form
                    onSubmit={handleAddCustom}
                    className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs"
                  >
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-rose-600" />
                      <span>Add Custom Timeline Piece</span>
                    </div>

                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Cousins Flash Mob, Live Dhol Entrance..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={customCategory}
                        onChange={(e) =>
                          setCustomCategory(e.target.value as TimelineSegmentCategory)
                        }
                        className="px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-semibold"
                      >
                        {(Object.keys(TIMELINE_CATEGORY_META) as TimelineSegmentCategory[]).map(
                          (k) => (
                            <option key={k} value={k}>
                              {TIMELINE_CATEGORY_META[k].label}
                            </option>
                          )
                        )}
                      </select>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          max={480}
                          value={customDuration}
                          onChange={(e) =>
                            setCustomDuration(Math.max(1, parseInt(e.target.value) || 5))
                          }
                          className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white font-bold"
                        />
                        <span className="text-stone-500 font-semibold shrink-0">min</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customSong}
                        onChange={(e) => setCustomSong(e.target.value)}
                        placeholder="Song / DJ cue (opt.)"
                        className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50/70"
                      />
                      <input
                        type="text"
                        value={customLead}
                        onChange={(e) => setCustomLead(e.target.value)}
                        placeholder="Lead person (opt.)"
                        className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50/70"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 hover:opacity-95 text-white font-bold shadow-xs transition-opacity"
                    >
                      + Add to Timeline
                    </button>
                  </form>

                  {/* Common Pieces Library (Draggable + 1-Click Add) */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                    <div>
                      <h3 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Common Pieces for {activeEvent.name}</span>
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Drag any piece onto the vertical timeline on the left, or click <strong>+</strong> to append it.
                      </p>
                    </div>

                    <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                      {commonPresets.map((preset, idx) => {
                        const catMeta = TIMELINE_CATEGORY_META[preset.category];
                        const alreadyAdded = segments.some(
                          (s) => s.title.toLowerCase() === preset.title.toLowerCase()
                        );
                        return (
                          <div
                            key={`${preset.title}-${idx}`}
                            draggable
                            onDragStart={(e) => {
                              setDraggingPreset(preset);
                              setDraggingSegmentId(null);
                              e.dataTransfer.setData('text/plain', preset.title);
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            onDragEnd={() => {
                              setDraggingPreset(null);
                              setDropTargetIndex(null);
                            }}
                            className={`p-2.5 rounded-xl border border-l-4 ${catMeta.borderClass} flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-colors ${
                              alreadyAdded
                                ? 'bg-emerald-50/40 border-emerald-200/80'
                                : 'bg-stone-50/60 hover:bg-white border-stone-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                              <div className="min-w-0">
                                <div className="font-semibold text-xs text-stone-900 truncate">
                                  {preset.title}
                                </div>
                                <div className="text-[10px] text-stone-500 flex items-center gap-1.5">
                                  <span className="font-mono font-bold">{preset.durationMinutes}m</span>
                                  <span>•</span>
                                  <span>{catMeta.label}</span>
                                  {alreadyAdded && (
                                    <span className="text-emerald-700 font-bold">✓ Added</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddPreset(preset)}
                              className="p-1.5 rounded-lg bg-white hover:bg-amber-50 border border-stone-200 text-stone-700 hover:text-rose-700 shrink-0 transition-colors"
                              title={`Add "${preset.title}" to timeline`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
