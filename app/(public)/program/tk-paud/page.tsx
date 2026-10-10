'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  Clock,
  Phone,
  CheckCircle2,
  FileText,
  Download,
  DollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import fallbackTkData from '@/content/programs/tk-paud.json';

interface TkMeta {
  biaya_pendaftaran?: string;
  biaya_spp?: string;
  status_pendaftaran?: string;
  kontak_wa?: string;
  file_lampiran?: string;
  file_lampiran_nama?: string;
}

interface KeunggulanItem {
  judul: string;
  deskripsi: string;
}

interface KegiatanItem {
  waktu: string;
  aktivitas: string;
}

export default function TkPaudPage() {
  const [meta, setMeta] = useState<TkMeta>({
    biaya_pendaftaran: 'Rp 350.000',
    biaya_spp: 'Rp 250.000 / bulan',
    status_pendaftaran: 'Gelombang Inden Telah Dibuka',
    kontak_wa: '6281234567890',
    file_lampiran: '',
    file_lampiran_nama: '',
  });

  useEffect(() => {
    async function loadLiveTk() {
      try {
        const res = await fetch('/api/programs/tk-paud');
        if (res.ok) {
          const json = await res.json();
          if (json.program && json.program.metadata) {
            setMeta(json.program.metadata as TkMeta);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data live TK:', err);
      }
    }
    loadLiveTk();
  }, []);

  const waNumber = meta.kontak_wa || '6281234567890';
  const waUrl = `https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Assalamu’alaikum Warahmatullah, saya ingin konsultasi pendaftaran santri baru KB-TK YIMI.'
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
            <span>Pendidikan Anak Usia Dini</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            {fallbackTkData.judul}
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            {fallbackTkData.subjudul}
          </p>
        </div>
      </section>

      {/* Program Summary & Pendaftaran */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Deskripsi & Ringkasan */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700">
                <Sparkles className="w-4 h-4 text-yimi-green-500" />
                <span>Membina Generasi Rabbani Sejak Dini</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight">
                Kurikulum Berbasis Karakter Islami &amp; Sunnah
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                {fallbackTkData.deskripsi}
              </p>

              {/* Target Usia & Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Jenjang &amp; Usia
                    </h3>
                    <p className="text-sm font-bold text-yimi-blue-800">
                      {fallbackTkData.targetUsia}
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Waktu Kegiatan Belajar
                    </h3>
                    <p className="text-sm font-bold text-yimi-blue-800">
                      {fallbackTkData.waktuBelajar}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendaftaran Quick Card */}
            <div className="lg:col-span-4 bg-yimi-blue-50/80 border border-yimi-blue-600/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs">
              <Badge variant="green" className="w-fit">
                {meta.status_pendaftaran || fallbackTkData.pendaftaran.status}
              </Badge>
              <h3 className="text-xl font-bold text-yimi-blue-800">
                Informasi &amp; Pendaftaran Santri Baru
              </h3>

              {/* Rincian Biaya Live dari CMS */}
              <div className="p-4 rounded-2xl bg-white border border-yimi-blue-600/20 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-yimi-blue-800 uppercase tracking-wider border-b border-neutral-100 pb-2">
                  <DollarSign className="w-4 h-4 text-yimi-green-600" />
                  <span>Rincian Biaya Pendidikan</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Biaya Pendaftaran:</span>
                  <span className="font-bold text-yimi-blue-800">
                    {meta.biaya_pendaftaran || 'Rp 350.000'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Infaq SPP Bulanan:</span>
                  <span className="font-bold text-yimi-green-700">
                    {meta.biaya_spp || 'Rp 250.000 / bulan'}
                  </span>
                </div>
              </div>

              {/* Tombol Unduh Brosur jika diupload di CMS */}
              {meta.file_lampiran && (
                <a
                  href={meta.file_lampiran}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-yimi-blue-600 text-yimi-blue-700 hover:bg-yimi-blue-50 text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-yimi-blue-600" />
                  <span>Unduh Brosur / Formulir (PDF)</span>
                </a>
              )}

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
            {(fallbackTkData.keunggulan as KeunggulanItem[]).map((item, idx) => (
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
              {(fallbackTkData.kegiatanHarian as KegiatanItem[]).map((item, idx) => (
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
              {fallbackTkData.pendaftaran.syarat.map((item: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yimi-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-100 pt-6 flex flex-col sm:flex-row gap-3">
              {meta.file_lampiran && (
                <a
                  href={meta.file_lampiran}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-yimi-blue-600 text-yimi-blue-700 hover:bg-yimi-blue-50 text-sm font-bold transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Brosur &amp; Formulir</span>
                </a>
              )}
              <Button
                href={waUrl}
                variant="primary"
                size="md"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <span>Konsultasikan via WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
