import React from 'react';

export type BadgeStatus = 'draf' | 'terjadwal' | 'terbit' | 'arsip' | 'batal' | 'aktif' | 'baru';

interface AdminStatusBadgeProps {
  status: BadgeStatus | string;
  className?: string;
}

export function AdminStatusBadge({ status, className = '' }: AdminStatusBadgeProps) {
  const norm = status.toLowerCase();

  switch (norm) {
    case 'terbit':
    case 'aktif':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] ${className}`}
        >
          ● {norm === 'aktif' ? 'Aktif' : 'Terbit'}
        </span>
      );
    case 'terjadwal':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] ${className}`}
        >
          ◐ Terjadwal
        </span>
      );
    case 'draf':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] ${className}`}
        >
          ○ Draf
        </span>
      );
    case 'arsip':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E5E7EB] text-[#4B5563] border border-[#D1D5DB] ${className}`}
        >
          Arsip
        </span>
      );
    case 'batal':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] ${className}`}
        >
          ✕ Batal
        </span>
      );
    case 'baru':
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFF200] text-[#1F2F6B] border border-[#FDE047] ${className}`}
        >
          ★ Baru
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3F4F6] text-[#374151] ${className}`}
        >
          {status}
        </span>
      );
  }
}
