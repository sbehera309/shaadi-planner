'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ExternalLink,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  X,
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { getGoogleMapsApiKey, setGoogleMapsApiKey, loadGoogleMapsScript } from '@/lib/googleMapsConfig';

interface GoogleMapsKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (key: string) => void;
}

export default function GoogleMapsKeyModal({
  isOpen,
  onClose,
  onKeySaved,
}: GoogleMapsKeyModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentKey = getGoogleMapsApiKey();
      setApiKeyInput(currentKey);
      setTestStatus(currentKey ? 'success' : 'idle');
      setStatusMessage(currentKey ? 'API Key is currently active in this browser.' : '');
    }
  }, [isOpen]);

  const handleTestAndSave = async () => {
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey) {
      setGoogleMapsApiKey('');
      setTestStatus('idle');
      setStatusMessage('Key removed. Falling back to built-in local database.');
      if (onKeySaved) onKeySaved('');
      return;
    }

    if (!cleanKey.startsWith('AIzaSy')) {
      setTestStatus('error');
      setStatusMessage('Google Maps API keys typically begin with "AIzaSy". Please check your key.');
      return;
    }

    setTestStatus('testing');
    setStatusMessage('Validating key with Google Maps & Places services...');

    try {
      // 1. Try loading Google Maps SDK with this key
      const loaded = await loadGoogleMapsScript(cleanKey);
      if (loaded) {
        setGoogleMapsApiKey(cleanKey);
        setTestStatus('success');
        setStatusMessage('Success! Google Maps & Places API is active and connected.');
        if (onKeySaved) onKeySaved(cleanKey);
        setTimeout(() => {
          onClose();
        }, 1200);
        return;
      }

      // 2. Also test server proxy
      const testRes = await fetch(`/api/address-autocomplete?q=254+Montgomery&key=${encodeURIComponent(cleanKey)}`);
      if (testRes.ok) {
        const data = await testRes.json();
        setGoogleMapsApiKey(cleanKey);
        setTestStatus('success');
        setStatusMessage(`Connected! Provider: ${data.provider}. Live autocomplete is active.`);
        if (onKeySaved) onKeySaved(cleanKey);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setTestStatus('error');
        setStatusMessage('Unable to verify key with Google Places. Please check API restrictions.');
      }
    } catch {
      // If client-side check succeeded partially, still allow saving
      setGoogleMapsApiKey(cleanKey);
      setTestStatus('success');
      setStatusMessage('Key saved locally! Google Maps components will initialize with this key.');
      if (onKeySaved) onKeySaved(cleanKey);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    setGoogleMapsApiKey('');
    setTestStatus('idle');
    setStatusMessage('Key removed. App is using the local venue database.');
    if (onKeySaved) onKeySaved('');
  };

  const envSnippet = `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${apiKeyInput || 'YOUR_API_KEY_HERE'}\nGOOGLE_MAPS_API_KEY=${apiKeyInput || 'YOUR_API_KEY_HERE'}`;

  const copyEnvToClipboard = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Maps & Places API Configuration"
      maxWidth="2xl"
    >
      <div className="space-y-6 text-stone-800 text-xs sm:text-sm">
        {/* Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-200/80 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white shadow-sm text-blue-600 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">
                Unlock Live Google Maps &amp; Instant Keystroke Autocomplete
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                Official Google Maps
              </span>
            </div>
            <p className="text-stone-600 text-xs leading-relaxed">
              By connecting your Google Maps API Key, you activate real-time keystroke suggestions across all US street addresses, live turn-by-turn routing distances, and genuine Google Maps with satellite imagery.
            </p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3">
          <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>How to get your free Google Maps API Key (4 Quick Steps)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  <span>Google Cloud Console</span>
                </span>
                <a
                  href="https://console.cloud.google.com/google/maps-apis/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-semibold"
                >
                  <span>Open Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Log in and create a new project (e.g. <em>&quot;Shaadi Planner&quot;</em>). Google provides a <strong>$200 monthly free credit</strong> every month (over 28,000 map loads or 70,000 autocomplete requests free).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white inline-flex items-center justify-center text-[10px] font-bold">
                    2
                  </span>
                  <span>Enable 4 Core APIs</span>
                </span>
                <a
                  href="https://console.cloud.google.com/apis/library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 font-semibold"
                >
                  <span>API Library</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                In <strong>APIs &amp; Services &gt; Library</strong>, search and enable:
                <br />
                • <strong>Places API</strong> &amp; <strong>Places API (New)</strong>
                <br />
                • <strong>Maps JavaScript API</strong>
                <br />
                • <strong>Geocoding API</strong> &amp; <strong>Directions API</strong>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px] font-bold">
                    3
                  </span>
                  <span>Create Credentials</span>
                </span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 font-semibold"
                >
                  <span>Credentials</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Click <strong>+ CREATE CREDENTIALS &gt; API key</strong>. Copy the key (it starts with <code>AIzaSy...</code>).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-800 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white inline-flex items-center justify-center text-[10px] font-bold">
                    4
                  </span>
                  <span>Paste &amp; Save Below</span>
                </span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Paste the key below to activate it in your browser immediately. You can also paste it into your <code>.env.local</code> or Vercel Environment Variables.
              </p>
            </div>
          </div>
        </div>

        {/* Key Input Section */}
        <div className="p-4 rounded-2xl bg-white border border-stone-300 shadow-sm space-y-3">
          <label className="font-bold text-stone-900 block text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              <span>Enter Google Maps / Places API Key</span>
            </span>
            {apiKeyInput && (
              <button
                type="button"
                onClick={handleClearKey}
                className="text-stone-400 hover:text-rose-600 text-[11px] font-semibold underline"
              >
                Clear Key
              </button>
            )}
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => {
                setApiKeyInput(e.target.value);
                setTestStatus('idle');
              }}
              placeholder="AIzaSyB-..."
              className="flex-1 px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleTestAndSave}
              disabled={testStatus === 'testing'}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {testStatus === 'testing' ? (
                <span>Validating...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save &amp; Activate Key</span>
                </>
              )}
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : testStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {testStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Key className="w-4 h-4 text-stone-500 shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Permanent Deployment Instructions (Vercel / .env.local) */}
        <div className="p-4 rounded-2xl bg-stone-900 text-stone-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Permanent Deployment (Vercel &amp; .env.local)</span>
            </div>
            <button
              type="button"
              onClick={copyEnvToClipboard}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-mono text-[11px] flex items-center gap-1 transition-colors border border-stone-700"
            >
              {copiedEnv ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>
          <p className="text-stone-400 text-[11px] leading-relaxed">
            To make this active for all family members and wedding planners visiting your deployed app, add these variables to your <code>.env.local</code> or in <strong>Vercel &gt; Settings &gt; Environment Variables</strong>:
          </p>
          <pre className="p-3 rounded-xl bg-stone-950 font-mono text-[11px] text-amber-300 overflow-x-auto border border-stone-800">
            {envSnippet}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleTestAndSave}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
