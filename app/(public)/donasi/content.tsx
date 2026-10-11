'use client';

import React, { useState } from 'react';
import {
  Heart,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Badge } from '@/components/ui/Badge';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import siteData from '@/content/site.json';

export default function DonasiPage() {
  const { settings, whatsapp } = useSiteSettings();
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const bank1Nama = settings?.bank_1_nama || siteData.donasi.bank;
  const bank1Rekening = settings?.bank_1_rekening || siteData.donasi.noRekening;
  const bank1An = settings?.bank_1_an || siteData.donasi.atasNama;
  const bank2Nama = settings?.bank_2_nama || siteData.donasi.rekeningLain?.bank || '';
  const bank2Rekening = settings?.bank_2_rekening || siteData.donasi.rekeningLain?.noRekening || '';
  const bank2An = settings?.bank_2_an || siteData.donasi.rekeningLain?.atasNama || '';
  const activeWa = whatsapp || siteData.kontak.whatsapp;

  // Hanya tampilkan kartu rekening bila nama & nomornya valid (bukan kosong / "-")
  const isValidBank = (nama?: string, rek?: string) =>
    !!nama && nama.trim() !== '' && nama.trim() !== '-' &&
    !!rek && rek.trim() !== '' && rek.trim() !== '-';

  const copyToClipboard = (accountNo: string, bankName: string) => {
    navigator.clipboard.writeText(accountNo);
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const waConfirmUrl = `https://wa.me/${activeWa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Assalamu’alaikum Warahmatullahi Wabarakatuh, saya ingin konfirmasi donasi/infaq untuk Yayasan Insan Muslim Istiqomah (YIMI).'
  )}`;

  return (
    <div className="pt-[72px]">
      {/* Subpage Hero */}
      <PageHero
        image="/images/banners/donasi.jpg"
        imageAlt="Kotak donasi dengan simbol hati bercahaya, semangat berbagi"
        badge={
          <>
            <Heart className="w-3.5 h-3.5 fill-yimi-yellow-400" />
            <span>Infaq &amp; Wakaf Umat</span>
          </>
        }
        title="Saluran Infaq Resmi YIMI"
        subtitle="Salurkan infaq, sedekah, dan wakaf Anda melalui saluran resmi untuk mendukung operasional dakwah sunnah dan sosial umat."
      />

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
                        {bank1Nama}
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
                      {bank1Rekening}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(bank1Rekening, bank1Nama)
                    }
                    className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-yimi-blue-50 text-neutral-600 hover:text-yimi-blue-600 transition-colors cursor-pointer"
                    title="Salin Nomor Rekening"
                    aria-label={`Salin nomor rekening ${bank1Nama}`}
                  >
                    {copiedBank === bank1Nama ? (
                      <Check className="w-5 h-5 text-yimi-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-neutral-600 flex items-center justify-between pt-1">
                  <span>Atas Nama:</span>
                  <strong className="text-neutral-800">
                    {bank1An}
                  </strong>
                </div>
              </div>

              {/* Rekening Kedua (opsional, hanya bila datanya valid) */}
              {isValidBank(bank2Nama, bank2Rekening) && (
                <div className="bg-white rounded-3xl p-8 border border-neutral-200/90 shadow-xs flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-yimi-blue-50 text-yimi-blue-600 flex items-center justify-center font-bold">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-yimi-blue-800">
                          {bank2Nama}
                        </h3>
                        <span className="text-xs text-neutral-400">
                          Kode Bank: {siteData.donasi.rekeningLain?.kodeBank || '147'}
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
                        {bank2Rekening}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          bank2Rekening,
                          bank2Nama
                        )
                      }
                      className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-yimi-blue-50 text-neutral-600 hover:text-yimi-blue-600 transition-colors cursor-pointer"
                      title="Salin Nomor Rekening"
                      aria-label={`Salin nomor rekening ${bank2Nama}`}
                    >
                      {copiedBank === bank2Nama ? (
                        <Check className="w-5 h-5 text-yimi-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-neutral-600 flex items-center justify-between pt-1">
                    <span>Atas Nama:</span>
                    <strong className="text-neutral-800">
                      {bank2An}
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

            {/* Right 5 cols: Konfirmasi WA */}
            <div className="lg:col-span-5 flex flex-col gap-8">
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
