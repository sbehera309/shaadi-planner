'use client';

// Helper utilities for managing Google Maps & Places API key and script loading

const STORAGE_KEY = 'shaadi_planner_google_maps_key';

/**
 * Returns the currently active Google Maps API key from environment or localStorage
 */
export function getGoogleMapsApiKey(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
  }

  // 1. Check Next.js public env var
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  if (envKey && envKey.trim().length > 0 && !envKey.includes('your_api_key')) {
    return envKey.trim();
  }

  // 2. Check localStorage (allows instant user configuration in browser)
  try {
    const localKey = localStorage.getItem(STORAGE_KEY);
    if (localKey && localKey.trim().length > 0) {
      return localKey.trim();
    }
  } catch {
    // Local storage not available
  }

  return '';
}

/**
 * Save Google Maps API key to localStorage and notify all listeners
 */
export function setGoogleMapsApiKey(key: string): void {
  if (typeof window === 'undefined') return;

  const cleanKey = key.trim();
  try {
    if (cleanKey.length > 0) {
      localStorage.setItem(STORAGE_KEY, cleanKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Dispatch custom event so all active components re-mount or reload maps
    window.dispatchEvent(new CustomEvent('google-maps-key-changed', { detail: { apiKey: cleanKey } }));
  } catch {
    // Storage quota or restriction
  }
}

/**
 * Dynamically load Google Maps JavaScript API with Places and Geometry libraries
 */
let scriptLoadingPromise: Promise<boolean> | null = null;

export function loadGoogleMapsScript(apiKey?: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  const keyToUse = apiKey || getGoogleMapsApiKey();
  if (!keyToUse) return Promise.resolve(false);

  // If already loaded and ready
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<boolean>((resolve) => {
    // Check if script element already exists in document
    const existingScript = document.getElementById('google-maps-sdk-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-sdk-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      keyToUse
    )}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn('[GoogleMaps] Failed to load Google Maps SDK script');
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}
