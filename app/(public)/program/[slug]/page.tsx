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
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
  metadata?: {
    kategori?: string;
    biaya_label?: string;
    biaya_pendaftaran?: string;
    biaya_spp?: string;
    status_pendaftaran?: string;
    kontak_wa?: string;
    target_usia?: string;
    waktu_belajar?: string;
    file_lampiran?: string;
    file_lampiran_nama?: string;
    paket_infaq?: PaketInfaqItem[];
  };
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
      <div className="pt-[72px] min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3E5FD1] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Memuat detail program...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="pt-[72px] min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">Program Tidak Ditemukan</h1>
          <p className="text-sm text-neutral-600 mb-6">
            Program yang Anda tuju mungkin telah dipindahkan atau belum dipublikasikan.
          </p>
          <Link
            href="/program"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yimi-blue-600 text-white text-sm font-semibold hover:bg-yimi-blue-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Program</span>
          </Link>
        </div>
      </div>
    );
  }

  const meta = program.metadata || {};
  const iconKey = (program.ikon || program.icon || 'Layers') as keyof typeof iconMap;
  const IconComponent = iconMap[iconKey] || Layers;
  const waNumber = (meta.kontak_wa || whatsapp || '6281219362077').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Assalamu’alaikum Warahmatullah, saya ingin menanyakan informasi mengenai program: ${program.judul}.`
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
            <IconComponent className="w-3.5 h-3.5" />
            <span>{program.kategori || 'Program Yayasan'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            {program.judul}
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            {program.ringkasan}
          </p>
        </div>
      </section>

      {/* Konten Utama */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sisi Kiri: Deskripsi & Foto */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {program.gambar && (
                <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-neutral-100 shadow-xs">
                  <Image
                    src={program.gambar}
                    alt={program.judul}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight">
                  Tentang Program
                </h2>
                <div className="prose prose-neutral max-w-none text-base sm:text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                  {program.deskripsi || program.ringkasan}
                </div>
              </div>

              {/* Rincian Tambahan jika ada */}
              {(meta.target_usia || meta.waktu_belajar) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
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

              {/* Unduh Lampiran jika ada */}
              {meta.file_lampiran && (
                <a
                  href={meta.file_lampiran}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-yimi-blue-600 text-yimi-blue-700 hover:bg-yimi-blue-50 text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-yimi-blue-600" />
                  <span className="truncate max-w-[220px]">
                    {meta.file_lampiran_nama ? `Unduh ${meta.file_lampiran_nama}` : 'Unduh Lampiran / Brosur'}
                  </span>
                </a>
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
        </div>
      </section>
    </div>
  );
}
