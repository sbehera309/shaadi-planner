'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { RoomAllocation } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  Hotel,
  Plus,
  Car,
  Users,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Phone,
  UserPlus,
} from 'lucide-react';

export default function LogisticsPage() {
  const { rooms, guests, addRoom, updateRoom, deleteRoom, assignGuestToRoom, removeGuestFromRoom } =
    useWedding();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomAllocation | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    hotelName: '',
    roomNumber: '',
    roomType: 'Deluxe' as RoomAllocation['roomType'],
    capacity: 4,
    checkInDate: '2026-11-20',
    checkOutDate: '2026-11-24',
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      hotelName: 'The Oberoi Udaivilas',
      roomNumber: '',
      roomType: 'Deluxe',
      capacity: 4,
      checkInDate: '2026-11-20',
      checkOutDate: '2026-11-24',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: RoomAllocation) => {
    setEditingRoom(room);
    setFormData({
      hotelName: room.hotelName,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      checkInDate: room.checkInDate,
      checkOutDate: room.checkOutDate,
      notes: room.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoom(editingRoom.id, formData);
    } else {
      addRoom({
        ...formData,
        assignedGuestIds: [],
      });
    }
    setIsModalOpen(false);
  };

  // Guests needing transit pickup
  const pickupGuests = guests.filter((g) => g.needsPickup);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Accommodations & Transit Logistics
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage hotel room inventory blocks, family allocations, and airport/railway arrival pickups.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-stone-900 to-amber-900 text-white font-semibold text-xs shadow-md shadow-stone-900/20 hover:opacity-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Room / Villa</span>
        </button>
      </div>

      {/* Transit Pickups Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                Airport & Transit Pickups Required ({pickupGuests.length} Families)
              </h2>
              <p className="text-xs text-stone-500">
                Guests requiring airport shuttles (e.g. EWR, JFK, LGA, ORD, SFO) upon arrival
              </p>
            </div>
          </div>
        </div>

        {pickupGuests.length === 0 ? (
          <div className="p-8 text-center bg-stone-50/60 rounded-xl border border-stone-200">
            <p className="text-xs text-stone-500">
              No airport pickups requested yet. When guests indicate they need an airport shuttle in their RSVP, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pickupGuests.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between text-xs space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900">{g.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      {g.adultsCount + g.kidsCount} Pax
                    </span>
                  </div>
                  <div className="text-stone-500 text-[11px] mt-0.5">{g.familyGroup} • From {g.city}</div>
                  {g.hotelAssigned && (
                    <div className="mt-1 text-stone-700 font-medium text-[11px]">
                      🏨 Drop-off: {g.hotelAssigned} {g.roomNumber}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px]">
                  <a
                    href={`tel:${g.phone}`}
                    className="flex items-center gap-1 text-rose-700 font-semibold hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{g.phone}</span>
                  </a>
                  <span className="text-stone-400">Diet: {g.dietaryPreference}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Room Inventory Matrix */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif text-stone-900">
          Hotel Room Allocation Matrix ({rooms.length} Rooms)
        </h2>

        {rooms.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <Hotel className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif">No hotel room blocks added yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Track room blocks at your wedding hotel (e.g. Hyatt, Marriott, Hilton), group booking codes, and occupant assignments.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-xs shadow-sm mt-2"
            >
              + Add Room Block
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const assignedGuests = guests.filter((g) => room.assignedGuestIds.includes(g.id));
            const totalAssignedPax = assignedGuests.reduce(
              (acc, g) => acc + g.adultsCount + g.kidsCount,
              0
            );

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                        {room.roomType}
                      </span>
                      <h3 className="text-lg font-bold text-stone-900 mt-1 font-serif">
                        {room.roomNumber} • {room.hotelName}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {new Date(room.checkInDate).toLocaleDateString()} -{' '}
                          {new Date(room.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Edit Room"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete room "${room.roomNumber}"?`)) deleteRoom(room.id);
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Room Notes */}
                  {room.notes && (
                    <p className="mt-3 text-xs text-stone-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      📝 {room.notes}
                    </p>
                  )}

                  {/* Assigned Guests */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-stone-600 uppercase tracking-wider text-[11px]">
                        Allocated Occupants ({totalAssignedPax}/{room.capacity} Pax)
                      </span>
                    </div>

                    {assignedGuests.length > 0 ? (
                      <div className="space-y-2">
                        {assignedGuests.map((ag) => (
                          <div
                            key={ag.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-stone-900">{ag.name}</span>
                              <span className="text-stone-500 text-[11px] ml-2">
                                ({ag.adultsCount} Adults {ag.kidsCount > 0 && `+ ${ag.kidsCount} Kids`})
                              </span>
                            </div>
                            <button
                              onClick={() => removeGuestFromRoom(room.id, ag.id)}
                              className="text-stone-400 hover:text-rose-600 text-xs transition-colors"
                              title="Unassign"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-400">
                        Room currently vacant
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Assign Guest Dropdown */}
                <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs">
                  <UserPlus className="w-3.5 h-3.5 text-stone-400" />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        assignGuestToRoom(room.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 focus:outline-hidden text-xs"
                  >
                    <option value="" disabled>
                      Assign family to this room...
                    </option>
                    {guests
                      .filter((g) => !room.assignedGuestIds.includes(g.id))
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.adultsCount + g.kidsCount} pax - {g.side})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Edit Room Allocation' : 'Add Hotel Room / Villa'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Hotel / Resort Name *</label>
            <input
              type="text"
              required
              value={formData.hotelName}
              onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
              placeholder="e.g. The Oberoi Udaivilas"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Room / Villa No. *</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. Villa 101, Room 304"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Room Type *</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900 bg-white"
              >
                <option value="Deluxe">Deluxe Room</option>
                <option value="Suite">Palace Suite</option>
                <option value="Villa">Luxury Villa</option>
                <option value="Double Bed">Double Bed Standard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Pax Capacity *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Check-in *</label>
              <input
                type="date"
                required
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Check-out *</label>
              <input
                type="date"
                required
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Notes / Guest Requests</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Extra baby cot required, lake-facing preference"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
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
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold shadow-sm"
            >
              {editingRoom ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
