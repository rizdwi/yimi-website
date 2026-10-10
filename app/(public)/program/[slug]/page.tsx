'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Layers,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  Utensils,
  Heart,
  Calendar,
  Clock,
  Phone,
  Download,
  DollarSign,
  PackageCheck,
  ArrowLeft,
  CheckCircle2,
  School,
  Building2,
  Compass,
  FileText,
  MapPin,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatRupiah } from '@/lib/format';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const iconMap = {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  Utensils,
  Heart,
};

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

interface ProgramMetadata {
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
  file_brosur?: string;
  file_brosur_nama?: string;
  file_formulir?: string;
  file_formulir_nama?: string;
  file_lampiran?: string;
  file_lampiran_nama?: string;
  jam_pelayanan?: string;
  alamat_sekolah?: string;
  banner_pendaftaran_judul?: string;
  banner_pendaftaran_subjudul?: string;
  keunggulan_judul?: string;
  keunggulan_subjudul?: string;
  keunggulan?: KeunggulanItem[];
  fasilitas_judul?: string;
  fasilitas_subjudul?: string;
  fasilitas?: FasilitasItem[];
  kegiatan_judul?: string;
  kegiatan_subjudul?: string;
  kegiatan_harian?: KegiatanItem[];
  syarat_judul?: string;
  syarat_pendaftaran?: string[];
  paket_infaq?: PaketInfaqItem[];
}

interface ProgramDetail {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  deskripsi: string;
  kategori: string;
  ikon?: string;
  icon?: string;
  gambar?: string;
  highlight?: string;
  targetUsia?: string;
  metadata?: ProgramMetadata;
}

export default function DynamicProgramPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { whatsapp } = useSiteSettings();

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadProgram() {
      try {
        setLoading(true);
        const res = await fetch(`/api/programs/${slug}`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.program) {
            setProgram(json.program);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Gagal memuat program detail:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadProgram();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-yimi-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-neutral-500">Memuat rincian program...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800">Program Tidak Ditemukan</h2>
          <p className="text-sm text-neutral-500">
            Program yang Anda tuju mungkin telah diperbarui atau dipindahkan oleh pengurus.
          </p>
          <Button href="/program" variant="primary">
            Kembali ke Daftar Program
          </Button>
        </div>
      </div>
    );
  }

  const meta = program.metadata || {};
  const ProgramIcon =
    program.ikon && program.ikon in iconMap
      ? iconMap[program.ikon as keyof typeof iconMap]
      : Layers;

  const targetWaNumber = meta.kontak_wa || whatsapp || '6281219362077';
  const rawPesanWa =
    meta.pesan_wa ||
    `Bismillah, saya ingin menanyakan informasi pendaftaran dan rincian program ${program.judul}.`;
  const waUrl = `https://wa.me/${targetWaNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    rawPesanWa
  )}`;

  return (
    <div className="space-y-12 pb-16">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yimi-blue-900 via-yimi-blue-800 to-yimi-blue-700 text-white py-14 sm:py-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col gap-4">
            <Link
              href="/program"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Semua Program</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="blue">{meta.kategori || program.kategori || 'Program Yayasan'}</Badge>
              {meta.status_pendaftaran && (
                <Badge variant="green">{meta.status_pendaftaran}</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {program.judul}
            </h1>

            <p className="text-base sm:text-lg text-white/90 max-w-3xl leading-relaxed">
              {program.ringkasan}
            </p>
          </div>
        </div>
      </section>

      {/* Konten Utama */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Uraian & Detail */}
          <div className="lg:col-span-8 space-y-8">
            {/* Foto Sampul */}
            {program.gambar && (
              <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-neutral-100 shadow-xs">
                <Image
                  src={program.gambar}
                  alt={program.judul}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Deskripsi */}
            <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed text-sm sm:text-base">
              <h2 className="text-xl font-bold text-yimi-blue-800 mb-3 flex items-center gap-2">
                <ProgramIcon className="w-5 h-5 text-yimi-blue-600" />
                <span>Tentang Program Ini</span>
              </h2>
              <p className="whitespace-pre-line text-neutral-600 leading-relaxed">
                {program.deskripsi || program.ringkasan}
              </p>
            </div>

            {/* Visi & Misi jika ada */}
            {(meta.visi_sekolah || (meta.misi_sekolah && meta.misi_sekolah.length > 0)) && (
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#3E5FD1]" />
                  <h3 className="text-xl font-extrabold text-yimi-blue-800">
                    Visi &amp; Misi Program
                  </h3>
                </div>

                {meta.visi_sekolah && (
                  <div className="p-5 rounded-2xl bg-[#EEF2FC]/50 border border-[#3E5FD1]/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E5FD1] block mb-1">
                      Visi Utama
                    </span>
                    <p className="text-sm font-semibold text-[#1F2F6B] leading-relaxed">
                      &ldquo;{meta.visi_sekolah}&rdquo;
                    </p>
                  </div>
                )}

                {meta.misi_sekolah && meta.misi_sekolah.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-700 block">Misi Program:</span>
                    <div className="grid grid-cols-1 gap-2">
                      {meta.misi_sekolah.map((m, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 border border-neutral-100"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#138A3A]/10 text-[#138A3A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-neutral-700 leading-relaxed">{m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Info Grid */}
            {(meta.target_usia || meta.waktu_belajar) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meta.target_usia && (
                  <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Sasaran / Target
                      </h3>
                      <p className="text-sm font-bold text-yimi-blue-800">
                        {meta.target_usia}
                      </p>
                    </div>
                  </div>
                )}

                {meta.waktu_belajar && (
                  <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Waktu / Jadwal
                      </h3>
                      <p className="text-sm font-bold text-yimi-blue-800">
                        {meta.waktu_belajar}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Seksi Keunggulan Kurikulum jika ada */}
            {meta.keunggulan && meta.keunggulan.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div>
                  <h3 className="text-xl font-extrabold text-yimi-blue-800">
                    {meta.keunggulan_judul || 'Kurikulum & Keunggulan Program'}
                  </h3>
                  {meta.keunggulan_subjudul && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {meta.keunggulan_subjudul}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {meta.keunggulan.map((item, idx) => (
                    <Card key={idx} hoverEffect className="p-5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-yimi-blue-50 text-yimi-green-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-yimi-green-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-yimi-blue-800 mb-1">
                          {item.judul}
                        </h4>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {item.deskripsi}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Seksi Fasilitas Belajar jika ada */}
            {meta.fasilitas && meta.fasilitas.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div>
                  <h3 className="text-xl font-extrabold text-yimi-blue-800 flex items-center gap-2">
                    <School className="w-5 h-5 text-yimi-blue-600" />
                    <span>{meta.fasilitas_judul || 'Fasilitas & Lingkungan Belajar'}</span>
                  </h3>
                  {meta.fasilitas_subjudul && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {meta.fasilitas_subjudul}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {meta.fasilitas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E3E7EE] flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#EEF2FC] text-[#3E5FD1] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#111827] mb-1">
                          {item.nama}
                        </h4>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {item.deskripsi}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seksi Jadwal Rutinitas jika ada */}
            {meta.kegiatan_harian && meta.kegiatan_harian.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <div>
                  <h3 className="text-xl font-extrabold text-yimi-blue-800">
                    {meta.kegiatan_judul || 'Jadwal Rutinitas Santri'}
                  </h3>
                  {meta.kegiatan_subjudul && (
                    <p className="text-xs text-neutral-600 mt-1">
                      {meta.kegiatan_subjudul}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  {meta.kegiatan_harian.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <span className="font-mono text-xs font-bold text-yimi-blue-600 bg-yimi-blue-50 px-3 py-1 rounded-full w-fit">
                        {item.waktu}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-neutral-800 flex-1 sm:pl-3">
                        {item.aktivitas}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seksi Syarat Pendaftaran jika ada */}
            {meta.syarat_pendaftaran && meta.syarat_pendaftaran.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-neutral-100">
                <h3 className="text-xl font-extrabold text-yimi-blue-800">
                  {meta.syarat_judul || 'Syarat Pendaftaran'}
                </h3>
                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-neutral-200/80">
                  <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-neutral-700">
                    {meta.syarat_pendaftaran.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-yimi-green-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sisi Kanan: Action Card */}
          <div className="lg:col-span-4 bg-yimi-blue-50/80 border border-yimi-blue-600/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-xs h-fit sticky top-28">
            {meta.status_pendaftaran && (
              <Badge variant="green" className="w-fit">
                {meta.status_pendaftaran}
              </Badge>
            )}
            <h3 className="text-xl font-bold text-yimi-blue-800">
              Informasi &amp; Partisipasi
            </h3>

            {/* Rincian Biaya jika ada */}
            {(meta.biaya_pendaftaran || meta.biaya_spp) && (
              <div className="p-4 rounded-2xl bg-white border border-yimi-blue-600/20 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-yimi-blue-800 uppercase tracking-wider border-b border-neutral-100 pb-2">
                  <DollarSign className="w-4 h-4 text-yimi-green-600" />
                  <span>Rincian Biaya / Infaq</span>
                </div>
                {meta.biaya_pendaftaran && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Pendaftaran:</span>
                    <span className="font-bold text-yimi-blue-800">
                      {meta.biaya_pendaftaran}
                    </span>
                  </div>
                )}
                {meta.biaya_spp && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Iuran / SPP:</span>
                    <span className="font-bold text-yimi-green-700">
                      {meta.biaya_spp}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Paket Infaq jika ada */}
            {meta.paket_infaq && meta.paket_infaq.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-yimi-blue-600/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2F6B]">
                  <PackageCheck className="w-4 h-4 text-[#3E5FD1]" />
                  <span>Pilihan Paket Donasi:</span>
                </div>
                <div className="space-y-1.5">
                  {meta.paket_infaq.map((paket, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 bg-[#F8FAFC] rounded-lg border border-[#E3E7EE]"
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

            {/* Unduh Lampiran Brosur / Formulir jika ada */}
            {(meta.file_brosur || meta.file_formulir || meta.file_lampiran) && (
              <div className="space-y-2 pt-2 border-t border-yimi-blue-600/10">
                {meta.file_brosur && (
                  <a
                    href={meta.file_brosur}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-yimi-blue-600 text-yimi-blue-700 hover:bg-yimi-blue-50 text-xs font-bold transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-yimi-blue-600" />
                    <span className="truncate max-w-[220px]">
                      {meta.file_brosur_nama || 'Unduh Brosur (PDF)'}
                    </span>
                  </a>
                )}
                {meta.file_formulir && (
                  <a
                    href={meta.file_formulir}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#138A3A] text-[#138A3A] hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-[#138A3A]" />
                    <span className="truncate max-w-[220px]">
                      {meta.file_formulir_nama || 'Unduh Formulir (PDF)'}
                    </span>
                  </a>
                )}
                {meta.file_lampiran && !meta.file_brosur && (
                  <a
                    href={meta.file_lampiran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-yimi-blue-600 text-yimi-blue-700 hover:bg-yimi-blue-50 text-xs font-bold transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-yimi-blue-600" />
                    <span className="truncate max-w-[220px]">
                      {meta.file_lampiran_nama || 'Unduh Lampiran'}
                    </span>
                  </a>
                )}
              </div>
            )}

            {/* Jam Pelayanan & Alamat jika ada */}
            {meta.jam_pelayanan && (
              <div className="p-3 bg-white/70 rounded-xl border border-yimi-blue-600/10 text-xs text-neutral-600">
                <span className="font-bold text-[#1F2F6B] block mb-0.5">Jam Pelayanan PPDB:</span>
                <span>{meta.jam_pelayanan}</span>
              </div>
            )}

            {meta.alamat_sekolah && (
              <div className="p-3 bg-white/70 rounded-xl border border-yimi-blue-600/10 text-xs text-neutral-600 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D7261E] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1F2F6B] block mb-0.5">Lokasi:</span>
                  <span className="text-[11px] leading-relaxed">{meta.alamat_sekolah}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-neutral-600 leading-relaxed">
              Ingin mengetahui lebih lanjut atau berkonsultasi mengenai program ini? Hubungi perwakilan kami.
            </p>

            <div className="pt-2">
              <Button
                href={waUrl}
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Hubungi via WhatsApp</span>
              </Button>
            </div>

            <div className="pt-2 border-t border-yimi-blue-600/10">
              <Link
                href="/program"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-yimi-blue-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lihat Seluruh Program</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
