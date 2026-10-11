'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Landmark,
  MapPin,
  CheckCircle2,
  Calendar,
  Copy,
  Check,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CountUp } from '@/components/motion/CountUp';
import { formatRupiah, formatPersen } from '@/lib/format';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import landDataFallback from '@/content/land-campaign.json';
import siteData from '@/content/site.json';

interface LandUpdateItem {
  id: string;
  tanggal: string;
  nominal: number;
  catatan: string;
  gambarUrl?: string | null;
}

interface PaketWakafItem {
  nama: string;
  nominal: number;
  deskripsi: string;
}

interface TahapanItem {
  nama: string;
  status: string;
  keterangan: string;
}

interface FaqItem {
  pertanyaan: string;
  jawaban: string;
}

export default function PembebasanLahanPage() {
  const { settings, whatsapp } = useSiteSettings();
  const [copied, setCopied] = useState(false);

  const bank1Nama = settings?.bank_1_nama || siteData.donasi.bank;
  const bank1Rekening = settings?.bank_1_rekening || siteData.donasi.noRekening;
  const bank1An = settings?.bank_1_an || siteData.donasi.atasNama;
  const qrisUrl = settings?.qris_image || siteData.donasi.qrisImage;
  const activeWa = whatsapp || siteData.kontak.whatsapp;
  const [campaign, setCampaign] = useState({
    judul: landDataFallback.judul,
    subjudul: landDataFallback.subjudul,
    lokasi: landDataFallback.lokasi,
    luasTargetM2: landDataFallback.luasTargetM2,
    hargaPerMeter: landDataFallback.hargaPerMeter,
    targetDana: landDataFallback.targetDana,
    terkumpul: landDataFallback.terkumpul,
    diperbaruiPada: landDataFallback.diperbaruiPada,
    paketWakaf: landDataFallback.paketWakaf as PaketWakafItem[],
    paketJudul: 'Pilihan Paket Wakaf Tanah',
    paketSubjudul: 'Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.',
    rencanaPenggunaan: landDataFallback.rencanaPenggunaan as string[],
    rencanaJudul: 'Peruntukan & Rencana Pembangunan',
    rencanaSubjudul: 'Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam.',
    tahapan: landDataFallback.tahapan as TahapanItem[],
    tahapanJudul: 'Tahapan Eksekusi Lahan',
    tahapanSubjudul: 'Transparansi progres pengikatan dan legalitas tanah wakaf yayasan.',
    faq: landDataFallback.faq as FaqItem[],
    faqJudul: 'Pertanyaan yang Sering Diajukan',
    faqSubjudul: 'Seputar pelaksanaan dan transparansi program wakaf tanah yayasan.',
  });
  const [updates, setUpdates] = useState<LandUpdateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveData() {
      try {
        const res = await fetch('/api/lahan', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.campaign) {
            const c = data.campaign;
            setCampaign({
              judul: c.judul || landDataFallback.judul,
              subjudul: c.subjudul || landDataFallback.subjudul,
              lokasi: c.lokasi || landDataFallback.lokasi,
              luasTargetM2: Number(c.luasTargetM2) || landDataFallback.luasTargetM2,
              hargaPerMeter: Number(c.hargaPerMeter) || landDataFallback.hargaPerMeter,
              targetDana: Number(c.targetDana) || landDataFallback.targetDana,
              terkumpul: Number(c.terkumpul) || 0,
              diperbaruiPada: c.diperbaruiPada || landDataFallback.diperbaruiPada,
              paketWakaf: Array.isArray(c.paketWakaf) ? c.paketWakaf : (landDataFallback.paketWakaf as PaketWakafItem[]),
              paketJudul: c.paketJudul || 'Pilihan Paket Wakaf Tanah',
              paketSubjudul: c.paketSubjudul || 'Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.',
              rencanaPenggunaan: Array.isArray(c.rencanaPenggunaan) ? c.rencanaPenggunaan : (landDataFallback.rencanaPenggunaan as string[]),
              rencanaJudul: c.rencanaJudul || 'Peruntukan & Rencana Pembangunan',
              rencanaSubjudul: c.rencanaSubjudul || 'Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam.',
              tahapan: Array.isArray(c.tahapan) ? c.tahapan : (landDataFallback.tahapan as TahapanItem[]),
              tahapanJudul: c.tahapanJudul || 'Tahapan Eksekusi Lahan',
              tahapanSubjudul: c.tahapanSubjudul || 'Transparansi progres pengikatan dan legalitas tanah wakaf yayasan.',
              faq: Array.isArray(c.faq) ? c.faq : (landDataFallback.faq as FaqItem[]),
              faqJudul: c.faqJudul || 'Pertanyaan yang Sering Diajukan',
              faqSubjudul: c.faqSubjudul || 'Seputar pelaksanaan dan transparansi program wakaf tanah yayasan.',
            });
          }
          if (Array.isArray(data.updates)) {
            setUpdates(data.updates);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil data live pembebasan lahan:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveData();
  }, []);

  const percentage = formatPersen(campaign.terkumpul, campaign.targetDana);

  const copyRekening = () => {
    navigator.clipboard.writeText(bank1Rekening);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waConfirmUrl = `https://wa.me/${activeWa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    siteData.donasi.waTemplateLahan
  )}`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-yimi-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-star8-pattern bg-center opacity-10 pointer-events-none" />
        <div
          className="absolute -top-32 right-1/4 w-96 h-96 bg-yimi-blue-600/30 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10">
          <div className="max-w-3xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-yimi-yellow-400 text-xs font-bold uppercase tracking-wider w-fit border border-white/15">
              <Landmark className="w-4 h-4" />
              <span>Program Wakaf Prioritas</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {campaign.judul}
            </h1>

            <p className="text-base sm:text-xl text-blue-100/90 leading-relaxed max-w-2xl">
              {campaign.subjudul}
            </p>

            <div className="flex items-center gap-2 text-xs md:text-sm text-blue-200 mt-2">
              <MapPin className="w-4 h-4 text-yimi-green-500 shrink-0" />
              <span>{campaign.lokasi}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Progres Penggalangan Dana Card (Sticky/Prominent) */}
      <section className="py-12 bg-white relative -mt-10 z-20">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/90 shadow-[0_12px_40px_rgba(31,47,107,0.1)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Numbers */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Progres Terkumpul (Update: {campaign.diperbaruiPada})
                    </span>
                    {!isLoading && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Terhubung CMS
                      </span>
                    )}
                  </div>
                  <Badge variant="green" className="text-sm px-3 py-1">
                    {percentage}% Tercapai
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <span className="text-3xl sm:text-5xl font-extrabold text-yimi-blue-800 font-mono tracking-tight">
                    <CountUp
                      end={campaign.terkumpul}
                      prefix="Rp "
                      duration={1600}
                    />
                  </span>
                  <span className="text-base text-neutral-500 font-medium">
                    dari target {formatRupiah(campaign.targetDana)}
                  </span>
                </div>

                {/* Progress Bar */}
                <ProgressBar
                  percentage={percentage}
                  height="h-4"
                  trackColor="bg-neutral-100"
                  fillColor="bg-yimi-green-500"
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs text-neutral-600">
                  <div>
                    <span className="block text-neutral-400">Luas Target Lahan</span>
                    <strong className="text-sm text-yimi-blue-800">
                      {campaign.luasTargetM2.toLocaleString('id-ID')} m²
                    </strong>
                  </div>
                  <div>
                    <span className="block text-neutral-400">Harga per Meter</span>
                    <strong className="text-sm text-yimi-blue-800">
                      {formatRupiah(campaign.hargaPerMeter)} / m²
                    </strong>
                  </div>
                  <div>
                    <span className="block text-neutral-400">Kekurangan Dana</span>
                    <strong className="text-sm text-yimi-red-600">
                      {formatRupiah(Math.max(0, campaign.targetDana - campaign.terkumpul))}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Button Quick */}
              <div className="lg:col-span-4 flex flex-col gap-3 p-4 rounded-2xl bg-yimi-blue-50/60 border border-yimi-blue-600/15">
                <span className="text-xs font-bold text-yimi-blue-800">
                  Mari Berpartisipasi Sekarang:
                </span>
                <Button
                  href="#rekening"
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Salurkan Wakaf Lahan
                </Button>
                <Button
                  href={waConfirmUrl}
                  variant="outline"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-yimi-blue-600" />
                  <span>Konfirmasi via WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Riwayat Donasi & Penyaluran Wakaf (Realtime Sync dari CMS) */}
      <section className="py-12 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yimi-blue-700" />
                  <h2 className="text-xl sm:text-2xl font-bold text-yimi-blue-800">
                    Transparansi &amp; Riwayat Donasi Masuk
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                  Pencatatan mutasi dana wakaf lahan yang diperbarui secara langsung dari panel bendahara yayasan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="blue" className="text-xs py-1 px-3">
                  {updates.length} Catatan Terverifikasi
                </Badge>
              </div>
            </div>

            {updates.length > 0 ? (
              <div className="divide-y divide-slate-200 mt-2">
                {updates.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/80 px-3 rounded-xl transition duration-150"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-slate-800">
                            {formatRupiah(item.nominal)}
                          </span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.tanggal}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                          {item.catatan || 'Wakaf Lahan (Tanpa keterangan)'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Tervalidasi di Kas
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-500">
                Belum ada riwayat mutasi tambahan yang dicatat secara publik.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rencana Penggunaan Lahan */}
      {campaign.rencanaPenggunaan && campaign.rencanaPenggunaan.length > 0 && (
        <section className="py-20 bg-neutral-100/60">
          <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
                {campaign.rencanaJudul}
              </h2>
              <p className="text-sm text-neutral-600">
                {campaign.rencanaSubjudul}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {campaign.rencanaPenggunaan.map((item, idx) => (
                <Card key={idx} hoverEffect className="p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-yimi-blue-50 text-yimi-green-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-yimi-green-500" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-neutral-800 leading-relaxed pt-1">
                    {item}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tahapan Pembebasan Lahan */}
      {campaign.tahapan && campaign.tahapan.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
                {campaign.tahapanJudul}
              </h2>
              <p className="text-sm text-neutral-600">
                {campaign.tahapanSubjudul}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {campaign.tahapan.map((tahap, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-neutral-400 font-mono">
                        0{idx + 1}
                      </span>
                      <Badge
                        variant={
                          tahap.status === 'Selesai'
                            ? 'green'
                            : tahap.status === 'Sedang Berjalan'
                            ? 'yellow'
                            : 'neutral'
                        }
                      >
                        {tahap.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-yimi-blue-800 mb-2">
                      {tahap.nama}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {tahap.keterangan}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pilihan Paket Wakaf */}
      {campaign.paketWakaf && campaign.paketWakaf.length > 0 && (
        <section className="py-20 bg-neutral-100/60">
          <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
                {campaign.paketJudul}
              </h2>
              <p className="text-sm text-neutral-600">
                {campaign.paketSubjudul}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {campaign.paketWakaf.map((paket, idx) => (
                <Card
                  key={idx}
                  hoverEffect
                  className="p-6 flex flex-col justify-between border-neutral-200/80 group"
                >
                  <div>
                    <Sparkles className="w-6 h-6 text-yimi-green-500 mb-4" />
                    <h3 className="text-lg font-bold text-yimi-blue-800 mb-1">
                      {paket.nama}
                    </h3>
                    <p className="text-2xl font-extrabold text-yimi-blue-600 font-mono my-3">
                      {paket.nominal > 0 ? formatRupiah(paket.nominal) : 'Nominal Bebas'}
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                      {paket.deskripsi}
                    </p>
                  </div>

                  <Button
                    href="#rekening"
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Pilih Paket
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rekening Transfer & QRIS Statis */}
      <section id="rekening" className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
                Saluran Transfer Resmi &amp; QRIS
              </h2>
              <p className="text-sm text-neutral-600">
                Seluruh dana donasi disalurkan langsung ke rekening resmi yayasan yang diaudit berkala.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Rekening Bank Card */}
              <div className="bg-yimi-blue-50/70 border border-yimi-blue-600/20 rounded-3xl p-8 flex flex-col gap-6">
                <div>
                  <Badge variant="blue" className="mb-3">
                    Rekening Khusus Wakaf
                  </Badge>
                  <h3 className="text-2xl font-extrabold text-yimi-blue-800">
                    {bank1Nama}
                  </h3>
                  <span className="text-xs text-neutral-500">
                    Kode Bank: {siteData.donasi.kodeBank}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-yimi-blue-600/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 block">
                      Nomor Rekening:
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-yimi-blue-800 tracking-wider">
                      {bank1Rekening}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={copyRekening}
                    className="p-2.5 rounded-xl bg-yimi-blue-50 hover:bg-yimi-blue-600 text-yimi-blue-600 hover:text-white transition-colors cursor-pointer"
                    title="Salin Nomor Rekening"
                    aria-label="Salin nomor rekening ke clipboard"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-yimi-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-neutral-600 leading-relaxed space-y-1">
                  <p>
                    <strong>Atas Nama:</strong> {bank1An}
                  </p>
                  <p className="text-neutral-500 italic">
                    {siteData.donasi.catatan}
                  </p>
                </div>
              </div>

              {/* QRIS Card */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-3xl p-8 flex flex-col items-center text-center gap-4">
                <Badge variant="neutral">Scan Cepat QRIS</Badge>
                <div className="relative w-48 h-48 bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-center">
                  <Image
                    src={qrisUrl}
                    alt="QRIS Donasi YIMI"
                    width={180}
                    height={180}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs text-neutral-500">
                  Mendukung seluruh aplikasi M-Banking &amp; E-Wallet nasional.
                </span>
                <Button
                  href={waConfirmUrl}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 mt-2"
                >
                  <MessageCircle className="w-4 h-4 text-yimi-green-500" />
                  <span>Konfirmasi via WhatsApp</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Pembebasan Lahan */}
      {campaign.faq && campaign.faq.length > 0 && (
        <section className="py-20 bg-neutral-100/60">
          <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
                {campaign.faqJudul}
              </h2>
              <p className="text-sm text-neutral-600">
                {campaign.faqSubjudul}
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {campaign.faq.map((item, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="text-base font-bold text-yimi-blue-800 mb-2">
                    {item.pertanyaan}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.jawaban}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
