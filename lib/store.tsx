'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './authContext';
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
  VenueOption,
  SiteTourDayPlan,
  SangeetVenueOption,
  PaymentInstallment,
  PaymentMilestone,
  CollaboratorRole,
  WeddingCollaborator,
} from './types';
import {
  initialWeddingProfile,
  initialEvents,
  initialGuests,
  initialBudgetItems,
  initialVendors,
  initialShagunRecords,
  initialRooms,
  initialVenues,
  initialTourPlan,
  sampleUsaWeddingTemplate,
} from './mockData';
import { isFirebaseConfigured, db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, getDocs, query, where } from 'firebase/firestore';

interface WeddingContextType {
  wedding: WeddingProfile | null;
  events: WeddingEvent[];
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  shagunRecords: ShagunRecord[];
  rooms: RoomAllocation[];
  venues: VenueOption[];
  tourPlan: SiteTourDayPlan | null;
  officialSangeetVenue: SangeetVenueOption | null;
  scenarioSelection: {
    selectedVenueId?: string | null; // '__NONE__' means explicitly excluded
    includedVendorIds?: string[] | null;
  };
  updateScenarioSelection: (patch: {
    selectedVenueId?: string | null;
    includedVendorIds?: string[] | null;
  }) => void;
  isDemoMode: boolean;

  // Cloud Sync Status
  isCloudSynced: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  cloudSyncError: string | null;
  forceCloudSync: () => Promise<{ success: boolean; error?: string }>;

  // Multi-User Collaboration (Owner / Editor / Viewer)
  collaborators: WeddingCollaborator[];
  userRole: CollaboratorRole;
  isReadOnly: boolean;
  ownerEmail: string | null;
  activeWeddingDocId: string | null;
  joinAccessStatus: 'idle' | 'joined' | 'needs_auth' | 'not_invited';
  pendingJoinWeddingId: string | null;
  addCollaborator: (
    email: string,
    role: 'editor' | 'viewer',
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateCollaboratorRole: (email: string, role: 'editor' | 'viewer') => Promise<void>;
  removeCollaborator: (email: string) => Promise<void>;
  dismissJoinBanner: () => void;

  // Wedding Profile
  createWeddingProfile: (profile: Omit<WeddingProfile, 'id' | 'ownerId'>) => void;
  updateWeddingProfile: (profile: Partial<WeddingProfile>) => void;
  initializeGuidedWedding: (data: {
    profile: Omit<WeddingProfile, 'id' | 'ownerId'>;
    events: Array<Omit<WeddingEvent, 'id' | 'weddingId'>>;
  }) => void;

  // Events & Checklist
  addEvent: (event: Omit<WeddingEvent, 'id' | 'weddingId'>) => void;
  updateEvent: (id: string, event: Partial<WeddingEvent>) => void;
  deleteEvent: (id: string) => void;
  addChecklistItem: (eventId: string, item: Omit<EventChecklistItem, 'id'>) => void;
  toggleChecklistItem: (eventId: string, itemId: string) => void;
  toggleChecklistSubItem: (eventId: string, itemId: string, subItemId: string) => void;
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

  // Milestone Payment Installment Tracking
  addPaymentInstallment: (
    target: { type: 'budget' | 'vendor' | 'venue'; id: string },
    installment: Omit<PaymentInstallment, 'id'>
  ) => void;
  deletePaymentInstallment: (
    target: { type: 'budget' | 'vendor' | 'venue'; id: string },
    installmentId: string
  ) => void;

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

  // Venues & Site Tour Route Optimizer
  addVenue: (venue: Omit<VenueOption, 'id' | 'weddingId'>) => void;
  updateVenue: (id: string, venue: Partial<VenueOption>) => void;
  deleteVenue: (id: string) => void;
  setOfficialVenue: (venueId: string) => void;
  applyVenueSelection: (params: {
    venueId?: string;
    curatedVenue?: VenueOption;
    customVenue?: { name: string; address?: string; city?: string; state?: string };
    eventIds: string[];
    eventDate?: string;
    isPrimaryWeddingVenue?: boolean;
  }) => void;
  rescheduleEventDate: (eventId: string, newDate: string) => void;
  saveContractAndSchedule: (params: {
    targetType: 'venue' | 'budget' | 'vendor';
    targetId: string;
    title: string;
    totalCost: number;
    contractNotes?: string;
    paymentSchedule: PaymentMilestone[];
  }) => void;
  saveTourPlan: (plan: SiteTourDayPlan) => void;
  clearTourPlan: () => void;
  setOfficialSangeetVenue: (venue: SangeetVenueOption | null) => void;

  // Template & Reset
  resetToDefaultData: () => void;
  loadSampleTemplate: () => void;
  importFullWeddingData: (data: {
    wedding?: Partial<WeddingProfile>;
    events?: WeddingEvent[];
    budgetItems?: BudgetItem[];
    guests?: Guest[];
    vendors?: Vendor[];
    shagunRecords?: ShagunRecord[];
    rooms?: RoomAllocation[];
    venues?: VenueOption[];
    tourPlan?: SiteTourDayPlan;
  }) => void;
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
  VENUES: 'shaadi_v5_venues',
  TOUR_PLAN: 'shaadi_v5_tour_plan',
  SANGEET_VENUE: 'shaadi_v5_sangeet_venue',
};

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<WeddingProfile | null>(initialWeddingProfile);
  const [events, setEvents] = useState<WeddingEvent[]>(initialEvents);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [shagunRecords, setShagunRecords] = useState<ShagunRecord[]>(initialShagunRecords);
  const [rooms, setRooms] = useState<RoomAllocation[]>(initialRooms);
  const [venues, setVenues] = useState<VenueOption[]>(initialVenues);
  const [tourPlan, setTourPlan] = useState<SiteTourDayPlan | null>(initialTourPlan);
  const [officialSangeetVenue, setOfficialSangeetVenueState] = useState<SangeetVenueOption | null>(null);
  const [scenarioSelection, setScenarioSelection] = useState<{
    selectedVenueId?: string | null;
    includedVendorIds?: string[] | null;
  }>({});
  const [mounted, setMounted] = useState(false);

  // Cloud Sync State
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);

  // Multi-User Collaborator State
  const [collaborators, setCollaborators] = useState<WeddingCollaborator[]>([]);
  const [userRole, setUserRole] = useState<CollaboratorRole>('owner');
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [ownerUid, setOwnerUid] = useState<string | null>(null);
  const [activeWeddingDocId, setActiveWeddingDocId] = useState<string | null>(null);
  const [joinAccessStatus, setJoinAccessStatus] = useState<
    'idle' | 'joined' | 'needs_auth' | 'not_invited'
  >('idle');
  const [pendingJoinWeddingId, setPendingJoinWeddingId] = useState<string | null>(null);

  const isApplyingRemoteRef = useRef(false);
  const hasHydratedFromCloudRef = useRef(false);
  const allowEmptySyncRef = useRef(false);

  // 1. Initial Load from localStorage on client mount (instant offline cache)
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const savedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
      const savedBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
      const savedVendors = localStorage.getItem(STORAGE_KEYS.VENDORS);
      const savedShagun = localStorage.getItem(STORAGE_KEYS.SHAGUN);
      const savedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
      const savedVenues = localStorage.getItem(STORAGE_KEYS.VENUES);
      const savedTourPlan = localStorage.getItem(STORAGE_KEYS.TOUR_PLAN);
      const savedSangeetVenue = localStorage.getItem(STORAGE_KEYS.SANGEET_VENUE);

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
      if (savedVenues) setVenues(JSON.parse(savedVenues));
      if (savedTourPlan) setTourPlan(JSON.parse(savedTourPlan));
      if (savedSangeetVenue) setOfficialSangeetVenueState(JSON.parse(savedSangeetVenue));
      const savedScenarioVenue = localStorage.getItem('shaadi_scenario_selected_venue_id');
      const savedScenarioVendors = localStorage.getItem('shaadi_scenario_included_vendors');
      if (savedScenarioVenue !== null || savedScenarioVendors !== null) {
        setScenarioSelection({
          ...(savedScenarioVenue !== null ? { selectedVenueId: savedScenarioVenue } : {}),
          ...(savedScenarioVendors !== null ? { includedVendorIds: JSON.parse(savedScenarioVendors) } : {}),
        });
      }
    } catch (e) {
      console.warn('Using default wedding mock data:', e);
    }
    setMounted(true);
  }, []);

  // 1b. Capture ?join=<weddingId> invite parameter on mount (survives OAuth redirects via sessionStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const joinParam = params.get('join');
      if (joinParam && joinParam.trim()) {
        sessionStorage.setItem('vivaah_pending_join_wedding_id', joinParam.trim());
        setPendingJoinWeddingId(joinParam.trim());
      } else {
        const storedJoin = sessionStorage.getItem('vivaah_pending_join_wedding_id');
        if (storedJoin) {
          setPendingJoinWeddingId(storedJoin);
        }
      }
    } catch {}
  }, []);

  // Helper to hydrate React state & local cache from a Firestore wedding document
  const applyRemoteWeddingData = useCallback((remoteData: any, docId?: string) => {
    isApplyingRemoteRef.current = true;

    if (remoteData.profile) setWedding(remoteData.profile);
    if (Array.isArray(remoteData.events)) setEvents(remoteData.events);
    if (Array.isArray(remoteData.guests)) setGuests(remoteData.guests);
    if (Array.isArray(remoteData.budgetItems)) setBudgetItems(remoteData.budgetItems);
    if (Array.isArray(remoteData.vendors)) setVendors(remoteData.vendors);
    if (Array.isArray(remoteData.shagunRecords)) setShagunRecords(remoteData.shagunRecords);
    if (Array.isArray(remoteData.rooms)) setRooms(remoteData.rooms);
    if (Array.isArray(remoteData.venues)) setVenues(remoteData.venues);
    if (remoteData.tourPlan !== undefined) setTourPlan(remoteData.tourPlan);
    if (remoteData.officialSangeetVenue !== undefined) setOfficialSangeetVenueState(remoteData.officialSangeetVenue);
    if (Array.isArray(remoteData.collaborators)) setCollaborators(remoteData.collaborators);
    if (remoteData.ownerEmail || remoteData.userEmail) {
      setOwnerEmail((remoteData.ownerEmail || remoteData.userEmail || '').toLowerCase());
    }
    if (remoteData.ownerUid || remoteData.userId) {
      setOwnerUid(remoteData.ownerUid || remoteData.userId);
    }
    if (docId) setActiveWeddingDocId(docId);

    // Update local cache for offline availability
    try {
      if (remoteData.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(remoteData.profile));
      if (remoteData.events) localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(remoteData.events));
      if (remoteData.guests) localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(remoteData.guests));
      if (remoteData.budgetItems) localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(remoteData.budgetItems));
      if (remoteData.vendors) localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(remoteData.vendors));
      if (remoteData.shagunRecords) localStorage.setItem(STORAGE_KEYS.SHAGUN, JSON.stringify(remoteData.shagunRecords));
      if (remoteData.rooms) localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(remoteData.rooms));
      if (remoteData.venues) localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(remoteData.venues));
      if (remoteData.tourPlan) localStorage.setItem(STORAGE_KEYS.TOUR_PLAN, JSON.stringify(remoteData.tourPlan));
      if (remoteData.officialSangeetVenue) localStorage.setItem(STORAGE_KEYS.SANGEET_VENUE, JSON.stringify(remoteData.officialSangeetVenue));

      if (remoteData.scenarioSelection) {
        setScenarioSelection(remoteData.scenarioSelection);
        if (remoteData.scenarioSelection.selectedVenueId !== undefined) {
          localStorage.setItem(
            'shaadi_scenario_selected_venue_id',
            remoteData.scenarioSelection.selectedVenueId || '__NONE__'
          );
        }
        if (remoteData.scenarioSelection.includedVendorIds) {
          localStorage.setItem(
            'shaadi_scenario_included_vendors',
            JSON.stringify(remoteData.scenarioSelection.includedVendorIds)
          );
        }
      }
    } catch {}

    hasHydratedFromCloudRef.current = true;
    setIsCloudSynced(true);
    setCloudSyncError(null);
    setLastSyncedAt(remoteData.updatedAt || new Date().toISOString());

    setTimeout(() => {
      isApplyingRemoteRef.current = false;
    }, 400);
  }, []);

  // 2. Real-Time Cloud Firestore Sync (Supports Owner Multi-Device + Invited Collaborators View/Edit!)
  useEffect(() => {
    if (!mounted) return;

    if (!isFirebaseConfigured || !db) {
      setIsCloudSynced(false);
      return;
    }

    if (!user) {
      setIsCloudSynced(false);
      if (pendingJoinWeddingId) {
        setJoinAccessStatus('needs_auth');
      }
      return;
    }

    const firestore = db;
    const userEmailLower = (user.email || '').toLowerCase().trim();
    let activeUnsubscribe: (() => void) | null = null;
    let cancelled = false;

    const resolveAndSubscribe = async () => {
      try {
        // Helper to subscribe to a shared weddings/{docId} document in real time
        const subscribeToSharedWeddingDoc = (targetDocId: string, initialRole: CollaboratorRole) => {
          if (cancelled) return;
          setActiveWeddingDocId(targetDocId);
          setUserRole(initialRole);

          const sharedDocRef = doc(firestore, 'weddings', targetDocId);
          activeUnsubscribe = onSnapshot(
            sharedDocRef,
            (snap) => {
              if (!snap.exists()) return;
              const data = snap.data();

              // Dynamically re-verify role on every live update (handles instant role changes or revocation!)
              const docOwnerUid = data.ownerUid || data.userId;
              const docOwnerEmail = (data.ownerEmail || data.userEmail || '').toLowerCase().trim();
              if (docOwnerUid === user.uid || (docOwnerEmail && docOwnerEmail === userEmailLower)) {
                setUserRole('owner');
              } else {
                const list: WeddingCollaborator[] = Array.isArray(data.collaborators)
                  ? data.collaborators
                  : [];
                const match = list.find((c) => c.email.toLowerCase().trim() === userEmailLower);
                if (match) {
                  setUserRole(match.role);
                } else {
                  // Access was revoked by owner!
                  setUserRole('viewer');
                  setJoinAccessStatus('not_invited');
                  return;
                }
              }

              applyRemoteWeddingData(data, targetDocId);
            },
            (err: any) => {
              console.warn('Shared wedding real-time listener error:', err);
              setIsCloudSynced(false);
              setCloudSyncError(
                err?.code === 'permission-denied'
                  ? 'Firestore Security Rules are denying access (Permission Denied). Please update rules in Firebase Console.'
                  : err?.message || 'Firestore connection error'
              );
            }
          );
        };

        // PATH A: User arrived via a direct Collaborator Invite Link (?join=<weddingId>)
        if (pendingJoinWeddingId) {
          const joinRef = doc(firestore, 'weddings', pendingJoinWeddingId);
          const joinSnap = await getDoc(joinRef);
          if (joinSnap.exists()) {
            const joinData = joinSnap.data();
            const docOwnerUid = joinData.ownerUid || joinData.userId;
            const docOwnerEmail = (joinData.ownerEmail || joinData.userEmail || '').toLowerCase().trim();
            const collabList: WeddingCollaborator[] = Array.isArray(joinData.collaborators)
              ? joinData.collaborators
              : [];
            const matchedCollab = collabList.find(
              (c) => c.email.toLowerCase().trim() === userEmailLower
            );

            if (docOwnerUid === user.uid || (docOwnerEmail && docOwnerEmail === userEmailLower)) {
              setJoinAccessStatus('joined');
              try {
                sessionStorage.removeItem('vivaah_pending_join_wedding_id');
              } catch {}
              subscribeToSharedWeddingDoc(pendingJoinWeddingId, 'owner');
              return;
            } else if (matchedCollab) {
              setJoinAccessStatus('joined');
              try {
                sessionStorage.removeItem('vivaah_pending_join_wedding_id');
              } catch {}
              subscribeToSharedWeddingDoc(pendingJoinWeddingId, matchedCollab.role);
              return;
            } else {
              setJoinAccessStatus('not_invited');
              hasHydratedFromCloudRef.current = true;
              return;
            }
          }
        }

        // PATH B: Check if this user OWNS a wedding in weddings collection
        const weddingsCol = collection(firestore, 'weddings');
        const qOwned = query(weddingsCol, where('userId', '==', user.uid));
        const snapOwned = await getDocs(qOwned);
        if (!snapOwned.empty) {
          const ownedDoc = snapOwned.docs[0];
          subscribeToSharedWeddingDoc(ownedDoc.id, 'owner');
          return;
        }

        // PATH C: Check if this user is an INVITED COLLABORATOR on any wedding (via collaboratorEmails!)
        if (userEmailLower) {
          const qCollab = query(
            weddingsCol,
            where('collaboratorEmails', 'array-contains', userEmailLower)
          );
          const snapCollab = await getDocs(qCollab);
          if (!snapCollab.empty) {
            const sharedDoc = snapCollab.docs[0];
            const sharedData = sharedDoc.data();
            const collabList: WeddingCollaborator[] = Array.isArray(sharedData.collaborators)
              ? sharedData.collaborators
              : [];
            const matched = collabList.find((c) => c.email.toLowerCase().trim() === userEmailLower);
            if (matched) {
              subscribeToSharedWeddingDoc(sharedDoc.id, matched.role);
              return;
            }
          }
        }

        // PATH D: Fallback to user's personal profile doc (users/{uid}/wedding_data/main)
        const userWeddingDocRef = doc(firestore, 'users', user.uid, 'wedding_data', 'main');
        setUserRole('owner');
        setOwnerUid(user.uid);
        setOwnerEmail(userEmailLower);

        activeUnsubscribe = onSnapshot(
          userWeddingDocRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const hasMeaningfulRemote =
                (data.profile !== null &&
                  data.profile !== undefined &&
                  (data.profile.isConfigured || data.profile.brideName || data.profile.groomName)) ||
                (Array.isArray(data.venues) &&
                  data.venues.length > 0 &&
                  data.venues.some((v: any) => v.tourStatus === 'shortlisted' || v.isSelectedOfficialVenue));

              if (hasMeaningfulRemote) {
                const weddingId = data.profile?.id || null;
                applyRemoteWeddingData(data, weddingId || undefined);
                return;
              }
            }

            // Brand new user with no cloud doc yet — allow local seeding
            hasHydratedFromCloudRef.current = true;
            setIsCloudSynced(true);
          },
          (err: any) => {
            console.warn('Real-time cloud profile sync listener error:', err);
            setIsCloudSynced(false);
            setCloudSyncError(
              err?.code === 'permission-denied'
                ? 'Firestore Security Rules are denying access (Permission Denied). Please update rules in Firebase Console.'
                : err?.message || 'Firestore connection error'
            );
          }
        );
      } catch (err: any) {
        console.warn('Workspace resolution error:', err);
        setCloudSyncError(err?.message || 'Could not load cloud workspace');
        hasHydratedFromCloudRef.current = true;
      }
    };

    resolveAndSubscribe();

    return () => {
      cancelled = true;
      if (activeUnsubscribe) activeUnsubscribe();
    };
  }, [user, mounted, pendingJoinWeddingId, applyRemoteWeddingData]);

  // 3. Save changes locally & push updates to Firestore (Role-Aware: Owner / Editor / Blocked for Viewer!)
  useEffect(() => {
    if (!mounted) return;
    try {
      // Viewers can browse locally without overwriting the couple's cloud data
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
      localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(venues));
      if (tourPlan) {
        localStorage.setItem(STORAGE_KEYS.TOUR_PLAN, JSON.stringify(tourPlan));
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOUR_PLAN);
      }
      if (officialSangeetVenue) {
        localStorage.setItem(STORAGE_KEYS.SANGEET_VENUE, JSON.stringify(officialSangeetVenue));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SANGEET_VENUE);
      }

      // Sync directly to Firestore if authenticated AND not view-only
      if (!isApplyingRemoteRef.current && isFirebaseConfigured && db && user) {
        // Critical Guard 0: Viewers are strictly read-only!
        if (userRole === 'viewer') {
          return;
        }

        // Critical Guard 1: Do NOT push to Firestore until this device has completed initial hydration from the cloud!
        if (!hasHydratedFromCloudRef.current) {
          return;
        }

        // Critical Guard 2: Never push a completely empty/unconfigured state that could overwrite cloud profile
        const hasMeaningfulLocalData =
          allowEmptySyncRef.current ||
          (wedding !== null && wedding.isConfigured) ||
          venues.some((v) => v.tourStatus === 'shortlisted' || v.isSelectedOfficialVenue) ||
          vendors.some((v) => v.status === 'shortlisted' || v.status === 'confirmed') ||
          budgetItems.some((b) => b.installments && b.installments.length > 0) ||
          (tourPlan !== null && tourPlan.optimizedStops && tourPlan.optimizedStops.length > 0);

        if (!hasMeaningfulLocalData) {
          return;
        }

        setIsSyncing(true);
        const firestore = db;
        const resolvedOwnerUid = ownerUid || user.uid;
        const resolvedOwnerEmail = ownerEmail || (user.email || '').toLowerCase();
        const collaboratorEmails = collaborators.map((c) => c.email.toLowerCase().trim());

        const cloudData = {
          profile: wedding,
          events,
          guests,
          budgetItems,
          vendors,
          shagunRecords,
          rooms,
          venues,
          tourPlan,
          officialSangeetVenue,
          scenarioSelection,
          collaborators,
          collaboratorEmails,
          ownerUid: resolvedOwnerUid,
          ownerEmail: resolvedOwnerEmail,
          userId: resolvedOwnerUid,
          userEmail: resolvedOwnerEmail,
          lastEditedBy: user.email || '',
          updatedAt: new Date().toISOString(),
        };

        const targetWeddingId = activeWeddingDocId || wedding?.id;

        const writePromises: Promise<any>[] = [];
        if (targetWeddingId) {
          writePromises.push(
            setDoc(doc(firestore, 'weddings', targetWeddingId), cloudData, { merge: true })
          );
        }
        // Only the owner mirrors to their personal users/{uid}/wedding_data/main doc
        if (userRole === 'owner') {
          writePromises.push(
            setDoc(doc(firestore, 'users', user.uid, 'wedding_data', 'main'), cloudData, { merge: true })
          );
        }

        Promise.all(writePromises)
          .then(() => {
            setIsCloudSynced(true);
            setCloudSyncError(null);
            setLastSyncedAt(new Date().toISOString());
          })
          .catch((err: any) => {
            console.warn('Failed to sync changes to cloud workspace:', err);
            setIsCloudSynced(false);
            setCloudSyncError(
              err?.code === 'permission-denied'
                ? 'Firestore Security Rules are denying access (Permission Denied). Please update rules in Firebase Console.'
                : err?.message || 'Failed to sync changes'
            );
          })
          .finally(() => {
            setIsSyncing(false);
          });
      }
    } catch (e) {
      console.error('Failed to sync changes:', e);
    }
  }, [
    mounted,
    user,
    userRole,
    activeWeddingDocId,
    ownerUid,
    ownerEmail,
    collaborators,
    wedding,
    events,
    guests,
    budgetItems,
    vendors,
    shagunRecords,
    rooms,
    venues,
    tourPlan,
    officialSangeetVenue,
    scenarioSelection,
  ]);

  // 4. Force Cloud Sync helper (with verified status and error reporting)
  const forceCloudSync = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseConfigured || !db || !user) {
      const msg = !user
        ? 'Please sign in to sync with your cloud profile'
        : 'Firebase is not configured in this environment';
      setCloudSyncError(msg);
      return { success: false, error: msg };
    }
    setIsSyncing(true);
    setCloudSyncError(null);
    const firestore = db;
    try {
      const userDocRef = doc(firestore, 'users', user.uid, 'wedding_data', 'main');
      const cloudData = {
        profile: wedding,
        events,
        guests,
        budgetItems,
        vendors,
        shagunRecords,
        rooms,
        venues,
        tourPlan,
        officialSangeetVenue,
        userId: user.uid,
        userEmail: user.email || '',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, cloudData, { merge: true });
      await setDoc(
        doc(firestore, 'users', user.uid),
        { email: user.email, hasWeddingData: true, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setIsCloudSynced(true);
      setCloudSyncError(null);
      setLastSyncedAt(new Date().toISOString());
      return { success: true };
    } catch (err: any) {
      console.warn('Force sync to Firestore user profile failed:', err);
      const errMsg =
        err?.code === 'permission-denied'
          ? 'Firestore Security Rules blocked write (Permission Denied). Please update rules in Firebase Console.'
          : err?.message || 'Sync failed';
      setCloudSyncError(errMsg);
      setIsCloudSynced(false);
      return { success: false, error: errMsg };
    } finally {
      setIsSyncing(false);
    }
  }, [user, wedding, events, guests, budgetItems, vendors, shagunRecords, rooms, venues, tourPlan, officialSangeetVenue]);

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

  const initializeGuidedWedding = (data: {
    profile: Omit<WeddingProfile, 'id' | 'ownerId'>;
    events: Array<Omit<WeddingEvent, 'id' | 'weddingId'>>;
  }) => {
    const weddingId = `w-${Date.now()}`;
    const bride = data.profile.brideName.trim();
    const groom = data.profile.groomName.trim();
    const slug =
      data.profile.slug ||
      (groom && bride
        ? `${groom.toLowerCase()}-weds-${bride.toLowerCase()}`.replace(/[^a-z0-9]+/g, '-')
        : 'our-wedding');

    const newProfile: WeddingProfile = {
      ...data.profile,
      id: weddingId,
      ownerId: 'user',
      brideName: bride,
      groomName: groom,
      slug,
      isConfigured: true,
      currency: 'USD',
    };

    const newEvents: WeddingEvent[] = data.events.map((ev, index) => ({
      ...ev,
      id: `e-${Date.now()}-${index}`,
      weddingId,
    }));

    setWedding(newProfile);
    setEvents(newEvents);
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

  const toggleChecklistSubItem = (eventId: string, itemId: string, subItemId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          checklist: (ev.checklist || []).map((c) => {
            if (c.id !== itemId) return c;
            const updatedSubItems = (c.subItems || []).map((sub) =>
              sub.id === subItemId ? { ...sub, completed: !sub.completed } : sub
            );
            const allDone = updatedSubItems.length > 0 && updatedSubItems.every((s) => s.completed);
            return {
              ...c,
              subItems: updatedSubItems,
              isArranged: allDone ? true : c.isArranged,
            };
          }),
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

  const addPaymentInstallment = (
    target: { type: 'budget' | 'vendor' | 'venue'; id: string },
    installmentData: Omit<PaymentInstallment, 'id'>
  ) => {
    const newInstallment: PaymentInstallment = {
      ...installmentData,
      id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recordedAt: installmentData.recordedAt || new Date().toISOString(),
    };

    if (target.type === 'budget') {
      let linkedVendorId: string | undefined;
      setBudgetItems((prev) =>
        prev.map((b) => {
          if (b.id !== target.id) return b;
          linkedVendorId = b.vendorId;
          const currentInsts = b.installments || [];
          const updatedInsts = [...currentInsts, newInstallment];
          const newPaid = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          const newStatus: BudgetItem['status'] =
            b.actualCost > 0 && newPaid >= b.actualCost
              ? 'paid'
              : newPaid > 0
              ? 'partial'
              : 'pending';
          return {
            ...b,
            installments: updatedInsts,
            paidAmount: newPaid,
            status: newStatus,
          };
        })
      );

      if (linkedVendorId) {
        setVendors((prev) =>
          prev.map((v) => {
            if (v.id !== linkedVendorId) return v;
            const currentInsts = v.installments || [];
            const updatedInsts = [...currentInsts, newInstallment];
            const newDeposit = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
            return {
              ...v,
              installments: updatedInsts,
              depositPaid: newDeposit,
            };
          })
        );
      }
    } else if (target.type === 'vendor') {
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id !== target.id) return v;
          const currentInsts = v.installments || [];
          const updatedInsts = [...currentInsts, newInstallment];
          const newDeposit = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          return {
            ...v,
            installments: updatedInsts,
            depositPaid: newDeposit,
            status: v.status === 'shortlisted' ? 'confirmed' : v.status,
          };
        })
      );

      setBudgetItems((prev) =>
        prev.map((b) => {
          if (b.vendorId !== target.id) return b;
          const currentInsts = b.installments || [];
          const updatedInsts = [...currentInsts, newInstallment];
          const newPaid = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          const newStatus: BudgetItem['status'] =
            b.actualCost > 0 && newPaid >= b.actualCost
              ? 'paid'
              : newPaid > 0
              ? 'partial'
              : 'pending';
          return {
            ...b,
            installments: updatedInsts,
            paidAmount: newPaid,
            status: newStatus,
          };
        })
      );
    } else if (target.type === 'venue') {
      setVenues((prev) =>
        prev.map((v) => {
          if (v.id !== target.id) return v;
          const currentInsts = v.installments || [];
          const updatedInsts = [...currentInsts, newInstallment];
          return {
            ...v,
            installments: updatedInsts,
          };
        })
      );

      setBudgetItems((prev) =>
        prev.map((b) => {
          if (b.category !== 'Venue & Catering') return b;
          const currentInsts = b.installments || [];
          const updatedInsts = [...currentInsts, newInstallment];
          const newPaid = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          const newStatus: BudgetItem['status'] =
            b.actualCost > 0 && newPaid >= b.actualCost
              ? 'paid'
              : newPaid > 0
              ? 'partial'
              : 'pending';
          return {
            ...b,
            installments: updatedInsts,
            paidAmount: newPaid,
            status: newStatus,
          };
        })
      );
    }
  };

  const deletePaymentInstallment = (
    target: { type: 'budget' | 'vendor' | 'venue'; id: string },
    installmentId: string
  ) => {
    if (target.type === 'budget') {
      let linkedVendorId: string | undefined;
      setBudgetItems((prev) =>
        prev.map((b) => {
          if (b.id !== target.id) return b;
          linkedVendorId = b.vendorId;
          const updatedInsts = (b.installments || []).filter((i) => i.id !== installmentId);
          const newPaid = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          const newStatus: BudgetItem['status'] =
            b.actualCost > 0 && newPaid >= b.actualCost
              ? 'paid'
              : newPaid > 0
              ? 'partial'
              : 'pending';
          return {
            ...b,
            installments: updatedInsts,
            paidAmount: newPaid,
            status: newStatus,
          };
        })
      );

      if (linkedVendorId) {
        setVendors((prev) =>
          prev.map((v) => {
            if (v.id !== linkedVendorId) return v;
            const updatedInsts = (v.installments || []).filter((i) => i.id !== installmentId);
            const newDeposit = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
            return {
              ...v,
              installments: updatedInsts,
              depositPaid: newDeposit,
            };
          })
        );
      }
    } else if (target.type === 'vendor') {
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id !== target.id) return v;
          const updatedInsts = (v.installments || []).filter((i) => i.id !== installmentId);
          const newDeposit = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          return {
            ...v,
            installments: updatedInsts,
            depositPaid: newDeposit,
          };
        })
      );

      setBudgetItems((prev) =>
        prev.map((b) => {
          if (b.vendorId !== target.id) return b;
          const updatedInsts = (b.installments || []).filter((i) => i.id !== installmentId);
          const newPaid = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          const newStatus: BudgetItem['status'] =
            b.actualCost > 0 && newPaid >= b.actualCost
              ? 'paid'
              : newPaid > 0
              ? 'partial'
              : 'pending';
          return {
            ...b,
            installments: updatedInsts,
            paidAmount: newPaid,
            status: newStatus,
          };
        })
      );
    } else if (target.type === 'venue') {
      setVenues((prev) =>
        prev.map((v) => {
          if (v.id !== target.id) return v;
          const updatedInsts = (v.installments || []).filter((i) => i.id !== installmentId);
          return {
            ...v,
            installments: updatedInsts,
          };
        })
      );

      setBudgetItems((prev) =>
        prev.map((b) => {
          if (b.category !== 'Venue & Catering') return b;
          const updatedInsts = (b.installments || []).filter((i) => i.id !== installmentId);
          const newPaid = updatedInsts.reduce((acc, inst) => acc + (Number(inst.amount) || 0), 0);
          const newStatus: BudgetItem['status'] =
            b.actualCost > 0 && newPaid >= b.actualCost
              ? 'paid'
              : newPaid > 0
              ? 'partial'
              : 'pending';
          return {
            ...b,
            installments: updatedInsts,
            paidAmount: newPaid,
            status: newStatus,
          };
        })
      );
    }
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

  // -------------------------------------------------------------
  // VENUES & SITE TOUR ROUTE OPTIMIZER METHODS
  // -------------------------------------------------------------
  const addVenue = (venueData: Omit<VenueOption, 'id' | 'weddingId'>) => {
    const newVenue: VenueOption = {
      ...venueData,
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      weddingId: wedding?.id || 'w-user-1',
    };
    setVenues((prev) => [...prev, newVenue]);
  };

  const updateVenue = (id: string, updated: Partial<VenueOption>) => {
    setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
  };

  const deleteVenue = (id: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
    if (tourPlan && tourPlan.selectedVenueIds.includes(id)) {
      setTourPlan({
        ...tourPlan,
        selectedVenueIds: tourPlan.selectedVenueIds.filter((vid) => vid !== id),
        optimizedStops: tourPlan.optimizedStops.filter((s) => s.venueId !== id),
      });
    }
  };

  // Helper to keep wedding startDate/endDate spanning the earliest and latest scheduled events
  const syncWeddingDateSpan = (updatedEvents: WeddingEvent[]) => {
    const validDates = updatedEvents
      .map((ev) => ev.date)
      .filter((d): d is string => Boolean(d && d.trim() !== '' && d !== 'TBD' && /^\d{4}-\d{2}-\d{2}$/.test(d)))
      .sort();

    if (validDates.length > 0) {
      updateWeddingProfile({
        startDate: validDates[0],
        endDate: validDates[validDates.length - 1],
      });
    }
  };

  const rescheduleEventDate = (eventId: string, newDate: string) => {
    setEvents((prev) => {
      const next = prev.map((ev) => (ev.id === eventId ? { ...ev, date: newDate } : ev));
      syncWeddingDateSpan(next);
      return next;
    });
  };

  const setOfficialVenue = (venueId: string) => {
    const targetVenue = venues.find((v) => v.id === venueId);
    if (!targetVenue) return;

    const fullAddress = [targetVenue.address, targetVenue.city, targetVenue.state, targetVenue.zipCode]
      .filter(Boolean)
      .join(', ');

    // 1. Mark only this venue as selected official
    setVenues((prev) =>
      prev.map((v) =>
        v.id === venueId
          ? { ...v, isSelectedOfficialVenue: true, tourStatus: 'selected' }
          : { ...v, isSelectedOfficialVenue: false }
      )
    );

    // 2. Update Wedding Profile
    updateWeddingProfile({
      venueName: targetVenue.name,
      city: `${targetVenue.city}, ${targetVenue.state}`,
    });

    // 3. Also sync Wedding Ceremony & Reception events to this venue automatically
    setEvents((prev) =>
      prev.map((ev) => {
        if (
          ev.type === 'pheras' ||
          ev.type === 'baraat' ||
          ev.type === 'vidaai' ||
          ev.type === 'reception'
        ) {
          return {
            ...ev,
            venueName: targetVenue.name,
            venueAddress: fullAddress || ev.venueAddress,
            hotelBlockName: targetVenue.nearestHotel?.hotelName || ev.hotelBlockName,
          };
        }
        return ev;
      })
    );

    // 4. Sync or create Budget item for Venue & Catering
    if (targetVenue.pricing.estimatedTotalCost > 0) {
      const existingVenueBudgetItem = budgetItems.find((b) => b.category === 'Venue & Catering');
      if (existingVenueBudgetItem) {
        updateBudgetItem(existingVenueBudgetItem.id, {
          title: `${targetVenue.name} — Hall Rental, F&B Minimum & Catering`,
          estimatedCost: targetVenue.pricing.estimatedTotalCost,
          actualCost: targetVenue.pricing.estimatedTotalCost,
        });
      } else {
        addBudgetItem({
          title: `${targetVenue.name} — Hall Rental, F&B Minimum & Catering`,
          category: 'Venue & Catering',
          estimatedCost: targetVenue.pricing.estimatedTotalCost,
          actualCost: targetVenue.pricing.estimatedTotalCost,
          paidAmount: 0,
          dueDate: '2026-10-15',
          paidBy: 'split_50_50',
          status: 'pending',
        });
      }
    }
  };

  const applyVenueSelection = (params: {
    venueId?: string;
    curatedVenue?: VenueOption;
    customVenue?: { name: string; address?: string; city?: string; state?: string };
    eventIds: string[];
    eventDate?: string;
    isPrimaryWeddingVenue?: boolean;
  }) => {
    const {
      venueId,
      curatedVenue,
      customVenue,
      eventIds,
      eventDate,
      isPrimaryWeddingVenue = true,
    } = params;

    let venueName = '';
    let venueAddress = '';
    let venueCity = '';
    let hotelBlockName = '';
    let estimatedTotalCost = 0;

    if (venueId) {
      const existing = venues.find((v) => v.id === venueId);
      if (existing) {
        venueName = existing.name;
        venueAddress = [existing.address, existing.city, existing.state, existing.zipCode].filter(Boolean).join(', ');
        venueCity = [existing.city, existing.state].filter(Boolean).join(', ');
        hotelBlockName = existing.nearestHotel?.hotelName || '';
        estimatedTotalCost = existing.pricing?.estimatedTotalCost || 0;

        if (isPrimaryWeddingVenue) {
          setVenues((prev) =>
            prev.map((v) =>
              v.id === venueId
                ? { ...v, isSelectedOfficialVenue: true, tourStatus: 'selected' }
                : { ...v, isSelectedOfficialVenue: false }
            )
          );
        }
      }
    } else if (curatedVenue) {
      venueName = curatedVenue.name;
      venueAddress = [curatedVenue.address, curatedVenue.city, curatedVenue.state, curatedVenue.zipCode]
        .filter(Boolean)
        .join(', ');
      venueCity = [curatedVenue.city, curatedVenue.state].filter(Boolean).join(', ');
      hotelBlockName = curatedVenue.nearestHotel?.hotelName || '';
      estimatedTotalCost = curatedVenue.pricing?.estimatedTotalCost || 0;

      if (isPrimaryWeddingVenue) {
        setVenues((prev) => {
          const alreadyExists = prev.find(
            (v) => v.id === curatedVenue.id || v.name.toLowerCase() === curatedVenue.name.toLowerCase()
          );
          if (alreadyExists) {
            return prev.map((v) =>
              v.id === alreadyExists.id
                ? { ...v, isSelectedOfficialVenue: true, tourStatus: 'selected' }
                : { ...v, isSelectedOfficialVenue: false }
            );
          }
          const newEntry: VenueOption = {
            ...curatedVenue,
            id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            weddingId: wedding?.id || 'w-user-1',
            tourStatus: 'selected',
            isSelectedOfficialVenue: true,
          };
          return [...prev.map((v) => ({ ...v, isSelectedOfficialVenue: false })), newEntry];
        });
      }
    } else if (customVenue && customVenue.name.trim()) {
      venueName = customVenue.name.trim();
      venueAddress = [customVenue.address, customVenue.city, customVenue.state].filter(Boolean).join(', ');
      venueCity = [customVenue.city, customVenue.state].filter(Boolean).join(', ');
    }

    if (!venueName) return;

    // 1. Update Wedding Profile if primary
    if (isPrimaryWeddingVenue) {
      updateWeddingProfile({
        venueName,
        ...(venueCity ? { city: venueCity } : {}),
      });
    }

    // 2. Update selected events with venue & optional date
    setEvents((prev) => {
      const next = prev.map((ev) => {
        if (!eventIds.includes(ev.id)) return ev;
        return {
          ...ev,
          venueName,
          ...(venueAddress ? { venueAddress } : {}),
          ...(hotelBlockName ? { hotelBlockName } : {}),
          ...(eventDate ? { date: eventDate } : {}),
        };
      });
      if (eventDate) {
        syncWeddingDateSpan(next);
      }
      return next;
    });

    // 3. Sync Venue & Catering budget item if primary & pricing available
    if (isPrimaryWeddingVenue && estimatedTotalCost > 0) {
      const existingVenueBudgetItem = budgetItems.find((b) => b.category === 'Venue & Catering');
      if (existingVenueBudgetItem) {
        updateBudgetItem(existingVenueBudgetItem.id, {
          title: `${venueName} — Hall Rental, F&B Minimum & Catering`,
          estimatedCost: estimatedTotalCost,
          actualCost: estimatedTotalCost,
        });
      } else {
        addBudgetItem({
          title: `${venueName} — Hall Rental, F&B Minimum & Catering`,
          category: 'Venue & Catering',
          estimatedCost: estimatedTotalCost,
          actualCost: estimatedTotalCost,
          paidAmount: 0,
          dueDate: eventDate || '2026-10-15',
          paidBy: 'split_50_50',
          status: 'pending',
        });
      }
    }
  };

  const saveContractAndSchedule = (params: {
    targetType: 'venue' | 'budget' | 'vendor';
    targetId: string;
    title: string;
    totalCost: number;
    contractNotes?: string;
    paymentSchedule: PaymentMilestone[];
  }) => {
    const { targetType, targetId, title, totalCost, contractNotes, paymentSchedule } = params;
    const cleanTotal = Math.max(0, Number(totalCost) || 0);

    // Derive paid total, installments list, and next unpaid due date from milestones
    const paidMilestones = paymentSchedule.filter((m) => m.status === 'paid');
    const paidTotal = paidMilestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
    const derivedInstallments: PaymentInstallment[] = paidMilestones.map((m) => ({
      id: `inst-${m.id}`,
      amount: Number(m.amount) || 0,
      date: m.paidDate || m.dueDate || new Date().toISOString().split('T')[0],
      paidBy: m.paidBy || 'split_50_50',
      paymentMethod: m.paymentMethod || 'Bank Wire / ACH',
      referenceNote: m.label,
    }));

    const nextUnpaid = paymentSchedule
      .filter((m) => m.status !== 'paid' && m.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

    const computedStatus: BudgetItem['status'] =
      cleanTotal > 0 && paidTotal >= cleanTotal
        ? 'paid'
        : paidTotal > 0
        ? 'partial'
        : 'pending';

    if (targetType === 'venue') {
      // 1. Update venue record
      setVenues((prev) =>
        prev.map((v) =>
          v.id === targetId
            ? {
                ...v,
                contractAgreedAmount: cleanTotal,
                contractNotes: contractNotes ?? v.contractNotes,
                paymentSchedule,
                installments: derivedInstallments,
                pricing: {
                  ...v.pricing,
                  estimatedTotalCost: cleanTotal,
                },
              }
            : v
        )
      );

      // 2. Sync Venue & Catering budget line item
      setBudgetItems((prev) => {
        const existing = prev.find((b) => b.category === 'Venue & Catering');
        if (existing) {
          return prev.map((b) =>
            b.id === existing.id
              ? {
                  ...b,
                  title: `${title} — Contract & Catering`,
                  estimatedCost: cleanTotal,
                  actualCost: cleanTotal,
                  paidAmount: paidTotal,
                  dueDate: nextUnpaid?.dueDate || b.dueDate,
                  status: computedStatus,
                  notes: contractNotes ?? b.notes,
                  installments: derivedInstallments,
                  paymentSchedule,
                }
              : b
          );
        }
        return [
          ...prev,
          {
            id: `b-${Date.now()}`,
            weddingId: wedding?.id || 'w-current',
            title: `${title} — Contract & Catering`,
            category: 'Venue & Catering',
            estimatedCost: cleanTotal,
            actualCost: cleanTotal,
            paidAmount: paidTotal,
            dueDate: nextUnpaid?.dueDate || wedding?.startDate || '2026-10-15',
            paidBy: 'split_50_50',
            status: computedStatus,
            notes: contractNotes,
            installments: derivedInstallments,
            paymentSchedule,
          },
        ];
      });
    } else if (targetType === 'budget') {
      setBudgetItems((prev) =>
        prev.map((b) =>
          b.id === targetId
            ? {
                ...b,
                estimatedCost: cleanTotal,
                actualCost: cleanTotal,
                paidAmount: paidTotal,
                dueDate: nextUnpaid?.dueDate || b.dueDate,
                status: computedStatus,
                notes: contractNotes ?? b.notes,
                installments: derivedInstallments,
                paymentSchedule,
              }
            : b
        )
      );
    } else if (targetType === 'vendor') {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === targetId
            ? {
                ...v,
                agreedAmount: cleanTotal,
                depositPaid: paidTotal,
                notes: contractNotes ?? v.notes,
                installments: derivedInstallments,
                paymentSchedule,
              }
            : v
        )
      );

      setBudgetItems((prev) =>
        prev.map((b) =>
          b.vendorId === targetId
            ? {
                ...b,
                estimatedCost: cleanTotal,
                actualCost: cleanTotal,
                paidAmount: paidTotal,
                dueDate: nextUnpaid?.dueDate || b.dueDate,
                status: computedStatus,
                installments: derivedInstallments,
                paymentSchedule,
              }
            : b
        )
      );
    }
  };

  const saveTourPlan = (plan: SiteTourDayPlan) => {
    setTourPlan(plan);
  };

  const clearTourPlan = () => {
    setTourPlan(null);
  };

  const setOfficialSangeetVenue = (targetVenue: SangeetVenueOption | null) => {
    setOfficialSangeetVenueState(targetVenue);
    if (!targetVenue) return;

    // 1. Sync with Sangeet / Pre-Wedding Event in itinerary
    const existingSangeetEvent = events.find(
      (e) =>
        e.name.toLowerCase().includes('sangeet') ||
        e.name.toLowerCase().includes('garba') ||
        e.name.toLowerCase().includes('mehndi')
    );

    if (existingSangeetEvent) {
      updateEvent(existingSangeetEvent.id, {
        venueName: targetVenue.name,
        venueAddress: `${targetVenue.address}, ${targetVenue.city}, ${targetVenue.state} ${targetVenue.zipCode}`,
        description: `Pre-wedding dance celebration, performances & live chaat at ${targetVenue.name}.`,
      });
    } else {
      addEvent({
        name: 'Sangeet & Garba Night',
        type: 'sangeet',
        date: wedding?.startDate || '2026-10-23',
        startTime: '18:30',
        endTime: '23:30',
        venueName: targetVenue.name,
        venueAddress: `${targetVenue.address}, ${targetVenue.city}, ${targetVenue.state} ${targetVenue.zipCode}`,
        dressCode: 'Indo-Western or Vibrant Lehengas & Kurtas',
        colorTheme: 'Jewel tones, Fuchsia & Royal Blue',
        bannerGradient: 'from-amber-500 via-rose-500 to-purple-600',
        description: `High-energy Sangeet, dance performances, live chaat & bhangra dhol celebration at ${targetVenue.name}.`,
        coordinatorName: 'Family Sangeet Lead',
        coordinatorPhone: targetVenue.contactPhone || '',
        checklist: [],
      });
    }

    // 2. Sync with Budget: update or add Sangeet Venue & Catering line item
    const existingSangeetBudget = budgetItems.find((b) =>
      b.title.toLowerCase().includes('sangeet')
    );

    if (existingSangeetBudget) {
      updateBudgetItem(existingSangeetBudget.id, {
        title: `${targetVenue.name} — Sangeet Hall Rental & Catering`,
        estimatedCost: targetVenue.estimatedTotalCost,
        actualCost: targetVenue.estimatedTotalCost,
      });
    } else {
      addBudgetItem({
        title: `${targetVenue.name} — Sangeet Hall Rental & Catering`,
        category: 'Venue & Catering',
        estimatedCost: targetVenue.estimatedTotalCost,
        actualCost: targetVenue.estimatedTotalCost,
        paidAmount: 0,
        dueDate: '2026-10-10',
        paidBy: 'split_50_50',
        status: 'pending',
      });
    }
  };

  const resetToDefaultData = () => {
    allowEmptySyncRef.current = true;
    setWedding(null);
    setEvents(initialEvents);
    setGuests(initialGuests);
    setBudgetItems(initialBudgetItems);
    setVendors(initialVendors);
    setShagunRecords(initialShagunRecords);
    setRooms(initialRooms);
    setVenues(initialVenues);
    setTourPlan(initialTourPlan);
    setOfficialSangeetVenueState(null);
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
    setVenues(sampleUsaWeddingTemplate.venues);
    setTourPlan(sampleUsaWeddingTemplate.tourPlan || null);
  };

  const importFullWeddingData = (data: {
    wedding?: Partial<WeddingProfile>;
    events?: WeddingEvent[];
    budgetItems?: BudgetItem[];
    guests?: Guest[];
    vendors?: Vendor[];
    shagunRecords?: ShagunRecord[];
    rooms?: RoomAllocation[];
    venues?: VenueOption[];
    tourPlan?: SiteTourDayPlan;
  }) => {
    if (data.wedding) {
      setWedding((prev) => {
        const merged: WeddingProfile = {
          id: prev?.id || 'w-user-1',
          ownerId: prev?.ownerId || 'owner-1',
          brideName: data.wedding?.brideName || prev?.brideName || 'Bride',
          groomName: data.wedding?.groomName || prev?.groomName || 'Groom',
          slug: data.wedding?.slug || prev?.slug || 'our-wedding',
          tradition: data.wedding?.tradition || prev?.tradition || 'traditional_desi',
          startDate: data.wedding?.startDate !== undefined ? data.wedding.startDate : prev?.startDate || '',
          endDate: data.wedding?.endDate !== undefined ? data.wedding.endDate : prev?.endDate || '',
          city: data.wedding?.city || prev?.city || '',
          venueName: data.wedding?.venueName || prev?.venueName || '',
          currency: 'USD',
          targetBudget: data.wedding?.targetBudget || prev?.targetBudget || 150000,
          story: data.wedding?.story || prev?.story || '',
          hashtag: data.wedding?.hashtag || prev?.hashtag || '',
          isConfigured: true,
          horoscope: data.wedding?.horoscope || prev?.horoscope,
        };
        return merged;
      });
    }

    if (data.events && data.events.length > 0) {
      setEvents(data.events);
    }
    if (data.budgetItems && data.budgetItems.length > 0) {
      setBudgetItems(data.budgetItems);
    }
    if (data.guests && data.guests.length > 0) {
      setGuests(data.guests);
    }
    if (data.vendors && data.vendors.length > 0) {
      setVendors(data.vendors);
    }
    if (data.shagunRecords && data.shagunRecords.length > 0) {
      setShagunRecords(data.shagunRecords);
    }
    if (data.rooms && data.rooms.length > 0) {
      setRooms(data.rooms);
    }
    if (data.venues && data.venues.length > 0) {
      setVenues(data.venues);
    }
    if (data.tourPlan) {
      setTourPlan(data.tourPlan);
    }
  };

  const updateScenarioSelection = useCallback(
    (patch: { selectedVenueId?: string | null; includedVendorIds?: string[] | null }) => {
      setScenarioSelection((prev) => {
        const next = { ...prev, ...patch };
        try {
          if (patch.selectedVenueId !== undefined) {
            localStorage.setItem(
              'shaadi_scenario_selected_venue_id',
              patch.selectedVenueId || '__NONE__'
            );
          }
          if (patch.includedVendorIds !== undefined && patch.includedVendorIds !== null) {
            localStorage.setItem(
              'shaadi_scenario_included_vendors',
              JSON.stringify(patch.includedVendorIds)
            );
          }
        } catch {}
        return next;
      });
    },
    []
  );

  const addCollaborator = useCallback(
    async (
      rawEmail: string,
      role: 'editor' | 'viewer',
      name?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const email = rawEmail.trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (userRole !== 'owner') {
        return { success: false, error: 'Only the main wedding account owner can add collaborators.' };
      }
      const myEmail = (user?.email || '').toLowerCase().trim();
      if (myEmail && email === myEmail) {
        return { success: false, error: 'You are already the owner of this wedding plan.' };
      }
      if (collaborators.some((c) => c.email.toLowerCase() === email)) {
        return { success: false, error: 'This email is already on your collaborators list.' };
      }

      const newCollab: WeddingCollaborator = {
        email,
        name: name?.trim() || undefined,
        role,
        addedAt: new Date().toISOString(),
        addedByEmail: user?.email || undefined,
      };
      const updatedList = [...collaborators, newCollab];
      setCollaborators(updatedList);

      // Immediately persist to Firestore shared wedding doc so invite link works right away
      if (isFirebaseConfigured && db && user) {
        const targetId = activeWeddingDocId || wedding?.id;
        if (targetId) {
          try {
            await setDoc(
              doc(db, 'weddings', targetId),
              {
                collaborators: updatedList,
                collaboratorEmails: updatedList.map((c) => c.email.toLowerCase()),
                ownerUid: ownerUid || user.uid,
                ownerEmail: ownerEmail || myEmail,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (err: any) {
            console.warn('Failed to save collaborator to Firestore:', err);
            return { success: false, error: err?.message || 'Could not save to cloud.' };
          }
        }
      }

      return { success: true };
    },
    [collaborators, userRole, user, activeWeddingDocId, wedding?.id, ownerUid, ownerEmail]
  );

  const updateCollaboratorRole = useCallback(
    async (rawEmail: string, role: 'editor' | 'viewer') => {
      if (userRole !== 'owner') return;
      const email = rawEmail.trim().toLowerCase();
      const updatedList = collaborators.map((c) =>
        c.email.toLowerCase() === email ? { ...c, role } : c
      );
      setCollaborators(updatedList);

      if (isFirebaseConfigured && db && user) {
        const targetId = activeWeddingDocId || wedding?.id;
        if (targetId) {
          await setDoc(
            doc(db, 'weddings', targetId),
            {
              collaborators: updatedList,
              collaboratorEmails: updatedList.map((c) => c.email.toLowerCase()),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        }
      }
    },
    [collaborators, userRole, user, activeWeddingDocId, wedding?.id]
  );

  const removeCollaborator = useCallback(
    async (rawEmail: string) => {
      if (userRole !== 'owner') return;
      const email = rawEmail.trim().toLowerCase();
      const updatedList = collaborators.filter((c) => c.email.toLowerCase() !== email);
      setCollaborators(updatedList);

      if (isFirebaseConfigured && db && user) {
        const targetId = activeWeddingDocId || wedding?.id;
        if (targetId) {
          await setDoc(
            doc(db, 'weddings', targetId),
            {
              collaborators: updatedList,
              collaboratorEmails: updatedList.map((c) => c.email.toLowerCase()),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        }
      }
    },
    [collaborators, userRole, user, activeWeddingDocId, wedding?.id]
  );

  const dismissJoinBanner = useCallback(() => {
    setJoinAccessStatus('idle');
    setPendingJoinWeddingId(null);
    try {
      sessionStorage.removeItem('vivaah_pending_join_wedding_id');
      if (typeof window !== 'undefined' && window.location.search.includes('join=')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('join');
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}
  }, []);

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
        venues,
        tourPlan,
        officialSangeetVenue,
        scenarioSelection,
        updateScenarioSelection,
        isDemoMode: !isFirebaseConfigured,
        isCloudSynced,
        isSyncing,
        lastSyncedAt,
        cloudSyncError,
        forceCloudSync,
        collaborators,
        userRole,
        isReadOnly: userRole === 'viewer',
        ownerEmail,
        activeWeddingDocId: activeWeddingDocId || wedding?.id || null,
        joinAccessStatus,
        pendingJoinWeddingId,
        addCollaborator,
        updateCollaboratorRole,
        removeCollaborator,
        dismissJoinBanner,
        createWeddingProfile,
        updateWeddingProfile,
        initializeGuidedWedding,
        addEvent,
        updateEvent,
        deleteEvent,
        addChecklistItem,
        toggleChecklistItem,
        toggleChecklistSubItem,
        deleteChecklistItem,
        addGuest,
        updateGuest,
        deleteGuest,
        updateGuestRsvp,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addPaymentInstallment,
        deletePaymentInstallment,
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
        addVenue,
        updateVenue,
        deleteVenue,
        setOfficialVenue,
        applyVenueSelection,
        rescheduleEventDate,
        saveContractAndSchedule,
        setOfficialSangeetVenue,
        saveTourPlan,
        clearTourPlan,
        resetToDefaultData,
        loadSampleTemplate,
        importFullWeddingData,
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
