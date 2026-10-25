'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Clock,
  MapPin,
  User,
  CalendarPlus,
  CheckCircle2,
  FileCheck,
  AlertOctagon,
  ImageIcon,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHero } from '@/components/ui/PageHero';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { downloadIcsFile } from '@/lib/ics';
import { KajianItem } from '@/lib/types';
import { saringKajianAktif, tanggalHariIniWIB } from '@/lib/kajian';
import kajianProgramData from '@/content/programs/kajian.json';

export default function KajianProgramPage() {
  const [programData, setProgramData] = useState({
    judul: kajianProgramData.judul,
    subjudul: kajianProgramData.subjudul,
    deskripsi: kajianProgramData.deskripsi,
  });
  // CMS adalah sumber kebenaran untuk jadwal: mulai kosong, isi dari API.
  const [kajianList, setKajianList] = useState<KajianItem[]>([]);
  const [activeFlyer, setActiveFlyer] = useState<{ url: string; tema: string } | null>(null);
  const todayStr = tanggalHariIniWIB();

  useEffect(() => {
    async function fetchProgramData() {
      try {
        const res = await fetch('/api/programs/kajian', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.program) {
            setProgramData({
              judul: data.program.judul || kajianProgramData.judul,
              subjudul: data.program.ringkasan || kajianProgramData.subjudul,
              deskripsi: data.program.deskripsi || kajianProgramData.deskripsi,
            });
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data program kajian live:', err);
      }
    }

    async function fetchKajian() {
      try {
        const res = await fetch('/api/kajian', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // Hormati CMS: kosong → kosong (jangan fallback ke data lokal basi)
          setKajianList(
            saringKajianAktif(Array.isArray(data.kajian) ? data.kajian : [])
          );
        }
      } catch (err) {
        console.error('Gagal mengambil data kajian live:', err);
      }
    }

    fetchProgramData();
    fetchKajian();
  }, []);

  return (
    <div className="pt-[72px]">
      <PageHero
        image="/images/banners/kajian.jpg"
        imageAlt="Kitab-kitab klasik dan tasbih di atas rehal kayu dengan cahaya hangat"
        badge={
          <>
            <BookOpen className="w-3.5 h-3.5" />
            <span>Majelis Talabul &apos;Ilmi</span>
          </>
        }
        title={programData.judul}
        subtitle={programData.subjudul}
      />

      {/* Deskripsi & Dalil */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800">
                Pentingnya Menuntut Ilmu Syar&apos;i yang Murni
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                {programData.deskripsi}
              </p>
            </div>

            {/* Dalil Box */}
            <div className="lg:col-span-5 bg-yimi-blue-50/70 border border-yimi-blue-600/20 rounded-3xl p-8 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-yimi-blue-600 bg-white px-3 py-1 rounded-full border border-yimi-blue-600/20 mb-4 inline-block">
                Landasan Hadits Shahih
              </span>
              <p
                lang="ar"
                dir="rtl"
                className="font-arabic text-2xl sm:text-3xl text-yimi-blue-800 leading-[1.8] my-4 text-center"
              >
                {kajianProgramData.landasanDalil.arab}
              </p>
              <p className="text-sm text-neutral-700 italic leading-relaxed text-center mb-3">
                &ldquo;{kajianProgramData.landasanDalil.terjemahan}&rdquo;
              </p>
              <p className="text-xs font-bold text-center text-yimi-green-700">
                {kajianProgramData.landasanDalil.sumber}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seluruh Jadwal Kajian */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Jadwal Lengkap Majelis Ilmu
            </h2>
            <p className="text-sm text-neutral-600">
              Kajian diselenggarakan secara rutin terbuka untuk ikhwan dan akhwat dengan tempat terpisah.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {kajianList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-neutral-600">
                  Belum ada jadwal kajian mendatang.
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Jadwal yang sudah terlewat tersimpan sebagai arsip di CMS. Pantau halaman ini untuk info kajian terbaru, insya Allah.
                </p>
              </div>
            ) : (
            kajianList.map((item) => {
              const isToday = item.tanggal === todayStr;
              const isBatal = item.status === 'batal';

              return (
                <Card
                  key={item.id}
                  hoverEffect
                  className={`p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-200 ${
                    isBatal
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-neutral-200/80'
                  }`}
                >
                  {/* Left Date */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div
                      className={`w-20 md:w-24 py-3 rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${
                        isBatal
                          ? 'bg-rose-100/70 text-rose-800'
                          : 'bg-yimi-blue-50 text-yimi-blue-800'
                      }`}
                    >
                      <span
                        className={`text-xs font-bold uppercase ${
                          isBatal ? 'text-rose-700' : 'text-yimi-blue-600'
                        }`}
                      >
                        {item.hari}
                      </span>
                      <span
                        className={`text-2xl md:text-3xl font-extrabold font-mono my-1 ${
                          isBatal ? 'text-rose-900' : 'text-yimi-blue-800'
                        }`}
                      >
                        {item.tanggal ? new Date(item.tanggal).getDate() : '-'}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          isBatal ? 'text-rose-600' : 'text-neutral-500'
                        }`}
                      >
                        {item.tanggal
                          ? new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(
                              new Date(item.tanggal)
                            )
                          : ''}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 md:hidden">
                      {isBatal ? (
                        <Badge variant="red" className="font-bold text-[10px]">
                          Batal
                        </Badge>
                      ) : isToday ? (
                        <Badge variant="green">Hari Ini</Badge>
                      ) : null}
                      <Badge variant="blue" className="text-[10px]">
                        {item.kategori}
                      </Badge>
                    </div>
                  </div>

                  {/* Middle Info */}
                  <div className="flex-1 flex flex-col gap-2.5">
                    <div className="hidden md:flex items-center gap-2">
                      {isBatal ? (
                        <Badge variant="red" className="font-bold tracking-wider">
                          Kajian Dibatalkan
                        </Badge>
                      ) : isToday ? (
                        <Badge variant="green">Hari Ini</Badge>
                      ) : null}
                      <Badge variant="blue" className="text-[10px]">
                        {item.kategori}
                      </Badge>
                      <span className="text-xs text-neutral-500 font-medium">
                        {item.sifat}
                      </span>
                    </div>

                    <h3
                      className={`text-lg md:text-xl font-bold leading-snug ${
                        isBatal
                          ? 'text-neutral-500 line-through decoration-rose-500/80'
                          : 'text-yimi-blue-800'
                      }`}
                    >
                      {item.tema}
                    </h3>

                    {/* Announcement Notice for Cancelled Kajian */}
                    {isBatal && (
                      <div className="flex items-start sm:items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <strong className="font-bold">Pemberitahuan: Kajian Dibatalkan.</strong>{' '}
                          {item.alasan_batal ? (
                            <span>Alasan: {item.alasan_batal}</span>
                          ) : (
                            <span>Ustadz berhalangan hadir. Mohon maaf atas ketidaknyamanan jamaah.</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs md:text-sm text-neutral-600">
                      <div
                        className={`flex items-center gap-1.5 font-semibold ${
                          isBatal ? 'text-neutral-500' : 'text-yimi-blue-800'
                        }`}
                      >
                        <User
                          className={`w-4 h-4 shrink-0 ${
                            isBatal ? 'text-neutral-400' : 'text-yimi-green-700'
                          }`}
                        />
                        <span>{item.pemateri}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>{item.waktu}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span>{item.tempat}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Download & Flyer Button */}
                  <div className="w-full md:w-auto flex flex-wrap items-center justify-end gap-2.5">
                    {(item.flyer_url || item.gambar) && (
                      <button
                        type="button"
                        onClick={() => setActiveFlyer({ url: item.flyer_url || item.gambar || '', tema: item.tema })}
                        className="px-3.5 py-2.5 rounded-xl bg-yimi-blue-50 hover:bg-yimi-blue-100 text-yimi-blue-800 text-xs font-bold border border-yimi-blue-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Lihat Flyer / Poster Kajian"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-yimi-blue-600" />
                        <span>Lihat Flyer</span>
                      </button>
                    )}

                    {isBatal ? (
                      <button
                        disabled
                        type="button"
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center justify-center gap-1.5 opacity-80 cursor-not-allowed"
                      >
                        <AlertOctagon className="w-4 h-4" />
                        <span>Kajian Dibatalkan</span>
                      </button>
                    ) : (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => downloadIcsFile(item)}
                        className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs"
                      >
                        <CalendarPlus className="w-4 h-4" />
                        <span>Simpan Jadwal (.ics)</span>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            }))}
          </div>
        </div>

        {/* Modal Lightbox Flyer Kajian */}
        {activeFlyer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between p-3.5 border-b border-neutral-100 bg-white">
                <span className="text-xs font-bold text-neutral-800 line-clamp-1">
                  Flyer: {activeFlyer.tema}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveFlyer(null)}
                  className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-full aspect-3/4 max-h-[75vh] bg-neutral-950">
                <Image
                  src={activeFlyer.url}
                  alt={activeFlyer.tema}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="object-contain"
                />
              </div>
              <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <a
                  href={activeFlyer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yimi-blue-700 hover:underline font-semibold"
                >
                  Buka Gambar Asli
                </a>
                <button
                  type="button"
                  onClick={() => setActiveFlyer(null)}
                  className="px-3.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Fasilitas & Tata Tertib Majelis */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Fasilitas */}
            <div className="p-8 rounded-3xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck className="w-6 h-6 text-yimi-blue-600" />
                <h3 className="text-xl font-bold text-yimi-blue-800">
                  Fasilitas Majelis
                </h3>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-neutral-700">
                {kajianProgramData.fasilitas.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-yimi-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Adab Majelis */}
            <div className="p-8 rounded-3xl bg-yimi-blue-50/60 border border-yimi-blue-600/20">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-yimi-blue-600" />
                <h3 className="text-xl font-bold text-yimi-blue-800">
                  Adab &amp; Tata Tertib Majelis
                </h3>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-neutral-700">
                {kajianProgramData.tataTertib.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-yimi-blue-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
