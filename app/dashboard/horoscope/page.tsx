'use client';

import React, { useState, useEffect } from 'react';
import { useWedding } from '@/lib/store';
import {
  Sparkles,
  Heart,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Star,
  CheckCircle2,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Download,
  Flame,
  Sun,
  Moon,
  ShieldCheck,
  Award,
  BookOpen,
} from 'lucide-react';
import {
  VEDIC_RASHIS,
  VEDIC_NAKSHATRAS,
  getSunSignFromDate,
  getEstimatedRashiFromDate,
  getEstimatedNakshatraFromDate,
  calculateHoroscopeCompatibility,
  RashiInfo,
  NakshatraInfo,
} from '@/lib/astrology';
import { PersonAstrologyProfile, HoroscopeCompatibilityReport } from '@/lib/types';
import { exportWeddingToExcel } from '@/lib/exportWorkbook';

export default function HoroscopePage() {
  const {
    wedding,
    events,
    budgetItems,
    guests,
    vendors,
    shagunRecords,
    rooms,
    updateWeddingProfile,
  } = useWedding();

  const [activeTab, setActiveTab] = useState<'ashta_koota' | 'dasa_porutham' | 'lucky_elements'>('ashta_koota');

  // Form State for Bride & Groom
  const [brideProfile, setBrideProfile] = useState<PersonAstrologyProfile>({
    name: wedding?.brideName || 'Bride',
    birthDate: '1996-05-14',
    birthTime: '10:30 AM',
    birthPlace: wedding?.city || 'Somerset, NJ, USA',
    rashi: 'Karka (Cancer)',
    nakshatra: 'Pushya',
  });

  const [groomProfile, setGroomProfile] = useState<PersonAstrologyProfile>({
    name: wedding?.groomName || 'Groom',
    birthDate: '1994-11-20',
    birthTime: '08:15 AM',
    birthPlace: wedding?.city || 'Somerset, NJ, USA',
    rashi: 'Vrishabha (Taurus)',
    nakshatra: 'Rohini',
  });

  const [report, setReport] = useState<HoroscopeCompatibilityReport | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Auto-load saved horoscope if present in wedding profile
  useEffect(() => {
    if (wedding?.horoscope) {
      setBrideProfile(wedding.horoscope.bride);
      setGroomProfile(wedding.horoscope.groom);
      if (wedding.horoscope.report) {
        setReport(wedding.horoscope.report);
        setIsCalculated(true);
      }
    } else {
      // Initialize with names if available
      if (wedding?.brideName) {
        setBrideProfile((prev) => ({ ...prev, name: wedding.brideName }));
      }
      if (wedding?.groomName) {
        setGroomProfile((prev) => ({ ...prev, name: wedding.groomName }));
      }
      // Generate default preview
      const initialReport = calculateHoroscopeCompatibility(brideProfile, groomProfile, wedding?.tradition);
      setReport(initialReport);
      setIsCalculated(true);
    }
  }, [wedding?.id, wedding?.brideName, wedding?.groomName]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateHoroscopeCompatibility(brideProfile, groomProfile, wedding?.tradition);
    setReport(result);
    setIsCalculated(true);
    setIsSaved(false);
  };

  const handleSaveToProfile = () => {
    if (!report) return;
    updateWeddingProfile({
      horoscope: {
        bride: brideProfile,
        groom: groomProfile,
        report: report,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    exportWeddingToExcel({
      wedding,
      events,
      budgetItems,
      guests,
      vendors,
      shagunRecords,
      rooms,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold mb-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-700" />
            <span>Vedic Kundali Milan & Astrological Compatibility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Couple Horoscope & Cosmic Harmony
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Discover celestial synergy, the 36 Gunas alignment (or 10-Porutham compatibility), auspicious wedding colors, and marital blessings calculated from your birth stars.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-300 hover:border-emerald-600 hover:text-emerald-800 text-stone-700 font-semibold text-xs shadow-xs transition-all"
            title="Export full wedding plan, budget, guest list & itinerary to Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Excel / Sheets</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 font-semibold text-xs shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Horoscope Report</span>
          </button>
        </div>
      </div>

      {/* Birth Details Input Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs print:hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-white shadow-xs">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 font-serif">
                Enter Birth Details for Astrological Reading
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Enter birth dates and optional birth times/places. Rashi & Nakshatra are automatically estimated or can be picked from your Janam Kundali!
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bride Card */}
            <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-rose-200/60">
                <Heart className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-rose-950 font-serif">Bride's Astrological Profile</h3>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">Bride's Full Name</label>
                <input
                  type="text"
                  required
                  value={brideProfile.name}
                  onChange={(e) => setBrideProfile({ ...brideProfile, name: e.target.value })}
                  placeholder="Bride Name"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={brideProfile.birthDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const estRashi = getEstimatedRashiFromDate(newDate);
                      const estNak = getEstimatedNakshatraFromDate(newDate);
                      setBrideProfile({
                        ...brideProfile,
                        birthDate: newDate,
                        rashi: estRashi.name,
                        nakshatra: estNak.name,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Birth Time (Optional)</label>
                  <input
                    type="text"
                    value={brideProfile.birthTime}
                    onChange={(e) => setBrideProfile({ ...brideProfile, birthTime: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">Place of Birth (City / Country)</label>
                <input
                  type="text"
                  value={brideProfile.birthPlace}
                  onChange={(e) => setBrideProfile({ ...brideProfile, birthPlace: e.target.value })}
                  placeholder="e.g. Somerset, NJ, USA or Delhi, India"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Vedic Moon Sign (Rashi)</label>
                  <select
                    value={brideProfile.rashi}
                    onChange={(e) => setBrideProfile({ ...brideProfile, rashi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                  >
                    {VEDIC_RASHIS.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.symbol} {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Birth Star (Nakshatra)</label>
                  <select
                    value={brideProfile.nakshatra}
                    onChange={(e) => setBrideProfile({ ...brideProfile, nakshatra: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium text-xs"
                  >
                    {VEDIC_NAKSHATRAS.map((n) => (
                      <option key={n.name} value={n.name}>
                        ★ {n.name} ({n.gana.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Groom Card */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-amber-200/60">
                <Sun className="w-4 h-4 text-amber-700" />
                <h3 className="font-bold text-sm text-amber-950 font-serif">Groom's Astrological Profile</h3>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">Groom's Full Name</label>
                <input
                  type="text"
                  required
                  value={groomProfile.name}
                  onChange={(e) => setGroomProfile({ ...groomProfile, name: e.target.value })}
                  placeholder="Groom Name"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={groomProfile.birthDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const estRashi = getEstimatedRashiFromDate(newDate);
                      const estNak = getEstimatedNakshatraFromDate(newDate);
                      setGroomProfile({
                        ...groomProfile,
                        birthDate: newDate,
                        rashi: estRashi.name,
                        nakshatra: estNak.name,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Birth Time (Optional)</label>
                  <input
                    type="text"
                    value={groomProfile.birthTime}
                    onChange={(e) => setGroomProfile({ ...groomProfile, birthTime: e.target.value })}
                    placeholder="e.g. 08:15 AM"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1 text-xs">Place of Birth (City / Country)</label>
                <input
                  type="text"
                  value={groomProfile.birthPlace}
                  onChange={(e) => setGroomProfile({ ...groomProfile, birthPlace: e.target.value })}
                  placeholder="e.g. New York, NY, USA or Ahmedabad, India"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Vedic Moon Sign (Rashi)</label>
                  <select
                    value={groomProfile.rashi}
                    onChange={(e) => setGroomProfile({ ...groomProfile, rashi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                  >
                    {VEDIC_RASHIS.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.symbol} {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Birth Star (Nakshatra)</label>
                  <select
                    value={groomProfile.nakshatra}
                    onChange={(e) => setGroomProfile({ ...groomProfile, nakshatra: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium text-xs"
                  >
                    {VEDIC_NAKSHATRAS.map((n) => (
                      <option key={n.name} value={n.name}>
                        ★ {n.name} ({n.gana.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-stone-500">
              ⚡ Instant calculation based on Parashara Vedic Jyotish principles & Moon Nakshatras
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 via-rose-700 to-amber-700 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Celestial Horoscope Reading</span>
            </button>
          </div>
        </form>
      </div>

      {/* HOROSCOPE READING REPORT */}
      {isCalculated && report && (
        <div className="space-y-6 animate-in fade-in duration-300 print:space-y-4">
          {/* Main Celestial Score Banner */}
          <div className="bg-gradient-to-br from-stone-950 via-purple-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                  <Star className="w-3.5 h-3.5" />
                  <span>{report.verdict}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
                  {report.archetype.title}
                </h2>

                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  {report.archetype.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-300">
                  <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 font-semibold text-amber-200">
                    Bride: {brideProfile.name} • {brideProfile.rashi} • {brideProfile.nakshatra}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 font-semibold text-amber-200">
                    Groom: {groomProfile.name} • {groomProfile.rashi} • {groomProfile.nakshatra}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-purple-900/60 border border-purple-700 text-purple-200 font-medium">
                    {report.archetype.elementalBlend}
                  </span>
                </div>
              </div>

              {/* Glowing Gunas Score Radial Dial */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shrink-0 text-center min-w-[190px]">
                <div className="text-4xl sm:text-5xl font-black font-serif text-amber-300 tracking-tight">
                  {report.score} <span className="text-xl font-normal text-stone-400">/ 36</span>
                </div>
                <div className="text-xs font-bold text-stone-300 mt-1 uppercase tracking-wider">
                  Ashta Koota Gunas
                </div>
                <div className="mt-2 text-[11px] font-semibold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40">
                  {report.percentage}% Celestial Match
                </div>
                <button
                  type="button"
                  onClick={handleSaveToProfile}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all shadow-xs print:hidden"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                  <span>{isSaved ? 'Saved to Profile!' : 'Save to Wedding'}</span>
                </button>
              </div>
            </div>

            {/* Celestial stars background ambient flair */}
            <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 to-transparent pointer-events-none opacity-60" />
          </div>

          {/* Detailed Astrology Tabs (Ashta Koota vs Dasa Porutham vs Lucky Elements) */}
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3 print:hidden overflow-x-auto">
            <button
              onClick={() => setActiveTab('ashta_koota')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'ashta_koota'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>36 Ashta Koota Gunas Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('dasa_porutham')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'dasa_porutham'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
              }`}
            >
              <Award className="w-4 h-4 text-rose-400" />
              <span>South Indian 10-Dasa Porutham</span>
            </button>

            <button
              onClick={() => setActiveTab('lucky_elements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'lucky_elements'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Auspicious Colors & Blessings</span>
            </button>
          </div>

          {/* TAB 1: 36 ASHTA KOOTA PILLARS BREAKDOWN */}
          {(activeTab === 'ashta_koota' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeTab !== 'ashta_koota' ? 'hidden print:block' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    8 Ashta Koota Compatibility Pillars (Total 36 Points)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Vedic astrological evaluation of spiritual alignment, mental friendship, physical compatibility, and biological resonance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.pillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-purple-300 shadow-2xs space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-900 font-bold text-xs flex items-center justify-center border border-purple-200">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900">{pillar.name}</h4>
                          <span className="text-[10px] text-purple-800 font-medium">
                            {pillar.sanskritName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm text-stone-900">
                          {pillar.score} <span className="text-[11px] font-normal text-stone-500">/ {pillar.maxScore} pts</span>
                        </span>
                        <div className="text-[10px] font-semibold text-emerald-700">{pillar.verdict}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-rose-600 h-1.5 rounded-full"
                        style={{ width: `${Math.round((pillar.score / pillar.maxScore) * 100)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-stone-600 leading-snug pt-0.5">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SOUTH INDIAN 10-DASA PORUTHAM */}
          {(activeTab === 'dasa_porutham' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeTab !== 'dasa_porutham' ? 'hidden print:block' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    South Indian 10-Porutham Astrological Alignment (Dasa Porutham)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Traditional South Indian star-matching matrix based on the Bride and Groom's Janma Nakshatras.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
                  <div className="divide-y divide-stone-100">
                    {report.poruthams?.slice(0, 5).map((p, idx) => (
                      <div key={idx} className="p-3.5 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-stone-900">{p.name}</div>
                          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{p.description}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shrink-0">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-stone-100">
                    {report.poruthams?.slice(5, 10).map((p, idx) => (
                      <div key={idx} className="p-3.5 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-xs text-stone-900">{p.name}</div>
                          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{p.description}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shrink-0">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUSPICIOUS COLORS, DEITY BLESSINGS & REMEDIES */}
          {(activeTab === 'lucky_elements' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeTab !== 'lucky_elements' ? 'hidden print:block' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Lucky Colors */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                      Auspicious Wedding Colors
                    </h4>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {report.luckyElements.colors.map((c, i) => (
                      <div
                        key={i}
                        className="text-xs text-stone-800 font-medium flex items-center gap-2 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auspicious Gemstones & Days */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-600" />
                    <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                      Favorable Weekdays & Metals
                    </h4>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {report.luckyElements.auspiciousDays.map((d, i) => (
                      <div
                        key={i}
                        className="text-xs text-stone-800 font-medium flex items-center gap-2 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-100"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                    <div className="text-[11px] text-stone-500 pt-1 leading-snug">
                      Touches of Yellow Gold, Natural Pearl, and Yellow Sapphire attract Brihaspati & Shukra blessings.
                    </div>
                  </div>
                </div>

                {/* Planetary Deities & Flora */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider">
                      Sacred Flora & Deities
                    </h4>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 leading-snug">
                    {report.luckyElements.planetaryDeity}
                  </p>
                  <div className="space-y-1 pt-1 text-[11px] text-stone-600">
                    <p>
                      <strong>Flora:</strong> {report.luckyElements.sacredFlora.join(', ')}
                    </p>
                    <p className="italic text-purple-900 pt-1 font-serif text-xs">
                      {report.luckyElements.mantraOrBlessing}
                    </p>
                  </div>
                </div>
              </div>

              {/* Relationship Strengths & Practical Astrological Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-xs text-emerald-950 uppercase tracking-wider font-sans">
                      Core Relationship Strengths
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-900 leading-relaxed list-disc list-inside">
                    {report.relationshipStrengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider font-sans">
                      Auspicious Guidance & Remedies
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900 leading-relaxed list-disc list-inside">
                    {report.remediesAndAdvice.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
