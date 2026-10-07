'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StarOrnament } from '@/components/ui/StarOrnament';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Email atau password salah.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setErrorMessage('Terjadi gangguan jaringan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1F2F6B] flex items-center justify-center text-white shadow-md mb-3">
            <StarOrnament size={32} className="text-[#FFF200]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F2F6B] tracking-tight">
            CMS Admin YIMI
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Masuk untuk mengelola konten dan dakwah yayasan
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#E3E7EE] p-8">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-[#FEE2E2] border border-[#FECACA] flex items-start space-x-3 text-[#991B1B]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-2">
                Alamat Email <span className="text-[#D7261E]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yimi.or.id"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3E7EE] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#374151] uppercase tracking-wider mb-2">
                Kata Sandi <span className="text-[#D7261E]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E3E7EE] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3E5FD1] focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#3E5FD1] hover:bg-[#1F2F6B] focus:ring-4 focus:ring-[#3E5FD1]/30 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-60 shadow-md shadow-[#3E5FD1]/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E3E7EE] text-center">
            <p className="text-xs text-[#6B7280]">
              Akses khusus pengelola Yayasan Insan Muslim Istiqomah.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-[#6B7280] hover:text-[#3E5FD1] transition flex items-center justify-center space-x-1"
          >
            <span>← Kembali ke Website Publik</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
