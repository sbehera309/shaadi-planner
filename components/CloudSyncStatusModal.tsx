'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Download,
  Upload,
  Database,
  Smartphone,
  Laptop,
} from 'lucide-react';

interface CloudSyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncStatusModal: React.FC<CloudSyncStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, isFirebaseConfigured } = useAuth();
  const {
    isCloudSynced,
    isSyncing,
    lastSyncedAt,
    cloudSyncError,
    forceCloudSync,
    wedding,
    events,
    budgetItems,
    guests,
    vendors,
    shagunRecords,
    rooms,
    venues,
    tourPlan,
    officialSangeetVenue,
    importFullWeddingData,
  } = useWedding();

  const [copiedRules, setCopiedRules] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Allow each authenticated couple to read and write to their own profile & subcollections
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // 2. Allow collaborative access to weddings
    match /weddings/{weddingId}/{document=**} {
      allow read, write: if request.auth != null;
    }
    // 3. Fallback for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  const handleTestSync = async () => {
    setTestResult(null);
    const result = await forceCloudSync();
    if (result.success) {
      setTestResult({
        success: true,
        msg: 'All wedding data, shortlisted venues, route plans & payments verified and synced to Firebase Firestore!',
      });
    } else {
      setTestResult({
        success: false,
        msg: result.error || 'Firestore rejected sync. Please verify rules in Firebase Console.',
      });
    }
  };

  const handleExportJSON = () => {
    const backup = {
      version: 5,
      exportedAt: new Date().toISOString(),
      userEmail: user?.email,
      wedding,
      events,
      budgetItems,
      guests,
      vendors,
      shagunRecords,
      rooms,
      venues,
      tourPlan,
      officialSangeetVenue,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vivaah_wedding_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const data = JSON.parse(text);
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid JSON format');
        }
        importFullWeddingData({
          wedding: data.wedding,
          events: data.events,
          budgetItems: data.budgetItems,
          guests: data.guests,
          vendors: data.vendors,
          shagunRecords: data.shagunRecords,
          rooms: data.rooms,
          venues: data.venues,
          tourPlan: data.tourPlan,
        });
        alert('Wedding profile successfully restored! Synced to this device.');
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Failed to read backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Real-Time Cloud Sync & Device Linking"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-xs text-stone-800">
        {/* Device Sync Status Hero */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                  {user ? (
                    cloudSyncError ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : isSyncing ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4 text-emerald-400" />
                    )
                  ) : (
                    <Laptop className="w-4 h-4 text-stone-300" />
                  )}
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {user
                      ? cloudSyncError
                        ? 'Cloud Sync Blocked by Firestore Rules'
                        : isCloudSynced
                        ? 'Device Synced to Firebase Profile'
                        : 'Sync Pending'
                      : 'Running in Local Storage Mode'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {user ? `Account: ${user.email}` : 'Sign in to link mobile and laptop in real-time'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  cloudSyncError
                    ? 'bg-rose-950/80 text-rose-300 border-rose-700'
                    : isCloudSynced
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                    : 'bg-amber-950/80 text-amber-300 border-amber-700'
                }`}
              >
                {cloudSyncError ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Permission Blocked</span>
                  </>
                ) : isCloudSynced ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Live Synced</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>Local Only</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Sync Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-[11px]">
            <div>
              <span className="text-stone-400 block text-[10px]">Shortlisted Venues</span>
              <strong className="text-white font-mono">{venues.length} venues</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Tour Day Route</span>
              <strong className="text-white font-mono">
                {tourPlan ? `${tourPlan.optimizedStops.length} stops scheduled` : 'Not planned'}
              </strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Budget & Installments</span>
              <strong className="text-white font-mono">{budgetItems.length} items</strong>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Last Attempted</span>
              <strong className="text-white font-mono">
                {lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Pending'}
              </strong>
            </div>
          </div>
        </div>

        {/* Diagnostic: Why isn't mobile showing laptop data? */}
        {cloudSyncError && (
          <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950 text-sm">
                  Why Mobile Isn't Showing Your Laptop's Data
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed mt-1">
                  Your wedding data is currently safe on your laptop, but <strong>Firebase Firestore</strong> rejected
                  the cloud upload with <code>Permission Denied</code>. By default, Firebase security rules expire
                  after 30 days and lock all writes until rules are updated in your Firebase Console.
                </p>
              </div>
            </div>

            {/* Step-by-Step Fix */}
            <div className="bg-white p-3.5 rounded-xl border border-rose-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-xs">
                  Required 1-Minute Fix in Firebase Console:
                </span>
                <a
                  href="https://console.firebase.google.com/project/wedding-planner-43a10/firestore/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] transition-colors"
                >
                  <span>Open Firebase Console Rules ↗</span>
                </a>
              </div>

              <ol className="list-decimal pl-4 space-y-1 text-stone-700 text-[11px] leading-relaxed">
                <li>
                  Click the button above to open <strong>Firestore Database → Rules</strong> for project{' '}
                  <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">wedding-planner-43a10</code>.
                </li>
                <li>Replace the existing rules editor contents with the code below.</li>
                <li>Click <strong>Publish</strong>.</li>
              </ol>

              {/* Rules Snippet */}
              <div className="relative">
                <pre className="p-3 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[10px] overflow-x-auto leading-relaxed">
                  {FIRESTORE_RULES_SNIPPET}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyRules}
                  className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedRules ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Rules</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-rose-900 font-medium">
                After publishing rules in Firebase, click below to test:
              </span>
              <button
                type="button"
                onClick={handleTestSync}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm tap-button active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Test &amp; Push to Cloud Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Test Feedback banner */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-150 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed font-semibold text-xs">{testResult.msg}</div>
          </div>
        )}

        {/* Instant Cross-Device Backup & Restore */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>🔄</span>
                <span>Direct Cross-Device Transfer (No Setup Required)</span>
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Want to see everything on your phone right now without waiting? Download your profile file on this
                laptop and upload it on your phone to transfer all your shortlisted venues and route schedules instantly.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs tap-button active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-700" />
              <span>Export Full Wedding Backup (.json)</span>
            </button>

            <label className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs tap-button active:scale-95 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Restore from Backup (.json)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {importError && (
            <p className="text-xs text-rose-700 font-semibold">{importError}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-stone-400" />
            <span>Firebase Project: <strong>wedding-planner-43a10</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
