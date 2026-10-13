'use client';

import React from 'react';
import Link from 'next/link';
import { useWedding } from '@/lib/store';
import {
  CalendarDays,
  Users,
  Wallet,
  Gift,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Phone,
  BedDouble,
  FileText,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { wedding, events, guests, budgetItems, vendors, shagunRecords, rooms } = useWedding();

  // Budget calculations
  const totalTargetBudget = wedding.targetBudget;
  const totalActualCost = budgetItems.reduce((acc, curr) => acc + curr.actualCost, 0);
  const totalPaid = budgetItems.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = totalActualCost - totalPaid;
  const budgetConsumedPct = Math.round((totalActualCost / totalTargetBudget) * 100);

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

  // Format currency
  const formatCurr = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: wedding.currency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-rose-950 to-amber-950 p-8 text-white shadow-xl border border-amber-900/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Royal Wedding Planning HQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-amber-100">
            {wedding.brideName} & {wedding.groomName}
          </h1>
          <p className="mt-2 text-stone-300 text-sm leading-relaxed">
            {wedding.venueName} • {wedding.city}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700/80">
              🏷️ <strong className="text-amber-200">{wedding.hashtag}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700/80">
              📅 {events.length} Festive Sub-Events
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700/80">
              👥 {totalHeadcount} Total Expected Guests
            </span>
          </div>
        </div>

        {/* Decorative gold emblem ring */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-amber-500/10 to-transparent pointer-events-none opacity-50" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Budget */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Budget Allocated
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-stone-900">{formatCurr(totalActualCost)}</div>
            <div className="mt-1 text-xs text-stone-500 flex items-center justify-between">
              <span>Target: {formatCurr(totalTargetBudget)}</span>
              <span className="font-semibold text-amber-700">{budgetConsumedPct}%</span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-full"
                style={{ width: `${Math.min(budgetConsumedPct, 100)}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-stone-600 flex justify-between">
              <span>Paid: <strong className="text-emerald-700">{formatCurr(totalPaid)}</strong></span>
              <span>Due: <strong className="text-rose-700">{formatCurr(totalPending)}</strong></span>
            </div>
          </div>
        </div>

        {/* Metric 2: Guests */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Guests & Families
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-stone-900">{totalHeadcount} <span className="text-sm font-normal text-stone-500">invites</span></div>
            <p className="mt-1 text-xs text-stone-500">
              {guests.length} invitation units
            </p>
            {/* Side Distribution */}
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                Bride: {brideHeadcount}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Groom: {groomHeadcount}
              </span>
              {mutualHeadcount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                  Mutual: {mutualHeadcount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 3: Shagun Lifafas */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Shagun & Lifafa
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-stone-900">{formatCurr(totalCashShagun)}</div>
            <div className="mt-1 text-xs text-stone-500">
              {totalGiftsCount} gifts logged
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-stone-600">Thank-yous pending:</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold">
                {thankYouPending}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Logistics & Vendors */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Vendors & Rooms
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-stone-900">
              {confirmedVendors} / {vendors.length}
            </div>
            <p className="mt-1 text-xs text-stone-500">Key wedding vendors confirmed</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-stone-600">Hotel Rooms Blocked:</span>
              <span className="font-semibold text-stone-800">{rooms.length} suites</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Event Itinerary Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-serif">Festive Itinerary Timeline</h2>
              <p className="text-xs text-stone-500">Ceremonies, Muhurat timings, and venues</p>
            </div>
            <Link
              href="/dashboard/itinerary"
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
            >
              Manage All Events <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-400/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      {event.type}
                    </span>
                    {event.muhuratTime && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        ✨ {event.muhuratTime}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-base text-stone-900">{event.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {event.startTime} - {event.endTime}
                    </span>
                    <span>•</span>
                    <span className="text-stone-700 font-medium">{event.venueName}</span>
                  </div>
                  <p className="text-xs text-rose-800 font-medium mt-1">
                    👗 Dress Code: {event.dressCode}
                  </p>
                  {event.checklist && event.checklist.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/70 inline-flex mt-1 font-medium">
                      <span>📦</span>
                      <span>
                        {event.checklist.filter((c) => c.isArranged).length}/{event.checklist.length} Essentials Arranged (e.g. Baraat ride, samagri, saafas)
                      </span>
                    </div>
                  )}
                </div>

                <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <div className="text-xs text-stone-400">Coordinator</div>
                  <div className="text-xs font-semibold text-stone-800">{event.coordinatorName}</div>
                  <div className="text-xs text-stone-500">{event.coordinatorPhone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Quick Actions & Family Split Preview */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider mb-4 font-serif">
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/dashboard/guests"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-rose-50/70 border border-stone-200 hover:border-rose-200 text-stone-800 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>Add Guest or Family Group</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-rose-700 transition-colors" />
              </Link>

              <Link
                href="/dashboard/shagun"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-emerald-50/70 border border-stone-200 hover:border-emerald-200 text-stone-800 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Gift className="w-4 h-4" />
                  </div>
                  <span>Log Shagun Envelope / Gift</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 transition-colors" />
              </Link>

              <Link
                href="/dashboard/budget"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-200 text-stone-800 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <span>Record Vendor Payment</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition-colors" />
              </Link>

              <Link
                href={`/invite/${wedding.slug}`}
                target="_blank"
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-purple-50/70 border border-stone-200 hover:border-purple-200 text-stone-800 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span>Preview Guest E-Invite</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-purple-700 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Family Expense Split Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider mb-2 font-serif">
              Family Expense Sharing
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Commitment breakdown across families
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60">
                <div className="flex justify-between font-semibold text-rose-900">
                  <span>Bride's Family (Ladkiwale)</span>
                  <span>
                    {formatCurr(
                      budgetItems
                        .filter((b) => b.paidBy === 'bride_side')
                        .reduce((acc, c) => acc + c.actualCost, 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/60">
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Groom's Family (Ladkewale)</span>
                  <span>
                    {formatCurr(
                      budgetItems
                        .filter((b) => b.paidBy === 'groom_side')
                        .reduce((acc, c) => acc + c.actualCost, 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                <div className="flex justify-between font-semibold text-amber-900">
                  <span>Split 50-50 Shared</span>
                  <span>
                    {formatCurr(
                      budgetItems
                        .filter((b) => b.paidBy === 'split_50_50')
                        .reduce((acc, c) => acc + c.actualCost, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
