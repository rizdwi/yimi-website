import React from 'react';
import { StarOrnament } from '@/components/ui/StarOrnament';
import aboutData from '@/content/about.json';
import type { HomeDalil } from '@/lib/home-data';

// Server Component: dalil dari server (props halaman beranda, CMS via
// lib/home-data), fallback ke about.json bila CMS kosong. Dulu client
// component yang fetch /api/halaman setelah load — dalil "berganti" setelah
// paint (CLS) dan menambah blocking time.
export function IntroVision({ dalil }: { dalil: HomeDalil | null }) {
  const dalilQuran = dalil ?? {
    arab: aboutData.manhaj.dalilQuran.arab,
    terjemahan: aboutData.manhaj.dalilQuran.terjemahan,
    sumber: aboutData.manhaj.dalilQuran.sumber,
  };

  return (
    <section id="pengantar" className="py-20 md:py-24 bg-linear-to-b from-yimi-blue-50/70 via-white to-white relative overflow-hidden">
      {/* Background Star Motif with 4% opacity */}
      <div
        className="absolute inset-0 bg-star8-pattern opacity-[0.035] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10 text-center">
        {/* Star Ornament Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-12 bg-yimi-blue-600/20" />
          <StarOrnament size={36} color="#567790" accentColor="#5eb2f2" />
          <div className="h-px w-12 bg-yimi-blue-600/20" />
        </div>

        {/* Short Vision Statement */}
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yimi-blue-800 max-w-3xl mx-auto leading-relaxed tracking-tight mb-8">
          &ldquo;Menegakkan dakwah Islam yang murni di atas pondasi tauhid, menghidupkan sunnah Rasulullah ﷺ, dan membina generasi berakhlak mulia.&rdquo;
        </p>

        {/* Authentic Dalil Card */}
        <div className="max-w-2xl mx-auto bg-white border border-yimi-blue-600/15 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,40,70,0.08)]">
          <p
            lang="ar"
            dir="rtl"
            className="font-arabic text-2xl sm:text-3xl text-yimi-blue-800 leading-[1.8] mb-4 text-center"
          >
            {dalilQuran.arab}
          </p>
          <p className="text-sm sm:text-base text-neutral-700 italic leading-relaxed mb-3">
            &ldquo;{dalilQuran.terjemahan}&rdquo;
          </p>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-yimi-green-700 bg-white px-3 py-1 rounded-full border border-yimi-green-500/30">
            {dalilQuran.sumber}
          </span>
        </div>
      </div>
    </section>
  );
}
