'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './authContext';
import { ProfileSavedAddress } from './types';
import { isFirebaseConfigured, db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

const STORAGE_KEY_PREFIX = 'shaadi_profile_addresses_';

export interface SaveAddressInput {
  id?: string;
  label?: string;
  side?: 'groom' | 'bride' | 'mutual' | 'other';
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export function useProfileAddresses() {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<ProfileSavedAddress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load addresses whenever authenticated user changes
  useEffect(() => {
    if (!user) {
      setSavedAddresses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const storageKey = `${STORAGE_KEY_PREFIX}${user.uid}`;

    // 1. Immediately read from localStorage cache for instant UI rendering
    let cachedList: ProfileSavedAddress[] = [];
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        cachedList = JSON.parse(cached);
        if (Array.isArray(cachedList)) {
          setSavedAddresses(cachedList);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached saved addresses:', e);
    }

    // 2. If Firebase is configured, fetch latest from Firestore and merge
    if (isFirebaseConfigured && db) {
      const addressesRef = collection(db, 'users', user.uid, 'saved_addresses');
      getDocs(addressesRef)
        .then((snapshot) => {
          const remoteList: ProfileSavedAddress[] = [];
          snapshot.forEach((docSnap) => {
            remoteList.push({
              id: docSnap.id,
              ...(docSnap.data() as Omit<ProfileSavedAddress, 'id'>),
            });
          });

          if (remoteList.length > 0) {
            // Sort by most recently used or created
            remoteList.sort((a, b) => {
              const dateA = a.lastUsedAt || a.createdAt || '';
              const dateB = b.lastUsedAt || b.createdAt || '';
              return dateB.localeCompare(dateA);
            });
            setSavedAddresses(remoteList);
            try {
              localStorage.setItem(storageKey, JSON.stringify(remoteList));
            } catch {}
          } else if (cachedList.length > 0) {
            // Push cached addresses to newly connected Firestore
            cachedList.forEach((addr) => {
              const docRef = doc(db!, 'users', user.uid, 'saved_addresses', addr.id);
              setDoc(docRef, addr, { merge: true }).catch(() => {});
            });
          }
        })
        .catch((err) => {
          console.warn('Firestore fetch failed, relying on local profile cache:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  // Save or update an address under the current user's profile
  const saveAddress = useCallback(
    async (input: SaveAddressInput): Promise<ProfileSavedAddress> => {
      if (!user) {
        throw new Error('You must be signed in to save addresses to your profile.');
      }

      const storageKey = `${STORAGE_KEY_PREFIX}${user.uid}`;
      const now = new Date().toISOString();

      // Check if this address is already in the list
      const existing = savedAddresses.find(
        (a) =>
          (input.id && a.id === input.id) ||
          (a.address.trim().toLowerCase() === input.address.trim().toLowerCase() &&
            a.city.trim().toLowerCase() === input.city.trim().toLowerCase())
      );

      const addressId =
        existing?.id ||
        input.id ||
        `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const fallbackLabel = input.side === 'groom'
        ? "Groom's Family Home"
        : input.side === 'bride'
        ? "Bride's Family Home"
        : `${input.city || 'Family'} Home`;

      const newAddress: ProfileSavedAddress = {
        id: addressId,
        userId: user.uid,
        label: input.label?.trim() || existing?.label || fallbackLabel,
        side: input.side || existing?.side || 'mutual',
        address: input.address.trim(),
        city: input.city.trim(),
        state: input.state.trim().toUpperCase(),
        zipCode: input.zipCode?.trim() || existing?.zipCode || '',
        latitude: input.latitude ?? existing?.latitude,
        longitude: input.longitude ?? existing?.longitude,
        createdAt: existing?.createdAt || now,
        lastUsedAt: now,
      };

      const updatedList = [
        newAddress,
        ...savedAddresses.filter((a) => a.id !== addressId),
      ];

      setSavedAddresses(updatedList);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }

      // Sync to Firestore
      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, 'users', user.uid, 'saved_addresses', addressId);
          await setDoc(docRef, newAddress, { merge: true });
        } catch (err) {
          console.warn('Failed to sync address to Firestore:', err);
        }
      }

      return newAddress;
    },
    [user, savedAddresses]
  );

  // Delete an address from the user's profile
  const deleteAddress = useCallback(
    async (id: string): Promise<void> => {
      if (!user) return;
      const storageKey = `${STORAGE_KEY_PREFIX}${user.uid}`;
      const updatedList = savedAddresses.filter((a) => a.id !== id);
      setSavedAddresses(updatedList);

      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch {}

      if (isFirebaseConfigured && db) {
        try {
          const docRef = doc(db, 'users', user.uid, 'saved_addresses', id);
          await deleteDoc(docRef);
        } catch (err) {
          console.warn('Failed to delete address from Firestore:', err);
        }
      }
    },
    [user, savedAddresses]
  );

  // Update label or side of an existing address
  const updateAddressDetails = useCallback(
    async (id: string, updates: Partial<Pick<ProfileSavedAddress, 'label' | 'side'>>): Promise<void> => {
      if (!user) return;
      const target = savedAddresses.find((a) => a.id === id);
      if (!target) return;

      const updated: ProfileSavedAddress = {
        ...target,
        ...updates,
      };

      const updatedList = savedAddresses.map((a) => (a.id === id ? updated : a));
      setSavedAddresses(updatedList);

      const storageKey = `${STORAGE_KEY_PREFIX}${user.uid}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch {}

      if (isFirebaseConfigured && db) {
        const docRef = doc(db, 'users', user.uid, 'saved_addresses', id);
        setDoc(docRef, updates, { merge: true }).catch(() => {});
      }
    },
    [user, savedAddresses]
  );

  // Mark address as used to bring it to the top of recents
  const markAddressUsed = useCallback(
    async (id: string): Promise<void> => {
      if (!user) return;
      const target = savedAddresses.find((a) => a.id === id);
      if (!target) return;

      const now = new Date().toISOString();
      const updated: ProfileSavedAddress = { ...target, lastUsedAt: now };
      const updatedList = [updated, ...savedAddresses.filter((a) => a.id !== id)];

      setSavedAddresses(updatedList);
      const storageKey = `${STORAGE_KEY_PREFIX}${user.uid}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch {}

      if (isFirebaseConfigured && db) {
        const docRef = doc(db, 'users', user.uid, 'saved_addresses', id);
        setDoc(docRef, { lastUsedAt: now }, { merge: true }).catch(() => {});
      }
    },
    [user, savedAddresses]
  );

  // Check if an address is already saved
  const isAddressSaved = useCallback(
    (address: string, city: string): boolean => {
      if (!address || !city) return false;
      const normAddr = address.trim().toLowerCase();
      const normCity = city.trim().toLowerCase();
      return savedAddresses.some(
        (a) =>
          a.address.trim().toLowerCase() === normAddr &&
          a.city.trim().toLowerCase() === normCity
      );
    },
    [savedAddresses]
  );

  return {
    savedAddresses,
    loading,
    isLoggedIn: Boolean(user),
    user,
    saveAddress,
    deleteAddress,
    updateAddressDetails,
    markAddressUsed,
    isAddressSaved,
  };
}
