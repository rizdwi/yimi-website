import React from 'react';
import Link from 'next/link';
import { Landmark, ArrowRight, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CountUp } from '@/components/motion/CountUp';
import { ParallaxLayer } from '@/components/motion/ParallaxLayer';
import { formatRupiah, formatPersen } from '@/lib/format';
import landDataFallback from '@/content/land-campaign.json';

// Server Component: data kampanye dari server (props halaman beranda, CMS
// via lib/home-data). Dulu client component yang fetch /api/lahan setelah
// load dengan state awal fallback — angka "berganti" setelah paint (CLS)
// dan menambah blocking time. ParallaxLayer & CountUp tetap client
// component (dirender sebagai children), tapi section ini sendiri tidak
// lagi me-render ulang setelah fetch.
export function LandBanner({
  campaign: campaignProp,
}: {
  campaign: Record<string, unknown> | null;
}) {
  const c = (campaignProp ?? {}) as Record<string, unknown>;
  const campaign = {
    judul:
      (typeof c.judul === 'string' && c.judul) || landDataFallback.judul,
    lokasi:
      (typeof c.lokasi === 'string' && c.lokasi) || landDataFallback.lokasi,
    luasTargetM2:
      Number(c.luasTargetM2) || landDataFallback.luasTargetM2,
    targetDana: Number(c.targetDana) || landDataFallback.targetDana,
    terkumpul: Number(c.terkumpul) || 0,
  };

  const percentage = formatPersen(campaign.terkumpul, campaign.targetDana);

  return (
    <section className="relative py-20 md:py-28 bg-yimi-blue-800 text-white overflow-hidden">
      {/* Background Parallax Layer (0.4x) with Islamic Geometric Star Overlay */}
      <ParallaxLayer
        speed={0.4}
        className="absolute inset-0 w-full h-[140%] -top-[20%] pointer-events-none opacity-15"
      >
        <div className="w-full h-full bg-star8-pattern bg-center" />
      </ParallaxLayer>

      {/* Radial soft lighting highlight */}
      <div
        className="absolute -top-32 right-1/4 w-96 h-96 bg-yimi-blue-600/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Context & Title */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-yimi-yellow-400 text-xs font-bold uppercase tracking-wider w-fit border border-white/15">
              <Landmark className="w-4 h-4" />
              <span>Program Wakaf Abadi</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Pembebasan Lahan Wakaf Masjid &amp; Sentra Dakwah
            </h2>

            <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-xl">
              Ikhtiar bersama membebaskan lahan seluas{' '}
              <strong className="text-white font-bold">
                {campaign.luasTargetM2.toLocaleString('id-ID')} m²
              </strong>{' '}
              untuk pembangunan Masjid Jami&apos; YIMI dan gedung representatif TK Islam Insan Muslim Istiqomah.{' '}
              <Link
                href="/berita/wakaf-karawang-amalan-yang-pahalanya-terus-mengalir-meski-kita-telah-tiada"
                className="underline decoration-yimi-yellow-400/70 underline-offset-4 text-white hover:text-yimi-yellow-400 transition-colors font-semibold"
              >
                Baca keutamaan wakaf Karawang
              </Link>
              .
            </p>

            <div className="flex items-center gap-2 text-xs md:text-sm text-blue-200 mt-1">
              <MapPin className="w-4 h-4 text-yimi-green-500 shrink-0" />
              <span>{campaign.lokasi}</span>
            </div>
          </div>

          {/* Right Column: Donation Progress Card */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                Dana Wakaf Terkumpul
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-yimi-yellow-400 font-mono tracking-tight">
                  <CountUp
                    end={campaign.terkumpul}
                    prefix="Rp "
                    duration={1500}
                  />
                </span>
              </div>
              <span className="text-xs text-blue-200">
                dari target kebutuhan {formatRupiah(campaign.targetDana)}
              </span>
            </div>

            {/* Progress Bar with Green fill #5eb2f2 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-white">
                <span className="text-yimi-green-500 text-sm">
                  {percentage}% Tercapai
                </span>
                <span className="text-blue-200">
                  Sisa {formatRupiah(Math.max(0, campaign.targetDana - campaign.terkumpul))}
                </span>
              </div>
              <ProgressBar
                percentage={percentage}
                height="h-3"
                trackColor="bg-white/20"
                fillColor="bg-yimi-green-500"
                label="Progres penggalangan dana pembebasan lahan"
              />
            </div>

            {/* Action Buttons: Ikut Berinfaq & Lihat Detail */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                href="/donasi"
                variant="secondary"
                size="md"
                className="flex-1 flex items-center justify-center gap-2 text-yimi-blue-800 font-extrabold"
              >
                <Heart className="w-4 h-4 fill-yimi-blue-800" />
                <span>Ikut Berinfaq</span>
              </Button>

              <Button
                href="/pembebasan-lahan"
                variant="white"
                size="md"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <span>Lihat Detail</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
