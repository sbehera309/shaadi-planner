'use client';

import React, { useState } from 'react';
import { Modal } from './Modal';
import { useWedding } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import {
  Users,
  UserPlus,
  Crown,
  Eye,
  Pencil,
  Trash2,
  Copy,
  Check,
  Link2,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface ShareCollaboratorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCollaboratorsModal: React.FC<ShareCollaboratorsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const {
    wedding,
    collaborators,
    userRole,
    ownerEmail,
    activeWeddingDocId,
    addCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
  } = useWedding();

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'editor' | 'viewer'>('editor');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [linkRole, setLinkRole] = useState<'editor' | 'viewer'>('viewer');

  const isOwner = userRole === 'owner';
  const shareUrl =
    typeof window !== 'undefined' && activeWeddingDocId
      ? `${window.location.origin}/dashboard?join=${activeWeddingDocId}&role=${linkRole}`
      : '';

  const coupleTitle =
    wedding?.brideName && wedding?.groomName
      ? `${wedding.brideName} & ${wedding.groomName}`
      : 'our wedding';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const res = await addCollaborator(emailInput, roleInput, nameInput);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Could not add collaborator.');
      return;
    }

    setSuccessMsg(
      `Added ${nameInput.trim() || emailInput.trim()} as ${
        roleInput === 'editor' ? 'Editor' : 'Viewer'
      }! Share the link below so they can sign in.`
    );
    setEmailInput('');
    setNameInput('');
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyWhatsApp = () => {
    if (!shareUrl) return;
    const msg = `Hey! I added you to our wedding planner for ${coupleTitle}. Sign in with your invited email here to view our schedule, venues, and plans in real time:\n${shareUrl}`;
    navigator.clipboard.writeText(msg);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share & Collaborators"
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs">
        {/* Intro Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-amber-950 leading-relaxed">
            <strong>Attached to your main wedding account.</strong> Invite your fiancé, parents, or wedding planner by email. Editors sync changes live in real time; Viewers get clean read-only access.
          </div>
        </div>

        {/* Add Collaborator Form (Owner Only) */}
        {isOwner ? (
          <form
            onSubmit={handleAdd}
            className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
          >
            <div className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
              <UserPlus className="w-4 h-4 text-rose-600" />
              <span>Add a Person</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. partner@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  Name / Label (Optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Shital, Parents, Planner"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoleInput('editor')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                  roleInput === 'editor'
                    ? 'border-rose-600 bg-rose-50/70'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Pencil className="w-3.5 h-3.5 text-rose-600" />
                  <span>Can Edit</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Co-plan venues, schedule, budget &amp; guests
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRoleInput('viewer')}
                className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                  roleInput === 'viewer'
                    ? 'border-blue-600 bg-blue-50/70'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Only</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Follow progress without accidental edits
                </p>
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !emailInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:opacity-95 disabled:opacity-40 text-white font-bold shadow-xs transition-all inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Adding...' : 'Add Collaborator'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600">
            You are collaborating on this wedding plan as{' '}
            <strong className="text-stone-900 uppercase">{userRole}</strong>. Only the main account owner (
            <strong>{ownerEmail || 'Owner'}</strong>) can add or remove collaborators.
          </div>
        )}

        {/* People With Access List */}
        <div className="space-y-2">
          <div className="font-bold text-stone-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              <span>People With Access ({collaborators.length + 1})</span>
            </span>
          </div>

          <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white overflow-hidden">
            {/* Owner Row */}
            <div className="p-3 flex items-center justify-between gap-3 bg-amber-50/30">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-stone-900 truncate">
                    {isOwner ? 'You (Main Account)' : 'Main Account Owner'}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {ownerEmail || user?.email || 'Primary Account'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase shrink-0">
                Owner
              </span>
            </div>

            {/* Collaborator Rows */}
            {collaborators.length === 0 ? (
              <div className="p-4 text-center text-stone-500 text-[11px]">
                No collaborators added yet. Add your fiancé, parents, or planner above.
              </div>
            ) : (
              collaborators.map((collab) => {
                const isViewingNow =
                  Boolean(collab.lastSeenAt) &&
                  Date.now() - new Date(collab.lastSeenAt!).getTime() < 5 * 60 * 1000;
                return (
                <div
                  key={collab.email}
                  className="p-3 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center uppercase">
                        {(collab.name || collab.email)[0]}
                      </div>
                      {isViewingNow && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"
                          title="Viewing now"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 truncate">
                          {collab.name || collab.email}
                        </span>
                        {isViewingNow && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold shrink-0">
                            Viewing now
                          </span>
                        )}
                      </div>
                      {collab.name && (
                        <div className="text-[11px] text-stone-500 truncate">
                          {collab.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isOwner ? (
                      <>
                        {collab.role === 'viewer' && (
                          <button
                            type="button"
                            onClick={() => updateCollaboratorRole(collab.email, 'editor')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                          >
                            Allow Edit
                          </button>
                        )}
                        <select
                          value={collab.role}
                          onChange={(e) =>
                            updateCollaboratorRole(
                              collab.email,
                              e.target.value as 'editor' | 'viewer'
                            )
                          }
                          className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                        >
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeCollaborator(collab.email)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          collab.role === 'editor'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {collab.role}
                      </span>
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Share Link & WhatsApp Helper */}
        {shareUrl && (
          <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Link2 className="w-3.5 h-3.5" />
                <span>Direct Invite Link (Auto-Joins!)</span>
              </div>
              <div className="inline-flex p-0.5 rounded-lg bg-white/10 border border-white/15 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLinkRole('editor')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    linkRole === 'editor'
                      ? 'bg-amber-500 text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  Can Edit
                </button>
                <button
                  type="button"
                  onClick={() => setLinkRole('viewer')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                    linkRole === 'viewer'
                      ? 'bg-blue-500 text-white'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  View Only
                </button>
              </div>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Anyone you send this link to will automatically join your wedding plan as{' '}
              <strong className="text-white">{linkRole === 'editor' ? 'Editor' : 'Viewer'}</strong> as soon as they sign in — and they&apos;ll appear in your access list above so you can change or revoke their role anytime.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Share Link</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/15 inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedWhatsApp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Message Copied!</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copy WhatsApp Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
