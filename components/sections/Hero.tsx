'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import siteData from '@/content/site.json';

// Tagline & subtitle DARI SERVER (props dari halaman beranda, yang mengambil
// dari CMS via lib/home-data). Dulu di-fetch client-side setelah load
// (useEffect) dengan state awal kosong — H1 kosong di paint pertama, LCP
// 4,1 dtk. Kini H1 sudah ada di HTML awal. Tanpa fallback ke site.json —
// bila CMS kosong, hero kosong (perintah user 2026-10-25).
export function Hero({
  tagline,
  subtitle,
}: {
  tagline: string;
  subtitle: string;
}) {
  const { logoUrl, namaYayasan } = useSiteSettings();

  const scrollToContent = () => {
    const nextSection = document.getElementById('pengantar');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[100svh] min-h-[560px] flex flex-col justify-between items-center overflow-hidden pt-24 pb-8 bg-linear-to-b from-yimi-blue-50 via-white to-white">
      {/* Layer 1: Islamic 8-Pointed Star Silhouette Motif (parallax latar).
          Mode 'background': hanya background-position yang bergerak mengikuti
          scroll, kotak elemen diam — sebelumnya mode transform membuat div ini
          jadi satu-satunya penyebab CLS 0,190 di Lighthouse (perbaikan 2026-10-25). */}
      <ParallaxLayer
        speed={0.3}
        mode="background"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] pointer-events-none opacity-[0.08] bg-star8-pattern bg-center"
      />

      {/* Layer 2: Ambient Lighting Highlights */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yimi-blue-600/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content Layer (Layer 3 & 4) */}
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 flex-1 flex flex-col items-center justify-center text-center relative z-10 my-auto">
        {/* Foundation Logo (Entrance scale animation 0.9 -> 1) */}
        <div className="relative mb-6 group">
          <div className="w-[160px] h-[160px] md:w-[210px] md:h-[210px] relative transition-transform duration-900 ease-out hover:scale-105 flex items-center justify-center">
            <Image
              src={logoUrl}
              alt={`Logo Resmi ${namaYayasan}`}
              width={210}
              height={210}
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 160px, 210px"
              unoptimized={Boolean(logoUrl && logoUrl.endsWith('.svg'))}
              className="w-full h-full object-contain drop-shadow-[0_12px_32px_rgba(31,47,107,0.12)]"
            />
          </div>
        </div>

        {/* Foundation Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-yimi-blue-600/15 text-yimi-blue-800 text-xs md:text-sm font-bold tracking-widest uppercase mb-4 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-yimi-green-500 animate-pulse" />
          <span>{namaYayasan || siteData.namaLengkap}</span>
        </div>

        {/* Hero Title — tagline CMS statis (baris pertama) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-yimi-blue-800 tracking-tight max-w-4xl leading-[1.15] mb-5">
          {tagline}
        </h1>

        {/* Hero Tagline Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl font-normal leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* CTA Buttons (Primary & Secondary) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          <Button
            href="/program"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2 group"
          >
            <span>Program Kami</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Button>

          <Button
            href="/pembebasan-lahan"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5 text-yimi-blue-800" />
            <span>Ikut Berinfaq Lahan</span>
          </Button>
        </div>
      </div>

      {/* Bottom Scroll Indicator (Bouncing Chevron) */}
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={scrollToContent}
          className="flex flex-col items-center text-neutral-400 hover:text-yimi-blue-600 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yimi-green-500 rounded-lg p-2"
          aria-label="Gulir ke konten berikutnya"
        >
          <span className="text-[11px] font-semibold tracking-wider uppercase mb-1">
            Telusuri
          </span>
          <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-yimi-blue-600" />
        </button>
      </div>
    </section>
  );
}
