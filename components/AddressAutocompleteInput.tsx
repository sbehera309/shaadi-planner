import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Check, X, Loader2, Navigation, Compass, Sparkles, Key } from 'lucide-react';
import { AddressSuggestion } from '@/app/api/address-autocomplete/route';
import { getGoogleMapsApiKey } from '@/lib/googleMapsConfig';
import GoogleMapsKeyModal from '@/components/GoogleMapsKeyModal';

interface AddressValue {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

interface AddressAutocompleteInputProps {
  value: AddressValue;
  onChange: (updated: AddressValue) => void;
  label?: string;
  placeholder?: string;
  accentColor?: 'blue' | 'rose' | 'amber';
  quickSuggestions?: Array<{
    label: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    lat: number;
    lon: number;
  }>;
}

export default function AddressAutocompleteInput({
  value,
  onChange,
  label = 'Street Address',
  placeholder = 'Start typing address (e.g. 254 Montgomery St or 88 Oak Tree Rd)...',
  accentColor = 'blue',
  quickSuggestions,
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState(value.address || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isLocating, setIsLocating] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setActiveKey(getGoogleMapsApiKey());
    const handleKeyChange = (e: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setActiveKey((e as any).detail?.apiKey || '');
    };
    window.addEventListener('google-maps-key-changed', handleKeyChange);
    return () => window.removeEventListener('google-maps-key-changed', handleKeyChange);
  }, []);

  // Sync internal input only when external address value changes from outside (e.g. form reset)
  useEffect(() => {
    setInputValue(value.address || '');
  }, [value.address]);

  // Click outside to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const currentKey = getGoogleMapsApiKey();
      const keyParam = currentKey ? `&key=${encodeURIComponent(currentKey)}` : '';
      const res = await fetch(`/api/address-autocomplete?q=${encodeURIComponent(query)}${keyParam}`);
      if (res.ok) {
        const data = await res.json();
        const results: AddressSuggestion[] = data.suggestions || [];
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search immediately as the user types
  const handleInputChange = (newText: string) => {
    setInputValue(newText);

    // If user pasted/typed a full comma-separated address (e.g. "123 Main St, Mountain Top PA")
    if (newText.includes(',')) {
      const parts = newText.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const street = parts[0];
        const secondPart = parts.slice(1).join(', ');
        const stateMatch = secondPart.match(/\b([A-Za-z]{2})\b(?:\s*(\d{5}))?/);
        let city = secondPart;
        let state = value.state || 'PA';
        let zipCode = value.zipCode || '';
        if (stateMatch) {
          state = stateMatch[1].toUpperCase();
          if (stateMatch[2]) zipCode = stateMatch[2];
          city = secondPart.replace(new RegExp(`\\b${stateMatch[1]}\\b.*$`, 'i'), '').replace(/,/g, '').trim();
        }
        let lat = value.latitude;
        let lon = value.longitude;
        if (
          city.toLowerCase().includes('mountain top') ||
          city.toLowerCase().includes('mountaintop')
        ) {
          city = 'Mountain Top';
          state = 'PA';
          if (!zipCode) zipCode = '18707';
          lat = 41.1514;
          lon = -75.9376;
        }
        onChange({
          address: street,
          city,
          state,
          zipCode,
          latitude: lat,
          longitude: lon,
        });
      } else {
        onChange({ ...value, address: newText });
      }
    } else {
      onChange({ ...value, address: newText });
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newText.trim().length >= 1) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(newText.trim());
      }, 120);
    } else {
      setIsLoading(false);
      // If user clears, show default quick suggestions on focus
      if (quickSuggestions && quickSuggestions.length > 0) {
        const defaultMapped: AddressSuggestion[] = quickSuggestions.map((qs) => ({
          id: `quick-${qs.label}`,
          primaryText: qs.address,
          secondaryText: `${qs.city}, ${qs.state} ${qs.zipCode}, USA (${qs.label})`,
          fullAddress: `${qs.address}, ${qs.city}, ${qs.state} ${qs.zipCode}`,
          street: qs.address,
          city: qs.city,
          state: qs.state,
          zipCode: qs.zipCode,
          latitude: qs.lat,
          longitude: qs.lon,
          source: 'local',
        }));
        setSuggestions(defaultMapped);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }
  };

  // Focus event: instantly show matching suggestions or quick hubs
  const handleInputFocus = () => {
    if (inputValue.trim().length >= 1) {
      fetchSuggestions(inputValue.trim());
      setIsOpen(true);
    } else if (quickSuggestions && quickSuggestions.length > 0) {
      const defaultMapped: AddressSuggestion[] = quickSuggestions.map((qs) => ({
        id: `quick-${qs.label}`,
        primaryText: qs.address,
        secondaryText: `${qs.city}, ${qs.state} ${qs.zipCode}, USA (${qs.label})`,
        fullAddress: `${qs.address}, ${qs.city}, ${qs.state} ${qs.zipCode}`,
        street: qs.address,
        city: qs.city,
        state: qs.state,
        zipCode: qs.zipCode,
        latitude: qs.lat,
        longitude: qs.lon,
        source: 'local',
      }));
      setSuggestions(defaultMapped);
      setIsOpen(true);
    }
  };

  // Handle selection of a suggestion
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const streetAddress = suggestion.street || suggestion.primaryText;
    setInputValue(streetAddress);
    onChange({
      address: streetAddress,
      city: suggestion.city,
      state: suggestion.state || 'NJ',
      zipCode: suggestion.zipCode,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
    setIsOpen(false);
    setSuggestions([]);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && inputValue.trim().length >= 1) {
        e.preventDefault();
        fetchSuggestions(inputValue.trim());
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Browser Geolocation Quick Button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(`/api/address-autocomplete?q=${lat},${lon}`);
          if (res.ok) {
            const data = await res.json();
            if (data.suggestions && data.suggestions.length > 0) {
              handleSelectSuggestion(data.suggestions[0]);
              setIsLocating(false);
              return;
            }
          }
        } catch {
          // Fallback coordinate fill
        }

        onChange({
          ...value,
          latitude: lat,
          longitude: lon,
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert('Could not determine current location. Please start typing your address.');
      },
      { timeout: 7000 }
    );
  };

  const hasCoordinates = Boolean(value.latitude && value.longitude);

  return (
    <div ref={containerRef} className="space-y-2 relative">
      {/* Label and Verified Badge */}
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-stone-700 flex items-center gap-1.5">
          <MapPin
            className={`w-3.5 h-3.5 ${
              accentColor === 'rose'
                ? 'text-rose-600'
                : accentColor === 'amber'
                ? 'text-amber-600'
                : 'text-blue-600'
            }`}
          />
          <span>{label}</span>
        </label>

        <div className="flex items-center gap-2">
          {hasCoordinates && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Maps Verified</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="text-[11px] font-medium text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 transition-colors"
            title="Use current GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
            ) : (
              <Navigation className="w-3 h-3 text-stone-400" />
            )}
            <span>Current Location</span>
          </button>
        </div>
      </div>

      {/* Input container with Google Maps look & feel */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-stone-300 text-stone-900 bg-white font-medium text-sm sm:text-xs shadow-2xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:text-stone-400"
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onChange({
                address: '',
                city: '',
                state: 'NJ',
                zipCode: '',
                latitude: undefined,
                longitude: undefined,
              });
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 transition-colors"
            title="Clear address"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Suggestions List (Google Maps Style) */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[11px] text-stone-600 font-semibold">
            <span className="flex items-center gap-1.5 text-rose-700">
              <Compass className="w-3.5 h-3.5" />
              <span>Google Maps &amp; Address Suggestions</span>
            </span>
            <div className="flex items-center gap-2">
              {activeKey ? (
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Google Places Active</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKeyModalOpen(true);
                  }}
                  className="text-[10px] text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 transition-colors"
                >
                  <Key className="w-2.5 h-2.5 text-amber-600" />
                  <span>Connect API Key</span>
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-64 overflow-y-auto divide-y divide-stone-100">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-2.5 cursor-pointer flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-rose-50/80 text-rose-950 font-semibold' : 'hover:bg-stone-50 text-stone-900'
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-rose-100/80 text-rose-700 mt-0.5 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-stone-900 truncate flex items-center gap-1.5">
                      <span>{item.primaryText}</span>
                      {item.source === 'google' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                          Google Maps
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-500 truncate mt-0.5">
                      {item.secondaryText}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider shrink-0 mt-1 px-1.5 py-0.5 bg-stone-100 rounded-md">
                    {item.state}
                  </span>
                </li>
              );
            })}
          </ul>

          {!activeKey && (
            <div className="px-3.5 py-2 bg-amber-50/80 border-t border-amber-100 flex items-center justify-between text-[11px]">
              <span className="text-stone-600">
                Want live Google suggestions for all US addresses?
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsKeyModalOpen(true);
                }}
                className="text-blue-700 hover:text-blue-900 font-bold underline"
              >
                Set up Google Places API
              </button>
            </div>
          )}
        </div>
      )}

      {/* Auto-populated City, State, Zip Row */}
      <div className="grid grid-cols-6 gap-2 pt-1 text-xs">
        <div className="col-span-3">
          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">City</label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="City"
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-900 bg-stone-50/50 font-medium text-xs focus:bg-white focus:ring-1 focus:ring-rose-500"
          />
        </div>
        <div className="col-span-1">
          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">State</label>
          <input
            type="text"
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            placeholder="NJ"
            maxLength={2}
            className="w-full px-2 py-1.5 rounded-lg border border-stone-200 text-stone-900 bg-stone-50/50 font-medium text-xs text-center uppercase focus:bg-white focus:ring-1 focus:ring-rose-500"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">Zip Code</label>
          <input
            type="text"
            value={value.zipCode || ''}
            onChange={(e) => onChange({ ...value, zipCode: e.target.value })}
            placeholder="07000"
            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-900 bg-stone-50/50 font-medium text-xs focus:bg-white focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Quick Suggestions Pills (Popular Hubs) */}
      {quickSuggestions && quickSuggestions.length > 0 && (
        <div className="pt-1 flex flex-wrap items-center gap-1 text-[10px]">
          <span className="text-stone-400 font-medium flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <span>Quick Pick:</span>
          </span>
          {quickSuggestions.map((qs) => (
            <button
              key={qs.label}
              type="button"
              onClick={() => {
                setInputValue(qs.address);
                onChange({
                  address: qs.address,
                  city: qs.city,
                  state: qs.state,
                  zipCode: qs.zipCode,
                  latitude: qs.lat,
                  longitude: qs.lon,
                });
                setIsOpen(false);
              }}
              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 border border-stone-200/80 transition-colors"
            >
              {qs.label}
            </button>
          ))}
        </div>
      )}

      {/* Google Maps Setup Assistant Modal */}
      <GoogleMapsKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={(newKey) => setActiveKey(newKey)}
      />
    </div>
  );
}
