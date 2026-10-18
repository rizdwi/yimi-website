'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Upload,
  Check,
  Copy,
  AlertCircle,
  ShieldCheck,
  Building2,
  FileText,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { DonationCertificateModal, DonationReceiptData } from './DonationCertificateModal';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import siteData from '@/content/site.json';

interface DonationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProgram?: string;
  defaultNominal?: number;
}

const PRESET_AMOUNTS = [
  25000,
  50000,
  100000,
  250000,
  500000,
  1500000,
];

const PROGRAM_OPTIONS = [
  'Pembebasan Lahan Sentra Dakwah & Masjid YIMI',
  'Sedekah Makan Jumat Berkah',
  'Pendidikan & Santri TK/PAUD Islam Istiqomah',
  'Operasional Dakwah & Kajian Sunnah',
  'Zakat Maal & Fidyah',
];

export function DonationConfirmModal({
  isOpen,
  onClose,
  defaultProgram = 'Pembebasan Lahan Sentra Dakwah & Masjid YIMI',
  defaultNominal = 100000,
}: DonationConfirmModalProps) {
  const { settings, whatsapp } = useSiteSettings();

  const [program, setProgram] = useState(defaultProgram);
  const [nominal, setNominal] = useState<number>(defaultNominal);
  const [customNominal, setCustomNominal] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [nama, setNama] = useState('');
  const [isAnonim, setIsAnonim] = useState(false);
  const [waNumber, setWaNumber] = useState('');
  const [bankTujuan, setBankTujuan] = useState('BSI');
  const [tanggalTransfer, setTanggalTransfer] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [doa, setDoa] = useState('');
  const [websiteTrap, setWebsiteTrap] = useState('');

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [buktiUrl, setBuktiUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedData, setSubmittedData] = useState<DonationReceiptData | null>(null);

  // Certificate Modal State
  const [showCertificate, setShowCertificate] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  const bank1Nama = settings?.bank_1_nama || siteData.donasi.bank;
  const bank1Rekening = settings?.bank_1_rekening || siteData.donasi.noRekening;
  const bank1An = settings?.bank_1_an || siteData.donasi.atasNama;
  const activeWa = whatsapp || siteData.kontak.whatsapp;

  useEffect(() => {
    if (defaultProgram) setProgram(defaultProgram);
    if (defaultNominal) {
      setNominal(defaultNominal);
      if (!PRESET_AMOUNTS.includes(defaultNominal)) {
        setIsCustom(true);
        setCustomNominal(defaultNominal.toString());
      }
    }
  }, [defaultProgram, defaultNominal, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectPreset = (amt: number) => {
    setIsCustom(false);
    setNominal(amt);
    setCustomNominal('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setCustomNominal(raw);
    setIsCustom(true);
    setNominal(Number(raw) || 0);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(label);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/donasi/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengunggah foto.');
      }

      setBuktiUrl(json.url);
      setFileName(file.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengunggah berkas.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nama.trim()) {
      setFormError('Nama lengkap atau nama panggilan donatur wajib diisi.');
      return;
    }

    if (!waNumber.trim()) {
      setFormError('Nomor WhatsApp wajib diisi untuk verifikasi dan konfirmasi.');
      return;
    }

    if (!nominal || nominal <= 0) {
      setFormError('Nominal donasi harus lebih dari Rp 0.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/donasi/konfirmasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          is_anonim: isAnonim,
          whatsapp: waNumber.trim(),
          program,
          nominal,
          bank_tujuan: bankTujuan,
          tanggal_transfer: tanggalTransfer,
          bukti_transfer_url: buktiUrl,
          doa: doa.trim(),
          website_trap: websiteTrap,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal mengirim konfirmasi donasi.');
      }

      const receipt: DonationReceiptData = {
        ref_id: json.ref_id,
        nama: isAnonim ? 'Hamba Allah' : nama,
        nama_asli: nama,
        is_anonim: isAnonim,
        program,
        nominal,
        bank_tujuan: bankTujuan,
        tanggal_transfer: tanggalTransfer,
        doa,
      };

      setSubmittedData(receipt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat mengirim data.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Estimasi dampak wakaf tanah (asumsi Rp 500.000/m2)
  const isLahanProgram = program.toLowerCase().includes('lahan') || program.toLowerCase().includes('wakaf');
  const estimasiM2 = isLahanProgram && nominal > 0 ? (nominal / 500000).toFixed(2) : null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6 max-h-[90vh] flex flex-col">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4.5 bg-[#002846] text-white shrink-0 border-b border-[#001b30]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-yimi-yellow-400">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {submittedData ? 'Konfirmasi Berhasil Diterima' : 'Formulir Konfirmasi Donasi'}
                </h3>
                <p className="text-[11px] text-white/80">
                  Yayasan Insan Muslim Istiqomah (YIMI)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
              aria-label="Tutup form konfirmasi"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {submittedData ? (
              /* Success View */
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div>
                  <h4 className="text-xl font-extrabold text-yimi-blue-950">
                    Jazakallahu Khairan Katsiran!
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1.5 max-w-md mx-auto leading-relaxed">
                    Konfirmasi donasi Anda telah tercatat dengan aman di pembukuan yayasan. Semoga Allah memberkahi harta, keluarga, dan menjadi pahala jariyah yang berlipat ganda.
                  </p>
                </div>

                {/* Ringkasan Singkat Box */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-500">Nomor Registrasi:</span>
                    <span className="font-mono font-bold text-yimi-blue-800">
                      {submittedData.ref_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Donatur:</span>
                    <span className="font-bold text-neutral-800">
                      {submittedData.nama}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Program:</span>
                    <span className="font-bold text-neutral-800">
                      {submittedData.program}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-500">Nominal:</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {formatRupiah(submittedData.nominal)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCertificate(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-yimi-blue-600 hover:bg-yimi-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-yimi-yellow-400" />
                    <span>Lihat &amp; Cetak Kuitansi Digital Resmi</span>
                  </button>

                  <a
                    href={`https://wa.me/${activeWa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Assalamu’alaikum Warahmatullahi Wabarakatuh, saya telah mengirim konfirmasi donasi di web YIMI.\n\n` +
                      `No. Registrasi: ${submittedData.ref_id}\n` +
                      `Nama: ${submittedData.nama}\n` +
                      `Program: ${submittedData.program}\n` +
                      `Nominal: ${formatRupiah(submittedData.nominal)}\n\n` +
                      `Mohon verifikasinya, terima kasih.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-2xl bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Buka Chat WhatsApp Pengurus (Opsional)</span>
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Tutup Jendela</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot field for bot spam */}
                <input
                  type="text"
                  name="website_trap"
                  value={websiteTrap}
                  onChange={(e) => setWebsiteTrap(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {formError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Saluran Rekening Singkat */}
                <div className="p-3.5 rounded-2xl bg-yimi-blue-50/70 border border-yimi-blue-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-yimi-blue-700 tracking-wider block">
                      Rekening Resmi Yayasan
                    </span>
                    <span className="font-mono font-extrabold text-yimi-blue-950 text-sm">
                      {bank1Rekening}
                    </span>
                    <span className="text-neutral-500 block text-[11px]">
                      {bank1Nama} a.n {bank1An}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bank1Rekening, bank1Nama)}
                    className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-yimi-blue-600 transition shadow-2xs cursor-pointer"
                    title="Salin Nomor Rekening"
                  >
                    {copiedBank === bank1Nama ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 1. Pilih Program */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 block">
                    Pilihan Program Donasi
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-xs sm:text-sm font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500 focus:bg-white transition"
                  >
                    {PROGRAM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Nominal & Preset Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-800">
                      Nominal Donasi
                    </label>
                    {isLahanProgram && estimasiM2 && Number(estimasiM2) > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Setara ± {estimasiM2} m² Lahan
                      </span>
                    )}
                  </div>

                  {/* Preset Chips */}
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((amt) => {
                      const active = !isCustom && nominal === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleSelectPreset(amt)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center cursor-pointer border ${
                            active
                              ? 'bg-yimi-blue-600 text-white border-yimi-blue-600 shadow-xs'
                              : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {formatRupiah(amt)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Input Bebas */}
                  <div className="relative mt-2">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                      Rp
                    </span>
                    <input
                      type="text"
                      placeholder="Atau ketik nominal lainnya (bebas)"
                      value={isCustom ? customNominal : ''}
                      onChange={handleCustomChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-xs sm:text-sm font-bold text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* 3. Identitas Donatur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ahmad Syahputra"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-xs sm:text-sm text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      No. WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 08123456789"
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-xs sm:text-sm text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Checkbox Anonim */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonim}
                    onChange={(e) => setIsAnonim(e.target.checked)}
                    className="w-4 h-4 rounded text-yimi-blue-600 focus:ring-yimi-blue-500"
                  />
                  <span className="text-xs text-neutral-600">
                    Sembunyikan nama saya di publik (Tampilkan sebagai <b>Hamba Allah</b>)
                  </span>
                </label>

                {/* 4. Bank Tujuan & Tanggal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Bank Tujuan
                    </label>
                    <select
                      value={bankTujuan}
                      onChange={(e) => setBankTujuan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-xs font-medium text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500"
                    >
                      <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BCA">Bank BCA</option>
                      <option value="BRI">Bank BRI</option>
                      <option value="Lainnya">Bank Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Tanggal Transfer
                    </label>
                    <input
                      type="date"
                      value={tanggalTransfer}
                      onChange={(e) => setTanggalTransfer(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-2xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500"
                    />
                  </div>
                </div>

                {/* 5. Upload Bukti Transfer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 block">
                    Foto Bukti Transfer (Opsional tapi dianjurkan)
                  </label>
                  <div className="border-2 border-dashed border-neutral-300 hover:border-yimi-blue-400 rounded-2xl p-4 text-center bg-neutral-50/50 transition">
                    {buktiUrl ? (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200">
                        <div className="flex items-center gap-2 truncate">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-medium text-neutral-800 truncate">
                            {fileName || 'Foto Bukti Berhasil Diunggah'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBuktiUrl('');
                            setFileName('');
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:underline shrink-0 ml-2"
                        >
                          Ganti
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-1">
                          <Upload className="w-5 h-5 text-neutral-400" />
                          <span className="text-xs font-bold text-yimi-blue-700">
                            {uploading ? 'Mengunggah foto bukti…' : 'Pilih Berkas Foto Bukti Transfer'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            JPG, PNG, atau WebP (Maksimal 5 MB)
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                  {uploadError && (
                    <span className="text-[11px] text-rose-600 block">
                      {uploadError}
                    </span>
                  )}
                </div>

                {/* 6. Doa / Pesan */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-800 block">
                    Doa &amp; Harapan Donatur (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan doa kebaikan atau atas nama orang tua tercinta…"
                    value={doa}
                    onChange={(e) => setDoa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-neutral-50 border border-neutral-300 text-xs text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500 focus:bg-white transition resize-none"
                  />
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 py-3.5 px-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Tutup</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-yimi-blue-600 hover:bg-yimi-blue-700 active:bg-yimi-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <span>Memproses Konfirmasi…</span>
                    ) : (
                      <>
                        <span>Kirim Konfirmasi Donasi</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Certificate / Receipt Modal */}
      <DonationCertificateModal
        data={submittedData}
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
      />
    </>
  );
}
