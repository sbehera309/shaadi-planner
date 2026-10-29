'use client';

import React, { useState, useMemo } from 'react';
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
    });

    // Tour Stop Venues in Sequence
    stops.forEach((stop, index) => {
      // Find matching venue from shortlisted or curated
      const matchedVenue = allShortlistedVenues.find((v) => v.id === stop.venueId);
      const coords = getCoordinates(
        stop.address,
        stop.city,
        'NJ',
        matchedVenue?.latitude,
        matchedVenue?.longitude
      );

      const isFirstRendezvous = stop.stopOrder === 1 && meetingMode === 'meet_at_first_venue';

      list.push({
        id: `stop-${stop.venueId}`,
        type: 'tour_stop',
        title: isFirstRendezvous ? `🤝 ${stop.venueName} (Rendezvous)` : stop.venueName,
        subtitle: isFirstRendezvous
          ? `Stop #1 Mutual Rendezvous • ${stop.suggestedArrivalTime}`
          : `Stop #${stop.stopOrder} • ${stop.suggestedArrivalTime}`,
        address: stop.address,
        city: stop.city,
        state: 'NJ',
        lat: coords.lat,
        lon: coords.lon,
        stopOrder: stop.stopOrder,
        suggestedArrival: stop.suggestedArrivalTime,
        suggestedDeparture: stop.suggestedDepartureTime,
        tourWindow: stop.suggestedTourWindow,
        drivingMinutesFromPrev: stop.drivingTimeToNextMinutes,
        distanceMilesFromPrev: stop.distanceToNextMiles,
        notes: stop.notesOrQuestionsToAsk,
        touringHours: stop.touringHours,
        touringStatus: stop.touringStatus,
      });
    });

    // Optionally include other shortlisted venues not on today's tour
    if (showAllShortlisted) {
      const activeVenueIds = new Set(stops.map((s) => s.venueId));
      allShortlistedVenues
        .filter((v) => !activeVenueIds.has(v.id))
        .forEach((v) => {
          const coords = getCoordinates(v.address, v.city, v.state, v.latitude, v.longitude);
          list.push({
            id: `shortlisted-${v.id}`,
            type: 'other_venue',
            title: v.name,
            subtitle: 'Shortlisted Venue (Not on today’s tour)',
            address: v.address,
            city: v.city,
            state: v.state,
            lat: coords.lat,
            lon: coords.lon,
            notes: v.pros?.slice(0, 2),
          });
        });
    }

    return list;
  }, [
    groomAddress,
    brideAddress,
    primarySide,
    stops,
    allShortlistedVenues,
    showAllShortlisted,
    meetingMode,
    dualFamilyStartPlan,
  ]);

  // 2. Compute coordinate bounds for the SVG canvas
  const bounds = useMemo(() => {
    if (markers.length === 0) {
      return { minLat: 40.0, maxLat: 41.2, minLon: -75.2, maxLon: -73.8 };
    }
    const lats = markers.map((m) => m.lat);
    const lons = markers.map((m) => m.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Add 15% padding around points
    const latSpan = Math.max(0.12, maxLat - minLat);
    const lonSpan = Math.max(0.15, maxLon - minLon);

    return {
      minLat: minLat - latSpan * 0.18,
      maxLat: maxLat + latSpan * 0.18,
      minLon: minLon - lonSpan * 0.18,
      maxLon: maxLon + lonSpan * 0.18,
    };
  }, [markers]);

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 520;

  // Project (lat, lon) to SVG (x, y)
  const project = (lat: number, lon: number) => {
    const lonRange = bounds.maxLon - bounds.minLon || 1;
    const latRange = bounds.maxLat - bounds.minLat || 1;

    const normX = (lon - bounds.minLon) / lonRange;
    const normY = (bounds.maxLat - lat) / latRange; // Invert Y for SVG

    // Apply zoom and view offset
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    const scaledX = (normX * svgWidth - centerX) * zoomLevel + centerX + viewOffset.x;
    const scaledY = (normY * svgHeight - centerY) * zoomLevel + centerY + viewOffset.y;

    return { x: scaledX, y: scaledY };
  };

  // 3. Separate points for dual-family starting & tour venue stops
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

  // Fallback sequential route points for single family mode
  const routePoints = useMemo(() => {
    const points: Array<{ x: number; y: number; marker: LocationMarker }> = [];

    // Start with primary family home
    const startMarker = primarySide === 'groom' ? groomMarker : brideMarker;
    if (startMarker) {
      const p = project(startMarker.lat, startMarker.lon);
      points.push({ ...p, marker: startMarker });
    }

    // Then tour stops in order
    tourStopMarkers.forEach((stop) => {
      const p = project(stop.lat, stop.lon);
      points.push({ ...p, marker: stop });
    });

    return points;
  }, [markers, primarySide, groomMarker, brideMarker, tourStopMarkers, bounds, zoomLevel, viewOffset]);

  // Active marker info for popover
  const activeMarker = useMemo(
    () => markers.find((m) => m.id === activeMarkerId),
    [markers, activeMarkerId]
  );

  return (
    <div className="bg-stone-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-stone-800 space-y-5 overflow-hidden relative">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
            <Car className="w-3.5 h-3.5 text-rose-400" />
            <span>Interactive Multi-Stop Day Tour Map</span>
          </div>
          <h3 className="text-xl font-bold font-serif text-amber-100 flex items-center gap-2">
            <span>Visual Driving Route &amp; Stop Radar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-sans font-normal border border-stone-700">
              {tourDate}
            </span>
          </h3>
          <p className="text-xs text-stone-400 max-w-xl">
            View both family starting residences and all scheduled venue stops on one unified map.
            Click any pin to inspect tour timing, notes, and direct turn-by-turn navigation.
          </p>
        </div>

        {/* Action buttons & Map Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {googleMapsMultiStopUrl && (
            <a
              href={googleMapsMultiStopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Google Maps App</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}

          <div className="flex items-center gap-1 bg-stone-800/90 p-1 rounded-xl border border-stone-700">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.2, z + 0.25))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setViewOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Driving</span>
          <div className="text-base font-extrabold text-amber-300 mt-0.5">
            {totalDrivingMinutes > 0
              ? `${Math.floor(totalDrivingMinutes / 60)}h ${totalDrivingMinutes % 60}m`
              : 'Calculating...'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Mileage</span>
          <div className="text-base font-extrabold text-emerald-300 mt-0.5">
            {totalDistanceMiles > 0 ? `${totalDistanceMiles} miles` : '0 miles'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Scheduled Stops</span>
          <div className="text-base font-extrabold text-white mt-0.5">
            {stops.length} Venues {activeLunch ? '+ Lunch Break' : ''}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-800/60 border border-stone-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Show Radar</span>
            <span className="text-xs text-stone-300 font-semibold">Other Shortlisted</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAllShortlisted(!showAllShortlisted)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              showAllShortlisted
                ? 'bg-amber-400 text-stone-950 border-amber-400 font-extrabold'
                : 'bg-stone-700/80 text-stone-300 border-stone-600 hover:bg-stone-700'
            }`}
          >
            {showAllShortlisted ? 'Showing' : 'Hidden'}
          </button>
        </div>
      </div>

      {/* Dual-Family Morning Coordination Banner */}
      {dualFamilyStartPlan && (
        <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/80 text-xs space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wide border border-amber-500/30 flex items-center gap-1">
                <span>{meetingMode === 'meet_at_first_venue' ? '🤝' : meetingMode === 'carpool_pickup' ? '🚙' : '🏠'}</span>
                <span>
                  {meetingMode === 'meet_at_first_venue'
                    ? 'Dual-Family Balanced Rendezvous'
                    : meetingMode === 'carpool_pickup'
                    ? 'Carpool Caravan & Morning Chai'
                    : 'Single Origin Departure'}
                </span>
              </span>
              <span className="text-stone-300 font-medium text-[11px]">
                {dualFamilyStartPlan.fairnessSummary}
              </span>
            </div>
            <span className="text-[11px] text-amber-200 font-bold flex items-center gap-1">
              <span>📍 Meet at Stop #1:</span>
              <span className="underline decoration-amber-400">{dualFamilyStartPlan.rendezvousArrivalTime}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
              <span className="flex items-center gap-1.5 font-semibold text-blue-200">
                <span>🤵</span>
                <span>Groom ({dualFamilyStartPlan.groomDeparture.homeCity}):</span>
              </span>
              <span className="font-mono font-bold text-blue-100 flex items-center gap-1.5">
                <span>Depart {dualFamilyStartPlan.groomDeparture.recommendedDepartureTime}</span>
                <span className="text-[10px] text-blue-300 font-normal">
                  (~{dualFamilyStartPlan.groomDeparture.drivingMinutesToFirstStop}m / {dualFamilyStartPlan.groomDeparture.distanceMilesToFirstStop}mi)
                </span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40">
              <span className="flex items-center gap-1.5 font-semibold text-rose-200">
                <span>👰</span>
                <span>Bride ({dualFamilyStartPlan.brideDeparture.homeCity}):</span>
              </span>
              <span className="font-mono font-bold text-rose-100 flex items-center gap-1.5">
                <span>Depart {dualFamilyStartPlan.brideDeparture.recommendedDepartureTime}</span>
                <span className="text-[10px] text-rose-300 font-normal">
                  (~{dualFamilyStartPlan.brideDeparture.drivingMinutesToFirstStop}m / {dualFamilyStartPlan.brideDeparture.distanceMilesToFirstStop}mi)
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Map Canvas */}
      <div className="relative rounded-2xl bg-radial from-stone-800 via-stone-900 to-stone-950 border border-stone-800 overflow-hidden shadow-inner aspect-16/10 sm:aspect-21/10 min-h-[360px]">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none"
        >
          <defs>
            {/* Gradient for route path */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Glow filter for route line */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* MODE 1: MEET AT FIRST VENUE (Dual independent approach legs converging at Stop #1) */}
          {meetingMode === 'meet_at_first_venue' && tourStopPts.length > 0 && (
            <g>
              {/* Groom approach leg to Stop #1 */}
              {groomPt && (
                <g>
                  <path
                    d={`M ${groomPt.x} ${groomPt.y} Q ${(groomPt.x + tourStopPts[0].x) / 2} ${(groomPt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    strokeOpacity="0.4"
                    filter="url(#routeGlow)"
                  />
                  <path
                    d={`M ${groomPt.x} ${groomPt.y} Q ${(groomPt.x + tourStopPts[0].x) / 2} ${(groomPt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  <g transform={`translate(${(groomPt.x + tourStopPts[0].x) / 2}, ${(groomPt.y + tourStopPts[0].y) / 2})`}>
                    <rect x="-56" y="-11" width="112" height="22" rx="11" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill="#bfdbfe" fontSize="9" fontWeight="bold">
                      🤵 Groom Leg (~{dualFamilyStartPlan?.groomDeparture.drivingMinutesToFirstStop || 25}m)
                    </text>
                  </g>
                </g>
              )}

              {/* Bride approach leg to Stop #1 */}
              {bridePt && (
                <g>
                  <path
                    d={`M ${bridePt.x} ${bridePt.y} Q ${(bridePt.x + tourStopPts[0].x) / 2} ${(bridePt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="4"
                    strokeOpacity="0.4"
                    filter="url(#routeGlow)"
                  />
                  <path
                    d={`M ${bridePt.x} ${bridePt.y} Q ${(bridePt.x + tourStopPts[0].x) / 2} ${(bridePt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                    fill="none"
                    stroke="#fb7185"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  <g transform={`translate(${(bridePt.x + tourStopPts[0].x) / 2}, ${(bridePt.y + tourStopPts[0].y) / 2})`}>
                    <rect x="-54" y="-11" width="108" height="22" rx="11" fill="#881337" stroke="#fb7185" strokeWidth="1" />
                    <text x="0" y="4" textAnchor="middle" fill="#fecdd3" fontSize="9" fontWeight="bold">
                      👰 Bride Leg (~{dualFamilyStartPlan?.brideDeparture.drivingMinutesToFirstStop || 25}m)
                    </text>
                  </g>
                </g>
              )}

              {/* Rendezvous Halo around Stop #1 */}
              <circle
                cx={tourStopPts[0].x}
                cy={tourStopPts[0].y}
                r="30"
                fill="#f59e0b"
                fillOpacity="0.15"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="4 3"
                className="animate-pulse"
              />

              {/* Consecutive Venue Stops (Stop 1 -> Stop 2 -> Stop 3...) */}
              {tourStopPts.length > 1 && (
                <g>
                  <path
                    d={tourStopPts.reduce((acc, curr, idx) => {
                      if (idx === 0) return `M ${curr.x} ${curr.y}`;
                      const prev = tourStopPts[idx - 1];
                      const midX = (prev.x + curr.x) / 2;
                      const midY = (prev.y + curr.y) / 2;
                      return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                    }, '')}
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="5"
                    strokeOpacity="0.4"
                    filter="url(#routeGlow)"
                  />
                  <path
                    d={tourStopPts.reduce((acc, curr, idx) => {
                      if (idx === 0) return `M ${curr.x} ${curr.y}`;
                      const prev = tourStopPts[idx - 1];
                      const midX = (prev.x + curr.x) / 2;
                      const midY = (prev.y + curr.y) / 2;
                      return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                    }, '')}
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {tourStopPts.map((pt, idx) => {
                    if (idx === 0) return null;
                    const prev = tourStopPts[idx - 1];
                    const midX = (prev.x + pt.x) / 2;
                    const midY = (prev.y + pt.y) / 2;
                    return (
                      <g key={`venue-leg-${idx}`} transform={`translate(${midX}, ${midY})`}>
                        <rect x="-46" y="-11" width="92" height="22" rx="11" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
                        <text x="0" y="4" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold">
                          🚗 Stop #{idx} → #{idx + 1}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Light dashed tie line between homes */}
              {groomPt && bridePt && (
                <line
                  x1={groomPt.x}
                  y1={groomPt.y}
                  x2={bridePt.x}
                  y2={bridePt.y}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  strokeOpacity="0.35"
                />
              )}
            </g>
          )}

          {/* MODE 2: CARPOOL PICKUP (Driver Home -> Passenger Home with Chai -> Stop #1 -> Subsequent Venues) */}
          {meetingMode === 'carpool_pickup' && tourStopPts.length > 0 && (() => {
            const driverSide = dualFamilyStartPlan?.pickupOrder?.driverSide || primarySide;
            const driverPt = driverSide === 'groom' ? groomPt : bridePt;
            const passengerPt = driverSide === 'groom' ? bridePt : groomPt;
            if (!driverPt || !passengerPt) return null;

            return (
              <g>
                {/* Leg 1: Driver to Passenger Home for Morning Chai */}
                <path
                  d={`M ${driverPt.x} ${driverPt.y} Q ${(driverPt.x + passengerPt.x) / 2} ${(driverPt.y + passengerPt.y) / 2}, ${passengerPt.x} ${passengerPt.y}`}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="3.5"
                  strokeDasharray="5 3"
                  className="animate-pulse"
                />
                <g transform={`translate(${(driverPt.x + passengerPt.x) / 2}, ${(driverPt.y + passengerPt.y) / 2})`}>
                  <rect x="-62" y="-11" width="124" height="22" rx="11" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold">
                    ☕ Chai &amp; Pickup (20m)
                  </text>
                </g>

                {/* Leg 2: Passenger Home to Stop #1 */}
                <path
                  d={`M ${passengerPt.x} ${passengerPt.y} Q ${(passengerPt.x + tourStopPts[0].x) / 2} ${(passengerPt.y + tourStopPts[0].y) / 2}, ${tourStopPts[0].x} ${tourStopPts[0].y}`}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
                <g transform={`translate(${(passengerPt.x + tourStopPts[0].x) / 2}, ${(passengerPt.y + tourStopPts[0].y) / 2})`}>
                  <rect x="-56" y="-11" width="112" height="22" rx="11" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold">
                    🚙 Caravan to Stop #1
                  </text>
                </g>

                {/* Subsequent Venues (Stop 1 -> Stop 2...) */}
                {tourStopPts.length > 1 && (
                  <g>
                    <path
                      d={tourStopPts.reduce((acc, curr, idx) => {
                        if (idx === 0) return `M ${curr.x} ${curr.y}`;
                        const prev = tourStopPts[idx - 1];
                        const midX = (prev.x + curr.x) / 2;
                        const midY = (prev.y + curr.y) / 2;
                        return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                      }, '')}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="4"
                      strokeDasharray="6 4"
                    />
                    {tourStopPts.map((pt, idx) => {
                      if (idx === 0) return null;
                      const prev = tourStopPts[idx - 1];
                      const midX = (prev.x + pt.x) / 2;
                      const midY = (prev.y + pt.y) / 2;
                      return (
                        <g key={`carpool-venue-leg-${idx}`} transform={`translate(${midX}, ${midY})`}>
                          <rect x="-46" y="-11" width="92" height="22" rx="11" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
                          <text x="0" y="4" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold">
                            🚗 Stop #{idx} → #{idx + 1}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })()}

          {/* MODE 3: SINGLE FAMILY START OR FALLBACK */}
          {meetingMode === 'single_family_start' && routePoints.length > 1 && (
            <g>
              {/* Outer Glow */}
              <path
                d={routePoints.reduce((acc, curr, idx) => {
                  if (idx === 0) return `M ${curr.x} ${curr.y}`;
                  const prev = routePoints[idx - 1];
                  const midX = (prev.x + curr.x) / 2;
                  const midY = (prev.y + curr.y) / 2;
                  return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                }, '')}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="5"
                strokeOpacity="0.4"
                filter="url(#routeGlow)"
              />

              {/* Animated Dashed Core Line */}
              <path
                d={routePoints.reduce((acc, curr, idx) => {
                  if (idx === 0) return `M ${curr.x} ${curr.y}`;
                  const prev = routePoints[idx - 1];
                  const midX = (prev.x + curr.x) / 2;
                  const midY = (prev.y + curr.y) / 2;
                  return `${acc} Q ${prev.x} ${midY}, ${curr.x} ${curr.y}`;
                }, '')}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />

              {/* Waypoint distance chips along path */}
              {routePoints.map((pt, idx) => {
                if (idx === 0) return null;
                const prev = routePoints[idx - 1];
                const midX = (prev.x + pt.x) / 2;
                const midY = (prev.y + pt.y) / 2;

                return (
                  <g key={`single-leg-${idx}`} transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-38"
                      y="-11"
                      width="76"
                      height="22"
                      rx="11"
                      fill="#1c1917"
                      stroke="#44403c"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#fde68a"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      🚗 Leg #{idx}
                    </text>
                  </g>
                );
              })}

              {/* Light connection between Groom & Bride Homes */}
              {groomPt && bridePt && (
                <line
                  x1={groomPt.x}
                  y1={groomPt.y}
                  x2={bridePt.x}
                  y2={bridePt.y}
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  strokeOpacity="0.45"
                />
              )}
            </g>
          )}

          {/* Render All Markers */}
          {markers.map((marker) => {
            const { x, y } = project(marker.lat, marker.lon);
            const isActive = activeMarkerId === marker.id;

            // Render different pin designs based on marker type
            if (marker.type === 'groom_home') {
              return (
                <g
                  key={marker.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                  className="cursor-pointer group"
                >
                  {/* Pulsing ring if start point */}
                  {marker.isPrimaryStart && (
                    <circle r="22" fill="#3b82f6" fillOpacity="0.25" className="animate-ping" />
                  )}
                  <circle r="15" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2.5" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    🤵
                  </text>
                  <text
                    x="0"
                    y="27"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="10"
                    fontWeight="bold"
                    className="drop-shadow-md"
                  >
                    Groom's Home {marker.isPrimaryStart ? '(Start)' : ''}
                  </text>
                </g>
              );
            }

            if (marker.type === 'bride_home') {
              return (
                <g
                  key={marker.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                  className="cursor-pointer group"
                >
                  {marker.isPrimaryStart && (
                    <circle r="22" fill="#e11d48" fillOpacity="0.25" className="animate-ping" />
                  )}
                  <circle r="15" fill="#881337" stroke="#fb7185" strokeWidth="2.5" />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    👰
                  </text>
                  <text
                    x="0"
                    y="27"
                    textAnchor="middle"
                    fill="#fecdd3"
                    fontSize="10"
                    fontWeight="bold"
                    className="drop-shadow-md"
                  >
                    Bride's Home {marker.isPrimaryStart ? '(Start)' : ''}
                  </text>
                </g>
              );
            }

            if (marker.type === 'tour_stop') {
              return (
                <g
                  key={marker.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer halo on active */}
                  {isActive && (
                    <circle r="24" fill="#f59e0b" fillOpacity="0.3" className="animate-pulse" />
                  )}
                  <circle r="16" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="extrabold"
                  >
                    {marker.stopOrder}
                  </text>
                  <text
                    x="0"
                    y="28"
                    textAnchor="middle"
                    fill="#fde68a"
                    fontSize="10"
                    fontWeight="bold"
                    className="drop-shadow-md"
                  >
                    {marker.title.length > 18 ? `${marker.title.slice(0, 16)}...` : marker.title}
                  </text>
                </g>
              );
            }

            // Other shortlisted venues (dimmed)
            return (
              <g
                key={marker.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => setActiveMarkerId(isActive ? null : marker.id)}
                className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
              >
                <circle r="9" fill="#44403c" stroke="#a8a29e" strokeWidth="1.5" />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="#d6d3d1"
                  fontSize="8"
                  fontWeight="bold"
                >
                  📍
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Marker Detail Card Popover */}
        {activeMarker && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-stone-900/95 backdrop-blur-md rounded-2xl p-4 border border-amber-500/50 shadow-2xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeMarker.type === 'groom_home'
                        ? 'bg-blue-900/80 text-blue-200 border border-blue-700'
                        : activeMarker.type === 'bride_home'
                        ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                        : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                    }`}
                  >
                    {activeMarker.type === 'groom_home'
                      ? "Groom's Home"
                      : activeMarker.type === 'bride_home'
                      ? "Bride's Home"
                      : `Tour Stop #${activeMarker.stopOrder}`}
                  </span>
                  {activeMarker.suggestedArrival && (
                    <span className="text-[10px] font-semibold text-stone-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{activeMarker.suggestedArrival}</span>
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white font-serif">{activeMarker.title}</h4>
                <p className="text-xs text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>
                    {activeMarker.address}, {activeMarker.city}, {activeMarker.state}{' '}
                    {activeMarker.zipCode}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMarkerId(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            {/* Tour appointment window */}
            {activeMarker.tourWindow && (
              <div className="space-y-1.5">
                <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/80 text-[11px] text-stone-300 flex items-center justify-between">
                  <span className="text-amber-300 font-semibold">Appointment Window:</span>
                  <span>{activeMarker.tourWindow}</span>
                </div>

                {activeMarker.touringStatus && (
                  <div
                    className={`p-2 rounded-xl text-[10px] leading-tight border ${
                      activeMarker.touringStatus.isWithinHours
                        ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                        : 'bg-rose-950/50 border-rose-700/70 text-rose-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 mb-0.5">
                      <span>{activeMarker.touringStatus.isWithinHours ? '✓' : '⚠️'}</span>
                      <span>{activeMarker.touringStatus.badgeLabel}</span>
                    </div>
                    {activeMarker.touringStatus.warningMessage && (
                      <p className="text-stone-300/90 text-[10px]">
                        {activeMarker.touringStatus.warningMessage}
                      </p>
                    )}
                    {activeMarker.touringHours && (
                      <span className="text-stone-400 block text-[9px] mt-1">
                        Official Hours: {activeMarker.touringHours.saturdayHours}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Questions to ask */}
            {activeMarker.notes && activeMarker.notes.length > 0 && (
              <div className="space-y-1 text-[11px] text-stone-300">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  Questions to ask venue director:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-stone-300/90 pl-1">
                  {activeMarker.notes.slice(0, 2).map((q, idx) => (
                    <li key={idx} className="truncate">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-800 text-xs">
              <span className="text-[10px] text-stone-400">
                GPS: {activeMarker.lat.toFixed(4)}, {activeMarker.lon.toFixed(4)}
              </span>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${activeMarker.address}, ${activeMarker.city}, ${activeMarker.state}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white text-stone-950 font-bold text-xs hover:bg-stone-200 transition-colors inline-flex items-center gap-1"
              >
                <span>Navigate Here</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white/60 inline-block" />
            <span className="text-stone-300 font-medium">Groom's Home (Start)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white/60 inline-block" />
            <span className="text-stone-300 font-medium">Bride's Family Home</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[9px] flex items-center justify-center border border-white/60">
              1
            </span>
            <span className="text-stone-300 font-medium">Scheduled Tour Stops (Ordered)</span>
          </div>

          {activeLunch && (
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-stone-800 border border-stone-700 text-amber-300 text-[10px]">
                🥪
              </span>
              <span className="text-stone-300 font-medium">Midday Family Lunch Break</span>
            </div>
          )}
        </div>

        <span className="text-[11px] text-stone-500 italic">
          Click any pin on the map to view appointment window and directions
        </span>
      </div>
    </div>
  );
}
