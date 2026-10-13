'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { ShagunRecord, WeddingSide } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  Gift,
  Plus,
  Coins,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Search,
  MessageCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function ShagunPage() {
  const { wedding, shagunRecords, addShagunRecord, updateShagunRecord, deleteShagunRecord, toggleShagunThankYou } =
    useWedding();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ShagunRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    giverName: '',
    relationship: '',
    side: 'bride' as WeddingSide,
    city: '',
    type: 'cash_lifafa' as ShagunRecord['type'],
    amount: 11000,
    giftDescription: '',
    receivedAtEvent: 'Shubh Vivah (Pheras)',
    pastGivenRecord: '',
    thankYouSent: false,
    date: '2026-11-22',
  });

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      giverName: '',
      relationship: '',
      side: 'bride',
      city: '',
      type: 'cash_lifafa',
      amount: 11000,
      giftDescription: '',
      receivedAtEvent: 'Shubh Vivah (Pheras)',
      pastGivenRecord: '',
      thankYouSent: false,
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: ShagunRecord) => {
    setEditingRecord(rec);
    setFormData({
      giverName: rec.giverName,
      relationship: rec.relationship,
      side: rec.side,
      city: rec.city,
      type: rec.type,
      amount: rec.amount || 0,
      giftDescription: rec.giftDescription || '',
      receivedAtEvent: rec.receivedAtEvent,
      pastGivenRecord: rec.pastGivenRecord || '',
      thankYouSent: rec.thankYouSent,
      date: rec.date,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      updateShagunRecord(editingRecord.id, formData);
    } else {
      addShagunRecord(formData);
    }
    setIsModalOpen(false);
  };

  const formatCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wedding?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metrics
  const totalCash = shagunRecords.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalGoldGifts = shagunRecords.filter((s) => s.type === 'gold_silver').length;
  const thankYouCount = shagunRecords.filter((s) => s.thankYouSent).length;

  const filteredRecords = shagunRecords.filter((rec) => {
    const matchesSearch =
      rec.giverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.relationship.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || rec.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Shagun & Lifafa (Gift) Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Digitally track cash envelopes, gold gifts, family reciprocity records, and thank-you dispatches.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-900/20 hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Shagun / Lifafa</span>
        </button>
      </div>

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Total Cash Shagun Received
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{formatCurr(totalCash)}</div>
          <div className="mt-1 text-xs text-stone-500">
            From {shagunRecords.filter((s) => s.type === 'cash_lifafa').length} cash lifafa envelopes
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Gold / Precious Keepsakes
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{totalGoldGifts} items</div>
          <div className="mt-1 text-xs text-stone-500">Gold coins, silver sets & jewellery</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            Thank-You Notes Dispatched
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">
            {thankYouCount} / {shagunRecords.length}
          </div>
          <div className="mt-1 text-xs text-stone-500">
            {shagunRecords.length - thankYouCount} thank-yous remaining
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between text-xs">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by relative's name, relationship, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-stone-600">Gift Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">All Gifts</option>
            <option value="cash_lifafa">Cash Lifafa ($ Envelope)</option>
            <option value="gold_silver">Gold / Silver Item</option>
            <option value="physical_gift">Physical Gift</option>
          </select>
        </div>
      </div>

      {/* Shagun Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Relative / Giver</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Gift / Amount</th>
                <th className="py-3 px-4">Event Received At</th>
                <th className="py-3 px-4">Reciprocity (Past Ledger)</th>
                <th className="py-3 px-4">Thank You</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-semibold text-stone-700">No gifts or cash lifafas logged yet</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Log cash envelopes, gold keepsakes, and family reciprocity notes as you receive gifts.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{rec.giverName}</div>
                    <div className="text-[11px] text-stone-500">{rec.relationship} • {rec.city}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                        rec.side === 'bride'
                          ? 'bg-rose-100 text-rose-800'
                          : rec.side === 'groom'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {rec.side === 'bride' ? 'Bride Side' : 'Groom Side'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {rec.type === 'cash_lifafa' ? (
                      <span className="font-bold text-emerald-700 text-sm">
                        {formatCurr(rec.amount || 0)}
                      </span>
                    ) : (
                      <div>
                        <span className="font-bold text-amber-700 block">
                          ✨ {rec.giftDescription || 'Precious Keepsake'}
                        </span>
                        {rec.amount && (
                          <span className="text-[11px] text-stone-400">Valued ~ {formatCurr(rec.amount)}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600 font-medium">
                    {rec.receivedAtEvent}
                  </td>
                  <td className="py-3.5 px-4">
                    {rec.pastGivenRecord ? (
                      <div className="text-[11px] text-stone-600 bg-amber-50/80 px-2 py-1 rounded-md border border-amber-200/50 max-w-[200px]">
                        🔄 {rec.pastGivenRecord}
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleShagunThankYou(rec.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                        rec.thankYouSent
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      {rec.thankYouSent ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Sent</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(rec)}
                        className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete shagun entry for "${rec.giverName}"?`)) {
                            deleteShagunRecord(rec.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Shagun Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Edit Shagun Record' : 'Record Shagun Lifafa / Wedding Gift'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Relative / Guest Name *</label>
            <input
              type="text"
              required
              value={formData.giverName}
              onChange={(e) => setFormData({ ...formData, giverName: e.target.value })}
              placeholder="e.g. Dr. Harshvardhan Mehta (Mama Ji)"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Relationship / Role</label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g. Maternal Uncle, Bride's Colleague"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Side *</label>
              <select
                value={formData.side}
                onChange={(e) => setFormData({ ...formData, side: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="bride">Bride's Side (Ladkiwale)</option>
                <option value="groom">Groom's Side (Ladkewale)</option>
                <option value="mutual">Mutual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Gift Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="cash_lifafa">Cash Lifafa ($ Envelope)</option>
                <option value="gold_silver">Gold / Silver Keepsake</option>
                <option value="physical_gift">Physical Gift</option>
                <option value="voucher">Gift Voucher</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                {formData.type === 'cash_lifafa' ? 'Cash Amount ($ USD) *' : 'Estimated Value ($)'}
              </label>
              <input
                type="number"
                min={0}
                required={formData.type === 'cash_lifafa'}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {formData.type !== 'cash_lifafa' && (
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Gift Description</label>
              <input
                type="text"
                value={formData.giftDescription}
                onChange={(e) => setFormData({ ...formData, giftDescription: e.target.value })}
                placeholder="e.g. 10g 24K Gold Coin, Silver keepsake"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Ceremony Received At</label>
              <input
                type="text"
                value={formData.receivedAtEvent}
                onChange={(e) => setFormData({ ...formData, receivedAtEvent: e.target.value })}
                placeholder="e.g. Sangeet, Shubh Vivah, Reception"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Home City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Edison, NJ or San Jose, CA"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Reciprocity / Past Reference Note
            </label>
            <input
              type="text"
              value={formData.pastGivenRecord}
              onChange={(e) => setFormData({ ...formData, pastGivenRecord: e.target.value })}
              placeholder="e.g. Family gave $501 at their daughter's wedding in 2024"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              {editingRecord ? 'Save Changes' : 'Record Gift'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
