import React from 'react';
import type { Metadata } from 'next';
import { HeartHandshake, Utensils, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { constructMetadata } from '@/lib/seo';
import { formatRupiah } from '@/lib/format';
import jumatData from '@/content/programs/jumat-berkah.json';

export const metadata: Metadata = constructMetadata({
  title: 'Program Sedekah Jumat Berkah & Sosial Umat',
  description:
    'Penyaluran sedekah makanan dan paket pangan setiap hari Jumat untuk dhuafa, musafir, santri, dan jamaah masjid binaan Yayasan Insan Muslim Istiqomah.',
});

export default function JumatBerkahPage() {
  return (
    <div className="pt-[72px]">
      {/* Subpage Hero */}
      <section className="relative h-80 min-h-[320px] bg-yimi-blue-800 text-white flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-star8-pattern opacity-[0.06] pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-yimi-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Sedekah Sosial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            {jumatData.judul}
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            {jumatData.subjudul}
          </p>
        </div>
      </section>

      {/* Deskripsi & Dalil */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800">
                Meraih Keutamaan Sedekah di Sayyidul Ayyam
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                {jumatData.deskripsi}
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {jumatData.ajakan}
              </p>
            </div>

            {/* Dalil Box */}
            <div className="lg:col-span-5 bg-yimi-blue-50/70 border border-yimi-blue-600/20 rounded-3xl p-8 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-yimi-blue-600 bg-white px-3 py-1 rounded-full border border-yimi-blue-600/20 mb-4 inline-block">
                Landasan Al-Qur&apos;an
              </span>
              <p
                lang="ar"
                dir="rtl"
                className="font-arabic text-2xl sm:text-3xl text-yimi-blue-800 leading-[1.8] my-4 text-center"
              >
                {jumatData.landasanDalil.arab}
              </p>
              <p className="text-sm text-neutral-700 italic leading-relaxed text-center mb-3">
                &ldquo;{jumatData.landasanDalil.terjemahan}&rdquo;
              </p>
              <p className="text-xs font-bold text-center text-yimi-green-700">
                {jumatData.landasanDalil.sumber}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilihan Paket Infaq */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Pilihan Paket Infaq Jumat Berkah
            </h2>
            <p className="text-sm text-neutral-600">
              Pilih nominal infaq sesuai keikhlasan dan kemampuan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jumatData.paketInfaq.map((paket, idx) => (
              <Card
                key={idx}
                hoverEffect
                className="p-8 flex flex-col justify-between border-neutral-200/80 group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center mb-6 group-hover:bg-yimi-blue-600 group-hover:text-white transition-colors">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-yimi-blue-800 mb-2">
                    {paket.nama}
                  </h3>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-yimi-blue-600 mb-4">
                    {formatRupiah(paket.nominal)}
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                    {paket.deskripsi}
                  </p>
                </div>

                <Button
                  href="/donasi"
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Salurkan Infaq</span>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mekanisme Penyaluran */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Alur &amp; Mekanisme Distribusi
            </h2>
            <p className="text-sm text-neutral-600">
              Proses pengelolaan yang amanah, tepat sasaran, dan terdokumentasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jumatData.mekanismePenyaluran.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col gap-3"
              >
                <span className="w-8 h-8 rounded-xl bg-yimi-green-500 text-yimi-blue-800 font-bold text-sm flex items-center justify-center">
                  {idx + 1}
                </span>
                <h3 className="text-base font-bold text-yimi-blue-800">
                  {item.tahap}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.rincian}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
