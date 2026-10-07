'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ExternalLink, LogOut } from 'lucide-react';

interface AdminTopbarProps {
  onOpenSidebar: () => void;
  title: string;
}

export function AdminTopbar({ onOpenSidebar, title }: AdminTopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E3E7EE] px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          aria-label="Buka navigasi sidebar"
          className="p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F5F7FA] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-[#111827] tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-4">
        {/* Sync Indicator (Design Spec 5.8) */}
        <div
          title="Status Sinkronisasi Website Publik: Berhasil & Sinkron"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-[#DCFCE7] text-[#166534] rounded-full text-xs font-semibold border border-[#BBF7D0]"
        >
          <span className="w-2 h-2 rounded-full bg-[#2EE05A] animate-pulse" />
          <span>● Sinkron</span>
        </div>

        {/* Tombol Lihat Situs Publik */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium text-[#3E5FD1] bg-[#EEF2FC] hover:bg-[#3E5FD1] hover:text-white rounded-lg transition-colors duration-150"
        >
          <span>Lihat Situs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Profil & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#E3E7EE]">
          <div className="hidden md:block text-right">
            <span className="text-xs font-bold text-[#111827] block">Rizz</span>
            <span className="text-[10px] text-[#6B7280] block">Pengelola</span>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar dari Panel Admin"
            aria-label="Keluar dari Panel Admin"
            className="p-2 text-[#D7261E] hover:bg-[#FEE2E2] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
