'use client';

import React, { useState, useMemo } from 'react';
import { useWedding } from '@/lib/store';
import { Guest, ReceptionFloorPlan, SeatingTable } from '@/lib/types';
import { GUEST_CARD_COLORS, GUEST_TIER_META, getEffectiveCardColor } from '@/lib/guestTiers';
import { Modal } from './Modal';
import {
  Users,
  Sparkles,
  Music,
  GripVertical,
  Search,
  Check,
  X,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeftRight,
  AlertTriangle,
  Plus,
} from 'lucide-react';

const createDefaultTables = (count: number, seatsPerTable: number): SeatingTable[] => {
  const safeCount = Math.max(1, Math.min(60, count));
  const halfLeft = Math.ceil(safeCount / 2);
  return Array.from({ length: safeCount }, (_, idx) => ({
    id: `tbl-${idx + 1}`,
    label: `Table ${idx + 1}`,
    capacity: seatsPerTable,
    zone: idx < halfLeft ? 'left' : 'right',
    shape: 'round',
    assignedGuestIds: [],
  }));
};

export const ReceptionSeatingChart: React.FC = () => {
  const { guests, seatingPlan, saveSeatingPlan, isReadOnly } = useWedding();

  // Initialize a live plan (either saved from Firebase or sensible 12-table default ready to customize)
  const activePlan: ReceptionFloorPlan = useMemo(() => {
    if (seatingPlan && Array.isArray(seatingPlan.tables) && seatingPlan.tables.length > 0) {
      return seatingPlan;
    }
    const totalPeople = guests.reduce((s, g) => s + g.adultsCount + g.kidsCount, 0);
    const suggestedTables = Math.max(8, Math.min(30, Math.ceil((totalPeople || 120) / 10)));
    return {
      tableCount: suggestedTables,
      defaultSeatsPerTable: 10,
      tables: createDefaultTables(suggestedTables, 10),
    };
  }, [seatingPlan, guests]);

  const [tableCountInput, setTableCountInput] = useState<number>(activePlan.tableCount);
  const [seatsPerTableInput, setSeatsPerTableInput] = useState<number>(
    activePlan.defaultSeatsPerTable
  );

  // Guest search & filter in unseated panel
  const [guestSearch, setGuestSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Drag-and-drop & Tap-to-Seat state
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<'left' | 'right' | 'back' | null>(null);
  const [placingGuestId, setPlacingGuestId] = useState<string | null>(null);

  // Table Detail Modal
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Lookup guest by ID
  const guestMap = useMemo(() => {
    const map: Record<string, Guest> = {};
    guests.forEach((g) => {
      map[g.id] = g;
    });
    return map;
  }, [guests]);

  // All guest IDs currently seated at any table
  const seatedGuestIds = useMemo(() => {
    const set = new Set<string>();
    activePlan.tables.forEach((t) => {
      t.assignedGuestIds.forEach((gid) => {
        if (guestMap[gid]) set.add(gid);
      });
    });
    return set;
  }, [activePlan.tables, guestMap]);

  const unseatedGuests = useMemo(() => {
    return guests.filter((g) => !seatedGuestIds.has(g.id));
  }, [guests, seatedGuestIds]);

  const unseatedGroups = useMemo(() => {
    const set = new Set<string>();
    unseatedGuests.forEach((g) => set.add(g.familyGroup || 'Unassigned'));
    return Array.from(set).sort();
  }, [unseatedGuests]);

  const filteredUnseated = useMemo(() => {
    const q = guestSearch.trim().toLowerCase();
    return unseatedGuests.filter((g) => {
      const grp = g.familyGroup || 'Unassigned';
      if (groupFilter !== 'all' && grp !== groupFilter) return false;
      if (q && !g.name.toLowerCase().includes(q) && !grp.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [unseatedGuests, guestSearch, groupFilter]);

  // Helper: seats used at a table
  const getTableOccupancy = (table: SeatingTable) => {
    return table.assignedGuestIds.reduce((sum, gid) => {
      const g = guestMap[gid];
      return sum + (g ? g.adultsCount + g.kidsCount : 0);
    }, 0);
  };

  // Metrics
  const totalCapacity = activePlan.tables.reduce((s, t) => s + t.capacity, 0);
  const totalSeatedPeople = activePlan.tables.reduce((s, t) => s + getTableOccupancy(t), 0);
  const totalUnseatedPeople = unseatedGuests.reduce(
    (s, g) => s + g.adultsCount + g.kidsCount,
    0
  );

  const leftTables = activePlan.tables.filter((t) => t.zone === 'left');
  const rightTables = activePlan.tables.filter((t) => t.zone === 'right');
  const backTables = activePlan.tables.filter((t) => t.zone === 'back');

  // Apply table count & seats/table resize (preserves existing assignments!)
  const handleApplyLayoutConfig = (newCount: number, newSeats: number) => {
    if (isReadOnly) return;
    const safeCount = Math.max(1, Math.min(60, newCount));
    const safeSeats = Math.max(2, Math.min(20, newSeats));
    setTableCountInput(safeCount);
    setSeatsPerTableInput(safeSeats);

    const existing = [...activePlan.tables];
    let updatedTables: SeatingTable[] = [];

    if (safeCount >= existing.length) {
      updatedTables = existing.map((t) => ({ ...t, capacity: safeSeats }));
      for (let i = existing.length; i < safeCount; i++) {
        // Alternate adding to left / right to keep dance floor balanced
        const leftCnt = updatedTables.filter((t) => t.zone === 'left').length;
        const rightCnt = updatedTables.filter((t) => t.zone === 'right').length;
        updatedTables.push({
          id: `tbl-${Date.now()}-${i + 1}`,
          label: `Table ${i + 1}`,
          capacity: safeSeats,
          zone: leftCnt <= rightCnt ? 'left' : 'right',
          shape: 'round',
          assignedGuestIds: [],
        });
      }
    } else {
      updatedTables = existing.slice(0, safeCount).map((t) => ({ ...t, capacity: safeSeats }));
    }

    saveSeatingPlan({
      tableCount: safeCount,
      defaultSeatsPerTable: safeSeats,
      tables: updatedTables,
    });
  };

  // Assign a guest to a table (removes from any previous table first)
  const assignGuestToTable = (guestId: string, targetTableId: string) => {
    if (isReadOnly) return;
    const updatedTables = activePlan.tables.map((t) => {
      const cleaned = t.assignedGuestIds.filter((id) => id !== guestId);
      if (t.id === targetTableId) {
        return { ...t, assignedGuestIds: [...cleaned, guestId] };
      }
      return { ...t, assignedGuestIds: cleaned };
    });
    saveSeatingPlan({ ...activePlan, tables: updatedTables });
    setPlacingGuestId(null);
    setDraggingGuestId(null);
    setDragOverTableId(null);
  };

  // Remove guest from table back to Unseated
  const unseatGuest = (guestId: string) => {
    if (isReadOnly) return;
    const updatedTables = activePlan.tables.map((t) => ({
      ...t,
      assignedGuestIds: t.assignedGuestIds.filter((id) => id !== guestId),
    }));
    saveSeatingPlan({ ...activePlan, tables: updatedTables });
  };

  // Move a table to another zone (Left / Right / Back of dance floor)
  const moveTableToZone = (tableId: string, zone: 'left' | 'right' | 'back') => {
    if (isReadOnly) return;
    const updatedTables = activePlan.tables.map((t) =>
      t.id === tableId ? { ...t, zone } : t
    );
    saveSeatingPlan({ ...activePlan, tables: updatedTables });
    setDraggingTableId(null);
    setDragOverZone(null);
  };

  // Update table metadata (label, capacity, zone)
  const updateTableDetails = (tableId: string, patch: Partial<SeatingTable>) => {
    if (isReadOnly) return;
    const updatedTables = activePlan.tables.map((t) =>
      t.id === tableId ? { ...t, ...patch } : t
    );
    saveSeatingPlan({ ...activePlan, tables: updatedTables });
  };

  // 1-Click Smart Auto-Seat by Guest Group (Bride side -> Left Wing, Groom side -> Right Wing!)
  const handleAutoSeatByGroup = () => {
    if (isReadOnly || guests.length === 0) return;

    const freshTables: SeatingTable[] = activePlan.tables.map((t) => ({
      ...t,
      assignedGuestIds: [],
    }));

    const occupancy: Record<string, number> = {};
    freshTables.forEach((t) => {
      occupancy[t.id] = 0;
    });

    // Sort guests by side + group so families & friends stay together
    const sorted = [...guests].sort((a, b) => {
      if (a.side !== b.side) return a.side.localeCompare(b.side);
      return (a.familyGroup || '').localeCompare(b.familyGroup || '');
    });

    sorted.forEach((g) => {
      const size = g.adultsCount + g.kidsCount;
      const preferredZone: 'left' | 'right' = g.side === 'groom' ? 'right' : 'left';

      // 1. Prefer a table in the preferred zone that already has guests from the same group & enough room
      let chosen = freshTables.find(
        (t) =>
          t.zone === preferredZone &&
          occupancy[t.id] + size <= t.capacity &&
          t.assignedGuestIds.some((id) => guestMap[id]?.familyGroup === g.familyGroup)
      );

      // 2. Otherwise an empty table in the preferred zone
      if (!chosen) {
        chosen = freshTables.find(
          (t) => t.zone === preferredZone && occupancy[t.id] === 0 && size <= t.capacity
        );
      }

      // 3. Otherwise any table in preferred zone with room
      if (!chosen) {
        chosen = freshTables.find(
          (t) => t.zone === preferredZone && occupancy[t.id] + size <= t.capacity
        );
      }

      // 4. Fallback: any table anywhere with room
      if (!chosen) {
        chosen = freshTables.find((t) => occupancy[t.id] + size <= t.capacity);
      }

      if (chosen) {
        chosen.assignedGuestIds.push(g.id);
        occupancy[chosen.id] += size;
      }
    });

    saveSeatingPlan({ ...activePlan, tables: freshTables });
  };

  const handleClearAllSeats = () => {
    if (isReadOnly) return;
    if (!confirm('Unseat all guests from tables? (Your tables and guest list will stay intact.)')) {
      return;
    }
    saveSeatingPlan({
      ...activePlan,
      tables: activePlan.tables.map((t) => ({ ...t, assignedGuestIds: [] })),
    });
  };

  const placingGuest = placingGuestId ? guestMap[placingGuestId] : null;
  const selectedTable = selectedTableId
    ? activePlan.tables.find((t) => t.id === selectedTableId) || null
    : null;

  // Render a single visual round ballroom table
  const renderRoundTable = (table: SeatingTable) => {
    const used = getTableOccupancy(table);
    const isOver = used > table.capacity;
    const isFull = used === table.capacity && used > 0;
    const isDropTarget = dragOverTableId === table.id;
    const seatedGuests = table.assignedGuestIds
      .map((gid) => guestMap[gid])
      .filter((g): g is Guest => Boolean(g));

    // Visual seat dots around a circle (capped at 12 visual dots for clean rendering)
    const dotCount = Math.min(table.capacity, 12);
    const filledDots = Math.min(dotCount, Math.round((used / Math.max(1, table.capacity)) * dotCount));

    return (
      <div
        key={table.id}
        draggable={!isReadOnly}
        onDragStart={(e) => {
          if (draggingGuestId) return;
          setDraggingTableId(table.id);
          e.dataTransfer.setData('application/x-table-id', table.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={() => {
          setDraggingTableId(null);
          setDragOverZone(null);
        }}
        onDragOver={(e) => {
          if (isReadOnly || draggingTableId) return;
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          if (dragOverTableId !== table.id) setDragOverTableId(table.id);
        }}
        onDragLeave={() => {
          if (dragOverTableId === table.id) setDragOverTableId(null);
        }}
        onDrop={(e) => {
          if (isReadOnly || draggingTableId) return;
          e.preventDefault();
          e.stopPropagation();
          const guestId = e.dataTransfer.getData('text/plain') || draggingGuestId;
          if (guestId) {
            assignGuestToTable(guestId, table.id);
          }
        }}
        onClick={() => {
          if (placingGuestId) {
            assignGuestToTable(placingGuestId, table.id);
            return;
          }
          setSelectedTableId(table.id);
        }}
        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative group ${
          isDropTarget
            ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/70 scale-[1.03] shadow-md'
            : placingGuestId
            ? 'border-rose-300 bg-white hover:border-rose-500 hover:bg-rose-50/40'
            : isOver
            ? 'border-rose-400 bg-rose-50/40 shadow-xs'
            : isFull
            ? 'border-emerald-300 bg-emerald-50/30 shadow-xs'
            : 'border-stone-200 bg-white hover:border-amber-400 hover:shadow-sm'
        }`}
      >
        {/* Visual Round Table with Seat Dots */}
        <div className="relative w-24 h-24 flex items-center justify-center my-1">
          {Array.from({ length: dotCount }).map((_, idx) => {
            const angle = (idx / dotCount) * 2 * Math.PI - Math.PI / 2;
            const radius = 42;
            const x = 48 + radius * Math.cos(angle);
            const y = 48 + radius * Math.sin(angle);
            const isFilled = idx < filledDots;
            return (
              <span
                key={idx}
                style={{
                  left: `${x - 4}px`,
                  top: `${y - 4}px`,
                }}
                className={`absolute w-2 h-2 rounded-full border transition-colors ${
                  isOver
                    ? 'bg-rose-500 border-rose-600'
                    : isFilled
                    ? 'bg-emerald-500 border-emerald-600'
                    : 'bg-white border-stone-300'
                }`}
              />
            );
          })}

          {/* Inner Round Table Surface */}
          <div
            className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center px-1 transition-colors ${
              isOver
                ? 'bg-rose-100 border-rose-400 text-rose-900'
                : used > 0
                ? 'bg-amber-50/80 border-amber-300 text-stone-900'
                : 'bg-stone-50 border-stone-200 text-stone-600'
            }`}
          >
            <span className="text-[10px] font-bold leading-tight truncate max-w-[54px]">
              {table.label}
            </span>
            <span
              className={`text-[10px] font-extrabold mt-0.5 ${
                isOver ? 'text-rose-700' : isFull ? 'text-emerald-700' : 'text-stone-600'
              }`}
            >
              {used}/{table.capacity}
            </span>
          </div>
        </div>

        {/* Seated Guest Preview Chips */}
        <div className="w-full mt-1 space-y-0.5">
          {seatedGuests.length === 0 ? (
            <span className="text-[10px] text-stone-400">
              {placingGuestId ? 'Tap to seat here' : 'Drop guests here'}
            </span>
          ) : (
            <>
              {seatedGuests.slice(0, 2).map((g) => (
                <div
                  key={g.id}
                  className="text-[10px] font-semibold text-stone-700 bg-stone-100/90 rounded-md px-1.5 py-0.5 truncate"
                >
                  {g.name} ({g.adultsCount + g.kidsCount})
                </div>
              ))}
              {seatedGuests.length > 2 && (
                <div className="text-[9px] font-bold text-amber-800">
                  +{seatedGuests.length - 2} more
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tap-to-Seat Active Banner */}
      {placingGuest && (
        <div className="p-3.5 rounded-2xl bg-rose-700 text-white flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <Users className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Tap any table on the floor plan to seat{' '}
              <strong className="underline">
                {placingGuest.name} ({placingGuest.adultsCount + placingGuest.kidsCount} seats)
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPlacingGuestId(null)}
            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold shrink-0"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Top Floor Plan Configurator Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Table Count Control */}
          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            <span className="font-bold text-stone-700">Tables:</span>
            <input
              type="number"
              min={1}
              max={60}
              disabled={isReadOnly}
              value={tableCountInput}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 1;
                handleApplyLayoutConfig(val, seatsPerTableInput);
              }}
              className="w-14 px-2 py-1 rounded-lg border border-stone-300 bg-white font-extrabold text-center text-stone-900"
            />
          </div>

          {/* Seats per Table Control */}
          <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            <span className="font-bold text-stone-700">Seats/Table:</span>
            {[8, 10, 12].map((num) => (
              <button
                key={num}
                type="button"
                disabled={isReadOnly}
                onClick={() => handleApplyLayoutConfig(tableCountInput, num)}
                className={`px-2 py-1 rounded-lg font-bold transition-colors ${
                  seatsPerTableInput === num
                    ? 'bg-rose-700 text-white'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Live Capacity Stats */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
              Seated: {totalSeatedPeople} / {totalCapacity}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold">
              Unseated: {totalUnseatedPeople}
            </span>
          </div>
        </div>

        {/* Smart Actions */}
        {!isReadOnly && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoSeatByGroup}
              disabled={guests.length === 0}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 hover:opacity-95 disabled:opacity-40 text-white font-bold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Auto-Seat by Group</span>
            </button>
            {totalSeatedPeople > 0 && (
              <button
                type="button"
                onClick={handleClearAllSeats}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Seats</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main 2-Pane Floor Plan Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANE: Unseated Guest Cards */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-stone-200 shadow-2xs p-4 space-y-3 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">
              Unseated Guests ({unseatedGuests.length})
            </h3>
            <span className="text-[11px] font-semibold text-stone-500">
              {totalUnseatedPeople} seats
            </span>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Search unseated..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs"
              />
            </div>

            {unseatedGroups.length > 0 && (
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-700"
              >
                <option value="all">All Groups ({unseatedGuests.length})</option>
                {unseatedGroups.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredUnseated.length === 0 ? (
              <div className="p-5 rounded-xl border border-dashed border-stone-200 text-center text-xs text-stone-400">
                {guests.length === 0
                  ? 'Add or paste guests in the Groups tab first!'
                  : unseatedGuests.length === 0
                  ? '🎉 All guests are seated!'
                  : 'No unseated guests match your filter.'}
              </div>
            ) : (
              filteredUnseated.map((guest) => {
                const count = guest.adultsCount + guest.kidsCount;
                const isSelectedToPlace = placingGuestId === guest.id;
                const colorStyle = GUEST_CARD_COLORS[getEffectiveCardColor(guest)];
                const tierMeta = guest.tier ? GUEST_TIER_META[guest.tier] : null;
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
                      setDragOverTableId(null);
                    }}
                    onClick={() => {
                      if (isReadOnly) return;
                      setPlacingGuestId(isSelectedToPlace ? null : guest.id);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-2 select-none ${
                      isSelectedToPlace
                        ? 'bg-rose-700 text-white border-rose-700 ring-2 ring-rose-300'
                        : colorStyle.cardClass
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelectedToPlace ? 'text-rose-200' : 'text-stone-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate">{guest.name}</span>
                          {tierMeta && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
                                isSelectedToPlace
                                  ? 'bg-white/20 text-white border-white/30'
                                  : tierMeta.badgeClass
                              }`}
                            >
                              {tierMeta.shortLabel}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isSelectedToPlace ? 'text-rose-100' : 'text-stone-500'
                          }`}
                        >
                          {guest.familyGroup || 'Unassigned'}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        isSelectedToPlace
                          ? 'bg-white/20 text-white'
                          : 'bg-white/90 border border-stone-200 text-stone-700'
                      }`}
                    >
                      {count} {count === 1 ? 'seat' : 'seats'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: VISUAL BALLROOM FLOOR PLAN */}
        <div className="lg:col-span-8 xl:col-span-9 bg-[#FAF7F2] rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs space-y-5">
          {/* Top: Sweetheart Stage & DJ */}
          <div className="rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950 to-amber-950 text-white p-4 text-center shadow-md border border-amber-500/30">
            <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sweetheart Stage &amp; Head Table</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] text-stone-300 mt-0.5">
              Drag guest cards onto any table • Drag tables between Left Wing, Right Wing, or Back
            </p>
          </div>

          {/* Center Ballroom: Left Wing | Dance Floor | Right Wing */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* LEFT WING (Left of Dance Floor) */}
            <div
              onDragOver={(e) => {
                if (!draggingTableId) return;
                e.preventDefault();
                setDragOverZone('left');
              }}
              onDragLeave={() => {
                if (dragOverZone === 'left') setDragOverZone(null);
              }}
              onDrop={(e) => {
                const tblId = e.dataTransfer.getData('application/x-table-id') || draggingTableId;
                if (tblId) {
                  e.preventDefault();
                  moveTableToZone(tblId, 'left');
                }
              }}
              className={`md:col-span-5 rounded-2xl border p-3.5 space-y-3 transition-all ${
                dragOverZone === 'left'
                  ? 'border-rose-500 ring-2 ring-rose-300 bg-rose-50/50'
                  : 'border-rose-200/70 bg-white/70'
              }`}
            >
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Left of Dance Floor
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {leftTables.length} {leftTables.length === 1 ? 'table' : 'tables'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {leftTables.map(renderRoundTable)}
              </div>
            </div>

            {/* CENTER DANCE FLOOR */}
            <div className="md:col-span-2 rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/80 p-3 flex flex-col items-center justify-center text-center min-h-[160px] gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                <Music className="w-5 h-5" />
              </div>
              <div className="font-serif font-bold text-stone-900 text-sm leading-tight">
                Dance Floor
              </div>
              <div className="text-[10px] text-stone-500 font-semibold leading-snug">
                {leftTables.length} Left • {rightTables.length} Right
                {backTables.length > 0 && ` • ${backTables.length} Back`}
              </div>
            </div>

            {/* RIGHT WING (Right of Dance Floor) */}
            <div
              onDragOver={(e) => {
                if (!draggingTableId) return;
                e.preventDefault();
                setDragOverZone('right');
              }}
              onDragLeave={() => {
                if (dragOverZone === 'right') setDragOverZone(null);
              }}
              onDrop={(e) => {
                const tblId = e.dataTransfer.getData('application/x-table-id') || draggingTableId;
                if (tblId) {
                  e.preventDefault();
                  moveTableToZone(tblId, 'right');
                }
              }}
              className={`md:col-span-5 rounded-2xl border p-3.5 space-y-3 transition-all ${
                dragOverZone === 'right'
                  ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/50'
                  : 'border-blue-200/70 bg-white/70'
              }`}
            >
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Right of Dance Floor
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {rightTables.length} {rightTables.length === 1 ? 'table' : 'tables'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {rightTables.map(renderRoundTable)}
              </div>
            </div>
          </div>

          {/* BACK / PERIMETER WING (Bar / Entrance Side) */}
          <div
            onDragOver={(e) => {
              if (!draggingTableId) return;
              e.preventDefault();
              setDragOverZone('back');
            }}
            onDragLeave={() => {
              if (dragOverZone === 'back') setDragOverZone(null);
            }}
            onDrop={(e) => {
              const tblId = e.dataTransfer.getData('application/x-table-id') || draggingTableId;
              if (tblId) {
                e.preventDefault();
                moveTableToZone(tblId, 'back');
              }
            }}
            className={`rounded-2xl border p-3.5 space-y-3 transition-all ${
              dragOverZone === 'back'
                ? 'border-amber-500 ring-2 ring-amber-300 bg-amber-50/60'
                : 'border-stone-200 bg-white/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Back / Bar &amp; Entrance Perimeter ({backTables.length}{' '}
                {backTables.length === 1 ? 'table' : 'tables'})
              </span>
              <span className="text-[11px] text-stone-400">
                Drag any table here for back-row seating
              </span>
            </div>
            {backTables.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {backTables.map(renderRoundTable)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE DETAIL MODAL (Rename, Capacity, Move Side, Manage Seated Guests) */}
      <Modal
        isOpen={Boolean(selectedTable)}
        onClose={() => setSelectedTableId(null)}
        title={selectedTable ? `${selectedTable.label} • Seating Details` : 'Table Details'}
        maxWidth="md"
      >
        {selectedTable && (
          <div className="space-y-4 text-xs">
            {/* Table Label, Capacity & Ballroom Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="sm:col-span-2">
                <label className="font-bold text-stone-600 block mb-1">Table Name</label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={selectedTable.label}
                  onChange={(e) =>
                    updateTableDetails(selectedTable.id, { label: e.target.value })
                  }
                  placeholder="e.g. Table 1 — Bridesmaids"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-stone-600 block mb-1">Max Seats</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  disabled={isReadOnly}
                  value={selectedTable.capacity}
                  onChange={(e) =>
                    updateTableDetails(selectedTable.id, {
                      capacity: Math.max(2, parseInt(e.target.value, 10) || 10),
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-bold text-center"
                />
              </div>

              <div className="sm:col-span-3 pt-1">
                <label className="font-bold text-stone-600 block mb-1">
                  Ballroom Position (Relative to Dance Floor)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'left', label: 'Left of Floor' },
                      { id: 'right', label: 'Right of Floor' },
                      { id: 'back', label: 'Back / Perimeter' },
                    ] as const
                  ).map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => updateTableDetails(selectedTable.id, { zone: z.id })}
                      className={`py-1.5 px-2 rounded-lg font-bold border transition-colors ${
                        selectedTable.zone === z.id
                          ? 'bg-rose-700 text-white border-rose-700'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Seated Guests at this Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-stone-800">
                <span>
                  Seated Here ({getTableOccupancy(selectedTable)} / {selectedTable.capacity} seats)
                </span>
                {getTableOccupancy(selectedTable) > selectedTable.capacity && (
                  <span className="text-rose-700 inline-flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" /> Over capacity
                  </span>
                )}
              </div>

              {selectedTable.assignedGuestIds.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-stone-200 text-center text-stone-400">
                  No guests seated at this table yet.
                </div>
              ) : (
                <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
                  {selectedTable.assignedGuestIds.map((gid) => {
                    const g = guestMap[gid];
                    if (!g) return null;
                    return (
                      <div key={gid} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-stone-900 truncate">{g.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {g.adultsCount + g.kidsCount} seats • {g.familyGroup || 'Unassigned'} •{' '}
                            {g.dietaryPreference}
                          </div>
                        </div>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => unseatGuest(gid)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-700 font-semibold shrink-0"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick-Add Unseated Guest to this Table */}
            {!isReadOnly && unseatedGuests.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="font-bold text-stone-700 block">
                  Quick-Seat an Unseated Guest Here
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {unseatedGuests.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => assignGuestToTable(g.id, selectedTable.id)}
                      className="w-full p-2 rounded-xl border border-stone-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 flex items-center justify-between text-left transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 block truncate">{g.name}</span>
                        <span className="text-[10px] text-stone-500">
                          {g.familyGroup || 'Unassigned'} • {g.adultsCount + g.kidsCount} seats
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                        + Seat
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
