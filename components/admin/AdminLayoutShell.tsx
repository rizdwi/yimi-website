'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    async function checkAuth() {
      if (isLoginPage) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/me');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }

        // Ambil unread message count untuk badge sidebar
        const dashRes = await fetch('/api/admin/dashboard');
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          setUnreadCount(dashData?.stats?.unreadMessages || 0);
        }
      } catch {
        router.replace('/admin/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  // Halaman Login tidak menggunakan sidebar/topbar admin
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#F5F7FA]">{children}</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#3E5FD1] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#6B7280] font-medium">Memverifikasi sesi aman…</span>
        </div>
      </div>
    );
  }

  // Generate judul halaman berdasarkan rute
  let pageTitle = 'Dashboard Ringkasan';
  if (pathname.includes('/pengaturan')) pageTitle = 'Pengaturan Situs & Rekening';
  else if (pathname.includes('/halaman')) pageTitle = 'Kelola Halaman Statis';
  else if (pathname.includes('/program')) pageTitle = 'Kelola Pilar Program';
  else if (pathname.includes('/kajian')) pageTitle = 'Jadwal Majelis Kajian Ilmiah';
  else if (pathname.includes('/lahan')) pageTitle = 'Progres Wakaf Pembebasan Lahan';
  else if (pathname.includes('/berita')) pageTitle = 'Manajemen Berita & Artikel Dakwah';
  else if (pathname.includes('/galeri')) pageTitle = 'Dokumentasi Galeri Dakwah';
  else if (pathname.includes('/media')) pageTitle = 'Pustaka Berkas & Media';
  else if (pathname.includes('/pesan')) pageTitle = 'Pesan Masuk Formulir Kontak';
  else if (pathname.includes('/riwayat')) pageTitle = 'Riwayat Audit Perubahan';
  else if (pathname.includes('/cadangan')) pageTitle = 'Ekspor & Cadangan Data';
  else if (pathname.includes('/akun')) pageTitle = 'Pengaturan Akun & Keamanan';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      <div className="lg:pl-[248px] flex-1 flex flex-col min-h-screen">
        <AdminTopbar
          title={pageTitle}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1120px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
