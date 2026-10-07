'use client';

import React, { useState } from 'react';
import { Lock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminAkunPage() {
  const router = useRouter();
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (passwordBaru !== konfirmasiPassword) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    if (passwordBaru.length < 8) {
      setMessage({ type: 'error', text: 'Password baru minimal 8 karakter.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordLama, passwordBaru }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Gagal mengubah password.' });
      } else {
        setMessage({ type: 'success', text: 'Password akun berhasil diubah!' });
        setPasswordLama('');
        setPasswordBaru('');
        setKonfirmasiPassword('');
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi gangguan jaringan.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#111827]">Pengaturan Akun & Keamanan</h2>
        <p className="text-xs text-[#6B7280]">
          Kelola kredensial login, kata sandi pengelola yayasan, dan sesi aktif.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom 1: Profil Akun */}
        <div className="bg-white rounded-xl border border-[#E3E7EE] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-[#E3E7EE]">
            <div className="w-12 h-12 rounded-full bg-[#1F2F6B] text-white flex items-center justify-center font-bold text-lg">
              R
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Rizz</h3>
              <p className="text-xs text-[#6B7280]">Pengelola Utama (Admin)</p>
            </div>
          </div>

          <div className="text-xs space-y-2 text-[#4B5563]">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Email Akses:</span>
              <span className="font-semibold text-[#111827]">admin@yimi.or.id</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Peran:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] font-semibold text-[11px]">
                Super Admin
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Masa Sesi:</span>
              <span className="font-medium">8 Jam Aktif</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E3E7EE]">
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 text-xs font-semibold text-[#D7261E] bg-[#FEE2E2] hover:bg-[#FECACA] rounded-lg transition flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dari Panel Admin</span>
            </button>
          </div>
        </div>

        {/* Kolom 2 & 3: Ganti Kata Sandi */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E3E7EE] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
            <Lock className="w-5 h-5 text-[#3E5FD1]" />
            <h3 className="font-bold text-base text-[#111827]">Perbarui Kata Sandi</h3>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                  : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#374151] mb-1">
                Kata Sandi Lama <span className="text-[#D7261E]">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordLama}
                onChange={(e) => setPasswordLama(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Kata Sandi Baru (Min. 8 Karakter) <span className="text-[#D7261E]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1">
                  Konfirmasi Kata Sandi Baru <span className="text-[#D7261E]">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-white border border-[#E3E7EE] rounded-lg focus:ring-2 focus:ring-[#3E5FD1]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-60"
              >
                {loading ? 'Menyimpan…' : 'Simpan Kata Sandi Baru'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
