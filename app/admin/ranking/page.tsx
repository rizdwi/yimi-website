'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RefreshCw, ArrowUp, ArrowDown, Minus } from 'lucide-react';

type Row = {
  keyword: string;
  check_date: string;
  position: number | null;
};

const KEYWORDS = [
  'yayasan islam karawang',
  'yayasan islam cikampek',
  'tk islam karawang',
  'wakaf karawang',
  'tempat kajian sunnah karawang',
];

function badge(pos: number | null) {
  if (pos === null || pos === undefined)
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">—</span>;
  const cls =
    pos <= 3
      ? 'bg-green-100 text-green-800'
      : pos <= 10
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-orange-100 text-orange-800';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>#{pos}</span>;
}

export default function AdminRankingPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/rankings');
      if (res.ok) {
        const data = await res.json();
        setRows(data.rankings || []);
      }
    } catch (err) {
      console.error('Gagal memuat ranking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Kelompokkan per keyword -> map tanggal => posisi
  const byKeyword: Record<string, Record<string, number | null>> = {};
  const datesSet = new Set<string>();
  for (const r of rows) {
    if (!byKeyword[r.keyword]) byKeyword[r.keyword] = {};
    byKeyword[r.keyword][r.check_date] = r.position;
    datesSet.add(r.check_date);
  }
  const dates = [...datesSet].sort().reverse().slice(0, 14);
  const keywords = KEYWORDS.filter((k) => byKeyword[k]);

  const trend = (kw: string) => {
    const m = byKeyword[kw];
    if (!m || dates.length < 2) return null;
    const cur = m[dates[0]];
    const prev = m[dates[1]];
    if (cur === null || cur === undefined) return { icon: <Minus size={14} />, label: 'belum masuk 20 besar' };
    if (prev === null || prev === undefined) return { icon: <ArrowUp size={14} className="text-green-600" />, label: 'baru masuk peringkat' };
    if (cur < prev) return { icon: <ArrowUp size={14} className="text-green-600" />, label: `naik ${prev - cur}` };
    if (cur > prev) return { icon: <ArrowDown size={14} className="text-red-600" />, label: `turun ${cur - prev}` };
    return { icon: <Minus size={14} className="text-gray-400" />, label: 'tetap' };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-[#1F2F6B]" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ranking Google</h1>
            <p className="text-sm text-gray-500">
              Posisi yimi.my.id untuk 5 keyword target — dicek otomatis setiap pagi (±07:30 WIB).
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1F2F6B] text-white rounded-lg text-sm hover:opacity-90"
        >
          <RefreshCw size={16} /> Muat ulang
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Memuat data…</p>
      ) : keywords.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          Belum ada data. Cron pengecekan harian akan mengisi tabel ini mulai besok pagi. Pastikan tabel{' '}
          <code>seo_rankings</code> sudah dibuat di Supabase.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {keywords.map((kw) => {
              const t = trend(kw);
              const cur = byKeyword[kw][dates[0]];
              return (
                <div key={kw} className="bg-white rounded-xl shadow-sm border p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">{kw}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      {cur === null || cur === undefined ? '—' : `#${cur}`}
                    </span>
                    {t && (
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        {t.icon} {t.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">terakhir dicek: {dates[0]}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Keyword</th>
                  {dates.map((d) => (
                    <th key={d} className="px-3 py-3 font-medium text-gray-600 whitespace-nowrap">
                      {d.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => (
                  <tr key={kw} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-800">{kw}</td>
                    {dates.map((d) => (
                      <td key={d} className="px-3 py-3 text-center">
                        {badge(byKeyword[kw][d] ?? null)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            “—” = tidak masuk 20 besar Google pada hari itu. Posisi diukur dari hasil organik google.co.id.
          </p>
        </>
      )}
    </div>
  );
}
