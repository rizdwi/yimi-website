'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  ShieldCheck,
  Upload,
  UploadCloud,
  CheckCircle2,
  Star,
  Edit2,
  X,
  Loader2,
  Layers,
} from 'lucide-react';
import { GalleryPhotoItem } from '@/lib/types';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface BatchFileItem {
  id: string;
  file: File;
  previewUrl: string;
  judul: string;
}

export default function AdminGaleriPage() {
  const [photos, setPhotos] = useState<GalleryPhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | 'batch' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Single Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [judul, setJudul] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [gambar, setGambar] = useState('');
  const [kategori, setKategori] = useState('Kajian');
  const [izinOrangTua, setIzinOrangTua] = useState(true);
  const [tampilPublik, setTampilPublik] = useState(true);
  const [tampilBeranda, setTampilBeranda] = useState(true);
  const [filterKategori, setFilterKategori] = useState('Semua');

  // Batch Form State
  const [batchFiles, setBatchFiles] = useState<BatchFileItem[]>([]);
  const [batchKategori, setBatchKategori] = useState('Kajian');
  const [batchTampilBeranda, setBatchTampilBeranda] = useState(true);
  const [batchIzinOrangTua, setBatchIzinOrangTua] = useState(true);
  const [batchTampilPublik, setBatchTampilPublik] = useState(true);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

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

  function handleOpenBatch() {
    setBatchFiles([]);
    setBatchKategori('Kajian');
    setBatchTampilBeranda(true);
    setBatchIzinOrangTua(true);
    setBatchTampilPublik(true);
    setBatchProgress(null);
    setActiveModal('batch');
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

  async function handleSingleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih berkas foto gambar (JPG, PNG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 10 MB.');
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

  // Handle batch file selection
  function handleBatchFilesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchFileItem[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) return;

      const autoName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        judul: autoName,
      });
    });

    setBatchFiles((prev) => [...prev, ...newItems]);
    if (batchFileInputRef.current) batchFileInputRef.current.value = '';
  }

  function handleRemoveBatchItem(id: string) {
    setBatchFiles((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
  }

  function handleUpdateBatchTitle(id: string, newTitle: string) {
    setBatchFiles((prev) =>
      prev.map((i) => (i.id === id ? { ...i, judul: newTitle } : i))
    );
  }

  // Submit batch upload
  async function handleSubmitBatch(e: React.FormEvent) {
    e.preventDefault();
    if (batchFiles.length === 0) {
      alert('Pilih setidaknya satu foto untuk diunggah.');
      return;
    }

    setSubmitting(true);
    setBatchProgress({ current: 0, total: batchFiles.length });

    try {
      const uploadedItems: Array<{
        gambar: string;
        judul: string;
        keterangan: string;
        kategori: string;
        izin_orang_tua: boolean;
        tampil_publik: boolean;
        tampil_beranda: boolean;
      }> = [];

      // Unggah foto satu per satu atau batch ke storage
      for (let i = 0; i < batchFiles.length; i++) {
        const item = batchFiles[i];
        setBatchProgress({ current: i + 1, total: batchFiles.length });

        const formData = new FormData();
        formData.append('file', item.file);

        const resUpload = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const dataUpload = await resUpload.json();
        if (!resUpload.ok || !dataUpload.url) {
          throw new Error(
            dataUpload.error || `Gagal mengunggah foto "${item.file.name}"`
          );
        }

        uploadedItems.push({
          gambar: dataUpload.url,
          judul: item.judul.trim() || item.file.name,
          keterangan: '',
          kategori: batchKategori,
          izin_orang_tua: batchIzinOrangTua,
          tampil_publik: batchTampilPublik,
          tampil_beranda: batchTampilBeranda,
        });
      }

      // Kirim batch insert ke backend galeri
      const resBatch = await fetch('/api/admin/galeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: uploadedItems }),
      });

      const dataBatch = await resBatch.json();
      if (!resBatch.ok) {
        throw new Error(dataBatch.error || 'Gagal menyimpan foto ke database.');
      }

      // Cleanup preview URLs
      batchFiles.forEach((i) => URL.revokeObjectURL(i.previewUrl));

      setActiveModal(null);
      await loadPhotos();
      alert(
        `Berhasil mengunggah ${uploadedItems.length} foto ke galeri! Foto kini aktif di slider beranda dan galeri publik.`
      );
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat batch upload.';
      alert(`Gagal: ${msg}`);
    } finally {
      setSubmitting(false);
      setBatchProgress(null);
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
            Pilih foto langsung dari perangkat untuk diunggah, atur tampilan di Beranda (Slider Otomatis), dan jaga izin privasi anak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Multiple Upload */}
          <button
            type="button"
            onClick={handleOpenBatch}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#2EE05A] hover:bg-[#25B84A] text-[#1F2F6B] text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Banyak Foto (Multiple)</span>
          </button>

          {/* Tombol Tambah 1 Foto */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah 1 Foto</span>
          </button>
        </div>
      </div>

      {/* Filter Kategori Tab */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-semibold">
        {['Semua', 'Beranda', 'Kajian', 'Jumat Berkah', 'Pembebasan Lahan', 'TK & PAUD'].map((kat) => (
          <button
            key={kat}
            type="button"
            onClick={() => setFilterKategori(kat)}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
              filterKategori === kat
                ? 'bg-[#1F2F6B] text-white'
                : 'bg-white text-[#6B7280] hover:bg-gray-100 border border-[#E3E7EE]'
            }`}
          >
            {kat === 'Beranda' ? '⭐ Tampil di Beranda (Slider)' : kat}
          </button>
        ))}
      </div>

      {/* Grid Foto Galeri */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#3E5FD1]" />
          <span>Memuat galeri dokumentasi…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPhotos.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-[#E3E7EE] text-[#6B7280] text-xs">
              Belum ada foto dalam kategori ini. Klik &quot;Upload Banyak Foto&quot; atau &quot;Tambah 1 Foto&quot; untuk mengunggah dari perangkat Anda.
            </div>
          ) : (
            filteredPhotos.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E3E7EE] overflow-hidden shadow-xs flex flex-col group"
              >
                <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                  <Image
                    src={
                      item.gambar ||
                      'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop'
                    }
                    alt={item.judul}
                    fill
                    unoptimized={Boolean(item.gambar && item.gambar.includes('supabase.co'))}
                    className="object-cover group-hover:scale-105 transition duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                      title="Klik untuk ubah tampil di Beranda Slider"
                      className={`text-[11px] font-semibold px-2 py-1 rounded-md border transition flex items-center space-x-1 cursor-pointer ${
                        item.tampil_beranda !== false
                          ? 'bg-[#EEF2FC] text-[#3E5FD1] border-[#3E5FD1]/30 hover:bg-[#3E5FD1]/10'
                          : 'bg-gray-50 text-[#6B7280] border-[#E3E7EE] hover:bg-gray-100'
                      }`}
                    >
                      <Star
                        className={`w-3 h-3 ${item.tampil_beranda !== false ? 'fill-[#3E5FD1]' : ''}`}
                      />
                      <span>{item.tampil_beranda !== false ? 'Di Slider Beranda' : 'Non-Aktif Beranda'}</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-md transition cursor-pointer"
                        title="Edit Info Foto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-1.5 text-[#D7261E] hover:bg-[#FEE2E2] rounded-md transition cursor-pointer"
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

      {/* MODAL MULTIPLE UPLOAD (BATCH) */}
      {activeModal === 'batch' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E3E7EE] p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#E3E7EE] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">
                    Upload Banyak Foto Sekaligus (Multiple Upload)
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Pilih beberapa foto dari perangkat Anda untuk langsung diunggah ke galeri dan slider beranda.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden Input File Multiple */}
            <input
              type="file"
              ref={batchFileInputRef}
              onChange={handleBatchFilesSelect}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="hidden"
            />

            <form onSubmit={handleSubmitBatch} className="space-y-4 text-xs">
              {/* Drop / Select Zone */}
              <div
                onClick={() => batchFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#3E5FD1]/40 hover:border-[#3E5FD1] bg-[#EEF2FC]/40 hover:bg-[#EEF2FC]/70 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-xs text-[#3E5FD1] flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-[#1F2F6B] text-sm">
                    Klik di sini untuk memilih banyak foto
                  </span>
                  <p className="text-[11px] text-[#6B7280]">
                    Bisa memilih 5, 10, hingga 30+ foto sekaligus dari galeri HP atau komputer (JPG, PNG, WebP)
                  </p>
                </div>
              </div>

              {/* Daftar Foto yang Dipilih */}
              {batchFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111827]">
                      {batchFiles.length} Foto Siap Diunggah:
                    </span>
                    <button
                      type="button"
                      onClick={() => setBatchFiles([])}
                      className="text-[#D7261E] hover:underline text-[11px]"
                    >
                      Hapus Semua Pilihan
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
                    {batchFiles.map((item, idx) => (
                      <div
                        key={item.id}
                        className="pt-2 flex items-center gap-3 bg-gray-50/80 p-2 rounded-xl border border-gray-200"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200 border border-gray-300">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.previewUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.judul}
                            onChange={(e) => handleUpdateBatchTitle(item.id, e.target.value)}
                            placeholder="Judul foto..."
                            className="w-full text-xs p-1.5 bg-white border border-gray-300 rounded font-semibold text-[#111827]"
                          />
                          <span className="text-[10px] text-gray-500 truncate block mt-0.5">
                            {idx + 1}. {item.file.name} ({(item.file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBatchItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-[#D7261E] rounded-md transition shrink-0"
                          title="Hapus dari daftar upload"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pengaturan Kolektif Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E3E7EE]">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Kategori untuk Semua Foto
                  </label>
                  <select
                    value={batchKategori}
                    onChange={(e) => setBatchKategori(e.target.value)}
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
                  <label className="block font-semibold text-[#374151] mb-1">
                    Visibilitas Publik
                  </label>
                  <select
                    value={batchTampilPublik ? 'true' : 'false'}
                    onChange={(e) => setBatchTampilPublik(e.target.value === 'true')}
                    className="w-full p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  >
                    <option value="true">Tampil di Galeri Publik</option>
                    <option value="false">Simpan Privat</option>
                  </select>
                </div>
              </div>

              {/* Tampilkan di Slider Beranda (Checked by Default) */}
              <div className="p-3 bg-[#EEF2FC]/70 border border-[#3E5FD1]/25 rounded-xl space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="batch_tampil_beranda"
                    checked={batchTampilBeranda}
                    onChange={(e) => setBatchTampilBeranda(e.target.checked)}
                    className="rounded text-[#3E5FD1]"
                  />
                  <label
                    htmlFor="batch_tampil_beranda"
                    className="font-bold text-[#1F2F6B] cursor-pointer"
                  >
                    ⭐ Tampilkan Semua di Slider Otomatis Beranda Utama
                  </label>
                </div>
                <p className="text-[11px] text-[#4B5563] pl-5">
                  Foto-foto ini akan langsung masuk ke komponen carousel beranda yang bergerak otomatis agar pengunjung melihat banyak foto kegiatan.
                </p>
              </div>

              {/* Izin Wali Murid / Anak (F-FOTO-03) */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  batchKategori === 'TK & PAUD' || batchKategori === 'TK/PAUD'
                    ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
                    : 'bg-[#F5F7FA] border-[#E3E7EE] text-[#4B5563]'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="batch_izin_anak"
                    checked={batchIzinOrangTua}
                    onChange={(e) => setBatchIzinOrangTua(e.target.checked)}
                    className="mt-0.5 rounded text-[#3E5FD1]"
                  />
                  <label htmlFor="batch_izin_anak" className="font-semibold cursor-pointer">
                    Ada Izin Wali / Orang Tua Santri untuk Dokumentasi Ini
                  </label>
                </div>
                {(batchKategori === 'TK & PAUD' || batchKategori === 'TK/PAUD') &&
                  !batchIzinOrangTua && (
                    <p className="text-[11px] text-[#D7261E] font-medium pl-5">
                      Peringatan Privasi: Jika tidak dicentang, foto kategori TK/PAUD tidak akan dimunculkan ke publik demi melindungi privasi santri.
                    </p>
                  )}
              </div>

              {/* Progress Bar saat Mengunggah */}
              {batchProgress && (
                <div className="space-y-1.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
                    <span>Sedang Mengunggah Foto ke Supabase Cloud...</span>
                    <span>
                      {batchProgress.current} / {batchProgress.total} foto
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#2EE05A] h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E3E7EE]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#E3E7EE] rounded-lg text-[#374151] hover:bg-gray-50 cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || batchFiles.length === 0}
                  className="px-5 py-2.5 bg-[#2EE05A] hover:bg-[#25B84A] text-[#1F2F6B] rounded-lg font-bold flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#1F2F6B]" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  <span>
                    {submitting
                      ? 'Mengunggah ke Cloud…'
                      : `Unggah & Terbitkan ${batchFiles.length} Foto`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH 1 / EDIT FOTO */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E3E7EE] p-6 space-y-4 my-8">
            <h3 className="text-base font-bold text-[#111827]">
              {activeModal === 'create' ? 'Tambah 1 Foto Dokumentasi Baru' : 'Edit Foto Dokumentasi'}
            </h3>

            {/* Input Tersembunyi untuk Pilih Berkas Gambar */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSingleFileSelect}
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
                      <Loader2 className="w-4 h-4 animate-spin text-[#3E5FD1]" />
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
                    <Image
                      src={gambar}
                      alt="Preview"
                      fill
                      unoptimized={Boolean(gambar.includes('supabase.co'))}
                      className="object-cover"
                      sizes="400px"
                    />
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
                    ⭐ Tampilkan di Slider Otomatis &quot;Galeri Jejak Langkah YIMI&quot; (Beranda)
                  </label>
                </div>
                <p className="text-[11px] text-[#4B5563] pl-5">
                  Foto ini akan tampil pada slider carousel beranda utama yang bergerak otomatis.
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
                  className="px-4 py-2 border border-[#E3E7EE] rounded-lg text-[#374151] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="px-5 py-2.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg font-bold flex items-center space-x-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
