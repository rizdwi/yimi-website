'use client';

import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { AuditLogItem } from '@/lib/types';

export default function AdminRiwayatPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModul, setSelectedModul] = useState('semua');

  useEffect(() => {
    let ignore = false;
    async function fetchLogs() {
      try {
        const res = await fetch(`/api/admin/audit-logs?modul=${selectedModul}&limit=100`);
        if (res.ok && !ignore) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchLogs();
    return () => {
      ignore = true;
    };
  }, [selectedModul]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Riwayat Perubahan & Audit Log</h2>
          <p className="text-xs text-[#6B7280]">
            Pencatatan transparan seluruh aktivitas tulis data, pembaruan konten, dan mutasi saldo wakaf.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <select
            value={selectedModul}
            onChange={(e) => setSelectedModul(e.target.value)}
            className="text-xs bg-white border border-[#E3E7EE] rounded-lg px-3 py-1.5 text-[#111827]"
          >
            <option value="semua">Semua Modul</option>
            <option value="Autentikasi">Autentikasi & Login</option>
            <option value="Pengaturan Situs">Pengaturan Situs & Rekening</option>
            <option value="Pembebasan Lahan">Pembebasan Lahan</option>
            <option value="Jadwal Kajian">Jadwal Kajian</option>
            <option value="Program">Pilar Program</option>
            <option value="Berita & Artikel">Berita & Warta</option>
            <option value="Galeri">Galeri</option>
            <option value="Pesan Masuk">Pesan Masuk</option>
            <option value="Ekspor & Cadangan">Ekspor & Cadangan</option>
            <option value="Akun">Akun & Sandi</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E7EE] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F7FA] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E3E7EE]">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Ringkasan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E7EE]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[#6B7280]">
                    Memuat data riwayat…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[#6B7280]">
                    Belum ada riwayat aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#EEF2FC]/40 transition">
                    <td className="py-3 px-4 font-mono text-[#6B7280] whitespace-nowrap">
                      {new Date(log.waktu).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#111827] whitespace-nowrap">
                      {log.pengguna}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#EEF2FC] text-[#3E5FD1] font-semibold text-[11px]">
                        {log.modul}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#374151] font-medium leading-relaxed">
                      {log.ringkasan}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
