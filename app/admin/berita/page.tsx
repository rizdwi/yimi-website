/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Archive,
  Trash2,
  Search,
  ExternalLink,
  UploadCloud,
  FolderOpen,
  Loader2,
  X,
  Check,
  Images,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NewsPostItem, ContentStatus } from '@/lib/types';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface MediaItem {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  url: string;
  isSystem?: boolean;
}

export default function AdminBeritaPage() {
  const [newsList, setNewsList] = useState<NewsPostItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');

  // Modal / Editor State
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [selectedNews, setSelectedNews] = useState<Partial<NewsPostItem>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Upload & Media Picker State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchNews() {
      try {
        let url = `/api/admin/berita?status=${statusFilter}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const res = await fetch(url);
        if (res.ok && !ignore) {
          const data = await res.json();
          setNewsList(data.news || []);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchNews();
    return () => {
      ignore = true;
    };
  }, [statusFilter, search]);

  async function reloadNews() {
    try {
      let url = `/api/admin/berita?status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNewsList(data.news || []);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function openMediaPicker() {
    setShowMediaPicker(true);
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/admin/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.files || []);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar media:', err);
    } finally {
      setLoadingMedia(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    const invalidFiles = files.filter((f) => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Semua berkas harus berformat gambar (JPG, PNG, WebP, SVG).');
      return;
    }

    const oversizedFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Ukuran setiap berkas foto maksimal adalah 10MB.');
      return;
    }

    setUploadingImage(true);
    setUploadProgressText(
      files.length > 1
        ? `Mengunggah ${files.length} foto kegiatan...`
        : 'Mengunggah foto...'
    );

    try {
      const formData = new FormData();
      files.forEach((f) => {
        formData.append('files', f);
      });

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah foto.');
      }

      const newUrls: string[] = [];
      if (Array.isArray(data.files) && data.files.length > 0) {
        data.files.forEach((item: { url?: string }) => {
          if (item?.url) newUrls.push(item.url);
        });
      } else if (data.url) {
        newUrls.push(data.url);
      }

      if (newUrls.length === 0) {
        throw new Error('Tidak ada tautan gambar yang diterima dari server.');
      }

      setSelectedNews((prev) => {
        const existing = prev.galeri && prev.galeri.length > 0
          ? [...prev.galeri]
          : (prev.gambar_utama ? [prev.gambar_utama] : []);

        const merged = [...existing, ...newUrls];
        return {
          ...prev,
          gambar_utama: merged[0] || '',
          galeri: merged,
        };
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat unggah';
      alert(`Gagal upload foto: ${msg}`);
    } finally {
      setUploadingImage(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleSetCover(idx: number) {
    setSelectedNews((prev) => {
      const list = [...(prev.galeri || (prev.gambar_utama ? [prev.gambar_utama] : []))];
      if (idx <= 0 || idx >= list.length) return prev;
      const target = list[idx];
      list.splice(idx, 1);
      list.unshift(target);
      return {
        ...prev,
        gambar_utama: list[0] || '',
        galeri: list,
      };
    });
  }

  function handleRemovePhoto(idx: number) {
    setSelectedNews((prev) => {
      const list = [...(prev.galeri || (prev.gambar_utama ? [prev.gambar_utama] : []))];
      list.splice(idx, 1);
      return {
        ...prev,
        gambar_utama: list[0] || '',
        galeri: list,
      };
    });
  }

  function handleMovePhoto(idx: number, direction: 'left' | 'right') {
    setSelectedNews((prev) => {
      const list = [...(prev.galeri || (prev.gambar_utama ? [prev.gambar_utama] : []))];
      const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return {
        ...prev,
        gambar_utama: list[0] || '',
        galeri: list,
      };
    });
  }

  function handleAddManualUrl(url: string) {
    if (!url || !url.trim()) return;
    const trimmed = url.trim();
    setSelectedNews((prev) => {
      const list = [...(prev.galeri || (prev.gambar_utama ? [prev.gambar_utama] : []))];
      if (!list.includes(trimmed)) {
        list.push(trimmed);
      }
      return {
        ...prev,
        gambar_utama: list[0] || '',
        galeri: list,
      };
    });
  }

  function handleSelectFromMediaLibrary(url: string) {
    setSelectedNews((prev) => {
      const list = [...(prev.galeri || (prev.gambar_utama ? [prev.gambar_utama] : []))];
      if (!list.includes(url)) {
        list.push(url);
      }
      return {
        ...prev,
        gambar_utama: list[0] || '',
        galeri: list,
      };
    });
    setShowMediaPicker(false);
  }

  async function handleSaveNews(statusTarget: ContentStatus) {
    if (!selectedNews.judul || !selectedNews.judul.trim()) {
      alert('Judul berita wajib diisi sebelum menyimpan!');
      return;
    }

    // Auto-generate slug if empty
    const autoSlug =
      selectedNews.slug && selectedNews.slug.trim()
        ? selectedNews.slug.trim()
        : selectedNews.judul
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `berita-${Date.now()}`;

    // Auto-generate ringkasan if empty
    const autoRingkasan =
      selectedNews.ringkasan && selectedNews.ringkasan.trim()
        ? selectedNews.ringkasan.trim()
        : selectedNews.isi
        ? selectedNews.isi.slice(0, 160) + '...'
        : 'Warta dakwah dan kegiatan yayasan.';

    const finalGallery = selectedNews.galeri && selectedNews.galeri.length > 0
      ? selectedNews.galeri
      : (selectedNews.gambar_utama ? [selectedNews.gambar_utama] : []);

    setSubmitting(true);

    try {
      const method = activeModal === 'create' ? 'POST' : 'PUT';
      const payload = {
        ...selectedNews,
        slug: autoSlug,
        ringkasan: autoRingkasan,
        status: statusTarget,
        gambar_utama: finalGallery[0] || selectedNews.gambar_utama || '',
        galeri: finalGallery,
      };

      const res = await fetch('/api/admin/berita', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menyimpan berita.');
        return;
      }

      setActiveModal(null);
      setSelectedNews({});
      reloadNews();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive(news: NewsPostItem) {
    try {
      await fetch('/api/admin/berita', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...news, status: 'arsip' }),
      });
      reloadNews();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeletePermanent() {
    if (!confirmDeleteId) return;
    try {
      await fetch(`/api/admin/berita?id=${confirmDeleteId}&permanent=true`, {
        method: 'DELETE',
      });
      setConfirmDeleteId(null);
      reloadNews();
    } catch (err) {
      console.error(err);
    }
  }

  const filteredMedia = mediaList.filter((m) =>
    mediaSearch ? m.name.toLowerCase().includes(mediaSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Warta &amp; Artikel Dakwah YIMI</h2>
          <p className="text-xs text-[#6B7280]">
            Publikasikan artikel dakwah, transparansi kegiatan, dan warta resmi yayasan secara langsung ke website publik.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedNews({
              judul: '',
              slug: '',
              ringkasan: '',
              isi: '',
              gambar_utama: '',
              galeri: [],
              kategori: 'Kajian',
              penulis: 'Tim Dakwah YIMI',
              status: 'draf',
              terbit_pada: new Date().toISOString().split('T')[0],
            });
            setActiveModal('create');
          }}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Berita Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E3E7EE]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul berita…"
            className="w-full text-xs pl-9 pr-3 py-2 bg-[#F5F7FA] border border-[#E3E7EE] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-xs text-[#6B7280]">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F5F7FA] border border-[#E3E7EE] rounded-lg px-2.5 py-1.5 text-[#111827]"
          >
            <option value="semua">Semua Status</option>
            <option value="terbit">Terbit</option>
            <option value="draf">Draf</option>
            <option value="terjadwal">Terjadwal</option>
            <option value="arsip">Arsip</option>
          </select>
        </div>
      </div>

      {/* Tabel Berita */}
      <div className="bg-white rounded-xl border border-[#E3E7EE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E3E7EE]">
              <tr>
                <th className="py-3 px-4">Judul &amp; Kategori</th>
                <th className="py-3 px-4">Tanggal Terbit</th>
                <th className="py-3 px-4">Penulis</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE]">
              {newsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#6B7280]">
                    Belum ada berita yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                newsList.map((n) => (
                  <tr key={n.id} className="hover:bg-[#EEF2FC]/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111827] block text-sm">{n.judul}</span>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded-sm bg-[#EEF2FC] text-[#3E5FD1] text-[10px] font-semibold">
                          {n.kategori}
                        </span>
                        <span className="font-mono text-[10px] text-[#6B7280]">/berita/{n.slug}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[#4B5563] font-mono">
                      {n.terbit_pada}
                    </td>
                    <td className="py-3.5 px-4 text-[#111827]">{n.penulis}</td>
                    <td className="py-3.5 px-4 text-center">
                      <AdminStatusBadge status={n.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        {n.status === 'terbit' && (
                          <a
                            href={`/berita/${n.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka Halaman Publik"
                            className="p-1.5 text-[#6B7280] hover:text-[#3E5FD1] rounded-md transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const galeri = n.galeri && n.galeri.length > 0
                              ? [...n.galeri]
                              : (n.gambar_utama ? [n.gambar_utama] : []);
                            setSelectedNews({
                              ...n,
                              galeri,
                            });
                            setActiveModal('edit');
                          }}
                          title="Edit Berita"
                          className="p-1.5 text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-md transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleArchive(n)}
                          title="Arsipkan"
                          className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-md transition cursor-pointer"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(n.id)}
                          title="Hapus Permanen"
                          className="p-1.5 text-[#D7261E] hover:bg-[#FEE2E2] rounded-md transition cursor-pointer"
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

      {/* Modal / Editor Dua Kolom */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#E3E7EE] p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
              <h3 className="text-base font-bold text-[#111827]">
                {activeModal === 'create' ? 'Tulis Berita / Artikel Baru' : 'Edit Konten Berita'}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedNews({});
                  }}
                  className="px-3 py-1.5 border border-[#E3E7EE] rounded-lg text-xs font-semibold text-[#6B7280] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNews('draf')}
                  disabled={submitting}
                  className="px-3 py-1.5 border border-[#3E5FD1]/30 bg-[#EEF2FC] rounded-lg text-xs font-semibold text-[#3E5FD1] hover:bg-[#3E5FD1]/10 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Menyimpan…' : 'Simpan Draf'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNews('terbit')}
                  disabled={submitting}
                  className="px-4 py-1.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                >
                  <span>{submitting ? 'Memproses…' : 'Terbitkan Sekarang'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
              {/* Kolom Kiri: Form Konten (2 Kolom) */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Judul Berita / Artikel <span className="text-[#D7261E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedNews.judul || ''}
                    onChange={(e) => {
                      const judul = e.target.value;
                      const slug = judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setSelectedNews({
                        ...selectedNews,
                        judul,
                        slug: selectedNews.slug || slug,
                      });
                    }}
                    placeholder="Contoh: Keutamaan Wakaf Tanah Pembebasan Lahan..."
                    className="w-full text-sm font-semibold p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Ringkasan Singkat (Lead Paragraph)
                  </label>
                  <textarea
                    rows={2}
                    value={selectedNews.ringkasan || ''}
                    onChange={(e) => setSelectedNews({ ...selectedNews, ringkasan: e.target.value })}
                    placeholder="Ringkasan 1-2 kalimat untuk kartu berita (opsional, otomatis dari isi jika kosong)..."
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Isi Artikel Lengkap (Maks. 68ch baris baca) <span className="text-[#D7261E]">*</span>
                  </label>
                  <textarea
                    rows={12}
                    required
                    value={selectedNews.isi || ''}
                    onChange={(e) => setSelectedNews({ ...selectedNews, isi: e.target.value })}
                    placeholder="Tuliskan isi artikel dakwah..."
                    className="w-full text-xs p-3 bg-white border border-[#E3E7EE] rounded-lg font-serif leading-relaxed"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Pengaturan Berita & Upload Gambar */}
              <div className="space-y-4 bg-[#F5F7FA] p-4 rounded-xl border border-[#E3E7EE]">
                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Kategori Berita</label>
                  <select
                    value={selectedNews.kategori || 'Kajian'}
                    onChange={(e) => setSelectedNews({ ...selectedNews, kategori: e.target.value })}
                    className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                  >
                    <option value="Kajian">Kajian &amp; Majelis</option>
                    <option value="Wakaf Lahan">Pembebasan Lahan</option>
                    <option value="Jumat Berkah">Jumat Berkah</option>
                    <option value="TK/PAUD">TK/PAUD Islam</option>
                    <option value="Umum">Warta Umum Yayasan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Slug URL</label>
                  <input
                    type="text"
                    value={selectedNews.slug || ''}
                    onChange={(e) => setSelectedNews({ ...selectedNews, slug: e.target.value })}
                    placeholder="otomatis-dari-judul"
                    className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Penulis</label>
                  <input
                    type="text"
                    value={selectedNews.penulis || 'Tim Dakwah YIMI'}
                    onChange={(e) => setSelectedNews({ ...selectedNews, penulis: e.target.value })}
                    className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">Tanggal Terbit</label>
                  <input
                    type="date"
                    value={selectedNews.terbit_pada || ''}
                    onChange={(e) => setSelectedNews({ ...selectedNews, terbit_pada: e.target.value })}
                    className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>

                {/* Seksi Foto Berita & Dokumentasi Kegiatan (Mendukung upload 2-3+ foto sekaligus) */}
                <div className="pt-2 border-t border-[#E3E7EE]/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-semibold text-[#374151] text-xs">
                        Foto Berita &amp; Dokumentasi Kegiatan
                      </label>
                      <p className="text-[11px] text-[#6B7280]">
                        Bisa upload 2, 3, atau banyak foto sekaligus.
                      </p>
                    </div>
                    {(selectedNews.galeri && selectedNews.galeri.length > 0
                      ? selectedNews.galeri
                      : selectedNews.gambar_utama
                      ? [selectedNews.gambar_utama]
                      : []
                    ).length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF2FC] text-[#3E5FD1]">
                        {(selectedNews.galeri && selectedNews.galeri.length > 0
                          ? selectedNews.galeri
                          : selectedNews.gambar_utama
                          ? [selectedNews.gambar_utama]
                          : []
                        ).length} Foto
                      </span>
                    )}
                  </div>

                  {/* Daftar Pratinjau Foto Galeri */}
                  {(() => {
                    const gallery = selectedNews.galeri && selectedNews.galeri.length > 0
                      ? selectedNews.galeri
                      : selectedNews.gambar_utama
                      ? [selectedNews.gambar_utama]
                      : [];

                    if (gallery.length === 0) {
                      return (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-4 rounded-xl border-2 border-dashed border-[#3E5FD1]/40 bg-[#EEF2FC]/30 hover:bg-[#EEF2FC]/60 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1"
                        >
                          <div className="w-8 h-8 rounded-full bg-white text-[#3E5FD1] flex items-center justify-center shadow-xs">
                            <Images className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-[#1F2F6B]">
                            Pilih 2 atau 3 Foto Sekaligus
                          </span>
                          <span className="text-[10px] text-[#6B7280]">
                            Bisa pilih banyak foto langsung dari galeri HP atau komputer
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-white rounded-lg border border-[#E3E7EE]">
                          {gallery.map((imgUrl, idx) => {
                            const isCover = idx === 0;
                            return (
                              <div
                                key={`${imgUrl}-${idx}`}
                                className={`relative rounded-lg overflow-hidden border group transition ${
                                  isCover
                                    ? 'border-[#3E5FD1] ring-2 ring-[#3E5FD1]/30'
                                    : 'border-[#E3E7EE]'
                                }`}
                              >
                                <div className="relative aspect-video bg-neutral-100">
                                  <img
                                    src={imgUrl}
                                    alt={`Foto ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      target.src =
                                        'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=600&auto=format&fit=crop';
                                    }}
                                  />

                                  {isCover ? (
                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#3E5FD1] text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                                      <Star className="w-2.5 h-2.5 fill-current" />
                                      <span>Sampul</span>
                                    </span>
                                  ) : (
                                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-semibold">
                                      #{idx + 1}
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemovePhoto(idx)}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition cursor-pointer"
                                    title="Hapus Foto Ini"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>

                                <div className="p-1 bg-[#F9FAFB] flex items-center justify-between text-[10px] border-t border-[#E3E7EE]">
                                  <div className="flex items-center space-x-0.5">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMovePhoto(idx, 'left')}
                                      className="p-0.5 rounded hover:bg-gray-200 text-[#4B5563] disabled:opacity-20 cursor-pointer"
                                      title="Geser Kiri"
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === gallery.length - 1}
                                      onClick={() => handleMovePhoto(idx, 'right')}
                                      className="p-0.5 rounded hover:bg-gray-200 text-[#4B5563] disabled:opacity-20 cursor-pointer"
                                      title="Geser Kanan"
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetCover(idx)}
                                      className="text-[#3E5FD1] hover:underline font-semibold text-[10px] cursor-pointer"
                                    >
                                      Jadikan Sampul
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-[#6B7280]">
                          Foto pertama otomatis jadi sampul. Foto lainnya tampil di Galeri Dokumentasi Kegiatan di halaman baca warta.
                        </p>
                      </div>
                    );
                  })()}

                  {/* Input File Multiple Tersembunyi */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="sr-only"
                  />

                  {/* Tombol Aksi Upload Multiple / Media Library */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-1.5 p-2 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-lg font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{uploadProgressText || 'Mengunggah...'}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload 2/3 Foto</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={openMediaPicker}
                      className="inline-flex items-center justify-center gap-1.5 p-2 bg-white border border-[#3E5FD1] text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-lg font-semibold text-[11px] transition cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Media Library</span>
                    </button>
                  </div>

                  {/* Input Tempel URL Manual */}
                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="text"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      placeholder="Atau tempel URL gambar..."
                      className="flex-1 p-2 bg-white border border-[#E3E7EE] rounded-lg text-[10px] text-[#4B5563]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (manualImageUrl.trim()) {
                          handleAddManualUrl(manualImageUrl);
                          setManualImageUrl('');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-[#EEF2FC] text-[#3E5FD1] hover:bg-[#3E5FD1] hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="w-full py-2 bg-white border border-[#E3E7EE] rounded-lg text-xs text-[#374151] hover:bg-gray-50 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pemilih Media (Media Library Picker) */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E3E7EE] p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Pilih Foto dari Media Library</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Klik foto di bawah untuk langsung menjadikannya gambar utama artikel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1 rounded-lg text-[#6B7280] hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama berkas media..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F5F7FA] border border-[#E3E7EE] rounded-lg text-xs"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingMedia ? (
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3E5FD1] mb-2" />
                  Memuat berkas media dari Supabase Storage...
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  Tidak ada berkas media ditemukan. Anda dapat mengunggah langsung dengan tombol &ldquo;Select Foto&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredMedia.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        handleSelectFromMediaLibrary(m.url);
                      }}
                      className="cursor-pointer group relative rounded-lg border border-[#E3E7EE] overflow-hidden hover:border-[#3E5FD1] hover:ring-2 hover:ring-[#3E5FD1]/30 transition"
                    >
                      <div className="aspect-video bg-neutral-100 overflow-hidden">
                        <img
                          src={m.url}
                          alt={m.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-1.5 bg-white text-[10px]">
                        <span className="font-semibold text-[#111827] block truncate">{m.name}</span>
                      </div>
                      {((selectedNews.galeri && selectedNews.galeri.length > 0)
                        ? selectedNews.galeri.includes(m.url)
                        : selectedNews.gambar_utama === m.url) && (
                        <div className="absolute top-1 right-1 bg-[#138A3A] text-white p-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E3E7EE] flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-lg text-[#374151] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Hapus Berita Permanen"
        message="Hapus artikel berita ini secara permanen dari basis data?"
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleDeletePermanent}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
