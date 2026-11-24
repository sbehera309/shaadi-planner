'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWedding } from '@/lib/store';
import { WeddingEvent } from '@/lib/types';
import { EditWeddingModal } from '@/components/EditWeddingModal';
import { GettingStartedWizard } from '@/components/GettingStartedWizard';
import { EventPlanningWizard } from '@/components/EventPlanningWizard';
import { ExcelSyncModal } from '@/components/ExcelSyncModal';
import { QuickVenuePickerModal } from '@/components/QuickVenuePickerModal';
import { WeddingCalendarView } from '@/components/WeddingCalendarView';
import { EventDetailModal } from '@/components/EventDetailModal';
import {
  ContractAndPaymentsModal,
  ContractTarget,
} from '@/components/ContractAndPaymentsModal';
import { UpcomingPaymentsWidget } from '@/components/UpcomingPaymentsWidget';
import {
  EVENT_BLUEPRINTS,
  EventSortOrder,
  sortEventsBy,
  getEventBlueprintsForTradition,
} from '@/lib/eventBlueprints';
import {
  CalendarDays,
  Calendar,
  Users,
  Wallet,
  Gift,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Utensils,
  Music,
  Plus,
  Compass,
  Layers,
  ChevronRight,
  Tag,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
  Filter,
  Flame,
  Zap,
  Hotel,
  Shirt,
  Package,
  FileSpreadsheet,
  Moon,
  Star,
  Download,
  Upload,
  Building2,
  LayoutGrid,
  Pencil,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const {
    wedding,
    events,
    guests,
    budgetItems,
    vendors,
    shagunRecords,
    rooms,
    venues,
    officialSangeetVenue,
    tourPlan,
    loadSampleTemplate,
  } = useWedding();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isVenuePickerOpen, setIsVenuePickerOpen] = useState(false);
  const [contractModalTarget, setContractModalTarget] = useState<ContractTarget | null>(null);
  const [selectedEventDetailId, setSelectedEventDetailId] = useState<string | null>(null);
  const [selectedEventToPlan, setSelectedEventToPlan] = useState<WeddingEvent | null>(null);

  // Overview Primary View Mode: Interactive Calendar (default) vs Detailed Ceremony Cards
  const [overviewViewMode, setOverviewViewMode] = useState<'calendar' | 'cards'>('calendar');

  // Event Sorting & Prioritization State (defaults to chronological sequence)
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('chronological');

  // Helper to format YYYY-MM-DD safely in local time (no timezone shift)
  const formatLocalDate = (dateStr?: string) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return '';
    const [y, m, d] = dateStr.trim().split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Detect finalized Wedding & Reception venue cleanly
  const officialVenue = venues.find((v) => v.isSelectedOfficialVenue);
  const hasFinalizedVenue = Boolean(
    officialVenue ||
      (wedding?.venueName &&
        !wedding.venueName.toLowerCase().includes('scouting') &&
        !wedding.venueName.toLowerCase().includes('decided') &&
        wedding.venueName.trim() !== '')
  );
  const displayVenueName = officialVenue?.name || wedding?.venueName || '';

  // Calendar view unlocks once at least ONE venue is selected for any event (or primary/Sangeet venue)
  const hasAnyEventVenueSelected = Boolean(
    hasFinalizedVenue ||
      officialSangeetVenue ||
      events.some(
        (ev) =>
          ev.venueName &&
          ev.venueName.trim() !== '' &&
          !ev.venueName.toLowerCase().includes('tbd') &&
          !ev.venueName.toLowerCase().includes('not decided') &&
          !ev.venueName.toLowerCase().includes('scouting')
      )
  );

  // Compute flexible multi-week schedule span from scheduled events
  const scheduledEventDates = events
    .map((e) => e.date)
    .filter((d): d is string => Boolean(d && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())))
    .sort();
  const scheduledEventsCount = scheduledEventDates.length;
  const earliestEventDate = scheduledEventDates[0] || wedding?.startDate || '';
  const latestEventDate =
    scheduledEventDates[scheduledEventDates.length - 1] || wedding?.endDate || '';

  // Budget calculations in USD
  const totalTargetBudget = wedding?.targetBudget || 0;
  const totalActualCost = budgetItems.reduce((acc, curr) => acc + curr.actualCost, 0);
  const totalPaid = budgetItems.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = totalActualCost - totalPaid;
  const budgetConsumedPct = totalTargetBudget > 0 ? Math.round((totalActualCost / totalTargetBudget) * 100) : 0;

  // Guest calculations
  const totalHeadcount = guests.reduce((acc, g) => acc + g.adultsCount + g.kidsCount, 0);
  const brideGuests = guests.filter((g) => g.side === 'bride');
  const groomGuests = guests.filter((g) => g.side === 'groom');
  const mutualGuests = guests.filter((g) => g.side === 'mutual');

  const brideHeadcount = brideGuests.reduce((acc, g) => acc + g.adultsCount + g.kidsCount, 0);
  const groomHeadcount = groomGuests.reduce((acc, g) => acc + g.adultsCount + g.kidsCount, 0);
  const mutualHeadcount = mutualGuests.reduce((acc, g) => acc + g.adultsCount + g.kidsCount, 0);

  // Gift calculations
  const totalCashGifts = shagunRecords.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalGiftsCount = shagunRecords.length;
  const thankYouPending = shagunRecords.filter((s) => !s.thankYouSent).length;

  // Vendors
  const confirmedVendors = vendors.filter((v) => v.status === 'confirmed').length;

  // Format currency in USD (en-US)
  const formatCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wedding?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ACCURATE Event Planning Progress:
  // A ceremony is ONLY "Planned" if decisions in its checklist are actually arranged!
  const totalDecisionsCount = events.reduce((acc, e) => acc + (e.checklist ? e.checklist.length : 0), 0);
  const arrangedDecisionsCount = events.reduce(
    (acc, e) => acc + (e.checklist ? e.checklist.filter((c) => c.isArranged).length : 0),
    0
  );

  // An event is fully planned if all its checklist decisions are arranged
  const fullyPlannedEvents = events.filter(
    (e) => e.checklist && e.checklist.length > 0 && e.checklist.every((c) => c.isArranged)
  );

  // An event is in progress if at least 1 decision is arranged
  const inProgressEvents = events.filter(
    (e) => e.checklist && e.checklist.length > 0 && e.checklist.some((c) => c.isArranged)
  );

  const overallDecisionsPct =
    totalDecisionsCount > 0 ? Math.round((arrangedDecisionsCount / totalDecisionsCount) * 100) : 0;

  // Sorted events list based on user preference
  const sortedEvents = sortEventsBy(events, sortOrder);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Onboarding Hero */}
      {wedding && wedding.isConfigured && wedding.brideName ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-rose-950 to-amber-950 p-5 sm:p-7 text-white shadow-xl border border-amber-900/40">
          <div className="relative z-10 space-y-5">
            {/* Top Row: Couple Name + Subtle Profile Actions */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30 mb-2">
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {wedding.tradition === 'south_indian'
                      ? 'South Indian Wedding HQ'
                      : wedding.tradition === 'fusion_mixed'
                      ? 'Cross-Cultural Wedding HQ'
                      : 'Wedding Planning HQ'}
                  </span>
                  {wedding.hashtag && (
                    <span className="text-amber-200/90">• {wedding.hashtag}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-amber-50">
                  {wedding.brideName} & {wedding.groomName}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-100 text-xs font-semibold border border-white/15 transition-colors inline-flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-medium border border-white/15 transition-colors hidden sm:inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Setup Guide</span>
                </button>
              </div>
            </div>

            {/* 2-Card Quick Plan Strip: Direct 1-Click Venue & Flexible Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Card 1: Wedding & Reception Venue */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90 block">
                      Wedding & Reception Venue
                    </span>
                    <div className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                      {hasFinalizedVenue ? displayVenueName : 'Not finalized yet'}
                    </div>
                    <div className="text-xs text-stone-300 truncate">
                      {hasFinalizedVenue
                        ? officialVenue && (officialVenue.contractAgreedAmount || officialVenue.pricing.estimatedTotalCost) > 0
                          ? `Contract: ${formatCurr(officialVenue.contractAgreedAmount || officialVenue.pricing.estimatedTotalCost)}${wedding.city ? ` • ${wedding.city}` : ''}`
                          : wedding.city || 'Venue confirmed'
                        : venues.length > 0
                        ? `Comparing ${venues.length} shortlisted venues`
                        : 'Pick from shortlist, directory, or custom'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {hasFinalizedVenue && officialVenue && (
                    <button
                      type="button"
                      onClick={() =>
                        setContractModalTarget({
                          type: 'venue',
                          id: officialVenue.id,
                          title: officialVenue.name,
                          initialTotalCost:
                            officialVenue.contractAgreedAmount ||
                            officialVenue.pricing.estimatedTotalCost ||
                            0,
                          initialNotes: officialVenue.contractNotes || officialVenue.notes,
                          initialSchedule: officialVenue.paymentSchedule,
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-amber-200 font-bold text-xs border border-white/15 transition-colors shrink-0"
                    >
                      Contract &amp; Pay
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsVenuePickerOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition-colors shrink-0"
                  >
                    {hasFinalizedVenue ? 'Change' : 'Set Venue'}
                  </button>
                </div>
              </div>

              {/* Card 2: Flexible Celebration Schedule */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-rose-500/25 border border-rose-400/30 text-rose-200 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200/90 block">
                      Celebration Schedule
                    </span>
                    <div className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                      {earliestEventDate
                        ? latestEventDate && latestEventDate !== earliestEventDate
                          ? `${formatLocalDate(earliestEventDate).replace(/,\s*\d{4}$/, '')} – ${formatLocalDate(latestEventDate)}`
                          : formatLocalDate(earliestEventDate)
                        : 'Dates flexible — drag events onto calendar'}
                    </div>
                    <div className="text-xs text-stone-300 truncate">
                      {scheduledEventsCount} of {events.length} ceremonies scheduled • {totalHeadcount} guests • {formatCurr(totalTargetBudget)} target
                    </div>
                  </div>
                </div>
                {hasAnyEventVenueSelected && (
                  <button
                    type="button"
                    onClick={() => setOverviewViewMode('calendar')}
                    className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/15 transition-colors shrink-0 hidden sm:inline-flex items-center gap-1"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Calendar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Subtle gold background aura */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent pointer-events-none opacity-50" />
        </div>
      ) : (
        /* Brand New / Unconfigured State: Simple 2-Step Getting Started Intro */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Welcome to Vivaah • Desi American Wedding Planner</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 tracking-tight">
              Plan Your Dream Wedding, Step by Step
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Planning a South Asian / Desi-American wedding involves multi-day celebrations, outside Indian catering approval at US hotels, sound curfews, and vendor coordination.
              Instead of throwing everything at you at once, Vivaah guides you through a progressive, simple flow:
            </p>

            {/* 2-Step Roadmap Graphic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Quick Setup & Pick Celebrations</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  Name the couple, pick your target celebration window (optional if scouting venues), and choose which events you're hosting (Sangeet, Mehndi, Haldi, Baraat & Pheras, Reception).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Event-by-Event Guided Decisions</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  For each ceremony, walk through decisions for venues & municipal permits (sound curfews & fire marshals), Indian catering & chaat, DJ/music, and ceremony essentials.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 hover:from-rose-800 hover:to-amber-800 text-white font-bold text-sm shadow-md shadow-rose-900/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>✨ Start Guided Wedding Setup</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm border border-stone-300 transition-colors flex items-center justify-center gap-2"
              >
                <span>+ Manual Setup</span>
              </button>

              <button
                type="button"
                onClick={loadSampleTemplate}
                className="px-4 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Explore Sample Template</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="px-4 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Import Spreadsheet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY SECTION: Interactive Wedding Calendar & Event Roadmap */}
      {wedding && wedding.isConfigured && (
        <section className="space-y-4">
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-5">
              {/* Header & View Mode Switcher */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                  {hasAnyEventVenueSelected && overviewViewMode === 'calendar'
                    ? 'Master Wedding Calendar'
                    : hasAnyEventVenueSelected
                    ? 'All Ceremonies & Decisions'
                    : 'Your Wedding Plan'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5 max-w-2xl">
                  {hasAnyEventVenueSelected && overviewViewMode === 'calendar'
                    ? 'Drag ceremonies onto any date (even across multiple weeks) or click any day for times, venues, and detailed checklists.'
                    : hasAnyEventVenueSelected
                    ? 'Review each celebration’s venue, timing, and planning checklist at a glance.'
                    : 'Select a venue for at least one ceremony to unlock your interactive multi-week wedding calendar.'}
                </p>
              </div>

              {hasAnyEventVenueSelected && (
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {/* Clean View Mode Segmented Switcher */}
                  <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200/80">
                    <button
                      type="button"
                      onClick={() => setOverviewViewMode('calendar')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                        overviewViewMode === 'calendar'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-rose-600" />
                      <span>Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverviewViewMode('cards')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                        overviewViewMode === 'cards'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
                      <span>All Ceremonies ({events.length})</span>
                    </button>
                  </div>

                  {/* Compact Progress Pill */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                    <span className="font-semibold text-stone-700">
                      {arrangedDecisionsCount}/{totalDecisionsCount} decisions
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        overallDecisionsPct > 0
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {overallDecisionsPct}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!hasAnyEventVenueSelected ? (
              <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-rose-50/60 border border-amber-200/80 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="max-w-lg mx-auto space-y-1.5">
                  <h3 className="text-lg font-bold font-serif text-stone-900">
                    Choose a Venue to Unlock Your Interactive Calendar
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    Once you select a venue for your Wedding & Reception (or Sangeet/Haldi), your visual calendar will appear right here — letting you place Sangeet, Haldi, and Wedding/Reception on any dates across weeks and click any day for full details.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsVenuePickerOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4 text-amber-200" />
                    <span>Set Wedding & Reception Venue</span>
                  </button>
                  <Link
                    href="/dashboard/venues"
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>Explore & Compare Venues</span>
                  </Link>
                </div>
              </div>
            ) : overviewViewMode === 'calendar' ? (
              <WeddingCalendarView
                onOpenEventDetail={(ev) => setSelectedEventDetailId(ev.id)}
                onOpenEventPlanner={(ev) => setSelectedEventToPlan(ev)}
                onOpenVenuePicker={() => setIsVenuePickerOpen(true)}
              />
            ) : (
              <>
                {/* Event Sorting & Prioritization Controls Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-2 text-stone-600 font-semibold">
                    <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
                    <span>Order Ceremonies By:</span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 sm:mx-0 sm:px-0">
                    <button
                      type="button"
                      onClick={() => setSortOrder('chronological')}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shrink-0 tap-button active:scale-95 ${
                        sortOrder === 'chronological'
                          ? 'bg-rose-950 text-white shadow-xs ring-1 ring-rose-500/50'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                      title="Chronological celebration order"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span className="sm:hidden">Timeline</span>
                      <span className="hidden sm:inline">Chronological Schedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSortOrder('priority')}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shrink-0 tap-button active:scale-95 ${
                        sortOrder === 'priority'
                          ? 'bg-rose-950 text-white shadow-xs ring-1 ring-rose-500/50'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                      title="Prioritize high-lead-time ceremonies first (e.g. Baraat/Pheras fire permits & Sangeet sound curfew)"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span className="sm:hidden">Priority</span>
                      <span className="hidden sm:inline">Planning Priority (High Lead Time)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSortOrder('needs_planning')}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shrink-0 tap-button active:scale-95 ${
                        sortOrder === 'needs_planning'
                          ? 'bg-rose-950 text-white shadow-xs ring-1 ring-rose-500/50'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                      title="Show ceremonies with 0 decisions arranged at the top"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="sm:hidden">Unplanned</span>
                      <span className="hidden sm:inline">Needs Planning First</span>
                    </button>
                  </div>
                </div>

                {/* Event Cards Grid */}
                {events.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
                <CalendarDays className="w-8 h-8 text-amber-600 mx-auto" />
                <h3 className="font-bold text-stone-800 text-base">No ceremonies added yet</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Run the Getting Started guide or add your first ceremony to start making guided decisions.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="px-4 py-2 rounded-xl bg-rose-700 text-white font-semibold text-xs shadow-xs"
                  >
                    ✨ Launch Setup Guide
                  </button>
                  <Link
                    href="/dashboard/itinerary"
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs"
                  >
                    + Add Ceremony in Itinerary
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {sortedEvents.map((event, idx) => {
                  const traditionBlueprints = getEventBlueprintsForTradition(wedding?.tradition);
                  const blueprint = traditionBlueprints[event.type] || EVENT_BLUEPRINTS[event.type];
                  const arrangedCount = event.checklist?.filter((c) => c.isArranged).length || 0;
                  const totalChecklist = event.checklist?.length || 0;

                  // Honest planning status
                  const isFullyPlanned = arrangedCount === totalChecklist && totalChecklist > 0;
                  const isInProgress = arrangedCount > 0 && !isFullyPlanned;
                  const isNeedsPlanning = arrangedCount === 0;

                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-stone-200 hover:border-amber-400/80 bg-stone-50/40 p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md interactive-card"
                    >
                      <div className="space-y-3">
                        {/* Event Header with Priority Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                                {event.type.toUpperCase()}
                              </span>
                              {blueprint?.priorityBadge && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${blueprint.priorityBadge.color}`}
                                >
                                  {blueprint.priorityBadge.label}
                                </span>
                              )}
                              {event.muhuratTime && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-700" />
                                  <span>{event.muhuratTime}</span>
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-stone-900 font-sans tracking-tight leading-tight">
                              {event.name}
                            </h3>
                          </div>

                          {/* Honest Status Badge based on actual arranged decisions */}
                          {isFullyPlanned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Decisions Complete</span>
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-300 text-[11px] font-semibold shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>In Progress ({arrangedCount}/{totalChecklist})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-semibold shrink-0">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Needs Planning</span>
                            </span>
                          )}
                        </div>

                        {/* Date & Timing */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {event.date && event.date.trim() !== '' && event.date !== 'TBD'
                              ? formatLocalDate(event.date) || event.date
                              : 'Date to be decided'}{' '}
                            • {event.startTime} - {event.endTime}
                          </span>
                        </div>

                        {/* Decisions Snapshot Pills */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <div className="truncate">
                              <span className="text-[10px] uppercase font-bold text-stone-400 block">Venue / Hall</span>
                              <span className="font-semibold text-stone-800 truncate block">
                                {event.venueName || 'Venue not decided'}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-start gap-2">
                            <Shirt className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                            <div className="truncate">
                              <span className="text-[10px] uppercase font-bold text-stone-400 block">Dress Code</span>
                              <span className="font-semibold text-stone-800 truncate block">
                                {event.dressCode || 'To be announced'}
                              </span>
                            </div>
                          </div>

                          {event.hotelBlockName && (
                            <div className="sm:col-span-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2">
                              <Hotel className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                              <div className="truncate">
                                <span className="text-[10px] uppercase font-bold text-amber-900 block">Hotel Room Block</span>
                                <span className="font-semibold text-stone-900 truncate block text-xs">
                                  {event.hotelBlockName}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Checklist progress */}
                        {totalChecklist > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between text-xs font-medium">
                            <span className="text-amber-950 font-semibold inline-flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-amber-700" />
                              <span>Ceremony Decisions & Essentials:</span>
                            </span>
                            <span className="text-amber-900 font-bold">
                              {arrangedCount}/{totalChecklist} arranged
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button: Opens Event Detail Workspace (Details, Checklist, Guests) */}
                      <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEventDetailId(event.id)}
                          className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 group ${
                            isNeedsPlanning
                              ? 'bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 hover:opacity-95 shadow-md shadow-rose-900/20'
                              : 'bg-stone-900 hover:bg-stone-800'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                          <span>
                            {isNeedsPlanning
                              ? 'Open Details, Checklist & Guests'
                              : isInProgress
                              ? `Checklist, Guests & Details (${arrangedCount}/${totalChecklist})`
                              : 'View Event Details & Guests'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}

            {/* Bottom Actions Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
              <span className="text-xs text-stone-500">
                Need to add more celebrations? (e.g. Welcome Dinner, Post-wedding Brunch, Roka)
              </span>
              <Link
                href="/dashboard/itinerary"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Manage All Ceremonies</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* UPCOMING PAYMENT REMINDERS (auto-appears when milestones are scheduled) */}
      {wedding && wedding.isConfigured && (
        <UpcomingPaymentsWidget
          onOpenContractModal={(target) => setContractModalTarget(target)}
          maxItems={4}
        />
      )}

      {/* SECONDARY SECTION: Overall Wedding Pulse & Financials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Wedding Pulse & Core Logistics
            </h2>
            <p className="text-xs text-stone-500">
              Real-time summary of budget commitments in USD, guest counts, and gifts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Budget */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow interactive-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Budget Committed
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurr(totalActualCost)}
              </div>
              <div className="mt-1 text-xs text-stone-600 font-medium flex items-center justify-between">
                <span>Target: {formatCurr(totalTargetBudget)}</span>
                <span className="font-bold text-amber-800">{budgetConsumedPct}%</span>
              </div>
              <div className="mt-2 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(budgetConsumedPct, 100)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-stone-600 flex justify-between font-medium">
                <span>
                  Paid: <strong className="text-emerald-800 font-bold">{formatCurr(totalPaid)}</strong>
                </span>
                <span>
                  Due: <strong className="text-rose-800 font-bold">{formatCurr(totalPending)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Metric 2: Guests */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow interactive-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Invited Guests
              </span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {totalHeadcount} <span className="text-xs font-semibold text-stone-500">attendees</span>
              </div>
              <p className="mt-1 text-xs text-stone-600 font-medium">
                {guests.length} invitation units
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[11px]">
                  Bride: {brideHeadcount}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[11px]">
                  Groom: {groomHeadcount}
                </span>
                {mutualHeadcount > 0 && (
                  <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-semibold text-[11px]">
                    Mutual: {mutualHeadcount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metric 3: Gifts (Renamed from Shagun Lifafas) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow interactive-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Wedding Gifts
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurr(totalCashGifts)}
              </div>
              <div className="mt-1 text-xs text-stone-600 font-medium">
                {totalGiftsCount} gifts & envelopes logged
              </div>
              <div className="mt-2 text-xs font-medium flex items-center justify-between">
                <span className="text-stone-600">Thank-yous pending:</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-[11px]">
                  {thankYouPending}
                </span>
              </div>
            </div>
          </div>

          {/* Metric 4: Vendors & Hotel Rooms */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow interactive-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Vendors & Hotel Blocks
              </span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {confirmedVendors} / {vendors.length}
              </div>
              <p className="mt-1 text-xs text-stone-600 font-medium">Confirmed wedding vendors</p>
              <div className="mt-2 text-xs font-medium flex items-center justify-between">
                <span className="text-stone-600">Hotel Suites Blocked:</span>
                <span className="font-bold text-stone-900">{rooms.length} suites</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-2">
          <Link
            href="/dashboard/venues"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Venues</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
          </Link>

          <Link
            href="/dashboard/guests"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              <span>Guests</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-600" />
          </Link>

          <Link
            href="/dashboard/budget"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600" />
              <span>Budget</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
          </Link>

          <Link
            href="/dashboard/shagun"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Gifts</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600" />
          </Link>

          <Link
            href="/dashboard/horoscope"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Horoscope</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-purple-600" />
          </Link>

          <button
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group text-left"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel Sync</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600" />
          </button>

          {wedding && wedding.isConfigured && wedding.slug ? (
            <Link
              href={`/invite/${wedding.slug}`}
              target="_blank"
              className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>E-Invite</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
            </Link>
          ) : (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Setup</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
            </button>
          )}
        </div>
      </section>

      {/* Event Detail Workspace Modal (Details, Checklist & Event-Specific Guests) */}
      <EventDetailModal
        eventId={selectedEventDetailId}
        isOpen={Boolean(selectedEventDetailId)}
        onClose={() => setSelectedEventDetailId(null)}
        onOpenGuidedWizard={(ev) => setSelectedEventToPlan(ev)}
        onOpenVenuePicker={() => setIsVenuePickerOpen(true)}
      />

      {/* Guided Event Planning Wizard Modal */}
      <EventPlanningWizard
        event={selectedEventToPlan}
        isOpen={!!selectedEventToPlan}
        onClose={() => setSelectedEventToPlan(null)}
      />

      {/* Edit Wedding Profile Modal */}
      <EditWeddingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Getting Started Guide Wizard */}
      <GettingStartedWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />

      {/* Two-Way Excel & Google Sheets Sync Modal */}
      <ExcelSyncModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

      {/* Quick Wedding & Reception Venue Picker Modal */}
      <QuickVenuePickerModal
        isOpen={isVenuePickerOpen}
        onClose={() => setIsVenuePickerOpen(false)}
      />

      {/* Unified Contract Cost & Payment Timeline Modal */}
      <ContractAndPaymentsModal
        isOpen={Boolean(contractModalTarget)}
        onClose={() => setContractModalTarget(null)}
        target={contractModalTarget}
      />
    </div>
  );
}
