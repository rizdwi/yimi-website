'use client';

import React, { useState } from 'react';
import {
  Heart,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  Building2,
  FileText,
  Sparkles,
  ArrowRight,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { Badge } from '@/components/ui/Badge';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import siteData from '@/content/site.json';
import { DonationConfirmModal } from '@/components/donation/DonationConfirmModal';
import { LiveDonationFeed } from '@/components/donation/LiveDonationFeed';
import { formatRupiah } from '@/lib/format';

const QUICK_PROGRAMS = [
  {
    nama: 'Pembebasan Lahan Sentra Dakwah & Masjid YIMI',
    label: 'Wakaf Lahan (1 m²)',
    nominal: 500000,
    keterangan: 'Pahala jariyah abadi untuk kaderisasi da’i dan santri.',
  },
  {
    nama: 'Sedekah Makan Jumat Berkah',
    label: 'Jumat Berkah (5 Porsi)',
    nominal: 100000,
    keterangan: 'Pemberian paket makan siang jumat untuk jamaah & dhuafa.',
  },
  {
    nama: 'Pendidikan & Santri TK/PAUD Islam Istiqomah',
    label: 'Beasiswa Santri PAUD',
    nominal: 250000,
    keterangan: 'Dukungan operasional dan SPP anak yatim & pra-sejahtera.',
  },
  {
    nama: 'Operasional Dakwah & Kajian Sunnah',
    label: 'Infaq Operasional Dakwah',
    nominal: 50000,
    keterangan: 'Sound system, siaran kajian berkala, dan akomodasi ustadz.',
  },
];

export default function DonasiPage() {
  const { settings, whatsapp } = useSiteSettings();
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProgram, setModalProgram] = useState('Pembebasan Lahan Sentra Dakwah & Masjid YIMI');
  const [modalNominal, setModalNominal] = useState(100000);

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

  const handleOpenConfirm = (programName?: string, nominalAmount?: number) => {
    if (programName) setModalProgram(programName);
    if (nominalAmount) setModalNominal(nominalAmount);
    setIsModalOpen(true);
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

      {/* Quick Infaq Preset Chips Section */}
      <section className="py-12 bg-white border-b border-neutral-200">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-yimi-blue-900 tracking-tight">
              Pilihan Cepat Saluran Kebaikan
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Pilih program dan nominal yang ingin Anda salurkan, atau sesuaikan secara fleksibel di formulir konfirmasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_PROGRAMS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:border-yimi-blue-400 hover:shadow-sm transition flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-yimi-blue-700 uppercase tracking-wider block mb-1">
                    {item.label}
                  </span>
                  <div className="font-mono text-xl font-black text-neutral-900">
                    {formatRupiah(item.nominal)}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                    {item.keterangan}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenConfirm(item.nama, item.nominal)}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-white group-hover:bg-yimi-blue-600 text-yimi-blue-700 group-hover:text-white border border-yimi-blue-200 group-hover:border-yimi-blue-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Pilih &amp; Konfirmasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Section: Rekening & Formulir */}
      <section className="py-16 bg-neutral-100/60">
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
                    onClick={() => copyToClipboard(bank1Rekening, bank1Nama)}
                    className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-yimi-blue-50 text-neutral-600 hover:text-yimi-blue-600 transition-colors cursor-pointer"
                    title="Salin Nomor Rekening"
                    aria-label={`Salin nomor rekening ${bank1Nama}`}
                  >
                    {copiedBank === bank1Nama ? (
                      <Check className="w-5 h-5 text-emerald-600" />
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
                      onClick={() => copyToClipboard(bank2Rekening, bank2Nama)}
                      className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-yimi-blue-50 text-neutral-600 hover:text-yimi-blue-600 transition-colors cursor-pointer"
                      title="Salin Nomor Rekening"
                      aria-label={`Salin nomor rekening ${bank2Nama}`}
                    >
                      {copiedBank === bank2Nama ? (
                        <Check className="w-5 h-5 text-emerald-600" />
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
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
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

            {/* Right 5 cols: Card Konfirmasi Langsung & WA */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Card Form Konfirmasi Langsung */}
              <div className="bg-yimi-blue-900 text-white rounded-3xl p-8 flex flex-col gap-5 shadow-lg border border-yimi-blue-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-yellow-400">
                  <Award className="w-4 h-4" />
                  <span>Layanan Konfirmasi Online</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    Konfirmasi Transfer &amp; Unduh Kuitansi
                  </h3>
                  <p className="text-xs text-blue-100/80 leading-relaxed mt-2">
                    Setelah melakukan transfer, isi formulir konfirmasi langsung di sini untuk menerima <b>nomor registrasi</b> dan <b>E-Kuitansi / E-Sertifikat digital</b> resmi yayasan.
                  </p>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    onClick={() => handleOpenConfirm()}
                    className="w-full py-3.5 px-4 rounded-2xl bg-yimi-yellow-500 hover:bg-yimi-yellow-400 text-yimi-blue-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Buka Formulir Konfirmasi Donasi</span>
                  </button>

                  <a
                    href={waConfirmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/20 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Atau Konfirmasi via WhatsApp Pengurus</span>
                  </a>
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-blue-200/70 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tercatat amanah dan terhubung langsung ke notifikasi pengurus yayasan.</span>
                </div>
              </div>

              {/* Jaminan Akuntabilitas Box */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Prinsip Transparansi Yayasan
                </h4>
                <ul className="text-xs text-neutral-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Lembaga berbadan hukum resmi SK Kemenkumham RI.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Laporan pembukuan keuangan diaudit secara berkala.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Penyaluran dana infaq tepat sasaran sesuai amanah akad.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Live Donation & Prayer Feed */}
          <div className="mt-16">
            <LiveDonationFeed onOpenConfirm={() => handleOpenConfirm()} />
          </div>
        </div>
      </section>

      {/* Interactive Confirmation Modal */}
      <DonationConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultProgram={modalProgram}
        defaultNominal={modalNominal}
      />
    </div>
  );
}
