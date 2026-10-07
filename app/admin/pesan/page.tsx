'use client';

import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Trash2, Phone, Save } from 'lucide-react';
import { ContactInboxItem } from '@/lib/types';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminPesanPage() {
  const [messages, setMessages] = useState<ContactInboxItem[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactInboxItem | null>(null);
  const [catatanInput, setCatatanInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchMessages() {
      try {
        const res = await fetch('/api/admin/inbox');
        if (res.ok && !ignore) {
          const data = await res.json();
          const list = data.messages || [];
          setMessages(list);
          if (list.length > 0 && !selectedMessage) {
            setSelectedMessage(list[0]);
            setCatatanInput(list[0].catatan_internal || '');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Pesan Masuk Formulir Kontak</h2>
          <p className="text-xs text-[#6B7280]">
            Kelola pertanyaan, silaturahim, dan aspirasi jamaah melalui website resmi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Daftar Pesan */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E3E7EE] shadow-xs overflow-hidden flex flex-col h-[650px]">
          <div className="p-3 border-b border-[#E3E7EE] bg-[#F5F7FA] flex items-center justify-between text-xs font-semibold text-[#6B7280]">
            <span>Kotak Masuk ({messages.length})</span>
            <span>
              {messages.filter((m) => !m.dibaca).length} Belum Dibaca
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#E3E7EE]">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6B7280]">
                Belum ada pesan masuk.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    setCatatanInput(msg.catatan_internal || '');
                    if (!msg.dibaca) handleToggleRead(msg);
                  }}
                  className={`p-3.5 cursor-pointer transition ${
                    selectedMessage?.id === msg.id
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
                  <p className="text-xs text-[#4B5563] line-clamp-2 mt-1 font-normal">
                    {msg.pesan}
                  </p>
                  <span className="text-[10px] text-[#9CA3AF] block mt-1.5 font-mono">
                    {new Date(msg.created_at).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              ))
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
                    className="px-2.5 py-1.5 text-xs font-medium border border-[#E3E7EE] rounded-lg hover:bg-gray-50 flex items-center space-x-1 text-[#374151]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#138A3A]" />
                    <span>{selectedMessage.dibaca ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}</span>
                  </button>

                  <button
                    onClick={() => setConfirmDeleteId(selectedMessage.id)}
                    className="p-1.5 text-[#D7261E] hover:bg-[#FEE2E2] rounded-lg"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Isi Pesan */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Isi Pesan Silaturahim
                </label>
                <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] text-sm text-[#111827] leading-relaxed whitespace-pre-line">
                  {selectedMessage.pesan}
                </div>
              </div>

              {/* Balas Cepat via WhatsApp */}
              <div className="p-3 bg-[#EEF2FC] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#1F2F6B]">
                  Hubungi langsung jamaah bersangkutan melalui WhatsApp:
                </span>
                <a
                  href={`https://wa.me/${selectedMessage.kontak.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Assalamu'alaikum Warahmatullahi Wabarakatuh, Bapak/Ibu ${selectedMessage.nama}. Kami dari Pengurus Yayasan Insan Muslim Istiqomah (YIMI) merespons pesan silaturahim Anda...`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#2EE05A] hover:bg-[#138A3A] text-white font-bold rounded-lg transition"
                >
                  Balas via WhatsApp →
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
                    placeholder="Contoh: Sudah dihubungi oleh Ustadz via telepon tanggal 07/10..."
                    className="flex-1 text-xs p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
                  />
                  <button
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="px-4 py-2 bg-[#3E5FD1] text-white text-xs font-semibold rounded-lg flex items-center space-x-1"
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
