'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for debugging/telemetry
    console.error('Unhandled runtime error in YIMI app:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between text-[#111827]">
      <header className="w-full bg-white border-b border-neutral-200/80 py-4 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <span className="font-extrabold text-lg text-yimi-blue-800 tracking-tight">
            YAYASAN INSAN MUSLIM ISTIQOMAH
          </span>
          <Link
            href="/"
            className="text-xs font-semibold text-yimi-blue-600 hover:text-yimi-blue-800 transition-colors"
          >
            Beranda Utama
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
            Afwan, Terjadi Kendala Teknis
          </h1>

          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            Sistem kami mendeteksi gangguan sementara saat memuat data. Silakan muat ulang halaman atau coba kembali beberapa saat lagi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => reset()}
              className="gap-2 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                <span>Ke Beranda</span>
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200/80">
            <a
              href="https://wa.me/6281234567890?text=Assalamu%27alaikum%20Admin%20YIMI%2C%20saya%20mengalami%20kendala%20saat%20mengakses%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-yimi-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-yimi-green-500" />
              <span>Hubungi Pengurus Teknis Yayasan</span>
            </a>
          </div>
        </div>
      </main>

      <footer className="w-full bg-white border-t border-neutral-200/80 py-4 px-6 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Yayasan Insan Muslim Istiqomah (YIMI)
      </footer>
    </div>
  );
}
