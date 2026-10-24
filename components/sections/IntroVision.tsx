'use client';

import React, { useState, useEffect } from 'react';
import { StarOrnament } from '@/components/ui/StarOrnament';
import aboutData from '@/content/about.json';

export function IntroVision() {
  const [dalilQuran, setDalilQuran] = useState({
    arab: aboutData.manhaj.dalilQuran.arab,
    terjemahan: aboutData.manhaj.dalilQuran.terjemahan,
    sumber: aboutData.manhaj.dalilQuran.sumber,
  });

  useEffect(() => {
    async function loadIntro() {
      try {
        const res = await fetch('/api/halaman?kunci=tentang');
        if (res.ok) {
          const data = await res.json();
          const q = data.page?.konten?.manhaj?.dalilQuran;
          if (q) {
            setDalilQuran({
              arab: q.arab || q.teksArab || aboutData.manhaj.dalilQuran.arab,
              terjemahan: q.terjemahan || aboutData.manhaj.dalilQuran.terjemahan,
              sumber: q.sumber || aboutData.manhaj.dalilQuran.sumber,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load intro vision dalil:', err);
      }
    }
    loadIntro();
  }, []);

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
