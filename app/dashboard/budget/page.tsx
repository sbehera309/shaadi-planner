'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { BudgetItem } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  WalletCards,
  Plus,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Edit2,
  PieChart,
  ArrowDownRight,
} from 'lucide-react';

export default function BudgetPage() {
  const { wedding, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useWedding();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSplit, setSelectedSplit] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Venue & Catering' as BudgetItem['category'],
    estimatedCost: 5000,
    actualCost: 5000,
    paidAmount: 2000,
    dueDate: '2026-10-15',
    paidBy: 'split_50_50' as BudgetItem['paidBy'],
    status: 'partial' as BudgetItem['status'],
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Venue & Catering',
      estimatedCost: 5000,
      actualCost: 5000,
      paidAmount: 0,
      dueDate: '2026-10-15',
      paidBy: 'split_50_50',
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      paidAmount: item.paidAmount,
      dueDate: item.dueDate,
      paidBy: item.paidBy,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedStatus: BudgetItem['status'] =
      formData.paidAmount >= formData.actualCost
        ? 'paid'
        : formData.paidAmount > 0
        ? 'partial'
        : 'pending';

    const payload = { ...formData, status: calculatedStatus };

    if (editingItem) {
      updateBudgetItem(editingItem.id, payload);
    } else {
      addBudgetItem(payload);
    }
    setIsModalOpen(false);
  };

  const formatCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wedding.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculations
  const totalTarget = wedding.targetBudget;
  const totalCommitted = budgetItems.reduce((acc, b) => acc + b.actualCost, 0);
  const totalPaid = budgetItems.reduce((acc, b) => acc + b.paidAmount, 0);
  const totalPending = totalCommitted - totalPaid;

  const brideTotal = budgetItems
    .filter((b) => b.paidBy === 'bride_side')
    .reduce((acc, b) => acc + b.actualCost, 0);
  const groomTotal = budgetItems
    .filter((b) => b.paidBy === 'groom_side')
    .reduce((acc, b) => acc + b.actualCost, 0);
  const splitTotal = budgetItems
    .filter((b) => b.paidBy === 'split_50_50')
    .reduce((acc, b) => acc + b.actualCost, 0);

  // Filter
  const filteredItems = budgetItems.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSplit = selectedSplit === 'all' || item.paidBy === selectedSplit;
    return matchCat && matchSplit;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Budget & Family Expense Splitting
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track deposits, vendor installments, and clear side-wise splits between Ladkewale & Ladkiwale.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* Top 3 Split Cards: Bride vs Groom vs Shared */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs relative overflow-hidden">
          <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
            Bride's Family (Ladkiwale)
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{formatCurr(brideTotal)}</div>
          <div className="mt-2 text-xs text-stone-500 flex justify-between">
            <span>
              Paid:{' '}
              <strong className="text-emerald-700">
                {formatCurr(
                  budgetItems
                    .filter((b) => b.paidBy === 'bride_side')
                    .reduce((acc, b) => acc + b.paidAmount, 0)
                )}
              </strong>
            </span>
            <span>
              Due:{' '}
              <strong className="text-rose-700">
                {formatCurr(
                  brideTotal -
                    budgetItems
                      .filter((b) => b.paidBy === 'bride_side')
                      .reduce((acc, b) => acc + b.paidAmount, 0)
                )}
              </strong>
            </span>
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs relative overflow-hidden">
          <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            Groom's Family (Ladkewale)
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{formatCurr(groomTotal)}</div>
          <div className="mt-2 text-xs text-stone-500 flex justify-between">
            <span>
              Paid:{' '}
              <strong className="text-emerald-700">
                {formatCurr(
                  budgetItems
                    .filter((b) => b.paidBy === 'groom_side')
                    .reduce((acc, b) => acc + b.paidAmount, 0)
                )}
              </strong>
            </span>
            <span>
              Due:{' '}
              <strong className="text-blue-700">
                {formatCurr(
                  groomTotal -
                    budgetItems
                      .filter((b) => b.paidBy === 'groom_side')
                      .reduce((acc, b) => acc + b.paidAmount, 0)
                )}
              </strong>
            </span>
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-blue-500" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs relative overflow-hidden">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Shared 50-50 Split
          </div>
          <div className="mt-2 text-2xl font-bold text-stone-900">{formatCurr(splitTotal)}</div>
          <div className="mt-2 text-xs text-stone-500 flex justify-between">
            <span>Each Family: <strong>{formatCurr(splitTotal / 2)}</strong></span>
            <span>
              Due:{' '}
              <strong className="text-amber-700">
                {formatCurr(
                  splitTotal -
                    budgetItems
                      .filter((b) => b.paidBy === 'split_50_50')
                      .reduce((acc, b) => acc + b.paidAmount, 0)
                )}
              </strong>
            </span>
          </div>
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap gap-4 items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-600">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="Venue & Catering">Venue & Catering</option>
            <option value="Decor & Mandap">Decor & Mandap</option>
            <option value="Photography & Film">Photography & Film</option>
            <option value="Outfits & Jewellery">Outfits & Jewellery</option>
            <option value="Bridal MUA & Mehendi">Bridal MUA & Mehendi</option>
            <option value="Music, Dhol & Entertainment">Music, Dhol & Entertainment</option>
            <option value="Pandit & Rituals">Pandit & Rituals</option>
            <option value="Accommodations & Transport">Accommodations & Transport</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-600">Paid By:</span>
          <select
            value={selectedSplit}
            onChange={(e) => setSelectedSplit(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Splits</option>
            <option value="bride_side">Bride Side</option>
            <option value="groom_side">Groom Side</option>
            <option value="split_50_50">50-50 Split</option>
            <option value="couple">Couple</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Item / Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost</th>
                <th className="py-3 px-4">Paid / Due</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Split Assignment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-sm font-semibold text-stone-700">No expenses recorded yet</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Click "Add Expense Item" to track vendor deposits, venue fees, and family split payments.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                const pending = item.actualCost - item.paidAmount;
                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{item.title}</div>
                      <div className="text-[11px] text-stone-400">Est: {formatCurr(item.estimatedCost)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{item.category}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{formatCurr(item.actualCost)}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-emerald-700 font-semibold">
                        Paid: {formatCurr(item.paidAmount)}
                      </div>
                      <div className="text-rose-700 text-[11px]">
                        Due: {formatCurr(pending)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.paidBy === 'bride_side'
                            ? 'bg-rose-100 text-rose-800'
                            : item.paidBy === 'groom_side'
                            ? 'bg-blue-100 text-blue-800'
                            : item.paidBy === 'split_50_50'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.paidBy === 'bride_side'
                          ? 'Bride Side'
                          : item.paidBy === 'groom_side'
                          ? 'Groom Side'
                          : item.paidBy === 'split_50_50'
                          ? '50-50 Split'
                          : 'Couple'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          item.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${item.title}"?`)) deleteBudgetItem(item.id);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Expense Item' : 'Add New Expense Item'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Expense Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Wedding Photography 3-day package"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="Venue & Catering">Venue & Catering</option>
                <option value="Decor & Mandap">Decor & Mandap</option>
                <option value="Photography & Film">Photography & Film</option>
                <option value="Outfits & Jewellery">Outfits & Jewellery</option>
                <option value="Bridal MUA & Mehendi">Bridal MUA & Mehendi</option>
                <option value="Music, Dhol & Entertainment">Music, Dhol & Entertainment</option>
                <option value="Pandit & Rituals">Pandit & Rituals</option>
                <option value="Accommodations & Transport">Accommodations & Transport</option>
                <option value="Favors & Invites">Favors & Invites</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Paid By (Family Split) *</label>
              <select
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="split_50_50">Split 50-50 Shared</option>
                <option value="bride_side">Bride's Family (Ladkiwale)</option>
                <option value="groom_side">Groom's Family (Ladkewale)</option>
                <option value="couple">Couple</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Estimated Cost</label>
              <input
                type="number"
                min={0}
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Actual / Agreed Cost *</label>
              <input
                type="number"
                min={0}
                required
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Advance / Paid So Far *</label>
              <input
                type="number"
                min={0}
                required
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Balance Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
            >
              {editingItem ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
