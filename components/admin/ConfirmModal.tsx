'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmBtnStyles =
    variant === 'danger'
      ? 'bg-[#D7261E] hover:bg-[#B91C1C] text-white focus:ring-[#D7261E]'
      : variant === 'warning'
      ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white focus:ring-[#F59E0B]'
      : 'bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white focus:ring-[#3E5FD1]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E3E7EE] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E7EE] bg-[#F5F7FA]">
          <div className="flex items-center space-x-2">
            {variant === 'danger' ? (
              <AlertTriangle className="w-5 h-5 text-[#D7261E]" />
            ) : variant === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#3E5FD1]" />
            )}
            <h3 className="font-bold text-base text-[#111827]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Tutup modal"
            className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-[#F5F7FA] border-t border-[#E3E7EE]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#374151] bg-white border border-[#E3E7EE] rounded-lg hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#3E5FD1] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2 ${confirmBtnStyles}`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isLoading ? 'Memproses…' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
