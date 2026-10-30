'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { useWedding } from '@/lib/store';
import { PaymentInstallment, PaymentPayer, PaymentMethod } from '@/lib/types';
import {
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Tag,
  CheckCircle2,
  Clock,
  Receipt,
  FileText,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    type: 'budget' | 'vendor' | 'venue';
    id: string;
    title: string;
    category?: string;
    totalAmount: number;
    currencySymbol?: string;
    defaultPaidBy?: PaymentPayer;
  } | null;
  installments?: PaymentInstallment[];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Wire / ACH',
  'Zelle',
  'Check',
  'Credit Card',
  'Cash',
  'Venmo',
  'Other',
];

const PAYER_OPTIONS: { id: PaymentPayer; label: string; sub: string; badgeClass: string }[] = [
  {
    id: 'bride_side',
    label: "Bride's Family",
    sub: 'Ladkiwale',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: 'groom_side',
    label: "Groom's Family",
    sub: 'Ladkewale',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 'split_50_50',
    label: '50-50 Split',
    sub: 'Equal Family Share',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'couple',
    label: 'Couple',
    sub: 'Direct Self-Funded',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
];

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  target,
  installments = [],
}) => {
  const { addPaymentInstallment, deletePaymentInstallment, wedding } = useWedding();
  const currencySymbol = target?.currencySymbol || (wedding?.currency === 'INR' ? '₹' : '$');

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<PaymentPayer>(target?.defaultPaidBy || 'split_50_50');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Wire / ACH');
  const [referenceNote, setReferenceNote] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(installments.length === 0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!target) return null;

  const totalAmount = Number(target.totalAmount) || 0;
  const totalPaid = installments.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
  const balanceDue = Math.max(0, totalAmount - totalPaid);
  const percentPaid = totalAmount > 0 ? Math.min(100, Math.round((totalPaid / totalAmount) * 100)) : 0;

  // Family breakdowns from installments
  const bridePaid = installments
    .filter((i) => i.paidBy === 'bride_side')
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0) +
    installments
      .filter((i) => i.paidBy === 'split_50_50')
      .reduce((acc, i) => acc + (Number(i.amount) || 0) / 2, 0);

  const groomPaid = installments
    .filter((i) => i.paidBy === 'groom_side')
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0) +
    installments
      .filter((i) => i.paidBy === 'split_50_50')
      .reduce((acc, i) => acc + (Number(i.amount) || 0) / 2, 0);

  const sortedInstallments = [...installments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleQuickPayFull = () => {
    if (balanceDue > 0) {
      setAmount(balanceDue.toString());
      setShowForm(true);
    }
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid payment amount greater than zero.');
      return;
    }
    if (!date) {
      alert('Please select a payment date.');
      return;
    }

    addPaymentInstallment(
      { type: target.type, id: target.id },
      {
        amount: parsedAmount,
        date,
        paidBy,
        paymentMethod,
        referenceNote: referenceNote.trim() || undefined,
        recordedAt: new Date().toISOString(),
      }
    );

    setFeedbackMsg(`Recorded installment of ${currencySymbol}${parsedAmount.toLocaleString()} successfully!`);
    setTimeout(() => setFeedbackMsg(null), 3000);

    setAmount('');
    setReferenceNote('');
    setShowForm(false);
  };

  const handleDeleteInstallment = (installmentId: string, installmentAmount: number) => {
    if (confirm(`Remove this installment of ${currencySymbol}${installmentAmount.toLocaleString()}?`)) {
      deletePaymentInstallment({ type: target.type, id: target.id }, installmentId);
    }
  };

  const formatCurr = (num: number) => {
    return `${currencySymbol}${num.toLocaleString()}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Milestone Payments & Installments"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs text-stone-800 max-h-[82vh] overflow-y-auto pr-1">
        {/* Header Contract Overview */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                  {target.category || target.type.toUpperCase()}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">
                  {target.type === 'budget' ? 'Budget Item' : target.type === 'vendor' ? 'Booked Vendor' : 'Venue'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif mt-1 text-white">
                {target.title}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Total Agreed</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                {formatCurr(totalAmount)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Paid: {formatCurr(totalPaid)} ({percentPaid}%)</span>
              </span>
              <span className={`font-bold ${balanceDue > 0 ? 'text-rose-300' : 'text-emerald-400'}`}>
                {balanceDue > 0 ? `Remaining Due: ${formatCurr(balanceDue)}` : 'Fully Paid ✓'}
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/15 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentPaid === 100
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                    : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                }`}
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>

          {/* Family actual contribution chips */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl flex items-center justify-between">
              <span className="text-rose-200">👰 Bride's Family Paid:</span>
              <strong className="font-mono text-white">{formatCurr(bridePaid)}</strong>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl flex items-center justify-between">
              <span className="text-blue-200">🤵 Groom's Family Paid:</span>
              <strong className="font-mono text-white">{formatCurr(groomPaid)}</strong>
            </div>
          </div>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Installments History Header & Action */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-stone-900 text-sm font-serif">
              Payment Timeline & Installment History
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[11px]">
              {installments.length}
            </span>
          </div>

          {!showForm && (
            <div className="flex items-center gap-2">
              {balanceDue > 0 && (
                <button
                  type="button"
                  onClick={handleQuickPayFull}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors tap-button active:scale-95"
                >
                  Pay Balance ({formatCurr(balanceDue)})
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 hover:opacity-95 text-white font-bold text-xs shadow-xs transition-all tap-button active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Record Payment</span>
              </button>
            </div>
          )}
        </div>

        {/* Form: Record New Installment */}
        {showForm && (
          <form
            onSubmit={handleRecordSubmit}
            className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3.5 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
              <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span>Record New Milestone Installment</span>
              </div>
              {installments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Amount Paid ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 5000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono font-bold text-stone-900 text-xs"
                  />
                </div>
                {balanceDue > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(balanceDue.toString())}
                    className="text-[10px] text-amber-800 hover:underline font-semibold mt-1 inline-block"
                  >
                    Auto-fill remaining balance: {formatCurr(balanceDue)}
                  </button>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Payment Date (When it happened) *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Who Paid */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Who Paid? (Family Side Attribution) *
                </label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value as PaymentPayer)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold text-stone-800 text-xs"
                >
                  {PAYER_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.sub})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-800 text-xs"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference Note / Check # */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Reference / Milestone Note (Check #, Wire ID, Milestone)
              </label>
              <input
                type="text"
                placeholder="e.g. Check #1042, 25% Booking Deposit, FedWire Ref, Tasting Milestone"
                value={referenceNote}
                onChange={(e) => setReferenceNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-stone-900 text-xs"
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              {installments.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs border border-stone-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all tap-button active:scale-95 cursor-pointer"
              >
                ✓ Save Payment Installment
              </button>
            </div>
          </form>
        )}

        {/* Installments List */}
        {sortedInstallments.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-stone-200 text-center space-y-2 bg-stone-50/50">
            <Clock className="w-8 h-8 text-stone-300 mx-auto" />
            <div className="font-bold text-stone-700 text-xs">No installments logged yet</div>
            <p className="text-[11px] text-stone-400 max-w-sm mx-auto">
              Record venue deposits, catering milestones, and vendor retainer checks as they happen over time to keep family splits exact.
            </p>
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-2 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs tap-button active:scale-95 cursor-pointer"
              >
                + Record First Installment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {sortedInstallments.map((inst, index) => {
              const payerOpt = PAYER_OPTIONS.find((p) => p.id === inst.paidBy) || PAYER_OPTIONS[2];
              const formattedDate = new Date(inst.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={inst.id}
                  className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                      #{sortedInstallments.length - index}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 text-sm font-mono">
                          {formatCurr(inst.amount)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${payerOpt.badgeClass}`}
                        >
                          {payerOpt.label} ({payerOpt.sub})
                        </span>
                        {inst.paymentMethod && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                            {inst.paymentMethod}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-stone-500 text-[11px] flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{formattedDate}</span>
                        </span>
                        {inst.referenceNote && (
                          <>
                            <span>•</span>
                            <span className="text-stone-700 font-medium italic">
                              "{inst.referenceNote}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteInstallment(inst.id, inst.amount)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete this installment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info note */}
        <div className="p-3 rounded-xl bg-stone-100 text-stone-600 text-[11px] leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <span>
            <strong>Family Expense Split Transparency:</strong> Every installment recorded here directly attributes real payments to the chosen family side, keeping your overall wedding budget split 100% accurate across all devices.
          </span>
        </div>
      </div>
    </Modal>
  );
};
