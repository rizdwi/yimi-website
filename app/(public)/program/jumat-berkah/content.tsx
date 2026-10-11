'use client';

import React, { useState, useEffect } from 'react';
import { HeartHandshake, Utensils, Heart, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/format';
import fallbackJumatData from '@/content/programs/jumat-berkah.json';

interface PaketInfaqItem {
  nama: string;
  nominal: number;
  deskripsi: string;
}

interface MekanismePenyaluranItem {
  tahap: string;
  rincian: string;
}

interface LandasanDalil {
  arab: string;
  terjemahan: string;
  sumber: string;
}

interface JumatData {
  judul: string;
  subjudul: string;
  deskripsi: string;
  ajakan: string;
  landasanDalil: LandasanDalil;
  paketInfaq: PaketInfaqItem[];
  mekanismePenyaluran: MekanismePenyaluranItem[];
}

export default function JumatBerkahPage() {
  const [jumatData, setJumatData] = useState<JumatData>(fallbackJumatData as JumatData);
  const [paketInfaq, setPaketInfaq] = useState<PaketInfaqItem[]>(fallbackJumatData.paketInfaq);
  const [fileLampiran, setFileLampiran] = useState<string>('');

  useEffect(() => {
    async function loadLiveJumat() {
      try {
        const res = await fetch('/api/programs/jumat-berkah', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.program) {
            if (
              json.program.metadata?.paket_infaq &&
              Array.isArray(json.program.metadata.paket_infaq)
            ) {
              setPaketInfaq(json.program.metadata.paket_infaq as PaketInfaqItem[]);
            }
            if (json.program.metadata?.file_lampiran) {
              setFileLampiran(json.program.metadata.file_lampiran);
            }
            if (json.program.judul) {
              setJumatData((prev) => ({
                ...prev,
                judul: json.program.judul,
                subjudul: json.program.ringkasan || prev.subjudul,
                deskripsi: json.program.deskripsi || prev.deskripsi,
              }));
            }
          }
        }
      } catch (err) {
        console.error('Gagal memuat data live Jumat Berkah:', err);
      }
    }
    loadLiveJumat();
  }, []);

  return (
    <div className="pt-[72px]">
      <PageHero
        image="/images/banners/jumat-berkah.jpg"
        imageAlt="Paket makanan sedekah yang disiapkan dengan latar masjid di pagi hari"
        badge={
          <>
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Sedekah Sosial</span>
          </>
        }
        title={jumatData.judul}
        subtitle={jumatData.subjudul}
      />

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

              {fileLampiran && (
                <div className="pt-2">
                  <a
                    href={fileLampiran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yimi-blue-50 text-yimi-blue-700 hover:bg-yimi-blue-100 border border-yimi-blue-200 text-xs font-bold transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-yimi-blue-600" />
                    <span>Unduh Brosur &amp; Laporan Penyaluran (PDF)</span>
                  </a>
                </div>
              )}
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
            {paketInfaq.map((paket: PaketInfaqItem, idx: number) => (
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
            {jumatData.mekanismePenyaluran.map(
              (item: MekanismePenyaluranItem, idx: number) => (
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
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
