'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  UploadCloud,
  FolderOpen,
  Loader2,
  X,
  Check,
  FileText,
  Download,
  ExternalLink,
  DollarSign,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  Utensils,
  Heart,
} from 'lucide-react';
import { ProgramItem } from '@/lib/types';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface MediaItem {
  id: string;
  name: string;
  size: number;
  mimetype: string;
  created_at: string;
  url: string;
}

interface PaketInfaqItem {
  nama: string;
  nominal: number;
  deskripsi: string;
}

interface ExtendedMetadata {
  kategori?: string;
  tag?: string;
  biaya_label?: string;
  biaya_pendaftaran?: string;
  biaya_spp?: string;
  status_pendaftaran?: string;
  kontak_wa?: string;
  target_usia?: string;
  waktu_belajar?: string;
  file_lampiran?: string;
  file_lampiran_nama?: string;
  paket_infaq?: PaketInfaqItem[];
  [key: string]: unknown;
}

const AVAILABLE_ICONS = [
  { name: 'BookOpen', label: 'Buku / Kajian', icon: BookOpen },
  { name: 'GraduationCap', label: 'Pendidikan / Sekolah', icon: GraduationCap },
  { name: 'HeartHandshake', label: 'Sosial / Relawan', icon: HeartHandshake },
  { name: 'Landmark', label: 'Wakaf / Masjid', icon: Landmark },
  { name: 'Utensils', label: 'Pangan / Jumat Berkah', icon: Utensils },
  { name: 'Heart', label: 'Kepedulian / Kasih', icon: Heart },
];

export default function AdminProgramPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<'create' | 'edit' | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Partial<ProgramItem>>({});
  const [programMeta, setProgramMeta] = useState<ExtendedMetadata>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // Media Library Picker State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/programs');
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
      }
    } catch (err) {
      console.error('Gagal mengambil data program:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    const meta: ExtendedMetadata = {
      kategori: 'Pendidikan',
      biaya_label: '',
      biaya_pendaftaran: '',
      biaya_spp: '',
      status_pendaftaran: '',
      kontak_wa: '',
      file_lampiran: '',
      file_lampiran_nama: '',
      paket_infaq: [],
    };
    setSelectedProgram({
      judul: '',
      slug: '',
      ringkasan: '',
      deskripsi: '',
      ikon: 'BookOpen',
      gambar: '',
      urutan: programs.length + 1,
      tampil_beranda: true,
      is_archived: false,
      metadata: meta,
    });
    setProgramMeta(meta);
    setActiveModal('create');
  }

  function handleOpenEdit(prog: ProgramItem) {
    const meta = (prog.metadata || {}) as ExtendedMetadata;
    setSelectedProgram(prog);
    setProgramMeta({
      kategori: meta.kategori || 'Umum',
      biaya_label: meta.biaya_label || '',
      biaya_pendaftaran: meta.biaya_pendaftaran || '',
      biaya_spp: meta.biaya_spp || '',
      status_pendaftaran: meta.status_pendaftaran || '',
      kontak_wa: meta.kontak_wa || '',
      target_usia: meta.target_usia || '',
      waktu_belajar: meta.waktu_belajar || '',
      file_lampiran: meta.file_lampiran || '',
      file_lampiran_nama: meta.file_lampiran_nama || '',
      paket_infaq: Array.isArray(meta.paket_infaq) ? meta.paket_infaq : [],
    });
    setActiveModal('edit');
  }

  // Handle Upload Image
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya berkas gambar (JPG, PNG, WebP, SVG) yang diperbolehkan.');
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
        throw new Error(data.error || 'Gagal mengunggah foto.');
      }

      setSelectedProgram((prev) => ({ ...prev, gambar: data.url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan unggah gambar';
      alert(`Gagal upload: ${msg}`);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }

  // Handle Upload Document (PDF / Doc)
  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah dokumen.');
      }

      setProgramMeta((prev) => ({
        ...prev,
        file_lampiran: data.url,
        file_lampiran_nama: data.originalName || file.name,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan unggah dokumen';
      alert(`Gagal upload berkas: ${msg}`);
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  }

  // Open Media Library Picker
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

  // Paket Infaq Helpers
  function handleAddPaket() {
    setProgramMeta((prev) => ({
      ...prev,
      paket_infaq: [
        ...(prev.paket_infaq || []),
        { nama: 'Paket Baru', nominal: 25000, deskripsi: 'Deskripsi paket donasi/infaq...' },
      ],
    }));
  }

  function handleUpdatePaket(index: number, key: keyof PaketInfaqItem, value: string | number) {
    const list = [...(programMeta.paket_infaq || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      setProgramMeta((prev) => ({ ...prev, paket_infaq: list }));
    }
  }

  function handleRemovePaket(index: number) {
    const list = [...(programMeta.paket_infaq || [])];
    list.splice(index, 1);
    setProgramMeta((prev) => ({ ...prev, paket_infaq: list }));
  }

  // Save Program
  async function handleSaveProgram(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProgram.judul || !selectedProgram.judul.trim()) {
      alert('Nama program wajib diisi!');
      return;
    }

    const autoSlug =
      selectedProgram.slug && selectedProgram.slug.trim()
        ? selectedProgram.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
        : selectedProgram.judul
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

    setSubmitting(true);
    try {
      const method = activeModal === 'create' ? 'POST' : 'PUT';
      const payload = {
        ...selectedProgram,
        slug: autoSlug,
        metadata: {
          ...programMeta,
        },
      };

      const res = await fetch('/api/admin/programs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const filteredMedia = mediaList.filter((m) =>
    mediaSearch ? m.name.toLowerCase().includes(mediaSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Daftar Pilar Program Yayasan</h2>
          <p className="text-xs text-[#6B7280]">
            Kelola detail program, rincian biaya &amp; paket donasi, lampiran berkas/brosur PDF, dan tampilan beranda.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
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
                <th className="py-3 px-4">Program &amp; Slug</th>
                <th className="py-3 px-4">Biaya / Harga</th>
                <th className="py-3 px-4">Lampiran Berkas</th>
                <th className="py-3 px-4 text-center">Tampil Beranda</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#6B7280]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3E5FD1] mb-2" />
                    Memuat data program…
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#6B7280]">
                    Belum ada program tersimpan.
                  </td>
                </tr>
              ) : (
                programs.map((prog) => {
                  const meta = (prog.metadata || {}) as ExtendedMetadata;
                  const biayaText =
                    meta.biaya_label ||
                    (meta.biaya_pendaftaran ? `Pendaftaran: ${meta.biaya_pendaftaran}` : '') ||
                    (meta.paket_infaq && meta.paket_infaq.length > 0
                      ? `${meta.paket_infaq.length} Paket Infaq`
                      : '-');

                  return (
                    <tr key={prog.id} className="hover:bg-[#EEF2FC]/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1F2F6B]">
                        {prog.urutan}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#111827] block text-sm">
                          {prog.judul}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded-sm bg-[#EEF2FC] text-[#3E5FD1] text-[10px] font-semibold">
                            {meta.kategori || 'Umum'}
                          </span>
                          <span className="font-mono text-[10px] text-[#6B7280]">
                            /program/{prog.slug}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#111827]">
                        {biayaText}
                      </td>
                      <td className="py-3.5 px-4">
                        {meta.file_lampiran ? (
                          <a
                            href={meta.file_lampiran}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3E5FD1] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#138A3A]" />
                            <span className="max-w-[120px] truncate">
                              {meta.file_lampiran_nama || 'Brosur / PDF'}
                            </span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#9CA3AF] italic">Tidak ada berkas</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleBeranda(prog)}
                          title={
                            prog.tampil_beranda
                              ? 'Tampil di beranda (klik untuk sembunyikan)'
                              : 'Tidak tampil di beranda'
                          }
                          className={`p-1.5 rounded-md cursor-pointer ${
                            prog.tampil_beranda
                              ? 'bg-[#DCFCE7] text-[#166534]'
                              : 'bg-[#F3F4F6] text-[#9CA3AF]'
                          }`}
                        >
                          {prog.tampil_beranda ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <AdminStatusBadge status={prog.is_archived ? 'arsip' : 'terbit'} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <a
                            href={
                              prog.slug === 'pembebasan-lahan'
                                ? '/pembebasan-lahan'
                                : `/program/${prog.slug}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka Halaman Publik"
                            className="p-1.5 text-[#6B7280] hover:text-[#3E5FD1] rounded-md transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(prog)}
                            title="Edit Program"
                            className="p-1.5 text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-md transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveProgram(prog)}
                            title={prog.is_archived ? 'Aktifkan kembali' : 'Arsipkan program'}
                            className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-md transition cursor-pointer"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(prog.id)}
                            title="Hapus Permanen"
                            className="p-1.5 text-[#D7261E] hover:bg-[#FEE2E2] rounded-md transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Program Komprehensif */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#E3E7EE] p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  {activeModal === 'create' ? 'Tambah Program Baru' : 'Edit Data Program'}
                </h3>
                <p className="text-[11px] text-[#6B7280]">
                  Atur informasi program, unggah foto ilustrasi, kelola rincian biaya / paket infaq, dan lampirkan file brosur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-6 text-xs">
              {/* Bagian 1: Informasi Pokok */}
              <div className="space-y-3">
                <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3E5FD1]" />
                  Informasi Utama Program
                </h4>
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
                        const slug = judul
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '');
                        setSelectedProgram({
                          ...selectedProgram,
                          judul,
                          slug: activeModal === 'create' ? slug : selectedProgram.slug || slug,
                        });
                      }}
                      placeholder="Contoh: Pendidikan TK & PAUD Islam"
                      className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:border-[#3E5FD1] focus:ring-1 focus:ring-[#3E5FD1]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">
                      Tautan URL Web (Slug) <span className="text-[#D7261E]">*</span>
                    </label>
                    <div className="flex items-center">
                      <span className="px-2.5 py-2.5 bg-[#F5F7FA] border border-r-0 border-[#E3E7EE] rounded-l-lg text-[#6B7280] text-xs font-mono">
                        /program/
                      </span>
                      <input
                        type="text"
                        required
                        value={selectedProgram.slug || ''}
                        onChange={(e) =>
                          setSelectedProgram({
                            ...selectedProgram,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                        placeholder="tk-paud"
                        className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-r-lg font-mono focus:border-[#3E5FD1]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Kategori</label>
                    <select
                      value={programMeta.kategori || 'Pendidikan'}
                      onChange={(e) =>
                        setProgramMeta({ ...programMeta, kategori: e.target.value })
                      }
                      className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    >
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Sosial">Sosial &amp; Logistik</option>
                      <option value="Dakwah">Dakwah &amp; Kajian</option>
                      <option value="Wakaf Abadi">Wakaf Abadi</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Ikon Representasi</label>
                    <select
                      value={selectedProgram.ikon || 'BookOpen'}
                      onChange={(e) =>
                        setSelectedProgram({ ...selectedProgram, ikon: e.target.value })
                      }
                      className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic.name} value={ic.name}>
                          {ic.label} ({ic.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">Nomor Urutan Tampil</label>
                    <input
                      type="number"
                      value={selectedProgram.urutan ?? 1}
                      onChange={(e) =>
                        setSelectedProgram({
                          ...selectedProgram,
                          urutan: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    />
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
                    onChange={(e) =>
                      setSelectedProgram({ ...selectedProgram, ringkasan: e.target.value })
                    }
                    placeholder="Penjelasan ringkas 1-2 kalimat untuk kartu ikhtisar program..."
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#374151] mb-1">
                    Deskripsi Lengkap Program
                  </label>
                  <textarea
                    rows={3}
                    value={selectedProgram.deskripsi || ''}
                    onChange={(e) =>
                      setSelectedProgram({ ...selectedProgram, deskripsi: e.target.value })
                    }
                    placeholder="Uraian visi, latar belakang, dan cakupan kegiatan program..."
                    className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                </div>
              </div>

              {/* Bagian 2: Upload Media & Foto Banner */}
              <div className="space-y-3 pt-3 border-t border-[#E3E7EE]">
                <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#138A3A]" />
                  Foto / Banner Program (Upload &amp; Media Library)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E3E7EE]">
                  {/* Pratinjau Foto */}
                  <div className="relative aspect-video bg-white rounded-lg border border-[#E3E7EE] overflow-hidden flex items-center justify-center">
                    {selectedProgram.gambar ? (
                      <>
                        <img
                          src={selectedProgram.gambar}
                          alt="Banner Program"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src =
                              'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedProgram({ ...selectedProgram, gambar: '' })}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition"
                          title="Hapus foto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#9CA3AF] italic">Belum ada foto</span>
                    )}
                  </div>

                  {/* Tombol Select Foto & Media Library */}
                  <div className="md:col-span-2 space-y-2">
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => imageInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-lg font-semibold text-xs cursor-pointer disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengunggah Foto...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Select Foto dari Perangkat</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={openMediaPicker}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#3E5FD1] text-[#3E5FD1] hover:bg-[#EEF2FC] rounded-lg font-semibold text-xs cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Pilih dari Media Library</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={selectedProgram.gambar || ''}
                      onChange={(e) =>
                        setSelectedProgram({ ...selectedProgram, gambar: e.target.value })
                      }
                      placeholder="Atau tempel URL gambar eksternal di sini..."
                      className="w-full text-[11px] p-2 bg-white border border-[#E3E7EE] rounded-lg text-[#4B5563]"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Pengaturan Harga & Biaya */}
              <div className="space-y-4 pt-3 border-t border-[#E3E7EE]">
                <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#138A3A]" />
                  Pengaturan Biaya, Harga &amp; Paket Donasi
                </h4>

                {/* Input Label Biaya Global */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E3E7EE]">
                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">
                      Label Biaya / Infaq (Tampil di Kartu Ringkasan)
                    </label>
                    <input
                      type="text"
                      value={programMeta.biaya_label || ''}
                      onChange={(e) =>
                        setProgramMeta({ ...programMeta, biaya_label: e.target.value })
                      }
                      placeholder="Contoh: Mulai Rp 25.000 / Paket ATAU Gratis"
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    />
                    <span className="text-[10px] text-[#6B7280] mt-1 block">
                      Teks harga/nominal yang muncul di kartu program dan beranda.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">
                      Nomor WhatsApp Kontak Program
                    </label>
                    <input
                      type="text"
                      value={programMeta.kontak_wa || ''}
                      onChange={(e) =>
                        setProgramMeta({ ...programMeta, kontak_wa: e.target.value })
                      }
                      placeholder="Contoh: 6281234567890"
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-mono"
                    />
                    <span className="text-[10px] text-[#6B7280] mt-1 block">
                      Nomor CS/Panitia untuk konfirmasi pendaftaran / donasi.
                    </span>
                  </div>
                </div>

                {/* Sub-form Khusus Rincian Biaya TK-PAUD / Pendidikan */}
                <div className="p-4 rounded-xl border border-[#E3E7EE] bg-white space-y-3">
                  <h5 className="font-bold text-xs text-[#1F2F6B]">
                    Rincian Biaya Pendidikan (Untuk TK &amp; PAUD / Kelas Belajar):
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-[#4B5563] mb-1">
                        Biaya Pendaftaran / Observasi
                      </label>
                      <input
                        type="text"
                        value={programMeta.biaya_pendaftaran || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, biaya_pendaftaran: e.target.value })
                        }
                        placeholder="Contoh: Rp 350.000"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#4B5563] mb-1">
                        Biaya SPP Bulanan
                      </label>
                      <input
                        type="text"
                        value={programMeta.biaya_spp || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, biaya_spp: e.target.value })
                        }
                        placeholder="Contoh: Rp 250.000 / bulan"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-[#4B5563] mb-1">
                        Status Pendaftaran
                      </label>
                      <input
                        type="text"
                        value={programMeta.status_pendaftaran || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, status_pendaftaran: e.target.value })
                        }
                        placeholder="Contoh: Gelombang Inden Dibuka"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-form Khusus Paket Infaq Jumat Berkah / Program Sosial */}
                <div className="p-4 rounded-xl border border-[#E3E7EE] bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-xs text-[#1F2F6B]">
                        Daftar Paket Infaq &amp; Nominal Donasi (Untuk Program Sosial / Jumat Berkah):
                      </h5>
                      <span className="text-[11px] text-[#6B7280]">
                        Kelola pilihan paket nominal sedekah yang dapat dipilih oleh para muhsinin.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPaket}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#EEF2FC] hover:bg-[#3E5FD1] text-[#3E5FD1] hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Paket</span>
                    </button>
                  </div>

                  {(!programMeta.paket_infaq || programMeta.paket_infaq.length === 0) ? (
                    <div className="py-4 text-center text-[11px] text-[#9CA3AF] border border-dashed border-[#E3E7EE] rounded-lg">
                      Belum ada paket infaq kustom. Klik &ldquo;Tambah Paket&rdquo; jika program ini memiliki variasi paket donasi.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {programMeta.paket_infaq.map((paket, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E3E7EE]"
                        >
                          <input
                            type="text"
                            value={paket.nama}
                            onChange={(e) => handleUpdatePaket(idx, 'nama', e.target.value)}
                            placeholder="Nama Paket"
                            className="w-full sm:w-1/3 p-1.5 bg-white border border-[#E3E7EE] rounded text-xs font-semibold"
                          />
                          <div className="flex items-center w-full sm:w-1/4">
                            <span className="px-2 py-1.5 bg-neutral-200 text-neutral-600 rounded-l text-[10px] font-bold">
                              Rp
                            </span>
                            <input
                              type="number"
                              value={paket.nominal}
                              onChange={(e) =>
                                handleUpdatePaket(idx, 'nominal', parseInt(e.target.value, 10) || 0)
                              }
                              placeholder="Nominal"
                              className="w-full p-1.5 bg-white border border-[#E3E7EE] rounded-r text-xs font-mono font-bold"
                            />
                          </div>
                          <input
                            type="text"
                            value={paket.deskripsi}
                            onChange={(e) => handleUpdatePaket(idx, 'deskripsi', e.target.value)}
                            placeholder="Keterangan singkat paket..."
                            className="w-full sm:flex-1 p-1.5 bg-white border border-[#E3E7EE] rounded text-xs text-[#4B5563]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePaket(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                            title="Hapus paket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bagian 4: Upload Berkas / Brosur / Dokumen PDF */}
              <div className="space-y-3 pt-3 border-t border-[#E3E7EE]">
                <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3E5FD1]" />
                  Upload Lampiran Berkas / Brosur Pendaftaran (PDF / Dokumen)
                </h4>

                <div className="p-4 rounded-xl border border-[#E3E7EE] bg-[#F8FAFC] space-y-3">
                  <p className="text-[11px] text-[#6B7280]">
                    Unggah brosur, kurikulum resmi, atau formulir pendaftaran. Berkas akan dapat diunduh langsung oleh calon wali santri / pengunjung di halaman web program.
                  </p>

                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                  />

                  {programMeta.file_lampiran ? (
                    <div className="flex items-center justify-between p-3 bg-white border border-[#E3E7EE] rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#138A3A]" />
                        <div>
                          <span className="font-bold text-xs text-[#111827] block truncate max-w-sm">
                            {programMeta.file_lampiran_nama || 'Berkas Terlampir (PDF)'}
                          </span>
                          <a
                            href={programMeta.file_lampiran}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#3E5FD1] hover:underline inline-flex items-center gap-1 font-mono"
                          >
                            <span>Buka berkas di tab baru</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => docInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-semibold text-[#3E5FD1] bg-[#EEF2FC] hover:bg-[#3E5FD1] hover:text-white rounded transition cursor-pointer"
                        >
                          Ganti Berkas
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setProgramMeta((prev) => ({
                              ...prev,
                              file_lampiran: '',
                              file_lampiran_nama: '',
                            }))
                          }
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                          title="Hapus lampiran"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={uploadingDoc}
                      onClick={() => docInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E3E7EE] hover:border-[#3E5FD1] text-[#374151] rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {uploadingDoc ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#3E5FD1]" />
                          <span>Mengunggah Berkas ke Storage...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-[#3E5FD1]" />
                          <span>Pilih File Brosur / Dokumen (PDF, Word, Excel)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Tampil di Beranda */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="tampil_beranda"
                  checked={selectedProgram.tampil_beranda !== false}
                  onChange={(e) =>
                    setSelectedProgram({ ...selectedProgram, tampil_beranda: e.target.checked })
                  }
                  className="rounded text-[#3E5FD1]"
                />
                <label htmlFor="tampil_beranda" className="font-semibold text-xs text-[#374151]">
                  Tampilkan kartu program ini di halaman beranda utama
                </label>
              </div>

              {/* Footer Tombol Simpan */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E3E7EE]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-[#E3E7EE] rounded-lg text-[#374151] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'Menyimpan ke Database…' : 'Simpan Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pemilih Media Library */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E3E7EE] p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Pilih Foto dari Media Library</h4>
                <p className="text-[11px] text-[#6B7280]">
                  Pilih foto dari Supabase Storage untuk menjadi ilustrasi program.
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
                placeholder="Cari berkas media..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 bg-[#F5F7FA] border border-[#E3E7EE] rounded-lg text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingMedia ? (
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3E5FD1] mb-2" />
                  Memuat berkas media...
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6B7280]">
                  Tidak ada berkas media. Silakan unggah foto dari perangkat Anda.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredMedia.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedProgram((prev) => ({ ...prev, gambar: m.url }));
                        setShowMediaPicker(false);
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
                      {selectedProgram.gambar === m.url && (
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
