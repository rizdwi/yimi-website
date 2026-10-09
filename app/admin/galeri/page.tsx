'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Star,
  Edit2,
} from 'lucide-react';
import { GalleryPhotoItem } from '@/lib/types';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminGaleriPage() {
  const [photos, setPhotos] = useState<GalleryPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judul, setJudul] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [gambar, setGambar] = useState('');
  const [kategori, setKategori] = useState('Kajian');
  const [izinOrangTua, setIzinOrangTua] = useState(true);
  const [tampilPublik, setTampilPublik] = useState(true);
  const [tampilBeranda, setTampilBeranda] = useState(true);
  const [filterKategori, setFilterKategori] = useState('Semua');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  function handleOpenCreate() {
    setEditingId(null);
    setJudul('');
    setKeterangan('');
    setGambar('');
    setKategori('Kajian');
    setIzinOrangTua(true);
    setTampilPublik(true);
    setTampilBeranda(true);
    setActiveModal('create');
  }

  function handleOpenEdit(item: GalleryPhotoItem) {
    setEditingId(item.id);
    setJudul(item.judul);
    setKeterangan(item.keterangan || '');
    setGambar(item.gambar);
    setKategori(item.kategori);
    setIzinOrangTua(item.izin_orang_tua);
    setTampilPublik(item.tampil_publik);
    setTampilBeranda(item.tampil_beranda !== false);
    setActiveModal('edit');
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih berkas foto gambar (JPG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5 MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal mengunggah foto.');
        return;
      }

      setGambar(data.url);
      if (!judul) {
        const autoName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setJudul(autoName);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan saat mengunggah foto.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSubmitPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!judul.trim()) {
      alert('Judul foto wajib diisi.');
      return;
    }
    if (!gambar.trim()) {
      alert('Harap pilih / unggah foto terlebih dahulu.');
      return;
    }

    setSubmitting(true);

    try {
      const method = activeModal === 'create' ? 'POST' : 'PUT';
      const payload: Record<string, unknown> = {
        judul,
        keterangan,
        gambar,
        kategori,
        izin_orang_tua: izinOrangTua,
        tampil_publik: tampilPublik,
        tampil_beranda: tampilBeranda,
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch('/api/admin/galeri', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menyimpan foto.');
        return;
      }

      setActiveModal(null);
      loadPhotos();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleBeranda(item: GalleryPhotoItem) {
    try {
      const newStatus = !(item.tampil_beranda !== false);
      const res = await fetch('/api/admin/galeri', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          tampil_beranda: newStatus,
        }),
      });
      if (res.ok) {
        setPhotos(
          photos.map((p) => (p.id === item.id ? { ...p, tampil_beranda: newStatus } : p))
        );
      }
    } catch (err) {
      console.error(err);
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

  const filteredPhotos = photos.filter((p) => {
    if (filterKategori === 'Semua') return true;
    if (filterKategori === 'Beranda') return p.tampil_beranda !== false;
    return p.kategori === filterKategori;
  });

  return (
    <div className="space-y-6">
      {/* Header & Aksi */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">
            Dokumentasi Galeri &amp; Jejak Langkah YIMI
          </h2>
          <p className="text-xs text-[#6B7280]">
            Pilih foto langsung dari perangkat untuk diunggah, atur tampilan di Beranda (Jejak Langkah), dan jaga izin privasi anak.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto Baru</span>
        </button>
      </div>

      {/* Filter Kategori Tab */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-semibold">
        {['Semua', 'Beranda', 'Kajian', 'Jumat Berkah', 'Pembebasan Lahan', 'TK & PAUD'].map((kat) => (
          <button
            key={kat}
            onClick={() => setFilterKategori(kat)}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              filterKategori === kat
                ? 'bg-[#1F2F6B] text-white'
                : 'bg-white text-[#6B7280] hover:bg-gray-100 border border-[#E3E7EE]'
            }`}
          >
            {kat === 'Beranda' ? '⭐ Tampil di Beranda' : kat}
          </button>
        ))}
      </div>

      {/* Grid Foto Galeri */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[#6B7280]">Memuat galeri dokumentasi…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-[#E3E7EE] text-[#6B7280] text-xs">
              Belum ada foto dalam kategori ini. Klik &quot;Tambah Foto Baru&quot; untuk mengunggah dari perangkat Anda.
            </div>
          ) : (
            filteredPhotos.map((item) => (
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

                  {/* Kategori Badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1F2F6B]/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                    {item.kategori}
                  </span>

                  {/* Jejak Langkah Beranda Badge */}
                  {item.tampil_beranda !== false && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#FFF200] text-[#1F2F6B] text-[10px] font-bold shadow-xs flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Beranda</span>
                    </span>
                  )}

                  {/* Peringatan Izin Anak */}
                  {(item.kategori === 'TK & PAUD' || item.kategori === 'TK/PAUD') && (
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
                    {/* Toggle Beranda Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleBeranda(item)}
                      title="Klik untuk ubah tampil di Beranda"
                      className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition flex items-center space-x-1 ${
                        item.tampil_beranda !== false
                          ? 'bg-[#EEF2FC] text-[#3E5FD1] border-[#3E5FD1]/30 hover:bg-[#3E5FD1]/10'
                          : 'bg-gray-50 text-[#6B7280] border-[#E3E7EE] hover:bg-gray-100'
                      }`}
                    >
                      <Star
                        className={`w-3 h-3 ${item.tampil_beranda !== false ? 'fill-[#3E5FD1]' : ''}`}
                      />
                      <span>{item.tampil_beranda !== false ? 'Di Beranda' : 'Bukan Beranda'}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-md transition"
                        title="Edit Info Foto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 text-[#D7261E] hover:bg-[#FEE2E2] rounded-md transition"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Tambah / Edit Foto */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E3E7EE] p-6 space-y-4 my-8">
            <h3 className="text-base font-bold text-[#111827]">
              {activeModal === 'create' ? 'Tambah Foto Dokumentasi Baru' : 'Edit Foto Dokumentasi'}
            </h3>

            {/* Input Tersembunyi untuk Pilih Berkas Gambar */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="hidden"
            />

            <form onSubmit={handleSubmitPhoto} className="space-y-4 text-xs">
              {/* Bagian Pilih / Upload Foto */}
              <div className="space-y-2">
                <label className="block font-semibold text-[#374151]">
                  Pilih / Unggah Foto <span className="text-[#D7261E]">*</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#EEF2FC] hover:bg-[#3E5FD1]/15 text-[#3E5FD1] border border-[#3E5FD1]/30 rounded-xl font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-[#3E5FD1] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{uploadingImage ? 'Mengunggah…' : 'Pilih Foto dari Perangkat'}</span>
                  </button>

                  <span className="text-[11px] text-[#6B7280]">
                    atau masukkan URL gambar di bawah (JPG, PNG, WebP)
                  </span>
                </div>

                {/* Preview Thumbnail jika sudah ada foto */}
                {gambar && (
                  <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden border border-[#E3E7EE] bg-gray-50 flex items-center justify-center mt-2 group">
                    <img src={gambar} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-[#2EE05A]" />
                      <span>Foto Terpasang</span>
                    </div>
                  </div>
                )}

                {/* Input URL Gambar Langsung */}
                <input
                  type="text"
                  required
                  value={gambar}
                  onChange={(e) => setGambar(e.target.value)}
                  placeholder="URL Foto (otomatis terisi saat memilih foto dari perangkat)"
                  className="w-full text-xs p-2.5 bg-[#F5F7FA] border border-[#E3E7EE] rounded-lg font-mono text-[11px]"
                />
              </div>

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
                  className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Kategori Program</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  >
                    <option value="Kajian">Kajian</option>
                    <option value="Jumat Berkah">Jumat Berkah</option>
                    <option value="Pembebasan Lahan">Pembebasan Lahan</option>
                    <option value="TK & PAUD">TK &amp; PAUD</option>
                    <option value="Sosial">Bakti Sosial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Visibilitas</label>
                  <select
                    value={tampilPublik ? 'true' : 'false'}
                    onChange={(e) => setTampilPublik(e.target.value === 'true')}
                    className="w-full p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
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

              {/* Pengaturan Tampil di Beranda (Jejak Langkah YIMI) */}
              <div className="p-3 bg-[#EEF2FC]/60 border border-[#3E5FD1]/20 rounded-xl space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tampil_beranda"
                    checked={tampilBeranda}
                    onChange={(e) => setTampilBeranda(e.target.checked)}
                    className="rounded text-[#3E5FD1]"
                  />
                  <label htmlFor="tampil_beranda" className="font-bold text-[#1F2F6B] cursor-pointer">
                    Tampilkan di Bagian &quot;Galeri Jejak Langkah YIMI&quot; (Beranda)
                  </label>
                </div>
                <p className="text-[11px] text-[#4B5563] pl-5">
                  Foto ini akan tampil pada 6 grid cuplikan kegiatan di halaman utama website.
                </p>
              </div>

              {/* Aturan Khusus Anak-Anak (PRD F-GAL-03 & AGENTS.md 4.2.2) */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  kategori === 'TK & PAUD' || kategori === 'TK/PAUD'
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
                {(kategori === 'TK & PAUD' || kategori === 'TK/PAUD') && !izinOrangTua && (
                  <p className="text-[11px] text-[#D7261E] font-medium pl-5">
                    Peringatan Privasi: Foto kategori TK/PAUD tanpa centang izin ini secara otomatis TIDAK AKAN ditampilkan pada website publik demi melindungi privasi anak.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E3E7EE]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-[#E3E7EE] rounded-lg text-[#374151] hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg font-bold flex items-center space-x-1.5 disabled:opacity-60"
                >
                  <span>{submitting ? 'Menyimpan…' : 'Simpan Foto'}</span>
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
        cancelLabel="Batal"
        onConfirm={handleDeletePhoto}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
