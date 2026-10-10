import React from 'react';
import Link from 'next/link';
import { Home, Calendar, Heart, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between text-[#111827]">
      {/* Top Bar minimal */}
      <header className="w-full bg-white border-b border-neutral-200/80 py-4 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-yimi-blue-800 tracking-tight">
              YAYASAN INSAN MUSLIM ISTIQOMAH
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-yimi-blue-600 hover:text-yimi-blue-800 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="max-w-xl w-full text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yimi-blue-50 text-yimi-blue-600 text-xs font-bold uppercase tracking-wider mb-6 border border-yimi-blue-200/60">
            <Search className="w-3.5 h-3.5" />
            <span>Kode Status: 404 Not Found</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-yimi-blue-800 tracking-tight mb-4">
            Afwan, Halaman Tidak Ditemukan
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-8 max-w-md mx-auto">
            Halaman yang Anda tuju mungkin telah dipindahkan, alamat URL salah ketik, atau belum dipublikasikan oleh pengelola yayasan.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <Button variant="primary" size="md" className="gap-2">
                <Home className="w-4 h-4" />
                <span>Ke Beranda Utama</span>
              </Button>
            </Link>
            <Link href="/program/kajian">
              <Button variant="outline" size="md" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span>Jadwal Kajian</span>
              </Button>
            </Link>
            <Link href="/donasi">
              <Button variant="secondary" size="md" className="gap-2">
                <Heart className="w-4 h-4 text-yimi-yellow-500" />
                <span>Saluran Donasi</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="w-full bg-white border-t border-neutral-200/80 py-4 px-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Yayasan Insan Muslim Istiqomah (YIMI) • Menebar Sunnah, Menjaga Istiqomah
      </footer>
    </div>
  );
}
