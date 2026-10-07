'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { GalleryPhotoItem } from '@/lib/types';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminGaleriPage() {
  const [photos, setPhotos] = useState<GalleryPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [judul, setJudul] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [gambar, setGambar] = useState('');
  const [kategori, setKategori] = useState('Kajian');
  const [izinOrangTua, setIzinOrangTua] = useState(false);
  const [tampilPublik, setTampilPublik] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    try {
      const res = await fetch('/api/admin/galeri');
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.items || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/galeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          keterangan,
          gambar,
          kategori,
          izin_orang_tua: izinOrangTua,
          tampil_publik: tampilPublik,
        }),
      });

      if (res.ok) {
        setActiveModal(false);
        setJudul('');
        setKeterangan('');
        setGambar('');
        setIzinOrangTua(false);
        loadPhotos();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePhoto() {
    if (!confirmDeleteId) return;
    try {
      await fetch(`/api/admin/galeri?id=${confirmDeleteId}`, { method: 'DELETE' });
      setConfirmDeleteId(null);
      loadPhotos();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Dokumentasi Galeri Kegiatan YIMI</h2>
          <p className="text-xs text-[#6B7280]">
            Kelola album dokumentasi kegiatan kajian, baksos Jumat Berkah, dan santri TK/PAUD.
          </p>
        </div>
        <button
          onClick={() => setActiveModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto Dokumentasi</span>
        </button>
      </div>

      {/* Grid Foto Galeri */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[#6B7280]">Memuat galeri dokumentasi…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-[#E3E7EE] text-[#6B7280] text-xs">
            Belum ada dokumentasi foto tersimpan.
          </div>
        ) : (
          photos.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#E3E7EE] overflow-hidden shadow-xs flex flex-col group"
            >
              <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                <img
                  src={item.gambar}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1F2F6B]/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                  {item.kategori}
                </span>

                {item.kategori === 'TK/PAUD' && (
                  <span
                    className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center space-x-1 ${
                      item.izin_orang_tua
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'bg-[#FEE2E2] text-[#991B1B]'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>{item.izin_orang_tua ? 'Izin Valid' : 'Tanpa Izin (Disembunyikan)'}</span>
                  </span>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-[#111827] line-clamp-1">{item.judul}</h4>
                  <p className="text-[11px] text-[#6B7280] line-clamp-2 mt-0.5">{item.keterangan}</p>
                </div>

                <div className="pt-2 border-t border-[#E3E7EE] flex items-center justify-between text-xs">
                  <span
                    className={`text-[11px] font-semibold flex items-center space-x-1 ${
                      item.tampil_publik && (item.kategori !== 'TK/PAUD' || item.izin_orang_tua)
                        ? 'text-[#138A3A]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {item.tampil_publik && (item.kategori !== 'TK/PAUD' || item.izin_orang_tua) ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Publik</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Privat</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="p-1 text-[#D7261E] hover:bg-[#FEE2E2] rounded-md transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      )}

      {/* Modal Tambah Foto */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E3E7EE] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#111827]">Tambah Foto Dokumentasi</h3>

            <form onSubmit={handleAddPhoto} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Judul Foto / Kegiatan <span className="text-[#D7261E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Kajian Ilmiah Bersama Ustadz..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  URL Gambar (WebP / JPG) <span className="text-[#D7261E]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={gambar}
                  onChange={(e) => setGambar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Kategori</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                  >
                    <option value="Kajian">Kajian Rutin</option>
                    <option value="Baksos">Jumat Berkah</option>
                    <option value="TK/PAUD">TK/PAUD Islam</option>
                    <option value="Wakaf">Wakaf Lahan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Visibilitas</label>
                  <select
                    value={tampilPublik ? 'true' : 'false'}
                    onChange={(e) => setTampilPublik(e.target.value === 'true')}
                    className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                  >
                    <option value="true">Tampil di Publik</option>
                    <option value="false">Simpan Privat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">Keterangan Singkat</label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Deskripsi dokumentasi kegiatan..."
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>

              {/* Aturan Khusus Anak-Anak (PRD F-GAL-03 & AGENTS.md 4.2.2) */}
              <div
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  kategori === 'TK/PAUD'
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
                    : 'bg-[#F5F7FA] border-[#E3E7EE] text-[#4B5563]'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="izin_anak"
                    checked={izinOrangTua}
                    onChange={(e) => setIzinOrangTua(e.target.checked)}
                    className="mt-0.5 rounded text-[#3E5FD1]"
                  />
                  <label htmlFor="izin_anak" className="font-semibold cursor-pointer">
                    Ada Izin Tertulis dari Orang Tua Santri
                  </label>
                </div>
                {kategori === 'TK/PAUD' && !izinOrangTua && (
                  <p className="text-[11px] text-[#D7261E] font-medium pl-5">
                    Peringatan Privasi: Foto kategori TK/PAUD tanpa centang izin ini secara otomatis TIDAK AKAN ditampilkan pada website publik demi melindungi privasi anak.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E3E7EE]">
                <button
                  type="button"
                  onClick={() => setActiveModal(false)}
                  className="px-4 py-2 border border-[#E3E7EE] rounded-lg text-[#374151] hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg font-semibold"
                >
                  {submitting ? 'Menyimpan…' : 'Simpan Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Hapus Foto Dokumentasi"
        variant="danger"
        message="Hapus foto ini secara permanen dari galeri yayasan?"
        confirmLabel="Hapus"
        onConfirm={handleDeletePhoto}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
