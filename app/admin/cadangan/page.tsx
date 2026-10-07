'use client';

import React, { useState } from 'react';
import { Download, ShieldCheck, Database, FileText, CheckCircle2 } from 'lucide-react';

export default function AdminCadanganPage() {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  async function handleDownloadBackup() {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Gagal mengunduh cadangan');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `yimi-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh file cadangan. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Ekspor & Cadangan Konten JSON</h2>
        <p className="text-xs text-[#6B7280]">
          Unduh cadangan data lengkap yayasan untuk arsip lokal independen dan pemulihan darurat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu Ekspor Utama */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E3E7EE] p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-[#E3E7EE]">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FC] text-[#3E5FD1] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Ekspor Cadangan Lengkap</h3>
              <p className="text-xs text-[#6B7280]">
                Termasuk: Pengaturan situs, pilar program, jadwal kajian, progres wakaf lahan & riwayat dana masuk, artikel warta, dan pesan silaturahim.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] space-y-2 text-xs text-[#374151]">
            <div className="flex items-center space-x-2 font-semibold text-[#1F2F6B]">
              <ShieldCheck className="w-4 h-4 text-[#138A3A]" />
              <span>Standar Keamanan Sesuai PRD F-PUB-04</span>
            </div>
            <p>
              Berkas cadangan di-generate secara deterministik dalam format JSON standar RFC 8259, dapat dibuka dengan teks editor apa pun, dan siap diimpor kembali ke database PostgreSQL/Supabase kapan saja.
            </p>
          </div>

          {downloadSuccess && (
            <div className="p-4 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl text-xs text-[#166534] flex items-center space-x-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Berkas cadangan JSON berhasil diunduh ke perangkat Anda.</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleDownloadBackup}
              disabled={downloading}
              className="px-6 py-3 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md shadow-[#3E5FD1]/20 disabled:opacity-60"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{downloading ? 'Menyiapkan Cadangan…' : 'Unduh Cadangan JSON Sekarang'}</span>
            </button>
          </div>
        </div>

        {/* Info Petunjuk */}
        <div className="bg-white rounded-xl border border-[#E3E7EE] p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <FileText className="w-4 h-4 text-[#3E5FD1]" />
            <h4 className="font-bold text-xs text-[#111827]">Rekomendasi Pengelola</h4>
          </div>

          <ul className="text-xs text-[#4B5563] space-y-2.5 list-disc pl-4">
            <li>Lakukan ekspor cadangan secara berkala (misal: setiap akhir pekan atau setelah pembaruan donasi besar).</li>
            <li>Simpan berkas di media penyimpanan eksternal yang aman dan terenkripsi.</li>
            <li>File cadangan memuat riwayat dana masuk untuk keperluan audit transparansi yayasan.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
