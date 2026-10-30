'use client';

import React, { useState, useEffect } from 'react';
import { ProfileSavedAddress } from '@/lib/types';
import {
  Bookmark,
  MapPin,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  Compass,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ProfileAddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAddresses: ProfileSavedAddress[];
  userEmail?: string | null;
  onSelectAddress?: (address: ProfileSavedAddress, targetSide?: 'groom' | 'bride') => void;
  onDeleteAddress: (id: string) => Promise<void> | void;
  onUpdateDetails: (id: string, updates: Partial<Pick<ProfileSavedAddress, 'label' | 'side'>>) => Promise<void> | void;
  onAddNewAddress?: () => void;
  defaultTargetSide?: 'groom' | 'bride';
}

export default function ProfileAddressBookModal({
  isOpen,
  onClose,
  savedAddresses,
  userEmail,
  onSelectAddress,
  onDeleteAddress,
  onUpdateDetails,
  defaultTargetSide,
}: ProfileAddressBookModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSide, setEditSide] = useState<'groom' | 'bride' | 'mutual' | 'other'>('mutual');
  const [filterSide, setFilterSide] = useState<'all' | 'groom' | 'bride'>(
    defaultTargetSide || 'all'
  );

  useEffect(() => {
    if (isOpen) {
      if (defaultTargetSide) {
        setFilterSide(defaultTargetSide);
      } else {
        setFilterSide('all');
      }
    }
  }, [isOpen, defaultTargetSide]);

  if (!isOpen) return null;

  const filtered = savedAddresses.filter((a) => {
    if (filterSide === 'all') return true;
    return a.side === filterSide;
  });

  const handleStartEdit = (item: ProfileSavedAddress) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditSide(item.side || 'mutual');
  };

  const handleSaveEdit = async (id: string) => {
    await onUpdateDetails(id, {
      label: editLabel.trim() || 'Family Home',
      side: editSide,
    });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-rose-950 to-amber-950 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <span>Profile Address Book</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
          </div>

          <h2 className="text-xl font-bold font-serif text-white">Saved Family Addresses</h2>
          <p className="text-xs text-stone-300 mt-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span>Saved securely under profile: </span>
            <span className="font-semibold text-amber-200">{userEmail || 'Active User'}</span>
          </p>

          {defaultTargetSide && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-semibold text-white">
              <span>Target Selection:</span>
              <span className="font-bold text-amber-300">
                {defaultTargetSide === 'groom' ? "🤵 Groom's Family Side" : "👰 Bride's Family Side"}
              </span>
            </div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-semibold text-[11px]">Filter:</span>
            <button
              type="button"
              onClick={() => setFilterSide('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                filterSide === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              All ({savedAddresses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSide('groom')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                filterSide === 'groom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-blue-50'
              }`}
            >
              Groom's Side ({savedAddresses.filter((a) => a.side === 'groom').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSide('bride')}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                filterSide === 'bride'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-rose-50'
              }`}
            >
              Bride's Side ({savedAddresses.filter((a) => a.side === 'bride').length})
            </button>
          </div>
        </div>

        {/* List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-800 text-sm">No Saved Addresses Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 leading-relaxed">
                {filterSide === 'all'
                  ? 'Addresses you save during tour planning or venue management will appear here under your profile so you never have to retype them.'
                  : `No saved addresses categorized for ${filterSide === 'groom' ? "Groom's Side" : "Bride's Side"}.`}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-300 transition-all shadow-2xs space-y-2.5 group"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">
                            Friendly Nickname / Label
                          </label>
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            placeholder="e.g. Groom's Parents (Lawrence Twp)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">
                            Family Side
                          </label>
                          <select
                            value={editSide}
                            onChange={(e) => setEditSide(e.target.value as any)}
                            className="w-full px-2 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-900 bg-white focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="groom">Groom</option>
                            <option value="bride">Bride</option>
                            <option value="mutual">Mutual</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                              item.side === 'groom'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : item.side === 'bride'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            <MapPin className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-stone-900 text-xs truncate">
                                {item.label}
                              </h4>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                                  item.side === 'groom'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : item.side === 'bride'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-stone-100 text-stone-700 border-stone-200'
                                }`}
                              >
                                {item.side === 'groom'
                                  ? "Groom's Side"
                                  : item.side === 'bride'
                                  ? "Bride's Side"
                                  : 'Family'}
                              </span>
                            </div>

                            <p className="text-stone-700 text-xs font-medium mt-0.5">
                              {item.address}
                            </p>
                            <p className="text-stone-500 text-[11px]">
                              {item.city}, {item.state} {item.zipCode}
                            </p>
                          </div>
                        </div>

                        {/* Edit & Delete Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            title="Edit label or side"
                            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete "${item.label}" from your profile saved addresses?`)) {
                                onDeleteAddress(item.id);
                              }
                            }}
                            title="Delete saved address"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Select Buttons */}
                      {onSelectAddress && (
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {item.lastUsedAt
                                ? `Used ${new Date(item.lastUsedAt).toLocaleDateString()}`
                                : 'Available for autofill'}
                            </span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectAddress(item, 'groom');
                                onClose();
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                defaultTargetSide === 'groom'
                                  ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 ring-2 ring-blue-300'
                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              Fill Groom Side {defaultTargetSide === 'groom' ? '✓' : ''}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onSelectAddress(item, 'bride');
                                onClose();
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                defaultTargetSide === 'bride'
                                  ? 'bg-rose-600 text-white shadow-xs hover:bg-rose-700 ring-2 ring-rose-300'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              Fill Bride Side {defaultTargetSide === 'bride' ? '✓' : ''}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted &amp; private to your authenticated account.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
