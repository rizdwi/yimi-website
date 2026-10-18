'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Save, Building, CreditCard, Phone, Share2, Upload, Loader2, MapPin, Send, Bot } from 'lucide-react';
import { SiteSettings } from '@/lib/types';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Modal konfirmasi khusus perubahan rekening bank
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Upload Logo Yayasan
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadLogoYayasan(file: File) {
    if (!settings) return;
    setUploadingLogo(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Gagal mengunggah logo');
      }

      const updatedSettings = {
        ...settings,
        logo_yayasan: data.url,
        foto_yayasan: data.url,
      };

      setSettings(updatedSettings);

      // Otomatis simpan ke database agar logo langsung aktif di web publik!
      const saveRes = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (saveRes.ok) {
        setInitialSettings(updatedSettings);
        setMessage({
          type: 'success',
          text: 'Logo resmi yayasan berhasil diunggah dan langsung tersimpan ke sistem!',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Logo berhasil diunggah tapi belum tersimpan otomatis. Silakan klik tombol Simpan Pengaturan di bawah.',
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengunggah logo.');
    } finally {
      setUploadingLogo(false);
    }
  }

  // Upload QRIS Code
  const [uploadingQris, setUploadingQris] = useState(false);
  const qrisInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadQrisImage(file: File) {
    if (!settings) return;
    setUploadingQris(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Gagal mengunggah gambar QRIS');
      }

      const updatedSettings = {
        ...settings,
        qris_image: data.url,
      };

      setSettings(updatedSettings);

      const saveRes = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      if (saveRes.ok) {
        setInitialSettings(updatedSettings);
        setMessage({
          type: 'success',
          text: 'Gambar QRIS resmi yayasan berhasil diunggah dan langsung tersimpan ke sistem!',
        });
      } else {
        setMessage({
          type: 'error',
          text: 'QRIS berhasil diunggah tapi belum tersimpan otomatis. Silakan klik tombol Simpan Pengaturan di bawah.',
        });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengunggah QRIS.');
    } finally {
      setUploadingQris(false);
    }
  }

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/site-settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
            setInitialSettings(data.settings);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleSaveClick(e: React.FormEvent) {
    e.preventDefault();
    if (!settings || !initialSettings) return;

    // Cek apakah ada perubahan rekening bank
    const isBankChanged =
      settings.bank_1_rekening !== initialSettings.bank_1_rekening ||
      settings.bank_2_rekening !== initialSettings.bank_2_rekening ||
      settings.bank_1_nama !== initialSettings.bank_1_nama ||
      settings.bank_2_nama !== initialSettings.bank_2_nama;

    if (isBankChanged) {
      // Wajib konfirmasi perubahan rekening bank (PRD F-SITE-06 & design.md 7.2)
      setIsBankModalOpen(true);
    } else {
      executeSave();
    }
  }

  async function executeSave() {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    setIsBankModalOpen(false);

    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan pengaturan.' });
      } else {
        setMessage({ type: 'success', text: 'Pengaturan situs dan rekening berhasil disimpan.' });
        setInitialSettings(settings);
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi gangguan koneksi jaringan.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestTelegram() {
    if (!settings?.telegram_bot_token || !settings?.telegram_chat_id) {
      alert('Harap masukkan Token Bot dan Chat ID Telegram terlebih dahulu.');
      return;
    }
    setTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: settings.telegram_bot_token,
          chat_id: settings.telegram_chat_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTelegramTestResult({
          success: true,
          message: 'Pesan uji coba berhasil terkirim ke obrolan Telegram pengurus!',
        });
      } else {
        setTelegramTestResult({
          success: false,
          message: data.error || 'Gagal mengirim pesan uji coba.',
        });
      }
    } catch (err: unknown) {
      setTelegramTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Koneksi error ke server.',
      });
    } finally {
      setTestingTelegram(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#3E5FD1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-[#6B7280]">Memuat pengaturan situs…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
              : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSaveClick} className="space-y-6">
        {/* 1. Profil Umum Yayasan */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <Building className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">Identitas & Profil Yayasan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Nama Lengkap Yayasan <span className="text-[#D7261E]">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.nama_lengkap}
                onChange={(e) => setSettings({ ...settings, nama_lengkap: e.target.value })}
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Singkatan Yayasan
              </label>
              <input
                type="text"
                value={settings.singkatan}
                onChange={(e) => setSettings({ ...settings, singkatan: e.target.value })}
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Tagline Dakwah <span className="text-[#D7261E]">*</span>
            </label>
            <input
              type="text"
              required
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
            />
          </div>

          {/* Logo Resmi Yayasan (Satu-satunya Identitas Utama) */}
          <div className="pt-3 border-t border-neutral-100">
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Logo Resmi Yayasan (Lambang / Simbol)
            </label>
            <p className="text-[11px] text-neutral-500 mb-2.5">
              Logo ini otomatis tampil di <strong>Hero Section Beranda</strong>, <strong>Navbar</strong>, <strong>Footer</strong>, dan seluruh profil identitas yayasan.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-neutral-300 shrink-0 shadow-2xs flex items-center justify-center p-2">
                <Image
                  src={settings.logo_yayasan || settings.foto_yayasan || '/logo/logo-yimi.svg'}
                  alt="Logo Yayasan"
                  width={72}
                  height={72}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*,.svg"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await uploadLogoYayasan(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3E5FD1]" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#3E5FD1]" />
                    )}
                    <span>{uploadingLogo ? 'Mengunggah Logo...' : 'Pilih Logo dari Perangkat'}</span>
                  </button>
                  {(settings.logo_yayasan || settings.foto_yayasan) && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, logo_yayasan: '', foto_yayasan: '' })}
                      className="text-xs text-red-600 hover:underline px-2 py-1 cursor-pointer font-medium"
                    >
                      Reset ke Logo Default
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Atau tempel URL logo (https://...)"
                  value={settings.logo_yayasan || settings.foto_yayasan || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      logo_yayasan: e.target.value,
                      foto_yayasan: e.target.value,
                    })
                  }
                  className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg text-neutral-600 focus:ring-1 focus:ring-[#3E5FD1]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Kontak & Lokasi */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <Phone className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">Kontak & Operasional</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                WhatsApp Center (diawali +62 atau 08) <span className="text-[#D7261E]">*</span>
              </label>
              <input
                type="text"
                required
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="+62 812-3456-7890"
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Alamat Email Resmi <span className="text-[#D7261E]">*</span>
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="info@yimi.or.id"
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Alamat Lengkap Sekretariat <span className="text-[#D7261E]">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={settings.alamat}
              onChange={(e) => setSettings({ ...settings, alamat: e.target.value })}
              className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#374151] mb-1">
              Jam Operasional
            </label>
            <input
              type="text"
              value={settings.jam_operasional}
              onChange={(e) => setSettings({ ...settings, jam_operasional: e.target.value })}
              className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
            />
          </div>
        </div>

        {/* 3. Rekening Donasi (Dengan Validasi & Konfirmasi Khusus) */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#3E5FD1]" />
              <h3 className="font-bold text-base text-[#111827]">Rekening Donasi & Wakaf</h3>
            </div>
            <span className="text-xs bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-md font-semibold">
              Perubahan butuh konfirmasi
            </span>
          </div>

          {/* Rekening Bank 1 (BSI) */}
          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2F6B]">
              Rekening Utama 1 (Bank BSI)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={settings.bank_1_nama}
                  onChange={(e) => setSettings({ ...settings, bank_1_nama: e.target.value })}
                  className="w-full text-sm p-2 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={settings.bank_1_rekening}
                  onChange={(e) => setSettings({ ...settings, bank_1_rekening: e.target.value })}
                  className="w-full text-sm p-2 bg-white border border-[#E3E7EE] rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Atas Nama</label>
                <input
                  type="text"
                  value={settings.bank_1_an}
                  onChange={(e) => setSettings({ ...settings, bank_1_an: e.target.value })}
                  className="w-full text-sm p-2 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Rekening Bank 2 (Muamalat) */}
          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2F6B]">
              Rekening Alternatif 2 (Bank Muamalat)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={settings.bank_2_nama}
                  onChange={(e) => setSettings({ ...settings, bank_2_nama: e.target.value })}
                  className="w-full text-sm p-2 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={settings.bank_2_rekening}
                  onChange={(e) => setSettings({ ...settings, bank_2_rekening: e.target.value })}
                  className="w-full text-sm p-2 bg-white border border-[#E3E7EE] rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Atas Nama</label>
                <input
                  type="text"
                  value={settings.bank_2_an}
                  onChange={(e) => setSettings({ ...settings, bank_2_an: e.target.value })}
                  className="w-full text-sm p-2 bg-white border border-[#E3E7EE] rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* QRIS Code */}
          <div className="p-4 bg-[#F5F7FA] rounded-xl border border-[#E3E7EE] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F2F6B]">
              Kode QRIS Donasi Digital
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 bg-white border border-neutral-300 rounded-lg p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                <Image
                  src={settings.qris_image || '/images/qris-yimi.svg'}
                  alt="QRIS Donasi"
                  width={80}
                  height={80}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-2 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={qrisInputRef}
                    type="file"
                    accept="image/*,.svg"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await uploadQrisImage(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadingQris}
                    onClick={() => qrisInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs font-semibold text-neutral-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {uploadingQris ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3E5FD1]" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-[#3E5FD1]" />
                    )}
                    <span>{uploadingQris ? 'Mengunggah QRIS...' : 'Pilih Gambar QRIS dari Perangkat'}</span>
                  </button>
                  {settings.qris_image && settings.qris_image !== '/images/qris-yimi.svg' && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, qris_image: '/images/qris-yimi.svg' })}
                      className="text-xs text-red-600 hover:underline px-2 py-1 cursor-pointer font-medium"
                    >
                      Reset ke QRIS Default
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Atau tempel URL gambar QRIS (https://...)"
                  value={settings.qris_image || ''}
                  onChange={(e) => setSettings({ ...settings, qris_image: e.target.value })}
                  className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg text-neutral-600 focus:ring-1 focus:ring-[#3E5FD1]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Media Sosial */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <Share2 className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">Tautan Media Sosial Resmi</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#6B7280] mb-1">YouTube Channel URL</label>
              <input
                type="text"
                value={settings.sosmed?.youtube || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sosmed: { ...settings.sosmed, youtube: e.target.value },
                  })
                }
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Instagram URL</label>
              <input
                type="text"
                value={settings.sosmed?.instagram || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sosmed: { ...settings.sosmed, instagram: e.target.value },
                  })
                }
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Telegram Channel URL</label>
              <input
                type="text"
                value={settings.sosmed?.telegram || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sosmed: { ...settings.sosmed, telegram: e.target.value },
                  })
                }
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-[#6B7280] mb-1">Facebook Fanpage URL</label>
              <input
                type="text"
                value={settings.sosmed?.facebook || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    sosmed: { ...settings.sosmed, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 5. Google Maps & Pembayaran QRIS */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <MapPin className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">Google Maps &amp; Gambar Barcode QRIS</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                URL Embed Google Maps (Iframe Source URL)
              </label>
              <input
                type="text"
                value={settings.maps_embed || ''}
                onChange={(e) => setSettings({ ...settings, maps_embed: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-mono text-xs"
              />
              <p className="text-[11px] text-[#6B7280] mt-1">
                Buka Google Maps &gt; Bagikan &gt; Sematkan Peta &gt; Ambil link di dalam <code>src=&quot;...&quot;</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                URL Gambar Barcode QRIS Infaq
              </label>
              <input
                type="text"
                value={settings.qris_image || ''}
                onChange={(e) => setSettings({ ...settings, qris_image: e.target.value })}
                placeholder="/images/qris-yimi.svg atau https://..."
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-mono text-xs"
              />
              <p className="text-[11px] text-[#6B7280] mt-1">
                Gambar barcode QRIS yang tampil di halaman Donasi &amp; Pembebasan Lahan.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Notifikasi Otomatis Pengurus (Telegram Bot) */}
        <div className="bg-white p-6 rounded-xl border border-[#E3E7EE] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E7EE]">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-[#3E5FD1]" />
              <h3 className="font-bold text-base text-[#111827]">
                Notifikasi Pengurus (Telegram Bot)
              </h3>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md font-semibold">
              Real-time Alert
            </span>
          </div>

          <p className="text-xs text-[#6B7280] leading-relaxed">
            Bot Telegram akan otomatis mengirimkan notifikasi instan ke ruang obrolan pengurus setiap ada <strong>pesan kontak masuk</strong> atau <strong>konfirmasi donasi baru</strong> dari website.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Token Bot Telegram (dari @BotFather)
              </label>
              <input
                type="password"
                value={settings.telegram_bot_token || ''}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_bot_token: e.target.value })
                }
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz..."
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-mono text-xs"
              />
              <span className="text-[11px] text-[#6B7280] mt-1 block">
                Token API rahasia yang diberikan oleh bot resmi @BotFather di Telegram.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Chat ID Pengurus / Grup
              </label>
              <input
                type="text"
                value={settings.telegram_chat_id || ''}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_chat_id: e.target.value })
                }
                placeholder="-100123456789 atau ID user"
                className="w-full text-sm p-2.5 bg-white border border-[#E3E7EE] rounded-lg font-mono text-xs"
              />
              <span className="text-[11px] text-[#6B7280] mt-1 block">
                ID percakapan pribadi atau grup yayasan tempat notifikasi dikirimkan.
              </span>
            </div>
          </div>

          {telegramTestResult && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border ${
                telegramTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {telegramTestResult.message}
            </div>
          )}

          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-[#6B7280]">
              Pastikan bot sudah dimasukkan ke dalam grup dan memiliki izin kirim pesan.
            </span>
            <button
              type="button"
              disabled={testingTelegram || !settings.telegram_bot_token || !settings.telegram_chat_id}
              onClick={handleTestTelegram}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testingTelegram ? 'Menguji…' : 'Kirim Uji Coba Bot'}</span>
            </button>
          </div>
        </div>

        {/* Tombol Simpan Sticky Bottom */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-sm font-bold rounded-xl shadow-md transition flex items-center space-x-2 disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Menyimpan…' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Modal Dialog Konfirmasi Perubahan Rekening Bank (PRD F-SITE-06 & design.md 7.2) */}
      <ConfirmModal
        isOpen={isBankModalOpen}
        title="Konfirmasi Perubahan Rekening Bank"
        variant="warning"
        message={`Perhatian: Anda mengubah nomor atau nama rekening donasi yayasan.\n\nRekening Lama:\n• ${initialSettings?.bank_1_nama}: ${initialSettings?.bank_1_rekening} (${initialSettings?.bank_1_an})\n• ${initialSettings?.bank_2_nama}: ${initialSettings?.bank_2_rekening} (${initialSettings?.bank_2_an})\n\nRekening Baru:\n• ${settings.bank_1_nama}: ${settings.bank_1_rekening} (${settings.bank_1_an})\n• ${settings.bank_2_nama}: ${settings.bank_2_rekening} (${settings.bank_2_an})\n\nPastikan nomor rekening sudah benar sebelum menyimpan.`}
        confirmLabel="Ya, Simpan Rekening Baru"
        cancelLabel="Batal / Periksa Kembali"
        onConfirm={executeSave}
        onCancel={() => setIsBankModalOpen(false)}
        isLoading={saving}
      />
    </div>
  );
}
