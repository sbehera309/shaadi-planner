'use client';

import React, { useMemo, useState } from 'react';
import { useWedding } from '@/lib/store';
import {
  HOTEL_BLOCK_FREE_PERKS,
  RecommendedHotel,
  buildHotelOutreachScript,
  getRecommendedHotelsForVenue,
} from '@/lib/hotelRoomBlockGuide';
import {
  Building2,
  Phone,
  MapPin,
  Gift,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Plus,
  ChevronDown,
  ChevronUp,
  Bus,
  CheckSquare,
  Square,
  ShieldCheck,
} from 'lucide-react';

interface HotelRoomBlockGuideProps {
  hasRoomsAdded: boolean;
  onStartHotelBlock: (hotelName: string, checkInDate: string, checkOutDate: string, notes: string) => void;
}

export const HotelRoomBlockGuide: React.FC<HotelRoomBlockGuideProps> = ({
  hasRoomsAdded,
  onStartHotelBlock,
}) => {
  const { wedding, venues, events, guests, isReadOnly } = useWedding();
  const [isExpanded, setIsExpanded] = useState(!hasRoomsAdded);
  const [activeSubTab, setActiveSubTab] = useState<'hotels' | 'perks' | 'script'>('hotels');
  const [checkedPerks, setCheckedPerks] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Detect main Wedding & Reception venue automatically
  const mainVenueInfo = useMemo(() => {
    const officialVenue =
      venues.find((v) => v.isSelectedOfficialVenue) ||
      venues.find((v) => v.tourStatus === 'selected') ||
      venues.find((v) => v.tourStatus === 'contract_review');

    const receptionOrWeddingEvent =
      events.find((e) => e.type === 'reception' && e.venueName && !e.venueName.toLowerCase().includes('tbd')) ||
      events.find((e) => (e.type === 'pheras' || e.type === 'baraat') && e.venueName && !e.venueName.toLowerCase().includes('tbd')) ||
      events.find((e) => e.venueName && !e.venueName.toLowerCase().includes('tbd'));

    const name =
      officialVenue?.name ||
      receptionOrWeddingEvent?.venueName ||
      wedding?.venueName ||
      '';
    const location = officialVenue
      ? [officialVenue.city, officialVenue.state].filter(Boolean).join(', ')
      : receptionOrWeddingEvent?.venueAddress || wedding?.city || '';

    return { name, location };
  }, [venues, events, wedding]);

  // Estimate check-in / check-out dates from wedding profile or scheduled events
  const { checkInDate, checkOutDate } = useMemo(() => {
    const datedEvents = events
      .filter((e) => e.date && /^\d{4}-\d{2}-\d{2}$/.test(e.date))
      .sort((a, b) => a.date.localeCompare(b.date));

    const startStr = datedEvents[0]?.date || wedding?.startDate || '';
    const endStr = datedEvents[datedEvents.length - 1]?.date || wedding?.endDate || startStr;

    const addDays = (iso: string, delta: number) => {
      if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(y, m - 1, d + delta);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    const inDate = startStr ? addDays(startStr, -1) : '';
    const outDate = endStr ? addDays(endStr, 1) : '';
    return {
      checkInDate: inDate || 'Wedding Eve',
      checkOutDate: outDate || 'Day After Reception',
    };
  }, [events, wedding]);

  // Smart room block estimate based on guest households (~30% need rooms, min 15)
  const estimatedRooms = useMemo(() => {
    const households = guests.length;
    if (households === 0) return 20;
    return Math.max(15, Math.min(60, Math.round(households * 0.35)));
  }, [guests.length]);

  const coupleNames =
    wedding?.brideName && wedding?.groomName
      ? `${wedding.brideName} & ${wedding.groomName}`
      : 'Our Wedding';

  const recommendation = useMemo(
    () => getRecommendedHotelsForVenue(mainVenueInfo.name, mainVenueInfo.location),
    [mainVenueInfo.name, mainVenueInfo.location]
  );

  const googleMapsSearchUrl = useMemo(() => {
    const query = mainVenueInfo.name
      ? `hotels near ${mainVenueInfo.name} ${mainVenueInfo.location}`.trim()
      : 'hotels with wedding room blocks near NJ';
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  }, [mainVenueInfo]);

  const defaultScript = useMemo(
    () =>
      buildHotelOutreachScript({
        coupleNames,
        venueName: mainVenueInfo.name || 'our wedding venue',
        checkInDate,
        checkOutDate,
        estimatedRooms,
      }),
    [coupleNames, mainVenueInfo.name, checkInDate, checkOutDate, estimatedRooms]
  );

  const handleCopyScript = async (hotelName?: string) => {
    const script = hotelName
      ? buildHotelOutreachScript({
          coupleNames,
          venueName: mainVenueInfo.name || 'our wedding venue',
          checkInDate,
          checkOutDate,
          estimatedRooms,
          hotelName,
        })
      : defaultScript;
    try {
      await navigator.clipboard.writeText(script);
      setCopiedKey(hotelName || 'general');
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      alert('Could not copy automatically — please select and copy the script below.');
    }
  };

  const togglePerk = (id: string) => {
    setCheckedPerks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePickHotel = (hotel: RecommendedHotel) => {
    const safeIn = /^\d{4}-\d{2}-\d{2}$/.test(checkInDate) ? checkInDate : new Date().toISOString().split('T')[0];
    const safeOut = /^\d{4}-\d{2}-\d{2}$/.test(checkOutDate) ? checkOutDate : safeIn;
    const notes = `Phone: ${hotel.phone} | Est. Rate: ${hotel.typicalRateRange} | ${hotel.blockType}\nPerks to confirm: ${hotel.likelyFreePerks.join(', ')}`;
    onStartHotelBlock(hotel.name, safeIn, safeOut, notes);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/80 via-white to-rose-50/40 rounded-3xl border border-amber-200/90 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/60">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 to-rose-700 text-white flex items-center justify-center shadow-sm shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900">
                Hotel Room Block Finder &amp; Free Perks Playbook
              </h2>
              {!hasRoomsAdded && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase">
                  Recommended First Step
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              {mainVenueInfo.name ? (
                <>
                  Tailored for your main venue:{' '}
                  <strong className="text-stone-900">{mainVenueInfo.name}</strong>
                  {mainVenueInfo.location &&
                  !mainVenueInfo.name.toLowerCase().includes(mainVenueInfo.location.toLowerCase())
                    ? ` (${mainVenueInfo.location})`
                    : ''}{' '}
                  • Suggested block size: <strong className="text-amber-900">~{estimatedRooms} rooms/night</strong>
                </>
              ) : (
                <>
                  Find nearby wedding block hotels, negotiate <strong>free shuttles, comp suites &amp; 0% attrition</strong>, and copy a ready-to-send outreach script.
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-stone-800 font-bold text-xs inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-colors"
        >
          <span>{isExpanded ? 'Collapse Guide' : 'Open Hotel Finder'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Sub-Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveSubTab('hotels')}
                className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'hotels'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Hotels to Call ({recommendation.hotels.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('perks')}
                className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'perks'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-rose-600" />
                <span>Free Perks to Ask For ({HOTEL_BLOCK_FREE_PERKS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('script')}
                className={`px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1.5 transition-all ${
                  activeSubTab === 'script'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call / Email Script</span>
              </button>
            </div>

            <a
              href={googleMapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-rose-700 hover:underline inline-flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Browse More Hotels Near Venue on Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* SUB-TAB 1: RECOMMENDED HOTELS TO CALL */}
          {activeSubTab === 'hotels' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-stone-700">
                  📍 {recommendation.matchedRegionLabel}
                </span>
                <span className="text-[11px] text-stone-500">
                  Pro Tip: Book <strong>1 Primary Hotel</strong> (for family + shuttle) and optionally <strong>1 Budget Overflow Hotel</strong> (0% attrition courtesy block).
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Note: Group nightly rates, room-release cutoffs, and shuttle minimums vary by wedding season — confirm exact contract terms with Hotel Sales.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 shadow-2xs flex flex-col justify-between gap-3 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-stone-900 font-serif">
                            {hotel.name}
                          </h3>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span>
                              {hotel.city} • {hotel.distanceNote}
                            </span>
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold shrink-0">
                          {hotel.typicalRateRange}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3 text-amber-700" />
                          <span>{hotel.blockType}</span>
                        </span>
                        {hotel.likelyFreePerks.map((perk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium"
                          >
                            ✓ {perk}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-stone-600 bg-amber-50/50 border border-amber-100 rounded-xl p-2.5 leading-relaxed">
                        <strong className="text-amber-900">Desi Wedding Tip:</strong> {hotel.desiWeddingTip}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${hotel.phone}`}
                          className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-rose-600" />
                          <span>{hotel.phone}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyScript(hotel.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-semibold text-[11px] inline-flex items-center gap-1"
                          title={`Copy email/call script addressed to ${hotel.name}`}
                        >
                          {copiedKey === hotel.name ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>

                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handlePickHotel(hotel)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Start Block Here</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: FREE PERKS TO NEGOTIATE */}
          {activeSubTab === 'perks' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                <Bus className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Golden Rule of Wedding Room Blocks:</strong> Hotels rarely offer free shuttles, comp bridal suites, or waived welcome bag fees unless you explicitly ask <em>before</em> signing the block agreement. Use this checklist when calling Sales!
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HOTEL_BLOCK_FREE_PERKS.map((perk) => {
                  const checked = Boolean(checkedPerks[perk.id]);
                  return (
                    <button
                      key={perk.id}
                      type="button"
                      onClick={() => togglePerk(perk.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-2.5 ${
                        checked
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`font-bold text-xs ${
                              checked ? 'line-through text-emerald-900' : 'text-stone-900'
                            }`}
                          >
                            {perk.title}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                              perk.priority === 'Must Ask'
                                ? 'bg-rose-100 text-rose-800'
                                : perk.priority === 'High Value'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {perk.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 leading-relaxed">
                          {perk.howToGetIt}
                        </p>
                        <div className="text-[10px] font-bold text-emerald-700">
                          💰 {perk.typicalValue}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: READY-TO-SEND CALL / EMAIL SCRIPT */}
          {activeSubTab === 'script' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-stone-600">
                  Pre-filled with your couple names, main venue, dates, and all key free perks to negotiate:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyScript()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs hover:opacity-95"
                >
                  {copiedKey === 'general' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email / Call Script</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-white border border-stone-200 text-xs text-stone-800 whitespace-pre-wrap font-sans leading-relaxed shadow-inner">
                {defaultScript}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
