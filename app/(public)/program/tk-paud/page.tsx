import React from 'react';
import type { Metadata } from 'next';
import {
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
  Phone,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { constructMetadata } from '@/lib/seo';
import tkData from '@/content/programs/tk-paud.json';

export const metadata: Metadata = constructMetadata({
  title: 'TK & PAUD Islam Istiqomah',
  description:
    'Pendidikan anak usia dini berlandaskan aqidah shahihah, adab sunnah, dan tahfidz juz 30 di bawah naungan Yayasan Insan Muslim Istiqomah.',
});

export default function TkPaudPage() {
  const waUrl = `https://wa.me/${tkData.pendaftaran.kontakPendaftaran}?text=${encodeURIComponent(
    tkData.pendaftaran.pesanWA
  )}`;

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
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Pendidikan Usia Dini</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            {tkData.judul}
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            {tkData.subjudul}
          </p>
        </div>
      </section>

      {/* Deskripsi & Ringkasan */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 flex flex-col gap-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800">
                Pondasi Aqidah &amp; Adab Sejak Usia Emas
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                {tkData.deskripsi}
              </p>

              {/* Info Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-yimi-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase text-neutral-500">
                      Target Kelompok Usia
                    </h3>
                    <p className="text-sm font-bold text-yimi-blue-800">
                      {tkData.targetUsia}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yimi-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase text-neutral-500">
                      Waktu Kegiatan Belajar
                    </h3>
                    <p className="text-sm font-bold text-yimi-blue-800">
                      {tkData.waktuBelajar}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendaftaran Quick Card */}
            <div className="lg:col-span-4 bg-yimi-blue-50/80 border border-yimi-blue-600/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs">
              <Badge variant="green" className="w-fit">
                {tkData.pendaftaran.status}
              </Badge>
              <h3 className="text-xl font-bold text-yimi-blue-800">
                Informasi &amp; Pendaftaran Santri Baru
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Hubungi panitia pendaftaran untuk konsultasi observasi calon santri dan ketersediaan kuota kelas.
              </p>
              <div className="pt-2">
                <Button
                  href={waUrl}
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Daftar via WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Kurikulum */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Keunggulan Pendidikan
            </h2>
            <p className="text-sm text-neutral-600">
              Menyelaraskan nilai-nilai sunnah dengan metode pembelajaran ramah anak yang menyenangkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tkData.keunggulan.map((item, idx) => (
              <Card key={idx} hoverEffect className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-green-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-yimi-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yimi-blue-800 mb-1.5">
                    {item.judul}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Runtutan Aktivitas Harian */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-2">
                Jadwal Rutinitas Santri
              </h2>
              <p className="text-sm text-neutral-600">
                Alur kegiatan harian yang membangun kedisiplinan dan keceriaan ananda.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {tkData.kegiatanHarian.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-yimi-blue-600/20 transition-colors"
                >
                  <span className="font-mono text-xs font-bold text-yimi-blue-600 bg-yimi-blue-50 px-3 py-1 rounded-full w-fit">
                    {item.waktu}
                  </span>
                  <span className="text-sm font-semibold text-neutral-800 flex-1 sm:pl-4">
                    {item.aktivitas}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Persyaratan Administrasi */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-yimi-blue-600" />
              <h2 className="text-xl font-bold text-yimi-blue-800">
                Syarat Pendaftaran
              </h2>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-700 mb-6">
              {tkData.pendaftaran.syarat.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yimi-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-100 pt-6">
              <Button
                href={waUrl}
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2"
              >
                <span>Konsultasikan via WhatsApp Pengurus</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
