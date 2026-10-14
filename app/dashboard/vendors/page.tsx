'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { Vendor } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  Briefcase,
  Plus,
  Phone,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  FileText,
  DollarSign,
} from 'lucide-react';

export default function VendorsPage() {
  const { wedding, vendors, addVendor, updateVendor, deleteVendor } = useWedding();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pandit Ji' as Vendor['category'],
    contactPerson: '',
    phone: '',
    email: '',
    agreedAmount: 50000,
    depositPaid: 10000,
    status: 'confirmed' as Vendor['status'],
    notes: '',
    deliverablesString: '',
  });

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Pandit Ji',
      contactPerson: '',
      phone: '',
      email: '',
      agreedAmount: 50000,
      depositPaid: 10000,
      status: 'confirmed',
      notes: '',
      deliverablesString: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email || '',
      agreedAmount: vendor.agreedAmount,
      depositPaid: vendor.depositPaid,
      status: vendor.status,
      notes: vendor.notes,
      deliverablesString: vendor.deliverables.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deliverables = formData.deliverablesString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      category: formData.category,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      agreedAmount: formData.agreedAmount,
      depositPaid: formData.depositPaid,
      status: formData.status,
      notes: formData.notes,
      deliverables,
    };

    if (editingVendor) {
      updateVendor(editingVendor.id, payload);
    } else {
      addVendor(payload);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Vendor Directory & Contracts
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage wedding professionals: Pandit ji, bridal mehndi artists, makeup stylists, photographers, and DJs.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendor Cards Grid */}
      {vendors.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-stone-900 font-serif">No vendors added yet</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Keep track of your contracts, agreed fees, and contacts for Pandit ji, MUA, Photo/Video, and DJs.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm mt-2"
          >
            + Add First Vendor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor) => {
          const balance = vendor.agreedAmount - vendor.depositPaid;
          return (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {vendor.category}
                    </span>
                    <h2 className="text-lg font-bold text-stone-900 mt-1.5 font-serif">
                      {vendor.name}
                    </h2>
                    <p className="text-xs text-stone-500">Contact: {vendor.contactPerson}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Edit Vendor"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${vendor.name}"?`)) deleteVendor(vendor.id);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <p className="mt-3 text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {vendor.notes}
                  </p>
                )}

                {/* Deliverables Checklist */}
                {vendor.deliverables.length > 0 && (
                  <div className="mt-4">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                      Key Deliverables
                    </span>
                    <ul className="space-y-1">
                      {vendor.deliverables.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-stone-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Bottom Financial & Action Row */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-stone-500 text-[11px]">Contract / Balance Due</div>
                  <div className="font-bold text-stone-900">
                    {formatCurr(vendor.agreedAmount)}{' '}
                    <span className="text-rose-700 font-normal">
                      (Due: {formatCurr(balance)})
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${vendor.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>{vendor.phone}</span>
                </a>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Details' : 'Add Wedding Professional / Vendor'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Company / Studio / Pandit Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Geetanjali Bridal Mehndi Studio"
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
                <option value="Pandit Ji">Pandit Ji / Priest / Iyer / Officiant</option>
                <option value="Mehendi Artist">Mehendi Artist</option>
                <option value="Bridal MUA & Hair">Bridal MUA & Hair</option>
                <option value="Photographer & Cinematographer">Photographer & Cinematographer</option>
                <option value="Choreographer & DJ">Choreographer, Dhol & DJ</option>
                <option value="Lighting & AV Production">Lighting & AV Production (Visual Comet / Moving Heads)</option>
                <option value="Baraat & Farewell Transport">Baraat & Farewell Transport (Horse / Car / Van)</option>
                <option value="Live Musicians (Nathswaram/Shehnai)">Live Musicians (Nathswaram, Shehnai & Thavil)</option>
                <option value="Mandap & Floral Decorator">Mandap & Floral Decorator</option>
                <option value="Catering">Catering & Sweet Halwai (e.g. Moghul)</option>
                <option value="Wedding Planner & Coordinator">Wedding Planner & Coordinator</option>
                <option value="Trousseau / Attire">Trousseau & Attire Designer</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="confirmed">Confirmed</option>
                <option value="negotiating">Negotiating</option>
                <option value="contacted">Contacted</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Contact Person Name</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Aditya Kashyap"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Total Agreed Fee</label>
              <input
                type="number"
                min={0}
                value={formData.agreedAmount}
                onChange={(e) => setFormData({ ...formData, agreedAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Deposit Paid</label>
              <input
                type="number"
                min={0}
                value={formData.depositPaid}
                onChange={(e) => setFormData({ ...formData, depositPaid: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Key Deliverables (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.deliverablesString}
              onChange={(e) => setFormData({ ...formData, deliverablesString: e.target.value })}
              placeholder="e.g. 4K Video Teaser, Candid album, Drone coverage"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Notes / Instructions</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requirements, timings, or diet preferences..."
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
              {editingVendor ? 'Save Changes' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
