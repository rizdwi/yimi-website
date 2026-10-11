'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Coins,
  Plus,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  ListOrdered,
  HelpCircle,
} from 'lucide-react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

interface PaketWakafItem {
  nama: string;
  nominal: number;
  deskripsi: string;
}

interface TahapanItem {
  nama: string;
  status: string;
  keterangan: string;
}

interface FaqItem {
  pertanyaan: string;
  jawaban: string;
}

interface CampaignMetadata {
  subjudul?: string;
  paket_judul?: string;
  paket_subjudul?: string;
  paket_wakaf?: PaketWakafItem[];
  rencana_judul?: string;
  rencana_subjudul?: string;
  rencana_penggunaan?: string[];
  tahapan_judul?: string;
  tahapan_subjudul?: string;
  tahapan?: TahapanItem[];
  faq_judul?: string;
  faq_subjudul?: string;
  faq?: FaqItem[];
}

interface CampaignData {
  id: string;
  judul: string;
  lokasi: string;
  luas_target_m2: number;
  harga_per_meter: number;
  target_dana: number;
  terkumpul: number;
  diperbarui_pada: string;
  metadata?: CampaignMetadata;
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
  const [activeTab, setActiveTab] = useState<'target' | 'paket' | 'tahapan' | 'rencana' | 'faq'>('target');
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

  // Tab Paket Wakaf State
  const [paketJudul, setPaketJudul] = useState('Pilihan Paket Wakaf Tanah');
  const [paketSubjudul, setPaketSubjudul] = useState('Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.');
  const [paketWakafList, setPaketWakafList] = useState<PaketWakafItem[]>([]);
  const [savingPaket, setSavingPaket] = useState(false);

  // Tab Tahapan Eksekusi State
  const [tahapanJudul, setTahapanJudul] = useState('Tahapan Eksekusi Lahan');
  const [tahapanSubjudul, setTahapanSubjudul] = useState('Transparansi progres pengikatan dan legalitas tanah wakaf yayasan.');
  const [tahapanList, setTahapanList] = useState<TahapanItem[]>([]);
  const [savingTahapan, setSavingTahapan] = useState(false);

  // Tab Peruntukan & Rencana State
  const [heroSubjudul, setHeroSubjudul] = useState('');
  const [rencanaJudul, setRencanaJudul] = useState('Peruntukan & Rencana Pembangunan');
  const [rencanaSubjudul, setRencanaSubjudul] = useState('Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam.');
  const [rencanaList, setRencanaList] = useState<string[]>([]);
  const [savingRencana, setSavingRencana] = useState(false);

  // Tab FAQ State
  const [faqJudul, setFaqJudul] = useState('Pertanyaan yang Sering Diajukan');
  const [faqSubjudul, setFaqSubjudul] = useState('Seputar pelaksanaan dan transparansi program wakaf tanah yayasan.');
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [savingFaq, setSavingFaq] = useState(false);

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

  function applyCampaignData(data: { campaign: CampaignData; updates?: LandUpdate[] }) {
    setCampaign(data.campaign);
    if (data.updates) setUpdates(data.updates);

    if (data.campaign) {
      setEditCampaignForm({
        judul: data.campaign.judul || '',
        lokasi: data.campaign.lokasi || '',
        luas_target_m2: data.campaign.luas_target_m2 || 0,
        harga_per_meter: data.campaign.harga_per_meter || 0,
        target_dana: data.campaign.target_dana || 0,
        terkumpul: data.campaign.terkumpul || 0,
      });

      const meta = (data.campaign.metadata || {}) as CampaignMetadata;
      setPaketJudul(meta.paket_judul || 'Pilihan Paket Wakaf Tanah');
      setPaketSubjudul(meta.paket_subjudul || 'Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.');
      setPaketWakafList(
        Array.isArray(meta.paket_wakaf)
          ? meta.paket_wakaf
          : [
              { nama: 'Paket 1/2 Meter Persegi', nominal: 750000, deskripsi: 'Infaq wakaf separuh meter persegi lahan dakwah' },
              { nama: 'Paket 1 Meter Persegi', nominal: 1500000, deskripsi: 'Infaq wakaf satu meter persegi lahan dakwah utuh' },
              { nama: 'Paket 2 Meter Persegi', nominal: 3000000, deskripsi: 'Infaq wakaf dua meter persegi lahan dakwah' },
              { nama: 'Infaq Bebas / Sukarela', nominal: 0, deskripsi: 'Nominal infaq tanpa batasan minimal sesuai kemampuan dan keikhlasan' },
            ]
      );

      setHeroSubjudul(meta.subjudul || 'Investasi Abadi Menuju Jannah Melalui Wakaf Lahan Dakwah dan Pendidikan Sunnah');
      setRencanaJudul(meta.rencana_judul || 'Peruntukan & Rencana Pembangunan');
      setRencanaSubjudul(meta.rencana_subjudul || 'Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam.');
      setRencanaList(
        Array.isArray(meta.rencana_penggunaan)
          ? meta.rencana_penggunaan
          : [
              'Pembangunan Masjid Jami\' YIMI berkapasitas 600 jamaah untuk shalat fardhu dan majelis taklim',
              'Penyediaan 4 ruang kelas representatif dan sarana bermain luar untuk santri TK/PAUD',
              'Ruang perpustakaan kitab syar\'i dan ruang talaqqi tahfidz Al-Qur\'an',
              'Kantor operasional sekretariat yayasan, posko kemanusiaan, dan area parkir jamaah',
            ]
      );
      setTahapanJudul(meta.tahapan_judul || 'Tahapan Eksekusi Lahan');
      setTahapanSubjudul(meta.tahapan_subjudul || 'Transparansi progres pengikatan dan legalitas tanah wakaf yayasan.');
      setTahapanList(
        Array.isArray(meta.tahapan)
          ? meta.tahapan
          : [
              { nama: 'Tahap 1: Pembayaran DP & Tanda Jadi', status: 'Selesai', keterangan: 'Perjanjian pengikatan jual beli (PPJB) dan verifikasi legalitas berkas di hadapan notaris.' },
              { nama: 'Tahap 2: Angsuran Termin Pertama (40%)', status: 'Selesai', keterangan: 'Dana terhimpun dan diserahkan kepada pihak pemilik lahan dengan tanda terima resmi.' },
              { nama: 'Tahap 3: Pelunasan Sisa Lahan (60%)', status: 'Sedang Berjalan', keterangan: 'Penggalangan dana terus dibuka untuk melunasi sisa pembayaran lahan sebelum batas tempo.' },
              { nama: 'Tahap 4: Pengurusan Akta Ikrar Wakaf (AIW)', status: 'Akan Datang', keterangan: 'Penerbitan Akta Ikrar Wakaf resmi melalui KUA dan pendaftaran sertifikat ke Badan Wakaf Indonesia (BWI).' },
            ]
      );
      setFaqJudul(meta.faq_judul || 'Pertanyaan yang Sering Diajukan');
      setFaqSubjudul(meta.faq_subjudul || 'Seputar pelaksanaan dan transparansi program wakaf tanah yayasan.');
      setFaqList(
        Array.isArray(meta.faq)
          ? meta.faq
          : [
              { pertanyaan: 'Bagaimana status legalitas lahan yang dibebaskan?', jawaban: 'Lahan berstatus Sertifikat Hak Milik (SHM) yang bebas dari sengketa. Seluruh proses pengikatan dan pelunasan didampingi notaris PPAT resmi dan nantinya langsung dialihkan menjadi tanah wakaf bersertifikat resmi atas nama yayasan.' },
              { pertanyaan: 'Apakah donatur mendapatkan bukti tanda terima wakaf?', jawaban: 'Ya, setiap donatur yang melakukan konfirmasi via WhatsApp akan mendapatkan tanda terima / kwitansi digital resmi dari Bendahara Yayasan beserta sertifikat wakaf simbolis.' },
              { pertanyaan: 'Bolehkah berinfaq atas nama orang tua yang telah wafat?', jawaban: 'Boleh dan sangat dianjurkan. Berdasarkan hadits shahih, pahala sedekah/wakaf yang diniatkan untuk orang tua yang telah mendahului insya Allah tetap sampai kepada beliau.' },
            ]
      );
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/lahan');
      if (!res.ok) throw new Error('Gagal memuat data kampanye lahan.');
      const data = await res.json();
      applyCampaignData(data);
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
          applyCampaignData(data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan memuat data.');
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

  async function handleSavePaket(e: React.FormEvent) {
    e.preventDefault();
    setSavingPaket(true);
    try {
      const currentMeta = (campaign?.metadata || {}) as CampaignMetadata;
      const updatedMeta: CampaignMetadata = {
        ...currentMeta,
        paket_judul: paketJudul.trim(),
        paket_subjudul: paketSubjudul.trim(),
        paket_wakaf: paketWakafList,
      };

      const res = await fetch('/api/admin/lahan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: updatedMeta,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pilihan paket.');
      setCampaign(data.campaign);
      showToast('Pilihan Paket Wakaf berhasil diperbarui dan aktif di web publik!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan pilihan paket.');
    } finally {
      setSavingPaket(false);
    }
  }

  async function handleSaveTahapan(e: React.FormEvent) {
    e.preventDefault();
    setSavingTahapan(true);
    try {
      const currentMeta = (campaign?.metadata || {}) as CampaignMetadata;
      const updatedMeta: CampaignMetadata = {
        ...currentMeta,
        tahapan_judul: tahapanJudul.trim(),
        tahapan_subjudul: tahapanSubjudul.trim(),
        tahapan: tahapanList,
      };

      const res = await fetch('/api/admin/lahan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: updatedMeta,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan tahapan eksekusi lahan.');
      setCampaign(data.campaign);
      showToast('Tahapan Eksekusi Lahan berhasil diperbarui dan aktif di web publik!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan tahapan eksekusi.');
    } finally {
      setSavingTahapan(false);
    }
  }

  async function handleSaveRencana(e: React.FormEvent) {
    e.preventDefault();
    setSavingRencana(true);
    try {
      const currentMeta = (campaign?.metadata || {}) as CampaignMetadata;
      const updatedMeta: CampaignMetadata = {
        ...currentMeta,
        subjudul: heroSubjudul.trim(),
        rencana_judul: rencanaJudul.trim(),
        rencana_subjudul: rencanaSubjudul.trim(),
        rencana_penggunaan: rencanaList,
      };

      const res = await fetch('/api/admin/lahan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: updatedMeta,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan rencana peruntukan.');
      setCampaign(data.campaign);
      showToast('Peruntukan & Rencana Pembangunan berhasil diperbarui!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan rencana peruntukan.');
    } finally {
      setSavingRencana(false);
    }
  }

  async function handleSaveFaq(e: React.FormEvent) {
    e.preventDefault();
    setSavingFaq(true);
    try {
      const currentMeta = (campaign?.metadata || {}) as CampaignMetadata;
      const updatedMeta: CampaignMetadata = {
        ...currentMeta,
        faq_judul: faqJudul.trim(),
        faq_subjudul: faqSubjudul.trim(),
        faq: faqList,
      };

      const res = await fetch('/api/admin/lahan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: updatedMeta,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan FAQ.');
      setCampaign(data.campaign);
      showToast('Pertanyaan yang Sering Diajukan (FAQ) berhasil diperbarui!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menyimpan FAQ.');
    } finally {
      setSavingFaq(false);
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
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui catatan.');
      setEditingUpdate(null);
      showToast('Catatan update donasi berhasil diperbarui.');
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui catatan.');
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
            Kelola target luas &amp; dana, riwayat mutasi donasi, pilihan paket wakaf tanah, peruntukan, dan FAQ.
          </p>
        </div>
        {activeTab === 'target' && (
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
        )}
      </div>

      {/* Navigasi Tab Pengelompokan CMS Lahan */}
      <div className="flex items-center gap-2 border-b border-neutral-200 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('target')}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'target'
              ? 'border-[#1F2F6B] text-[#1F2F6B]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Target &amp; Riwayat Donasi</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paket')}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'paket'
              ? 'border-[#1F2F6B] text-[#1F2F6B]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Pilihan Paket Wakaf</span>
          <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1F2F6B]">
            {paketWakafList.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tahapan')}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'tahapan'
              ? 'border-[#1F2F6B] text-[#1F2F6B]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Tahapan Eksekusi Lahan</span>
          <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1F2F6B]">
            {tahapanList.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rencana')}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'rencana'
              ? 'border-[#1F2F6B] text-[#1F2F6B]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Peruntukan Lahan</span>
          <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1F2F6B]">
            {rencanaList.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'faq'
              ? 'border-[#1F2F6B] text-[#1F2F6B]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQ Wakaf Lahan</span>
          <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1F2F6B]">
            {faqList.length}
          </span>
        </button>
      </div>

      {/* Notifikasi Toast */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-3 animate-in fade-in">
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

      {/* TAB 1: TARGET & RIWAYAT DONASI */}
      {activeTab === 'target' && (
        <div className="space-y-6">
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
                <span>Ubah Target/Angka</span>
              </button>
            </div>

            {/* Grid Angka Metrik */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="text-xs text-neutral-500 block mb-1">Luas Target</span>
                <div className="text-lg font-bold text-[#111827]">
                  {Number(campaign?.luas_target_m2 || 0).toLocaleString('id-ID')} m²
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                <span className="text-xs text-neutral-500 block mb-1">Harga per Meter</span>
                <div className="text-lg font-bold text-[#111827]">
                  Rp {Number(campaign?.harga_per_meter || 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-4 bg-[#EEF2FC] rounded-xl border border-blue-100">
                <span className="text-xs text-[#3E5FD1] block mb-1 font-medium">Target Total Dana</span>
                <div className="text-lg font-extrabold text-[#1F2F6B]">
                  Rp {target.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs text-emerald-600 block mb-1 font-medium">Dana Terkumpul</span>
                <div className="text-lg font-extrabold text-emerald-700">
                  Rp {terkumpul.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-neutral-600">
                <span>Progres Pengumpulan Dana</span>
                <span className="text-emerald-700 font-bold">{persentase}%</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${persentase}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>Terkumpul: Rp {terkumpul.toLocaleString('id-ID')}</span>
                <span>Kekurangan: Rp {sisa.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Tabel Riwayat Update Donasi Masuk */}
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Riwayat Mutasi &amp; Donasi Masuk</h3>
                <p className="text-xs text-neutral-500">
                  Total {updates.length} catatan riwayat donasi tersimpan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUpdateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Catatan</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase bg-neutral-50/50">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Catatan / Keterangan</th>
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
        </div>
      )}

      {/* TAB 2: PILIHAN PAKET WAKAF TANAH */}
      {activeTab === 'paket' && (
        <form onSubmit={handleSavePaket} className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5 mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Pilihan Paket Wakaf Tanah</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Atur kartu pilihan nominal wakaf yang muncul di halaman publik pembebasan lahan (Gambar Pilihan Paket Wakaf Tanah).
                </p>
              </div>
              <button
                type="submit"
                disabled={savingPaket}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPaket ? 'Menyimpan...' : 'Simpan Pilihan Paket'}</span>
              </button>
            </div>

            {/* Header Seksi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50/70 border border-neutral-200/70 rounded-xl">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Judul Seksi Paket
                </label>
                <input
                  type="text"
                  required
                  value={paketJudul}
                  onChange={(e) => setPaketJudul(e.target.value)}
                  placeholder="Pilihan Paket Wakaf Tanah"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Subjudul Seksi Paket
                </label>
                <input
                  type="text"
                  required
                  value={paketSubjudul}
                  onChange={(e) => setPaketSubjudul(e.target.value)}
                  placeholder="Pahala jariyah yang abadi untuk Anda dan orang tua tercinta."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
            </div>

            {/* Tombol Tambah Paket */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#111827]">Daftar Kartu Paket ({paketWakafList.length} Item)</h3>
              <button
                type="button"
                onClick={() =>
                  setPaketWakafList([
                    ...paketWakafList,
                    {
                      nama: 'Paket Baru',
                      nominal: 500000,
                      deskripsi: 'Deskripsi singkat infaq wakaf lahan.',
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FC] hover:bg-blue-100 text-[#1F2F6B] rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Paket</span>
              </button>
            </div>

            {/* Kartu-Kartu Repeater Paket */}
            {paketWakafList.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-2xl">
                <p className="text-sm text-neutral-500 mb-3">
                  Belum ada pilihan paket wakaf tanah. Klik tombol di bawah untuk menambahkan.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setPaketWakafList([
                      {
                        nama: 'Paket 1 Meter Persegi',
                        nominal: 1500000,
                        deskripsi: 'Infaq wakaf satu meter persegi lahan dakwah utuh',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F2F6B] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Paket Pertama</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paketWakafList.map((pkt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-[#3E5FD1]/50 transition-colors relative flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-neutral-100 pb-2">
                        <span className="text-xs font-bold text-[#1F2F6B] bg-[#EEF2FC] px-2.5 py-0.5 rounded-full">
                          Kartu Paket #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPaketWakafList(paketWakafList.filter((_, i) => i !== idx))}
                          className="p-1 text-neutral-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                            Nama Paket
                          </label>
                          <input
                            type="text"
                            required
                            value={pkt.nama}
                            onChange={(e) => {
                              const updated = [...paketWakafList];
                              updated[idx].nama = e.target.value;
                              setPaketWakafList(updated);
                            }}
                            placeholder="Contoh: Paket 1/2 Meter Persegi"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                            Nominal (Rp) <span className="text-neutral-400 font-normal lowercase">(isi 0 untuk nominal bebas)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={pkt.nominal}
                            onChange={(e) => {
                              const updated = [...paketWakafList];
                              updated[idx].nominal = Number(e.target.value);
                              setPaketWakafList(updated);
                            }}
                            placeholder="750000"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                            Deskripsi Ringkas Paket
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={pkt.deskripsi}
                            onChange={(e) => {
                              const updated = [...paketWakafList];
                              updated[idx].deskripsi = e.target.value;
                              setPaketWakafList(updated);
                            }}
                            placeholder="Infaq wakaf separuh meter persegi lahan dakwah"
                            className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-5 mt-6 border-t border-neutral-100">
              <button
                type="submit"
                disabled={savingPaket}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingPaket ? 'Menyimpan...' : 'Simpan Pilihan Paket'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: TAHAPAN EKSEKUSI LAHAN */}
      {activeTab === 'tahapan' && (
        <form onSubmit={handleSaveTahapan} className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5 mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Tahapan Eksekusi Lahan</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Kelola transparansi nomor tahapan, nama, status badge (Selesai, Sedang Berjalan, Akan Datang), dan keterangan rincian alur legalitas.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingTahapan}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingTahapan ? 'Menyimpan...' : 'Simpan Tahapan Eksekusi'}</span>
              </button>
            </div>

            {/* Header Seksi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 mb-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Judul Seksi di Halaman Publik
                </label>
                <input
                  type="text"
                  required
                  value={tahapanJudul}
                  onChange={(e) => setTahapanJudul(e.target.value)}
                  placeholder="Tahapan Eksekusi Lahan"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Subjudul Seksi di Halaman Publik
                </label>
                <input
                  type="text"
                  required
                  value={tahapanSubjudul}
                  onChange={(e) => setTahapanSubjudul(e.target.value)}
                  placeholder="Transparansi progres pengikatan dan legalitas tanah wakaf yayasan."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-[#111827]">
                Daftar Kartu Tahapan ({tahapanList.length} Tahap)
              </h3>
              <button
                type="button"
                onClick={() =>
                  setTahapanList([
                    ...tahapanList,
                    {
                      nama: `Tahap ${tahapanList.length + 1}: Nama Tahapan Baru`,
                      status: 'Akan Datang',
                      keterangan: 'Keterangan rencana tahapan legalitas dan pelaksanaan.',
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FC] hover:bg-blue-100 text-[#1F2F6B] rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tahap Baru</span>
              </button>
            </div>

            {tahapanList.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-neutral-200 rounded-xl">
                <p className="text-neutral-500 text-sm mb-3">Belum ada tahapan eksekusi yang ditambahkan.</p>
                <button
                  type="button"
                  onClick={() =>
                    setTahapanList([
                      {
                        nama: 'Tahap 1: Pembayaran DP & Tanda Jadi',
                        status: 'Selesai',
                        keterangan: 'Perjanjian pengikatan jual beli (PPJB) dan verifikasi legalitas berkas di hadapan notaris.',
                      },
                    ])
                  }
                  className="px-3 py-1.5 bg-[#1F2F6B] text-white rounded-lg text-xs font-semibold"
                >
                  Tambah Tahap Pertama
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tahapanList.map((thp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/40 space-y-3.5 hover:border-[#3E5FD1]/40 transition-colors"
                  >
                    <div className="flex justify-between items-center border-b border-neutral-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-[#1F2F6B] bg-[#EEF2FC] px-2 py-0.5 rounded-md">
                          0{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-neutral-600">Kartu Tahapan #{idx + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTahapanList(tahapanList.filter((_, i) => i !== idx))}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Hapus Tahap Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                        Nama / Judul Tahapan
                      </label>
                      <input
                        type="text"
                        required
                        value={thp.nama}
                        onChange={(e) => {
                          const updated = [...tahapanList];
                          updated[idx].nama = e.target.value;
                          setTahapanList(updated);
                        }}
                        placeholder="Tahap 1: Pembayaran DP & Tanda Jadi"
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                        Status Eksekusi (Badge)
                      </label>
                      <select
                        value={thp.status}
                        onChange={(e) => {
                          const updated = [...tahapanList];
                          updated[idx].status = e.target.value;
                          setTahapanList(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm font-medium focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1] bg-white"
                      >
                        <option value="Selesai">Selesai (Hijau)</option>
                        <option value="Sedang Berjalan">Sedang Berjalan (Kuning)</option>
                        <option value="Akan Datang">Akan Datang (Abu-abu)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                        Rincian Keterangan / Progres
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={thp.keterangan}
                        onChange={(e) => {
                          const updated = [...tahapanList];
                          updated[idx].keterangan = e.target.value;
                          setTahapanList(updated);
                        }}
                        placeholder="Rincian keterangan progres pelaksanaan..."
                        className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1] bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-5 mt-6 border-t border-neutral-100">
              <button
                type="submit"
                disabled={savingTahapan}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingTahapan ? 'Menyimpan...' : 'Simpan Tahapan Eksekusi'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: PERUNTUKAN LAHAN */}
      {activeTab === 'rencana' && (
        <form onSubmit={handleSaveRencana} className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5 mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Peruntukan &amp; Rencana Pembangunan</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Atur subjudul hero banner, judul &amp; subjudul seksi peruntukan, serta poin-poin rencana pembangunan fasilitas ibadah dan pendidikan.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingRencana}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingRencana ? 'Menyimpan...' : 'Simpan Peruntukan Lahan'}</span>
              </button>
            </div>

            {/* Subjudul Hero */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Subjudul Kampanye (Banner Hero Atas)
              </label>
              <textarea
                rows={2}
                value={heroSubjudul}
                onChange={(e) => setHeroSubjudul(e.target.value)}
                placeholder="Investasi Abadi Menuju Jannah Melalui Wakaf Lahan Dakwah dan Pendidikan Sunnah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>

            {/* Header Seksi Peruntukan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 mb-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Judul Seksi di Halaman Publik
                </label>
                <input
                  type="text"
                  required
                  value={rencanaJudul}
                  onChange={(e) => setRencanaJudul(e.target.value)}
                  placeholder="Peruntukan & Rencana Pembangunan"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Subjudul Seksi di Halaman Publik
                </label>
                <input
                  type="text"
                  required
                  value={rencanaSubjudul}
                  onChange={(e) => setRencanaSubjudul(e.target.value)}
                  placeholder="Setiap jengkal tanah wakaf ini akan dimakmurkan untuk ibadah dan kaderisasi generasi Islam."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-[#111827]">
                Poin Pembangunan &amp; Peruntukan ({rencanaList.length} Poin)
              </h3>
              <button
                type="button"
                onClick={() => setRencanaList([...rencanaList, 'Rencana pembangunan fasilitas dakwah baru'])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FC] hover:bg-blue-100 text-[#1F2F6B] rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Poin</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {rencanaList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400 w-6 text-center">{idx + 1}.</span>
                  <input
                    type="text"
                    required
                    value={item}
                    onChange={(e) => {
                      const updated = [...rencanaList];
                      updated[idx] = e.target.value;
                      setRencanaList(updated);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-1 focus:ring-[#3E5FD1]"
                  />
                  <button
                    type="button"
                    onClick={() => setRencanaList(rencanaList.filter((_, i) => i !== idx))}
                    className="p-2 text-neutral-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Poin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-5 mt-6 border-t border-neutral-100">
              <button
                type="submit"
                disabled={savingRencana}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingRencana ? 'Menyimpan...' : 'Simpan Peruntukan Lahan'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 5: FAQ WAKAF LAHAN */}
      {activeTab === 'faq' && (
        <form onSubmit={handleSaveFaq} className="space-y-6">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5 mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#111827]">Pertanyaan yang Sering Diajukan (FAQ)</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Kelola daftar tanya jawab seputar transparansi legalitas, sertifikat, dan rekening pembebasan lahan wakaf.
                </p>
              </div>
              <button
                type="submit"
                disabled={savingFaq}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingFaq ? 'Menyimpan...' : 'Simpan FAQ Wakaf'}</span>
              </button>
            </div>

            {/* Header Seksi FAQ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50/70 border border-neutral-200/80 mb-6">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Judul Seksi di Halaman Publik
                </label>
                <input
                  type="text"
                  required
                  value={faqJudul}
                  onChange={(e) => setFaqJudul(e.target.value)}
                  placeholder="Pertanyaan yang Sering Diajukan"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Subjudul Seksi di Halaman Publik
                </label>
                <input
                  type="text"
                  required
                  value={faqSubjudul}
                  onChange={(e) => setFaqSubjudul(e.target.value)}
                  placeholder="Seputar pelaksanaan dan transparansi program wakaf tanah yayasan."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-[#111827]">
                Daftar Pertanyaan &amp; Jawaban ({faqList.length} Item)
              </h3>
              <button
                type="button"
                onClick={() =>
                  setFaqList([
                    ...faqList,
                    {
                      pertanyaan: 'Pertanyaan baru seputar wakaf lahan?',
                      jawaban: 'Penjelasan dan jawaban resmi yayasan.',
                    },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FC] hover:bg-blue-100 text-[#1F2F6B] rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pertanyaan</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqList.map((fq, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                    <span className="text-xs font-bold text-neutral-500">FAQ #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setFaqList(faqList.filter((_, i) => i !== idx))}
                      className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                      Pertanyaan
                    </label>
                    <input
                      type="text"
                      required
                      value={fq.pertanyaan}
                      onChange={(e) => {
                        const updated = [...faqList];
                        updated[idx].pertanyaan = e.target.value;
                        setFaqList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                      Jawaban
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={fq.jawaban}
                      onChange={(e) => {
                        const updated = [...faqList];
                        updated[idx].jawaban = e.target.value;
                        setFaqList(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-5 mt-6 border-t border-neutral-100">
              <button
                type="submit"
                disabled={savingFaq}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1F2F6B] hover:bg-[#3E5FD1] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingFaq ? 'Menyimpan...' : 'Simpan FAQ Wakaf'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111827]">Catat Donasi Masuk</h3>
                  <p className="text-xs text-neutral-500">Catat mutasi penerimaan wakaf dari donatur</p>
                </div>
              </div>
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
                  Tanggal Donasi Masuk
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
                  placeholder="Contoh: 1500000"
                  value={addUpdateForm.nominal}
                  onChange={(e) => setAddUpdateForm({ ...addUpdateForm, nominal: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Catatan / Keterangan Donatur
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Hamba Allah - Wakaf 1 meter persegi untuk kedua orang tua"
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingUpdate ? 'Menyimpan...' : 'Simpan Mutasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Update Tertentu */}
      {editingUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FC] flex items-center justify-center text-[#1F2F6B]">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#111827]">Edit Catatan Donasi</h3>
                  <p className="text-xs text-neutral-500">Perbarui tanggal, nominal, atau catatan donasi</p>
                </div>
              </div>
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
                  Tanggal Donasi
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Catatan / Keterangan
                </label>
                <textarea
                  rows={3}
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
                  <span>{savingEditUpdate ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Update Donasi */}
      <ConfirmModal
        isOpen={deletingUpdateId !== null}
        title="Hapus Catatan Donasi Masuk"
        message="Apakah Anda yakin ingin menghapus catatan donasi ini? Data mutasi yang dihapus tidak dapat dipulihkan."
        confirmLabel="Ya, Hapus Catatan"
        cancelLabel="Batal"
        isLoading={deleting}
        onConfirm={handleDeleteUpdateConfirm}
        onCancel={() => setDeletingUpdateId(null)}
      />
    </div>
  );
}
