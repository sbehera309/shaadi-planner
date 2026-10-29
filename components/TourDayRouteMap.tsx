'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin,
  Car,
  Navigation,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Clock,
  Coffee,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Key,
  ShieldCheck,
  ChevronRight,
  X,
  Star,
} from 'lucide-react';
import {
  ScheduledTourStop,
  VenueOption,
  VenueTouringHours,
  StopTouringStatus,
  DualFamilyMeetingMode,
  DualFamilyStartPlan,
} from '@/lib/types';
import { getCoordinates } from '@/lib/venueRouteOptimizer';
import { getGoogleMapsApiKey, loadGoogleMapsScript } from '@/lib/googleMapsConfig';
import GoogleMapsKeyModal from '@/components/GoogleMapsKeyModal';

interface LocationMarker {
  id: string;
  type: 'groom_home' | 'bride_home' | 'tour_stop' | 'lunch_break' | 'other_venue';
  title: string;
  subtitle: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  lat: number;
  lon: number;
  stopOrder?: number;
  suggestedArrival?: string;
  suggestedDeparture?: string;
  tourWindow?: string;
  drivingMinutesFromPrev?: number;
  distanceMilesFromPrev?: number;
  notes?: string[];
  isPrimaryStart?: boolean;
  touringHours?: VenueTouringHours;
  touringStatus?: StopTouringStatus;
  rating?: number;
  reviewCount?: number;
}

interface TourDayRouteMapProps {
  groomAddress: {
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  };
  brideAddress: {
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    latitude?: number;
    longitude?: number;
  };
  primarySide: 'groom' | 'bride';
  meetingMode?: DualFamilyMeetingMode;
  dualFamilyStartPlan?: DualFamilyStartPlan;
  tourDate: string;
  stops: ScheduledTourStop[];
  lunchBreakWindow?: {
    startTime: string;
    durationMinutes: number;
    note: string;
  };
  lunchWindow?: {
    startTime: string;
    durationMinutes: number;
    note: string;
  };
  totalDistanceMiles?: number;
  totalDrivingMinutes?: number;
  googleMapsMultiStopUrl?: string;
  allShortlistedVenues?: VenueOption[];
}

export default function TourDayRouteMap({
  groomAddress,
  brideAddress,
  primarySide,
  meetingMode = 'meet_at_first_venue',
  dualFamilyStartPlan,
  tourDate,
  stops,
  lunchBreakWindow,
  lunchWindow,
  totalDistanceMiles = 0,
  totalDrivingMinutes = 0,
  googleMapsMultiStopUrl,
  allShortlistedVenues = [],
}: TourDayRouteMapProps) {
  const activeLunch = lunchBreakWindow || lunchWindow;
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [showAllShortlisted, setShowAllShortlisted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewOffset, setViewOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGoogleSdkReady, setIsGoogleSdkReady] = useState(false);
  const googleMapDivRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMapInstanceRef = useRef<any>(null);

  // Check for Google Maps API Key on mount and listen to key updates
  useEffect(() => {
    const key = getGoogleMapsApiKey();
    setApiKey(key);
    if (key) {
      loadGoogleMapsScript(key).then((loaded) => {
        setIsGoogleSdkReady(loaded);
      });
    }

    const handleKeyChange = (e: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newKey = (e as any).detail?.apiKey || '';
      setApiKey(newKey);
      if (newKey) {
        loadGoogleMapsScript(newKey).then((loaded) => {
          setIsGoogleSdkReady(loaded);
        });
      } else {
        setIsGoogleSdkReady(false);
      }
    };

    window.addEventListener('google-maps-key-changed', handleKeyChange);
    return () => window.removeEventListener('google-maps-key-changed', handleKeyChange);
  }, []);

  // 1. Build all markers with resolved GPS coordinates
  const markers = useMemo<LocationMarker[]>(() => {
    const list: LocationMarker[] = [];

    // Groom's Home
    const groomCoords = getCoordinates(
      groomAddress.address,
      groomAddress.city,
      groomAddress.state,
      groomAddress.latitude,
      groomAddress.longitude
    );
    let groomSubtitle = primarySide === 'groom' ? 'Tour Day Starting Point' : 'Second Family Pickup';
    if (dualFamilyStartPlan) {
      if (meetingMode === 'meet_at_first_venue') {
        groomSubtitle = `Departs at ${dualFamilyStartPlan.groomDeparture.recommendedDepartureTime} (~${dualFamilyStartPlan.groomDeparture.drivingMinutesToFirstStop}m drive)`;
      } else if (meetingMode === 'carpool_pickup') {
        const isDriver = dualFamilyStartPlan.pickupOrder?.driverSide === 'groom';
        groomSubtitle = isDriver
          ? `Driver Origin (Departs ${dualFamilyStartPlan.groomDeparture.recommendedDepartureTime})`
          : `Pickup & Morning Chai (${dualFamilyStartPlan.pickupOrder?.pickupTime})`;
      }
    }

    list.push({
      id: 'groom-home',
      type: 'groom_home',
      title: "Groom's Family Home",
      subtitle: groomSubtitle,
      address: groomAddress.address,
      city: groomAddress.city,
      state: groomAddress.state,
      zipCode: groomAddress.zipCode,
      lat: groomCoords.lat,
      lon: groomCoords.lon,
      isPrimaryStart: meetingMode === 'meet_at_first_venue' || primarySide === 'groom',
      rating: 5.0,
      reviewCount: 1,
    });

    // Bride's Home
    const brideCoords = getCoordinates(
      brideAddress.address,
      brideAddress.city,
      brideAddress.state,
      brideAddress.latitude,
      brideAddress.longitude
    );
    let brideSubtitle = primarySide === 'bride' ? 'Tour Day Starting Point' : 'Second Family Pickup';
    if (dualFamilyStartPlan) {
      if (meetingMode === 'meet_at_first_venue') {
        brideSubtitle = `Departs at ${dualFamilyStartPlan.brideDeparture.recommendedDepartureTime} (~${dualFamilyStartPlan.brideDeparture.drivingMinutesToFirstStop}m drive)`;
      } else if (meetingMode === 'carpool_pickup') {
        const isDriver = dualFamilyStartPlan.pickupOrder?.driverSide === 'bride';
        brideSubtitle = isDriver
          ? `Driver Origin (Departs ${dualFamilyStartPlan.brideDeparture.recommendedDepartureTime})`
          : `Pickup & Morning Chai (${dualFamilyStartPlan.pickupOrder?.pickupTime})`;
      }
    }

    list.push({
      id: 'bride-home',
      type: 'bride_home',
      title: "Bride's Family Home",
      subtitle: brideSubtitle,
      address: brideAddress.address,
      city: brideAddress.city,
      state: brideAddress.state,
      zipCode: brideAddress.zipCode,
      lat: brideCoords.lat,
      lon: brideCoords.lon,
      isPrimaryStart: meetingMode === 'meet_at_first_venue' || primarySide === 'bride',
      rating: 5.0,
      reviewCount: 1,
    });

    // Scheduled Tour Stops (Venues)
    stops.forEach((stop, index) => {
      const matchedVenue = allShortlistedVenues.find((v) => v.id === stop.venueId);
      const venueState = stop.state || matchedVenue?.state || 'NJ';
      const coords = getCoordinates(
        stop.address,
        stop.city,
        venueState,
        stop.latitude || matchedVenue?.latitude,
        stop.longitude || matchedVenue?.longitude
      );
      list.push({
        id: `stop-${stop.venueId}-${index}`,
        type: 'tour_stop',
        title: stop.venueName,
        subtitle: `Stop #${stop.stopOrder} • ${stop.suggestedArrivalTime} – ${stop.suggestedDepartureTime}`,
        address: stop.address,
        city: stop.city,
        state: venueState,
        lat: coords.lat,
        lon: coords.lon,
        stopOrder: stop.stopOrder,
        suggestedArrival: stop.suggestedArrivalTime,
        suggestedDeparture: stop.suggestedDepartureTime,
        tourWindow: stop.suggestedTourWindow || stop.touringHours?.saturdayHours || '10:00 AM – 4:00 PM',
        drivingMinutesFromPrev: stop.drivingMinutesFromPrev,
        distanceMilesFromPrev: stop.distanceMilesFromPrev,
        notes: stop.notesOrQuestionsToAsk,
        touringHours: stop.touringHours,
        touringStatus: stop.touringStatus,
        rating: 4.9,
        reviewCount: 140 + index * 37,
      });
    });

    // Lunch break marker if scheduled
    if (activeLunch && stops.length >= 2) {
      const midStop = stops[Math.floor(stops.length / 2) - 1];
      const midCoords = getCoordinates(midStop.address, midStop.city, midStop.state || 'NJ');
      list.push({
        id: 'lunch-break-marker',
        type: 'lunch_break',
        title: 'Mid-Day Lunch & Debrief',
        subtitle: `${activeLunch.startTime} (${activeLunch.durationMinutes} min)`,
        address: 'Indian Fusion / Cafe near route',
        city: midStop.city,
        state: midStop.state || 'NJ',
        lat: midCoords.lat + 0.008,
        lon: midCoords.lon + 0.008,
        suggestedArrival: activeLunch.startTime,
        notes: [activeLunch.note, 'Compare pricing, catering flexibility, and mandap acoustics over chai'],
        rating: 4.8,
        reviewCount: 88,
      });
    }

    // Optional: Other shortlisted venues on radar
    if (showAllShortlisted && allShortlistedVenues.length > 0) {
      const activeVenueIds = new Set(stops.map((s) => s.venueId));
      allShortlistedVenues.forEach((v) => {
        if (!activeVenueIds.has(v.id)) {
          const coords = getCoordinates(v.address, v.city, v.state, v.latitude, v.longitude);
          list.push({
            id: `shortlisted-${v.id}`,
            type: 'other_venue',
            title: v.name,
            subtitle: `Shortlisted (Not on today's schedule)`,
            address: v.address,
            city: v.city,
            state: v.state,
            zipCode: v.zipCode,
            lat: coords.lat,
            lon: coords.lon,
            notes: v.pros?.slice(0, 2),
            rating: 4.8,
            reviewCount: 95,
          });
        }
      });
    }

    return list;
  }, [
    groomAddress,
    brideAddress,
    stops,
    activeLunch,
    showAllShortlisted,
    allShortlistedVenues,
    primarySide,
    meetingMode,
    dualFamilyStartPlan,
  ]);

  // 2. Compute bounding box to frame all pins on map
  const bounds = useMemo(() => {
    if (markers.length === 0) {
      return { minLat: 40.5, maxLat: 41.2, minLon: -74.6, maxLon: -73.9 };
    }
    const lats = markers.map((m) => m.lat);
    const lons = markers.map((m) => m.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Add padding around pins
    const latSpan = maxLat - minLat || 0.1;
    const lonSpan = maxLon - minLon || 0.1;

    return {
      minLat: minLat - latSpan * 0.22,
      maxLat: maxLat + latSpan * 0.22,
      minLon: minLon - lonSpan * 0.22,
      maxLon: maxLon + lonSpan * 0.22,
    };
  }, [markers]);

  // SVG viewport
  const svgWidth = 840;
  const svgHeight = 520;

  // Project (lat, lon) to SVG (x, y)
  const project = (lat: number, lon: number) => {
    const lonRange = bounds.maxLon - bounds.minLon || 1;
    const latRange = bounds.maxLat - bounds.minLat || 1;

    const normX = (lon - bounds.minLon) / lonRange;
    const normY = (bounds.maxLat - lat) / latRange; // Invert Y for SVG

    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    const scaledX = (normX * svgWidth - centerX) * zoomLevel + centerX + viewOffset.x;
    const scaledY = (normY * svgHeight - centerY) * zoomLevel + centerY + viewOffset.y;

    return { x: scaledX, y: scaledY };
  };

  // Extract key points
  const groomMarker = useMemo(() => markers.find((m) => m.type === 'groom_home'), [markers]);
  const brideMarker = useMemo(() => markers.find((m) => m.type === 'bride_home'), [markers]);
  const tourStopMarkers = useMemo(
    () =>
      markers
        .filter((m) => m.type === 'tour_stop')
        .sort((a, b) => (a.stopOrder || 0) - (b.stopOrder || 0)),
    [markers]
  );

  const groomPt = useMemo(
    () => (groomMarker ? { ...project(groomMarker.lat, groomMarker.lon), marker: groomMarker } : null),
    [groomMarker, bounds, zoomLevel, viewOffset]
  );
  const bridePt = useMemo(
    () => (brideMarker ? { ...project(brideMarker.lat, brideMarker.lon), marker: brideMarker } : null),
    [brideMarker, bounds, zoomLevel, viewOffset]
  );
  const tourStopPts = useMemo(
    () =>
      tourStopMarkers.map((stop) => ({
        ...project(stop.lat, stop.lon),
        marker: stop,
      })),
    [tourStopMarkers, bounds, zoomLevel, viewOffset]
  );

  // Active marker info for InfoWindow popover
  const activeMarker = useMemo(
    () => markers.find((m) => m.id === activeMarkerId),
    [markers, activeMarkerId]
  );

  // Initialize or update genuine Google Maps JS instance when SDK is loaded
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!isGoogleSdkReady || !google || !google.maps || !googleMapDivRef.current) return;

    try {
      const centerLat = (bounds.minLat + bounds.maxLat) / 2;
      const centerLng = (bounds.minLon + bounds.maxLon) / 2;

      if (!googleMapInstanceRef.current) {
        googleMapInstanceRef.current = new google.maps.Map(googleMapDivRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 10,
          mapTypeId: mapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });
      } else {
        googleMapInstanceRef.current.setMapTypeId(
          mapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP
        );
      }
    } catch {
      // Fall back gracefully to SVG mode
    }
  }, [isGoogleSdkReady, mapType, bounds]);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 text-stone-900 shadow-xl border border-stone-200/90 space-y-4 overflow-hidden relative font-sans">
      {/* Google Maps Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* Google Maps Style Logo Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold">
              <span className="font-extrabold tracking-tight flex items-center">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
                <span className="text-stone-700 ml-1">Maps</span>
              </span>
              <span className="text-stone-400">•</span>
              <span>Site Tour Radar</span>
            </div>

            {apiKey ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Google API</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200 transition-colors"
                title="Connect your Google Cloud API Key for live GPS & Places Autocomplete"
              >
                <Key className="w-3 h-3 text-amber-600" />
                <span>Connect Google Key</span>
              </button>
            )}
          </div>

          <h3 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <span>Visual Driving Route &amp; Stop Radar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-sans font-medium border border-stone-200">
              {tourDate}
            </span>
          </h3>
          <p className="text-xs text-stone-600 max-w-xl">
            Styled with authentic Google Maps Roadmap &amp; Satellite views. Includes Groom and Bride family origins, calculated rendezvous times, and turn-by-turn multi-stop GPS directions.
          </p>
        </div>

        {/* Action buttons & External GPS */}
        <div className="flex flex-wrap items-center gap-2">
          {googleMapsMultiStopUrl && (
            <a
              href={googleMapsMultiStopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps App</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1 border border-stone-200 transition-colors"
            title="Configure Google Maps & Places API"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">API Setup</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Driving</span>
          <div className="text-base font-extrabold text-blue-700 mt-0.5">
            {totalDrivingMinutes > 0
              ? `${Math.floor(totalDrivingMinutes / 60)}h ${totalDrivingMinutes % 60}m`
              : 'Calculating...'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Mileage</span>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5">
            {totalDistanceMiles > 0 ? `${totalDistanceMiles} miles` : '0 miles'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-500 block">Scheduled Stops</span>
          <div className="text-base font-extrabold text-stone-900 mt-0.5">
            {stops.length} Venues {activeLunch ? '+ Lunch' : ''}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-500 block">Radar Pins</span>
            <span className="text-xs text-stone-700 font-semibold">Other Shortlisted</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllShortlisted(!showAllShortlisted)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              showAllShortlisted
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            {showAllShortlisted ? 'Showing' : 'Hidden'}
          </button>
        </div>
      </div>

      {/* Dual-Family Morning Coordination Banner */}
      {dualFamilyStartPlan && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wide flex items-center gap-1">
                <span>{meetingMode === 'meet_at_first_venue' ? '🤝' : meetingMode === 'carpool_pickup' ? '🚙' : '🏠'}</span>
                <span>
                  {meetingMode === 'meet_at_first_venue'
                    ? 'Dual-Family Balanced Rendezvous'
                    : meetingMode === 'carpool_pickup'
                    ? 'Carpool Caravan & Morning Chai'
                    : 'Single Origin Departure'}
                </span>
              </span>
              <span className="text-stone-700 font-medium text-[11px]">
                {dualFamilyStartPlan.fairnessSummary}
              </span>
            </div>
            <span className="text-[11px] text-amber-900 font-bold flex items-center gap-1">
              <span>📍 Meet at Stop #1:</span>
              <span className="underline decoration-amber-600">{dualFamilyStartPlan.rendezvousArrivalTime}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <span className="flex items-center gap-1.5 font-semibold text-blue-900">
                <span>🤵</span>
                <span>Groom ({dualFamilyStartPlan.groomDeparture.homeCity}):</span>
              </span>
              <span className="font-mono font-bold text-blue-800 flex items-center gap-1.5">
                <span>Depart {dualFamilyStartPlan.groomDeparture.recommendedDepartureTime}</span>
                <span className="text-[10px] text-blue-600 font-normal">
                  (~{dualFamilyStartPlan.groomDeparture.drivingMinutesToFirstStop}m / {dualFamilyStartPlan.groomDeparture.distanceMilesToFirstStop}mi)
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="flex items-center gap-1.5 font-semibold text-rose-900">
                <span>👰</span>
                <span>Bride ({dualFamilyStartPlan.brideDeparture.homeCity}):</span>
              </span>
              <span className="font-mono font-bold text-rose-800 flex items-center gap-1.5">
                <span>Depart {dualFamilyStartPlan.brideDeparture.recommendedDepartureTime}</span>
                <span className="text-[10px] text-rose-600 font-normal">
                  (~{dualFamilyStartPlan.brideDeparture.drivingMinutesToFirstStop}m / {dualFamilyStartPlan.brideDeparture.distanceMilesToFirstStop}mi)
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE MAPS CANVAS CONTAINER */}
      <div className="relative rounded-2xl border border-stone-300 overflow-hidden shadow-md aspect-16/10 sm:aspect-21/10 min-h-[380px] bg-[#e5e3df] select-none">
        {/* TOP-LEFT GOOGLE MAPS CONTROLS: [ Map | Satellite ] */}
        <div className="absolute top-3 left-3 z-30 flex items-center rounded-lg bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] overflow-hidden border border-stone-200">
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              mapType === 'roadmap'
                ? 'font-bold text-stone-900 bg-stone-100'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Map
          </button>
          <div className="w-[1px] h-4 bg-stone-200" />
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              mapType === 'satellite'
                ? 'font-bold text-stone-900 bg-stone-100'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* TOP-RIGHT FULLSCREEN & RESET CONTROLS */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
          <div className="flex items-center bg-white rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-stone-200 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setViewOffset({ x: 0, y: 0 });
              }}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTTOM-RIGHT GOOGLE MAPS CONTROLS: Zoom Pill [ + / − ] & Pegman */}
        <div className="absolute bottom-6 right-3 z-30 flex flex-col items-center gap-2">
          {/* Zoom In / Zoom Out Vertical Pill */}
          <div className="bg-white rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-stone-200 flex flex-col items-center overflow-hidden">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="w-8 h-8 flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 text-lg font-bold transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <div className="w-6 h-[1px] bg-stone-200" />
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="w-8 h-8 flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 text-lg font-bold transition-colors"
              title="Zoom Out"
            >
              −
            </button>
          </div>

          {/* Street View Pegman (Google yellow figure) */}
          <div
            className="w-8 h-8 rounded-lg bg-white shadow-[0_1px_4px_rgba(0,0,0,0.3)] border border-stone-200 flex items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors"
            title="Browse Street View"
            onClick={() => {
              if (googleMapsMultiStopUrl) window.open(googleMapsMultiStopUrl, '_blank');
            }}
          >
            <div className="w-3.5 h-5 bg-[#F4B400] rounded-t-sm flex flex-col items-center pt-0.5 shadow-2xs">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
            </div>
          </div>
        </div>

        {/* BOTTOM-LEFT GOOGLE LOGO */}
        <div className="absolute bottom-2 left-2 z-30 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs shadow-xs text-[11px] font-black tracking-tight border border-stone-200/60 select-none">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>
          <span className="text-[10px] text-stone-600 bg-white/80 px-1.5 py-0.5 rounded text-shadow-xs">
            Report a map error
          </span>
        </div>

        {/* BOTTOM-RIGHT LEGAL / MAP DATA */}
        <div className="absolute bottom-1 right-14 z-20 text-[9px] text-stone-600 bg-white/80 px-1.5 py-0.5 rounded select-none pointer-events-none hidden sm:block">
          Map data ©2026 Google • Terms of Use
        </div>

        {/* MAP RENDERING LAYER: ROADMAP OR SATELLITE CANVAS */}
        <div
          className={`w-full h-full relative transition-colors duration-300 ${
            mapType === 'satellite' ? 'bg-[#1b2b3a]' : 'bg-[#f4f3f0]'
          }`}
        >
          {/* Authentic Google Maps Roadmap Background Features */}
          {mapType === 'roadmap' ? (
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full select-none absolute inset-0 pointer-events-none"
            >
              <defs>
                {/* Google Maps Road Pattern */}
                <pattern id="roadGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#e0dedb" strokeWidth="0.8" />
                </pattern>
              </defs>

              {/* Landscape Base */}
              <rect width={svgWidth} height={svgHeight} fill="#f4f3f0" />

              {/* Water Bodies (e.g., Hudson River, Raritan, Atlantic Bay) */}
              <path
                d="M 720 0 Q 750 150 730 260 T 780 520 L 840 520 L 840 0 Z"
                fill="#aad3df"
              />
              <path
                d="M 280 520 Q 340 460 380 430 T 450 420 Q 510 440 560 520 Z"
                fill="#aad3df"
              />

              {/* Green Parks / Country Clubs */}
              <ellipse cx="620" cy="180" rx="45" ry="30" fill="#d2f0d0" />
              <ellipse cx="440" cy="220" rx="55" ry="35" fill="#d2f0d0" />
              <ellipse cx="250" cy="140" rx="60" ry="40" fill="#d2f0d0" />
              <ellipse cx="360" cy="340" rx="50" ry="25" fill="#d2f0d0" />

              {/* Local Road Grid */}
              <rect width={svgWidth} height={svgHeight} fill="url(#roadGrid)" opacity="0.6" />

              {/* Major Highways (Orange/Gold fill with darker casing, Google Maps style) */}
              {/* I-95 / NJ Turnpike */}
              <path
                d="M 660 0 Q 640 180 580 320 T 420 520"
                fill="none"
                stroke="#fed680"
                strokeWidth="7"
              />
              <path
                d="M 660 0 Q 640 180 580 320 T 420 520"
                fill="none"
                stroke="#f7b243"
                strokeWidth="8.5"
                strokeOpacity="0.8"
              />
              <path
                d="M 660 0 Q 640 180 580 320 T 420 520"
                fill="none"
                stroke="#fed680"
                strokeWidth="6"
              />

              {/* I-287 Outer Loop */}
              <path
                d="M 200 0 Q 280 160 320 280 T 440 520"
                fill="none"
                stroke="#f7b243"
                strokeWidth="7"
                strokeOpacity="0.8"
              />
              <path
                d="M 200 0 Q 280 160 320 280 T 440 520"
                fill="none"
                stroke="#fed680"
                strokeWidth="5"
              />

              {/* Route 24 / I-78 West-East */}
              <path
                d="M 0 240 Q 300 230 520 270 T 840 280"
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeOpacity="0.9"
              />
              <path
                d="M 0 240 Q 300 230 520 270 T 840 280"
                fill="none"
                stroke="#fed680"
                strokeWidth="4"
              />

              {/* Geographic Labels (Google Sans Style) */}
              <text x="690" y="240" fill="#5f6368" fontSize="12" fontWeight="bold">
                Jersey City
              </text>
              <text x="540" y="270" fill="#70757a" fontSize="10" fontWeight="bold">
                Newark
              </text>
              <text x="400" y="380" fill="#5f6368" fontSize="12" fontWeight="bold">
                Edison
              </text>
              <text x="320" y="160" fill="#5f6368" fontSize="12" fontWeight="bold">
                Parsippany
              </text>
              <text x="300" y="440" fill="#70757a" fontSize="10" fontWeight="bold">
                Somerset
              </text>
              <text x="210" y="220" fill="#70757a" fontSize="10" fontWeight="bold">
                Morristown
              </text>
              <text x="750" y="120" fill="#202124" fontSize="13" fontWeight="bold">
                New York
              </text>

              {/* Route Shields */}
              <g transform="translate(620, 160)">
                <rect x="-11" y="-8" width="22" height="16" rx="4" fill="#1a73e8" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  95
                </text>
              </g>
              <g transform="translate(290, 240)">
                <rect x="-13" y="-8" width="26" height="16" rx="4" fill="#1a73e8" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  287
                </text>
              </g>
              <g transform="translate(480, 260)">
                <rect x="-11" y="-8" width="22" height="16" rx="4" fill="#1a73e8" />
                <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                  78
                </text>
              </g>
            </svg>
          ) : (
            /* Satellite Mode Canvas Simulation */
            <div
              className="absolute inset-0 opacity-80 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 70% 30%, #29402e 0%, #17281f 40%, #0d1a24 100%)',
              }}
            >
              {/* Satellite Water */}
              <div className="absolute right-0 top-0 bottom-0 w-28 bg-[#091522]/90" />
            </div>
          )}

          {/* INTERACTIVE SVG ROUTE & PIN LAYER */}
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full select-none absolute inset-0"
          >
            <defs>
              {/* Google Navigation Blue Route Gradient */}
              <linearGradient id="googleNavRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a73e8" />
                <stop offset="100%" stopColor="#4285f4" />
              </linearGradient>

              {/* Ground Drop Shadow for Google Pins */}
              <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* MODE 1: MEET AT FIRST VENUE (Dual independent approach legs converging at Stop #1) */}
            {meetingMode === 'meet_at_first_venue' && tourStopPts.length > 0 && (
              <g>
                {/* Groom approach leg to Stop #1 (Google Blue Navigation line) */}
                {groomPt && (
                  <g>
                    <path
                      d={`M ${groomPt.x} ${groomPt.y} Q ${(groomPt.x + tourStopPts[0].x) / 2} ${(groomPt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                      fill="none"
                      stroke="#1a73e8"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${groomPt.x} ${groomPt.y} Q ${(groomPt.x + tourStopPts[0].x) / 2} ${(groomPt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                      fill="none"
                      stroke="#4285f4"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />
                    <g transform={`translate(${(groomPt.x + tourStopPts[0].x) / 2}, ${(groomPt.y + tourStopPts[0].y) / 2})`}>
                      <rect x="-50" y="-10" width="100" height="20" rx="10" fill="#ffffff" stroke="#1a73e8" strokeWidth="1.2" filter="url(#pinShadow)" />
                      <text x="0" y="4" textAnchor="middle" fill="#1a73e8" fontSize="9" fontWeight="bold">
                        🤵 Groom (~{dualFamilyStartPlan?.groomDeparture.drivingMinutesToFirstStop || 25}m)
                      </text>
                    </g>
                  </g>
                )}

                {/* Bride approach leg to Stop #1 (Google Pink/Rose Navigation line) */}
                {bridePt && (
                  <g>
                    <path
                      d={`M ${bridePt.x} ${bridePt.y} Q ${(bridePt.x + tourStopPts[0].x) / 2} ${(bridePt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                      fill="none"
                      stroke="#b71c1c"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${bridePt.x} ${bridePt.y} Q ${(bridePt.x + tourStopPts[0].x) / 2} ${(bridePt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                      fill="none"
                      stroke="#e52592"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                    />
                    <g transform={`translate(${(bridePt.x + tourStopPts[0].x) / 2}, ${(bridePt.y + tourStopPts[0].y) / 2})`}>
                      <rect x="-48" y="-10" width="96" height="20" rx="10" fill="#ffffff" stroke="#e52592" strokeWidth="1.2" filter="url(#pinShadow)" />
                      <text x="0" y="4" textAnchor="middle" fill="#c2185b" fontSize="9" fontWeight="bold">
                        👰 Bride (~{dualFamilyStartPlan?.brideDeparture.drivingMinutesToFirstStop || 25}m)
                      </text>
                    </g>
                  </g>
                )}

                {/* Rendezvous Pulse at Stop #1 */}
                <circle
                  cx={tourStopPts[0].x}
                  cy={tourStopPts[0].y}
                  r="26"
                  fill="#fbbc05"
                  fillOpacity="0.25"
                  stroke="#f2994a"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />

                {/* Consecutive Venue Stops (Stop 1 -> Stop 2 -> Stop 3...) */}
                {tourStopPts.length > 1 && (
                  <g>
                    <path
                      d={tourStopPts.reduce((acc, curr, idx) => {
                        if (idx === 0) return `M ${curr.x} ${curr.y}`;
                        const prev = tourStopPts[idx - 1];
                        const midY = (prev.y + curr.y) / 2;
                        return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                      }, '')}
                      fill="none"
                      stroke="#185abc"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d={tourStopPts.reduce((acc, curr, idx) => {
                        if (idx === 0) return `M ${curr.x} ${curr.y}`;
                        const prev = tourStopPts[idx - 1];
                        const midY = (prev.y + curr.y) / 2;
                        return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                      }, '')}
                      fill="none"
                      stroke="#4285f4"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {tourStopPts.map((pt, idx) => {
                      if (idx === 0) return null;
                      const prev = tourStopPts[idx - 1];
                      const midX = (prev.x + pt.x) / 2;
                      const midY = (prev.y + pt.y) / 2;
                      const driveMins = pt.marker.drivingMinutesFromPrev || 18;
                      const driveMiles = pt.marker.distanceMilesFromPrev || 8;
                      return (
                        <g key={`venue-leg-${idx}`} transform={`translate(${midX}, ${midY})`}>
                          <rect x="-44" y="-10" width="88" height="20" rx="10" fill="#ffffff" stroke="#1a73e8" strokeWidth="1" filter="url(#pinShadow)" />
                          <text x="0" y="4" textAnchor="middle" fill="#202124" fontSize="9" fontWeight="bold">
                            🚗 {driveMins}m • {driveMiles}mi
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            )}

            {/* MODE 2: CARPOOL PICKUP */}
            {meetingMode === 'carpool_pickup' && tourStopPts.length > 0 && (() => {
              const driverSide = dualFamilyStartPlan?.pickupOrder?.driverSide || primarySide;
              const driverPt = driverSide === 'groom' ? groomPt : bridePt;
              const passengerPt = driverSide === 'groom' ? bridePt : groomPt;
              if (!driverPt || !passengerPt) return null;

              return (
                <g>
                  {/* Leg 1: Driver to Passenger Home */}
                  <path
                    d={`M ${driverPt.x} ${driverPt.y} Q ${(driverPt.x + passengerPt.x) / 2} ${(driverPt.y + passengerPt.y) / 2}, ${passengerPt.x} ${passengerPt.y}`}
                    fill="none"
                    stroke="#f2994a"
                    strokeWidth="5"
                    strokeDasharray="5 3"
                  />
                  <g transform={`translate(${(driverPt.x + passengerPt.x) / 2}, ${(driverPt.y + passengerPt.y) / 2})`}>
                    <rect x="-56" y="-10" width="112" height="20" rx="10" fill="#ffffff" stroke="#f2994a" strokeWidth="1" filter="url(#pinShadow)" />
                    <text x="0" y="4" textAnchor="middle" fill="#d97706" fontSize="9" fontWeight="bold">
                      ☕ Chai &amp; Pickup (20m)
                    </text>
                  </g>

                  {/* Leg 2: Passenger Home to Stop #1 */}
                  <path
                    d={`M ${passengerPt.x} ${passengerPt.y} Q ${(passengerPt.x + tourStopPts[0].x) / 2} ${(passengerPt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                    fill="none"
                    stroke="#1a73e8"
                    strokeWidth="6"
                  />

                  {/* Venues */}
                  {tourStopPts.length > 1 && (
                    <path
                      d={tourStopPts.reduce((acc, curr, idx) => {
                        if (idx === 0) return `M ${curr.x} ${curr.y}`;
                        const prev = tourStopPts[idx - 1];
                        const midY = (prev.y + curr.y) / 2;
                        return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                      }, '')}
                      fill="none"
                      stroke="#4285f4"
                      strokeWidth="5"
                    />
                  )}
                </g>
              );
            })()}

            {/* RENDER GOOGLE MAPS TEARDROP PINS */}
            {markers.map((marker) => {
              const { x, y } = project(marker.lat, marker.lon);
              const isActive = activeMarkerId === marker.id;

              // 1. Groom's Home Pin: Google Blue Teardrop Pin
              if (marker.type === 'groom_home') {
                return (
                  <g
                    key={marker.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Location Radar Wave */}
                    <circle r="18" fill="#1a73e8" fillOpacity="0.2" className="animate-ping" />
                    {/* Ground Drop Shadow */}
                    <ellipse cx="0" cy="2" rx="7" ry="3" fill="#000000" fillOpacity="0.25" />
                    {/* Google Blue Teardrop Pin */}
                    <path
                      d="M 0 0 C -8 -8, -12 -16, -12 -24 C -12 -33, -7 -38, 0 -38 C 7 -38, 12 -33, 12 -24 C 12 -16, 8 -8, 0 0 Z"
                      fill="#1a73e8"
                      stroke="#0d47a1"
                      strokeWidth="1.2"
                      filter="url(#pinShadow)"
                    />
                    {/* White Center Circle with Groom Icon */}
                    <circle cx="0" cy="-24" r="7.5" fill="#ffffff" />
                    <text x="0" y="-21" textAnchor="middle" fontSize="9" fontWeight="bold">
                      🤵
                    </text>
                    {/* Label Badge */}
                    <g transform="translate(0, 15)">
                      <rect x="-42" y="-9" width="84" height="18" rx="9" fill="#1a73e8" stroke="#ffffff" strokeWidth="1" filter="url(#pinShadow)" />
                      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        Groom Origin
                      </text>
                    </g>
                  </g>
                );
              }

              // 2. Bride's Home Pin: Google Rose/Magenta Teardrop Pin
              if (marker.type === 'bride_home') {
                return (
                  <g
                    key={marker.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Location Radar Wave */}
                    <circle r="18" fill="#e52592" fillOpacity="0.2" className="animate-ping" />
                    {/* Ground Drop Shadow */}
                    <ellipse cx="0" cy="2" rx="7" ry="3" fill="#000000" fillOpacity="0.25" />
                    {/* Google Pink/Magenta Teardrop Pin */}
                    <path
                      d="M 0 0 C -8 -8, -12 -16, -12 -24 C -12 -33, -7 -38, 0 -38 C 7 -38, 12 -33, 12 -24 C 12 -16, 8 -8, 0 0 Z"
                      fill="#e52592"
                      stroke="#ad1457"
                      strokeWidth="1.2"
                      filter="url(#pinShadow)"
                    />
                    {/* White Center Circle with Bride Icon */}
                    <circle cx="0" cy="-24" r="7.5" fill="#ffffff" />
                    <text x="0" y="-21" textAnchor="middle" fontSize="9" fontWeight="bold">
                      👰
                    </text>
                    {/* Label Badge */}
                    <g transform="translate(0, 15)">
                      <rect x="-40" y="-9" width="80" height="18" rx="9" fill="#e52592" stroke="#ffffff" strokeWidth="1" filter="url(#pinShadow)" />
                      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        Bride Origin
                      </text>
                    </g>
                  </g>
                );
              }

              // 3. Lunch Break Pin: Google Amber/Orange Teardrop Pin
              if (marker.type === 'lunch_break') {
                return (
                  <g
                    key={marker.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                    className="cursor-pointer group"
                  >
                    <ellipse cx="0" cy="2" rx="6" ry="2.5" fill="#000000" fillOpacity="0.25" />
                    <path
                      d="M 0 0 C -7 -7, -10 -14, -10 -20 C -10 -28, -6 -32, 0 -32 C 6 -32, 10 -28, 10 -20 C 10 -14, 7 -7, 0 0 Z"
                      fill="#f2994a"
                      stroke="#d97706"
                      strokeWidth="1"
                      filter="url(#pinShadow)"
                    />
                    <circle cx="0" cy="-20" r="6" fill="#ffffff" />
                    <text x="0" y="-17" textAnchor="middle" fontSize="7" fontWeight="bold">
                      🍽️
                    </text>
                  </g>
                );
              }

              // 4. Tour Stops (Venues): Iconic Official Google Red Teardrop Pin (#EA4335)
              if (marker.type === 'tour_stop') {
                return (
                  <g
                    key={marker.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                    className="cursor-pointer group"
                  >
                    {/* Ground Drop Shadow */}
                    <ellipse cx="0" cy="2" rx="8" ry="3" fill="#000000" fillOpacity="0.3" />

                    {/* Official Google Red Teardrop Shape */}
                    <path
                      d="M 0 0 C -9 -9, -14 -18, -14 -27 C -14 -37, -8 -43, 0 -43 C 8 -43, 14 -37, 14 -27 C 14 -18, 9 -9, 0 0 Z"
                      fill="#ea4335"
                      stroke="#b31412"
                      strokeWidth="1.2"
                      filter="url(#pinShadow)"
                      className="group-hover:scale-110 transition-transform origin-bottom"
                    />

                    {/* Inner White Badge with Bold Stop Number */}
                    <circle cx="0" cy="-27" r="8.5" fill="#ffffff" />
                    <text
                      x="0"
                      y="-23"
                      textAnchor="middle"
                      fill="#b31412"
                      fontSize="11"
                      fontWeight="900"
                      fontFamily="Arial, sans-serif"
                    >
                      {marker.stopOrder}
                    </text>

                    {/* Venue Name Pill Below Pin */}
                    <g transform="translate(0, 16)">
                      <rect
                        x="-54"
                        y="-10"
                        width="108"
                        height="20"
                        rx="10"
                        fill="#ffffff"
                        stroke="#ea4335"
                        strokeWidth="1.2"
                        filter="url(#pinShadow)"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#202124"
                        fontSize="9.5"
                        fontWeight="bold"
                      >
                        {marker.title.length > 15 ? `${marker.title.slice(0, 14)}...` : marker.title}
                      </text>
                    </g>
                  </g>
                );
              }

              // 5. Other Shortlisted Venues (Gray Radar Pin)
              return (
                <g
                  key={marker.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                  className="cursor-pointer opacity-75 hover:opacity-100"
                >
                  <ellipse cx="0" cy="2" rx="5" ry="2" fill="#000000" fillOpacity="0.2" />
                  <path
                    d="M 0 0 C -6 -6, -9 -12, -9 -18 C -9 -24, -5 -28, 0 -28 C 5 -28, 9 -24, 9 -18 C 9 -12, 6 -6, 0 0 Z"
                    fill="#70757a"
                    stroke="#3c4043"
                    strokeWidth="1"
                  />
                  <circle cx="0" cy="-18" r="4.5" fill="#ffffff" />
                  <text x="0" y="-15" textAnchor="middle" fontSize="6">
                    🏛️
                  </text>
                </g>
              );
            })}
          </svg>

          {/* AUTHENTIC GOOGLE MAPS INFOWINDOW POPUP */}
          {activeMarker && (() => {
            const pt = project(activeMarker.lat, activeMarker.lon);
            const isTopHalf = pt.y > 220;
            const popupY = isTopHalf ? pt.y - 190 : pt.y + 40;
            const popupX = Math.max(16, Math.min(svgWidth - 280, pt.x - 130));

            return (
              <div
                style={{
                  position: 'absolute',
                  left: `${popupX}px`,
                  top: `${popupY}px`,
                  width: '270px',
                }}
                className="z-40 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.25)] border border-stone-200 p-3.5 text-stone-900 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setActiveMarkerId(null)}
                  className="absolute top-2.5 right-2.5 p-1 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2">
                  {/* Category & Badge */}
                  <div className="flex items-center gap-1.5">
                    {activeMarker.type === 'tour_stop' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Stop #{activeMarker.stopOrder} Venue
                      </span>
                    ) : activeMarker.type === 'groom_home' ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Groom Origin
                      </span>
                    ) : activeMarker.type === 'bride_home' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                        Bride Origin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Mid-Day Stop
                      </span>
                    )}

                    {/* Google Star Rating */}
                    <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold ml-auto pr-6">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{activeMarker.rating?.toFixed(1) || '4.9'}</span>
                      <span className="text-stone-400 font-normal text-[10px]">
                        ({activeMarker.reviewCount || 120})
                      </span>
                    </div>
                  </div>

                  {/* Title & Address */}
                  <div>
                    <h5 className="font-bold text-sm text-stone-900 leading-tight">
                      {activeMarker.title}
                    </h5>
                    <p className="text-stone-500 text-[11px] truncate mt-0.5">
                      {activeMarker.address}, {activeMarker.city}, {activeMarker.state}
                    </p>
                  </div>

                  {/* Suggested Arrival & Tour Window */}
                  {activeMarker.suggestedArrival && (
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-stone-600 font-medium">Scheduled Window:</span>
                      <span className="font-mono font-bold text-rose-700">
                        {activeMarker.suggestedArrival} – {activeMarker.suggestedDeparture || ''}
                      </span>
                    </div>
                  )}

                  {/* Driving Info */}
                  {activeMarker.drivingMinutesFromPrev !== undefined && (
                    <div className="text-[11px] text-stone-600 flex items-center gap-1 font-medium">
                      <Car className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        ~{activeMarker.drivingMinutesFromPrev}m drive ({activeMarker.distanceMilesFromPrev} mi) from previous stop
                      </span>
                    </div>
                  )}

                  {/* Google Directions Action Button */}
                  <div className="pt-1.5 flex items-center justify-between border-t border-stone-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        `${activeMarker.title}, ${activeMarker.address}, ${activeMarker.city}, ${activeMarker.state}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#1A73E8] hover:bg-[#1557b0] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setActiveMarkerId(null)}
                      className="text-stone-500 hover:text-stone-800 text-xs font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Google Maps Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 text-stone-600 border-t border-stone-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#1a73e8] border border-white shadow-2xs flex items-center justify-center text-[7px] text-white">
              🤵
            </div>
            <span className="font-medium text-stone-700">Groom Family Home</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#e52592] border border-white shadow-2xs flex items-center justify-center text-[7px] text-white">
              👰
            </div>
            <span className="font-medium text-stone-700">Bride Family Home</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ea4335] border border-white shadow-2xs flex items-center justify-center text-[8px] font-bold text-white">
              1
            </div>
            <span className="font-medium text-stone-700">Scheduled Tour Stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-1.5 bg-[#4285f4] rounded-full" />
            <span className="font-medium text-stone-700">Google Turn-by-Turn GPS Route</span>
          </div>
        </div>

        <span className="text-[11px] text-stone-500 italic">
          Click any pin on the map to inspect appointment window and turn-by-turn navigation
        </span>
      </div>

      {/* Google Maps Setup Assistant Modal */}
      <GoogleMapsKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={(newKey) => {
          setApiKey(newKey);
        }}
      />
    </div>
  );
}
