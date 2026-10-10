'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  TrendingUp,
  Coins,
  Plus,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface CampaignData {
  id: string;
  judul: string;
  lokasi: string;
  luas_target_m2: number;
  harga_per_meter: number;
  target_dana: number;
  terkumpul: number;
  diperbarui_pada: string;
}

interface LandUpdate {
  id: string;
  tanggal: string;
  nominal: number;
  catatan: string;
  gambar_url?: string;
  created_by?: string;
  created_at: string;
}

export default function AdminLahanPage() {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [updates, setUpdates] = useState<LandUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal Edit Kampanye
  const [isEditCampaignOpen, setIsEditCampaignOpen] = useState(false);
  const [editCampaignForm, setEditCampaignForm] = useState({
    judul: '',
    lokasi: '',
    luas_target_m2: 0,
    harga_per_meter: 0,
    target_dana: 0,
    terkumpul: 0,
  });
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Modal Tambah Update Baru
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);
  const [addUpdateForm, setAddUpdateForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '',
    catatan: '',
  });
  const [savingUpdate, setSavingUpdate] = useState(false);

  // Modal Edit Update Tertentu
  const [editingUpdate, setEditingUpdate] = useState<LandUpdate | null>(null);
  const [editUpdateForm, setEditUpdateForm] = useState({
    tanggal: '',
    nominal: '',
    catatan: '',
  });
  const [savingEditUpdate, setSavingEditUpdate] = useState(false);

  // Modal Hapus Update
  const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/lahan');
      if (!res.ok) throw new Error('Gagal memuat data kampanye lahan.');
      const data = await res.json();
      setCampaign(data.campaign);
      setUpdates(data.updates || []);
      if (data.campaign) {
        setEditCampaignForm({
          judul: data.campaign.judul || '',
          lokasi: data.campaign.lokasi || '',
          luas_target_m2: data.campaign.luas_target_m2 || 0,
          harga_per_meter: data.campaign.harga_per_meter || 0,
          target_dana: data.campaign.target_dana || 0,
          terkumpul: data.campaign.terkumpul || 0,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/admin/lahan');
        if (!res.ok) throw new Error('Gagal memuat data wakaf lahan.');
        const data = await res.json();
        if (!ignore) {
          if (data.campaign) {
            setCampaign(data.campaign);
          }
          if (data.updates) {
            setUpdates(data.updates);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  function showToast(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  function openEditCampaignModal() {
    if (!campaign) return;
    setEditCampaignForm({
      judul: campaign.judul || '',
      lokasi: campaign.lokasi || '',
      luas_target_m2: campaign.luas_target_m2 || 0,
      harga_per_meter: campaign.harga_per_meter || 0,
      target_dana: campaign.target_dana || 0,
      terkumpul: campaign.terkumpul || 0,
    });
    setIsEditCampaignOpen(true);
  }

  async function handleSaveCampaign(e: React.FormEvent) {
    e.preventDefault();
    setSavingCampaign(true);
    try {
      const res = await fetch('/api/admin/lahan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCampaignForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan kampanye.');
      setCampaign(data.campaign);
      setIsEditCampaignOpen(false);
      showToast('Data & target kampanye pembebasan lahan berhasil diperbarui!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui kampanye.');
    } finally {
      setSavingCampaign(false);
    }
  }

  async function handleAddUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSavingUpdate(true);
    try {
      const res = await fetch('/api/admin/lahan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: addUpdateForm.tanggal,
          nominal: Number(addUpdateForm.nominal),
          catatan: addUpdateForm.catatan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambah update.');
      setIsAddUpdateOpen(false);
      setAddUpdateForm({
        tanggal: new Date().toISOString().split('T')[0],
        nominal: '',
        catatan: '',
      });
      showToast('Riwayat update donasi berhasil dicatat!');
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menambah update.');
    } finally {
      setSavingUpdate(false);
    }
  }

  function openEditUpdateModal(item: LandUpdate) {
    setEditingUpdate(item);
    setEditUpdateForm({
      tanggal: item.tanggal,
      nominal: item.nominal.toString(),
      catatan: item.catatan || '',
    });
  }

  async function handleSaveEditUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUpdate) return;
    setSavingEditUpdate(true);
    try {
      const res = await fetch('/api/admin/lahan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUpdate.id,
          tanggal: editUpdateForm.tanggal,
          nominal: Number(editUpdateForm.nominal),
          catatan: editUpdateForm.catatan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah update.');
      setEditingUpdate(null);
      showToast('Catatan update donasi berhasil diperbarui!');
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah update.');
    } finally {
      setSavingEditUpdate(false);
    }
  }

  async function handleDeleteUpdateConfirm() {
    if (!deletingUpdateId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/lahan?id=${deletingUpdateId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus update.');
      setDeletingUpdateId(null);
      showToast('Riwayat update donasi berhasil dihapus.');
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus update.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1F2F6B]"></div>
      </div>
    );
  }

  const target = campaign ? Number(campaign.target_dana) : 0;
  const terkumpul = campaign ? Number(campaign.terkumpul) : 0;
  const persentase = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0;
  const sisa = Math.max(0, target - terkumpul);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Pengelolaan Pembebasan Lahan</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Atur target nominal, luas, harga per meter, koreksi total dana, dan catat riwayat wakaf masuk.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openEditCampaignModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#3E5FD1] text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Target &amp; Data Lahan</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddUpdateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Donasi Masuk</span>
          </button>
        </div>
      </div>

      {/* Notifikasi Toast */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Kartu Ringkasan Kampanye Utama */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 pb-5 mb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Kampanye Aktif
            </span>
            <h2 className="text-xl font-bold text-[#111827] mt-2">
              {campaign?.judul || 'Pembebasan Lahan Markaz Dakwah YIMI'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span>{campaign?.lokasi || 'Kec. Gunungpati, Kota Semarang'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={openEditCampaignModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#EEF2FC] hover:bg-blue-100 text-[#1F2F6B] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Ubah Target &amp; Nominal</span>
          </button>
        </div>

        {/* 4 Kartu Metrik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
            <span className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#3E5FD1]" />
              Target Dana
            </span>
            <p className="text-lg md:text-xl font-extrabold text-[#111827] mt-1">
              Rp {target.toLocaleString('id-ID')}
            </p>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              {campaign?.luas_target_m2 || 0} m² @ Rp {Number(campaign?.harga_per_meter || 0).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
            <span className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Dana Terkumpul
            </span>
            <p className="text-lg md:text-xl font-extrabold text-emerald-700 mt-1">
              Rp {terkumpul.toLocaleString('id-ID')}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Tercapai {persentase}%
            </span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
            <span className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              Kekurangan Dana
            </span>
            <p className="text-lg md:text-xl font-extrabold text-amber-700 mt-1">
              Rp {sisa.toLocaleString('id-ID')}
            </p>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              Dibutuhkan segera
            </span>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
            <span className="text-xs font-medium text-neutral-500 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1F2F6B]" />
              Terakhir Diperbarui
            </span>
            <p className="text-base md:text-lg font-bold text-[#111827] mt-1">
              {campaign?.diperbarui_pada || '-'}
            </p>
            <span className="text-[11px] text-neutral-400 mt-0.5 block">
              {updates.length} catatan donasi
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <div className="flex justify-between text-xs font-semibold text-neutral-600 mb-1.5">
            <span>Progres Pembebasan Lahan</span>
            <span className="text-[#1F2F6B] font-bold">{persentase}%</span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#1F2F6B] to-[#3E5FD1] h-3 rounded-full transition-all duration-500"
              style={{ width: `${persentase}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabel Riwayat Donasi & Update Masuk */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-[#111827]">
              Riwayat Penerimaan Donasi &amp; Wakaf Masuk
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Daftar catatan dana yang masuk dan langsung menambah akumulasi total.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddUpdateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FC] hover:bg-blue-100 text-[#1F2F6B] rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Catatan Baru</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50/80 text-neutral-500 text-xs font-semibold uppercase tracking-wider border-b border-neutral-100">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Keterangan / Donatur</th>
                <th className="py-3 px-4">Dicatat Oleh</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {updates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 text-xs">
                    Belum ada riwayat update donasi tercatat.
                  </td>
                </tr>
              ) : (
                updates.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-neutral-700 whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 whitespace-nowrap">
                      Rp {Number(item.nominal).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {item.catatan || '-'}
                    </td>
                    <td className="py-3 px-4 text-neutral-400 text-xs">
                      {item.created_by || 'Admin'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditUpdateModal(item)}
                          className="p-1.5 text-neutral-500 hover:text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-lg transition-colors cursor-pointer"
                          title="Edit Catatan Donasi"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingUpdateId(item.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Catatan Donasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Kampanye & Target Lahan */}
      {isEditCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FC] flex items-center justify-center text-[#1F2F6B]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111827]">Edit Target &amp; Data Lahan</h3>
                  <p className="text-xs text-neutral-500">Sesuaikan target dana, dana terkumpul, dan luas lahan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCampaignOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Judul Kampanye Lahan
                </label>
                <input
                  type="text"
                  required
                  value={editCampaignForm.judul}
                  onChange={(e) => setEditCampaignForm({ ...editCampaignForm, judul: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Lokasi Lahan
                </label>
                <input
                  type="text"
                  required
                  value={editCampaignForm.lokasi}
                  onChange={(e) => setEditCampaignForm({ ...editCampaignForm, lokasi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Luas Target (m²)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editCampaignForm.luas_target_m2}
                    onChange={(e) => {
                      const luas = Number(e.target.value);
                      const targetTotal = luas * Number(editCampaignForm.harga_per_meter);
                      setEditCampaignForm({
                        ...editCampaignForm,
                        luas_target_m2: luas,
                        target_dana: targetTotal,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Harga per Meter (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editCampaignForm.harga_per_meter}
                    onChange={(e) => {
                      const harga = Number(e.target.value);
                      const targetTotal = Number(editCampaignForm.luas_target_m2) * harga;
                      setEditCampaignForm({
                        ...editCampaignForm,
                        harga_per_meter: harga,
                        target_dana: targetTotal,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Target Total Dana (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editCampaignForm.target_dana}
                    onChange={(e) => setEditCampaignForm({ ...editCampaignForm, target_dana: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                    Dana Terkumpul Live (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editCampaignForm.terkumpul}
                    onChange={(e) => setEditCampaignForm({ ...editCampaignForm, terkumpul: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/30 text-sm font-bold text-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Koreksi langsung total dana terkumpul saat ini
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsEditCampaignOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCampaign}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingCampaign ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Update Donasi */}
      {isAddUpdateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#111827]">Catat Donasi Lahan Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddUpdateOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Tanggal Masuk
                </label>
                <input
                  type="date"
                  required
                  value={addUpdateForm.tanggal}
                  onChange={(e) => setAddUpdateForm({ ...addUpdateForm, tanggal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Nominal Donasi (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Misal: 5000000"
                  value={addUpdateForm.nominal}
                  onChange={(e) => setAddUpdateForm({ ...addUpdateForm, nominal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Nominal ini akan otomatis menambah total dana terkumpul kampanye.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Keterangan / Muzakki / Donatur
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Misal: Hamba Allah via BSI atau Wakaf Tunai Keluarga Bpk. Fulan"
                  value={addUpdateForm.catatan}
                  onChange={(e) => setAddUpdateForm({ ...addUpdateForm, catatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddUpdateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingUpdate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{savingUpdate ? 'Menyimpan...' : 'Simpan Donasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Update Donasi Tertentu */}
      {editingUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="font-bold text-base text-[#111827]">Edit Catatan Donasi Lahan</h3>
              <button
                type="button"
                onClick={() => setEditingUpdate(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Tanggal Masuk
                </label>
                <input
                  type="date"
                  required
                  value={editUpdateForm.tanggal}
                  onChange={(e) => setEditUpdateForm({ ...editUpdateForm, tanggal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Nominal Donasi (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editUpdateForm.nominal}
                  onChange={(e) => setEditUpdateForm({ ...editUpdateForm, nominal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Perubahan nominal akan otomatis menyesuaikan total saldo terkumpul.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Keterangan / Muzakki / Donatur
                </label>
                <textarea
                  rows={3}
                  required
                  value={editUpdateForm.catatan}
                  onChange={(e) => setEditUpdateForm({ ...editUpdateForm, catatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingUpdate(null)}
                  className="px-4 py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEditUpdate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEditUpdate ? 'Menyimpan...' : 'Perbarui Catatan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Update */}
      <ConfirmModal
        isOpen={Boolean(deletingUpdateId)}
        title="Hapus Catatan Donasi Lahan?"
        message="Catatan donasi ini akan dihapus permanen dan total dana terkumpul akan otomatis dikurangi sejumlah nominal ini."
        confirmLabel={deleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeleteUpdateConfirm}
        onCancel={() => setDeletingUpdateId(null)}
      />
    </div>
  );
}
