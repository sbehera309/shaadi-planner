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
  Calculator,
  Sparkles,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

const DESI_EXPENSE_PRESETS = [
  {
    title: 'Ballroom Lighting & AV Production (Uplights, Moving Heads)',
    category: 'Music, Dhol & Entertainment' as const,
    estimatedCost: 5500,
    paidBy: 'split_50_50' as const,
    icon: '💡',
    tip: 'Visual Comet / AV production company for perimeter uplights & dance spotlights',
  },
  {
    title: 'Live Nathswaram & Thavil / Shehnai Classical Musicians',
    category: 'Music, Dhol & Entertainment' as const,
    estimatedCost: 2500,
    paidBy: 'split_50_50' as const,
    icon: '🎺',
    tip: 'Traditional auspicious live instrumentalists during Mandap & Muhurat',
  },
  {
    title: 'Dual-Use Baraat & Vidai Car (Vintage Convertible / Luxury)',
    category: 'Accommodations & Transport' as const,
    estimatedCost: 2500,
    paidBy: 'groom_side' as const,
    icon: '🚗',
    tip: 'One vehicle for both Baraat procession & Vidai exit (saves horse + 2nd car fee!)',
  },
  {
    title: 'Baraat Horse (Ghodi) & Chhatri Handler + City Permit',
    category: 'Accommodations & Transport' as const,
    estimatedCost: 850,
    paidBy: 'groom_side' as const,
    icon: '🐎',
    tip: 'Traditional decorated mare procession with umbrella & city permit',
  },
  {
    title: 'Custom Monogram Dance Floor Vinyl Wrap (Onyx / White)',
    category: 'Decor & Mandap' as const,
    estimatedCost: 3200,
    paidBy: 'split_50_50' as const,
    icon: '✨',
    tip: 'Seamless glossy vinyl wrap with custom couple monogram logo',
  },
  {
    title: 'Vendor Meals Package (15 Crew Members @ $40/meal)',
    category: 'Venue & Catering' as const,
    estimatedCost: 600,
    paidBy: 'split_50_50' as const,
    icon: '🍽️',
    tip: 'Required hot meal plates for photo/video, DJ, AV, and coordinator team',
  },
  {
    title: 'Catering Staff Transport, Travel & 10% Gratuity',
    category: 'Venue & Catering' as const,
    estimatedCost: 8500,
    paidBy: 'split_50_50' as const,
    icon: '📜',
    tip: 'Mobile kitchen transport trailers & service gratuity for outside Indian caterers (e.g. Moghul)',
  },
  {
    title: 'Immediate Family Outfits (Matching Sarees, Kurtas & Safas)',
    category: 'Outfits & Jewellery' as const,
    estimatedCost: 10000,
    paidBy: 'split_50_50' as const,
    icon: '👗',
    tip: 'Ceremonial outfits for parents, siblings, bridesmaids, and family Safas',
  },
  {
    title: 'Auspicious Gold, Mangalsutra & Ritual Shagun Coins',
    category: 'Outfits & Jewellery' as const,
    estimatedCost: 3500,
    paidBy: 'groom_side' as const,
    icon: '🪙',
    tip: 'Sacred Gold Mangalsutra, wedding bands, and 24K gold blessing coins',
  },
  {
    title: 'Mithai Sweet Boxes (Formal Invites & Guest Return Favors)',
    category: 'Favors & Invites' as const,
    estimatedCost: 2000,
    paidBy: 'split_50_50' as const,
    icon: '🍬',
    tip: 'Artisanal Indian mithai boxes (Kaju Katli, Laddoos) with invitation packaging',
  },
  {
    title: 'Guest Airport Shuttle Vans & Hotel Transport (15-Passenger)',
    category: 'Accommodations & Transport' as const,
    estimatedCost: 3000,
    paidBy: 'split_50_50' as const,
    icon: '🚐',
    tip: 'Shuttle vans transporting out-of-town guests between hotel and venues',
  },
  {
    title: 'Vedic Priest / Iyer / Pandit Ji Dakshina & Travel',
    category: 'Pandit & Rituals' as const,
    estimatedCost: 2500,
    paidBy: 'split_50_50' as const,
    icon: '🪔',
    tip: 'Vedic officiant / Iyer dakshina, puja samagri kit, and travel reimbursement',
  },
];

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

  // Catering & Per-Plate Calculator State
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcData, setCalcData] = useState({
    eventName: 'Reception Dinner & Venue Fee',
    adultCount: 413,
    adultRate: 80,
    kidsCount: 35,
    kidsRate: 40,
    vendorCount: 15,
    vendorRate: 40,
    gratuityPercent: 10,
    staffTransportFee: 6200,
    salesTaxPercent: 6.625,
  });

  const handleSelectPreset = (preset: typeof DESI_EXPENSE_PRESETS[0]) => {
    setEditingItem(null);
    setFormData({
      title: preset.title,
      category: preset.category,
      estimatedCost: preset.estimatedCost,
      actualCost: preset.estimatedCost,
      paidAmount: 0,
      dueDate: '2026-10-15',
      paidBy: preset.paidBy,
      status: 'pending',
    });
    setIsModalOpen(true);
  };

  const handleSaveCateringFromCalculator = () => {
    const foodSubtotal =
      calcData.adultCount * calcData.adultRate +
      calcData.kidsCount * calcData.kidsRate +
      calcData.vendorCount * calcData.vendorRate;
    const gratuity = Math.round(foodSubtotal * (calcData.gratuityPercent / 100));
    const tax = Math.round(foodSubtotal * (calcData.salesTaxPercent / 100));

    // 1. Food plate costs
    addBudgetItem({
      title: `${calcData.eventName} Food Catering (${calcData.adultCount} Adults + ${calcData.kidsCount} Kids + ${calcData.vendorCount} Vendors)`,
      category: 'Venue & Catering',
      estimatedCost: foodSubtotal,
      actualCost: foodSubtotal,
      paidAmount: 0,
      dueDate: '2026-10-15',
      paidBy: 'split_50_50',
      status: 'pending',
    });

    // 2. Staff & Transport
    if (calcData.staffTransportFee > 0) {
      addBudgetItem({
        title: `${calcData.eventName} — Catering Staff Transport & Mobile Kitchen Setup`,
        category: 'Venue & Catering',
        estimatedCost: calcData.staffTransportFee,
        actualCost: calcData.staffTransportFee,
        paidAmount: 0,
        dueDate: '2026-10-15',
        paidBy: 'split_50_50',
        status: 'pending',
      });
    }

    // 3. Gratuity & Tax
    if (gratuity > 0 || tax > 0) {
      addBudgetItem({
        title: `${calcData.eventName} — Catering Gratuity (${calcData.gratuityPercent}%) & Sales Tax (${calcData.salesTaxPercent}%)`,
        category: 'Venue & Catering',
        estimatedCost: gratuity + tax,
        actualCost: gratuity + tax,
        paidAmount: 0,
        dueDate: '2026-10-15',
        paidBy: 'split_50_50',
        status: 'pending',
      });
    }

    setIsCalculatorOpen(false);
  };

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
      currency: wedding?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculations
  const totalTarget = wedding?.targetBudget || 0;
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
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-amber-300 hover:border-amber-500 text-stone-800 font-semibold text-xs shadow-xs hover:bg-amber-50/50 transition-all"
          >
            <Calculator className="w-4 h-4 text-amber-700" />
            <span>Catering & Per-Plate Calculator</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense Item</span>
          </button>
        </div>
      </div>

      {/* Real-World Desi Wedding Expense Quick-Add Presets */}
      <div className="bg-gradient-to-r from-amber-50/80 via-rose-50/40 to-stone-50 border border-amber-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-xs font-bold text-stone-900 font-serif">
              Common Desi American Wedding Expenses (Quick-Add)
            </h3>
          </div>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            Click any item to pre-fill realistic USA vendor costs & family splits
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {DESI_EXPENSE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:shadow-xs transition-all text-left shrink-0 group"
              title={preset.tip}
            >
              <span className="text-base">{preset.icon}</span>
              <div>
                <div className="text-[11px] font-semibold text-stone-800 group-hover:text-amber-800 line-clamp-1 max-w-[210px]">
                  {preset.title.split('(')[0].trim()}
                </div>
                <div className="text-[10px] text-stone-400 font-medium">
                  {formatCurr(preset.estimatedCost)} • {preset.paidBy.replace('_', ' ')}
                </div>
              </div>
            </button>
          ))}
        </div>
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

      {/* Mobile Expenses Card List */}
      <div className="sm:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
            <p className="text-sm font-semibold text-stone-700">No expenses recorded yet</p>
            <p className="text-xs text-stone-400 mt-1">
              Click "Add Expense Item" to track vendor deposits and family split payments.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const pending = item.actualCost - item.paidAmount;
            return (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-stone-500 font-medium">{item.category}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.paidBy === 'bride_side'
                        ? 'bg-rose-100 text-rose-800'
                        : item.paidBy === 'groom_side'
                        ? 'bg-blue-100 text-blue-800'
                        : item.paidBy === 'split_50_50'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {item.paidBy.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[10px]">Total Cost</span>
                    <strong className="text-stone-900 text-sm">{formatCurr(item.actualCost)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-700 font-bold block">Paid: {formatCurr(item.paidAmount)}</span>
                    <span className="text-rose-700 font-semibold text-[11px] block">Due: {formatCurr(pending)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${item.title}"?`)) {
                          deleteBudgetItem(item.id);
                        }
                      }}
                      className="p-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Expenses Table */}
      <div className="hidden sm:block bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/90 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider">
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

      {/* Catering & Per-Plate Calculator Modal */}
      <Modal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        title="Desi Catering & Per-Plate Cost Calculator"
        maxWidth="2xl"
      >
        <div className="space-y-5 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-stone-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900 block">USA Desi Catering Reality Check</span>
              Indian caterers (e.g. Moghul) bill per-adult-plate, discounted child plates, required vendor meals, mobile kitchen transport trailers, 10–20% staff gratuity, and state sales tax. Use this to prevent five-figure surprises!
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Event / Banquet Label *</label>
            <input
              type="text"
              value={calcData.eventName}
              onChange={(e) => setCalcData({ ...calcData, eventName: e.target.value })}
              placeholder="e.g. Reception Dinner Banquet or Wedding Day Lunch"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="font-bold text-stone-900 block">Adult Guests</span>
              <div>
                <label className="text-[10px] text-stone-500 block">Count</label>
                <input
                  type="number"
                  min={0}
                  value={calcData.adultCount}
                  onChange={(e) => setCalcData({ ...calcData, adultCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block">Rate / Plate ($)</label>
                <input
                  type="number"
                  min={0}
                  value={calcData.adultRate}
                  onChange={(e) => setCalcData({ ...calcData, adultRate: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div className="text-right text-[11px] font-bold text-stone-800 pt-1 border-t border-stone-200">
                {formatCurr(calcData.adultCount * calcData.adultRate)}
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="font-bold text-stone-900 block">Children (Half Plate)</span>
              <div>
                <label className="text-[10px] text-stone-500 block">Count</label>
                <input
                  type="number"
                  min={0}
                  value={calcData.kidsCount}
                  onChange={(e) => setCalcData({ ...calcData, kidsCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block">Rate / Plate ($)</label>
                <input
                  type="number"
                  min={0}
                  value={calcData.kidsRate}
                  onChange={(e) => setCalcData({ ...calcData, kidsRate: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div className="text-right text-[11px] font-bold text-stone-800 pt-1 border-t border-stone-200">
                {formatCurr(calcData.kidsCount * calcData.kidsRate)}
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <span className="font-bold text-stone-900 block">Vendor Crew Meals</span>
              <div>
                <label className="text-[10px] text-stone-500 block">Count (Photo, DJ, AV)</label>
                <input
                  type="number"
                  min={0}
                  value={calcData.vendorCount}
                  onChange={(e) => setCalcData({ ...calcData, vendorCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block">Rate / Plate ($)</label>
                <input
                  type="number"
                  min={0}
                  value={calcData.vendorRate}
                  onChange={(e) => setCalcData({ ...calcData, vendorRate: parseInt(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
                />
              </div>
              <div className="text-right text-[11px] font-bold text-stone-800 pt-1 border-t border-stone-200">
                {formatCurr(calcData.vendorCount * calcData.vendorRate)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Staff & Transport Fee ($)</label>
              <input
                type="number"
                min={0}
                value={calcData.staffTransportFee}
                onChange={(e) => setCalcData({ ...calcData, staffTransportFee: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 6200"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Service Gratuity (%)</label>
              <input
                type="number"
                step="0.5"
                min={0}
                max={30}
                value={calcData.gratuityPercent}
                onChange={(e) => setCalcData({ ...calcData, gratuityPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Sales Tax (%)</label>
              <input
                type="number"
                step="0.125"
                min={0}
                max={15}
                value={calcData.salesTaxPercent}
                onChange={(e) => setCalcData({ ...calcData, salesTaxPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              />
            </div>
          </div>

          {/* Breakdown summary card */}
          {(() => {
            const foodSub =
              calcData.adultCount * calcData.adultRate +
              calcData.kidsCount * calcData.kidsRate +
              calcData.vendorCount * calcData.vendorRate;
            const gratuityAmt = Math.round(foodSub * (calcData.gratuityPercent / 100));
            const taxAmt = Math.round(foodSub * (calcData.salesTaxPercent / 100));
            const grandTotal = foodSub + calcData.staffTransportFee + gratuityAmt + taxAmt;

            return (
              <div className="p-4 rounded-2xl bg-stone-900 text-stone-100 space-y-2">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Food Plates Subtotal ({calcData.adultCount + calcData.kidsCount + calcData.vendorCount} total plates):</span>
                  <span className="font-semibold text-white">{formatCurr(foodSub)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Staff Travel & Mobile Kitchen Transport:</span>
                  <span className="font-semibold text-white">{formatCurr(calcData.staffTransportFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Service Gratuity ({calcData.gratuityPercent}%):</span>
                  <span className="font-semibold text-white">{formatCurr(gratuityAmt)}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Sales Tax ({calcData.salesTaxPercent}%):</span>
                  <span className="font-semibold text-white">{formatCurr(taxAmt)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-700 text-sm font-bold">
                  <span className="text-amber-400">Grand Total Catering Commitment:</span>
                  <span className="text-amber-400 text-base">{formatCurr(grandTotal)}</span>
                </div>
              </div>
            );
          })()}

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveCateringFromCalculator}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold shadow-md shadow-rose-900/20 hover:opacity-95"
            >
              Save Catering Package to Budget
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
