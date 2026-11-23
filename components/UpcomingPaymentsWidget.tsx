'use client';

import React, { useMemo } from 'react';
import { useWedding } from '@/lib/store';
import { PaymentMilestone } from '@/lib/types';
import {
  ContractTarget,
  downloadPaymentReminderICS,
} from './ContractAndPaymentsModal';
import {
  Bell,
  AlertTriangle,
  Clock,
  Calendar,
  Download,
  SlidersHorizontal,
  CheckCircle2,
} from 'lucide-react';

interface UpcomingPaymentsWidgetProps {
  onOpenContractModal: (target: ContractTarget) => void;
  maxItems?: number;
}

interface AggregatedMilestone {
  sourceType: 'venue' | 'budget' | 'vendor';
  sourceId: string;
  sourceTitle: string;
  totalCost: number;
  notes?: string;
  allMilestones: PaymentMilestone[];
  milestone: PaymentMilestone;
  daysUntil: number;
}

const getDaysUntil = (dateStr: string): number => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return 9999;
  const [y, m, d] = dateStr.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
};

export const UpcomingPaymentsWidget: React.FC<UpcomingPaymentsWidgetProps> = ({
  onOpenContractModal,
  maxItems = 4,
}) => {
  const { venues, budgetItems, vendors, saveContractAndSchedule } = useWedding();

  const upcomingList = useMemo(() => {
    const items: AggregatedMilestone[] = [];
    const seenMilestoneIds = new Set<string>();

    // 1. Official / shortlisted venues with paymentSchedule
    venues.forEach((v) => {
      if (!v.paymentSchedule || v.paymentSchedule.length === 0) return;
      v.paymentSchedule
        .filter((m) => m.status !== 'paid')
        .forEach((m) => {
          seenMilestoneIds.add(m.id);
          items.push({
            sourceType: 'venue',
            sourceId: v.id,
            sourceTitle: v.name,
            totalCost: v.contractAgreedAmount || v.pricing.estimatedTotalCost || 0,
            notes: v.contractNotes || v.notes,
            allMilestones: v.paymentSchedule || [],
            milestone: m,
            daysUntil: getDaysUntil(m.dueDate),
          });
        });
    });

    // 2. Budget items with paymentSchedule (skip duplicates already counted from venue)
    budgetItems.forEach((b) => {
      if (!b.paymentSchedule || b.paymentSchedule.length === 0) return;
      b.paymentSchedule
        .filter((m) => m.status !== 'paid' && !seenMilestoneIds.has(m.id))
        .forEach((m) => {
          seenMilestoneIds.add(m.id);
          items.push({
            sourceType: 'budget',
            sourceId: b.id,
            sourceTitle: b.title,
            totalCost: b.actualCost || b.estimatedCost || 0,
            notes: b.notes,
            allMilestones: b.paymentSchedule || [],
            milestone: m,
            daysUntil: getDaysUntil(m.dueDate),
          });
        });
    });

    // 3. Vendors with paymentSchedule
    vendors.forEach((v) => {
      if (!v.paymentSchedule || v.paymentSchedule.length === 0) return;
      v.paymentSchedule
        .filter((m) => m.status !== 'paid' && !seenMilestoneIds.has(m.id))
        .forEach((m) => {
          seenMilestoneIds.add(m.id);
          items.push({
            sourceType: 'vendor',
            sourceId: v.id,
            sourceTitle: v.name,
            totalCost: v.agreedAmount || 0,
            notes: v.notes,
            allMilestones: v.paymentSchedule || [],
            milestone: m,
            daysUntil: getDaysUntil(m.dueDate),
          });
        });
    });

    return items.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [venues, budgetItems, vendors]);

  if (upcomingList.length === 0) return null;

  const visibleItems = upcomingList.slice(0, maxItems);

  const handleQuickMarkPaid = (item: AggregatedMilestone) => {
    const todayIso = new Date().toISOString().split('T')[0];
    const updatedSchedule: PaymentMilestone[] = item.allMilestones.map((m) =>
      m.id === item.milestone.id ? { ...m, status: 'paid', paidDate: todayIso } : m
    );
    saveContractAndSchedule({
      targetType: item.sourceType,
      targetId: item.sourceId,
      title: item.sourceTitle,
      totalCost: item.totalCost,
      contractNotes: item.notes,
      paymentSchedule: updatedSchedule,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/90 p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base font-serif">
              Upcoming Payment Reminders ({upcomingList.length})
            </h3>
            <p className="text-[11px] text-stone-500">
              Stay ahead of venue & vendor installment due dates
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleItems.map((item) => {
          const isOverdue = item.daysUntil < 0;
          const isDueSoon = item.daysUntil >= 0 && item.daysUntil <= 30;
          return (
            <div
              key={`${item.sourceId}-${item.milestone.id}`}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 ${
                isOverdue
                  ? 'bg-rose-50/60 border-rose-300'
                  : isDueSoon
                  ? 'bg-amber-50/60 border-amber-300'
                  : 'bg-stone-50/60 border-stone-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                    {item.sourceTitle}
                  </div>
                  <div className="text-[11px] text-stone-600 truncate">
                    {item.milestone.label} • Due {item.milestone.dueDate}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-sm text-stone-900">
                    ${Number(item.milestone.amount).toLocaleString()}
                  </div>
                  {isOverdue ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700">
                      <AlertTriangle className="w-3 h-3" />
                      Overdue {Math.abs(item.daysUntil)}d
                    </span>
                  ) : isDueSoon ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800">
                      <Clock className="w-3 h-3" />
                      Due in {item.daysUntil}d
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-stone-500">
                      <Calendar className="w-3 h-3" />
                      In {item.daysUntil}d
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1.5 border-t border-stone-200/70">
                <button
                  type="button"
                  onClick={() => downloadPaymentReminderICS(item.sourceTitle, item.milestone)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-semibold inline-flex items-center gap-1"
                  title="Add due date reminder to Apple/Google Calendar"
                >
                  <Download className="w-3 h-3 text-amber-600" />
                  <span>.ics</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onOpenContractModal({
                      type: item.sourceType,
                      id: item.sourceId,
                      title: item.sourceTitle,
                      initialTotalCost: item.totalCost,
                      initialNotes: item.notes,
                      initialSchedule: item.allMilestones,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-[11px] font-semibold inline-flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickMarkPaid(item)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mark Paid</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
