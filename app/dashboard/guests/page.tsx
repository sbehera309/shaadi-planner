'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { Guest, WeddingSide, DietaryTag, RsvpStatus } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  Trash2,
  Edit2,
  Download,
} from 'lucide-react';

export default function GuestsPage() {
  const { guests, events, addGuest, updateGuest, deleteGuest, updateGuestRsvp } = useWedding();
  const [searchTerm, setSearchTerm] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | WeddingSide>('all');
  const [dietFilter, setDietFilter] = useState<'all' | DietaryTag>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    side: 'bride' as WeddingSide,
    familyGroup: '',
    adultsCount: 2,
    kidsCount: 0,
    dietaryPreference: 'Strict Veg' as DietaryTag,
    city: '',
    needsPickup: false,
    hotelAssigned: '',
    roomNumber: '',
    notes: '',
    eventRsvps: {} as Record<string, RsvpStatus>,
  });

  const handleOpenAdd = () => {
    setEditingGuest(null);
    const defaultRsvps: Record<string, RsvpStatus> = {};
    events.forEach((ev) => {
      defaultRsvps[ev.id] = 'attending';
    });
    setFormData({
      name: '',
      phone: '',
      email: '',
      side: 'bride',
      familyGroup: '',
      adultsCount: 2,
      kidsCount: 0,
      dietaryPreference: 'Strict Veg',
      city: '',
      needsPickup: false,
      hotelAssigned: '',
      roomNumber: '',
      notes: '',
      eventRsvps: defaultRsvps,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      name: guest.name,
      phone: guest.phone,
      email: guest.email || '',
      side: guest.side,
      familyGroup: guest.familyGroup,
      adultsCount: guest.adultsCount,
      kidsCount: guest.kidsCount,
      dietaryPreference: guest.dietaryPreference,
      city: guest.city,
      needsPickup: guest.needsPickup,
      hotelAssigned: guest.hotelAssigned || '',
      roomNumber: guest.roomNumber || '',
      notes: guest.notes || '',
      eventRsvps: { ...guest.eventRsvps },
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuest) {
      updateGuest(editingGuest.id, formData);
    } else {
      addGuest(formData);
    }
    setIsModalOpen(false);
  };

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.familyGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm);

    const matchesSide = sideFilter === 'all' || g.side === sideFilter;
    const matchesDiet = dietFilter === 'all' || g.dietaryPreference === dietFilter;

    return matchesSearch && matchesSide && matchesDiet;
  });

  const totalFilteredHeadcount = filteredGuests.reduce(
    (acc, g) => acc + g.adultsCount + g.kidsCount,
    0
  );

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Side', 'Group', 'Adults', 'Kids', 'Diet', 'City', 'Pickup', 'Hotel'];
    const rows = filteredGuests.map((g) => [
      `"${g.name}"`,
      `"${g.phone}"`,
      g.side,
      `"${g.familyGroup}"`,
      g.adultsCount,
      g.kidsCount,
      g.dietaryPreference,
      `"${g.city}"`,
      g.needsPickup ? 'Yes' : 'No',
      `"${g.hotelAssigned || ''} ${g.roomNumber || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'shaadi_guest_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Guest List & Sub-Event RSVPs
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track Ladkewale vs Ladkiwale invitations, dietary restrictions (Jain/Strict Veg), and event headcounts.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest / Family</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search guest name, family group, phone, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Side Pill Filters */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setSideFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              sideFilter === 'all' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({guests.length})
          </button>
          <button
            onClick={() => setSideFilter('bride')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              sideFilter === 'bride' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-800 hover:bg-rose-50'
            }`}
          >
            👰 Bride's Side
          </button>
          <button
            onClick={() => setSideFilter('groom')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              sideFilter === 'groom' ? 'bg-blue-700 text-white shadow-xs' : 'text-blue-800 hover:bg-blue-50'
            }`}
          >
            🤵 Groom's Side
          </button>
          <button
            onClick={() => setSideFilter('mutual')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              sideFilter === 'mutual' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-800 hover:bg-purple-50'
            }`}
          >
            🤝 Mutual
          </button>
        </div>

        {/* Dietary Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
          >
            <option value="all">All Diets</option>
            <option value="Strict Veg">Strict Veg</option>
            <option value="Jain">Jain (No Root Veg)</option>
            <option value="Swaminarayan">Swaminarayan</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Halal">Halal</option>
          </select>
        </div>
      </div>

      {/* Guest Summary Stat Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-amber-900">
        <span>
          Showing <strong>{filteredGuests.length}</strong> families representing{' '}
          <strong>{totalFilteredHeadcount}</strong> total guests (adults + children).
        </span>
        <span className="font-medium">
          Pickup Required: <strong>{filteredGuests.filter((g) => g.needsPickup).length}</strong> families
        </span>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Guest / Family Unit</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Dietary</th>
                <th className="py-3 px-4">Logistics</th>
                <th className="py-3 px-4">Event RSVPs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-semibold text-stone-700">No guests added yet</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Add families to track RSVPs, side tags (Bride vs Groom), and dietary preferences.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-stone-50/70 transition-colors">
                  {/* Guest Name & Details */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{guest.name}</div>
                    <div className="text-[11px] text-stone-500">{guest.familyGroup}</div>
                    <div className="text-[11px] text-stone-400">{guest.phone} • {guest.city}</div>
                  </td>

                  {/* Side */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                        guest.side === 'bride'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : guest.side === 'groom'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {guest.side === 'bride' ? 'Bride (Ladkiwale)' : guest.side === 'groom' ? 'Groom (Ladkewale)' : 'Mutual'}
                    </span>
                  </td>

                  {/* Headcount */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-800">
                      {guest.adultsCount + guest.kidsCount} total
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {guest.adultsCount} Adults {guest.kidsCount > 0 && `• ${guest.kidsCount} Kids`}
                    </div>
                  </td>

                  {/* Dietary */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-medium text-[11px] ${
                        guest.dietaryPreference === 'Jain'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : guest.dietaryPreference === 'Strict Veg'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {guest.dietaryPreference}
                    </span>
                  </td>

                  {/* Logistics */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {guest.needsPickup && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-sm inline-block">
                          <Car className="w-3 h-3 text-amber-600 inline" /> Pickup Needed
                        </div>
                      )}
                      {guest.hotelAssigned ? (
                        <div className="text-[11px] text-stone-600 truncate max-w-[120px]">
                          🏨 {guest.roomNumber || guest.hotelAssigned}
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-400">No room mapped</div>
                      )}
                    </div>
                  </td>

                  {/* Multi-Event RSVP Badges */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {events.map((ev) => {
                        const status = guest.eventRsvps[ev.id] || 'attending';
                        return (
                          <button
                            key={ev.id}
                            title={`${ev.name}: ${status}`}
                            onClick={() => {
                              const nextStatus: RsvpStatus =
                                status === 'attending'
                                  ? 'declined'
                                  : status === 'declined'
                                  ? 'tentative'
                                  : 'attending';
                              updateGuestRsvp(guest.id, ev.id, nextStatus);
                            }}
                            className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold border ${
                              status === 'attending'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : status === 'declined'
                                ? 'bg-rose-50 text-rose-700 border-rose-300 line-through'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            {ev.type.slice(0, 3).toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(guest)}
                        className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Guest"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${guest.name}" from guest list?`)) {
                            deleteGuest(guest.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Guest"
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

      {/* Add / Edit Guest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? 'Edit Guest / Family Unit' : 'Add Guest or Family Group'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Primary Guest / Family Head *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rajan & Sunita Verma"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Side *</label>
              <select
                value={formData.side}
                onChange={(e) => setFormData({ ...formData, side: e.target.value as WeddingSide })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="bride">Bride (Ladkiwale)</option>
                <option value="groom">Groom (Ladkewale)</option>
                <option value="mutual">Mutual / College / Work Friends</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Family Group / Tag</label>
              <input
                type="text"
                value={formData.familyGroup}
                onChange={(e) => setFormData({ ...formData, familyGroup: e.target.value })}
                placeholder="e.g. Mama Ji's Family, Groom Chachi Side"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Adults Count *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.adultsCount}
                onChange={(e) => setFormData({ ...formData, adultsCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Kids Count</label>
              <input
                type="number"
                min={0}
                value={formData.kidsCount}
                onChange={(e) => setFormData({ ...formData, kidsCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Dietary Restriction *</label>
              <select
                value={formData.dietaryPreference}
                onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as DietaryTag })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="Strict Veg">Strict Vegetarian</option>
                <option value="Jain">Jain (No Root Veg)</option>
                <option value="Swaminarayan">Swaminarayan</option>
                <option value="Non-Veg">Non-Vegetarian</option>
                <option value="Halal">Halal</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">WhatsApp / Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Home City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. New Delhi, Mumbai, London"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Transit & Hotel info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Assigned Hotel</label>
              <input
                type="text"
                value={formData.hotelAssigned}
                onChange={(e) => setFormData({ ...formData, hotelAssigned: e.target.value })}
                placeholder="e.g. The Oberoi Udaivilas"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Room / Villa No.</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. Villa 101, Room 204"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pickup"
                checked={formData.needsPickup}
                onChange={(e) => setFormData({ ...formData, needsPickup: e.target.checked })}
                className="rounded-sm border-stone-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="pickup" className="font-medium text-stone-700">
                Needs airport or railway pickup shuttle
              </label>
            </div>
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
              className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold shadow-sm"
            >
              {editingGuest ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
