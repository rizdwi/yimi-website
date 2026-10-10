'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Users,
  Eye,
  Calendar,
  Smartphone,
  Monitor,
  RefreshCw,
  Globe,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface TrafficData {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  todayUniques: number;
  weekViews: number;
  topPages: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  devices: {
    mobile: number;
    desktop: number;
  };
  recentVisits: {
    id: string;
    path: string;
    referrer: string;
    device_type: string;
    created_at: string;
  }[];
}

export default function AdminAnalitikPage() {
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTraffic = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/traffic');
      if (res.ok) {
        const data = await res.json();
        setTraffic(data.traffic);
      }
    } catch (err) {
      console.error('Failed to load traffic:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/admin/traffic');
        if (res.ok && !ignore) {
          const data = await res.json();
          setTraffic(data.traffic);
        }
      } catch (err) {
        console.error('Failed to load traffic:', err);
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

  function handleRefresh() {
    setRefreshing(true);
    loadTraffic();
  }

  const totalDevices = (traffic?.devices.mobile || 0) + (traffic?.devices.desktop || 0);
  const mobilePct =
    totalDevices > 0 ? Math.round(((traffic?.devices.mobile || 0) / totalDevices) * 100) : 0;
  const desktopPct =
    totalDevices > 0 ? Math.round(((traffic?.devices.desktop || 0) / totalDevices) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1F2F6B] flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5 text-[#3E5FD1]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">
                Traffic &amp; Statistik Pengunjung Web
              </h1>
              <p className="text-xs text-neutral-500">
                Pemantauan data lalu lintas pengunjung website Yayasan Insan Muslim Istiqomah dari luar secara live.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#EEF2FC] hover:bg-blue-100 text-[#1F2F6B] text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-neutral-200" />
          ))}
        </div>
      ) : (
        <>
          {/* 4 Kartu Metrik Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tayangan */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs hover:border-[#3E5FD1] transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Total Tayangan
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3E5FD1] flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-[#1F2F6B] tabular-nums">
                  {traffic?.totalViews.toLocaleString('id-ID') || 0}
                </span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">
                  Total akumulasi halaman dibuka
                </span>
              </div>
            </div>

            {/* Pengunjung Unik */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs hover:border-[#3E5FD1] transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Pengunjung Unik
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-emerald-700 tabular-nums">
                  {traffic?.uniqueVisitors.toLocaleString('id-ID') || 0}
                </span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">
                  Berdasarkan hash IP unik publik
                </span>
              </div>
            </div>

            {/* Kunjungan Hari Ini */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs hover:border-[#3E5FD1] transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Kunjungan Hari Ini
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black text-neutral-900 tabular-nums">
                  {traffic?.todayViews.toLocaleString('id-ID') || 0}
                </span>
                <span className="text-xs text-neutral-500">
                  ({traffic?.todayUniques || 0} unik)
                </span>
              </div>
              <span className="block text-[11px] text-neutral-400 mt-0.5">
                Akses sejak 00:00 hari ini
              </span>
            </div>

            {/* 7 Hari Terakhir */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs hover:border-[#3E5FD1] transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  7 Hari Terakhir
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-purple-700 tabular-nums">
                  {traffic?.weekViews.toLocaleString('id-ID') || 0}
                </span>
                <span className="block text-[11px] text-neutral-400 mt-0.5">
                  Lalu lintas pekan berjalan
                </span>
              </div>
            </div>
          </div>

          {/* Grid 2 Kolom: Top Pages & Breakdown Perangkat/Rujukan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Halaman */}
            <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#3E5FD1]" />
                  <span>Halaman Paling Sering Dikunjungi</span>
                </h2>
                <span className="text-[11px] text-neutral-400">Total Hits</span>
              </div>

              <div className="mt-4 space-y-3">
                {!traffic?.topPages || traffic.topPages.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6 text-center">
                    Belum ada data kunjungan halaman.
                  </p>
                ) : (
                  traffic.topPages.map((p, idx) => {
                    const maxCount = traffic.topPages[0]?.count || 1;
                    const pct = Math.round((p.count / maxCount) * 100);
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-medium text-neutral-800 truncate max-w-[280px]">
                            {p.path}
                          </span>
                          <span className="font-bold text-[#1F2F6B] tabular-nums">
                            {p.count} tayangan
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#3E5FD1] h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sumber Rujukan & Perangkat */}
            <div className="space-y-6">
              {/* Komposisi Perangkat */}
              <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs">
                <h2 className="font-bold text-sm text-neutral-900 pb-3 border-b border-neutral-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#3E5FD1]" />
                  <span>Perangkat Pengunjung</span>
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Smartphone / Mobile</span>
                    </div>
                    <p className="mt-2 text-2xl font-black text-neutral-900">
                      {mobilePct}%
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      {traffic?.devices.mobile || 0} kunjungan
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600">
                      <Monitor className="w-4 h-4 text-[#3E5FD1]" />
                      <span>Laptop / Desktop</span>
                    </div>
                    <p className="mt-2 text-2xl font-black text-neutral-900">
                      {desktopPct}%
                    </p>
                    <span className="text-[10px] text-neutral-400">
                      {traffic?.devices.desktop || 0} kunjungan
                    </span>
                  </div>
                </div>
              </div>

              {/* Sumber Rujukan / Referrer */}
              <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs">
                <h2 className="font-bold text-sm text-neutral-900 pb-3 border-b border-neutral-100 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-[#3E5FD1]" />
                  <span>Sumber Rujukan (Referrer)</span>
                </h2>

                <div className="mt-3 divide-y divide-neutral-100">
                  {!traffic?.topReferrers || traffic.topReferrers.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-3 text-center">
                      Belum ada data sumber rujukan.
                    </p>
                  ) : (
                    traffic.topReferrers.map((r, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <span className="text-neutral-700 font-medium truncate max-w-[260px]">
                          {r.referrer}
                        </span>
                        <span className="font-bold text-neutral-900 tabular-nums">
                          {r.count} sesi
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Log Kunjungan Terkini */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3E7EE] shadow-xs">
            <h2 className="font-bold text-sm text-neutral-900 pb-3 border-b border-neutral-100">
              Lalu Lintas Kunjungan Terkini (Real-time Stream)
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500 font-bold">
                    <th className="pb-2.5">Waktu Akses</th>
                    <th className="pb-2.5">Halaman (Path)</th>
                    <th className="pb-2.5">Perangkat</th>
                    <th className="pb-2.5">Sumber (Referrer)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {!traffic?.recentVisits || traffic.recentVisits.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-neutral-400">
                        Belum ada log lalu lintas yang tercatat. Kunjungi website publik untuk menguji pelacakan!
                      </td>
                    </tr>
                  ) : (
                    traffic.recentVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-neutral-50/70">
                        <td className="py-2.5 font-mono text-neutral-600 tabular-nums">
                          {new Date(v.created_at).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                          })}
                        </td>
                        <td className="py-2.5 font-mono font-medium text-[#1F2F6B]">
                          {v.path}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.device_type === 'mobile'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {v.device_type === 'mobile' ? 'Mobile' : 'Desktop'}
                          </span>
                        </td>
                        <td className="py-2.5 text-neutral-600">
                          {v.referrer || 'Langsung (Direct)'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
