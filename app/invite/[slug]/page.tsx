'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Heart,
  CheckCircle2,
  Navigation,
  Send,
  HelpCircle,
  Phone,
} from 'lucide-react';

export default function PublicWeddingInvitePage({
  params,
}: {
  params: { slug: string };
}) {
  const { wedding, events, addGuest } = useWedding();
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  // RSVP Form State
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    phone: '',
    side: 'bride' as 'bride' | 'groom' | 'mutual',
    adultsCount: 2,
    kidsCount: 0,
    dietaryPreference: 'Strict Veg' as any,
    city: '',
    notes: '',
    attendingEvents: events.reduce((acc, ev) => ({ ...acc, [ev.id]: true }), {} as Record<string, boolean>),
  });

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventRsvps: Record<string, any> = {};
    events.forEach((ev) => {
      eventRsvps[ev.id] = rsvpForm.attendingEvents[ev.id] ? 'attending' : 'declined';
    });

    addGuest({
      name: rsvpForm.name,
      phone: rsvpForm.phone,
      side: rsvpForm.side,
      familyGroup: `${rsvpForm.name}'s Family`,
      adultsCount: rsvpForm.adultsCount,
      kidsCount: rsvpForm.kidsCount,
      dietaryPreference: rsvpForm.dietaryPreference,
      city: rsvpForm.city || 'Guest City',
      needsPickup: false,
      notes: rsvpForm.notes,
      eventRsvps,
    });

    setRsvpSubmitted(true);
  };

  if (!wedding || !wedding.isConfigured || !wedding.brideName) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl border border-stone-200 shadow-xl max-w-md w-full space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">No Wedding Published Yet</h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            This wedding celebration link has not been set up or published yet. Please configure your wedding profile in the dashboard to generate your interactive guest invitation and RSVP.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95 transition-all w-full"
          >
            <span>Open Planner Dashboard</span>
          </a>
        </div>
      </div>
    );
  }

  // Countdown calculation
  const calculateDaysLeft = () => {
    if (!wedding.startDate) return 0;
    const target = new Date(wedding.startDate).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = calculateDaysLeft();


  return (
    <div className="min-h-screen bg-[#FAF6F0] text-stone-800 font-sans selection:bg-rose-200">
      {/* Top Auspicious Sloka / Shubh Vivah Tagline */}
      <div className="bg-gradient-to-r from-amber-700 via-rose-900 to-amber-800 text-amber-100 py-2.5 px-4 text-center text-xs font-serif tracking-widest uppercase border-b border-amber-600/30">
        ॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ • निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥
      </div>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-20 px-6 sm:px-12 text-center bg-radial from-rose-950 via-stone-950 to-stone-900 text-white border-b-4 border-amber-500/60 shadow-2xl">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Join Our Celebration • {wedding.hashtag}</span>
          </div>

          <p className="text-amber-200 text-xs uppercase tracking-widest font-serif">
            With the blessings of our parents & families, we invite you to celebrate
          </p>

          <h1 className="text-4xl sm:text-6xl font-bold font-serif text-amber-100 tracking-tight leading-tight">
            {wedding.brideName}
            <span className="text-rose-400 block text-2xl sm:text-3xl my-2 font-light italic font-serif">
              — weds —
            </span>
            {wedding.groomName}
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed italic">
            "{wedding.story}"
          </p>

          {/* Location & Dates */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4 text-xs font-medium text-amber-200">
            {wedding.startDate && wedding.startDate.trim() !== '' ? (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xs border border-white/10">
                <Calendar className="w-4 h-4 text-amber-400" />
                {new Date(wedding.startDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {wedding.endDate && wedding.endDate !== wedding.startDate && (
                  <>
                    {' – '}
                    {new Date(wedding.endDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </>
                )}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xs border border-white/10">
                <Calendar className="w-4 h-4 text-amber-400" />
                Dates to be Announced (Venue Scout in Progress)
              </span>
            )}
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xs border border-white/10">
              <MapPin className="w-4 h-4 text-rose-400" />
              {wedding.venueName}, {wedding.city}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="pt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200">
            <span className="text-2xl font-bold text-amber-300 font-serif">{daysLeft}</span>
            <span className="text-xs uppercase tracking-wider text-stone-300 font-medium">
              Days until Shubh Vivah
            </span>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      </section>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        {/* Section 1: Detailed Ceremony Schedule */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700 font-serif">
              Rituals & Festivities
            </span>
            <h2 className="text-3xl font-bold font-serif text-stone-900">Wedding Itinerary</h2>
            <p className="text-xs text-stone-500 max-w-lg mx-auto">
              Each ceremony carries timeless traditions, joyous music, and rich heritage. Please review timings and dress themes below.
            </p>
          </div>

          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-900">Ceremony Details Coming Soon</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  The couple is finalizing the ceremony schedule and vows timings. Please check back shortly or submit your general RSVP below!
                </p>
              </div>
            ) : (
              events.map((ev, index) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl border border-stone-200/80 shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className={`p-6 sm:p-8 bg-gradient-to-r ${ev.bannerGradient} text-white`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                        Ceremony {index + 1}: {ev.type.toUpperCase()}
                      </span>
                      {ev.muhuratTime && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-stone-950 shadow-sm">
                          ✨ Main Ceremony Vows Window: {ev.muhuratTime}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold font-serif">{ev.name}</h3>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    <p className="text-sm text-stone-600 leading-relaxed">{ev.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-stone-900 font-semibold mb-0.5">
                            Date & Timing
                          </strong>
                          <span className="text-stone-600 block">
                            {new Date(ev.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="font-bold text-amber-900 block mt-0.5">
                            {ev.startTime} – {ev.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-stone-900 font-semibold mb-0.5">
                            Venue & Address
                          </strong>
                          <span className="font-bold text-stone-800 block">{ev.venueName}</span>
                          <span className="text-stone-500 block truncate">{ev.venueAddress}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dress Code Highlight */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100/60 to-rose-100/60 border border-amber-200 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 block">
                          👗 Dress Code & Color Palette
                        </span>
                        <span className="text-xs font-semibold text-stone-800 mt-0.5 block">
                          {ev.dressCode}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Section 2: Guest RSVP Form */}
        <section id="rsvp" className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-700 font-serif">
                Will You Join Us?
              </span>
              <h2 className="text-3xl font-bold font-serif text-stone-900">
                Confirm Your Presence & RSVP
              </h2>
              <p className="text-xs text-stone-500">
                Please let us know if your family can make it so we can arrange your warm hospitality and delicious feasts.
              </p>
            </div>

            {rsvpSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif text-emerald-900">
                  Dhanyawaad! Your RSVP has been received
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  We are overjoyed to celebrate our special day with you! Our wedding team has noted your headcount and dietary preferences.
                </p>
                <button
                  onClick={() => setRsvpSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  Edit or Submit Another Response
                </button>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-5 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Your Full Name / Family Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={rsvpForm.name}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, name: e.target.value })}
                    placeholder="e.g. Vikram & Neha Singhania"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      WhatsApp / Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={rsvpForm.phone}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, phone: e.target.value })}
                      placeholder="(555) 234-5678"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Connection / Side *
                    </label>
                    <select
                      value={rsvpForm.side}
                      onChange={(e) => setRsvpForm({ ...rsvpForm, side: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="bride">Bride's Side (Ladkiwale)</option>
                      <option value="groom">Groom's Side (Ladkewale)</option>
                      <option value="mutual">Mutual Friends & Colleagues</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Adults Count *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={rsvpForm.adultsCount}
                      onChange={(e) =>
                        setRsvpForm({ ...rsvpForm, adultsCount: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Children (Under 12)</label>
                    <input
                      type="number"
                      min={0}
                      value={rsvpForm.kidsCount}
                      onChange={(e) =>
                        setRsvpForm({ ...rsvpForm, kidsCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Dietary Requirement *
                    </label>
                    <select
                      value={rsvpForm.dietaryPreference}
                      onChange={(e) =>
                        setRsvpForm({ ...rsvpForm, dietaryPreference: e.target.value as any })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="Strict Veg">Strict Vegetarian</option>
                      <option value="Jain">Jain (No Root Veg / Onion / Garlic)</option>
                      <option value="Swaminarayan">Swaminarayan</option>
                      <option value="Non-Veg">Non-Vegetarian</option>
                      <option value="Halal">Halal</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                    </select>
                  </div>
                </div>

                {/* Sub-Event checkboxes */}
                {events.length > 0 && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="font-bold text-stone-800 block text-xs">
                      Which ceremonies will you be attending?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {events.map((ev) => (
                        <label
                          key={ev.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white border border-stone-200 cursor-pointer hover:border-rose-400 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={rsvpForm.attendingEvents[ev.id] ?? true}
                            onChange={(e) =>
                              setRsvpForm({
                                ...rsvpForm,
                                attendingEvents: {
                                  ...rsvpForm.attendingEvents,
                                  [ev.id]: e.target.checked,
                                },
                              })
                            }
                            className="rounded-sm border-stone-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span className="font-medium text-stone-800 text-[11px] truncate">
                            {ev.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Warm Blessings / Notes for the Couple
                  </label>
                  <textarea
                    rows={2}
                    value={rsvpForm.notes}
                    onChange={(e) => setRsvpForm({ ...rsvpForm, notes: e.target.value })}
                    placeholder="Share any special travel details or heartfelt wishes..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 text-white font-bold text-sm shadow-lg shadow-rose-900/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit RSVP Response</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Section 3: Guest FAQs & Travel Help */}
        <section className="bg-stone-100 rounded-3xl p-8 sm:p-10 border border-stone-200 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Guest Assistance & Travel Information
            </h3>
            <p className="text-xs text-stone-500">
              Frequently asked questions for your stay in {wedding.city}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">
                ☀️ Weather & Attire Guide
              </span>
              <p className="text-stone-600 leading-relaxed">
                Ceremonies will take place across climate-controlled ballrooms and scenic mandap settings. Formal Indian ethnic wear (lehengas, sherwanis, sarees, kurtas) or formal evening wear is warmly recommended.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">
                🚗 Travel, Parking & Airport Access
              </span>
              <p className="text-stone-600 leading-relaxed">
                Complimentary parking and valet are arranged at the venue. Out-of-town guests arriving via major airport hubs can contact the wedding hospitality coordinators for shuttle transfers.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-300 py-8 text-center text-xs text-stone-500 space-y-2">
        <p className="font-serif font-semibold text-stone-700">
          {wedding.hashtag} • Shubh Vivah {wedding.startDate ? new Date(wedding.startDate).getFullYear() : ''}
        </p>
        <p>Built with love using Vivaah</p>
      </footer>
    </div>
  );
}
