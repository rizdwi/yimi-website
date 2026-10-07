'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Landmark,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CountUp } from '@/components/motion/CountUp';
import { formatRupiah, formatPersen } from '@/lib/format';
import landData from '@/content/land-campaign.json';
import siteData from '@/content/site.json';

export default function PembebasanLahanPage() {
  const [copied, setCopied] = useState(false);
  const percentage = formatPersen(landData.terkumpul, landData.targetDana);

  const copyRekening = () => {
    navigator.clipboard.writeText(siteData.donasi.noRekening);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waConfirmUrl = `https://wa.me/${siteData.kontak.whatsapp}?text=${encodeURIComponent(
    siteData.donasi.waTemplateLahan
  )}`;

  return (
    <div className="pt-[72px]">
      {/* Hero Banner Gelap #1F2F6B */}
      <section className="relative py-20 md:py-28 bg-yimi-blue-800 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-star8-pattern opacity-10 pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-yimi-yellow-400 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
              <Landmark className="w-4 h-4" />
              <span>Program Wakaf Prioritas</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              {landData.judul}
            </h1>
            <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed mb-6">
              {landData.subjudul}
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <MapPin className="w-4 h-4 text-yimi-green-500 shrink-0" />
              <span>{landData.lokasi}</span>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Progres Terkumpul (Update: {landData.diperbaruiPada})
                  </span>
                  <Badge variant="green" className="text-sm px-3 py-1">
                    {percentage}% Tercapai
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <span className="text-3xl sm:text-5xl font-extrabold text-yimi-blue-800 font-mono tracking-tight">
                    <CountUp
                      end={landData.terkumpul}
                      prefix="Rp "
                      duration={1600}
                    />
                  </span>
                  <span className="text-base text-neutral-500 font-medium">
                    dari target {formatRupiah(landData.targetDana)}
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
                      {landData.luasTargetM2.toLocaleString('id-ID')} m²
                    </strong>
                  </div>
                  <div>
                    <span className="block text-neutral-400">Harga per Meter</span>
                    <strong className="text-sm text-yimi-blue-800">
                      {formatRupiah(landData.hargaPerMeter)} / m²
                    </strong>
                  </div>
                  <div>
                    <span className="block text-neutral-400">Kekurangan Dana</span>
                    <strong className="text-sm text-yimi-red-600">
                      {formatRupiah(landData.targetDana - landData.terkumpul)}
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

      {/* Rencana Penggunaan Lahan */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Peruntukan &amp; Rencana Pembangunan
            </h2>
            <p className="text-sm text-neutral-600">
              Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {landData.rencanaPenggunaan.map((item, idx) => (
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

      {/* Tahapan Pembebasan Lahan */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Tahapan Eksekusi Lahan
            </h2>
            <p className="text-sm text-neutral-600">
              Transparansi progres pengikatan dan legalitas tanah wakaf yayasan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {landData.tahapan.map((tahap, idx) => (
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

      {/* Paket Pilihan Wakaf */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Pilihan Paket Wakaf Tanah
            </h2>
            <p className="text-sm text-neutral-600">
              Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {landData.paketWakaf.map((paket, idx) => (
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
                    {siteData.donasi.bank}
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
                      {siteData.donasi.noRekening}
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
                      <Check className="w-5 h-5 text-yimi-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-neutral-600 leading-relaxed">
                  <span className="font-bold text-neutral-800 block">
                    Atas Nama: {siteData.donasi.atasNama}
                  </span>
                  <span>{siteData.donasi.catatan}</span>
                </div>

                <Button
                  href={waConfirmUrl}
                  variant="primary"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konfirmasi via WhatsApp</span>
                </Button>
              </div>

              {/* QRIS Graphic Card */}
              <div className="bg-neutral-50 border border-neutral-200/90 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
                <div className="w-full max-w-[280px] aspect-3/4 relative mb-4">
                  <Image
                    src={siteData.donasi.qrisImage}
                    alt="QRIS YIMI"
                    width={280}
                    height={360}
                    className="w-full h-auto object-contain rounded-xl shadow-xs"
                  />
                </div>
                <h4 className="text-sm font-bold text-yimi-blue-800 mb-1">
                  Pindai QRIS Nasional
                </h4>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Dapat discan melalui semua aplikasi bank (BSI Mobile, BCA, Livin, dll) dan e-wallet (GoPay, OVO, ShopeePay, DANA).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Singkat */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-2">
                Pertanyaan Seputar Wakaf Lahan
              </h2>
              <p className="text-sm text-neutral-600">
                Informasi penting yang sering ditanyakan para muhsinin dan donatur.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {landData.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-neutral-200/80"
                >
                  <h3 className="text-base font-bold text-yimi-blue-800 mb-2 flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-yimi-green-500 shrink-0 mt-0.5" />
                    <span>{item.pertanyaan}</span>
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed pl-7.5">
                    {item.jawaban}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
