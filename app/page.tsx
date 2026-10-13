'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Users,
  WalletCards,
  Briefcase,
  Gift,
  Hotel,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  CloudUpload,
} from 'lucide-react';
import { useWedding } from '@/lib/store';

export default function LandingPage() {
  const { wedding } = useWedding();

  const features = [
    {
      icon: CalendarDays,
      title: 'Multi-Event Itinerary & Muhurat',
      desc: 'Dedicated run-of-show for Mehendi, Haldi, Sangeet, Pheras & Reception with auspicious muhurat highlights and dress codes.',
      color: 'from-amber-500 to-rose-600',
    },
    {
      icon: Users,
      title: 'Guest List & Side Tagging',
      desc: 'Filter by Ladkewale (Groom) vs Ladkiwale (Bride), track Jain/Strict Veg dietary restrictions, and manage ceremony RSVPs.',
      color: 'from-rose-600 to-pink-600',
    },
    {
      icon: WalletCards,
      title: 'Family Budget & Expense Split',
      desc: 'Clear accounting across bride side, groom side, and 50-50 shared vendor payments with advance & balance tracking.',
      color: 'from-amber-600 to-yellow-600',
    },
    {
      icon: Briefcase,
      title: 'Vendor Hub & Contracts',
      desc: 'Centralized CRM for Pandit Ji (samagri lists), bridal mehndi artists, makeup stylists, photographers, and DJs.',
      color: 'from-purple-600 to-indigo-600',
    },
    {
      icon: Gift,
      title: 'Shagun & Lifafa (Gift) Ledger',
      desc: 'Log cash envelopes, gold/silver coins, past reciprocity records ("They gave $501 in 2023"), and thank-you dispatches.',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      icon: Hotel,
      title: 'Hotel Rooms & Transit Logistics',
      desc: 'Room allocation matrix with family assignments, capacity limits, and airport/railway pickup tracking.',
      color: 'from-blue-600 to-cyan-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 selection:bg-rose-200">
      {/* Top Auspicious Ribbon */}
      <div className="bg-gradient-to-r from-amber-700 via-rose-900 to-amber-800 text-amber-100 py-2 px-4 text-center text-xs font-serif tracking-widest uppercase">
        ॥ मंगलम् भगवान विष्णुः मंगलम् गरुडध्वजः • मंगलम् पुण्डरीकाक्षः मंगलाय तनो हरिः ॥
      </div>

      {/* Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-amber-300 flex items-center justify-center shadow-lg shadow-rose-900/20">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl text-stone-900 tracking-wide font-serif">
              ShaadiSutra
            </span>
            <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-widest">
              Indian Wedding Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {wedding.isConfigured && wedding.slug && (
            <Link
              href={`/invite/${wedding.slug}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:text-rose-700 hover:bg-stone-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Guest E-Invite</span>
            </Link>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-rose-900/20 transition-all"
          >
            <span>Open Planner Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Culturally Crafted for Multi-Day Indian Weddings</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold font-serif text-stone-900 tracking-tight leading-tight">
          Where Traditional Grandeur Meets Modern Logistics
        </h1>

        <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          From Mehendi song cues and Pandit ji's samagri to Ladkewale vs Ladkiwale guest management, 
          side-wise budget splits, and Shagun lifafas — everything you need to pull off a dream wedding.
        </p>

        {/* Dual Mode Entry Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 text-white font-bold text-sm shadow-xl shadow-rose-900/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Planner Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          {wedding.isConfigured && wedding.slug ? (
            <Link
              href={`/invite/${wedding.slug}`}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-stone-300 text-stone-800 font-bold text-sm shadow-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>View Guest Website & RSVP</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-stone-300 text-stone-800 font-bold text-sm shadow-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Start Clean Wedding Plan</span>
            </Link>
          )}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 font-serif">
            Comprehensive Suite
          </span>
          <h2 className="text-3xl font-bold font-serif text-stone-900">
            Everything an Indian Wedding Needs
          </h2>
          <p className="text-xs text-stone-500 max-w-lg mx-auto">
            Engineered around traditional rituals, extended family hierarchies, and celebration scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white p-7 rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white shadow-md shadow-amber-900/10 mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-stone-900 font-serif">{f.title}</h3>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Deployment & Tech Architecture Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-stone-200">
        <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-serif">
              Production Ready
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Deploy Instantly to Vercel with Firebase Backend
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              This app is pre-configured for one-command Git deployments on Vercel. 
              It runs in full local demo mode by default and immediately syncs with your Google Firebase Cloud Firestore 
              as soon as you supply your project credentials.
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Next.js 14 App Router + Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Firebase Auth & Cloud Firestore ready</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Vercel Edge Network Optimized</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-800/80 border border-stone-700">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero backend config needed for preview</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-semibold text-xs shadow-lg hover:opacity-95 transition-all inline-flex items-center gap-2"
              >
                <span>Explore App Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-500">
        <p className="font-serif font-semibold text-stone-700">
          ShaadiSutra — Indian Wedding Planning Platform
        </p>
        <p className="mt-1">Deployable to Vercel via Git push • Backed by Google Cloud Firebase</p>
      </footer>
    </div>
  );
}
