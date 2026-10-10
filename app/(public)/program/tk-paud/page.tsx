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
  PackageCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/format';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import fallbackTkData from '@/content/programs/tk-paud.json';

interface PaketInfaqItem {
  nama: string;
  nominal: number;
  deskripsi: string;
}

interface TkMeta {
  kategori?: string;
  biaya_label?: string;
  biaya_pendaftaran?: string;
  biaya_spp?: string;
  status_pendaftaran?: string;
  kontak_wa?: string;
  pesan_wa?: string;
  target_usia?: string;
  waktu_belajar?: string;
  file_lampiran?: string;
  file_lampiran_nama?: string;
  keunggulan_judul?: string;
  keunggulan_subjudul?: string;
  keunggulan?: KeunggulanItem[];
  kegiatan_judul?: string;
  kegiatan_subjudul?: string;
  kegiatan_harian?: KegiatanItem[];
  syarat_judul?: string;
  syarat_pendaftaran?: string[];
  paket_infaq?: PaketInfaqItem[];
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
  const { whatsapp } = useSiteSettings();
  const [program, setProgram] = useState<{
    judul?: string;
    ringkasan?: string;
    deskripsi?: string;
  }>({
    judul: fallbackTkData.judul,
    ringkasan: fallbackTkData.subjudul,
    deskripsi: fallbackTkData.deskripsi,
  });

  const [meta, setMeta] = useState<TkMeta>({
    biaya_pendaftaran: 'Rp 50.000',
    biaya_spp: 'Rp 70.000 / bulan',
    status_pendaftaran: 'Gelombang 1 Telah Dibuka',
    kontak_wa: fallbackTkData.pendaftaran.kontakPendaftaran,
    pesan_wa: fallbackTkData.pendaftaran.pesanWA,
    target_usia: fallbackTkData.targetUsia,
    waktu_belajar: fallbackTkData.waktuBelajar,
    file_lampiran: '',
    file_lampiran_nama: '',
    keunggulan_judul: 'Keunggulan Pendidikan',
    keunggulan_subjudul: 'Menyelaraskan nilai-nilai sunnah dengan metode pembelajaran ramah anak yang menyenangkan.',
    keunggulan: fallbackTkData.keunggulan as KeunggulanItem[],
    kegiatan_judul: 'Jadwal Rutinitas Santri',
    kegiatan_subjudul: 'Alur kegiatan harian yang membangun kedisiplinan dan keceriaan ananda.',
    kegiatan_harian: fallbackTkData.kegiatanHarian as KegiatanItem[],
    syarat_judul: 'Syarat Pendaftaran',
    syarat_pendaftaran: fallbackTkData.pendaftaran.syarat,
    paket_infaq: [],
  });

  useEffect(() => {
    async function loadLiveTk() {
      try {
        const res = await fetch('/api/programs/tk-paud', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.program) {
            setProgram({
              judul: json.program.judul || fallbackTkData.judul,
              ringkasan: json.program.ringkasan || fallbackTkData.subjudul,
              deskripsi: json.program.deskripsi || fallbackTkData.deskripsi,
            });
            if (json.program.metadata) {
              setMeta((prev) => ({
                ...prev,
                ...(json.program.metadata as TkMeta),
              }));
            }
          }
        }
      } catch (err) {
        console.error('Gagal memuat data live TK:', err);
      }
    }
    loadLiveTk();
  }, []);

  const waNumber = (meta.kontak_wa || whatsapp || fallbackTkData.pendaftaran.kontakPendaftaran).replace(/[^0-9]/g, '');
  const waMessage = meta.pesan_wa || fallbackTkData.pendaftaran.pesanWA || 'Assalamu’alaikum Warahmatullah, saya ingin konsultasi pendaftaran santri baru KB-TK YIMI.';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

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
            {program.judul || fallbackTkData.judul}
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            {program.ringkasan || fallbackTkData.subjudul}
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
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                {program.deskripsi || fallbackTkData.deskripsi}
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
                      {meta.target_usia || fallbackTkData.targetUsia}
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
                      {meta.waktu_belajar || fallbackTkData.waktuBelajar}
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
                    {meta.biaya_pendaftaran || 'Rp 50.000'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Infaq SPP Bulanan:</span>
                  <span className="font-bold text-yimi-green-700">
                    {meta.biaya_spp || 'Rp 70.000 / bulan'}
                  </span>
                </div>

                {/* Paket Sarana & Kelengkapan (jika ada di CMS) */}
                {meta.paket_infaq && meta.paket_infaq.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1F2F6B]">
                      <PackageCheck className="w-3.5 h-3.5 text-[#3E5FD1]" />
                      <span>Paket Sarana / Seragam / Buku:</span>
                    </div>
                    <div className="space-y-1.5">
                      {meta.paket_infaq.map((paket, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-2 bg-[#F8FAFC] rounded-lg border border-[#E3E7EE]"
                        >
                          <div className="pr-2">
                            <span className="font-semibold text-[#111827] block">
                              {paket.nama}
                            </span>
                            {paket.deskripsi && (
                              <span className="text-[10px] text-[#6B7280] block">
                                {paket.deskripsi}
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-[#166534] shrink-0">
                            {formatRupiah(paket.nominal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  <span className="truncate max-w-[220px]">
                    {meta.file_lampiran_nama ? `Unduh ${meta.file_lampiran_nama}` : 'Unduh Brosur / Formulir (PDF)'}
                  </span>
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
              {meta.keunggulan_judul || 'Keunggulan Pendidikan'}
            </h2>
            <p className="text-sm text-neutral-600">
              {meta.keunggulan_subjudul || 'Menyelaraskan nilai-nilai sunnah dengan metode pembelajaran ramah anak yang menyenangkan.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {((meta.keunggulan && meta.keunggulan.length > 0)
              ? meta.keunggulan
              : (fallbackTkData.keunggulan as KeunggulanItem[])
            ).map((item, idx) => (
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
                {meta.kegiatan_judul || 'Jadwal Rutinitas Santri'}
              </h2>
              <p className="text-sm text-neutral-600">
                {meta.kegiatan_subjudul || 'Alur kegiatan harian yang membangun kedisiplinan dan keceriaan ananda.'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {((meta.kegiatan_harian && meta.kegiatan_harian.length > 0)
                ? meta.kegiatan_harian
                : (fallbackTkData.kegiatanHarian as KegiatanItem[])
              ).map((item, idx) => (
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
                {meta.syarat_judul || 'Syarat Pendaftaran'}
              </h2>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-700 mb-6">
              {((meta.syarat_pendaftaran && meta.syarat_pendaftaran.length > 0)
                ? meta.syarat_pendaftaran
                : fallbackTkData.pendaftaran.syarat
              ).map((item: string, idx: number) => (
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
                  <span className="truncate max-w-[200px]">
                    {meta.file_lampiran_nama ? `Unduh ${meta.file_lampiran_nama}` : 'Unduh Brosur & Formulir'}
                  </span>
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
