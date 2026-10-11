import React from 'react';
import Image from 'next/image';

interface PageHeroProps {
  /** Path banner di /public, mis. /images/banners/tentang.jpg */
  image: string;
  imageAlt: string;
  badge: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Konten tambahan di bawah subtitle (mis. info lokasi). */
  extra?: React.ReactNode;
  align?: 'center' | 'left';
}

/**
 * Hero standar halaman dalam: banner tematik + overlay gradasi + badge/judul.
 * Teks selalu putih dengan overlay gelap agar terbaca di atas foto.
 */
export function PageHero({
  image,
  imageAlt,
  badge,
  title,
  subtitle,
  extra,
  align = 'center',
}: PageHeroProps) {
  const centered = align === 'center';

  return (
    <section className="relative h-80 min-h-[320px] md:h-96 text-white flex items-center overflow-hidden bg-yimi-blue-950">
      {/* Banner tematik — opacity 50% di atas dasar biru navy */}
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      {/* Overlay gradasi: keterbacaan teks di atas foto */}
      <div
        className="absolute inset-0 bg-linear-to-b from-yimi-blue-950/60 via-yimi-blue-950/45 to-yimi-blue-950/75 pointer-events-none"
        aria-hidden="true"
      />
      {/* Gelap lokal di belakang teks agar tulisan selalu terbaca */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          centered
            ? 'bg-[radial-gradient(ellipse_65%_85%_at_50%_50%,rgb(6_12_34/0.55),transparent)]'
            : 'bg-[radial-gradient(ellipse_60%_90%_at_30%_50%,rgb(6_12_34/0.6),transparent)]'
        }`}
        aria-hidden="true"
      />

      <div
        className={`max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10 ${
          centered ? 'text-center' : ''
        }`}
      >
        <div className={centered ? 'flex flex-col items-center' : 'max-w-3xl flex flex-col'}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-yimi-yellow-400 text-xs font-bold uppercase tracking-wider mb-3 border border-white/15 backdrop-blur-xs w-fit drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
            {badge}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-blue-100 max-w-xl leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
              {subtitle}
            </p>
          )}
          {extra}
        </div>
      </div>
    </section>
  );
}
