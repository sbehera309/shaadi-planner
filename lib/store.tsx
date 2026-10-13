'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WeddingProfile,
  WeddingEvent,
  Guest,
  BudgetItem,
  Vendor,
  ShagunRecord,
  RoomAllocation,
  RsvpStatus,
  EventChecklistItem,
} from './types';
import {
  initialWeddingProfile,
  initialEvents,
  initialGuests,
  initialBudgetItems,
  initialVendors,
  initialShagunRecords,
  initialRooms,
  sampleUsaWeddingTemplate,
} from './mockData';
import { isFirebaseConfigured, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

interface WeddingContextType {
  wedding: WeddingProfile | null;
  events: WeddingEvent[];
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  shagunRecords: ShagunRecord[];
  rooms: RoomAllocation[];
  isDemoMode: boolean;

  // Wedding Profile
  createWeddingProfile: (profile: Omit<WeddingProfile, 'id' | 'ownerId'>) => void;
  updateWeddingProfile: (profile: Partial<WeddingProfile>) => void;

  // Events & Checklist
  addEvent: (event: Omit<WeddingEvent, 'id' | 'weddingId'>) => void;
  updateEvent: (id: string, event: Partial<WeddingEvent>) => void;
  deleteEvent: (id: string) => void;
  addChecklistItem: (eventId: string, item: Omit<EventChecklistItem, 'id'>) => void;
  toggleChecklistItem: (eventId: string, itemId: string) => void;
  deleteChecklistItem: (eventId: string, itemId: string) => void;

  // Guests
  addGuest: (guest: Omit<Guest, 'id' | 'weddingId'>) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  updateGuestRsvp: (guestId: string, eventId: string, status: RsvpStatus) => void;

  // Budget
  addBudgetItem: (item: Omit<BudgetItem, 'id' | 'weddingId'>) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // Vendors
  addVendor: (vendor: Omit<Vendor, 'id' | 'weddingId'>) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;

  // Shagun
  addShagunRecord: (record: Omit<ShagunRecord, 'id' | 'weddingId'>) => void;
  updateShagunRecord: (id: string, record: Partial<ShagunRecord>) => void;
  deleteShagunRecord: (id: string) => void;
  toggleShagunThankYou: (id: string) => void;

  // Rooms
  addRoom: (room: Omit<RoomAllocation, 'id' | 'weddingId'>) => void;
  updateRoom: (id: string, room: Partial<RoomAllocation>) => void;
  deleteRoom: (id: string) => void;
  assignGuestToRoom: (roomId: string, guestId: string) => void;
  removeGuestFromRoom: (roomId: string, guestId: string) => void;

  // Template & Reset
  resetToDefaultData: () => void;
  loadSampleTemplate: () => void;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'shaadi_v5_noprofile_profile',
  EVENTS: 'shaadi_v5_noprofile_events',
  GUESTS: 'shaadi_v5_noprofile_guests',
  BUDGET: 'shaadi_v5_noprofile_budget',
  VENDORS: 'shaadi_v5_noprofile_vendors',
  SHAGUN: 'shaadi_v5_noprofile_shagun',
  ROOMS: 'shaadi_v5_noprofile_rooms',
};

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wedding, setWedding] = useState<WeddingProfile | null>(initialWeddingProfile);
  const [events, setEvents] = useState<WeddingEvent[]>(initialEvents);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [shagunRecords, setShagunRecords] = useState<ShagunRecord[]>(initialShagunRecords);
  const [rooms, setRooms] = useState<RoomAllocation[]>(initialRooms);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const savedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const savedVendors = localStorage.getItem(STORAGE_KEYS.VENDORS);
      const savedShagun = localStorage.getItem(STORAGE_KEYS.SHAGUN);
      const savedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);

      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed && (parsed.brideName || parsed.groomName)) {
            setWedding(parsed);
          } else {
            setWedding(null);
          }
        } catch {
          setWedding(null);
        }
      } else {
        setWedding(null);
      }
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedGuests) setGuests(JSON.parse(savedGuests));
      if (savedBudget) setBudgetItems(JSON.parse(savedBudget));
      if (savedVendors) setVendors(JSON.parse(savedVendors));
      if (savedShagun) setShagunRecords(JSON.parse(savedShagun));
      if (savedRooms) setRooms(JSON.parse(savedRooms));
    } catch (e) {
      console.warn('Using default wedding mock data:', e);
    }
    setMounted(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      if (wedding) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(wedding));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PROFILE);
      }
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
      localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budgetItems));
      localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
      localStorage.setItem(STORAGE_KEYS.SHAGUN, JSON.stringify(shagunRecords));
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

      // Optional Firestore sync when configured
      if (isFirebaseConfigured && db && wedding) {
        setDoc(doc(db, 'weddings', wedding.id), wedding, { merge: true }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to sync changes:', e);
    }
  }, [mounted, wedding, events, guests, budgetItems, vendors, shagunRecords, rooms]);

  const createWeddingProfile = (profileData: Omit<WeddingProfile, 'id' | 'ownerId'>) => {
    const bride = profileData.brideName.trim();
    const groom = profileData.groomName.trim();
    const generatedSlug =
      profileData.slug ||
      (groom && bride
        ? `${groom.toLowerCase()}-weds-${bride.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-')
        : 'our-wedding');

    const newProfile: WeddingProfile = {
      ...profileData,
      id: `w-${Date.now()}`,
      ownerId: 'user',
      brideName: bride,
      groomName: groom,
      slug: generatedSlug,
      isConfigured: true,
      currency: profileData.currency || 'USD',
    };
    setWedding(newProfile);
  };

  const updateWeddingProfile = (profile: Partial<WeddingProfile>) => {
    setWedding((prev) => {
      const base: WeddingProfile = prev || {
        id: `w-${Date.now()}`,
        ownerId: 'user',
        brideName: '',
        groomName: '',
        slug: '',
        startDate: '',
        endDate: '',
        city: '',
        venueName: '',
        currency: 'USD',
        targetBudget: 0,
        story: '',
        hashtag: '',
        isConfigured: true,
      };
      const updated = { ...base, ...profile, isConfigured: true };
      if (!updated.slug && updated.brideName && updated.groomName) {
        updated.slug = `${updated.groomName.toLowerCase()}-weds-${updated.brideName.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-');
      }
      return updated;
    });
  };

  const addEvent = (eventData: Omit<WeddingEvent, 'id' | 'weddingId'>) => {
    const newEvent: WeddingEvent = {
      ...eventData,
      id: `e-${Date.now()}`,
      weddingId: wedding?.id || 'w-current',
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updated: Partial<WeddingEvent>) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...updated } : ev)));
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const addChecklistItem = (eventId: string, item: Omit<EventChecklistItem, 'id'>) => {
    const newItem: EventChecklistItem = {
      ...item,
      id: `c-${Date.now()}`,
    };
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? { ...ev, checklist: [...(ev.checklist || []), newItem] }
          : ev
      )
    );
  };

  const toggleChecklistItem = (eventId: string, itemId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          checklist: (ev.checklist || []).map((c) =>
            c.id === itemId ? { ...c, isArranged: !c.isArranged } : c
          ),
        };
      })
    );
  };

  const deleteChecklistItem = (eventId: string, itemId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          checklist: (ev.checklist || []).filter((c) => c.id !== itemId),
        };
      })
    );
  };

  const addGuest = (guestData: Omit<Guest, 'id' | 'weddingId'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: `g-${Date.now()}`,
      weddingId: wedding?.id || 'w-current',
    };
    setGuests((prev) => [...prev, newGuest]);
  };

  const updateGuest = (id: string, updated: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
  };

  const deleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const updateGuestRsvp = (guestId: string, eventId: string, status: RsvpStatus) => {
    setGuests((prev) =>
      prev.map((g) => {
        if (g.id !== guestId) return g;
        return {
          ...g,
          eventRsvps: {
            ...g.eventRsvps,
            [eventId]: status,
          },
        };
      })
    );
  };

  const addBudgetItem = (itemData: Omit<BudgetItem, 'id' | 'weddingId'>) => {
    const newItem: BudgetItem = {
      ...itemData,
      id: `b-${Date.now()}`,
      weddingId: wedding?.id || 'w-current',
    };
    setBudgetItems((prev) => [...prev, newItem]);
  };

  const updateBudgetItem = (id: string, updated: Partial<BudgetItem>) => {
    setBudgetItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBudgetItem = (id: string) => {
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));
  };

  const addVendor = (vendorData: Omit<Vendor, 'id' | 'weddingId'>) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: `v-${Date.now()}`,
      weddingId: wedding?.id || 'w-current',
    };
    setVendors((prev) => [...prev, newVendor]);
  };

  const updateVendor = (id: string, updated: Partial<Vendor>) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const deleteVendor = (id: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
  };

  const addShagunRecord = (recordData: Omit<ShagunRecord, 'id' | 'weddingId'>) => {
    const newRecord: ShagunRecord = {
      ...recordData,
      id: `s-${Date.now()}`,
      weddingId: wedding?.id || 'w-current',
    };
    setShagunRecords((prev) => [newRecord, ...prev]);
  };

  const updateShagunRecord = (id: string, updated: Partial<ShagunRecord>) => {
    setShagunRecords((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  const deleteShagunRecord = (id: string) => {
    setShagunRecords((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleShagunThankYou = (id: string) => {
    setShagunRecords((prev) =>
      prev.map((s) => (s.id === id ? { ...s, thankYouSent: !s.thankYouSent } : s))
    );
  };

  const addRoom = (roomData: Omit<RoomAllocation, 'id' | 'weddingId'>) => {
    const newRoom: RoomAllocation = {
      ...roomData,
      id: `r-${Date.now()}`,
      weddingId: wedding?.id || 'w-current',
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const updateRoom = (id: string, updated: Partial<RoomAllocation>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
  };

  const deleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const assignGuestToRoom = (roomId: string, guestId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId && !r.assignedGuestIds.includes(guestId)) {
          return { ...r, assignedGuestIds: [...r.assignedGuestIds, guestId] };
        }
        return r;
      })
    );
  };

  const removeGuestFromRoom = (roomId: string, guestId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return { ...r, assignedGuestIds: r.assignedGuestIds.filter((id) => id !== guestId) };
        }
        return r;
      })
    );
  };

  const resetToDefaultData = () => {
    setWedding(initialWeddingProfile);
    setEvents(initialEvents);
    setGuests(initialGuests);
    setBudgetItems(initialBudgetItems);
    setVendors(initialVendors);
    setShagunRecords(initialShagunRecords);
    setRooms(initialRooms);
    localStorage.clear();
  };

  const loadSampleTemplate = () => {
    setWedding(sampleUsaWeddingTemplate.wedding);
    setEvents(sampleUsaWeddingTemplate.events);
    setGuests(sampleUsaWeddingTemplate.guests);
    setBudgetItems(sampleUsaWeddingTemplate.budgetItems);
    setVendors(sampleUsaWeddingTemplate.vendors);
    setShagunRecords(sampleUsaWeddingTemplate.shagunRecords);
    setRooms(sampleUsaWeddingTemplate.rooms);
  };

  return (
    <WeddingContext.Provider
      value={{
        wedding,
        events,
        guests,
        budgetItems,
        vendors,
        shagunRecords,
        rooms,
        isDemoMode: !isFirebaseConfigured,
        createWeddingProfile,
        updateWeddingProfile,
        addEvent,
        updateEvent,
        deleteEvent,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
        addGuest,
        updateGuest,
        deleteGuest,
        updateGuestRsvp,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addVendor,
        updateVendor,
        deleteVendor,
        addShagunRecord,
        updateShagunRecord,
        deleteShagunRecord,
        toggleShagunThankYou,
        addRoom,
        updateRoom,
        deleteRoom,
        assignGuestToRoom,
        removeGuestFromRoom,
        resetToDefaultData,
        loadSampleTemplate,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
