'use client';

import React, { useState, useEffect } from 'react';
import { LandPlot, Plus, History } from 'lucide-react';
import { LandCampaignData, LandUpdateItem } from '@/lib/types';
import { formatRupiah } from '@/lib/format';

export default function AdminLahanPage() {
  const [campaign, setCampaign] = useState<LandCampaignData | null>(null);
  const [updates, setUpdates] = useState<LandUpdateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Tambah Update Donasi Masuk
  const [nominalInput, setNominalInput] = useState('');
  const [catatanInput, setCatatanInput] = useState('');
  const [tanggalInput, setTanggalInput] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Edit Target
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetDanaInput, setTargetDanaInput] = useState(0);
  const [luasTargetInput, setLuasTargetInput] = useState(1200);
  const [hargaPerMeterInput, setHargaPerMeterInput] = useState(1500000);

  useEffect(() => {
    loadLahanData();
  }, []);

  async function loadLahanData() {
    try {
      const res = await fetch('/api/admin/lahan');
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        setUpdates(data.updates || []);
        if (data.campaign) {
          setTargetDanaInput(data.campaign.target_dana);
          setLuasTargetInput(data.campaign.luas_target_m2);
          setHargaPerMeterInput(data.campaign.harga_per_meter);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setIsAddingUpdate(true);

    try {
      const nominalNum = parseFloat(nominalInput.replace(/[^0-9]/g, ''));
      const res = await fetch('/api/admin/lahan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nominal: nominalNum,
          catatan: catatanInput,
          tanggal: tanggalInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Gagal menambah update donasi.' });
      } else {
        setMessage({
          type: 'success',
          text: `Update dana masuk sebesar ${formatRupiah(nominalNum)} berhasil dicatat!`,
        });
        setNominalInput('');
        setCatatanInput('');
        loadLahanData();
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi gangguan jaringan.' });
    } finally {
      setIsAddingUpdate(false);
    }
  }

  async function handleSaveTarget(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign) return;

    try {
      const res = await fetch('/api/admin/lahan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaign,
          target_dana: targetDanaInput,
          luas_target_m2: luasTargetInput,
          harga_per_meter: hargaPerMeterInput,
        }),
      });

      if (res.ok) {
        setIsEditingTarget(false);
        setMessage({ type: 'success', text: 'Target kampanye lahan berhasil diperbarui.' });
        loadLahanData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading || !campaign) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#3E5FD1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-[#6B7280]">Memuat data kampanye lahan…</span>
      </div>
    );
  }

  const terkumpul = Number(campaign.terkumpul);
  const target = Number(campaign.target_dana);
  const percentage = Math.min(100, Math.round((terkumpul / target) * 100));

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
              : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Kartu Status Utama Progres Lahan (Design Spec 5.9) */}
      <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E3E7EE]">
          <div className="flex items-center space-x-2">
            <LandPlot className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">{campaign.judul}</h3>
          </div>
          <button
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="text-xs font-semibold text-[#3E5FD1] hover:underline"
          >
            {isEditingTarget ? 'Tutup Pengaturan Target' : 'Edit Parameter Target'}
          </button>
        </div>

        {/* Form Edit Target jika mode edit aktif */}
        {isEditingTarget && (
          <form onSubmit={handleSaveTarget} className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] space-y-3">
            <h4 className="text-xs font-bold text-[#1F2F6B]">Ubah Parameter Target</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#6B7280] mb-1">Target Total Dana (Rp)</label>
                <input
                  type="number"
                  value={targetDanaInput}
                  onChange={(e) => setTargetDanaInput(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[#6B7280] mb-1">Luas Target (m²)</label>
                <input
                  type="number"
                  value={luasTargetInput}
                  onChange={(e) => setLuasTargetInput(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[#6B7280] mb-1">Harga per Meter (Rp)</label>
                <input
                  type="number"
                  value={hargaPerMeterInput}
                  onChange={(e) => setHargaPerMeterInput(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3E5FD1] text-white text-xs font-semibold rounded-lg"
            >
              Simpan Target Baru
            </button>
          </form>
        )}

        {/* Visualisasi Progres */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-[#6B7280] block">Total Dana Terkumpul:</span>
              <span className="text-3xl font-extrabold text-[#1F2F6B] tabular-nums">
                {formatRupiah(terkumpul)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6B7280] block">Target Pembebasan:</span>
              <span className="text-base font-bold text-[#111827] tabular-nums">
                {formatRupiah(target)}
              </span>
            </div>
          </div>

          <div className="w-full bg-[#E3E7EE] h-3.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2EE05A] h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span>
              Luas Terealisasi: <strong>{Math.round(terkumpul / campaign.harga_per_meter)} m²</strong> dari target <strong>{campaign.luas_target_m2} m²</strong>
            </span>
            <span className="text-sm font-bold text-[#138A3A]">{percentage}% Tercapai</span>
          </div>
        </div>
      </div>

      {/* Form Tambah Update Dana Masuk (Append-Only) */}
      <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
          <Plus className="w-5 h-5 text-[#3E5FD1]" />
          <h3 className="font-bold text-base text-[#111827]">Catat Update Dana Masuk Baru</h3>
        </div>

        <form onSubmit={handleAddUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                Nominal Dana Masuk (Rp) <span className="text-[#D7261E]">*</span>
              </label>
              <input
                type="text"
                required
                value={nominalInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setNominalInput(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                }}
                placeholder="Contoh: 50.000.000"
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-mono focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                Tanggal Penerimaan Dana <span className="text-[#D7261E]">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalInput}
                onChange={(e) => setTanggalInput(e.target.value)}
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#374151] mb-1">
              Catatan Sumber Dana / Transparansi <span className="text-[#D7261E]">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={catatanInput}
              onChange={(e) => setCatatanInput(e.target.value)}
              placeholder="Contoh: Wakaf pembebasan lahan 20 m² dari Hamba Allah (Tangerang)"
              className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isAddingUpdate}
              className="px-5 py-2.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5"
            >
              <span>{isAddingUpdate ? 'Menyimpan…' : 'Simpan Update Dana'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat Update Progres (Append-Only) */}
      <div className="bg-white rounded-xl border border-[#E3E7EE] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E3E7EE] flex items-center space-x-2 bg-[#F5F7FA]">
          <History className="w-4 h-4 text-[#3E5FD1]" />
          <h3 className="font-bold text-sm text-[#111827]">
            Riwayat Penerimaan Dana Wakaf (Append-Only)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E3E7EE]">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nominal Masuk</th>
                <th className="py-3 px-4">Catatan Penerimaan</th>
                <th className="py-3 px-4 text-right">Dicatat Oleh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE]">
              {updates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[#6B7280]">
                    Belum ada riwayat update dana masuk.
                  </td>
                </tr>
              ) : (
                updates.map((up) => (
                  <tr key={up.id} className="hover:bg-[#EEF2FC]/40 transition">
                    <td className="py-3 px-4 font-mono whitespace-nowrap text-[#1F2F6B]">
                      {up.tanggal}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#138A3A] font-mono whitespace-nowrap">
                      +{formatRupiah(Number(up.nominal))}
                    </td>
                    <td className="py-3 px-4 text-[#374151]">{up.catatan}</td>
                    <td className="py-3 px-4 text-right text-[#6B7280] font-mono">
                      {up.created_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
