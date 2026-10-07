'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import siteData from '@/content/site.json';

export default function DonasiPage() {
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const copyToClipboard = (accountNo: string, bankName: string) => {
    navigator.clipboard.writeText(accountNo);
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const waConfirmUrl = `https://wa.me/${siteData.kontak.whatsapp}?text=${encodeURIComponent(
    'Assalamu’alaikum Warahmatullahi Wabarakatuh, saya ingin konfirmasi donasi/infaq untuk Yayasan Insan Muslim Istiqomah (YIMI).'
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
            <Heart className="w-3.5 h-3.5 fill-yimi-yellow-400" />
            <span>Infaq &amp; Wakaf Umat</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Saluran Infaq Resmi YIMI
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            Salurkan infaq, sedekah, dan wakaf Anda melalui saluran resmi untuk mendukung operasional dakwah sunnah dan sosial umat.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 7 cols: Rekening Transfer & Alokasi */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 mb-2">
                  Rekening Transfer Bank
                </h2>
                <p className="text-sm text-neutral-600">
                  Pastikan Anda mentransfer hanya ke rekening atas nama yayasan resmi berikut:
                </p>
              </div>

              {/* BSI Card */}
              <div className="bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-xs flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center font-bold">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-yimi-blue-800">
                        {siteData.donasi.bank}
                      </h3>
                      <span className="text-xs text-neutral-400">
                        Kode Bank: {siteData.donasi.kodeBank}
                      </span>
                    </div>
                  </div>
                  <Badge variant="blue">Rekening Utama</Badge>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                      Nomor Rekening
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-yimi-blue-800 tracking-wider">
                      {siteData.donasi.noRekening}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(siteData.donasi.noRekening, siteData.donasi.bank)
                    }
                    className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-yimi-blue-50 text-neutral-600 hover:text-yimi-blue-600 transition-colors cursor-pointer"
                    title="Salin Nomor Rekening"
                    aria-label={`Salin nomor rekening ${siteData.donasi.bank}`}
                  >
                    {copiedBank === siteData.donasi.bank ? (
                      <Check className="w-5 h-5 text-yimi-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-neutral-600 flex items-center justify-between pt-1">
                  <span>Atas Nama:</span>
                  <strong className="text-neutral-800">
                    {siteData.donasi.atasNama}
                  </strong>
                </div>
              </div>

              {/* Muamalat Card */}
              {siteData.donasi.rekeningLain && (
                <div className="bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center font-bold">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-yimi-blue-800">
                          {siteData.donasi.rekeningLain.bank}
                        </h3>
                        <span className="text-xs text-neutral-400">
                          Kode Bank: {siteData.donasi.rekeningLain.kodeBank}
                        </span>
                      </div>
                    </div>
                    <Badge variant="neutral">Operasional &amp; Dakwah</Badge>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                        Nomor Rekening
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-extrabold text-yimi-blue-800 tracking-wider">
                        {siteData.donasi.rekeningLain.noRekening}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          siteData.donasi.rekeningLain.noRekening,
                          siteData.donasi.rekeningLain.bank
                        )
                      }
                      className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-yimi-blue-50 text-neutral-600 hover:text-yimi-blue-600 transition-colors cursor-pointer"
                      title="Salin Nomor Rekening"
                      aria-label={`Salin nomor rekening ${siteData.donasi.rekeningLain.bank}`}
                    >
                      {copiedBank === siteData.donasi.rekeningLain.bank ? (
                        <Check className="w-5 h-5 text-yimi-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-neutral-600 flex items-center justify-between pt-1">
                    <span>Atas Nama:</span>
                    <strong className="text-neutral-800">
                      {siteData.donasi.rekeningLain.atasNama}
                    </strong>
                  </div>
                </div>
              )}

              {/* Panduan Kode Unik / Berita Transfer */}
              <div className="p-6 rounded-3xl bg-yimi-blue-50/70 border border-yimi-blue-600/20">
                <h4 className="text-sm font-bold text-yimi-blue-800 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-yimi-green-700" />
                  <span>Kode Unik Transaksi / Keterangan Berita</span>
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed mb-3">
                  Untuk mempermudah pencatatan akad infaq pada laporan keuangan, Anda dapat menambahkan nominal unik atau menuliskan keterangan transfer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200/80">
                    <span className="font-bold text-yimi-blue-800 block">Wakaf Lahan</span>
                    <span className="text-neutral-500">Tambahkan angka <strong>01</strong> (misal Rp 1.000.001)</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200/80">
                    <span className="font-bold text-yimi-blue-800 block">Jumat Berkah</span>
                    <span className="text-neutral-500">Tambahkan angka <strong>02</strong> (misal Rp 100.002)</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-neutral-200/80">
                    <span className="font-bold text-yimi-blue-800 block">Operasional Dakwah</span>
                    <span className="text-neutral-500">Tambahkan angka <strong>03</strong> (misal Rp 500.003)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: QRIS & Konfirmasi WA */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {/* QRIS Card */}
              <div className="bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-xs flex flex-col items-center text-center">
                <Badge variant="green" className="mb-4">
                  Pembayaran Instan
                </Badge>
                <h3 className="text-xl font-extrabold text-yimi-blue-800 mb-1">
                  QRIS Resmi YIMI
                </h3>
                <p className="text-xs text-neutral-500 mb-6 max-w-xs">
                  Dapat dipindai menggunakan seluruh mobile banking dan e-wallet di Indonesia.
                </p>

                <div className="w-full max-w-[280px] aspect-3/4 relative mb-6">
                  <Image
                    src={siteData.donasi.qrisImage}
                    alt="QRIS YIMI"
                    width={280}
                    height={360}
                    className="w-full h-auto object-contain rounded-2xl shadow-xs"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 w-full text-xs text-neutral-600">
                  <span className="block font-bold text-yimi-blue-800 mb-0.5">
                    NMID: ID1023456789012
                  </span>
                  <span>A.N. YAYASAN INSAN MUSLIM ISTIQOMAH</span>
                </div>
              </div>

              {/* Konfirmasi WhatsApp Card */}
              <div className="bg-yimi-blue-800 text-white rounded-3xl p-8 flex flex-col gap-4 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-yimi-yellow-400">
                  Amanah &amp; Transparansi
                </span>
                <h3 className="text-xl font-bold text-white">
                  Konfirmasi Donasi via WhatsApp
                </h3>
                <p className="text-xs text-blue-100/90 leading-relaxed">
                  Kirimkan bukti transfer untuk memperoleh tanda terima resmi dan pencatatan akad wakaf/infaq Anda.
                </p>
                <div className="pt-2">
                  <Button
                    href={waConfirmUrl}
                    variant="secondary"
                    size="md"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Konfirmasi Sekarang</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
