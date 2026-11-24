'use client';

import React, { useState, useMemo } from 'react';
import { useWedding } from '@/lib/store';
import { Guest, WeddingSide, DietaryTag, RsvpStatus } from '@/lib/types';
import { Modal } from '@/components/Modal';
import {
  BulkPasteGuestsModal,
  COMMON_GUEST_GROUPS,
  inferSideFromGroup,
} from '@/components/BulkPasteGuestsModal';
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
  ClipboardPaste,
  LayoutGrid,
  Table2,
  GripVertical,
  FolderPlus,
  MoveRight,
  Phone,
  MapPin,
  X,
  Check,
} from 'lucide-react';

export default function GuestsPage() {
  const {
    guests,
    events,
    customGuestGroups,
    isReadOnly,
    addGuest,
    updateGuest,
    deleteGuest,
    updateGuestRsvp,
    addCustomGuestGroup,
    deleteCustomGuestGroup,
  } = useWedding();

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [searchTerm, setSearchTerm] = useState('');
  const [sideFilter, setSideFilter] = useState<'all' | WeddingSide>('all');
  const [dietFilter, setDietFilter] = useState<'all' | DietaryTag>('all');
  const [showAllEmptyGroups, setShowAllEmptyGroups] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteDefaultGroup, setPasteDefaultGroup] = useState<string | undefined>(undefined);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Drag-and-Drop + Tap-to-Move state
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [movingGuestId, setMovingGuestId] = useState<string | null>(null);

  // Edit Guest Modal state
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [inlineNewGroup, setInlineNewGroup] = useState('');
  const [showInlineNewGroup, setShowInlineNewGroup] = useState(false);
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

  // Master list of all available groups (Common + Custom + any already used by guests)
  const allGroups = useMemo(() => {
    const ordered: string[] = [];
    const seen = new Set<string>();
    const addUnique = (name: string) => {
      const clean = name.trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        ordered.push(clean);
      }
    };
    COMMON_GUEST_GROUPS.forEach(addUnique);
    customGuestGroups.forEach(addUnique);
    guests.forEach((g) => addUnique(g.familyGroup));
    return ordered;
  }, [customGuestGroups, guests]);

  // Filtered guests
  const filteredGuests = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return guests.filter((g) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        (g.familyGroup || '').toLowerCase().includes(q) ||
        (g.city || '').toLowerCase().includes(q) ||
        (g.phone || '').includes(q);
      const matchesSide = sideFilter === 'all' || g.side === sideFilter;
      const matchesDiet = dietFilter === 'all' || g.dietaryPreference === dietFilter;
      return matchesSearch && matchesSide && matchesDiet;
    });
  }, [guests, searchTerm, sideFilter, dietFilter]);

  // Group filtered guests by familyGroup
  const guestsByGroup = useMemo(() => {
    const map: Record<string, Guest[]> = {};
    filteredGuests.forEach((g) => {
      const grp = g.familyGroup?.trim() || 'Unassigned';
      if (!map[grp]) map[grp] = [];
      map[grp].push(g);
    });
    return map;
  }, [filteredGuests]);

  // Which groups to display on the Board
  const visibleBoardGroups = useMemo(() => {
    const list: string[] = [];
    const hasUnassigned = (guestsByGroup['Unassigned'] || []).length > 0;
    if (hasUnassigned) list.push('Unassigned');

    allGroups.forEach((grp) => {
      const hasGuests = (guestsByGroup[grp] || []).length > 0;
      const isCustom = customGuestGroups.includes(grp);
      // Always show groups with guests, custom groups, or when moving/dragging/toggled to show all
      if (hasGuests || isCustom || showAllEmptyGroups || draggingGuestId || movingGuestId || guests.length === 0) {
        list.push(grp);
      }
    });

    return list;
  }, [allGroups, guestsByGroup, customGuestGroups, showAllEmptyGroups, draggingGuestId, movingGuestId, guests.length]);

  const totalFilteredHeadcount = filteredGuests.reduce(
    (acc, g) => acc + g.adultsCount + g.kidsCount,
    0
  );

  const handleOpenAdd = (presetGroup?: string) => {
    if (isReadOnly) return;
    setEditingGuest(null);
    setShowInlineNewGroup(false);
    setInlineNewGroup('');
    const defaultRsvps: Record<string, RsvpStatus> = {};
    events.forEach((ev) => {
      defaultRsvps[ev.id] = 'invited';
    });
    const grp = presetGroup && presetGroup !== 'Unassigned' ? presetGroup : '';
    setFormData({
      name: '',
      phone: '',
      email: '',
      side: grp ? inferSideFromGroup(grp) : 'bride',
      familyGroup: grp,
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
    setShowInlineNewGroup(false);
    setInlineNewGroup('');
    setFormData({
      name: guest.name,
      phone: guest.phone || '',
      email: guest.email || '',
      side: guest.side,
      familyGroup: guest.familyGroup || '',
      adultsCount: guest.adultsCount,
      kidsCount: guest.kidsCount,
      dietaryPreference: guest.dietaryPreference,
      city: guest.city || '',
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
    if (isReadOnly) return;
    let finalGroup = formData.familyGroup;
    if (showInlineNewGroup && inlineNewGroup.trim()) {
      finalGroup = inlineNewGroup.trim();
      addCustomGuestGroup(finalGroup);
    }
    const payload = { ...formData, familyGroup: finalGroup };
    if (editingGuest) {
      updateGuest(editingGuest.id, payload);
    } else {
      addGuest(payload);
    }
    setIsModalOpen(false);
  };

  const handleMoveGuestToGroup = (guestId: string, targetGroup: string) => {
    if (isReadOnly) return;
    const cleanGroup = targetGroup === 'Unassigned' ? '' : targetGroup;
    const inferredSide = cleanGroup ? inferSideFromGroup(cleanGroup) : undefined;
    updateGuest(guestId, {
      familyGroup: cleanGroup,
      ...(inferredSide && inferredSide !== 'mutual' ? { side: inferredSide } : {}),
    });
    setDraggingGuestId(null);
    setDragOverGroup(null);
    setMovingGuestId(null);
  };

  const handleCreateCustomGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    addCustomGuestGroup(newGroupName.trim());
    setNewGroupName('');
    setIsNewGroupModalOpen(false);
  };

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

  const movingGuest = movingGuestId ? guests.find((g) => g.id === movingGuestId) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Guest List &amp; Groups
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Paste lists of names in seconds, organize guests into drag-and-drop groups, and click any card to fill details &amp; event RSVPs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => {
                  setPasteDefaultGroup(undefined);
                  setIsPasteModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 text-white font-bold text-xs shadow-md shadow-rose-900/20 hover:opacity-95 transition-all"
              >
                <ClipboardPaste className="w-4 h-4 text-amber-200" />
                <span>Paste Guest List</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNewGroupModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-stone-800 text-xs font-semibold shadow-2xs transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                <span>+ New Group</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAdd()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Guest</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tap-to-Move Active Banner (great for mobile & trackpad!) */}
      {movingGuest && (
        <div className="p-3.5 rounded-2xl bg-rose-700 text-white flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <MoveRight className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Tap any group below to move <strong className="underline">{movingGuest.name}</strong> into it
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMovingGuestId(null)}
            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Search, Filters & View Mode Switcher */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search guest name, group, phone, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-stone-900 bg-white font-medium text-base sm:text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Side Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'all', label: `All (${guests.length})` },
                { id: 'bride', label: 'Bride' },
                { id: 'groom', label: 'Groom' },
                { id: 'mutual', label: 'Mutual' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSideFilter(opt.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                  sideFilter === opt.id
                    ? 'bg-white shadow-2xs text-stone-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Dietary Filter */}
          <select
            value={dietFilter}
            onChange={(e) => setDietFilter(e.target.value as 'all' | DietaryTag)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Diets</option>
            <option value="Strict Veg">Strict Veg</option>
            <option value="Jain">Jain</option>
            <option value="Swaminarayan">Swaminarayan</option>
            <option value="Non-Veg">Non-Veg</option>
            <option value="Halal">Halal</option>
            <option value="Gluten-Free">Gluten-Free</option>
          </select>

          {/* Board vs Table View Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200/80">
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-3 py-1 rounded-lg font-bold inline-flex items-center gap-1.5 transition-all ${
                viewMode === 'board'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-rose-600" />
              <span>Groups</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg font-bold inline-flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Strip */}
      <div className="bg-amber-50/70 border border-amber-200/80 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">
        <span>
          Showing <strong>{filteredGuests.length}</strong> guest cards representing{' '}
          <strong>{totalFilteredHeadcount}</strong> total people (adults + kids).
        </span>
        {viewMode === 'board' && (
          <button
            type="button"
            onClick={() => setShowAllEmptyGroups(!showAllEmptyGroups)}
            className="text-rose-800 hover:underline font-bold"
          >
            {showAllEmptyGroups ? 'Hide Empty Groups' : `Show All Groups (${allGroups.length})`}
          </button>
        )}
      </div>

      {/* ================================================================ */}
      {/* VIEW 1: DRAG-AND-DROP GROUP CARDS BOARD (DEFAULT)                */}
      {/* ================================================================ */}
      {viewMode === 'board' && (
        <div className="space-y-4">
          {guests.length === 0 && (
            <div className="p-8 rounded-3xl bg-white border border-dashed border-amber-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <ClipboardPaste className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Start Your Guest List in Seconds
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Copy &amp; paste names from Notes, WhatsApp, or a spreadsheet — then drag guest cards between groups like Bridesmaids, Groomsmen, Family, and Friends, or click any card to fill details.
                </p>
              </div>
              {!isReadOnly && (
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPasteDefaultGroup(undefined);
                      setIsPasteModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 text-white font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                  >
                    <ClipboardPaste className="w-4 h-4 text-amber-200" />
                    <span>Paste Guest List</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAdd()}
                    className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs"
                  >
                    + Add Single Guest
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Group Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleBoardGroups.map((groupName) => {
              const groupGuests = guestsByGroup[groupName] || [];
              const groupHeadcount = groupGuests.reduce(
                (sum, g) => sum + g.adultsCount + g.kidsCount,
                0
              );
              const isDropTarget = dragOverGroup === groupName;
              const isCustomGroup = customGuestGroups.includes(groupName);
              const sideHint = inferSideFromGroup(groupName);

              const headerAccent =
                groupName === 'Unassigned'
                  ? 'border-stone-200 bg-stone-50'
                  : sideHint === 'bride'
                  ? 'border-rose-200/80 bg-rose-50/50'
                  : sideHint === 'groom'
                  ? 'border-blue-200/80 bg-blue-50/50'
                  : 'border-amber-200/80 bg-amber-50/50';

              return (
                <div
                  key={groupName}
                  onDragOver={(e) => {
                    if (isReadOnly) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverGroup !== groupName) setDragOverGroup(groupName);
                  }}
                  onDragLeave={() => {
                    if (dragOverGroup === groupName) setDragOverGroup(null);
                  }}
                  onDrop={(e) => {
                    if (isReadOnly) return;
                    e.preventDefault();
                    const droppedId = e.dataTransfer.getData('text/plain') || draggingGuestId;
                    if (droppedId) {
                      handleMoveGuestToGroup(droppedId, groupName);
                    }
                  }}
                  onClick={() => {
                    if (movingGuestId) {
                      handleMoveGuestToGroup(movingGuestId, groupName);
                    }
                  }}
                  className={`rounded-2xl border bg-white flex flex-col overflow-hidden transition-all ${
                    isDropTarget
                      ? 'border-rose-500 ring-2 ring-rose-400/50 bg-rose-50/30 scale-[1.01]'
                      : movingGuestId
                      ? 'border-rose-300 hover:border-rose-500 hover:ring-2 hover:ring-rose-200 cursor-pointer'
                      : 'border-stone-200 shadow-2xs'
                  }`}
                >
                  {/* Group Column Header */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${headerAccent}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-stone-900 truncate">{groupName}</h3>
                        {isCustomGroup && (
                          <span className="px-1.5 py-0.2 rounded-full bg-white/80 border border-stone-200 text-[9px] font-bold text-stone-500 uppercase">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {groupGuests.length} {groupGuests.length === 1 ? 'card' : 'cards'} • {groupHeadcount} people
                      </p>
                    </div>

                    {!isReadOnly && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPasteDefaultGroup(groupName === 'Unassigned' ? undefined : groupName);
                            setIsPasteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/80 hover:bg-white border border-stone-200 text-stone-600 hover:text-rose-700 transition-colors"
                          title={`Paste guests into ${groupName}`}
                        >
                          <ClipboardPaste className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAdd(groupName);
                          }}
                          className="p-1.5 rounded-lg bg-white/80 hover:bg-white border border-stone-200 text-stone-600 hover:text-rose-700 transition-colors"
                          title={`Add guest to ${groupName}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        {isCustomGroup && groupGuests.length === 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomGuestGroup(groupName);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete empty custom group"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Guest Cards List inside Group */}
                  <div className="p-3 space-y-2 flex-1 min-h-[110px]">
                    {groupGuests.length === 0 ? (
                      <div className="h-full min-h-[84px] rounded-xl border border-dashed border-stone-200 flex items-center justify-center text-center px-3">
                        <span className="text-[11px] text-stone-400">
                          {movingGuestId
                            ? `Tap here to move into ${groupName}`
                            : 'Drag a guest card here or click +'}
                        </span>
                      </div>
                    ) : (
                      groupGuests.map((guest) => {
                        const invitedEventsCount = events.filter((ev) => {
                          const st = guest.eventRsvps?.[ev.id];
                          return st && st !== 'not_sent';
                        }).length;
                        const needsDetails = !guest.phone && !guest.city;

                        return (
                          <div
                            key={guest.id}
                            draggable={!isReadOnly}
                            onDragStart={(e) => {
                              setDraggingGuestId(guest.id);
                              e.dataTransfer.setData('text/plain', guest.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggingGuestId(null);
                              setDragOverGroup(null);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (movingGuestId) {
                                handleMoveGuestToGroup(movingGuestId, groupName);
                                return;
                              }
                              handleOpenEdit(guest);
                            }}
                            className={`p-3 rounded-xl border bg-stone-50/50 hover:bg-white hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group/card ${
                              draggingGuestId === guest.id
                                ? 'opacity-50 border-rose-400'
                                : movingGuestId === guest.id
                                ? 'border-rose-500 ring-2 ring-rose-300 bg-rose-50/40'
                                : 'border-stone-200/90'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0">
                                {!isReadOnly && (
                                  <GripVertical className="w-3.5 h-3.5 text-stone-300 group-hover/card:text-stone-500 shrink-0 mt-0.5 cursor-grab" />
                                )}
                                <div className="min-w-0">
                                  <div className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                                    {guest.name}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-stone-500">
                                    <span className="px-1.5 py-0.5 rounded-md bg-white border border-stone-200 font-bold text-stone-700">
                                      {guest.adultsCount + guest.kidsCount}{' '}
                                      {guest.adultsCount + guest.kidsCount === 1 ? 'person' : 'people'}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 font-semibold text-amber-900">
                                      {guest.dietaryPreference}
                                    </span>
                                    {events.length > 0 && (
                                      <span className="text-stone-500 font-medium">
                                        • {invitedEventsCount}/{events.length} events
                                      </span>
                                    )}
                                  </div>
                                  {(guest.phone || guest.city) ? (
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-400 truncate">
                                      {guest.phone && (
                                        <span className="inline-flex items-center gap-0.5">
                                          <Phone className="w-2.5 h-2.5" /> {guest.phone}
                                        </span>
                                      )}
                                      {guest.city && (
                                        <span className="inline-flex items-center gap-0.5">
                                          <MapPin className="w-2.5 h-2.5" /> {guest.city}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mt-1 text-[10px] text-rose-600/80 font-medium">
                                      Click card to fill details →
                                    </div>
                                  )}
                                </div>
                              </div>

                              {!isReadOnly && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMovingGuestId(movingGuestId === guest.id ? null : guest.id);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-[10px] font-semibold text-stone-600 shrink-0"
                                  title="Move guest to another group"
                                >
                                  Move
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 2: COMPACT TABLE & SUB-EVENT RSVP MATRIX                    */}
      {/* ================================================================ */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/90 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Guest / Family</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Side</th>
                  <th className="py-3 px-4">Headcount</th>
                  <th className="py-3 px-4">Diet</th>
                  <th className="py-3 px-4">Event RSVPs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-stone-500">
                      No guests match your filter. Click <strong>Paste Guest List</strong> to add guests quickly!
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(guest)}
                          className="text-left group"
                        >
                          <div className="font-bold text-stone-900 group-hover:text-rose-700">
                            {guest.name}
                          </div>
                          {(guest.phone || guest.city) && (
                            <div className="text-[11px] text-stone-400">
                              {[guest.phone, guest.city].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-semibold text-[11px]">
                          {guest.familyGroup || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                            guest.side === 'bride'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : guest.side === 'groom'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {guest.side}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {guest.adultsCount + guest.kidsCount}{' '}
                        <span className="font-normal text-stone-500">
                          ({guest.adultsCount}A{guest.kidsCount > 0 ? `+${guest.kidsCount}K` : ''})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-medium text-[11px]">
                          {guest.dietaryPreference}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {events.map((ev) => {
                            const status = guest.eventRsvps?.[ev.id] || 'not_sent';
                            const nextMap: Record<RsvpStatus, RsvpStatus> = {
                              not_sent: 'invited',
                              invited: 'attending',
                              attending: 'declined',
                              declined: 'tentative',
                              tentative: 'not_sent',
                            };
                            return (
                              <button
                                key={ev.id}
                                type="button"
                                disabled={isReadOnly}
                                onClick={() => updateGuestRsvp(guest.id, ev.id, nextMap[status])}
                                title={`${ev.name}: ${status} (click to cycle)`}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                  status === 'attending'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : status === 'invited'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : status === 'declined'
                                    ? 'bg-rose-50 text-rose-700 border-rose-300 line-through'
                                    : status === 'tentative'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-stone-50 text-stone-400 border-stone-200'
                                }`}
                              >
                                {ev.type.slice(0, 3).toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(guest)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove "${guest.name}" from guest list?`)) {
                                  deleteGuest(guest.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 1: BULK PASTE GUEST LIST                                   */}
      {/* ================================================================ */}
      <BulkPasteGuestsModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        availableGroups={allGroups}
        defaultGroup={pasteDefaultGroup}
      />

      {/* ================================================================ */}
      {/* MODAL 2: CREATE CUSTOM GROUP                                     */}
      {/* ================================================================ */}
      <Modal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        title="Create Custom Guest Group"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCustomGroup} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">Group Name *</label>
            <input
              type="text"
              required
              autoFocus
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. College Crew, Work Friends, VIP Elders"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewGroupModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold"
            >
              Create Group
            </button>
          </div>
        </form>
      </Modal>

      {/* ================================================================ */}
      {/* MODAL 3: GUEST DETAIL & EDIT MODAL                               */}
      {/* ================================================================ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? `Guest Details • ${editingGuest.name}` : 'Add Guest or Family'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Guest / Family Name *</label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Rajan & Sunita Verma"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
            />
          </div>

          {/* Group Selector + Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-stone-700">Group</label>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setShowInlineNewGroup(!showInlineNewGroup)}
                    className="text-[11px] font-bold text-rose-700 hover:underline"
                  >
                    {showInlineNewGroup ? 'Pick Existing' : '+ New Custom Group'}
                  </button>
                )}
              </div>
              {showInlineNewGroup ? (
                <input
                  type="text"
                  value={inlineNewGroup}
                  onChange={(e) => setInlineNewGroup(e.target.value)}
                  placeholder="Type new group name..."
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
                  autoFocus
                />
              ) : (
                <select
                  disabled={isReadOnly}
                  value={formData.familyGroup}
                  onChange={(e) => {
                    const grp = e.target.value;
                    const inferred = grp ? inferSideFromGroup(grp) : formData.side;
                    setFormData({
                      ...formData,
                      familyGroup: grp,
                      side: inferred !== 'mutual' ? inferred : formData.side,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-semibold"
                >
                  <option value="">Unassigned</option>
                  {allGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Side *</label>
              <select
                disabled={isReadOnly}
                value={formData.side}
                onChange={(e) => setFormData({ ...formData, side: e.target.value as WeddingSide })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="bride">Bride&apos;s Side (Ladkiwale)</option>
                <option value="groom">Groom&apos;s Side (Ladkewale)</option>
                <option value="mutual">Mutual / Both</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Adults *</label>
              <input
                type="number"
                min={1}
                required
                disabled={isReadOnly}
                value={formData.adultsCount}
                onChange={(e) => setFormData({ ...formData, adultsCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Kids</label>
              <input
                type="number"
                min={0}
                disabled={isReadOnly}
                value={formData.kidsCount}
                onChange={(e) => setFormData({ ...formData, kidsCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Diet</label>
              <select
                disabled={isReadOnly}
                value={formData.dietaryPreference}
                onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as DietaryTag })}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="Strict Veg">Strict Veg</option>
                <option value="Jain">Jain</option>
                <option value="Swaminarayan">Swaminarayan</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Halal">Halal</option>
                <option value="Gluten-Free">Gluten-Free</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Phone / WhatsApp (Optional)</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Home City (Optional)</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Edison, NJ"
                className="w-full px-3 py-2 rounded-xl border border-stone-300"
              />
            </div>
          </div>

          {/* Per-Event Invitations & RSVPs */}
          {events.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
              <label className="font-bold text-stone-800 block">Invited Ceremonies &amp; RSVP</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {events.map((ev) => {
                  const st = formData.eventRsvps[ev.id] || 'not_sent';
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-stone-200"
                    >
                      <span className="font-semibold text-stone-800 truncate">{ev.name}</span>
                      <select
                        disabled={isReadOnly}
                        value={st}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            eventRsvps: {
                              ...formData.eventRsvps,
                              [ev.id]: e.target.value as RsvpStatus,
                            },
                          })
                        }
                        className="px-2 py-1 rounded-md border border-stone-200 bg-stone-50 text-[11px] font-semibold"
                      >
                        <option value="not_sent">Not Invited</option>
                        <option value="invited">Invited</option>
                        <option value="attending">Attending</option>
                        <option value="tentative">Tentative</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transit & Hotel info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Assigned Hotel</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.hotelAssigned}
                onChange={(e) => setFormData({ ...formData, hotelAssigned: e.target.value })}
                placeholder="e.g. Hilton Garden Inn"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Room No.</label>
              <input
                type="text"
                disabled={isReadOnly}
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. Room 204"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pickup"
                disabled={isReadOnly}
                checked={formData.needsPickup}
                onChange={(e) => setFormData({ ...formData, needsPickup: e.target.checked })}
                className="rounded-sm border-stone-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="pickup" className="font-medium text-stone-700">
                Needs airport pickup shuttle
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
            {editingGuest && !isReadOnly ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove "${editingGuest.name}" from guest list?`)) {
                    deleteGuest(editingGuest.id);
                    setIsModalOpen(false);
                  }
                }}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Guest</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
              >
                Cancel
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold shadow-sm"
                >
                  {editingGuest ? 'Save Changes' : 'Add Guest'}
                </button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
