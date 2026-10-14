'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-stone-200 w-full ${maxWidthClass} max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="px-5 py-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:pt-4 sm:px-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/90 shrink-0 z-10">
          <h3 className="font-semibold text-base sm:text-lg text-stone-900 font-serif truncate pr-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-200/80 hover:bg-stone-300 active:bg-stone-400 flex items-center justify-center text-stone-700 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};
