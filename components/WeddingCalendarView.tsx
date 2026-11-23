'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWedding } from '@/lib/store';
import { WeddingEvent } from '@/lib/types';
import { Modal } from './Modal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Sparkles,
  GripVertical,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Building2,
  Shirt,
  ArrowRight,
  CalendarPlus,
} from 'lucide-react';

interface WeddingCalendarViewProps {
  onOpenEventPlanner: (event: WeddingEvent) => void;
  onOpenVenuePicker: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseLocalDate = (dateStr?: string): Date | null => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return null;
  const [y, m, d] = dateStr.trim().split('-').map(Number);
  return new Date(y, m - 1, d);
};

const toDateKey = (year: number, monthIndex: number, day: number): string => {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

const formatReadableDate = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  if (!d) return 'Date TBD';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatShortDate = (dateStr: string): string => {
  const d = parseLocalDate(dateStr);
  if (!d) return 'TBD';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getEventColorClasses = (type: WeddingEvent['type']) => {
  switch (type) {
    case 'sangeet':
      return {
        pill: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200/80',
        dot: 'bg-purple-600',
        badge: 'bg-purple-50 text-purple-800 border-purple-200',
      };
    case 'haldi':
      return {
        pill: 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200/80',
        dot: 'bg-amber-500',
        badge: 'bg-amber-50 text-amber-900 border-amber-200',
      };
    case 'mehendi':
      return {
        pill: 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200/80',
        dot: 'bg-emerald-600',
        badge: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      };
    case 'pheras':
    case 'baraat':
    case 'vidaai':
      return {
        pill: 'bg-rose-100 text-rose-950 border-rose-300 hover:bg-rose-200/80',
        dot: 'bg-rose-600',
        badge: 'bg-rose-50 text-rose-900 border-rose-200',
      };
    case 'reception':
      return {
        pill: 'bg-indigo-100 text-indigo-950 border-indigo-300 hover:bg-indigo-200/80',
        dot: 'bg-indigo-600',
        badge: 'bg-indigo-50 text-indigo-900 border-indigo-200',
      };
    case 'roka':
      return {
        pill: 'bg-pink-100 text-pink-950 border-pink-300 hover:bg-pink-200/80',
        dot: 'bg-pink-600',
        badge: 'bg-pink-50 text-pink-900 border-pink-200',
      };
    default:
      return {
        pill: 'bg-stone-100 text-stone-900 border-stone-300 hover:bg-stone-200/80',
        dot: 'bg-stone-600',
        badge: 'bg-stone-100 text-stone-800 border-stone-200',
      };
  }
};

const QUICK_EVENT_PRESETS: Array<{
  type: WeddingEvent['type'];
  name: string;
  startTime: string;
  endTime: string;
  dressCode: string;
}> = [
  { type: 'sangeet', name: 'Sangeet & Garba Night', startTime: '18:30', endTime: '23:30', dressCode: 'Indo-Western / Lehengas & Kurtas' },
  { type: 'haldi', name: 'Haldi Ceremony', startTime: '10:30', endTime: '13:30', dressCode: 'Shades of Yellow & Marigold' },
  { type: 'mehendi', name: 'Mehendi & Chai', startTime: '14:00', endTime: '18:00', dressCode: 'Pastels / Floral Festive' },
  { type: 'pheras', name: 'Baraat & Wedding Ceremony', startTime: '09:00', endTime: '13:30', dressCode: 'Traditional Indian Formal' },
  { type: 'reception', name: 'Cocktail Hour & Reception', startTime: '18:30', endTime: '23:30', dressCode: 'Black Tie / Indian Evening Glam' },
  { type: 'custom', name: 'Welcome Dinner / Custom Event', startTime: '18:00', endTime: '21:30', dressCode: 'Smart Festive' },
];

export const WeddingCalendarView: React.FC<WeddingCalendarViewProps> = ({
  onOpenEventPlanner,
  onOpenVenuePicker,
}) => {
  const {
    wedding,
    events,
    venues,
    officialSangeetVenue,
    addEvent,
    updateEvent,
    rescheduleEventDate,
  } = useWedding();

  // Separate scheduled vs unscheduled events
  const scheduledEvents = useMemo(() => {
    return events
      .filter((ev) => parseLocalDate(ev.date) !== null)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.startTime || '').localeCompare(b.startTime || '');
      });
  }, [events]);

  const unscheduledEvents = useMemo(() => {
    return events.filter((ev) => parseLocalDate(ev.date) === null);
  }, [events]);

  // Map dateKey -> events[]
  const eventsByDate = useMemo(() => {
    const map: Record<string, WeddingEvent[]> = {};
    scheduledEvents.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [scheduledEvents]);

  // Active calendar month (defaults to earliest scheduled event or wedding startDate or current month)
  const initialMonthDate = useMemo(() => {
    if (scheduledEvents.length > 0) {
      const first = parseLocalDate(scheduledEvents[0].date);
      if (first) return new Date(first.getFullYear(), first.getMonth(), 1);
    }
    const start = parseLocalDate(wedding?.startDate);
    if (start) return new Date(start.getFullYear(), start.getMonth(), 1);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const [viewYear, setViewYear] = useState(initialMonthDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonthDate.getMonth());
  const [hasUserNavigated, setHasUserNavigated] = useState(false);

  // If events get scheduled for the first time, jump to their month automatically
  useEffect(() => {
    if (!hasUserNavigated && scheduledEvents.length > 0) {
      const first = parseLocalDate(scheduledEvents[0].date);
      if (first) {
        setViewYear(first.getFullYear());
        setViewMonth(first.getMonth());
      }
    }
  }, [scheduledEvents, hasUserNavigated]);

  // Drag & Drop + Tap-to-Place state
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);
  const [placingEventId, setPlacingEventId] = useState<string | null>(null);

  // Day Detail Modal state
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [quickEditForm, setQuickEditForm] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    venueName: string;
    venueAddress: string;
    dressCode: string;
  }>({
    date: '',
    startTime: '',
    endTime: '',
    venueName: '',
    venueAddress: '',
    dressCode: '',
  });
  const [showAddOnDay, setShowAddOnDay] = useState(false);
  const [newEventPresetIdx, setNewEventPresetIdx] = useState(0);
  const [newEventName, setNewEventName] = useState(QUICK_EVENT_PRESETS[0].name);
  const [newEventStart, setNewEventStart] = useState(QUICK_EVENT_PRESETS[0].startTime);
  const [newEventEnd, setNewEventEnd] = useState(QUICK_EVENT_PRESETS[0].endTime);
  const [newEventVenue, setNewEventVenue] = useState('');

  // Build calendar cells for viewYear / viewMonth
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isWeekend: boolean;
    }> = [];

    // Leading days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      cells.push({
        dateKey: toDateKey(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate()),
        dayNumber: dayNum,
        isCurrentMonth: false,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(viewYear, viewMonth, d);
      cells.push({
        dateKey: toDateKey(viewYear, viewMonth, d),
        dayNumber: d,
        isCurrentMonth: true,
        isWeekend: currDate.getDay() === 0 || currDate.getDay() === 6,
      });
    }

    // Trailing days to complete 35 or 42 cells
    const totalNeeded = cells.length <= 35 ? 35 : 42;
    let nextDay = 1;
    while (cells.length < totalNeeded) {
      const nextDate = new Date(viewYear, viewMonth + 1, nextDay);
      cells.push({
        dateKey: toDateKey(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate()),
        dayNumber: nextDay,
        isCurrentMonth: false,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
      });
      nextDay++;
    }

    return cells;
  }, [viewYear, viewMonth]);

  const todayKey = useMemo(() => {
    const now = new Date();
    return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const monthTitle = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setHasUserNavigated(true);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setHasUserNavigated(true);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToDate = (dateStr: string, openModal = false) => {
    const d = parseLocalDate(dateStr);
    if (!d) return;
    setHasUserNavigated(true);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    if (openModal) {
      setSelectedDateKey(dateStr);
      setEditingEventId(null);
      setShowAddOnDay(false);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    setDraggingEventId(eventId);
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDateKey !== dateKey) {
      setDragOverDateKey(dateKey);
    }
  };

  const handleDrop = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData('text/plain') || draggingEventId;
    if (droppedId) {
      rescheduleEventDate(droppedId, dateKey);
    }
    setDraggingEventId(null);
    setDragOverDateKey(null);
  };

  const handleDayClick = (dateKey: string) => {
    // If user is in Tap-to-Place mode, place the event right on this date!
    if (placingEventId) {
      rescheduleEventDate(placingEventId, dateKey);
      setPlacingEventId(null);
      return;
    }
    setSelectedDateKey(dateKey);
    setEditingEventId(null);
    setShowAddOnDay(false);
  };

  const handleEventPillClick = (e: React.MouseEvent, ev: WeddingEvent) => {
    e.stopPropagation();
    if (placingEventId) {
      rescheduleEventDate(placingEventId, ev.date);
      setPlacingEventId(null);
      return;
    }
    setSelectedDateKey(ev.date);
    setShowAddOnDay(false);
    startQuickEdit(ev);
  };

  const startQuickEdit = (ev: WeddingEvent) => {
    setEditingEventId(ev.id);
    setQuickEditForm({
      date: ev.date || '',
      startTime: ev.startTime || '18:00',
      endTime: ev.endTime || '23:00',
      venueName: ev.venueName || '',
      venueAddress: ev.venueAddress || '',
      dressCode: ev.dressCode || '',
    });
  };

  const handleSaveQuickEdit = (eventId: string) => {
    updateEvent(eventId, {
      startTime: quickEditForm.startTime,
      endTime: quickEditForm.endTime,
      venueName: quickEditForm.venueName.trim(),
      venueAddress: quickEditForm.venueAddress.trim(),
      dressCode: quickEditForm.dressCode.trim(),
    });
    if (quickEditForm.date) {
      rescheduleEventDate(eventId, quickEditForm.date);
      if (quickEditForm.date !== selectedDateKey) {
        handleJumpToDate(quickEditForm.date, true);
      }
    }
    setEditingEventId(null);
  };

  const handleAddEventOnSelectedDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateKey || !newEventName.trim()) return;
    const preset = QUICK_EVENT_PRESETS[newEventPresetIdx];
    addEvent({
      name: newEventName.trim(),
      type: preset.type,
      date: selectedDateKey,
      startTime: newEventStart,
      endTime: newEventEnd,
      venueName:
        newEventVenue.trim() ||
        (preset.type === 'pheras' || preset.type === 'baraat' || preset.type === 'reception'
          ? wedding?.venueName || 'Venue TBD'
          : 'Venue TBD'),
      venueAddress: '',
      dressCode: preset.dressCode,
      colorTheme: '',
      bannerGradient: 'from-rose-600 to-amber-600',
      description: '',
      coordinatorName: '',
      coordinatorPhone: '',
      checklist: [],
    });
    // Also ensure wedding date span updates
    setShowAddOnDay(false);
    setNewEventVenue('');
  };

  const placingEvent = placingEventId ? events.find((e) => e.id === placingEventId) : null;
  const selectedDayEvents = selectedDateKey ? eventsByDate[selectedDateKey] || [] : [];

  // Quick venue suggestions for inline event venue picker
  const quickVenueChoices = useMemo(() => {
    const list: Array<{ label: string; name: string; address: string }> = [];
    if (
      wedding?.venueName &&
      !wedding.venueName.toLowerCase().includes('scouting') &&
      !wedding.venueName.toLowerCase().includes('decided')
    ) {
      list.push({
        label: `Official: ${wedding.venueName}`,
        name: wedding.venueName,
        address: wedding.city || '',
      });
    }
    if (officialSangeetVenue) {
      list.push({
        label: `Sangeet: ${officialSangeetVenue.name}`,
        name: officialSangeetVenue.name,
        address: `${officialSangeetVenue.address}, ${officialSangeetVenue.city}, ${officialSangeetVenue.state}`,
      });
    }
    venues.forEach((v) => {
      if (!list.some((item) => item.name.toLowerCase() === v.name.toLowerCase())) {
        list.push({
          label: v.name,
          name: v.name,
          address: [v.address, v.city, v.state].filter(Boolean).join(', '),
        });
      }
    });
    return list;
  }, [wedding, officialSangeetVenue, venues]);

  return (
    <div className="space-y-4">
      {/* Tap-to-Place Active Banner */}
      {placingEvent && (
        <div className="p-3.5 rounded-2xl bg-rose-700 text-white flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <CalendarPlus className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Tap any date on the calendar below to schedule <strong className="underline">{placingEvent.name}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPlacingEventId(null)}
            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Unscheduled Ceremonies Tray */}
      {unscheduledEvents.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Unscheduled Ceremonies ({unscheduledEvents.length})</span>
            </div>
            <span className="text-[11px] text-amber-800/90">
              Drag onto any date below, or tap a ceremony to pick its day
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {unscheduledEvents.map((ev) => {
              const colors = getEventColorClasses(ev.type);
              const isPlacing = placingEventId === ev.id;
              return (
                <div
                  key={ev.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ev.id)}
                  onDragEnd={() => {
                    setDraggingEventId(null);
                    setDragOverDateKey(null);
                  }}
                  onClick={() => setPlacingEventId(isPlacing ? null : ev.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-grab active:cursor-grabbing transition-all select-none ${
                    isPlacing
                      ? 'bg-rose-700 text-white border-rose-700 ring-2 ring-rose-300 scale-[1.02]'
                      : `${colors.pill} shadow-2xs`
                  }`}
                >
                  <GripVertical className="w-3 h-3 opacity-60 shrink-0" />
                  <span>{ev.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick-Jump Pills for Scheduled Events (spans multiple weeks cleanly!) */}
      {scheduledEvents.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[11px] font-semibold text-stone-500 shrink-0">Jump to:</span>
          {scheduledEvents.map((ev) => {
            const colors = getEventColorClasses(ev.type);
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => handleJumpToDate(ev.date, true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold shrink-0 transition-all ${colors.badge} hover:opacity-90`}
              >
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span>{ev.name}</span>
                <span className="opacity-75">• {formatShortDate(ev.date)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar Header & Month Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 min-w-[150px] text-center">
            {monthTitle}
          </h3>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setHasUserNavigated(true);
              setViewYear(now.getFullYear());
              setViewMonth(now.getMonth());
            }}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-500">
          <span className="hidden sm:inline">Drag events between days or click any date for details</span>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-2xs">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-stone-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-100">
          {calendarCells.map((cell) => {
            const dayEvents = eventsByDate[cell.dateKey] || [];
            const isToday = cell.dateKey === todayKey;
            const isDragTarget = dragOverDateKey === cell.dateKey;
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={cell.dateKey}
                onDragOver={(e) => handleDragOver(e, cell.dateKey)}
                onDragLeave={() => {
                  if (dragOverDateKey === cell.dateKey) setDragOverDateKey(null);
                }}
                onDrop={(e) => handleDrop(e, cell.dateKey)}
                onClick={() => handleDayClick(cell.dateKey)}
                className={`min-h-[82px] sm:min-h-[112px] p-1.5 sm:p-2 transition-all cursor-pointer relative group ${
                  !cell.isCurrentMonth
                    ? 'bg-stone-50/70 text-stone-400'
                    : cell.isWeekend
                    ? 'bg-amber-50/20'
                    : 'bg-white'
                } ${
                  isDragTarget
                    ? 'ring-2 ring-inset ring-rose-500 bg-rose-50/60'
                    : placingEventId
                    ? 'hover:bg-rose-50/50 hover:ring-2 hover:ring-inset hover:ring-rose-300'
                    : 'hover:bg-stone-50/90'
                }`}
              >
                {/* Top row: Day number + subtle + button on hover */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isToday
                        ? 'bg-rose-700 text-white font-bold'
                        : hasEvents
                        ? 'bg-amber-100 text-amber-950 font-bold'
                        : cell.isCurrentMonth
                        ? 'text-stone-700'
                        : 'text-stone-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-rose-600 hidden sm:inline-flex">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Event Pills inside Day Cell */}
                <div className="space-y-1">
                  {dayEvents.map((ev) => {
                    const colors = getEventColorClasses(ev.type);
                    return (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, ev.id);
                        }}
                        onDragEnd={() => {
                          setDraggingEventId(null);
                          setDragOverDateKey(null);
                        }}
                        onClick={(e) => handleEventPillClick(e, ev)}
                        title={`${ev.name} (${ev.startTime} - ${ev.endTime}) • ${ev.venueName || 'Venue TBD'} • Drag to move or click for details`}
                        className={`px-1.5 py-1 rounded-lg border text-[10px] sm:text-[11px] font-semibold leading-tight cursor-grab active:cursor-grabbing transition-all truncate ${colors.pill}`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                          <span className="truncate">{ev.name}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 text-[9px] opacity-75 mt-0.5 truncate pl-2.5">
                          <span>{ev.startTime}</span>
                          {ev.venueName && !ev.venueName.toLowerCase().includes('tbd') && (
                            <span className="truncate">• {ev.venueName}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-Depth Day Detail & Event Quick-Edit Modal */}
      <Modal
        isOpen={Boolean(selectedDateKey)}
        onClose={() => {
          setSelectedDateKey(null);
          setEditingEventId(null);
          setShowAddOnDay(false);
        }}
        title={selectedDateKey ? formatReadableDate(selectedDateKey) : 'Day Schedule'}
        maxWidth="lg"
      >
        {selectedDateKey && (
          <div className="space-y-4 text-xs">
            {selectedDayEvents.length === 0 && !showAddOnDay ? (
              <div className="p-6 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
                <CalendarIcon className="w-7 h-7 text-stone-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-stone-800 text-sm">No ceremonies on this day yet</h4>
                  <p className="text-stone-500 mt-0.5">
                    Add a celebration (like Sangeet, Haldi, or Wedding & Reception) or assign an existing ceremony to this date.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddOnDay(true)}
                    className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ceremony on This Day</span>
                  </button>
                </div>

                {/* Quick assign unscheduled events directly to this day */}
                {unscheduledEvents.length > 0 && (
                  <div className="pt-3 border-t border-stone-200 space-y-2">
                    <p className="text-[11px] font-semibold text-stone-600">
                      Or move an unscheduled ceremony here in 1 click:
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {unscheduledEvents.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => rescheduleEventDate(ev.id, selectedDateKey)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-semibold transition-colors"
                        >
                          + Place {ev.name} Here
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => {
                  const colors = getEventColorClasses(ev.type);
                  const isEditing = editingEventId === ev.id;
                  const arrangedCount = ev.checklist?.filter((c) => c.isArranged).length || 0;
                  const totalChecklist = ev.checklist?.length || 0;

                  return (
                    <div
                      key={ev.id}
                      className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${colors.badge}`}>
                              {ev.type}
                            </span>
                            <span className="text-stone-600 font-semibold inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {ev.startTime} – {ev.endTime}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-stone-900">{ev.name}</h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => (isEditing ? setEditingEventId(null) : startQuickEdit(ev))}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 font-semibold inline-flex items-center gap-1 shrink-0"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>{isEditing ? 'Close Edit' : 'Quick Edit'}</span>
                        </button>
                      </div>

                      {!isEditing ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase text-stone-400 block">Venue</span>
                                <span className="font-semibold text-stone-800 block truncate">
                                  {ev.venueName || 'Not assigned yet'}
                                </span>
                                {ev.venueAddress && (
                                  <span className="text-[10px] text-stone-500 block truncate">
                                    {ev.venueAddress}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-start gap-2">
                              <Shirt className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase text-stone-400 block">Dress Code</span>
                                <span className="font-semibold text-stone-800 block truncate">
                                  {ev.dressCode || 'Not set'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/80">
                            <span className="text-[11px] text-stone-600 font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {totalChecklist > 0
                                ? `${arrangedCount}/${totalChecklist} planning decisions arranged`
                                : 'Ready for detailed planning'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDateKey(null);
                                onOpenEventPlanner(ev);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Deep-Dive Planner & Checklist</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        /* Inline Quick Edit Form */
                        <div className="space-y-3 p-3.5 rounded-xl bg-white border border-rose-200 animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="font-semibold text-stone-600 block mb-1">Date</label>
                              <input
                                type="date"
                                value={quickEditForm.date}
                                onChange={(e) =>
                                  setQuickEditForm({ ...quickEditForm, date: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-stone-600 block mb-1">Start Time</label>
                              <input
                                type="time"
                                value={quickEditForm.startTime}
                                onChange={(e) =>
                                  setQuickEditForm({ ...quickEditForm, startTime: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-stone-600 block mb-1">End Time</label>
                              <input
                                type="time"
                                value={quickEditForm.endTime}
                                onChange={(e) =>
                                  setQuickEditForm({ ...quickEditForm, endTime: e.target.value })
                                }
                                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="font-semibold text-stone-600">Venue Name</label>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDateKey(null);
                                  onOpenVenuePicker();
                                }}
                                className="text-[11px] font-semibold text-rose-700 hover:underline inline-flex items-center gap-1"
                              >
                                <Building2 className="w-3 h-3" />
                                <span>Browse Venues</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              value={quickEditForm.venueName}
                              onChange={(e) =>
                                setQuickEditForm({ ...quickEditForm, venueName: e.target.value })
                              }
                              placeholder="Enter venue or pick one below..."
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                            />
                            {quickVenueChoices.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {quickVenueChoices.slice(0, 5).map((choice, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() =>
                                      setQuickEditForm({
                                        ...quickEditForm,
                                        venueName: choice.name,
                                        venueAddress: choice.address,
                                      })
                                    }
                                    className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-700 text-[10px] font-semibold transition-colors"
                                  >
                                    {choice.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="font-semibold text-stone-600 block mb-1">Dress Code</label>
                            <input
                              type="text"
                              value={quickEditForm.dressCode}
                              onChange={(e) =>
                                setQuickEditForm({ ...quickEditForm, dressCode: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                rescheduleEventDate(ev.id, '');
                                setEditingEventId(null);
                              }}
                              className="text-[11px] font-semibold text-stone-500 hover:text-rose-600"
                            >
                              Unschedule Date
                            </button>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingEventId(null)}
                                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveQuickEdit(ev.id)}
                                className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Another Ceremony Form inside Day Modal */}
            {showAddOnDay ? (
              <form
                onSubmit={handleAddEventOnSelectedDay}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">Add Ceremony on {formatShortDate(selectedDateKey)}</span>
                  <button
                    type="button"
                    onClick={() => setShowAddOnDay(false)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {QUICK_EVENT_PRESETS.map((p, idx) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setNewEventPresetIdx(idx);
                        setNewEventName(p.name);
                        setNewEventStart(p.startTime);
                        setNewEventEnd(p.endTime);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                        newEventPresetIdx === idx
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="font-semibold text-stone-600 block mb-1">Event Name</label>
                    <input
                      type="text"
                      required
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">Start</label>
                    <input
                      type="time"
                      value={newEventStart}
                      onChange={(e) => setNewEventStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-600 block mb-1">End</label>
                    <input
                      type="time"
                      value={newEventEnd}
                      onChange={(e) => setNewEventEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-600 block mb-1">Venue (Optional)</label>
                  <input
                    type="text"
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    placeholder="e.g. Bride's Family Home, Royal Albert's Palace..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddOnDay(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold"
                  >
                    Add to Calendar
                  </button>
                </div>
              </form>
            ) : (
              selectedDayEvents.length > 0 && (
                <div className="flex justify-between items-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddOnDay(true)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Ceremony on This Day</span>
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
