'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ShieldCheck,
  Award,
  Share2,
  Check,
  ArrowLeft,
  Heart,
  X,
  Search,
  Loader2,
} from 'lucide-react';
import { formatRupiah, formatTanggal, terbilangRupiah } from '@/lib/format';
import { StarOrnament } from '@/components/ui/StarOrnament';

function KuitansiInner() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const initialRef = searchParams.get('ref') || 'YIMI-2026-OFFICIAL';
  const initialNama = searchParams.get('nama') || 'Muhsinin YIMI';
  const initialNominal = Number(searchParams.get('nom')) || 100000;
  const initialProg = searchParams.get('prog') || 'Pembebasan Lahan Sentra Dakwah & Masjid YIMI';
  const initialTgl = searchParams.get('tgl') || new Date().toISOString().split('T')[0];

  const [receipt, setReceipt] = useState({
    refId: initialRef,
    nama: initialNama,
    nominal: initialNominal,
    program: initialProg,
    tanggal: initialTgl,
  });

  // Jika URL hanya ada ref tanpa nom/nama, coba cari otomatis di server
  useEffect(() => {
    const r = searchParams.get('ref');
    if (r && !searchParams.get('nom') && r !== 'YIMI-2026-OFFICIAL') {
      lookupRef(r);
    }
  }, [searchParams]);

  const lookupRef = async (code: string) => {
    const clean = code.trim();
    if (!clean) return;
    setSearching(true);
    setSearchMsg(null);
    try {
      const res = await fetch(`/api/donasi/kuitansi?ref=${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (res.ok && json.found && json.receipt) {
        setReceipt({
          refId: json.receipt.ref_id,
          nama: json.receipt.nama,
          nominal: json.receipt.nominal || 100000,
          program: json.receipt.program,
          tanggal: json.receipt.tanggal,
        });
        setSearchMsg({ type: 'success', text: `Data kuitansi ditemukan untuk ${json.receipt.ref_id}` });
      } else {
        setSearchMsg({ type: 'error', text: json.message || 'Nomor registrasi tidak ditemukan. Pastikan format YIMI-...' });
      }
    } catch {
      setSearchMsg({ type: 'error', text: 'Gagal menghubungkan ke server verifikasi' });
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupRef(searchInput);
  };

  const refId = receipt.refId;
  const rawNama = receipt.nama;
  const nominal = receipt.nominal;
  const program = receipt.program;
  const tanggal = receipt.tanggal;

  const isWakaf = program.toLowerCase().includes('lahan') || program.toLowerCase().includes('wakaf');
  const terbilangText = terbilangRupiah(nominal);
  const formattedNominal = formatRupiah(nominal);
  const tanggalFormatted = formatTanggal(tanggal);
  const estimasiM2 = isWakaf ? (nominal / 500000).toFixed(1) : null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      if (window.opener) {
        window.close();
        return;
      }
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/donasi';
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 pt-28 pb-16 px-4 print:p-0 print:bg-white">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Navigation & Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/donasi"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-yimi-blue-700 hover:text-yimi-blue-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Donasi</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tautan Tersalin' : 'Bagikan'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yimi-blue-600 hover:bg-yimi-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition cursor-pointer"
              title="Tutup Kuitansi"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Search / Lookup Kuitansi Mandiri (Hidden on print) */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-2xs print:hidden">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari kuitansi: masukkan Ref ID (contoh: YIMI-2026...)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-yimi-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-yimi-blue-600 hover:bg-yimi-blue-700 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
            >
              {searching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memeriksa...</span>
                </>
              ) : (
                <span>Cari Kuitansi</span>
              )}
            </button>
          </form>
          {searchMsg && (
            <p className={`text-xs mt-2 font-medium ${searchMsg.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
              {searchMsg.text}
            </p>
          )}
        </div>

        {/* Kartu Sertifikat / Kuitansi */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden relative p-8 sm:p-12 print:border-none print:shadow-none print:p-6">
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
            <h1 className="text-xl sm:text-2xl font-black text-yimi-blue-900 tracking-tight">
              {isWakaf ? 'SERTIFIKAT WAKAF LAHAN DAKWAH' : 'TANDA TERIMA & KUITANSI INFAQ'}
            </h1>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-md mx-auto">
              Perum Bumi Cikampek Baru Blok B3 No. 10, RT 002/RW 007, Desa Balonggandu, Kecamatan Jatisari, Kabupaten Karawang, Jawa Barat 41373
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-0.5 rounded-full bg-yimi-blue-50 border border-yimi-blue-100 text-[10px] font-mono font-bold text-yimi-blue-700">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>No. Registrasi: {refId}</span>
            </div>
          </div>

          {/* Badan Kuitansi */}
          <div className="mt-6 space-y-4 text-xs sm:text-sm text-neutral-700 relative z-10">
            <p className="text-center text-xs text-neutral-500 italic pb-1">
              Alhamdulillah, telah diterima titipan amanah infaq dan wakaf dari muhsinin:
            </p>

            {/* Nama Donatur */}
            <div className="bg-neutral-50/60 rounded-2xl p-4 border border-neutral-200/90 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {isWakaf ? 'Nama Pewakaf (Wakif)' : 'Nama Donatur (Muhsinin)'}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-yimi-blue-900 mt-0.5">
                {rawNama}
              </div>
            </div>

            {/* Rincian Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-neutral-50/80 rounded-2xl p-3.5 border border-neutral-200/80">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Peruntukan Program
                </span>
                <span className="font-bold text-neutral-800 mt-0.5 block">
                  {program}
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
                  Metode: Transfer Rekening Bank Resmi
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

        {/* Bottom Action Bar (Hidden on print) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm print:hidden">
          <div className="text-xs text-neutral-500 text-center sm:text-left">
            Simpan bukti kuitansi ini sebagai arsip donasi resmi Yayasan YIMI.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-yimi-blue-600 hover:bg-yimi-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
              <span>Tutup Kuitansi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KuitansiContent() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-xs text-neutral-400">Memuat data kuitansi…</div>}>
      <KuitansiInner />
    </Suspense>
  );
}
