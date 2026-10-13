'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWedding } from '@/lib/store';
import { WeddingEvent } from '@/lib/types';
import { EditWeddingModal } from '@/components/EditWeddingModal';
import { GettingStartedWizard } from '@/components/GettingStartedWizard';
import { EventPlanningWizard } from '@/components/EventPlanningWizard';
import {
  CalendarDays,
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
    loadSampleTemplate,
  } = useWedding();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedEventToPlan, setSelectedEventToPlan] = useState<WeddingEvent | null>(null);

  // Budget calculations
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

  // Shagun calculations
  const totalCashShagun = shagunRecords.reduce((acc, s) => acc + (s.amount || 0), 0);
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

  // Event planning progress
  const plannedEvents = events.filter(
    (e) =>
      (e.venueName && e.venueName !== 'TBD' && e.venueName !== 'Venue TBA') ||
      (e.checklist && e.checklist.length > 0)
  );
  const plannedEventsPct = events.length > 0 ? Math.round((plannedEvents.length / events.length) * 100) : 0;

  const totalDecisionsCount = events.reduce((acc, e) => acc + (e.checklist ? e.checklist.length : 0), 0);
  const arrangedDecisionsCount = events.reduce(
    (acc, e) => acc + (e.checklist ? e.checklist.filter((c) => c.isArranged).length : 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Onboarding Hero */}
      {wedding && wedding.isConfigured && wedding.brideName ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-rose-950 to-amber-950 p-6 sm:p-8 text-white shadow-xl border border-amber-900/40">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Wedding Planning Journey</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-medium border border-white/20 transition-colors"
                >
                  ✨ Re-run Setup Guide
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-medium border border-white/20 transition-colors"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-amber-100">
              {wedding.brideName} & {wedding.groomName}
            </h1>

            <p className="mt-2 text-stone-300 text-sm leading-relaxed">
              {wedding.venueName} {wedding.city && `• ${wedding.city}`}
              {wedding.startDate && (
                <span className="text-amber-300/90 font-medium">
                  {' '}
                  • {new Date(wedding.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 text-xs">
              {wedding.hashtag && (
                <span className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/80 font-medium text-stone-200">
                  🏷️ <strong className="text-amber-200">{wedding.hashtag}</strong>
                </span>
              )}
              <span className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/80 font-medium text-stone-200">
                📅 {events.length} Festive Sub-Events
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/80 font-medium text-stone-200">
                👥 {totalHeadcount} Expected Guests
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/80 font-medium text-amber-300">
                🎯 Target Budget: {formatCurr(totalTargetBudget)}
              </span>
            </div>
          </div>
          {/* Subtle gold background aura */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-amber-500/10 to-transparent pointer-events-none opacity-50" />
        </div>
      ) : (
        /* Brand New / Unconfigured State: Simple 2-Step Getting Started Intro */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Welcome to ShaadiSutra • Step-by-Step Indian Wedding Planner</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 tracking-tight">
              Start Planning Your Wedding, Step by Step
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Planning an Indian wedding in the USA involves multiple ceremonies, family traditions, and vendor logistics.
              Instead of throwing everything at you at once, ShaadiSutra guides you through a progressive, simple flow:
            </p>

            {/* 2-Step Roadmap Graphic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Quick Initial Setup</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  Name the couple, pick your target wedding date & city, and select which ceremonies you're hosting (Sangeet, Mehndi, Haldi, Baraat & Pheras, Reception).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-950 text-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Event-by-Event Guided Planning</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed pl-8">
                  For each ceremony, walk through decisions for venues & municipal permits, Indian catering & chaat, DJ/music, decor, and ceremony essentials.
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
            </div>
          </div>
        </div>
      )}

      {/* PRIMARY SECTION: Event-by-Event Planning Roadmap */}
      {wedding && wedding.isConfigured && (
        <section className="space-y-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider mb-1">
                  <Compass className="w-3.5 h-3.5 text-rose-600" />
                  <span>Step 2 • Event-by-Event Planning Roadmap</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                  Plan Decisions for Each Ceremony
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
                  Select each event below to walk through venue rules & curfews, catering & dietary preferences, DJ/sound, and essentials checklists.
                </p>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-stone-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
                  <span className="font-bold text-stone-900">{plannedEvents.length} of {events.length}</span>
                  <span>Ceremonies Planned</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                    {plannedEventsPct}% Complete
                  </span>
                </div>
                <div className="w-48 sm:w-56 bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(plannedEventsPct, 5)}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500">
                  {arrangedDecisionsCount} of {totalDecisionsCount} checklist decisions arranged
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {events.map((event, idx) => {
                  const isEventPlanned =
                    Boolean(event.venueName && event.venueName !== 'TBD' && event.venueName !== 'Venue TBA') ||
                    Boolean(event.checklist && event.checklist.length > 0);
                  const arrangedCount = event.checklist?.filter((c) => c.isArranged).length || 0;
                  const totalChecklist = event.checklist?.length || 0;

                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-stone-200 hover:border-amber-400/80 bg-stone-50/40 p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Event Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                                Event {idx + 1} • {event.type.toUpperCase()}
                              </span>
                              {event.muhuratTime && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                  ✨ {event.muhuratTime}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-lg text-stone-900 font-serif leading-tight">
                              {event.name}
                            </h3>
                          </div>

                          {/* Status Badge */}
                          {isEventPlanned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Plan In Progress</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[11px] font-semibold shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Needs Planning</span>
                            </span>
                          )}
                        </div>

                        {/* Date & Timing */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
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
                            <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="truncate">
                              <span className="text-[10px] uppercase font-bold text-stone-400 block">Dress Code</span>
                              <span className="font-semibold text-stone-800 truncate block">
                                {event.dressCode || 'To be announced'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Checklist progress */}
                        {totalChecklist > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between text-xs font-medium">
                            <span className="text-amber-950 font-semibold">
                              📦 Ceremony Decisions & Essentials:
                            </span>
                            <span className="text-amber-900 font-bold">
                              {arrangedCount}/{totalChecklist} arranged
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button: Opens Guided Planning for this event */}
                      <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedEventToPlan(event)}
                          className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 group"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                          <span>
                            {isEventPlanned ? '✏️ Review & Edit Event Decisions' : '✨ Plan This Event'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
              <span className="text-xs text-stone-500">
                Need to add more ceremonies? (e.g. Roka, Welcome Dinner, Post-wedding Brunch)
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

      {/* SECONDARY SECTION: Overall Wedding Pulse & Financials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900">
              Wedding Pulse & Core Logistics
            </h2>
            <p className="text-xs text-stone-500">
              Real-time summary of budget commitments in USD, guest counts, and shagun envelopes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Budget */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
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
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
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

          {/* Metric 3: Shagun */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Shagun Lifafas
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {formatCurr(totalCashShagun)}
              </div>
              <div className="mt-1 text-xs text-stone-600 font-medium">
                {totalGiftsCount} envelopes / gifts logged
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
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Link
            href="/dashboard/guests"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              <span>Guest Directory</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-600" />
          </Link>

          <Link
            href="/dashboard/budget"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600" />
              <span>Budget & Splits</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600" />
          </Link>

          <Link
            href="/dashboard/shagun"
            className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Shagun Tracker</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600" />
          </Link>

          {wedding && wedding.isConfigured && wedding.slug ? (
            <Link
              href={`/invite/${wedding.slug}`}
              target="_blank"
              className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Digital E-Invite</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-purple-600" />
            </Link>
          ) : (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all flex items-center justify-between text-xs font-semibold text-stone-800 group text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Wedding Setup</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-purple-600" />
            </button>
          )}
        </div>
      </section>

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
    </div>
  );
}
