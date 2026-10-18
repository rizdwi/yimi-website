'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  MessageCircle,
  ExternalLink,
  Trash2,
  AlertCircle,
  RefreshCw,
  LandPlot,
  X,
  Check,
} from 'lucide-react';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { DonationCertificateModal, DonationReceiptData } from '@/components/donation/DonationCertificateModal';

interface DonationItem {
  id: string;
  ref_id: string;
  nama: string;
  nama_asli: string;
  is_anonim: boolean;
  email?: string;
  whatsapp: string;
  program: string;
  nominal: number;
  bank_tujuan: string;
  tanggal_transfer: string;
  bukti_transfer_url?: string;
  doa?: string;
  status: 'menunggu' | 'terverifikasi' | 'ditolak';
  dibaca: boolean;
  catatan_internal?: string;
  created_at: string;
}

interface SummaryData {
  total_count: number;
  total_nominal: number;
  menunggu_count: number;
  menunggu_nominal: number;
  terverifikasi_count: number;
  terverifikasi_nominal: number;
}

export default function AdminDonasiPage() {
  const [items, setItems] = useState<DonationItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    total_count: 0,
    total_nominal: 0,
    menunggu_count: 0,
    menunggu_nominal: 0,
    terverifikasi_count: 0,
    terverifikasi_nominal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'menunggu' | 'terverifikasi' | 'ditolak'>('all');
  const [programFilter, setProgramFilter] = useState('all');

  // Modal State
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [certData, setCertData] = useState<DonationReceiptData | null>(null);
  const [itemToVerify, setItemToVerify] = useState<DonationItem | null>(null);
  const [syncToLahan, setSyncToLahan] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<DonationItem | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/donasi');
      if (res.ok) {
        const data = await res.json();
        const list = data.donasi || data.donations || [];
        setItems(list);
        if (data.summary) {
          setSummary(data.summary);
        } else if (data.stats) {
          setSummary(data.stats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (
    item: DonationItem,
    newStatus: 'terverifikasi' | 'ditolak' | 'menunggu',
    syncLahan: boolean = false
  ) => {
    setProcessingId(item.id);
    setActionMessage(null);

    try {
      const res = await fetch('/api/admin/donasi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: newStatus,
          sync_to_lahan: syncLahan,
          nominal: item.nominal,
          program: item.program,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal memperbarui status');
      }

      setActionMessage({
        type: 'success',
        text: `Status donasi ${item.ref_id} berhasil diubah menjadi ${newStatus}.`,
      });

      // Update state locally
      setItems((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: newStatus } : d))
      );
      setItemToVerify(null);
      fetchData(); // Refresh metrics
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat update status';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setProcessingId(itemToDelete.id);
    try {
      const res = await fetch(`/api/admin/donasi?id=${encodeURIComponent(itemToDelete.id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Gagal menghapus catatan donasi');
      }

      setItems((prev) => prev.filter((d) => d.id !== itemToDelete.id));
      setItemToDelete(null);
      fetchData();
      setActionMessage({ type: 'success', text: 'Catatan donasi berhasil dihapus.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus catatan.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered List
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_asli.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ref_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.whatsapp.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesProgram = programFilter === 'all' || item.program === programFilter;

    return matchesSearch && matchesStatus && matchesProgram;
  });

  const uniquePrograms = Array.from(new Set(items.map((i) => i.program)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-yimi-blue-600" />
            <span>Konfirmasi Donasi &amp; Wakaf</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Verifikasi mutasi transfer donatur, unduh bukti transfer, dan cetak sertifikat/kuitansi digital resmi.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs transition disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center justify-between gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-2xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
            Total Konfirmasi Masuk
          </span>
          <div className="font-mono text-xl sm:text-2xl font-black text-neutral-900 mt-1">
            {formatRupiah(summary.total_nominal)}
          </div>
          <span className="text-xs text-neutral-500 mt-1 block">
            {summary.total_count} transaksi donasi tercatat
          </span>
        </div>

        <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Menunggu Verifikasi
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-amber-900 mt-1">
            {formatRupiah(summary.menunggu_nominal)}
          </div>
          <span className="text-xs text-amber-700 mt-1 block">
            {summary.menunggu_count} mutasi perlu dicek bank
          </span>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Terverifikasi &amp; Sah
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-900 mt-1">
            {formatRupiah(summary.terverifikasi_nominal)}
          </div>
          <span className="text-xs text-emerald-700 mt-1 block">
            {summary.terverifikasi_count} donasi telah masuk rekening
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama donatur, nomor WhatsApp, atau No. Registrasi…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-xs sm:text-sm text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-yimi-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-neutral-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu">Menunggu ({summary.menunggu_count})</option>
              <option value="terverifikasi">Terverifikasi</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          {uniquePrograms.length > 0 && (
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Program</option>
              {uniquePrograms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            Memuat daftar konfirmasi donasi…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <HeartHandshake className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-medium text-neutral-500">
              Tidak ada data konfirmasi donasi yang sesuai dengan pencarian atau filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Donatur &amp; Ref ID</th>
                  <th className="py-3 px-4">Program &amp; Nominal</th>
                  <th className="py-3 px-4">Bank &amp; Tanggal</th>
                  <th className="py-3 px-4">Bukti &amp; Doa</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredItems.map((item) => {
                  const isWakaf = item.program.toLowerCase().includes('lahan') || item.program.toLowerCase().includes('wakaf');

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-neutral-50/60 transition ${
                        item.status === 'menunggu' ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Donatur & Ref ID */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-neutral-900 text-xs sm:text-sm">
                          {item.nama}
                          {item.is_anonim && (
                            <span className="text-[10px] font-normal text-neutral-400 ml-1.5 italic">
                              (Asli: {item.nama_asli})
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-yimi-blue-700 font-bold mt-0.5">
                          {item.ref_id}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Assalamu’alaikum Warahmatullahi Wabarakatuh Bapak/Ibu ${item.nama_asli},\n\nTerima kasih atas konfirmasi donasi/wakaf Anda melalui website YIMI dengan nomor registrasi ${item.ref_id}.\n\nTim keuangan yayasan telah memverifikasi mutasi Anda. Jazakallahu khairan atas dukungan dakwah ini.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md"
                            title="Chat WhatsApp Donatur"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{item.whatsapp}</span>
                          </a>
                        </div>
                      </td>

                      {/* Program & Nominal */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-black text-neutral-900 text-xs sm:text-sm">
                          {formatRupiah(item.nominal)}
                        </div>
                        <div className="text-[11px] font-semibold text-neutral-600 mt-0.5">
                          {item.program}
                        </div>
                      </td>

                      {/* Bank & Tanggal */}
                      <td className="py-3.5 px-4 align-top text-neutral-600">
                        <div className="font-semibold text-neutral-800">
                          {item.bank_tujuan || 'BSI'}
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {formatTanggal(item.tanggal_transfer || item.created_at)}
                        </div>
                      </td>

                      {/* Bukti & Doa */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          {item.bukti_transfer_url ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProofUrl(item.bukti_transfer_url!)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-[11px] font-bold text-neutral-700 cursor-pointer transition"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Foto</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">
                              Tidak ada foto
                            </span>
                          )}
                        </div>
                        {item.doa && (
                          <p className="mt-1.5 text-[11px] text-neutral-600 italic line-clamp-2 max-w-xs bg-neutral-50 p-1.5 rounded-lg border border-neutral-200/60">
                            &ldquo;{item.doa}&rdquo;
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top text-center">
                        {item.status === 'terverifikasi' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terverifikasi</span>
                          </span>
                        )}
                        {item.status === 'menunggu' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Menunggu</span>
                          </span>
                        )}
                        {item.status === 'ditolak' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {item.status === 'menunggu' && (
                            <button
                              type="button"
                              onClick={() => {
                                setItemToVerify(item);
                                setSyncToLahan(isWakaf);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                              title="Verifikasi Donasi Ini"
                            >
                              Verifikasi
                            </button>
                          )}

                          {item.status !== 'terverifikasi' && item.status !== 'ditolak' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(item, 'ditolak', false)}
                              className="px-2 py-1 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-[11px] transition cursor-pointer"
                              title="Tolak Donasi"
                            >
                              Tolak
                            </button>
                          )}

                          {/* Tombol Kuitansi / Sertifikat */}
                          <button
                            type="button"
                            onClick={() => {
                              setCertData({
                                ref_id: item.ref_id,
                                nama: item.nama,
                                nama_asli: item.nama_asli,
                                is_anonim: item.is_anonim,
                                program: item.program,
                                nominal: item.nominal,
                                bank_tujuan: item.bank_tujuan,
                                tanggal_transfer: item.tanggal_transfer,
                                doa: item.doa,
                              });
                            }}
                            className="p-1 rounded-lg text-neutral-500 hover:text-yimi-blue-600 hover:bg-neutral-100 transition cursor-pointer"
                            title="Lihat / Cetak Kuitansi Resmi"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Lihat Foto Bukti Transfer */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl p-4 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 shrink-0">
              <h4 className="text-xs font-bold text-neutral-800">
                Bukti Mutasi Transfer Donatur
              </h4>
              <button
                type="button"
                onClick={() => setSelectedProofUrl(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center min-h-[300px]">
              <img
                src={selectedProofUrl}
                alt="Bukti Transfer Donasi"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="pt-2 text-right">
              <a
                href={selectedProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-yimi-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Gambar Asli</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Verifikasi */}
      {itemToVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Verifikasi Penerimaan Donasi
                </h3>
                <p className="text-xs text-neutral-500">
                  Pastikan dana telah masuk di mutasi rekening bank resmi yayasan.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Donatur:</span>
                <span className="font-bold text-neutral-800">{itemToVerify.nama_asli}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nominal:</span>
                <span className="font-mono font-bold text-emerald-700">{formatRupiah(itemToVerify.nominal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Program:</span>
                <span className="font-semibold text-neutral-800">{itemToVerify.program}</span>
              </div>
            </div>

            {/* Checkbox Sinkronkan ke Pembebasan Lahan jika relevan */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-yimi-blue-50/70 border border-yimi-blue-200/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncToLahan}
                onChange={(e) => setSyncToLahan(e.target.checked)}
                className="mt-0.5 rounded text-yimi-blue-600 focus:ring-yimi-blue-500"
              />
              <div className="text-xs">
                <span className="font-bold text-yimi-blue-900 block">
                  Otomatis Tambahkan ke Saldo Pembebasan Lahan
                </span>
                <span className="text-neutral-500 text-[11px] block mt-0.5">
                  Menambahkan riwayat mutasi di log pembebasan lahan dan memperbarui progress bar publik.
                </span>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToVerify(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processingId === itemToVerify.id}
                onClick={() => handleUpdateStatus(itemToVerify, 'terverifikasi', syncToLahan)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {processingId === itemToVerify.id ? 'Memproses…' : 'Ya, Verifikasi Donasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Hapus Catatan Donasi"
        message={`Apakah Anda yakin ingin menghapus catatan konfirmasi donasi dari ${itemToDelete?.nama_asli} (${itemToDelete?.ref_id})? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
        variant="danger"
      />

      {/* Modal Cetak Kuitansi / Sertifikat */}
      <DonationCertificateModal
        isOpen={!!certData}
        data={certData}
        onClose={() => setCertData(null)}
      />
    </div>
  );
}
