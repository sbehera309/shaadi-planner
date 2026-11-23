'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import { PaymentMilestone, PaymentPayer, PaymentMethod } from '@/lib/types';
import {
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  Calculator,
  Sparkles,
  Download,
} from 'lucide-react';

export interface ContractTarget {
  type: 'venue' | 'budget' | 'vendor';
  id: string;
  title: string;
  initialTotalCost: number;
  initialNotes?: string;
  initialSchedule?: PaymentMilestone[];
}

interface ContractAndPaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ContractTarget | null;
}

const PAYER_LABELS: Record<PaymentPayer, string> = {
  split_50_50: '50-50 Split',
  bride_side: "Bride's Family",
  groom_side: "Groom's Family",
  couple: 'Couple',
};

const toLocalIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addMonths = (baseDateStr: string | undefined, offsetMonths: number): string => {
  let base = new Date();
  if (baseDateStr && /^\d{4}-\d{2}-\d{2}$/.test(baseDateStr)) {
    const [y, m, d] = baseDateStr.split('-').map(Number);
    base = new Date(y, m - 1, d);
  }
  const shifted = new Date(base.getFullYear(), base.getMonth() + offsetMonths, base.getDate());
  return toLocalIso(shifted);
};

const getDaysUntil = (dateStr: string): number | null => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const due = new Date(y, m - 1, d);
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due.getTime() - todayMid.getTime()) / (1000 * 60 * 60 * 24));
};

export const downloadPaymentReminderICS = (
  title: string,
  milestone: PaymentMilestone
) => {
  if (!milestone.dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(milestone.dueDate)) return;
  const dateCompact = milestone.dueDate.replace(/-/g, '');
  const uid = `vivaah-payment-${milestone.id}@shaadiplanner`;
  const summary = `Wedding Payment Due: ${title} — ${milestone.label} ($${Number(
    milestone.amount
  ).toLocaleString()})`;
  const description = `Payment reminder for ${title} (${milestone.label}). Amount: $${Number(
    milestone.amount
  ).toLocaleString()}. Assigned to: ${PAYER_LABELS[milestone.paidBy] || milestone.paidBy}.`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vivaah Wedding Planner//Payment Reminders//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${dateCompact}`,
    `DTEND;VALUE=DATE:${dateCompact}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:7 days until ${summary}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Tomorrow: ${summary}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${milestone.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ContractAndPaymentsModal: React.FC<ContractAndPaymentsModalProps> = ({
  isOpen,
  onClose,
  target,
}) => {
  const { wedding, saveContractAndSchedule } = useWedding();

  const [totalCost, setTotalCost] = useState<string>('');
  const [contractNotes, setContractNotes] = useState<string>('');
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);

  // Optional Per-Person Helper
  const [showCalc, setShowCalc] = useState(false);
  const [calcGuests, setCalcGuests] = useState('250');
  const [calcPerPerson, setCalcPerPerson] = useState('185');
  const [calcServicePct, setCalcServicePct] = useState('22');
  const [calcTaxPct, setCalcTaxPct] = useState('6.625');

  useEffect(() => {
    if (!isOpen || !target) return;
    setTotalCost(target.initialTotalCost ? String(Math.round(target.initialTotalCost)) : '');
    setContractNotes(target.initialNotes || '');
    setMilestones(
      target.initialSchedule && target.initialSchedule.length > 0
        ? target.initialSchedule.map((m) => ({ ...m }))
        : []
    );
    setShowCalc(false);
  }, [isOpen, target]);

  const numericTotal = Math.max(0, Number(totalCost) || 0);
  const totalScheduled = useMemo(
    () => milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0),
    [milestones]
  );
  const totalPaid = useMemo(
    () =>
      milestones
        .filter((m) => m.status === 'paid')
        .reduce((sum, m) => sum + (Number(m.amount) || 0), 0),
    [milestones]
  );
  const remainingToPay = Math.max(0, numericTotal - totalPaid);
  const unallocated = numericTotal - totalScheduled;

  const weddingAnchorDate = wedding?.endDate || wedding?.startDate || addMonths(undefined, 10);

  const applyPreset = (type: '4_equal' | '20_40_40' | '50_50') => {
    const base = numericTotal > 0 ? numericTotal : 65000;
    if (numericTotal === 0) setTotalCost(String(base));
    const todayIso = toLocalIso(new Date());

    if (type === '4_equal') {
      const q = Math.round(base / 4);
      const last = base - q * 3;
      setMilestones([
        { id: `m-${Date.now()}-1`, label: 'Booking Deposit (25%)', amount: q, dueDate: todayIso, status: 'scheduled', paidBy: 'split_50_50' },
        { id: `m-${Date.now()}-2`, label: '2nd Payment (25%)', amount: q, dueDate: addMonths(weddingAnchorDate, -6), status: 'scheduled', paidBy: 'split_50_50' },
        { id: `m-${Date.now()}-3`, label: '3rd Payment (25%)', amount: q, dueDate: addMonths(weddingAnchorDate, -3), status: 'scheduled', paidBy: 'split_50_50' },
        { id: `m-${Date.now()}-4`, label: 'Final Balance (25%)', amount: last, dueDate: addMonths(weddingAnchorDate, -1), status: 'scheduled', paidBy: 'split_50_50' },
      ]);
    } else if (type === '20_40_40') {
      const p1 = Math.round(base * 0.2);
      const p2 = Math.round(base * 0.4);
      const p3 = base - p1 - p2;
      setMilestones([
        { id: `m-${Date.now()}-1`, label: 'Booking Deposit (20%)', amount: p1, dueDate: todayIso, status: 'scheduled', paidBy: 'split_50_50' },
        { id: `m-${Date.now()}-2`, label: 'Mid-Way Payment (40%)', amount: p2, dueDate: addMonths(weddingAnchorDate, -4), status: 'scheduled', paidBy: 'split_50_50' },
        { id: `m-${Date.now()}-3`, label: 'Final Balance (40%)', amount: p3, dueDate: addMonths(weddingAnchorDate, -1), status: 'scheduled', paidBy: 'split_50_50' },
      ]);
    } else {
      const half = Math.round(base / 2);
      setMilestones([
        { id: `m-${Date.now()}-1`, label: 'Booking Deposit (50%)', amount: half, dueDate: todayIso, status: 'scheduled', paidBy: 'split_50_50' },
        { id: `m-${Date.now()}-2`, label: 'Final Balance (50%)', amount: base - half, dueDate: addMonths(weddingAnchorDate, -1), status: 'scheduled', paidBy: 'split_50_50' },
      ]);
    }
  };

  const handleAddMilestone = () => {
    const suggestedAmt = unallocated > 0 ? unallocated : 5000;
    setMilestones((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        label: prev.length === 0 ? 'Booking Deposit' : `Installment #${prev.length + 1}`,
        amount: suggestedAmt,
        dueDate: prev.length === 0 ? toLocalIso(new Date()) : addMonths(weddingAnchorDate, -1),
        status: 'scheduled',
        paidBy: 'split_50_50',
      },
    ]);
  };

  const updateMilestone = (id: string, patch: Partial<PaymentMilestone>) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const toggleMilestonePaid = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextPaid = m.status !== 'paid';
        return {
          ...m,
          status: nextPaid ? 'paid' : 'scheduled',
          paidDate: nextPaid ? toLocalIso(new Date()) : undefined,
        };
      })
    );
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleApplyCalculator = () => {
    const g = Number(calcGuests) || 0;
    const pp = Number(calcPerPerson) || 0;
    const svc = Number(calcServicePct) || 0;
    const tax = Number(calcTaxPct) || 0;
    const sub = g * pp;
    const withSvc = sub * (1 + svc / 100);
    const grand = Math.round(withSvc * (1 + tax / 100));
    setTotalCost(String(grand));
    setShowCalc(false);
  };

  const handleSave = () => {
    if (!target) return;
    saveContractAndSchedule({
      targetType: target.type,
      targetId: target.id,
      title: target.title,
      totalCost: numericTotal,
      contractNotes: contractNotes.trim(),
      paymentSchedule: milestones,
    });
    onClose();
  };

  if (!target) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contract & Payments • ${target.title}`}
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs">
        {/* Section 1: Total Contract Cost */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Total Contract Cost</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCalc(!showCalc)}
              className="text-[11px] font-semibold text-rose-700 hover:underline inline-flex items-center gap-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{showCalc ? 'Hide Calculator' : 'Calculate from $/person'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-base">
                $
              </span>
              <input
                type="number"
                min={0}
                step={100}
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="e.g. 65000"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white text-base font-extrabold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <input
              type="text"
              value={contractNotes}
              onChange={(e) => setContractNotes(e.target.value)}
              placeholder="Contract notes (e.g. includes open bar, ceremony hall)..."
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Optional Per-Person Calculator */}
          {showCalc && (
            <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-2.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-500 block mb-0.5">Guests</label>
                  <input
                    type="number"
                    value={calcGuests}
                    onChange={(e) => setCalcGuests(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 block mb-0.5">$/Person</label>
                  <input
                    type="number"
                    value={calcPerPerson}
                    onChange={(e) => setCalcPerPerson(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 block mb-0.5">Service %</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calcServicePct}
                    onChange={(e) => setCalcServicePct(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 block mb-0.5">Tax %</label>
                  <input
                    type="number"
                    step="0.125"
                    value={calcTaxPct}
                    onChange={(e) => setCalcTaxPct(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyCalculator}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                >
                  Apply Calculated Total
                </button>
              </div>
            </div>
          )}

          {/* Live Financial Summary Strip */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Paid So Far</span>
              <span className="text-sm font-extrabold text-emerald-700">
                ${totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Remaining Due</span>
              <span className="text-sm font-extrabold text-rose-700">
                ${remainingToPay.toLocaleString()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-stone-200">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Scheduled</span>
              <span
                className={`text-sm font-extrabold ${
                  unallocated === 0 ? 'text-stone-900' : 'text-amber-700'
                }`}
              >
                ${totalScheduled.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Payment Timeline & Due-Date Reminders */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Payment Timeline & Due-Date Reminders</span>
              </h4>
              <p className="text-[11px] text-stone-500">
                Track deposits & upcoming due dates. Upcoming payments automatically appear as reminders on Overview & Budget.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Payment</span>
            </button>
          </div>

          {/* Quick 1-Click Presets */}
          {milestones.length === 0 && (
            <div className="p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 space-y-2.5 text-center">
              <p className="font-semibold text-stone-800">
                Quick-generate a payment schedule from your total cost:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('4_equal')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 font-semibold transition-colors"
                >
                  4 Equal Payments (25% each)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('20_40_40')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 font-semibold transition-colors"
                >
                  20% Deposit / 40% Mid / 40% Final
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('50_50')}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 font-semibold transition-colors"
                >
                  50% Deposit + 50% Final
                </button>
              </div>
            </div>
          )}

          {/* Milestones List */}
          <div className="space-y-2.5">
            {milestones.map((m) => {
              const daysUntil = getDaysUntil(m.dueDate);
              const isOverdue = m.status !== 'paid' && daysUntil !== null && daysUntil < 0;
              const isDueSoon = m.status !== 'paid' && daysUntil !== null && daysUntil >= 0 && daysUntil <= 30;

              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                    m.status === 'paid'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isOverdue
                      ? 'bg-rose-50/50 border-rose-300'
                      : isDueSoon
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">
                        Milestone
                      </label>
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => updateMilestone(m.id, { label: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={m.amount}
                        onChange={(e) => updateMilestone(m.id, { amount: Number(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-bold text-stone-900"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) => updateMilestone(m.id, { dueDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-medium text-stone-800"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-stone-400 uppercase block mb-0.5">
                        Paid By
                      </label>
                      <select
                        value={m.paidBy}
                        onChange={(e) =>
                          updateMilestone(m.id, { paidBy: e.target.value as PaymentPayer })
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-stone-300 bg-white font-medium text-stone-800"
                      >
                        <option value="split_50_50">50-50 Split</option>
                        <option value="bride_side">Bride&apos;s Family</option>
                        <option value="groom_side">Groom&apos;s Family</option>
                        <option value="couple">Couple</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/70">
                    <div className="flex items-center gap-2">
                      {m.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Paid{m.paidDate ? ` on ${m.paidDate}` : ''}</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue by {Math.abs(daysUntil!)} days</span>
                        </span>
                      ) : isDueSoon ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                          <Clock className="w-3 h-3" />
                          <span>Due in {daysUntil} days</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
                          <Calendar className="w-3 h-3" />
                          <span>{daysUntil !== null ? `In ${daysUntil} days` : 'Scheduled'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {m.status !== 'paid' && m.dueDate && (
                        <button
                          type="button"
                          onClick={() => downloadPaymentReminderICS(target.title, m)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-[11px] inline-flex items-center gap-1"
                          title="Download calendar reminder (.ics) with 7-day & 1-day alerts"
                        >
                          <Download className="w-3 h-3 text-amber-600" />
                          <span>Remind Me (.ics)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleMilestonePaid(m.id)}
                        className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                          m.status === 'paid'
                            ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {m.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMilestone(m.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="Delete payment milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 text-white font-bold shadow-sm inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Save Contract & Payment Plan</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
