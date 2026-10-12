'use client';

import React, { useState, useEffect } from 'react';
import { CountUp } from '@/components/motion/CountUp';

interface Stats {
  wakaf: number;
  kajian: number;
  program: number;
  artikel: number;
}

/**
 * Pita statistik "YIMI dalam Angka" — angka live dari CMS, fallback 0.
 * Tampil tepat di bawah Hero sebagai jangkar kepercayaan.
 */
export function StatsBand() {
  const [stats, setStats] = useState<Stats>({ wakaf: 0, kajian: 0, program: 0, artikel: 0 });

  useEffect(() => {
    async function fetchStats() {
      const next: Stats = { wakaf: 0, kajian: 0, program: 0, artikel: 0 };
      try {
        const [lahan, kajian, programs, berita] = await Promise.allSettled([
          fetch('/api/lahan', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/kajian', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/programs', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
          fetch('/api/berita', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
        ]);
        if (lahan.status === 'fulfilled' && lahan.value?.campaign?.terkumpul) {
          next.wakaf = Number(lahan.value.campaign.terkumpul) || 0;
        }
        if (kajian.status === 'fulfilled' && Array.isArray(kajian.value?.kajian)) {
          next.kajian = kajian.value.kajian.length;
        }
        if (programs.status === 'fulfilled' && Array.isArray(programs.value?.programs)) {
          next.program = programs.value.programs.length;
        }
        if (berita.status === 'fulfilled' && Array.isArray(berita.value?.news)) {
          next.artikel = berita.value.news.length;
        }
        setStats(next);
      } catch (err) {
        console.error('Gagal memuat statistik:', err);
      }
    }
    fetchStats();
  }, []);

  const items = [
    { value: stats.wakaf, prefix: 'Rp ', label: 'Dana Wakaf Terkumpul', sub: 'transparan & terverifikasi' },
    { value: stats.kajian, prefix: '', label: 'Jadwal Kajian Mendatang', sub: 'terbuka untuk umum' },
    { value: stats.program, prefix: '', label: 'Program Dakwah Aktif', sub: 'pendidikan & sosial' },
    { value: stats.artikel, prefix: '', label: 'Artikel & Warta Dakwah', sub: 'kajian ilmiah ringkas' },
  ];

  return (
    <section className="relative bg-yimi-blue-950 text-white overflow-hidden">
      {/* Motif bintang samar */}
      <div
        className="absolute inset-0 bg-star8-pattern opacity-[0.05] pointer-events-none"
        aria-hidden="true"
      />
      {/* Garis aksen biru langit di tepi atas */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-yimi-green-500 to-transparent" aria-hidden="true" />

      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10 py-12 md:py-14">
        <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-yimi-green-500 mb-8">
          YIMI dalam Angka
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {items.map((item) => (
            <div key={item.label} className="text-center flex flex-col items-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                <CountUp end={item.value} prefix={item.prefix} duration={1800} />
              </span>
              <span className="mt-2 text-sm font-bold text-blue-100">{item.label}</span>
              <span className="text-xs text-blue-200/70">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
