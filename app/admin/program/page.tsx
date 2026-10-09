'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Archive, Trash2, Eye, EyeOff } from 'lucide-react';
import { ProgramItem } from '@/lib/types';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminProgramPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Partial<ProgramItem>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    try {
      const res = await fetch('/api/admin/programs');
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProgram(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = activeModal === 'create' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/programs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProgram),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menyimpan program.');
        return;
      }

      setActiveModal(null);
      setSelectedProgram({});
      loadPrograms();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchiveProgram(program: ProgramItem) {
    try {
      await fetch('/api/admin/programs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...program, is_archived: !program.is_archived }),
      });
      loadPrograms();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleBeranda(program: ProgramItem) {
    try {
      await fetch('/api/admin/programs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...program, tampil_beranda: !program.tampil_beranda }),
      });
      loadPrograms();
    } catch (err) {
      console.error(err);
    }
  }

  async function handlePermanentDelete() {
    if (!confirmDeleteId) return;
    try {
      await fetch(`/api/admin/programs?id=${confirmDeleteId}&permanent=true`, {
        method: 'DELETE',
      });
      setConfirmDeleteId(null);
      loadPrograms();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Daftar Pilar Program Yayasan</h2>
          <p className="text-xs text-[#6B7280]">
            Kelola program pendidikan, sosial pangan, majelis ilmu, dan program dakwah lainnya.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProgram({
              judul: '',
              slug: '',
              ringkasan: '',
              deskripsi: '',
              ikon: 'BookOpen',
              urutan: programs.length + 1,
              tampil_beranda: true,
              is_archived: false,
            });
            setActiveModal('create');
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Program Baru</span>
        </button>
      </div>

      {/* Tabel Program */}
      <div className="bg-white rounded-xl border border-[#E3E7EE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E3E7EE]">
              <tr>
                <th className="py-3 px-4">Urutan</th>
                <th className="py-3 px-4">Program & Slug</th>
                <th className="py-3 px-4">Ringkasan</th>
                <th className="py-3 px-4 text-center">Tampil Beranda</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#6B7280]">
                    Memuat data program…
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#6B7280]">
                    Belum ada program tersimpan.
                  </td>
                </tr>
              ) : (
                programs.map((prog) => (
                  <tr key={prog.id} className="hover:bg-[#EEF2FC]/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1F2F6B]">{prog.urutan}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111827] block text-sm">{prog.judul}</span>
                      <span className="font-mono text-[11px] text-[#6B7280]">/program/{prog.slug}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5563] max-w-xs truncate">{prog.ringkasan}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleBeranda(prog)}
                        title={prog.tampil_beranda ? 'Tampil di beranda (klik untuk sembunyikan)' : 'Tidak tampil di beranda'}
                        className={`p-1.5 rounded-md ${
                          prog.tampil_beranda ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                        }`}
                      >
                        {prog.tampil_beranda ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <AdminStatusBadge status={prog.is_archived ? 'arsip' : 'terbit'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedProgram(prog);
                            setActiveModal('edit');
                          }}
                          title="Edit Program"
                          className="p-1.5 text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-md transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveProgram(prog)}
                          title={prog.is_archived ? 'Aktifkan kembali' : 'Arsipkan program'}
                          className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-md transition"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(prog.id)}
                          title="Hapus Permanen"
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

      {/* Modal Tambah / Edit Program */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E3E7EE] p-6 space-y-4 my-8">
            <h3 className="text-base font-bold text-[#111827]">
              {activeModal === 'create' ? 'Tambah Program Baru' : 'Edit Data Program'}
            </h3>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Nama Program <span className="text-[#D7261E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedProgram.judul || ''}
                    onChange={(e) => {
                      const judul = e.target.value;
                      const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setSelectedProgram({
                        ...selectedProgram,
                        judul,
                        slug: activeModal === 'create' ? slug : (selectedProgram.slug || slug),
                      });
                    }}
                    placeholder="Contoh: Santunan Yatim & Dhuafa"
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Tautan Alamat Halaman (URL Web) <span className="text-[11px] font-normal text-[#138A3A]">(Otomatis Terisi)</span>
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2.5 bg-[#F5F7FA] border border-r-0 border-[#E3E7EE] rounded-l-lg text-[#6B7280] text-xs font-mono">
                      /program/
                    </span>
                    <input
                      type="text"
                      required
                      value={selectedProgram.slug || ''}
                      onChange={(e) => setSelectedProgram({ ...selectedProgram, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="santunan-yatim-dhuafa"
                      className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-r-lg font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-[#6B7280] mt-1 block">
                    Alamat URL web untuk halaman program ini, otomatis dibuat dari nama program.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Ringkasan Singkat (Muncul di kartu beranda) <span className="text-[#D7261E]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={selectedProgram.ringkasan || ''}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, ringkasan: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Deskripsi Lengkap Program
                </label>
                <textarea
                  rows={4}
                  value={selectedProgram.deskripsi || ''}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, deskripsi: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">URL Gambar Ilustrasi</label>
                  <input
                    type="text"
                    value={selectedProgram.gambar || ''}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, gambar: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Nomor Urutan Tampil</label>
                  <input
                    type="number"
                    value={selectedProgram.urutan ?? 1}
                    onChange={(e) => setSelectedProgram({ ...selectedProgram, urutan: parseInt(e.target.value, 10) })}
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="tampil_beranda"
                  checked={selectedProgram.tampil_beranda !== false}
                  onChange={(e) => setSelectedProgram({ ...selectedProgram, tampil_beranda: e.target.checked })}
                  className="rounded text-[#3E5FD1]"
                />
                <label htmlFor="tampil_beranda" className="font-medium text-[#374151]">
                  Tampilkan kartu program ini di halaman beranda utama
                </label>
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
                  <span>{submitting ? 'Menyimpan…' : 'Simpan Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Permanent Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Hapus Program Permanen"
        variant="danger"
        message="Apakah Anda yakin ingin menghapus program ini secara permanen dari basis data? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        onConfirm={handlePermanentDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
