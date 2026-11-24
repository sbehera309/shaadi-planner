'use client';

import React, { useState } from 'react';
import { useWedding } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import { AuthModal } from './AuthModal';
import {
  Eye,
  Pencil,
  LogIn,
  AlertTriangle,
  Sparkles,
  X,
} from 'lucide-react';

export const CollaboratorBanner: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    wedding,
    collaborators,
    userRole,
    ownerEmail,
    joinAccessStatus,
    updateCollaboratorRole,
    dismissJoinBanner,
  } = useWedding();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [dismissedEditorBanner, setDismissedEditorBanner] = useState(false);
  const [dismissedViewerEmails, setDismissedViewerEmails] = useState<string[]>([]);

  const coupleName =
    wedding?.brideName && wedding?.groomName
      ? `${wedding.brideName} & ${wedding.groomName}'s`
      : 'this';

  // 1. Invited user arrived via ?join= link but is not signed in yet
  if (joinAccessStatus === 'needs_auth' && !user) {
    return (
      <>
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-white/15 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="font-bold text-sm">
                You&apos;ve been invited to collaborate on a wedding plan!
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Sign in with the email address that was invited to view or co-edit the schedule, venues, and budget in real time.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Join</span>
            </button>
            <button
              type="button"
              onClick={dismissJoinBanner}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  // 2. Signed in, but email is not on the invited collaborators list
  if (joinAccessStatus === 'not_invited' && user) {
    return (
      <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs leading-relaxed">
            <strong className="font-bold block text-sm">Access Not Found for {user.email}</strong>
            Ask the main wedding account owner to add <strong>{user.email}</strong> in{' '}
            <strong>Share &amp; Collaborators</strong>, or sign in with the email address that was invited.
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => logout()}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 font-semibold text-xs"
          >
            Switch Account
          </button>
          <button
            type="button"
            onClick={dismissJoinBanner}
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Active View-Only Collaborator
  if (user && userRole === 'viewer') {
    return (
      <div className="mb-4 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Viewing <strong>{coupleName} Wedding Plan</strong> (<strong>View-Only Access</strong>). Ask{' '}
            {ownerEmail || 'the couple'} for Editor access to make changes.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
          Read Only
        </span>
      </div>
    );
  }

  // 4. Active Editor Collaborator
  if (user && userRole === 'editor' && !dismissedEditorBanner) {
    return (
      <div className="mb-4 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Pencil className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Co-editing <strong>{coupleName} Wedding Plan</strong> — all changes sync live with the main account (
            {ownerEmail || 'Owner'}).
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
            Editor
          </span>
          <button
            type="button"
            onClick={() => setDismissedEditorBanner(true)}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 5. Owner Notification: Show when someone is viewing your wedding plan (with 1-click Grant Edit Access!)
  if (user && userRole === 'owner') {
    const activeViewers = collaborators.filter(
      (c) =>
        c.role === 'viewer' &&
        !dismissedViewerEmails.includes(c.email) &&
        (c.joinedViaLink ||
          (c.lastSeenAt && Date.now() - new Date(c.lastSeenAt).getTime() < 5 * 60 * 1000))
    );

    if (activeViewers.length > 0) {
      return (
        <div className="mb-4 space-y-2">
          {activeViewers.map((viewer) => {
            const isLive =
              Boolean(viewer.lastSeenAt) &&
              Date.now() - new Date(viewer.lastSeenAt!).getTime() < 5 * 60 * 1000;
            return (
              <div
                key={viewer.email}
                className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {isLive && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isLive ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </span>
                  <div className="min-w-0">
                    <strong className="font-bold text-stone-900">
                      {viewer.name ? `${viewer.name} (${viewer.email})` : viewer.email}
                    </strong>{' '}
                    {isLive ? 'is viewing your wedding plan right now' : 'joined your wedding plan'}{' '}
                    <span className="text-amber-800 font-semibold">(View Only)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateCollaboratorRole(viewer.email, 'editor')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors inline-flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Grant Edit Access</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDismissedViewerEmails((prev) => [...prev, viewer.email])
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 text-stone-700 font-semibold text-xs transition-colors"
                  >
                    Keep View Only
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  }

  return null;
};
