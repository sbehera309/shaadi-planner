'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { X, Sparkles, AlertCircle, Mail, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isFirebaseConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase yet. Please add your Vercel domain under Firebase Console > Authentication > Settings > Authorized domains.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        // user closed popup, no error needed
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-rose-950 to-amber-950 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Cloud Sync & Collaboration
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif">
            {isSignUp ? 'Create Planner Account' : 'Sign In to Vivaah'}
          </h2>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed">
            Sync your wedding timeline, budget, and guest list seamlessly across mobile and desktop.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-stone-300 hover:border-stone-400 hover:bg-stone-50 font-semibold text-stone-700 text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-semibold absolute">
              or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-white font-semibold text-xs transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Free Account' : 'Sign In with Email'}
            </button>
          </form>

          {/* Switch between Sign In / Sign Up */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-stone-600 hover:text-rose-900 font-semibold"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account yet? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
