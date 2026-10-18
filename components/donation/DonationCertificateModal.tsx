'use client';

import React, { useRef } from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  Award,
  Calendar,
  CreditCard,
  Heart,
  Share2,
  Check,
} from 'lucide-react';
import { formatRupiah, formatTanggal, terbilangRupiah } from '@/lib/format';
import { StarOrnament } from '@/components/ui/StarOrnament';

export interface DonationReceiptData {
  ref_id: string;
  nama: string;
  nama_asli?: string;
  is_anonim?: boolean;
  program: string;
  nominal: number;
  bank_tujuan?: string;
  tanggal_transfer: string;
  doa?: string;
}

interface DonationCertificateModalProps {
  data: DonationReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DonationCertificateModal({
  data,
  isOpen,
  onClose,
}: DonationCertificateModalProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  const isWakaf = data.program.toLowerCase().includes('lahan') || data.program.toLowerCase().includes('wakaf');
  const terbilangText = terbilangRupiah(data.nominal);
  const formattedNominal = formatRupiah(data.nominal);
  const tanggalFormatted = formatTanggal(data.tanggal_transfer || new Date().toISOString());

  // Kalkulasi estimasi luas lahan jika wakaf (asumsi Rp 500.000/m2)
  const estimasiM2 = isWakaf ? (data.nominal / 500000).toFixed(1) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/kuitansi?ref=${encodeURIComponent(data.ref_id)}&nama=${encodeURIComponent(data.nama)}&nom=${data.nominal}&prog=${encodeURIComponent(data.program)}&tgl=${encodeURIComponent(data.tanggal_transfer)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Container Kuitansi */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-8 print:my-0 print:border-none print:shadow-none">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-b border-neutral-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-yimi-blue-800">
            <Award className="w-4 h-4 text-yimi-yellow-500" />
            <span>Dokumen Digital Resmi YIMI</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yimi-blue-600 text-white text-xs font-bold hover:bg-yimi-blue-700 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition cursor-pointer"
              aria-label="Tutup kuitansi"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Isi Dokumen / Sertifikat */}
        <div className="p-8 sm:p-12 relative bg-[#FCFDFD]">
          {/* Ornamen Garis Pinggir Ganda Islami */}
          <div className="absolute inset-4 border-2 border-yimi-blue-600/20 rounded-2xl pointer-events-none" />
          <div className="absolute inset-5 border border-yimi-blue-600/10 rounded-xl pointer-events-none" />

          {/* Header Lembaga */}
          <div className="text-center relative z-10 pb-6 border-b border-neutral-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <StarOrnament className="w-6 h-6 text-yimi-blue-600" />
              <span className="font-mono text-xs font-black tracking-widest uppercase text-yimi-blue-600">
                YAYASAN INSAN MUSLIM ISTIQOMAH
              </span>
              <StarOrnament className="w-6 h-6 text-yimi-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-yimi-blue-900 tracking-tight">
              {isWakaf ? 'SERTIFIKAT WAKAF LAHAN DAKWAH' : 'TANDA TERIMA & KUITANSI INFAQ'}
            </h2>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-md mx-auto">
              Perum Bumi Cikampek Baru Blok B3 No 10, Balonggandu, Jatisari, Karawang, Jawa Barat 41374
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-0.5 rounded-full bg-yimi-blue-50 border border-yimi-blue-100 text-[10px] font-mono font-bold text-yimi-blue-700">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>No. Registrasi: {data.ref_id}</span>
            </div>
          </div>

          {/* Badan Kuitansi */}
          <div className="mt-6 space-y-4 text-xs sm:text-sm text-neutral-700 relative z-10">
            <p className="text-center text-xs text-neutral-500 italic pb-2">
              Alhamdulillah, telah diterima titipan amanah infaq dan wakaf dari muhsinin:
            </p>

            {/* Nama Donatur */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200/90 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {isWakaf ? 'Nama Pewakaf (Wakif)' : 'Nama Donatur (Muhsinin)'}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-yimi-blue-900 mt-0.5">
                {data.nama}
              </div>
              {data.is_anonim && (
                <span className="text-[10px] text-neutral-500 italic">
                  (Tercatat secara amanah dalam pembukuan yayasan)
                </span>
              )}
            </div>

            {/* Rincian Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-neutral-50/80 rounded-2xl p-3.5 border border-neutral-200/80">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Peruntukan Program
                </span>
                <span className="font-bold text-neutral-800 mt-0.5 block">
                  {data.program}
                </span>
                {estimasiM2 && Number(estimasiM2) > 0 && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Setara dengan ± {estimasiM2} m² Lahan
                  </span>
                )}
              </div>

              <div className="bg-neutral-50/80 rounded-2xl p-3.5 border border-neutral-200/80">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Tanggal Transaksi
                </span>
                <span className="font-bold text-neutral-800 mt-0.5 block">
                  {tanggalFormatted}
                </span>
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Bank Tujuan: {data.bank_tujuan || 'BSI'}
                </span>
              </div>
            </div>

            {/* Nominal Kotak Utama */}
            <div className="bg-yimi-blue-50/70 rounded-2xl p-5 border border-yimi-blue-200 text-center">
              <span className="text-[11px] font-bold text-yimi-blue-600 uppercase tracking-wider block">
                Jumlah Donasi Disalurkan
              </span>
              <div className="font-mono text-2xl sm:text-3xl font-black text-yimi-blue-900 tracking-tight mt-1">
                {formattedNominal}
              </div>
              <div className="text-xs font-semibold text-yimi-blue-700 mt-1 italic">
                Terbilang: &ldquo;{terbilangText}&rdquo;
              </div>
            </div>

            {/* Doa atau Catatan */}
            {data.doa && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-neutral-700">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                  Doa &amp; Harapan Donatur
                </span>
                <p className="italic text-xs text-neutral-800">
                  &ldquo;{data.doa}&rdquo;
                </p>
              </div>
            )}

            {/* Kutipan Hadits Shahih */}
            <div className="pt-2 text-center border-t border-neutral-200 text-neutral-500">
              <p className="text-[11px] italic leading-relaxed text-neutral-600">
                &ldquo;Jika seseorang meninggal dunia, maka terputuslah amalannya kecuali tiga perkara: sedekah jariyah, ilmu yang dimanfaatkan, atau doa anak yang shalih.&rdquo;
              </p>
              <span className="text-[10px] font-bold text-neutral-400 block mt-0.5">
                (HR. Muslim No. 1631)
              </span>
            </div>

            {/* Tanda Tangan & Cap Stempel Digital */}
            <div className="pt-4 flex items-end justify-between px-2">
              <div className="text-left text-[10px] text-neutral-400 space-y-0.5">
                <div>Dokumen Sah Elektronik</div>
                <div>Yayasan Insan Muslim Istiqomah</div>
                <div>Status: Terverifikasi Sistem</div>
              </div>

              <div className="text-center relative">
                {/* Cap Stempel Digital */}
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600/70 flex flex-col items-center justify-center text-emerald-700 mx-auto transform -rotate-12 bg-white/70 shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">TERCATAT</span>
                  <span className="text-[7px] font-bold">YIMI PUSAT</span>
                </div>
                <div className="mt-1 text-xs font-bold text-yimi-blue-900">
                  Pengurus Yayasan
                </div>
                <div className="text-[10px] text-neutral-500">
                  Divisi Keuangan &amp; Wakaf
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (print hidden) */}
        <div className="p-4 sm:p-5 bg-neutral-100 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <span className="text-xs text-neutral-500 text-center sm:text-left">
            Simpan kuitansi digital ini sebagai arsip ibadah dan amal jariyah Anda bersama YIMI.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
            <span>Tutup Kuitansi</span>
          </button>
        </div>
      </div>
    </div>
  );
}
