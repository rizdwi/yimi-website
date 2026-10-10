/* eslint-disable @next/next/no-img-element */
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
  Clock,
  Sparkles,
  Layers,
  PackageCheck,
  CheckCircle2,
  School,
  Building2,
  Compass,
  Calendar,
} from 'lucide-react';
import { ProgramItem } from '@/lib/types';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import fallbackTkData from '@/content/programs/tk-paud.json';

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

interface KeunggulanItem {
  judul: string;
  deskripsi: string;
}

interface FasilitasItem {
  nama: string;
  deskripsi: string;
}

interface KegiatanItem {
  waktu: string;
  aktivitas: string;
}

interface ExtendedMetadata {
  kategori?: string;
  tag?: string;
  // Pokok
  target_usia?: string;
  waktu_belajar?: string;
  // Visi & Misi Sekolah
  visi_sekolah?: string;
  misi_sekolah?: string[];
  // Keunggulan Kurikulum
  keunggulan_judul?: string;
  keunggulan_subjudul?: string;
  keunggulan?: KeunggulanItem[];
  // Fasilitas Belajar
  fasilitas_judul?: string;
  fasilitas_subjudul?: string;
  fasilitas?: FasilitasItem[];
  // PPDB & Biaya
  status_pendaftaran?: string;
  biaya_label?: string;
  biaya_pendaftaran?: string;
  biaya_spp?: string;
  banner_pendaftaran_judul?: string;
  banner_pendaftaran_subjudul?: string;
  file_brosur?: string;
  file_brosur_nama?: string;
  file_formulir?: string;
  file_formulir_nama?: string;
  jam_pelayanan?: string;
  kontak_wa?: string;
  pesan_wa?: string;
  alamat_sekolah?: string;
  file_lampiran?: string;
  file_lampiran_nama?: string;
  // Syarat & Rutinitas
  syarat_judul?: string;
  syarat_pendaftaran?: string[];
  kegiatan_judul?: string;
  kegiatan_subjudul?: string;
  kegiatan_harian?: KegiatanItem[];
  // Sosial / Dakwah
  target_penerima?: string;
  jadwal_penyaluran?: string;
  lokasi_kegiatan?: string;
  pemateri_kajian?: string;
  kitab_kajian?: string;
  // Paket
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
  const [activeTab, setActiveTab] = useState<string>('umum');

  // Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingBrosur, setUploadingBrosur] = useState(false);
  const [uploadingFormulir, setUploadingFormulir] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const brosurInputRef = useRef<HTMLInputElement | null>(null);
  const formulirInputRef = useRef<HTMLInputElement | null>(null);

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
      pesan_wa: '',
      target_usia: '',
      waktu_belajar: '',
      visi_sekolah: '',
      misi_sekolah: [],
      keunggulan_judul: 'Kurikulum & Keunggulan Program',
      keunggulan_subjudul: '',
      keunggulan: [],
      fasilitas_judul: 'Fasilitas & Lingkungan Belajar',
      fasilitas_subjudul: '',
      fasilitas: [],
      banner_pendaftaran_judul: 'Pendaftaran Santri Baru Telah Dibuka!',
      banner_pendaftaran_subjudul: '',
      file_brosur: '',
      file_brosur_nama: '',
      file_formulir: '',
      file_formulir_nama: '',
      jam_pelayanan: 'Senin – Jumat: 07.30 – 12.00 WIB',
      alamat_sekolah: '',
      kegiatan_judul: 'Jadwal Rutinitas Santri',
      kegiatan_subjudul: '',
      kegiatan_harian: [],
      syarat_judul: 'Syarat Pendaftaran',
      syarat_pendaftaran: [],
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
    setActiveTab('umum');
    setActiveModal('create');
  }

  function handleOpenEdit(prog: ProgramItem) {
    const meta = (prog.metadata || {}) as ExtendedMetadata;
    const isTk = prog.slug === 'tk-paud';

    const keunggulan =
      Array.isArray(meta.keunggulan) && meta.keunggulan.length > 0
        ? meta.keunggulan
        : isTk
        ? (fallbackTkData.keunggulan as KeunggulanItem[])
        : [];

    const fasilitas =
      Array.isArray(meta.fasilitas) && meta.fasilitas.length > 0
        ? meta.fasilitas
        : isTk
        ? ((fallbackTkData as Record<string, unknown>).fasilitas as FasilitasItem[] || [])
        : [];

    const misi =
      Array.isArray(meta.misi_sekolah) && meta.misi_sekolah.length > 0
        ? meta.misi_sekolah
        : isTk
        ? ((fallbackTkData as Record<string, unknown>).misi as string[] || [])
        : [];

    const kegiatanHarian =
      Array.isArray(meta.kegiatan_harian) && meta.kegiatan_harian.length > 0
        ? meta.kegiatan_harian
        : isTk
        ? (fallbackTkData.kegiatanHarian as KegiatanItem[])
        : [];

    const syarat =
      Array.isArray(meta.syarat_pendaftaran) && meta.syarat_pendaftaran.length > 0
        ? meta.syarat_pendaftaran
        : isTk
        ? fallbackTkData.pendaftaran.syarat
        : [];

    setSelectedProgram(prog);
    setProgramMeta({
      kategori: meta.kategori || (isTk ? 'Pendidikan' : 'Umum'),
      biaya_label: meta.biaya_label || '',
      biaya_pendaftaran: meta.biaya_pendaftaran || (isTk ? 'Rp 50.000' : ''),
      biaya_spp: meta.biaya_spp || (isTk ? 'Rp 70.000 / bulan' : ''),
      status_pendaftaran: meta.status_pendaftaran || (isTk ? 'Gelombang 1 Telah Dibuka' : ''),
      kontak_wa: meta.kontak_wa || (isTk ? fallbackTkData.pendaftaran.kontakPendaftaran : ''),
      pesan_wa: meta.pesan_wa || (isTk ? fallbackTkData.pendaftaran.pesanWA : ''),
      target_usia: meta.target_usia || (isTk ? fallbackTkData.targetUsia : ''),
      waktu_belajar: meta.waktu_belajar || (isTk ? fallbackTkData.waktuBelajar : ''),
      visi_sekolah: meta.visi_sekolah || (isTk ? ((fallbackTkData as Record<string, unknown>).visi as string || '') : ''),
      misi_sekolah: misi,
      keunggulan_judul:
        meta.keunggulan_judul || (isTk ? 'Kurikulum & Keunggulan Program' : 'Keunggulan Program'),
      keunggulan_subjudul:
        meta.keunggulan_subjudul ||
        (isTk
          ? 'Menyelaraskan nilai-nilai sunnah dengan metode pembelajaran ramah anak yang menyenangkan.'
          : ''),
      keunggulan,
      fasilitas_judul:
        meta.fasilitas_judul || (isTk ? 'Fasilitas & Lingkungan Belajar' : 'Fasilitas Program'),
      fasilitas_subjudul:
        meta.fasilitas_subjudul ||
        (isTk
          ? 'Sarana dan prasarana yang dirancang aman, bersih, dan mendukung kenyamanan tumbuh kembang santri.'
          : ''),
      fasilitas,
      banner_pendaftaran_judul:
        meta.banner_pendaftaran_judul || (isTk ? 'Pendaftaran Santri Baru Telah Dibuka!' : ''),
      banner_pendaftaran_subjudul:
        meta.banner_pendaftaran_subjudul ||
        (isTk
          ? 'Kuota terbatas untuk setiap jenjang kelas (KB & TK). Daftarkan putra-putri tercinta untuk membentuk pondasi aqidah dan karakter islami yang kokoh sejak dini.'
          : ''),
      file_brosur: meta.file_brosur || (isTk ? ((fallbackTkData.pendaftaran as Record<string, unknown>).fileBrosur as string || '') : ''),
      file_brosur_nama: meta.file_brosur_nama || (isTk ? 'Brosur TK Islam Insan Muslim Istiqomah (PDF)' : ''),
      file_formulir: meta.file_formulir || (isTk ? ((fallbackTkData.pendaftaran as Record<string, unknown>).fileFormulir as string || '') : ''),
      file_formulir_nama: meta.file_formulir_nama || (isTk ? 'Formulir Pendaftaran Santri Baru (PDF)' : ''),
      jam_pelayanan: meta.jam_pelayanan || (isTk ? ((fallbackTkData.pendaftaran as Record<string, unknown>).jamPelayanan as string || 'Senin – Jumat: 07.30 – 12.00 WIB') : ''),
      alamat_sekolah: meta.alamat_sekolah || (isTk ? ((fallbackTkData.pendaftaran as Record<string, unknown>).alamatSekolah as string || 'Jl. Raya Cilodong No. 45, Kalimulya, Kec. Cilodong, Kota Depok, Jawa Barat 16413') : ''),
      kegiatan_judul:
        meta.kegiatan_judul || (isTk ? 'Jadwal Rutinitas Santri' : 'Jadwal Rutinitas & Kegiatan'),
      kegiatan_subjudul:
        meta.kegiatan_subjudul ||
        (isTk
          ? 'Alur kegiatan harian yang membangun kedisiplinan dan keceriaan ananda.'
          : ''),
      kegiatan_harian: kegiatanHarian,
      syarat_judul: meta.syarat_judul || 'Syarat Pendaftaran',
      syarat_pendaftaran: syarat,
      target_penerima: meta.target_penerima || '',
      jadwal_penyaluran: meta.jadwal_penyaluran || '',
      lokasi_kegiatan: meta.lokasi_kegiatan || '',
      pemateri_kajian: meta.pemateri_kajian || '',
      kitab_kajian: meta.kitab_kajian || '',
      paket_infaq: Array.isArray(meta.paket_infaq) ? meta.paket_infaq : [],
    });
    setActiveTab('umum');
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

  // Handle Upload Brosur (PDF)
  async function handleBrosurUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrosur(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah brosur.');

      setProgramMeta((prev) => ({
        ...prev,
        file_brosur: data.url,
        file_brosur_nama: data.originalName || file.name,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan unggah brosur';
      alert(`Gagal upload brosur: ${msg}`);
    } finally {
      setUploadingBrosur(false);
      if (brosurInputRef.current) brosurInputRef.current.value = '';
    }
  }

  // Handle Upload Formulir (PDF)
  async function handleFormulirUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFormulir(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah formulir.');

      setProgramMeta((prev) => ({
        ...prev,
        file_formulir: data.url,
        file_formulir_nama: data.originalName || file.name,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan unggah formulir';
      alert(`Gagal upload formulir: ${msg}`);
    } finally {
      setUploadingFormulir(false);
      if (formulirInputRef.current) formulirInputRef.current.value = '';
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

  // Misi Helpers (Image 1)
  function handleAddMisi() {
    setProgramMeta((prev) => ({
      ...prev,
      misi_sekolah: [
        ...(prev.misi_sekolah || []),
        'Butir misi sekolah baru...',
      ],
    }));
  }

  function handleUpdateMisi(index: number, val: string) {
    const list = [...(programMeta.misi_sekolah || [])];
    list[index] = val;
    setProgramMeta((prev) => ({ ...prev, misi_sekolah: list }));
  }

  function handleRemoveMisi(index: number) {
    const list = [...(programMeta.misi_sekolah || [])];
    list.splice(index, 1);
    setProgramMeta((prev) => ({ ...prev, misi_sekolah: list }));
  }

  // Keunggulan Helpers (Image 1)
  function handleAddKeunggulan() {
    setProgramMeta((prev) => ({
      ...prev,
      keunggulan: [
        ...(prev.keunggulan || []),
        { judul: 'Keunggulan Baru', deskripsi: 'Uraian keunggulan kurikulum atau program...' },
      ],
    }));
  }

  function handleUpdateKeunggulan(index: number, key: keyof KeunggulanItem, value: string) {
    const list = [...(programMeta.keunggulan || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      setProgramMeta((prev) => ({ ...prev, keunggulan: list }));
    }
  }

  function handleRemoveKeunggulan(index: number) {
    const list = [...(programMeta.keunggulan || [])];
    list.splice(index, 1);
    setProgramMeta((prev) => ({ ...prev, keunggulan: list }));
  }

  // Fasilitas Helpers (Image 2)
  function handleAddFasilitas() {
    setProgramMeta((prev) => ({
      ...prev,
      fasilitas: [
        ...(prev.fasilitas || []),
        { nama: 'Fasilitas Baru', deskripsi: 'Uraian fasilitas sarana pembelajaran...' },
      ],
    }));
  }

  function handleUpdateFasilitas(index: number, key: keyof FasilitasItem, value: string) {
    const list = [...(programMeta.fasilitas || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      setProgramMeta((prev) => ({ ...prev, fasilitas: list }));
    }
  }

  function handleRemoveFasilitas(index: number) {
    const list = [...(programMeta.fasilitas || [])];
    list.splice(index, 1);
    setProgramMeta((prev) => ({ ...prev, fasilitas: list }));
  }

  // Jadwal / Rutinitas Kegiatan Helpers
  function handleAddKegiatan() {
    setProgramMeta((prev) => ({
      ...prev,
      kegiatan_harian: [
        ...(prev.kegiatan_harian || []),
        { waktu: '08.00 – 08.45', aktivitas: 'Aktivitas santri / materi pembelajaran...' },
      ],
    }));
  }

  function handleUpdateKegiatan(index: number, key: keyof KegiatanItem, value: string) {
    const list = [...(programMeta.kegiatan_harian || [])];
    if (list[index]) {
      list[index] = { ...list[index], [key]: value };
      setProgramMeta((prev) => ({ ...prev, kegiatan_harian: list }));
    }
  }

  function handleRemoveKegiatan(index: number) {
    const list = [...(programMeta.kegiatan_harian || [])];
    list.splice(index, 1);
    setProgramMeta((prev) => ({ ...prev, kegiatan_harian: list }));
  }

  // Syarat Pendaftaran Helpers (Image 3)
  function handleAddSyarat() {
    setProgramMeta((prev) => ({
      ...prev,
      syarat_pendaftaran: [
        ...(prev.syarat_pendaftaran || []),
        'Persyaratan pendaftaran baru...',
      ],
    }));
  }

  function handleUpdateSyarat(index: number, value: string) {
    const list = [...(programMeta.syarat_pendaftaran || [])];
    list[index] = value;
    setProgramMeta((prev) => ({ ...prev, syarat_pendaftaran: list }));
  }

  function handleRemoveSyarat(index: number) {
    const list = [...(programMeta.syarat_pendaftaran || [])];
    list.splice(index, 1);
    setProgramMeta((prev) => ({ ...prev, syarat_pendaftaran: list }));
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

  // Kategori Program Helper untuk Pengelompokan Tab
  const isPendidikan =
    programMeta.kategori === 'Pendidikan' || selectedProgram.slug === 'tk-paud';
  const isSosial =
    programMeta.kategori === 'Sosial' || selectedProgram.slug === 'jumat-berkah';
  const isDakwah =
    programMeta.kategori === 'Dakwah' || selectedProgram.slug === 'kajian';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Daftar Pilar Program Yayasan</h2>
          <p className="text-xs text-[#6B7280]">
            Kelola detail program, kurikulum &amp; keunggulan, fasilitas, berkas PPDB (brosur &amp; formulir PDF), serta tampilan beranda.
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
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(prog)}
                          className="font-bold text-[#111827] hover:text-[#3E5FD1] text-left block text-sm transition cursor-pointer"
                        >
                          {prog.judul}
                        </button>
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
                        {meta.file_brosur || meta.file_lampiran ? (
                          <a
                            href={meta.file_brosur || meta.file_lampiran}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3E5FD1] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#138A3A]" />
                            <span className="max-w-[120px] truncate">
                              {meta.file_brosur_nama || meta.file_lampiran_nama || 'Brosur (PDF)'}
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
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(prog)}
                            title="Edit Program"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#3E5FD1] bg-[#EEF2FC] hover:bg-[#3E5FD1] hover:text-white rounded-md transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <a
                            href={
                              prog.slug === 'pembebasan-lahan'
                                ? '/pembebasan-lahan'
                                : `/program/${prog.slug}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka Halaman Publik"
                            className="p-1.5 text-[#6B7280] hover:text-[#3E5FD1] hover:bg-gray-100 rounded-md transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
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
                  Formulir terspesialisasi berdasarkan kategori program ({programMeta.kategori || 'Umum'}). Setiap bagian dikelompokkan rapi agar mudah dikelola.
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

            {/* Navigasi Tab Modal Terspesialisasi */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#E3E7EE] pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('umum')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'umum'
                    ? 'bg-[#3E5FD1] text-white shadow-xs'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>1. Umum &amp; Media</span>
              </button>

              {/* Tab Khusus Program Pendidikan (TK / PAUD) */}
              {isPendidikan && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('visi_misi')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'visi_misi'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>2. Visi &amp; Misi Sekolah</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('keunggulan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'keunggulan'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>3. Kurikulum &amp; Keunggulan</span>
                    {programMeta.keunggulan && programMeta.keunggulan.length > 0 && (
                      <span
                        className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                          activeTab === 'keunggulan'
                            ? 'bg-white/20 text-white'
                            : 'bg-[#E5E7EB] text-[#374151]'
                        }`}
                      >
                        {programMeta.keunggulan.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('fasilitas')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'fasilitas'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <School className="w-3.5 h-3.5" />
                    <span>4. Fasilitas Belajar</span>
                    {programMeta.fasilitas && programMeta.fasilitas.length > 0 && (
                      <span
                        className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                          activeTab === 'fasilitas'
                            ? 'bg-white/20 text-white'
                            : 'bg-[#E5E7EB] text-[#374151]'
                        }`}
                      >
                        {programMeta.fasilitas.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('pendaftaran')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'pendaftaran'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>5. PPDB, Biaya &amp; Unduhan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('syarat_rutinitas')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'syarat_rutinitas'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>6. Syarat &amp; Rutinitas</span>
                  </button>
                </>
              )}

              {/* Tab Khusus Program Sosial (Jumat Berkah dll) */}
              {isSosial && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('penyaluran')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'penyaluran'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>2. Penyaluran &amp; Target</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('paket')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'paket'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>3. Paket Donasi / Infaq</span>
                  </button>
                </>
              )}

              {/* Tab Khusus Program Dakwah (Kajian dll) */}
              {isDakwah && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('jadwal_dakwah')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'jadwal_dakwah'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>2. Jadwal &amp; Lokasi Kajian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('paket')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'paket'
                        ? 'bg-[#3E5FD1] text-white shadow-xs'
                        : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>3. Paket Infaq Operasional</span>
                  </button>
                </>
              )}

              {/* Tab Umum untuk Kategori Lainnya */}
              {!isPendidikan && !isSosial && !isDakwah && (
                <button
                  type="button"
                  onClick={() => setActiveTab('paket')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'paket'
                      ? 'bg-[#3E5FD1] text-white shadow-xs'
                      : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>2. Paket Donasi / Infaq</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-6 text-xs">
              {/* TAB 1: INFORMASI UMUM & MEDIA */}
              {activeTab === 'umum' && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3E5FD1]" />
                      Informasi Pokok Program
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
                        <label className="block font-semibold text-[#374151] mb-1">Kategori Program</label>
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

                  {/* Foto / Banner */}
                  <div className="space-y-3 pt-3 border-t border-[#E3E7EE]">
                    <h4 className="font-bold text-[#111827] text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#138A3A]" />
                      Foto / Banner Program (Upload &amp; Media Library)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E3E7EE]">
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
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition cursor-pointer"
                              title="Hapus foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-[#9CA3AF] italic">Belum ada foto</span>
                        )}
                      </div>

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
                                <span>Pilih Foto dari Perangkat</span>
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
                </div>
              )}

              {/* TAB 2: VISI & MISI SEKOLAH (Khusus Pendidikan - Gambar 1) */}
              {isPendidikan && activeTab === 'visi_misi' && (
                <div className="space-y-5">
                  <div className="bg-[#EEF2FC] p-3.5 rounded-xl border border-[#3E5FD1]/20 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Compass className="w-5 h-5 text-[#3E5FD1] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-[#1F2F6B]">
                          Visi &amp; Misi Pendidikan Sekolah (Gambar 1)
                        </h4>
                        <p className="text-[11px] text-[#4B5563] mt-0.5 leading-relaxed">
                          Atur kalimat visi utama dan butir-butir misi yang tampil pada seksi &ldquo;Visi &amp; Misi Kami&rdquo; di halaman web sekolah.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E3E7EE]">
                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Visi Utama Sekolah
                      </label>
                      <textarea
                        rows={3}
                        value={programMeta.visi_sekolah || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, visi_sekolah: e.target.value })
                        }
                        placeholder="Contoh: Membentuk generasi pembelajar yang berkarakter islami, beraqidah lurus, berakhlak mulia, dan unggul dalam potensi diri."
                        className="w-full text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block font-semibold text-[#374151]">
                        Daftar Butir Misi Sekolah:
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMisi}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Misi</span>
                      </button>
                    </div>

                    {(!programMeta.misi_sekolah || programMeta.misi_sekolah.length === 0) ? (
                      <div className="py-6 text-center text-xs text-[#9CA3AF] border border-dashed border-[#E3E7EE] rounded-xl bg-[#F8FAFC]">
                        Belum ada butir misi. Klik tombol &ldquo;Tambah Misi&rdquo; di atas untuk menambahkan.
                      </div>
                    ) : (
                      programMeta.misi_sekolah.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E3E7EE]"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#138A3A]/10 text-[#138A3A] font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleUpdateMisi(idx, e.target.value)}
                            placeholder="Contoh: Menanamkan aqidah shahihah dan akhlak mulia sejak dini..."
                            className="flex-1 p-2 bg-white border border-[#E3E7EE] rounded-md text-xs text-[#111827]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMisi(idx)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                            title="Hapus misi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: KURIKULUM & KEUNGGULAN (Khusus Pendidikan - Gambar 1) */}
              {isPendidikan && activeTab === 'keunggulan' && (
                <div className="space-y-4">
                  <div className="bg-[#EEF2FC] p-3.5 rounded-xl border border-[#3E5FD1]/20 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-5 h-5 text-[#3E5FD1] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-[#1F2F6B]">
                          Kurikulum &amp; Keunggulan Program (Gambar 1)
                        </h4>
                        <p className="text-[11px] text-[#4B5563] mt-0.5 leading-relaxed">
                          Kartu-kartu kurikulum &amp; keunggulan (Tauhid &amp; Sunnah, Tahfidz Juz 30, dsb) yang tampil di web publik.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKeunggulan}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Keunggulan</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Judul Seksi Keunggulan
                      </label>
                      <input
                        type="text"
                        value={programMeta.keunggulan_judul || 'Kurikulum & Keunggulan Program'}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, keunggulan_judul: e.target.value })
                        }
                        placeholder="Contoh: Kurikulum & Keunggulan Program"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Subjudul Seksi Keunggulan
                      </label>
                      <input
                        type="text"
                        value={programMeta.keunggulan_subjudul || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, keunggulan_subjudul: e.target.value })
                        }
                        placeholder="Contoh: Menyelaraskan nilai-nilai sunnah dengan metode pembelajaran ramah anak yang menyenangkan."
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block font-semibold text-[#374151]">
                      Daftar Kartu Keunggulan:
                    </label>

                    {(!programMeta.keunggulan || programMeta.keunggulan.length === 0) ? (
                      <div className="py-6 text-center text-xs text-[#9CA3AF] border border-dashed border-[#E3E7EE] rounded-xl bg-[#F8FAFC]">
                        Belum ada kartu keunggulan. Klik tombol &ldquo;Tambah Keunggulan&rdquo; di atas untuk menambahkan.
                      </div>
                    ) : (
                      programMeta.keunggulan.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E3E7EE] space-y-2.5 relative hover:border-[#3E5FD1]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#1F2F6B] flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#138A3A]/10 text-[#138A3A] flex items-center justify-center text-[11px] font-bold">
                                {idx + 1}
                              </span>
                              Kartu Keunggulan #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveKeunggulan(idx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                              title="Hapus kartu ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={item.judul}
                              onChange={(e) => handleUpdateKeunggulan(idx, 'judul', e.target.value)}
                              placeholder="Judul Keunggulan (contoh: Tauhid & Sunnah Sejak Dini)"
                              className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg text-xs font-bold text-[#111827]"
                            />
                          </div>

                          <div>
                            <textarea
                              rows={2}
                              value={item.deskripsi}
                              onChange={(e) => handleUpdateKeunggulan(idx, 'deskripsi', e.target.value)}
                              placeholder="Uraian keunggulan kurikulum atau program secara rinci..."
                              className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg text-xs text-[#374151]"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: FASILITAS BELAJAR (Khusus Pendidikan - Gambar 2) */}
              {isPendidikan && activeTab === 'fasilitas' && (
                <div className="space-y-4">
                  <div className="bg-[#EEF2FC] p-3.5 rounded-xl border border-[#3E5FD1]/20 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <School className="w-5 h-5 text-[#3E5FD1] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-[#1F2F6B]">
                          Fasilitas &amp; Lingkungan Belajar (Gambar 2)
                        </h4>
                        <p className="text-[11px] text-[#4B5563] mt-0.5 leading-relaxed">
                          Kartu sarana prasarana sekolah (Kelas Ber-AC, Playground, Musholla, CCTV, dsb) yang tampil di halaman web.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFasilitas}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Fasilitas</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Judul Seksi Fasilitas
                      </label>
                      <input
                        type="text"
                        value={programMeta.fasilitas_judul || 'Fasilitas & Lingkungan Belajar'}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, fasilitas_judul: e.target.value })
                        }
                        placeholder="Contoh: Fasilitas & Lingkungan Belajar"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Subjudul Seksi Fasilitas
                      </label>
                      <input
                        type="text"
                        value={programMeta.fasilitas_subjudul || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, fasilitas_subjudul: e.target.value })
                        }
                        placeholder="Contoh: Sarana dan prasarana yang dirancang aman, bersih, dan mendukung kenyamanan tumbuh kembang santri."
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block font-semibold text-[#374151]">
                      Daftar Kartu Fasilitas Belajar:
                    </label>

                    {(!programMeta.fasilitas || programMeta.fasilitas.length === 0) ? (
                      <div className="py-6 text-center text-xs text-[#9CA3AF] border border-dashed border-[#E3E7EE] rounded-xl bg-[#F8FAFC]">
                        Belum ada fasilitas terdaftar. Klik tombol &ldquo;Tambah Fasilitas&rdquo; di atas untuk menambahkan.
                      </div>
                    ) : (
                      programMeta.fasilitas.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E3E7EE] space-y-2.5 relative hover:border-[#3E5FD1]/40 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#1F2F6B] flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-[#3E5FD1]" />
                              Fasilitas #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFasilitas(idx)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                              title="Hapus fasilitas ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={item.nama}
                              onChange={(e) => handleUpdateFasilitas(idx, 'nama', e.target.value)}
                              placeholder="Nama Fasilitas (contoh: Ruang Kelas Ber-AC & Nyaman)"
                              className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg text-xs font-bold text-[#111827]"
                            />
                          </div>

                          <div>
                            <textarea
                              rows={2}
                              value={item.deskripsi}
                              onChange={(e) => handleUpdateFasilitas(idx, 'deskripsi', e.target.value)}
                              placeholder="Uraian kondisi dan manfaat fasilitas bagi santri..."
                              className="w-full p-2 bg-white border border-[#E3E7EE] rounded-lg text-xs text-[#374151]"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: PPDB, BIAYA & UNDUHAN (Khusus Pendidikan - Gambar 2 & 3) */}
              {isPendidikan && activeTab === 'pendaftaran' && (
                <div className="space-y-5">
                  <div className="bg-[#EEF2FC] p-3.5 rounded-xl border border-[#3E5FD1]/20 flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-[#3E5FD1] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#1F2F6B]">
                        PPDB, Biaya, Berkas Unduhan &amp; Kontak (Gambar 2 &amp; 3)
                      </h4>
                      <p className="text-[11px] text-[#4B5563] mt-0.5 leading-relaxed">
                        Atur status gelombang pendaftaran, biaya, banner pembukaan PPDB, link unduh brosur PDF &amp; formulir PDF, jam pelayanan, dan kontak WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Banner Pendaftaran Telah Dibuka (Gambar 2) */}
                  <div className="p-4 rounded-xl border border-[#E3E7EE] bg-white space-y-3">
                    <h5 className="font-bold text-xs text-[#1F2F6B] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#138A3A]" />
                      Banner Promosi Pendaftaran (Gambar 2)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Judul Banner Pendaftaran
                        </label>
                        <input
                          type="text"
                          value={programMeta.banner_pendaftaran_judul || 'Pendaftaran Santri Baru Telah Dibuka!'}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, banner_pendaftaran_judul: e.target.value })
                          }
                          placeholder="Pendaftaran Santri Baru Telah Dibuka!"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Status Gelombang
                        </label>
                        <input
                          type="text"
                          value={programMeta.status_pendaftaran || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, status_pendaftaran: e.target.value })
                          }
                          placeholder="Gelombang 1 Telah Dibuka"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-[#4B5563] mb-1">
                        Subjudul / Ajakan Banner Pendaftaran
                      </label>
                      <textarea
                        rows={2}
                        value={programMeta.banner_pendaftaran_subjudul || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, banner_pendaftaran_subjudul: e.target.value })
                        }
                        placeholder="Kuota terbatas untuk setiap jenjang kelas (KB & TK). Daftarkan putra-putri tercinta..."
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Nominal Biaya & Operasional */}
                  <div className="p-4 rounded-xl border border-[#E3E7EE] bg-white space-y-3">
                    <h5 className="font-bold text-xs text-[#1F2F6B]">
                      Rincian Biaya, Jadwal &amp; Jam Pelayanan PPDB
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Label Biaya (Kartu Beranda)
                        </label>
                        <input
                          type="text"
                          value={programMeta.biaya_label || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, biaya_label: e.target.value })
                          }
                          placeholder="Mulai Rp 50.000 / Santri"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Biaya Formulir / Observasi
                        </label>
                        <input
                          type="text"
                          value={programMeta.biaya_pendaftaran || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, biaya_pendaftaran: e.target.value })
                          }
                          placeholder="Rp 50.000"
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
                          placeholder="Rp 70.000 / bulan"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Jenjang &amp; Sasaran Usia
                        </label>
                        <input
                          type="text"
                          value={programMeta.target_usia || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, target_usia: e.target.value })
                          }
                          placeholder="Kelompok Bermain (3 – 4 Thn) & TK A/B (4 – 6 Thn)"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Waktu Belajar Santri
                        </label>
                        <input
                          type="text"
                          value={programMeta.waktu_belajar || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, waktu_belajar: e.target.value })
                          }
                          placeholder="Senin – Kamis: 07.30 – 11.00 WIB | Jumat: 07.30 – 10.00 WIB"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Jam Pelayanan PPDB (Gambar 3)
                        </label>
                        <input
                          type="text"
                          value={programMeta.jam_pelayanan || 'Senin – Jumat: 07.30 – 12.00 WIB'}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, jam_pelayanan: e.target.value })
                          }
                          placeholder="Senin – Jumat: 07.30 – 12.00 WIB"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Nomor WhatsApp Hotline PPDB (Gambar 3)
                        </label>
                        <input
                          type="text"
                          value={programMeta.kontak_wa || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, kontak_wa: e.target.value })
                          }
                          placeholder="6281219362077"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Pesan Otomatis WhatsApp (Draft Chat)
                        </label>
                        <input
                          type="text"
                          value={programMeta.pesan_wa || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, pesan_wa: e.target.value })
                          }
                          placeholder="Bismillah, saya ingin menanyakan pendaftaran santri baru..."
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#4B5563] mb-1">
                          Alamat Fisik Sekolah / TK PAUD (Gambar 3)
                        </label>
                        <input
                          type="text"
                          value={programMeta.alamat_sekolah || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, alamat_sekolah: e.target.value })
                          }
                          placeholder="Jl. Raya Cilodong No. 45, Kalimulya, Kec. Cilodong, Kota Depok"
                          className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Berkas Unduhan PDF: Brosur & Formulir (Gambar 3) */}
                  <div className="p-4 rounded-xl border border-[#E3E7EE] bg-[#F8FAFC] space-y-4">
                    <h5 className="font-bold text-xs text-[#1F2F6B] flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-[#3E5FD1]" />
                      Download Brosur &amp; Formulir Pendaftaran PDF (Gambar 3)
                    </h5>

                    {/* Brosur PDF */}
                    <div className="bg-white p-3 rounded-lg border border-[#E3E7EE] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#111827]">1. File Brosur Informasi (PDF)</span>
                        {programMeta.file_brosur && (
                          <span className="text-[10px] text-[#138A3A] font-bold">Terunggah</span>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={brosurInputRef}
                        onChange={handleBrosurUpload}
                        accept=".pdf"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={programMeta.file_brosur || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, file_brosur: e.target.value })
                          }
                          placeholder="URL Brosur PDF (atau unggah berkas)"
                          className="flex-1 p-2 bg-white border border-[#E3E7EE] rounded text-xs font-mono"
                        />
                        <button
                          type="button"
                          disabled={uploadingBrosur}
                          onClick={() => brosurInputRef.current?.click()}
                          className="px-3 py-2 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {uploadingBrosur ? 'Mengunggah...' : 'Upload PDF'}
                        </button>
                      </div>
                    </div>

                    {/* Formulir PDF */}
                    <div className="bg-white p-3 rounded-lg border border-[#E3E7EE] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#111827]">2. File Formulir Pendaftaran (PDF)</span>
                        {programMeta.file_formulir && (
                          <span className="text-[10px] text-[#138A3A] font-bold">Terunggah</span>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={formulirInputRef}
                        onChange={handleFormulirUpload}
                        accept=".pdf"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={programMeta.file_formulir || ''}
                          onChange={(e) =>
                            setProgramMeta({ ...programMeta, file_formulir: e.target.value })
                          }
                          placeholder="URL Formulir PDF (atau unggah berkas)"
                          className="flex-1 p-2 bg-white border border-[#E3E7EE] rounded text-xs font-mono"
                        />
                        <button
                          type="button"
                          disabled={uploadingFormulir}
                          onClick={() => formulirInputRef.current?.click()}
                          className="px-3 py-2 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {uploadingFormulir ? 'Mengunggah...' : 'Upload PDF'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: SYARAT & RUTINITAS (Khusus Pendidikan - Gambar 2 & 3) */}
              {isPendidikan && activeTab === 'syarat_rutinitas' && (
                <div className="space-y-6">
                  {/* Seksi Syarat Pendaftaran (Gambar 3) */}
                  <div className="space-y-3 p-4 rounded-xl border border-[#E3E7EE] bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#138A3A]" />
                        <h4 className="font-bold text-xs text-[#111827]">
                          Syarat Dokumen Pendaftaran Santri (Gambar 3)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSyarat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#138A3A] hover:bg-[#0E682B] text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Syarat</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(!programMeta.syarat_pendaftaran || programMeta.syarat_pendaftaran.length === 0) ? (
                        <div className="py-4 text-center text-xs text-[#9CA3AF] border border-dashed rounded-lg">
                          Belum ada syarat pendaftaran.
                        </div>
                      ) : (
                        programMeta.syarat_pendaftaran.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-1.5 bg-[#F8FAFC] rounded border">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleUpdateSyarat(idx, e.target.value)}
                              placeholder="Contoh: Mengisi formulir pendaftaran santri baru"
                              className="flex-1 p-1.5 bg-white border rounded text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSyarat(idx)}
                              className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Seksi Jadwal Rutinitas Santri (Gambar 2) */}
                  <div className="space-y-3 p-4 rounded-xl border border-[#E3E7EE] bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[#3E5FD1]" />
                        <h4 className="font-bold text-xs text-[#111827]">
                          Jadwal Rutinitas Santri Harian (Gambar 2)
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddKegiatan}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Jadwal</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(!programMeta.kegiatan_harian || programMeta.kegiatan_harian.length === 0) ? (
                        <div className="py-4 text-center text-xs text-[#9CA3AF] border border-dashed rounded-lg">
                          Belum ada jadwal rutinitas kegiatan.
                        </div>
                      ) : (
                        programMeta.kegiatan_harian.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-1.5 bg-[#F8FAFC] rounded border">
                            <input
                              type="text"
                              value={item.waktu}
                              onChange={(e) => handleUpdateKegiatan(idx, 'waktu', e.target.value)}
                              placeholder="07.30 – 08.00"
                              className="w-32 p-1.5 bg-white border rounded text-xs font-mono font-bold"
                            />
                            <input
                              type="text"
                              value={item.aktivitas}
                              onChange={(e) => handleUpdateKegiatan(idx, 'aktivitas', e.target.value)}
                              placeholder="Aktivitas santri / materi..."
                              className="flex-1 p-1.5 bg-white border rounded text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveKegiatan(idx)}
                              className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB PENYALURAN & TARGET (Khusus Program Sosial) */}
              {isSosial && activeTab === 'penyaluran' && (
                <div className="space-y-4">
                  <div className="bg-[#EEF2FC] p-3.5 rounded-xl border border-[#3E5FD1]/20 flex items-start gap-2.5">
                    <Calendar className="w-5 h-5 text-[#3E5FD1] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#1F2F6B]">
                        Informasi Pelaksanaan &amp; Penyaluran Sosial
                      </h4>
                      <p className="text-[11px] text-[#4B5563] mt-0.5">
                        Kelola sasaran penerima manfaat, waktu penyaluran bantuan, dan lokasi kegiatan sosial.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Target Penerima Manfaat
                      </label>
                      <input
                        type="text"
                        value={programMeta.target_penerima || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, target_penerima: e.target.value })
                        }
                        placeholder="Contoh: Dhuafa, anak yatim, jamaah shalat Jumat"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Jadwal &amp; Waktu Penyaluran
                      </label>
                      <input
                        type="text"
                        value={programMeta.jadwal_penyaluran || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, jadwal_penyaluran: e.target.value })
                        }
                        placeholder="Contoh: Setiap hari Jumat ba'da shalat Jumat"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">
                      Lokasi Distribusi / Penyaluran
                    </label>
                    <input
                      type="text"
                      value={programMeta.lokasi_kegiatan || ''}
                      onChange={(e) =>
                        setProgramMeta({ ...programMeta, lokasi_kegiatan: e.target.value })
                      }
                      placeholder="Contoh: Masjid-masjid sekitar dan wilayah pemukiman dhuafa"
                      className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* TAB JADWAL & LOKASI (Khusus Program Dakwah) */}
              {isDakwah && activeTab === 'jadwal_dakwah' && (
                <div className="space-y-4">
                  <div className="bg-[#EEF2FC] p-3.5 rounded-xl border border-[#3E5FD1]/20 flex items-start gap-2.5">
                    <Clock className="w-5 h-5 text-[#3E5FD1] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#1F2F6B]">
                        Informasi Jadwal &amp; Materi Kajian
                      </h4>
                      <p className="text-[11px] text-[#4B5563] mt-0.5">
                        Kelola informasi waktu pelaksanaan, asatidzah pemateri, dan kitab rujukan kajian.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Pemateri / Asatidzah
                      </label>
                      <input
                        type="text"
                        value={programMeta.pemateri_kajian || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, pemateri_kajian: e.target.value })
                        }
                        placeholder="Contoh: Asatidzah bermanhaj Salaf"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Kitab Rujukan
                      </label>
                      <input
                        type="text"
                        value={programMeta.kitab_kajian || ''}
                        onChange={(e) =>
                          setProgramMeta({ ...programMeta, kitab_kajian: e.target.value })
                        }
                        placeholder="Contoh: Kitab Tauhid, Syarah Ushul Tsalatsah"
                        className="w-full text-xs p-2 bg-white border border-[#E3E7EE] rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB PAKET INFAQ & SEDEKAH (Untuk Sosial, Dakwah, atau Lainnya) */}
              {activeTab === 'paket' && (
                <div className="space-y-4">
                  <div className="bg-[#EEF2FC] p-3.5 rounded-xl border border-[#3E5FD1]/20 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <PackageCheck className="w-5 h-5 text-[#3E5FD1] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-[#1F2F6B]">
                          Daftar Pilihan Paket Donasi &amp; Infaq
                        </h4>
                        <p className="text-[11px] text-[#4B5563] mt-0.5 leading-relaxed">
                          Sediakan variasi paket donasi (misal: Paket 1 Porsi Nasi Rp 15.000, Paket Beras, dsb) agar memudahkan para muhsinin.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPaket}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Paket</span>
                    </button>
                  </div>

                  {(!programMeta.paket_infaq || programMeta.paket_infaq.length === 0) ? (
                    <div className="py-6 text-center text-xs text-[#9CA3AF] border border-dashed border-[#E3E7EE] rounded-xl bg-[#F8FAFC]">
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
              )}

              {/* Footer Tombol Simpan */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E3E7EE]">
                <div className="text-[11px] text-[#6B7280]">
                  Kategori: <strong className="text-[#1F2F6B]">{programMeta.kategori || 'Umum'}</strong> • Klik simpan untuk menerapkan seluruh perubahan.
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-4 py-2 border border-[#E3E7EE] rounded-lg font-semibold text-xs text-[#374151] hover:bg-[#F3F4F6] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#138A3A] hover:bg-[#0E682B] text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Program...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Simpan Perubahan Program</span>
                      </>
                    )}
                  </button>
                </div>
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
