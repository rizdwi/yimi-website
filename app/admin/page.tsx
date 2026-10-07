'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  Inbox,
  LandPlot,
  ArrowUpRight,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

interface DashboardStats {
  draftNews: number;
  upcomingKajianCount: number;
  unreadMessages: number;
  landTarget: number;
  landCollected: number;
  lastPublished: string;
}

interface KajianItem {
  id: string;
  hari: string;
  tanggal: string;
  waktu: string;
  tema: string;
  pemateri: string;
  tempat: string;
  status: string;
}

interface ActivityItem {
  id: string;
  waktu: string;
  pengguna: string;
  modul: string;
  ringkasan: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingKajian, setUpcomingKajian] = useState<KajianItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setUpcomingKajian(data.upcomingKajian || []);
          setRecentActivities(data.recentActivities || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-[#E3E7EE]" />
          ))}
        </div>
      </div>
    );
  }

  const landTarget = stats?.landTarget || 1800000000;
  const landCollected = stats?.landCollected || 774000000;
  const landPercentage = Math.min(100, Math.round((landCollected / landTarget) * 100));

  return (
    <div className="space-y-8">
      {/* Pintasan Aksi Cepat */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E3E7EE]">
        <div>
          <h2 className="text-base font-bold text-[#111827]">Assalamu&apos;alaikum, Rizz</h2>
          <p className="text-xs text-[#6B7280]">
            Panel kendali data dan konten dakwah Yayasan Insan Muslim Istiqomah.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/berita"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#3E5FD1] hover:bg-[#1F2F6B] text-white text-xs font-semibold rounded-lg transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tulis Berita</span>
          </Link>
          <Link
            href="/admin/kajian"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#EEF2FC] hover:bg-[#3E5FD1] hover:text-white text-[#3E5FD1] text-xs font-semibold rounded-lg transition"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Kajian</span>
          </Link>
          <Link
            href="/admin/lahan"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#EEF2FC] hover:bg-[#3E5FD1] hover:text-white text-[#3E5FD1] text-xs font-semibold rounded-lg transition"
          >
            <LandPlot className="w-3.5 h-3.5" />
            <span>Update Wakaf</span>
          </Link>
        </div>
      </div>

      {/* 4 Kartu Statistik Utama (PRD F-DASH-01..03, design.md 5.10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Berita Draf */}
        <Link
          href="/admin/berita"
          className="bg-white p-5 rounded-xl border border-[#E3E7EE] hover:border-[#3E5FD1] transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Berita Draf
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] text-[#374151] flex items-center justify-center group-hover:bg-[#EEF2FC] group-hover:text-[#3E5FD1] transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#111827] tabular-nums">
              {stats?.draftNews || 0}
            </span>
            <span className="text-xs text-[#6B7280] group-hover:text-[#3E5FD1] flex items-center">
              Kelola <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </Link>

        {/* 2. Kajian Mendatang */}
        <Link
          href="/admin/kajian"
          className="bg-white p-5 rounded-xl border border-[#E3E7EE] hover:border-[#3E5FD1] transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Kajian Mendatang
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#111827] tabular-nums">
              {stats?.upcomingKajianCount || 0}
            </span>
            <span className="text-xs text-[#6B7280] group-hover:text-[#3E5FD1] flex items-center">
              Lihat <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </Link>

        {/* 3. Pesan Belum Dibaca */}
        <Link
          href="/admin/pesan"
          className="bg-white p-5 rounded-xl border border-[#E3E7EE] hover:border-[#3E5FD1] transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Pesan Masuk Baru
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                (stats?.unreadMessages || 0) > 0
                  ? 'bg-[#FFF200] text-[#1F2F6B]'
                  : 'bg-[#F3F4F6] text-[#374151]'
              }`}
            >
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#111827] tabular-nums">
              {stats?.unreadMessages || 0}
            </span>
            <span className="text-xs text-[#6B7280] group-hover:text-[#3E5FD1] flex items-center">
              Buka Inbox <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </Link>

        {/* 4. Progres Lahan */}
        <Link
          href="/admin/lahan"
          className="bg-white p-5 rounded-xl border border-[#E3E7EE] hover:border-[#3E5FD1] transition shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Capaian Wakaf
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FC] text-[#3E5FD1] flex items-center justify-center">
              <LandPlot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-[#111827] tabular-nums">
              {landPercentage}%
            </span>
            <span className="text-xs text-[#138A3A] font-semibold">
              {formatRupiah(landCollected)}
            </span>
          </div>
        </Link>
      </div>

      {/* Baris Status Lahan & Jadwal Mendatang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1 & 2: Jadwal Kajian Terdekat */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E7EE] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3E7EE]">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#3E5FD1]" />
              <h3 className="font-bold text-sm text-[#111827]">Jadwal Kajian Ilmiah Terdekat</h3>
            </div>
            <Link
              href="/admin/kajian"
              className="text-xs text-[#3E5FD1] hover:underline font-medium"
            >
              Semua Jadwal →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[#E3E7EE]">
            {upcomingKajian.length === 0 ? (
              <p className="text-xs text-[#6B7280] py-6 text-center">
                Belum ada jadwal kajian aktif mendatang.
              </p>
            ) : (
              upcomingKajian.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#1F2F6B]">
                        {item.hari}, {item.tanggal}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">({item.waktu})</span>
                      <AdminStatusBadge status={item.status} />
                    </div>
                    <p className="text-sm font-semibold text-[#111827]">{item.tema}</p>
                    <p className="text-xs text-[#6B7280]">Pemateri: {item.pemateri}</p>
                  </div>
                  <Link
                    href="/admin/kajian"
                    className="text-xs text-[#3E5FD1] hover:bg-[#EEF2FC] px-2 py-1 rounded-md font-medium shrink-0"
                  >
                    Edit
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 3: Status Progres Wakaf Pembebasan Lahan */}
        <div className="bg-white rounded-xl border border-[#E3E7EE] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-[#E3E7EE]">
              <LandPlot className="w-4 h-4 text-[#3E5FD1]" />
              <h3 className="font-bold text-sm text-[#111827]">Sentra Dakwah & Wakaf Lahan</h3>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-[#6B7280]">Terkumpul:</span>
                <span className="text-base font-extrabold text-[#1F2F6B]">
                  {formatRupiah(landCollected)}
                </span>
              </div>

              <div className="w-full bg-[#E3E7EE] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#2EE05A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${landPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-[#6B7280]">
                <span>Target: {formatRupiah(landTarget)}</span>
                <span className="font-bold text-[#138A3A]">{landPercentage}% tercapai</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E3E7EE]">
            <Link
              href="/admin/lahan"
              className="w-full block text-center py-2 px-3 bg-[#EEF2FC] hover:bg-[#3E5FD1] hover:text-white text-[#3E5FD1] rounded-lg text-xs font-semibold transition"
            >
              + Tambah Donasi Wakaf Masuk
            </Link>
          </div>
        </div>
      </div>

      {/* 10 Aktivitas Terakhir (PRD F-DASH-04) */}
      <div className="bg-white rounded-xl border border-[#E3E7EE] p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E3E7EE]">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#3E5FD1]" />
            <h3 className="font-bold text-sm text-[#111827]">10 Aktivitas Terakhir (Audit Log)</h3>
          </div>
          <Link
            href="/admin/riwayat"
            className="text-xs text-[#3E5FD1] hover:underline font-medium"
          >
            Lihat Semua Log →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-[#E3E7EE]">
          {recentActivities.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-6 text-center">
              Belum ada aktivitas tercatat.
            </p>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 rounded-md bg-[#EEF2FC] text-[#3E5FD1] font-semibold">
                    {act.modul}
                  </span>
                  <span className="text-[#374151] font-medium">{act.ringkasan}</span>
                </div>
                <span className="text-[#6B7280] tabular-nums shrink-0 ml-4">
                  {new Date(act.waktu).toLocaleString('id-ID', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
