'use client';

import React from 'react';
import { Vendor, VendorAddOn, VendorEventCoverage } from '@/lib/types';
import { getVendorCategorySpec } from '@/lib/vendorCategorySpecs';
import {
  Check,
  Plus,
  Trash2,
  CalendarClock,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface VendorCategoryDetailsEditorProps {
  category: Vendor['category'];
  quoteExpiresAt: string;
  quoteUrl: string;
  categoryDetails: Record<string, string | boolean>;
  eventBreakdown: VendorEventCoverage[];
  addOns: VendorAddOn[];
  onChangeQuoteExpiresAt: (val: string) => void;
  onChangeQuoteUrl: (val: string) => void;
  onChangeDetail: (key: string, value: string | boolean) => void;
  onChangeEventBreakdown: (rows: VendorEventCoverage[]) => void;
  onChangeAddOns: (items: VendorAddOn[]) => void;
}

export const VendorCategoryDetailsEditor: React.FC<VendorCategoryDetailsEditorProps> = ({
  category,
  quoteExpiresAt,
  quoteUrl,
  categoryDetails,
  eventBreakdown,
  addOns,
  onChangeQuoteExpiresAt,
  onChangeQuoteUrl,
  onChangeDetail,
  onChangeEventBreakdown,
  onChangeAddOns,
}) => {
  const spec = getVendorCategorySpec(category);
  const textFields = spec.fields.filter((f) => f.type === 'text');
  const boolFields = spec.fields.filter((f) => f.type === 'boolean');

  const addEventRow = () => {
    onChangeEventBreakdown([
      ...eventBreakdown,
      {
        id: `evc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        eventName: '',
        hours: '',
        teamSize: '',
        rate: '',
        priceLabel: '',
      },
    ]);
  };

  const updateEventRow = (id: string, patch: Partial<VendorEventCoverage>) => {
    onChangeEventBreakdown(
      eventBreakdown.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const removeEventRow = (id: string) => {
    onChangeEventBreakdown(eventBreakdown.filter((row) => row.id !== id));
  };

  const addAddOnRow = () => {
    onChangeAddOns([
      ...addOns,
      {
        id: `ao-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: '',
        price: 0,
        notes: '',
        selected: false,
      },
    ]);
  };

  const updateAddOnRow = (id: string, patch: Partial<VendorAddOn>) => {
    onChangeAddOns(addOns.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const removeAddOnRow = (id: string) => {
    onChangeAddOns(addOns.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4 pt-2 border-t border-stone-200">
      {/* Quote Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="font-semibold text-stone-700 block mb-1">
            Quote Expires On (Optional)
          </label>
          <input
            type="date"
            value={quoteExpiresAt}
            onChange={(e) => onChangeQuoteExpiresAt(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>
        <div>
          <label className="font-semibold text-stone-700 block mb-1">
            Quote Book / Proposal Link (Optional)
          </label>
          <input
            type="url"
            value={quoteUrl}
            onChange={(e) => onChangeQuoteUrl(e.target.value)}
            placeholder="https://... (HoneyBook, PDF, Gallery)"
            className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>
      </div>

      {/* Category-Specific Package Specs */}
      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3.5">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{spec.sectionTitle}</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">{spec.sectionHint}</p>
        </div>

        {/* Toggleable Included Features */}
        {boolFields.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-600 block">
              What&apos;s Included (click to toggle):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {boolFields.map((field) => {
                const checked = Boolean(categoryDetails[field.key]);
                return (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => onChangeDetail(field.key, !checked)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all ${
                      checked
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400'
                    }`}
                  >
                    {checked ? (
                      <Check className="w-3 h-3 shrink-0" />
                    ) : (
                      <Plus className="w-3 h-3 opacity-45 shrink-0" />
                    )}
                    <span>{field.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Structured Text Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {textFields.map((field) => (
            <div key={field.key}>
              <label className="font-semibold text-stone-700 block mb-1 text-[11px]">
                {field.label}
              </label>
              <input
                type="text"
                value={typeof categoryDetails[field.key] === 'string' ? (categoryDetails[field.key] as string) : ''}
                onChange={(e) => onChangeDetail(field.key, e.target.value)}
                placeholder={field.placeholder || ''}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Event-by-Event Coverage Breakdown */}
      {spec.supportsEventBreakdown && (
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-600" />
                <span>Event-by-Event Coverage &amp; Pricing Breakdown</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Break down hours, team size, hourly rate, and price per ceremony (e.g. Haldi, Ceremony, Reception).
              </p>
            </div>
            <button
              type="button"
              onClick={addEventRow}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold text-[11px] inline-flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add Event</span>
            </button>
          </div>

          {eventBreakdown.length > 0 && (
            <div className="space-y-2">
              {eventBreakdown.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-2 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-white border border-stone-200 items-center"
                >
                  <input
                    type="text"
                    value={row.eventName}
                    onChange={(e) => updateEventRow(row.id, { eventName: e.target.value })}
                    placeholder="Event (e.g. Haldi)"
                    className="col-span-2 sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={row.hours || ''}
                    onChange={(e) => updateEventRow(row.id, { hours: e.target.value })}
                    placeholder="Hours (e.g. 5 hrs)"
                    className="col-span-1 sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    value={row.teamSize || ''}
                    onChange={(e) => updateEventRow(row.id, { teamSize: e.target.value })}
                    placeholder="Team (e.g. 2 Photo + 2 Video)"
                    className="col-span-1 sm:col-span-3 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    value={row.rate || ''}
                    onChange={(e) => updateEventRow(row.id, { rate: e.target.value })}
                    placeholder="Rate ($600/hr)"
                    className="col-span-1 sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
                  />
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-1">
                    <input
                      type="text"
                      value={row.priceLabel || ''}
                      onChange={(e) => updateEventRow(row.id, { priceLabel: e.target.value })}
                      placeholder="$3,000"
                      className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => removeEventRow(row.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 shrink-0"
                      title="Remove event row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Optional Add-Ons */}
      {spec.supportsAddOns && (
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-bold text-stone-800 text-xs">
                Optional Add-Ons &amp; Upgrades
              </div>
              <p className="text-[11px] text-stone-500">{spec.sampleAddOnHint}</p>
            </div>
            <button
              type="button"
              onClick={addAddOnRow}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-bold text-[11px] inline-flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add Option</span>
            </button>
          </div>

          {addOns.length > 0 && (
            <div className="space-y-2">
              {addOns.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-white border border-stone-200 items-center"
                >
                  <div className="sm:col-span-5 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(item.selected)}
                      onChange={(e) => updateAddOnRow(item.id, { selected: e.target.checked })}
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      title="Mark add-on as selected"
                    />
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateAddOnRow(item.id, { name: e.target.value })}
                      placeholder="Add-on name (e.g. Same Day Edit)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-1">
                    <span className="text-stone-400 font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(e) =>
                        updateAddOnRow(item.id, { price: parseInt(e.target.value) || 0 })
                      }
                      placeholder="Price"
                      className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-4 flex items-center gap-1">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updateAddOnRow(item.id, { notes: e.target.value })}
                      placeholder="Notes (e.g. 3–5 min video)"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeAddOnRow(item.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 shrink-0"
                      title="Remove add-on"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface VendorCategoryDetailsCardProps {
  vendor: Vendor;
  currencySymbol: string;
  onToggleAddOn?: (addOnId: string) => void;
}

export const VendorCategoryDetailsCard: React.FC<VendorCategoryDetailsCardProps> = ({
  vendor,
  currencySymbol,
  onToggleAddOn,
}) => {
  const spec = getVendorCategorySpec(vendor.category);
  const details = vendor.categoryDetails || {};
  const filledTextSpecs = spec.fields.filter(
    (f) => f.type === 'text' && typeof details[f.key] === 'string' && (details[f.key] as string).trim()
  );
  const checkedBoolSpecs = spec.fields.filter(
    (f) => f.type === 'boolean' && Boolean(details[f.key])
  );
  const eventBreakdown = (vendor.eventBreakdown || []).filter((e) => e.eventName.trim());
  const addOns = (vendor.addOns || []).filter((a) => a.name.trim());

  const hasAnything =
    Boolean(vendor.quoteExpiresAt) ||
    Boolean(vendor.quoteUrl) ||
    filledTextSpecs.length > 0 ||
    checkedBoolSpecs.length > 0 ||
    eventBreakdown.length > 0 ||
    addOns.length > 0;

  if (!hasAnything) return null;

  const selectedAddOnsTotal = addOns
    .filter((a) => a.selected)
    .reduce((sum, a) => sum + (a.price || 0), 0);

  return (
    <div className="mt-4 p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80 space-y-3 text-xs">
      {/* Quote Expiration + Quote Link Row */}
      {(vendor.quoteExpiresAt || vendor.quoteUrl) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-200/70">
          {vendor.quoteExpiresAt && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
              <CalendarClock className="w-3 h-3" />
              <span>Quote Expires: {vendor.quoteExpiresAt}</span>
            </span>
          )}
          {vendor.quoteUrl && (
            <a
              href={vendor.quoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:underline"
            >
              <span>Open Quote Book</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Included Check Pills */}
      {checkedBoolSpecs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {checkedBoolSpecs.map((field) => (
            <span
              key={field.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"
            >
              <Check className="w-2.5 h-2.5" />
              <span>{field.shortLabel || field.label}</span>
            </span>
          ))}
        </div>
      )}

      {/* Structured Specs Grid */}
      {filledTextSpecs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
          {filledTextSpecs.map((field) => (
            <div key={field.key} className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {field.shortLabel || field.label}
              </span>
              <span className="text-xs font-semibold text-stone-800">
                {details[field.key] as string}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Event-by-Event Breakdown */}
      {eventBreakdown.length > 0 && (
        <div className="pt-2 border-t border-stone-200/70 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Event Coverage Breakdown
          </span>
          <div className="space-y-1">
            {eventBreakdown.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-stone-200/80 text-[11px]"
              >
                <div className="font-bold text-stone-900">{ev.eventName}</div>
                <div className="flex flex-wrap items-center gap-2 text-stone-600">
                  {ev.hours && <span>{ev.hours}</span>}
                  {ev.teamSize && <span className="text-stone-400">•</span>}
                  {ev.teamSize && <span>{ev.teamSize}</span>}
                  {ev.rate && <span className="text-stone-400">•</span>}
                  {ev.rate && <span className="text-stone-500">{ev.rate}</span>}
                  {ev.priceLabel && (
                    <span className="font-mono font-bold text-stone-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      {ev.priceLabel}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Add-Ons */}
      {addOns.length > 0 && (
        <div className="pt-2 border-t border-stone-200/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Optional Add-Ons
            </span>
            {selectedAddOnsTotal > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Selected: +{currencySymbol}
                {selectedAddOnsTotal.toLocaleString()}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {addOns.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleAddOn && onToggleAddOn(item.id)}
                className={`w-full text-left flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors ${
                  item.selected
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-white border-stone-200/80 text-stone-700 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {item.selected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  )}
                  <span className="font-semibold truncate">{item.name}</span>
                  {item.notes && (
                    <span className="text-[10px] text-stone-400 truncate hidden sm:inline">
                      ({item.notes})
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold shrink-0">
                  +{currencySymbol}
                  {(item.price || 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
