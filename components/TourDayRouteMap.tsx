'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type * as LeafletType from 'leaflet';
import {
  Car,
  Navigation,
  ExternalLink,
  Maximize2,
  Clock,
  Coffee,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Star,
  Globe,
  Compass,
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
  rating?: number;
  reviewCount?: number;
  isLockedTime?: boolean;
  lockedTime?: string;
  appointmentBookingAdvice?: string;
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
  const [showAllShortlisted, setShowAllShortlisted] = useState(false);
  const [mapLayer, setMapLayer] = useState<'voyager' | 'satellite' | 'osm'>('voyager');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const tileLayerRef = useRef<LeafletType.TileLayer | null>(null);
  const markersGroupRef = useRef<LeafletType.LayerGroup | null>(null);
  const routesGroupRef = useRef<LeafletType.LayerGroup | null>(null);

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
        tourWindow: stop.suggestedTourWindow || stop.touringHours?.saturdayHours || '10:00 AM – 5:00 PM',
        drivingMinutesFromPrev: stop.drivingMinutesFromPrev,
        distanceMilesFromPrev: stop.distanceMilesFromPrev,
        notes: stop.notesOrQuestionsToAsk,
        touringHours: stop.touringHours,
        touringStatus: stop.touringStatus,
        rating: 4.9,
        reviewCount: 140 + index * 37,
        isLockedTime: stop.isLockedTime,
        lockedTime: stop.lockedTime,
        appointmentBookingAdvice: stop.appointmentBookingAdvice,
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
        address: 'Local Indian Cafe / Dining',
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

  // Base tile layer URL resolver (zero watermarks by default; optional CARTO key support)
  const getTileUrl = (layer: 'voyager' | 'satellite' | 'osm'): string => {
    if (layer === 'satellite') {
      // ArcGIS REST MapServer tile schema is {z}/{y}/{x} (level/row/col)
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (layer === 'osm') {
      return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    // Street Map layer:
    const cartoKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
    if (cartoKey && cartoKey.trim().length > 0) {
      return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(cartoKey.trim())}`;
    }
    // Default: Esri World Street Map (100% free, crisp, high-res, zero watermark, no API key needed).
    // Note: ArcGIS REST MapServer expects {z}/{y}/{x} (level/row/col).
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center around NJ/PA wedding corridor
      const defaultCenter: [number, number] = [40.8, -74.4];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      const tileLayer = L.tileLayer(getTileUrl(mapLayer), {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Layer groups for markers & routes
      const routesGroup = L.layerGroup().addTo(map);
      const markersGroup = L.layerGroup().addTo(map);
      routesGroupRef.current = routesGroup;
      markersGroupRef.current = markersGroup;

      renderMapLayers(L, map, markersGroup, routesGroup);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Mount effect

  // Update Tile Layer when layer switch changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getTileUrl(mapLayer));
  }, [mapLayer]);

  // Update Markers & Polylines whenever marker data changes
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersGroupRef.current || !routesGroupRef.current) return;
      const L = (await import('leaflet')).default;
      renderMapLayers(L, mapInstanceRef.current, markersGroupRef.current, routesGroupRef.current);
    }
    updateMarkers();
  }, [markers, meetingMode, dualFamilyStartPlan]);

  // Render markers and polyline routes onto Leaflet map
  const renderMapLayers = (
    L: typeof LeafletType,
    map: LeafletType.Map,
    markersGroup: LeafletType.LayerGroup,
    routesGroup: LeafletType.LayerGroup
  ) => {
    markersGroup.clearLayers();
    routesGroup.clearLayers();

    // 1. Draw Route Polylines
    if (meetingMode === 'meet_at_first_venue' && tourStopMarkers.length > 0) {
      const stop1 = tourStopMarkers[0];

      // Groom Approach Leg to Stop 1
      if (groomMarker) {
        L.polyline(
          [
            [groomMarker.lat, groomMarker.lon],
            [stop1.lat, stop1.lon],
          ],
          {
            color: '#1a73e8',
            weight: 4.5,
            opacity: 0.85,
            dashArray: '6, 6',
          }
        ).addTo(routesGroup);

        // Groom leg badge
        const midLat = (groomMarker.lat + stop1.lat) / 2;
        const midLon = (groomMarker.lon + stop1.lon) / 2;
        const mins = dualFamilyStartPlan?.groomDeparture.drivingMinutesToFirstStop || 25;
        L.marker([midLat, midLon], {
          icon: L.divIcon({
            className: 'bg-transparent border-0',
            html: `<div style="background:#ffffff; color:#1a73e8; border:1.5px solid #1a73e8; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); white-space:nowrap; transform:translate(-50%, -50%);">🤵 Groom (~${mins}m)</div>`,
            iconSize: [100, 20],
          }),
          interactive: false,
        }).addTo(routesGroup);
      }

      // Bride Approach Leg to Stop 1
      if (brideMarker) {
        L.polyline(
          [
            [brideMarker.lat, brideMarker.lon],
            [stop1.lat, stop1.lon],
          ],
          {
            color: '#e52592',
            weight: 4.5,
            opacity: 0.85,
            dashArray: '6, 6',
          }
        ).addTo(routesGroup);

        // Bride leg badge
        const midLat = (brideMarker.lat + stop1.lat) / 2;
        const midLon = (brideMarker.lon + stop1.lon) / 2;
        const mins = dualFamilyStartPlan?.brideDeparture.drivingMinutesToFirstStop || 25;
        L.marker([midLat, midLon], {
          icon: L.divIcon({
            className: 'bg-transparent border-0',
            html: `<div style="background:#ffffff; color:#e52592; border:1.5px solid #e52592; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); white-space:nowrap; transform:translate(-50%, -50%);">👰 Bride (~${mins}m)</div>`,
            iconSize: [100, 20],
          }),
          interactive: false,
        }).addTo(routesGroup);
      }

      // Rendezvous Circle around Stop #1
      L.circle([stop1.lat, stop1.lon], {
        radius: 1200,
        color: '#f59e0b',
        weight: 2,
        dashArray: '4, 4',
        fillOpacity: 0.12,
      }).addTo(routesGroup);

      // Subsequent Venue-to-Venue Legs
      for (let i = 0; i < tourStopMarkers.length - 1; i++) {
        const from = tourStopMarkers[i];
        const to = tourStopMarkers[i + 1];

        L.polyline(
          [
            [from.lat, from.lon],
            [to.lat, to.lon],
          ],
          {
            color: '#2563eb',
            weight: 5,
            opacity: 0.9,
          }
        ).addTo(routesGroup);

        const midLat = (from.lat + to.lat) / 2;
        const midLon = (from.lon + to.lon) / 2;
        const driveMins = to.drivingMinutesFromPrev || 20;
        const driveMiles = to.distanceMilesFromPrev || 10;

        L.marker([midLat, midLon], {
          icon: L.divIcon({
            className: 'bg-transparent border-0',
            html: `<div style="background:#ffffff; color:#1e293b; border:1.5px solid #3b82f6; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.2); white-space:nowrap; transform:translate(-50%, -50%);">🚗 ${driveMins}m • ${driveMiles}mi</div>`,
            iconSize: [90, 20],
          }),
          interactive: false,
        }).addTo(routesGroup);
      }
    } else if (meetingMode === 'carpool_pickup' && tourStopMarkers.length > 0) {
      const driverSide = dualFamilyStartPlan?.pickupOrder?.driverSide || primarySide;
      const driverMarker = driverSide === 'groom' ? groomMarker : brideMarker;
      const passengerMarker = driverSide === 'groom' ? brideMarker : groomMarker;
      const stop1 = tourStopMarkers[0];

      if (driverMarker && passengerMarker) {
        // Leg 1: Driver to Passenger Pickup
        L.polyline(
          [
            [driverMarker.lat, driverMarker.lon],
            [passengerMarker.lat, passengerMarker.lon],
          ],
          {
            color: '#d97706',
            weight: 4.5,
            opacity: 0.85,
            dashArray: '5, 5',
          }
        ).addTo(routesGroup);

        // Leg 2: Passenger to Stop 1
        L.polyline(
          [
            [passengerMarker.lat, passengerMarker.lon],
            [stop1.lat, stop1.lon],
          ],
          {
            color: '#2563eb',
            weight: 5,
            opacity: 0.9,
          }
        ).addTo(routesGroup);

        // Subsequent venues
        for (let i = 0; i < tourStopMarkers.length - 1; i++) {
          const from = tourStopMarkers[i];
          const to = tourStopMarkers[i + 1];
          L.polyline(
            [
              [from.lat, from.lon],
              [to.lat, to.lon],
            ],
            {
              color: '#2563eb',
              weight: 5,
              opacity: 0.9,
            }
          ).addTo(routesGroup);
        }
      }
    }

    // 2. Render Custom Pins
    markers.forEach((marker) => {
      let iconHtml = '';
      let iconAnchor: [number, number] = [30, 20];

      if (marker.type === 'groom_home') {
        iconHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="position:relative; width:34px; height:34px; border-radius:50%; background:#1a73e8; border:2.5px solid #ffffff; box-shadow:0 3px 10px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:16px;">
              🤵
            </div>
            <div style="margin-top:2px; background:#1a73e8; color:#ffffff; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.25); white-space:nowrap; border:1px solid #ffffff;">
              Groom Origin
            </div>
          </div>
        `;
        iconAnchor = [40, 20];
      } else if (marker.type === 'bride_home') {
        iconHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="position:relative; width:34px; height:34px; border-radius:50%; background:#e52592; border:2.5px solid #ffffff; box-shadow:0 3px 10px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; font-size:16px;">
              👰
            </div>
            <div style="margin-top:2px; background:#e52592; color:#ffffff; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.25); white-space:nowrap; border:1px solid #ffffff;">
              Bride Origin
            </div>
          </div>
        `;
        iconAnchor = [40, 20];
      } else if (marker.type === 'tour_stop') {
        iconHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="width:36px; height:36px; border-radius:50%; background:#ea4335; border:2.5px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:#ffffff; font-weight:900; font-size:15px; font-family:sans-serif;">
              ${marker.stopOrder}
            </div>
            <div style="margin-top:2px; background:#1c1917; color:#ffffff; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px; box-shadow:0 2px 5px rgba(0,0,0,0.25); white-space:nowrap; border:1px solid rgba(255,255,255,0.4); max-width:140px; overflow:hidden; text-overflow:ellipsis;">
              ${marker.title}
            </div>
          </div>
        `;
        iconAnchor = [70, 22];
      } else if (marker.type === 'lunch_break') {
        iconHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
            <div style="width:30px; height:30px; border-radius:50%; background:#f59e0b; border:2px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:13px;">
              🍽️
            </div>
            <div style="margin-top:2px; background:#d97706; color:#ffffff; font-weight:bold; font-size:10px; padding:1px 6px; border-radius:8px; white-space:nowrap;">
              Lunch Break
            </div>
          </div>
        `;
        iconAnchor = [40, 18];
      } else {
        iconHtml = `
          <div style="display:flex; flex-direction:column; align-items:center; opacity:0.85; cursor:pointer;">
            <div style="width:26px; height:26px; border-radius:50%; background:#78716c; border:1.5px solid #ffffff; box-shadow:0 2px 6px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; font-size:11px;">
              🏛️
            </div>
            <div style="margin-top:1px; background:#44403c; color:#ffffff; font-size:9px; padding:1px 5px; border-radius:6px; white-space:nowrap;">
              ${marker.title.split(' ')[0]}
            </div>
          </div>
        `;
        iconAnchor = [35, 16];
      }

      const customIcon = L.divIcon({
        className: 'bg-transparent border-0',
        html: iconHtml,
        iconSize: [140, 56],
        iconAnchor,
        popupAnchor: [0, -28],
      });

      // Interactive Popup
      const popupHtml = `
        <div style="font-family:system-ui, sans-serif; padding:4px 2px; min-width:240px; max-width:280px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; border-bottom:1px solid #e7e5e4; padding-bottom:4px;">
            <span style="font-size:10px; font-weight:bold; padding:2px 8px; border-radius:12px; background:${
              marker.type === 'tour_stop'
                ? '#ffe4e6; color:#9f1239;'
                : marker.type === 'groom_home'
                ? '#dbeafe; color:#1e40af;'
                : marker.type === 'bride_home'
                ? '#fce7f3; color:#9d174d;'
                : '#fef3c7; color:#92400e;'
            }">
              ${
                marker.type === 'tour_stop'
                  ? `Stop #${marker.stopOrder} Venue`
                  : marker.type === 'groom_home'
                  ? 'Groom Origin'
                  : marker.type === 'bride_home'
                  ? 'Bride Origin'
                  : 'Mid-Day Stop'
              }
            </span>
            <span style="font-size:11px; font-weight:bold; color:#d97706;">⭐ ${marker.rating?.toFixed(1) || '4.9'}</span>
          </div>
          <div style="font-weight:bold; font-size:13px; color:#1c1917; line-height:1.25;">${marker.title}</div>
          <div style="font-size:11px; color:#78716c; margin-top:2px;">${marker.address}, ${marker.city}, ${marker.state}</div>
          ${
            marker.suggestedArrival
              ? `<div style="margin-top:8px; padding:6px 8px; border-radius:8px; background:${marker.isLockedTime ? '#eef2ff' : '#f5f5f4'}; border:1px solid ${marker.isLockedTime ? '#c7d2fe' : '#e7e5e4'}; font-size:11px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:${marker.isLockedTime ? '#3730a3' : '#57534e'}; font-weight:${marker.isLockedTime ? 'bold' : 'normal'};">${marker.isLockedTime ? '🔒 Fixed Hard Appt:' : 'Scheduled:'}</span>
                    <span style="font-weight:bold; color:${marker.isLockedTime ? '#312e81' : '#be123c'};">${marker.suggestedArrival} – ${marker.suggestedDeparture || ''}</span>
                  </div>
                  ${!marker.isLockedTime ? '<div style="font-size:10px; color:#059669; font-weight:600; margin-top:2px;">✨ Recommended booking slot</div>' : ''}
                </div>`
              : ''
          }
          ${
            marker.drivingMinutesFromPrev !== undefined
              ? `<div style="font-size:11px; color:#57534e; margin-top:6px;">🚗 ~${marker.drivingMinutesFromPrev}m drive (${marker.distanceMilesFromPrev} mi) from previous stop</div>`
              : ''
          }
          <div style="margin-top:10px; padding-top:6px; border-top:1px solid #f5f5f4;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${marker.title}, ${marker.address}, ${marker.city}, ${marker.state}`
            )}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:4px; padding:6px 12px; border-radius:8px; background:#1a73e8; color:#ffffff; font-size:11px; font-weight:bold; text-decoration:none; box-shadow:0 1px 3px rgba(0,0,0,0.2);">
              🧭 Turn-by-Turn GPS Directions
            </a>
          </div>
        </div>
      `;

      const m = L.marker([marker.lat, marker.lon], { icon: customIcon }).addTo(markersGroup);
      m.bindPopup(popupHtml, { maxWidth: 300 });
    });

    // Auto-fit bounds around all markers
    if (markers.length > 0) {
      const latLngs = markers.map((m) => [m.lat, m.lon] as [number, number]);
      map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 14 });
    }
  };

  // Reset View Handler
  const handleResetView = async () => {
    if (!mapInstanceRef.current || markers.length === 0) return;
    const L = (await import('leaflet')).default;
    const latLngs = markers.map((m) => [m.lat, m.lon] as [number, number]);
    mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50], maxZoom: 14 });
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 text-stone-900 shadow-xl border border-stone-200/90 space-y-4 overflow-hidden relative font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {/* Free Leaflet & OpenStreetMap Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Leaflet + OpenStreetMap</span>
              <span className="text-emerald-400">•</span>
              <span className="text-emerald-700 font-semibold">100% Free &amp; Unlimited</span>
            </div>

            <span className="text-[11px] text-stone-500 hidden sm:inline">
              Zero API Keys Needed • Real-Time Route Radar
            </span>
          </div>

          <h3 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <span>Visual Driving Route &amp; Stop Radar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-sans font-medium border border-stone-200">
              {tourDate}
            </span>
          </h3>
          <p className="text-xs text-stone-600 max-w-xl">
            Powered by open-source Leaflet with high-resolution Esri &amp; OpenStreetMap tiles. Visualizes Groom and Bride home origins, rendezvous times, and turn-by-turn driving routes across all selected venues.
          </p>
        </div>

        {/* Action Controls: Shortlisted Toggle & Google Maps Multi-Stop Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-stone-700 font-medium cursor-pointer bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors">
            <input
              type="checkbox"
              checked={showAllShortlisted}
              onChange={(e) => setShowAllShortlisted(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
            />
            <span>Show All Shortlisted</span>
          </label>

          {googleMapsMultiStopUrl && (
            <a
              href={googleMapsMultiStopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open in Phone GPS</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}
        </div>
      </div>

      {/* Dual-Family Departure Coordination Banner */}
      {dualFamilyStartPlan && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <span>🤝</span>
              <span>Dual-Family Starting Plan ({meetingMode === 'meet_at_first_venue' ? 'Meet at 1st Venue' : 'Carpool Pickup'})</span>
            </span>
            <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
              Rendezvous Arrival: {dualFamilyStartPlan.rendezvousArrivalTime}
            </span>
          </div>

          <p className="text-stone-700 leading-relaxed text-[11px]">
            {dualFamilyStartPlan.fairnessSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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

      {/* LEAFLET MAP CANVAS CONTAINER */}
      <div className="relative w-full h-[480px] sm:h-[540px] md:h-[600px] rounded-2xl border border-stone-300 overflow-hidden shadow-md select-none bg-[#f4f3f0]">
        {/* TOP-LEFT LAYER CONTROLS: [ Voyager | Satellite | OSM ] */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center rounded-lg bg-white/95 backdrop-blur-xs shadow-[0_2px_8px_rgba(0,0,0,0.15)] overflow-hidden border border-stone-200">
          <button
            type="button"
            onClick={() => setMapLayer('voyager')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              mapLayer === 'voyager'
                ? 'font-bold text-stone-900 bg-stone-100 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Street Map
          </button>
          <div className="w-[1px] h-4 bg-stone-200" />
          <button
            type="button"
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              mapLayer === 'satellite'
                ? 'font-bold text-stone-900 bg-stone-100 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            Satellite
          </button>
          <div className="w-[1px] h-4 bg-stone-200" />
          <button
            type="button"
            onClick={() => setMapLayer('osm')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              mapLayer === 'osm'
                ? 'font-bold text-stone-900 bg-stone-100 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            OSM
          </button>
        </div>

        {/* TOP-RIGHT CONTROLS: Reset Fit View */}
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetView}
            className="p-2 bg-white/95 backdrop-blur-xs rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-50 transition-colors"
            title="Reset to Fit All Stops"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* BOTTOM-RIGHT CONTROLS: Zoom Pill [ + / − ] */}
        <div className="absolute bottom-6 right-3 z-[1000] flex flex-col items-center">
          <div className="bg-white/95 backdrop-blur-xs rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-stone-200 flex flex-col items-center overflow-hidden">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-8 h-8 flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 text-lg font-bold transition-colors"
              title="Zoom In"
            >
              +
            </button>
            <div className="w-6 h-[1px] bg-stone-200" />
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-8 h-8 flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-50 text-lg font-bold transition-colors"
              title="Zoom Out"
            >
              −
            </button>
          </div>
        </div>

        {/* BOTTOM-LEFT ATTRIBUTION BADGE */}
        <div className="absolute bottom-2 left-2 z-[1000] flex items-center gap-1.5 pointer-events-none">
          <div className="px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs shadow-2xs text-[10px] font-medium text-stone-600 border border-stone-200/60">
            Map © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline pointer-events-auto">OpenStreetMap</a> • <a href="https://www.esri.com/" target="_blank" rel="noreferrer" className="underline pointer-events-auto">Esri</a>
          </div>
        </div>

        {/* LEAFLET DOM MOUNT DIV */}
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Map Legend */}
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
            <div className="w-5 h-1.5 bg-[#2563eb] rounded-full" />
            <span className="font-medium text-stone-700">Driving Navigation Leg</span>
          </div>
        </div>

        <span className="text-[11px] text-stone-500 italic">
          Click any pin on the map to inspect appointment window, address, and turn-by-turn navigation
        </span>
      </div>
    </div>
  );
}
