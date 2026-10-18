'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  CheckCircle2,
  Trash2,
  Phone,
  Save,
  HeartHandshake,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { ContactInboxItem } from '@/lib/types';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { formatRupiah, formatTanggal } from '@/lib/format';

interface ParsedDonasiPayload {
  ref_id?: string;
  nama_asli?: string;
  is_anonim?: boolean;
  nama_tampil?: string;
  whatsapp?: string;
  program?: string;
  nominal?: number;
  bank_tujuan?: string;
  tanggal_transfer?: string;
  bukti_transfer_url?: string | null;
  doa?: string | null;
}

function parsePayload(pesan?: string): ParsedDonasiPayload | null {
  if (!pesan || typeof pesan !== 'string') return null;
  const trimmed = pesan.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === 'object' && (obj.ref_id || obj.nominal !== undefined || obj.bank_tujuan)) {
      return obj;
    }
  } catch {
    // bukan json donasi
  }
  return null;
}

export default function AdminPesanPage() {
  const [messages, setMessages] = useState<ContactInboxItem[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactInboxItem | null>(null);
  const [catatanInput, setCatatanInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'kontak' | 'donasi'>('all');

  useEffect(() => {
    let ignore = false;
    async function fetchMessages() {
      try {
        const res = await fetch('/api/admin/inbox');
        if (res.ok && !ignore) {
          const data = await res.json();
          const list = data.messages || [];
          setMessages(list);
          if (list.length > 0) {
            setSelectedMessage((prev) => {
              if (!prev) {
                setCatatanInput(list[0].catatan_internal || '');
                return list[0];
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchMessages();
    return () => {
      ignore = true;
    };
  }, []);

  async function reloadMessages() {
    try {
      const res = await fetch('/api/admin/inbox');
      if (res.ok) {
        const data = await res.json();
        const list = data.messages || [];
        setMessages(list);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleRead(msg: ContactInboxItem) {
    try {
      const newStatus = !msg.dibaca;
      await fetch('/api/admin/inbox', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msg.id, dibaca: newStatus }),
      });
      reloadMessages();
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, dibaca: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveNote() {
    if (!selectedMessage) return;
    setSavingNote(true);
    try {
      await fetch('/api/admin/inbox', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMessage.id,
          dibaca: true,
          catatan_internal: catatanInput,
        }),
      });
      reloadMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDeleteMessage() {
    if (!confirmDeleteId) return;
    try {
      await fetch(`/api/admin/inbox?id=${confirmDeleteId}`, { method: 'DELETE' });
      setConfirmDeleteId(null);
      setSelectedMessage(null);
      reloadMessages();
    } catch (err) {
      console.error(err);
    }
  }

  const isDonation = (msg: ContactInboxItem) => {
    return (
      Boolean(msg.kategori?.toLowerCase().includes('donasi')) ||
      Boolean(msg.pesan && msg.pesan.trim().startsWith('{') && msg.pesan.includes('ref_id'))
    );
  };

  const countDonasi = messages.filter(isDonation).length;
  const countKontak = messages.filter((m) => !isDonation(m)).length;

  const filteredMessages = messages.filter((msg) => {
    if (filterTab === 'kontak') return !isDonation(msg);
    if (filterTab === 'donasi') return isDonation(msg);
    return true;
  });

  const parsedActiveDonation = selectedMessage ? parsePayload(selectedMessage.pesan) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Pesan Masuk &amp; Silaturahim</h2>
          <p className="text-xs text-[#6B7280]">
            Kelola pertanyaan, silaturahim jamaah, dan notifikasi konfirmasi donasi website.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Daftar Pesan */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E3E7EE] shadow-xs overflow-hidden flex flex-col h-[680px]">
          {/* Header Kotak Masuk */}
          <div className="p-3 border-b border-[#E3E7EE] bg-[#F5F7FA] flex items-center justify-between text-xs font-semibold text-[#6B7280]">
            <span>Kotak Masuk ({messages.length})</span>
            <span>
              {messages.filter((m) => !m.dibaca).length} Belum Dibaca
            </span>
          </div>

          {/* Filter Pengelompokan Tab */}
          <div className="flex border-b border-[#E3E7EE] bg-[#F5F7FA] text-xs">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-2 px-1 text-center font-semibold transition border-b-2 cursor-pointer ${
                filterTab === 'all'
                  ? 'border-[#3E5FD1] text-[#3E5FD1] bg-white'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Semua ({messages.length})
            </button>
            <button
              onClick={() => setFilterTab('kontak')}
              className={`flex-1 py-2 px-1 text-center font-semibold transition border-b-2 cursor-pointer ${
                filterTab === 'kontak'
                  ? 'border-[#3E5FD1] text-[#3E5FD1] bg-white'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Silaturahim ({countKontak})
            </button>
            <button
              onClick={() => setFilterTab('donasi')}
              className={`flex-1 py-2 px-1 text-center font-semibold transition border-b-2 cursor-pointer ${
                filterTab === 'donasi'
                  ? 'border-[#3E5FD1] text-[#3E5FD1] bg-white'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Donasi ({countDonasi})
            </button>
          </div>

          {/* List Item Pesan */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E3E7EE]">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B7280]">
                {filterTab === 'donasi'
                  ? 'Tidak ada rekaman konfirmasi donasi.'
                  : filterTab === 'kontak'
                  ? 'Tidak ada pesan silaturahim.'
                  : 'Belum ada pesan masuk.'}
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const donasiData = parsePayload(msg.pesan);
                const isSelected = selectedMessage?.id === msg.id;

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setCatatanInput(msg.catatan_internal || '');
                      if (!msg.dibaca) handleToggleRead(msg);
                    }}
                    className={`p-3.5 cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#EEF2FC] border-l-4 border-[#3E5FD1]'
                        : msg.dibaca
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-[#FFF200]/10 font-bold hover:bg-[#FFF200]/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-[#111827] block truncate">
                        {msg.nama}
                      </span>
                      {!msg.dibaca && (
                        <span className="w-2 h-2 rounded-full bg-[#3E5FD1] shrink-0 mt-1" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#6B7280] block truncate">{msg.kontak}</span>

                    {/* Preview Cuplikan Teks yang Manusiawi */}
                    {donasiData ? (
                      <div className="mt-1.5 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2F6B]">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            Donasi {formatRupiah(donasiData.nominal || 0)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4B5563] truncate mt-0.5 font-normal">
                          {donasiData.doa
                            ? `"${donasiData.doa}"`
                            : donasiData.program || 'Konfirmasi transfer donasi'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#4B5563] line-clamp-2 mt-1 font-normal">
                        {msg.pesan}
                      </p>
                    )}

                    <span className="text-[10px] text-[#9CA3AF] block mt-1.5 font-mono">
                      {new Date(msg.created_at).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Detail Pesan Aktif */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E7EE] shadow-xs p-6 flex flex-col justify-between">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Header Pesan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E3E7EE] gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#111827]">
                    {selectedMessage.nama}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-[#6B7280] mt-1">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-[#3E5FD1]" />
                      <span className="font-mono">{selectedMessage.kontak}</span>
                    </span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#EEF2FC] text-[#3E5FD1] font-semibold text-[10px]">
                      Kategori: {selectedMessage.kategori}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleRead(selectedMessage)}
                    className="px-2.5 py-1.5 text-xs font-medium border border-[#E3E7EE] rounded-lg hover:bg-gray-50 flex items-center space-x-1 text-[#374151] cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#138A3A]" />
                    <span>{selectedMessage.dibaca ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}</span>
                  </button>

                  <button
                    onClick={() => setConfirmDeleteId(selectedMessage.id)}
                    className="p-1.5 text-[#D7261E] hover:bg-[#FEE2E2] rounded-lg cursor-pointer"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tampilan Isi Pesan Terformat Sesuai Tipe Data */}
              {parsedActiveDonation ? (
                /* 1. Jika Data Konfirmasi Donasi: Tampilkan Kartu Transaksi Rapi & Terbaca */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1F2F6B] uppercase tracking-wider flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" />
                      <span>Rincian Konfirmasi Donasi / Wakaf</span>
                    </label>
                    <Link
                      href="/admin/donasi"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3E5FD1] hover:underline"
                    >
                      <span>Buka Menu Konfirmasi Donasi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-[#F8FAFC] to-blue-50/30 rounded-2xl border border-[#D5DFEE] space-y-4">
                    {/* Ringkasan Grid Rapi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
                        <span className="text-neutral-400 block text-[11px] mb-0.5">Nomor Registrasi</span>
                        <strong className="text-sm font-mono text-[#1F2F6B]">
                          {parsedActiveDonation.ref_id || '-'}
                        </strong>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
                        <span className="text-neutral-400 block text-[11px] mb-0.5">Nominal Transfer</span>
                        <strong className="text-base font-extrabold text-emerald-700">
                          {formatRupiah(parsedActiveDonation.nominal || 0)}
                        </strong>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
                        <span className="text-neutral-400 block text-[11px] mb-0.5">Program Penyaluran</span>
                        <strong className="text-xs text-[#111827]">
                          {parsedActiveDonation.program || selectedMessage.kategori.replace('Konfirmasi Donasi: ', '')}
                        </strong>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
                        <span className="text-neutral-400 block text-[11px] mb-0.5">Bank Tujuan</span>
                        <strong className="text-xs text-[#111827]">
                          {parsedActiveDonation.bank_tujuan || 'Bank Syariah Indonesia (BSI)'}
                        </strong>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
                        <span className="text-neutral-400 block text-[11px] mb-0.5">Tanggal Transfer</span>
                        <strong className="text-xs text-[#111827]">
                          {parsedActiveDonation.tanggal_transfer
                            ? formatTanggal(parsedActiveDonation.tanggal_transfer)
                            : '-'}
                        </strong>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
                        <span className="text-neutral-400 block text-[11px] mb-0.5">Tampilan Nama</span>
                        <strong className="text-xs text-[#111827]">
                          {parsedActiveDonation.is_anonim ? 'Hamba Allah (Anonim)' : 'Nama Terbuka'}
                        </strong>
                      </div>
                    </div>

                    {/* Lampiran Bukti Transfer */}
                    {parsedActiveDonation.bukti_transfer_url && (
                      <div className="p-3 bg-white rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs">
                        <span className="text-neutral-600 font-medium">Lampiran Bukti Transfer:</span>
                        <a
                          href={parsedActiveDonation.bukti_transfer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FC] text-[#3E5FD1] hover:bg-blue-100 rounded-lg font-semibold transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Lampiran Bukti</span>
                        </a>
                      </div>
                    )}

                    {/* Pesan / Doa Donatur */}
                    <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 space-y-1">
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                        Pesan &amp; Doa Donatur
                      </span>
                      {parsedActiveDonation.doa ? (
                        <p className="text-xs text-[#111827] italic leading-relaxed border-l-2 border-emerald-500 pl-2.5 py-0.5">
                          &ldquo;{parsedActiveDonation.doa}&rdquo;
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">
                          (Donatur tidak menyertakan pesan atau doa khusus)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. Jika Pesan Silaturahim Normal: Tampilkan Format Pesan Jamaah */
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#3E5FD1]" />
                    <span>Isi Pesan Silaturahim</span>
                  </label>
                  <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] text-sm text-[#111827] leading-relaxed whitespace-pre-line">
                    {selectedMessage.pesan}
                  </div>
                </div>
              )}

              {/* Balas Cepat via WhatsApp */}
              <div className="p-3 bg-[#EEF2FC] rounded-xl flex items-center justify-between text-xs gap-3">
                <span className="text-[#1F2F6B]">
                  {parsedActiveDonation
                    ? 'Konfirmasi donasi langsung ke donatur via WhatsApp:'
                    : 'Hubungi langsung jamaah bersangkutan melalui WhatsApp:'}
                </span>
                <a
                  href={`https://wa.me/${selectedMessage.kontak.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    parsedActiveDonation
                      ? `Assalamu'alaikum Warahmatullahi Wabarakatuh, Bapak/Ibu ${selectedMessage.nama}.\n\nKami dari Pengurus Yayasan Insan Muslim Istiqomah (YIMI) mengonfirmasi bahwa pendaftaran konfirmasi wakaf/donasi Anda [No. Ref: ${parsedActiveDonation.ref_id || '-'}] untuk program "${parsedActiveDonation.program || ''}" sebesar ${formatRupiah(parsedActiveDonation.nominal || 0)} telah kami terima dalam sistem.\n\nJazakumullahu khairan katsiran atas infaq/wakaf yang disalurkan. Semoga Allah Ta'ala memberkahi harta dan keluarga Anda.`
                      : `Assalamu'alaikum Warahmatullahi Wabarakatuh, Bapak/Ibu ${selectedMessage.nama}. Kami dari Pengurus Yayasan Insan Muslim Istiqomah (YIMI) merespons pesan silaturahim Anda melalui website resmi...`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#2EE05A] hover:bg-[#138A3A] text-white font-bold rounded-lg transition shrink-0 inline-flex items-center gap-1.5"
                >
                  <span>Balas via WhatsApp →</span>
                </a>
              </div>

              {/* Catatan Internal Admin (PRD F-MSG-03) */}
              <div className="space-y-2 pt-4 border-t border-[#E3E7EE]">
                <label className="text-xs font-semibold text-[#374151] block">
                  Catatan Tindak Lanjut Internal (Hanya dilihat pengurus)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={catatanInput}
                    onChange={(e) => setCatatanInput(e.target.value)}
                    placeholder="Contoh: Sudah dikonfirmasi pengurus via telepon..."
                    className="flex-1 text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="px-4 py-2 bg-[#3E5FD1] text-white text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingNote ? 'Menyimpan…' : 'Simpan Catatan'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#6B7280] text-xs">
              <Mail className="w-10 h-10 text-[#CBD5E1] mb-2" />
              <span>Pilih salah satu pesan di sebelah kiri untuk membaca detail.</span>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        title="Hapus Pesan Masuk"
        variant="danger"
        message="Hapus pesan kontak ini secara permanen dari basis data?"
        confirmLabel="Hapus Pesan"
        onConfirm={handleDeleteMessage}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
