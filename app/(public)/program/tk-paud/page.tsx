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
  ShieldCheck,
  MapPin,
  Building2,
  ArrowRight,
  BookOpen,
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

interface KeunggulanItem {
  judul: string;
  deskripsi: string;
}

interface FasilitasItem {
  nama: string;
  deskripsi: string;
}

interface KegiatanItem {
  waktu: string;
  aktivitas: string;
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
  visi_sekolah?: string;
  misi_sekolah?: string[];
  keunggulan_judul?: string;
  keunggulan_subjudul?: string;
  keunggulan?: KeunggulanItem[];
  fasilitas_judul?: string;
  fasilitas_subjudul?: string;
  fasilitas?: FasilitasItem[];
  banner_pendaftaran_judul?: string;
  banner_pendaftaran_subjudul?: string;
  kegiatan_judul?: string;
  kegiatan_subjudul?: string;
  kegiatan_harian?: KegiatanItem[];
  syarat_judul?: string;
  syarat_pendaftaran?: string[];
  paket_infaq?: PaketInfaqItem[];
  file_lampiran?: string;
  file_lampiran_nama?: string;
  file_brosur?: string;
  file_brosur_nama?: string;
  file_formulir?: string;
  file_formulir_nama?: string;
  jam_pelayanan?: string;
  alamat_sekolah?: string;
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
    biaya_pendaftaran: fallbackTkData.pendaftaran.biayaPendaftaran,
    biaya_spp: fallbackTkData.pendaftaran.biayaSpp,
    status_pendaftaran: fallbackTkData.pendaftaran.status,
    kontak_wa: fallbackTkData.pendaftaran.kontakPendaftaran,
    pesan_wa: fallbackTkData.pendaftaran.pesanWA,
    target_usia: fallbackTkData.targetUsia,
    waktu_belajar: fallbackTkData.waktuBelajar,
    visi_sekolah: fallbackTkData.visi,
    misi_sekolah: fallbackTkData.misi,
    keunggulan_judul: 'Kurikulum & Keunggulan Program',
    keunggulan_subjudul: 'Menyelaraskan nilai-nilai sunnah dengan metode pembelajaran ramah anak yang menyenangkan.',
    keunggulan: fallbackTkData.keunggulan as KeunggulanItem[],
    fasilitas_judul: 'Fasilitas & Lingkungan Belajar',
    fasilitas_subjudul: 'Sarana dan prasarana yang dirancang aman, bersih, dan mendukung kenyamanan tumbuh kembang santri.',
    fasilitas: fallbackTkData.fasilitas as FasilitasItem[],
    banner_pendaftaran_judul: 'Pendaftaran Santri Baru Telah Dibuka!',
    banner_pendaftaran_subjudul: 'Kuota terbatas untuk setiap jenjang kelas (KB & TK). Daftarkan putra-putri tercinta untuk membentuk pondasi aqidah dan karakter islami yang kokoh sejak dini.',
    kegiatan_judul: 'Jadwal Rutinitas Santri',
    kegiatan_subjudul: 'Alur kegiatan harian yang membangun kedisiplinan dan keceriaan ananda.',
    kegiatan_harian: fallbackTkData.kegiatanHarian as KegiatanItem[],
    syarat_judul: 'Syarat Pendaftaran',
    syarat_pendaftaran: fallbackTkData.pendaftaran.syarat,
    paket_infaq: [],
    file_brosur: fallbackTkData.pendaftaran.fileBrosur,
    file_brosur_nama: fallbackTkData.pendaftaran.fileBrosurNama,
    file_formulir: fallbackTkData.pendaftaran.fileFormulir,
    file_formulir_nama: fallbackTkData.pendaftaran.fileFormulirNama,
    jam_pelayanan: fallbackTkData.pendaftaran.jamPelayanan,
    alamat_sekolah: fallbackTkData.pendaftaran.alamatSekolah,
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

  const misiList = meta.misi_sekolah && meta.misi_sekolah.length > 0 ? meta.misi_sekolah : fallbackTkData.misi;
  const keunggulanList = meta.keunggulan && meta.keunggulan.length > 0 ? meta.keunggulan : (fallbackTkData.keunggulan as KeunggulanItem[]);
  const fasilitasList = meta.fasilitas && meta.fasilitas.length > 0 ? meta.fasilitas : (fallbackTkData.fasilitas as FasilitasItem[]);
  const kegiatanList = meta.kegiatan_harian && meta.kegiatan_harian.length > 0 ? meta.kegiatan_harian : (fallbackTkData.kegiatanHarian as KegiatanItem[]);
  const syaratList = meta.syarat_pendaftaran && meta.syarat_pendaftaran.length > 0 ? meta.syarat_pendaftaran : fallbackTkData.pendaftaran.syarat;

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

      {/* Program Summary & Pendaftaran Quick Card */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Deskripsi & Ringkasan */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700">
                <Sparkles className="w-4 h-4 text-yimi-green-500" />
                <span>Membina Generasi Rabbani Sejak Dini</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight">
                Pendidikan Karakter &amp; Adab Sesuai Sunnah
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                {program.deskripsi || fallbackTkData.deskripsi}
              </p>

              {/* Target Usia & Waktu Belajar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Jenjang &amp; Target Usia
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
                Penerimaan Santri Baru (PPDB)
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
                    {meta.biaya_pendaftaran || fallbackTkData.pendaftaran.biayaPendaftaran}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Infaq SPP Bulanan:</span>
                  <span className="font-bold text-yimi-green-700">
                    {meta.biaya_spp || fallbackTkData.pendaftaran.biayaSpp}
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

              <p className="text-xs text-neutral-600 leading-relaxed">
                Hubungi panitia pendaftaran untuk konsultasi observasi ananda, ketersediaan kuota kelas, atau jadwal kunjungan sekolah.
              </p>
              <div className="pt-1">
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

      {/* 1. Visi & Misi Sekolah (Gambar 1) */}
      <section className="py-16 sm:py-20 bg-neutral-50/70 border-y border-neutral-200/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Visi Card */}
            <div className="lg:col-span-5 bg-white border border-yimi-blue-600/20 rounded-3xl p-8 shadow-xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-blue-600 mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Arah Visi Pendidikan</span>
              </div>
              <h2 className="text-2xl font-extrabold text-yimi-blue-800 mb-4">
                Visi Kami
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 font-medium leading-relaxed italic">
                &ldquo;{meta.visi_sekolah || fallbackTkData.visi}&rdquo;
              </p>
            </div>

            {/* Misi List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-1">
                <CheckCircle2 className="w-4 h-4 text-yimi-green-500" />
                <span>Misi Pendidikan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 mb-2">
                Misi Kami
              </h2>
              <div className="flex flex-col gap-3">
                {misiList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-neutral-100 hover:border-yimi-blue-600/20 transition-colors shadow-2xs"
                  >
                    <span className="w-8 h-8 rounded-xl bg-yimi-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed pt-0.5">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Kurikulum & Keunggulan Program (Gambar 1 - 6 Kartu) */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-blue-600 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Kurikulum Unggulan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              {meta.keunggulan_judul || 'Kurikulum & Keunggulan Program'}
            </h2>
            <p className="text-sm text-neutral-600">
              {meta.keunggulan_subjudul || 'Menyelaraskan nilai-nilai sunnah dengan metode pembelajaran ramah anak yang menyenangkan.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keunggulanList.map((item, idx) => (
              <Card key={idx} hoverEffect className="p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-green-700 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5 text-yimi-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-yimi-blue-800 mb-2">
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

      {/* 3. Fasilitas & Lingkungan Belajar (Gambar 2 - 6 Kartu) */}
      <section className="py-16 sm:py-20 bg-neutral-50/70 border-t border-neutral-200/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <Building2 className="w-4 h-4 text-yimi-green-500" />
              <span>Sarana &amp; Prasarana</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              {meta.fasilitas_judul || 'Fasilitas & Lingkungan Belajar'}
            </h2>
            <p className="text-sm text-neutral-600">
              {meta.fasilitas_subjudul || 'Sarana dan prasarana yang dirancang aman, bersih, dan mendukung kenyamanan tumbuh kembang santri.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fasilitasList.map((item, idx) => (
              <Card key={idx} hoverEffect className="p-6 bg-white flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-yimi-blue-800 mb-2">
                    {item.nama}
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

      {/* 4. Banner Pendaftaran Santri Baru Telah Dibuka (Gambar 2) */}
      <section className="py-12 bg-yimi-blue-800 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 bg-star8-pattern opacity-[0.06] pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <Badge variant="yellow" className="w-fit mx-auto md:mx-0">
              {meta.status_pendaftaran || fallbackTkData.pendaftaran.status}
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {meta.banner_pendaftaran_judul || 'Pendaftaran Santri Baru Telah Dibuka!'}
            </h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              {meta.banner_pendaftaran_subjudul || 'Kuota terbatas untuk setiap jenjang kelas (KB & TK). Daftarkan putra-putri tercinta untuk membentuk pondasi aqidah dan karakter islami yang kokoh sejak dini.'}
            </p>
          </div>
          <Button
            href={waUrl}
            variant="white"
            size="lg"
            className="shrink-0 flex items-center gap-2 shadow-lg !text-yimi-blue-800 font-bold"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* 5. Runtutan Aktivitas Harian */}
      <section className="py-16 sm:py-20 bg-white">
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
              {kegiatanList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-yimi-blue-600/20 transition-colors shadow-2xs"
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

      {/* 6. Syarat Pendaftaran Administrasi */}
      <section className="py-16 sm:py-20 bg-neutral-50/70 border-t border-neutral-200/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-yimi-blue-600" />
              <h2 className="text-xl font-bold text-yimi-blue-800">
                {meta.syarat_judul || 'Syarat Pendaftaran'}
              </h2>
            </div>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-700 mb-6">
              {syaratList.map((item: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-yimi-green-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-100 pt-5 flex justify-end">
              <Button
                href={waUrl}
                variant="primary"
                size="md"
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Konsultasikan via WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Download Brosur & Formulir, Jam Pelayanan, Hotline & Alamat (Gambar 3) */}
      <section className="py-16 sm:py-20 bg-white border-t border-neutral-200/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Download Brosur & Formulir */}
            <div className="lg:col-span-4 bg-neutral-50 p-6 sm:p-7 rounded-3xl border border-neutral-200/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-yimi-blue-800">
                  Download Brosur &amp; Formulir
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Unduh berkas resmi informasi PPDB dan lembar formulir pendaftaran calon santri baru.
                </p>

                <div className="flex flex-col gap-2.5 pt-2">
                  <a
                    href={meta.file_brosur || meta.file_lampiran || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white border border-yimi-blue-600/30 hover:border-yimi-blue-600 rounded-xl text-xs font-bold text-yimi-blue-800 transition shadow-2xs group"
                  >
                    <span className="truncate pr-2">{meta.file_brosur_nama || 'Unduh Brosur (PDF)'}</span>
                    <Download className="w-4 h-4 text-yimi-blue-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </a>

                  <a
                    href={meta.file_formulir || meta.file_lampiran || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white border border-yimi-blue-600/30 hover:border-yimi-blue-600 rounded-xl text-xs font-bold text-yimi-blue-800 transition shadow-2xs group"
                  >
                    <span className="truncate pr-2">{meta.file_formulir_nama || 'Unduh Formulir Pendaftaran (PDF)'}</span>
                    <Download className="w-4 h-4 text-yimi-blue-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
                  </a>
                </div>
              </div>

              {/* Jam Pelayanan Operasional */}
              <div className="mt-6 pt-4 border-t border-neutral-200/80">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                  Jam Pelayanan PPDB:
                </span>
                <span className="text-xs font-bold text-yimi-blue-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-yimi-blue-600" />
                  {meta.jam_pelayanan || fallbackTkData.pendaftaran.jamPelayanan}
                </span>
              </div>
            </div>

            {/* Ada Pertanyaan Seputar PPDB? */}
            <div className="lg:col-span-4 bg-yimi-blue-50/80 p-6 sm:p-7 rounded-3xl border border-yimi-blue-600/20 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-yimi-blue-800">
                  Ada Pertanyaan Seputar PPDB?
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Konsultasikan seputar tata cara pendaftaran, jadwal observasi calon santri, program pembelajaran, dan biaya pendidikan bersama panitia kami.
                </p>
              </div>

              <div className="pt-6">
                <Button
                  href={waUrl}
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hubungi Hotline PPDB</span>
                </Button>
              </div>
            </div>

            {/* Alamat & Lokasi Kami */}
            <div className="lg:col-span-4 bg-neutral-50 p-6 sm:p-7 rounded-3xl border border-neutral-200/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-yimi-blue-800">
                  Alamat &amp; Lokasi Sekolah
                </h3>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  {meta.alamat_sekolah || fallbackTkData.pendaftaran.alamatSekolah}
                </p>
              </div>

              <div className="pt-6 border-t border-neutral-200/80">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    meta.alamat_sekolah || fallbackTkData.pendaftaran.alamatSekolah
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-yimi-blue-700 hover:text-yimi-blue-900 inline-flex items-center gap-1.5"
                >
                  <span>Buka Petunjuk Arah di Google Maps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
