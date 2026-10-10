'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Layers,
  Calendar,
  LandPlot,
  Newspaper,
  Image as ImageIcon,
  FolderOpen,
  Inbox,
  History,
  Download,
  UserCheck,
  BarChart3,
  X,
} from 'lucide-react';
import { StarOrnament } from '@/components/ui/StarOrnament';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export function AdminSidebar({ isOpen, onClose, unreadCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Traffic Pengunjung', href: '/admin/analitik', icon: BarChart3 },
    { label: 'Pengaturan Situs', href: '/admin/pengaturan', icon: Settings },
    { label: 'Halaman Statis', href: '/admin/halaman', icon: FileText },
    { label: 'Program', href: '/admin/program', icon: Layers },
    { label: 'Jadwal Kajian', href: '/admin/kajian', icon: Calendar },
    { label: 'Pembebasan Lahan', href: '/admin/lahan', icon: LandPlot },
    { label: 'Berita & Warta', href: '/admin/berita', icon: Newspaper },
    { label: 'Galeri Kegiatan', href: '/admin/galeri', icon: ImageIcon },
    { label: 'Media Library', href: '/admin/media', icon: FolderOpen },
    {
      label: 'Pesan Masuk',
      href: '/admin/pesan',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'Riwayat Perubahan', href: '/admin/riwayat', icon: History },
    { label: 'Ekspor & Cadangan', href: '/admin/cadangan', icon: Download },
    { label: 'Pengaturan Akun', href: '/admin/akun', icon: UserCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[248px] bg-[#1F2F6B] text-white flex flex-col transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 bg-[#162352]">
          <Link href="/admin" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3E5FD1] flex items-center justify-center text-white shadow-sm">
              <StarOrnament size={20} className="text-[#FFF200]" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide text-white block">
                YIMI PANEL
              </span>
              <span className="text-[10px] text-white/70 block leading-none">
                Admin CMS v1.0
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="Tutup Menu"
            className="p-1 rounded-md text-white/70 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#3E5FD1] text-white shadow-xs'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-white/70'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-[#FFF200] text-[#1F2F6B]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 bg-[#162352]/50 text-xs text-white/60 flex items-center justify-between">
          <span>Login: Rizz (Admin)</span>
          <span className="w-2 h-2 rounded-full bg-[#2EE05A]" title="Sistem Aktif" />
        </div>
      </aside>
    </>
  );
}
