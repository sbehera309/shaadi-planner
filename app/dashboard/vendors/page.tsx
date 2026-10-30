'use client';

import React, { useState, useMemo } from 'react';
import { useWedding } from '@/lib/store';
import { Vendor, CuratedVendor } from '@/lib/types';
import { PRELOADED_CURATED_VENDORS } from '@/lib/preloadedVendors';
import { Modal } from '@/components/Modal';
import {
  Briefcase,
  Plus,
  Phone,
  Mail,
  Globe,
  Instagram,
  CheckCircle2,
  Trash2,
  Edit2,
  DollarSign,
  Search,
  Sparkles,
  ShieldCheck,
  Building,
  Info,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  Award,
  Filter,
  Check,
} from 'lucide-react';

const CATEGORY_TABS: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'All' },
  { label: 'Catering & Sweets', value: 'Catering' },
  { label: 'Mandap & Decor', value: 'Mandap & Floral Decorator' },
  { label: 'DJ, MC & Production', value: 'Choreographer & DJ' },
  { label: 'Lighting & AV', value: 'Lighting & AV Production' },
  { label: 'Photo & Cinema', value: 'Photographer & Cinematographer' },
  { label: 'Bridal MUA & Hair', value: 'Bridal MUA & Hair' },
  { label: 'Mehendi Artist', value: 'Mehendi Artist' },
  { label: 'Pandit Ji / Priest', value: 'Pandit Ji' },
];

const REGION_OPTIONS = ['All', 'NJ', 'NY', 'PA', 'CT', 'DE'] as const;

export default function VendorsPage() {
  const { wedding, vendors, addVendor, updateVendor, deleteVendor } = useWedding();
  const [activeTab, setActiveTab] = useState<'directory' | 'my_vendors'>('directory');

  // Directory Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc'>('recommended');

  // Inspection Drawer / Modal
  const [inspectingVendor, setInspectingVendor] = useState<CuratedVendor | null>(null);

  // Form State for User's Vendor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pandit Ji' as Vendor['category'],
    contactPerson: '',
    phone: '',
    email: '',
    agreedAmount: 50000,
    depositPaid: 10000,
    status: 'confirmed' as Vendor['status'],
    notes: '',
    deliverablesString: '',
  });

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Pandit Ji',
      contactPerson: '',
      phone: '',
      email: '',
      agreedAmount: 15000,
      depositPaid: 5000,
      status: 'negotiating',
      notes: '',
      deliverablesString: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactPerson: vendor.contactPerson,
      phone: vendor.phone,
      email: vendor.email || '',
      agreedAmount: vendor.agreedAmount,
      depositPaid: vendor.depositPaid,
      status: vendor.status,
      notes: vendor.notes,
      deliverablesString: vendor.deliverables.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleAddFromCurated = (curated: CuratedVendor) => {
    setEditingVendor(null);
    // Estimate sensible dollar amount: if per-guest, calculate for typical 250 guest count
    const estimatedAmount =
      curated.priceUnit === 'per_guest'
        ? curated.typicalPackagePrice * 250
        : curated.typicalPackagePrice;

    setFormData({
      name: curated.name,
      category: curated.category,
      contactPerson: curated.contactPerson || curated.name,
      phone: curated.contactPhone,
      email: curated.contactEmail,
      agreedAmount: estimatedAmount,
      depositPaid: 0,
      status: 'negotiating',
      notes: `${curated.tagline}\nLocation: ${curated.baseLocation}\nTypical Rate: ${curated.pricingHeadline}\nApproved: ${curated.estateApprovedVenues.join(', ')}`,
      deliverablesString: curated.inclusions.slice(0, 4).join(', '),
    });
    setInspectingVendor(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deliverables = formData.deliverablesString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      category: formData.category,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      agreedAmount: formData.agreedAmount,
      depositPaid: formData.depositPaid,
      status: formData.status,
      notes: formData.notes,
      deliverables,
    };

    if (editingVendor) {
      updateVendor(editingVendor.id, payload);
    } else {
      addVendor(payload);
    }
    setIsModalOpen(false);
  };

  const formatCurr = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wedding?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter & Sort Curated Directory
  const filteredVendors = useMemo(() => {
    return PRELOADED_CURATED_VENDORS.filter((v) => {
      // Category Filter
      if (selectedCategory !== 'All' && v.category !== selectedCategory) {
        return false;
      }
      // Region Filter
      if (selectedRegion !== 'All' && !v.serviceRegions.includes(selectedRegion as any)) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q);
        const matchesTagline = v.tagline.toLowerCase().includes(q);
        const matchesLocation = v.baseLocation.toLowerCase().includes(q);
        const matchesSpecialties = v.desiSpecialties.some((s) => s.toLowerCase().includes(q));
        const matchesEstates = v.estateApprovedVenues.some((e) => e.toLowerCase().includes(q));
        const matchesReview = v.curatorReviewAndVerdict.toLowerCase().includes(q);
        if (!matchesName && !matchesTagline && !matchesLocation && !matchesSpecialties && !matchesEstates && !matchesReview) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') {
        return a.typicalPackagePrice - b.typicalPackagePrice;
      }
      if (sortBy === 'price_desc') {
        return b.typicalPackagePrice - a.typicalPackagePrice;
      }
      return 0; // default order
    });
  }, [selectedCategory, selectedRegion, searchQuery, sortBy]);

  // Aggregate stats for user's personal vendors
  const totalAgreed = vendors.reduce((sum, v) => sum + v.agreedAmount, 0);
  const totalDeposits = vendors.reduce((sum, v) => sum + v.depositPaid, 0);
  const totalBalanceDue = totalAgreed - totalDeposits;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              Desi Wedding Vendor Intelligence & Contracts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              NJ • NY • PA Tri-State
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Researched historical rates, package breakdowns, estate credentials, and contract negotiation data for premier South Asian wedding professionals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-900/20 hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Vendor</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-stone-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 tap-button active:scale-95 flex items-center justify-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore Curated Vendors Directory ({PRELOADED_CURATED_VENDORS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('my_vendors')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-150 tap-button active:scale-95 flex items-center justify-center gap-2 ${
            activeTab === 'my_vendors'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Booked & Shortlisted Vendors ({vendors.length})</span>
          {vendors.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'my_vendors' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
            }`}>
              {formatCurr(totalAgreed)}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CURATED VENDORS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Intelligence Highlights Box */}
          <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-stone-900 font-serif">
                  Tri-State South Asian Wedding Pricing Benchmark
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  These figures reflect real historical contract quotes from couples married at premier Tri-State estates (such as The Rockleigh, Legacy Castle, Crystal Plaza, and The Grove). Use them to avoid being overcharged, discover hidden fees (like outside catering estate royalties or late-night teardown strikes), and leverage insider negotiation tactics.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Controls Bar */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === tab.value
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Second row: Search & Region & Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-stone-100">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vendor name, specialty (e.g. Tandoor, Drone), or venue (e.g. Rockleigh)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Region Selector */}
              <div className="sm:col-span-3 flex items-center gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase px-2">Region:</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-stone-800 focus:outline-hidden"
                >
                  {REGION_OPTIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg === 'All' ? 'All Regions' : `${reg} Tri-State`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Selector */}
              <div className="sm:col-span-3 flex items-center gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase px-2">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-transparent text-xs font-semibold text-stone-800 focus:outline-hidden"
                >
                  <option value="recommended">Featured / Renowned</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vendors Grid */}
          {filteredVendors.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
              <Search className="w-8 h-8 text-stone-300 mx-auto" />
              <h3 className="text-sm font-bold text-stone-700">No matching vendors found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try clearing your search query or switching category filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedRegion('All');
                  setSearchQuery('');
                }}
                className="px-4 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between interactive-card"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                          {vendor.category}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          📍 {vendor.baseLocation}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {vendor.priceTier}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap">
                        Services: {vendor.serviceRegions.join(', ')}
                      </span>
                    </div>

                    {/* Name & Tagline */}
                    <div className="mt-2.5">
                      <h3 className="text-lg font-bold text-stone-900 font-serif">
                        {vendor.name}
                      </h3>
                      <p className="text-xs text-amber-800 font-medium mt-0.5 line-clamp-1">
                        {vendor.tagline}
                      </p>
                    </div>

                    {/* Prominent Pricing Banner */}
                    <div className="mt-3.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          Historical Pricing Rate
                        </div>
                        <div className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">
                          {vendor.pricingHeadline}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-stone-400 uppercase tracking-wider">Starting at</div>
                        <div className="text-xs font-bold text-amber-700">
                          {vendor.priceUnit === 'per_guest' ? `$${vendor.priceStartingAt}/guest` : `$${vendor.priceStartingAt.toLocaleString()}`}
                        </div>
                      </div>
                    </div>

                    {/* Specialties Pills */}
                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Desi Specialties
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {vendor.desiSpecialties.map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium"
                          >
                            • {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Estate Credentials */}
                    {vendor.estateApprovedVenues.length > 0 && (
                      <div className="mt-3 text-[11px] text-stone-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-1 font-semibold text-amber-900 mb-1">
                          <Building className="w-3.5 h-3.5" />
                          <span>Approved / Regular at:</span>
                        </div>
                        <p className="line-clamp-2 text-stone-700">
                          {vendor.estateApprovedVenues.join(' • ')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => setInspectingVendor(vendor)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-stone-500" />
                      <span>Rates & Fine Print</span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    </button>

                    <button
                      onClick={() => handleAddFromCurated(vendor)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to My Vendors</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY BOOKED & SHORTLISTED VENDORS */}
      {/* ========================================================================= */}
      {activeTab === 'my_vendors' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Summary Stat Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs interactive-card">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Total Committed Contracts
              </div>
              <div className="text-xl font-bold font-serif text-stone-900 mt-1">
                {formatCurr(totalAgreed)}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">Across {vendors.length} vendors</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs interactive-card">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Deposits Paid
              </div>
              <div className="text-xl font-bold font-serif text-emerald-700 mt-1">
                {formatCurr(totalDeposits)}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {totalAgreed > 0 ? `${Math.round((totalDeposits / totalAgreed) * 100)}% secured` : 'No deposits logged'}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs interactive-card">
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                Remaining Balance Due
              </div>
              <div className="text-xl font-bold font-serif text-rose-700 mt-1">
                {formatCurr(totalBalanceDue)}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">Due before wedding days</div>
            </div>
          </div>

          {/* Vendor Cards Grid */}
          {vendors.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center space-y-3">
              <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 font-serif">No personal vendors added yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore our curated Tri-State directory to add pre-vetted vendors, or manually add your own caterer, decorator, DJ, or pandit ji.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('directory')}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm"
                >
                  🧭 Explore Curated Directory
                </button>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs"
                >
                  + Add Custom Vendor
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vendors.map((vendor) => {
                const balance = vendor.agreedAmount - vendor.depositPaid;
                const statusColors = {
                  confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  negotiating: 'bg-amber-50 text-amber-800 border-amber-200',
                  contacted: 'bg-blue-50 text-blue-800 border-blue-200',
                  completed: 'bg-stone-100 text-stone-700 border-stone-300',
                }[vendor.status] || 'bg-stone-100 text-stone-700 border-stone-300';

                return (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between interactive-card"
                  >
                    <div>
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                              {vendor.category}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColors}`}>
                              {vendor.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 mt-2 font-serif">
                            {vendor.name}
                          </h3>
                          <p className="text-xs text-stone-500">Contact: {vendor.contactPerson}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(vendor)}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Vendor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${vendor.name}"?`)) deleteVendor(vendor.id);
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Vendor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Notes */}
                      {vendor.notes && (
                        <p className="mt-3 text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100 whitespace-pre-line">
                          {vendor.notes}
                        </p>
                      )}

                      {/* Deliverables Checklist */}
                      {vendor.deliverables.length > 0 && (
                        <div className="mt-4">
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                            Key Deliverables
                          </span>
                          <ul className="space-y-1">
                            {vendor.deliverables.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-stone-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Bottom Financial & Action Row */}
                    <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-stone-500 text-[11px]">Contract / Balance Due</div>
                        <div className="font-bold text-stone-900">
                          {formatCurr(vendor.agreedAmount)}{' '}
                          <span className="text-rose-700 font-normal">
                            (Due: {formatCurr(balance)})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {vendor.phone && (
                          <a
                            href={`tel:${vendor.phone}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-600" />
                            <span>{vendor.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED HISTORICAL PRICING INSPECTION MODAL */}
      {/* ========================================================================= */}
      {inspectingVendor && (
        <Modal
          isOpen={!!inspectingVendor}
          onClose={() => setInspectingVendor(null)}
          title={inspectingVendor.name}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs text-stone-800 max-h-[75vh] overflow-y-auto pr-1">
            {/* Top Identity Block */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                  {inspectingVendor.category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white text-stone-700 border border-stone-200">
                  📍 {inspectingVendor.baseLocation}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900">
                  Tier: {inspectingVendor.priceTier}
                </span>
              </div>
              <p className="text-xs text-amber-900 font-semibold">{inspectingVendor.tagline}</p>
              <div className="text-base font-bold text-stone-900 font-serif pt-1">
                {inspectingVendor.pricingHeadline}
              </div>
            </div>

            {/* Historical Pricing Line Items Table */}
            <div>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-700" />
                <span>Historical Rates & Package Tiers</span>
              </h4>
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200">
                {inspectingVendor.historicalPricingBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white hover:bg-stone-50/80 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-stone-900">{item.tierOrItem}</div>
                      <div className="font-bold text-amber-700 font-mono shrink-0">{item.rate}</div>
                    </div>
                    <div className="text-stone-600 mt-1 text-[11px] leading-relaxed">{item.details}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fine Print & Hidden Fees to Watch Out For */}
            {inspectingVendor.hiddenFeesAndFinePrint.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Fine Print, Surcharges & Hidden Fees</span>
                </div>
                <ul className="space-y-1 text-stone-700">
                  {inspectingVendor.hiddenFeesAndFinePrint.map((fee, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{fee}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What is Included in Standard Package */}
            <div>
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What's Typically Included</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inspectingVendor.inclusions.map((inc, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-stone-700">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved Estates */}
            {inspectingVendor.estateApprovedVenues.length > 0 && (
              <div>
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-stone-700" />
                  <span>Approved at Top Tri-State Estates</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingVendor.estateApprovedVenues.map((est, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-[11px] font-medium border border-stone-200"
                    >
                      🏛 {est}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Curator Review & Verdict */}
            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 space-y-1">
              <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Curator's Insider Verdict</span>
              </div>
              <p className="text-stone-700 text-[11px] leading-relaxed">
                {inspectingVendor.curatorReviewAndVerdict}
              </p>
            </div>

            {/* Insider Negotiation Tips */}
            {inspectingVendor.negotiationTips.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  <span>How to Negotiate & Save Money with This Vendor</span>
                </div>
                <ul className="space-y-1 text-stone-800">
                  {inspectingVendor.negotiationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-emerald-700 font-bold">💡</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Direct Contact Options */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              {inspectingVendor.contactPhone && (
                <a
                  href={`tel:${inspectingVendor.contactPhone}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-stone-600" />
                  <span>{inspectingVendor.contactPhone}</span>
                </a>
              )}
              {inspectingVendor.contactEmail && (
                <a
                  href={`mailto:${inspectingVendor.contactEmail}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium"
                >
                  <Mail className="w-3.5 h-3.5 text-stone-600" />
                  <span>{inspectingVendor.contactEmail}</span>
                </a>
              )}
              {inspectingVendor.websiteUrl && (
                <a
                  href={inspectingVendor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium"
                >
                  <Globe className="w-3.5 h-3.5 text-stone-600" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              )}
              {inspectingVendor.instagramHandle && (
                <span className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700 font-medium">
                  📷 {inspectingVendor.instagramHandle}
                </span>
              )}
            </div>

            {/* Modal Bottom Action Button */}
            <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setInspectingVendor(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleAddFromCurated(inspectingVendor)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 hover:opacity-95 text-white font-semibold shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add to My Vendors & Customize Quote</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT VENDOR MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? 'Edit Vendor Details' : 'Add Wedding Professional / Vendor'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1">Company / Studio / Pandit Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Moghul Caterers or Nirali Decor"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="Catering">Catering & Sweet Halwai</option>
                <option value="Mandap & Floral Decorator">Mandap & Floral Decorator</option>
                <option value="Choreographer & DJ">Choreographer, Dhol & DJ</option>
                <option value="Lighting & AV Production">Lighting & AV Production</option>
                <option value="Photographer & Cinematographer">Photographer & Cinematographer</option>
                <option value="Bridal MUA & Hair">Bridal MUA & Hair</option>
                <option value="Mehendi Artist">Mehendi Artist</option>
                <option value="Pandit Ji">Pandit Ji / Priest / Officiant</option>
                <option value="Baraat & Farewell Transport">Baraat & Farewell Transport (Horse / Ghodi / Car)</option>
                <option value="Live Musicians (Nathswaram/Shehnai)">Live Musicians (Shehnai / Nadaswaram)</option>
                <option value="Wedding Planner & Coordinator">Wedding Planner & Coordinator</option>
                <option value="Trousseau / Attire">Trousseau & Attire Designer</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="contacted">Contacted</option>
                <option value="negotiating">Negotiating</option>
                <option value="confirmed">Confirmed / Contract Signed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Contact Person Name</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Amish Thakkar / Nirav Patel"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(732) 555-0199"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Total Agreed / Quoted Fee ($)</label>
              <input
                type="number"
                min={0}
                value={formData.agreedAmount}
                onChange={(e) => setFormData({ ...formData, agreedAmount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Deposit Paid ($)</label>
              <input
                type="number"
                min={0}
                value={formData.depositPaid}
                onChange={(e) => setFormData({ ...formData, depositPaid: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="events@vendor.com"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Key Deliverables (Comma-separated)
            </label>
            <input
              type="text"
              value={formData.deliverablesString}
              onChange={(e) => setFormData({ ...formData, deliverablesString: e.target.value })}
              placeholder="e.g. 4K Drone, Dal Bukhara live copper urn, Mandap fresh floral halo"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Notes / Fine Print / Dietary Restrictions</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Mention negotiated rate details, estate royalty allowances, timing constraints..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
            >
              {editingVendor ? 'Save Changes' : 'Save to My Vendors'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
