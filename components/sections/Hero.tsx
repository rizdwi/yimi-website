'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import siteData from '@/content/site.json';

export function Hero() {
  const [tagline, setTagline] = useState('Dakwah di Atas Sunnah Sesuai Pemahaman Salafus Shalih');
  const [subtitle, setSubtitle] = useState(
    'Mengajak kaum muslimin kepada pemurnian aqidah dan ibadah, menyemai generasi Qur\'ani, serta menebar kemaslahatan umat berlandaskan Al-Qur\'an dan As-Sunnah.'
  );

  useEffect(() => {
    async function fetchHomeContent() {
      try {
        const res = await fetch('/api/halaman?kunci=beranda');
        if (res.ok) {
          const data = await res.json();
          if (data.page?.konten) {
            if (data.page.konten.heroTagline) setTagline(data.page.konten.heroTagline);
            if (data.page.konten.heroSubtitle) setSubtitle(data.page.konten.heroSubtitle);
          }
        }
      } catch (err) {
        console.error('Failed to load hero content:', err);
      }
    }

    fetchHomeContent();
  }, []);

  const scrollToContent = () => {
    const nextSection = document.getElementById('pengantar');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[100svh] min-h-[560px] flex flex-col justify-between items-center overflow-hidden pt-24 pb-8 bg-linear-to-b from-yimi-blue-50 via-white to-white">
      {/* Layer 1: Parallax Islamic 8-Pointed Star Silhouette Motif (speed 0.3x) */}
      <ParallaxLayer
        speed={0.3}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] pointer-events-none opacity-[0.08]"
      >
        <div className="w-full h-full bg-star8-pattern bg-center" />
      </ParallaxLayer>

      {/* Layer 2: Ambient Lighting Highlights */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yimi-blue-600/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content Layer (Layer 3 & 4) */}
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 flex-1 flex flex-col items-center justify-center text-center relative z-10 my-auto">
        {/* Foundation Logo (Entrance scale animation 0.9 -> 1) */}
        <div className="relative mb-6 group">
          <div className="w-[160px] h-[160px] md:w-[210px] md:h-[210px] relative transition-transform duration-900 ease-out hover:scale-105">
            <Image
              src="/logo/logo-yimi.svg"
              alt="Logo Resmi Yayasan Insan Muslim Istiqomah"
              width={210}
              height={210}
              priority
              className="w-full h-full object-contain drop-shadow-[0_12px_32px_rgba(31,47,107,0.12)]"
            />
          </div>
        </div>

        {/* Foundation Eyebrow Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-yimi-blue-600/15 text-yimi-blue-800 text-xs md:text-sm font-bold tracking-widest uppercase mb-4 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-yimi-green-500 animate-pulse" />
          <span>{siteData.namaLengkap}</span>
        </div>

        {/* Hero Title */}
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
            variant="outline"
            size="lg"
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-yimi-blue-600 text-yimi-blue-600 hover:bg-yimi-blue-50"
          >
            <Heart className="w-5 h-5 text-yimi-blue-600" />
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
