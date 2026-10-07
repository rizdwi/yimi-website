'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { KajianItem } from '@/lib/types';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminKajianPage() {
  const [kajianList, setKajianList] = useState<KajianItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [selectedKajian, setSelectedKajian] = useState<Partial<KajianItem>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal Batal Kajian
  const [batalModalItem, setBatalModalItem] = useState<KajianItem | null>(null);
  const [alasanBatal, setAlasanBatal] = useState('');

  useEffect(() => {
    loadKajian();
  }, []);

  async function loadKajian() {
    try {
      const res = await fetch('/api/admin/kajian');
      if (res.ok) {
        const data = await res.json();
        setKajianList(data.kajian || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveKajian(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const method = activeModal === 'create' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/kajian', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedKajian),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Gagal menyimpan jadwal kajian.');
        return;
      }

      setActiveModal(null);
      setSelectedKajian({});
      loadKajian();
    } catch {
      setErrorMessage('Terjadi gangguan jaringan.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmBatal() {
    if (!batalModalItem) return;
    try {
      await fetch('/api/admin/kajian', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batalModalItem,
          status: 'batal',
          is_active: false,
          alasan_batal: alasanBatal || 'Ustadz berhalangan hadir',
        }),
      });
      setBatalModalItem(null);
      setAlasanBatal('');
      loadKajian();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleActivateKajian(kajian: KajianItem) {
    try {
      await fetch('/api/admin/kajian', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...kajian,
          status: 'aktif',
          is_active: true,
          alasan_batal: null,
        }),
      });
      loadKajian();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteKajian() {
    if (!confirmDeleteId) return;
    try {
      await fetch(`/api/admin/kajian?id=${confirmDeleteId}`, { method: 'DELETE' });
      setConfirmDeleteId(null);
      loadKajian();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Jadwal Majelis Kajian Ilmiah</h2>
          <p className="text-xs text-[#6B7280]">
            Atur jadwal majelis taklim, kitab rujukan, pemateri asatidzah, dan status pelaksanaan.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedKajian({
              hari: 'Ahad',
              tanggal: new Date().toISOString().split('T')[0],
              waktu: 'Ba&apos;da Ashar – Menjelang Maghrib',
              jam_mulai: '16:00',
              jam_selesai: '17:30',
              tema: '',
              pemateri: '',
              tempat: 'Masjid Binaan YIMI, Lt. Utama',
              kategori: 'Rutin Pekanan',
              sifat: 'Terbuka untuk Umum (Ikhwan & Akhwat)',
              status: 'aktif',
            });
            setActiveModal('create');
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Kajian</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E7EE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E3E7EE]">
              <tr>
                <th className="py-3 px-4">Waktu & Tanggal</th>
                <th className="py-3 px-4">Tema Pembahasan & Kitab</th>
                <th className="py-3 px-4">Pemateri</th>
                <th className="py-3 px-4">Tempat</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#6B7280]">
                    Memuat data jadwal kajian…
                  </td>
                </tr>
              ) : kajianList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#6B7280]">
                    Belum ada jadwal kajian.
                  </td>
                </tr>
              ) : (
                kajianList.map((k) => (
                  <tr key={k.id} className="hover:bg-[#EEF2FC]/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-[#1F2F6B] block">
                        {k.hari}, {k.tanggal}
                      </span>
                      <span className="text-[11px] text-[#6B7280] block">{k.waktu}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111827] block text-sm">{k.tema}</span>
                      <span className="text-[11px] text-[#6B7280]">{k.kategori}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#111827] font-medium">{k.pemateri}</td>
                    <td className="py-3.5 px-4 text-[#4B5563]">{k.tempat}</td>
                    <td className="py-3.5 px-4 text-center">
                      <AdminStatusBadge status={k.status} />
                      {k.status === 'batal' && k.alasan_batal && (
                        <span className="block text-[10px] text-[#D7261E] mt-0.5 max-w-xs truncate">
                          Alasan: {k.alasan_batal}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedKajian(k);
                            setActiveModal('edit');
                          }}
                          title="Edit Kajian"
                          className="p-1.5 text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {k.status === 'aktif' ? (
                          <button
                            onClick={() => {
                              setBatalModalItem(k);
                              setAlasanBatal('');
                            }}
                            title="Tandai Batal"
                            className="p-1.5 text-[#F59E0B] hover:bg-[#FEF3C7] rounded-md transition"
                          >
                            <AlertOctagon className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateKajian(k)}
                            title="Aktifkan Kembali"
                            className="p-1.5 text-[#138A3A] hover:bg-[#DCFCE7] rounded-md transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setConfirmDeleteId(k.id)}
                          title="Hapus"
                          className="p-1.5 text-[#D7261E] hover:bg-[#FEE2E2] rounded-md transition"
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

      {/* Modal Tambah / Edit Kajian */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E3E7EE] p-6 space-y-4 my-8">
            <h3 className="text-base font-bold text-[#111827]">
              {activeModal === 'create' ? 'Tambah Jadwal Kajian Baru' : 'Edit Jadwal Kajian'}
            </h3>

            {errorMessage && (
              <p className="text-xs p-3 rounded-lg bg-[#FEE2E2] text-[#991B1B] font-medium">
                {errorMessage}
              </p>
            )}

            <form onSubmit={handleSaveKajian} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Tema Pembahasan / Kitab <span className="text-[#D7261E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={selectedKajian.tema || ''}
                  onChange={(e) => setSelectedKajian({ ...selectedKajian, tema: e.target.value })}
                  placeholder="Kajian Kitab Ushul Tsalatsah..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Nama Pemateri (Ustadz) <span className="text-[#D7261E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={selectedKajian.pemateri || ''}
                  onChange={(e) => setSelectedKajian({ ...selectedKajian, pemateri: e.target.value })}
                  placeholder="Ustadz Dr. Abdullah Roy, M.A."
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Hari Pelaksanaan <span className="text-[#D7261E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedKajian.hari || ''}
                    onChange={(e) => setSelectedKajian({ ...selectedKajian, hari: e.target.value })}
                    placeholder="Sabtu / Ahad"
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Tanggal <span className="text-[#D7261E]">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedKajian.tanggal || ''}
                    onChange={(e) => setSelectedKajian({ ...selectedKajian, tanggal: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Keterangan Waktu <span className="text-[#D7261E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedKajian.waktu || ''}
                    onChange={(e) => setSelectedKajian({ ...selectedKajian, waktu: e.target.value })}
                    placeholder="09.00 – 11.30 WIB"
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={selectedKajian.jam_mulai || ''}
                    onChange={(e) => setSelectedKajian({ ...selectedKajian, jam_mulai: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={selectedKajian.jam_selesai || ''}
                    onChange={(e) => setSelectedKajian({ ...selectedKajian, jam_selesai: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Tempat / Lokasi</label>
                  <input
                    type="text"
                    value={selectedKajian.tempat || ''}
                    onChange={(e) => setSelectedKajian({ ...selectedKajian, tempat: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Kategori Kajian</label>
                  <input
                    type="text"
                    value={selectedKajian.kategori || ''}
                    onChange={(e) => setSelectedKajian({ ...selectedKajian, kategori: e.target.value })}
                    placeholder="Rutin Pekanan / Tematik"
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E3E7EE]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-[#E3E7EE] rounded-lg text-[#374151] hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg font-semibold flex items-center space-x-1.5"
                >
                  <span>{submitting ? 'Menyimpan…' : 'Simpan Jadwal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Batal Kajian (PRD F-KAJ-04) */}
      {batalModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E3E7EE] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#D7261E] flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5" />
              <span>Tandai Kajian Batal</span>
            </h3>
            <p className="text-xs text-[#374151]">
              Kajian &quot;<strong>{batalModalItem.tema}</strong>&quot; akan ditandai berstatus Batal pada website publik.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Alasan Pembatalan (Tampil di website publik) <span className="text-[#D7261E]">*</span>
              </label>
              <textarea
                rows={2}
                value={alasanBatal}
                onChange={(e) => setAlasanBatal(e.target.value)}
                placeholder="Contoh: Ustadz pemateri sedang udzur syar'i atau berhalangan sakit..."
                className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#D7261E]"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBatalModalItem(null)}
                className="px-4 py-2 border border-[#E3E7EE] rounded-lg text-xs font-medium text-[#374151]"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmBatal}
                className="px-4 py-2 bg-[#D7261E] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg"
              >
                Konfirmasi Pembatalan
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Hapus Jadwal Kajian"
        variant="danger"
        message="Hapus jadwal kajian ini secara permanen dari agenda yayasan?"
        confirmLabel="Hapus"
        onConfirm={handleDeleteKajian}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
