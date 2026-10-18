'use client';

import React, { useEffect, useState } from 'react';
import { Heart, Sparkles, ShieldCheck, RefreshCw, MessageSquare } from 'lucide-react';
import { formatRupiah, formatTanggal } from '@/lib/format';

interface FeedItem {
  id: string | number;
  nama: string;
  is_anonim: boolean;
  nominal: number;
  program: string;
  doa?: string;
  tanggal: string;
}

interface LiveDonationFeedProps {
  onOpenConfirm?: () => void;
  filterProgram?: string;
}

export function LiveDonationFeed({ onOpenConfirm, filterProgram }: LiveDonationFeedProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/donasi/feed');
      if (res.ok) {
        const json = await res.json();
        setItems(json.feed || []);
        setTotalCount(json.total_count || 0);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const displayedItems = filterProgram
    ? items.filter((item) =>
        item.program.toLowerCase().includes(filterProgram.toLowerCase())
      )
    : items;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider">
            Doa &amp; Amanah Muhsinin Terkini
          </h3>
          {totalCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yimi-blue-100 text-yimi-blue-800">
              {totalCount} Tercatat
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={fetchFeed}
          disabled={loading}
          className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition disabled:opacity-50 cursor-pointer"
          title="Segarkan feed donasi"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feed List */}
      <div className="p-6">
        {loading && items.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Memuat catatan donasi terkini…
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Heart className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500">
              Belum ada konfirmasi yang ditampilkan untuk program ini.
            </p>
            {onOpenConfirm && (
              <button
                type="button"
                onClick={onOpenConfirm}
                className="text-xs font-bold text-yimi-blue-600 hover:underline cursor-pointer"
              >
                Jadilah yang pertama mengonfirmasi donasi
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 hover:border-yimi-blue-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-neutral-800">
                        {item.nama}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-neutral-200 font-semibold text-neutral-600">
                        {item.program}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {formatTanggal(item.tanggal)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-700">
                      {formatRupiah(item.nominal)}
                    </span>
                  </div>
                </div>

                {item.doa && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-200/60 text-xs italic text-neutral-600 flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-yimi-yellow-500 shrink-0 mt-0.5" />
                    <span>&ldquo;{item.doa}&rdquo;</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA Konfirmasi di bawah feed */}
        {onOpenConfirm && (
          <div className="mt-5 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-neutral-500 text-center sm:text-left">
              Sudah menyalurkan infaq atau wakaf Anda?
            </span>
            <button
              type="button"
              onClick={onOpenConfirm}
              className="py-2 px-4 rounded-xl bg-yimi-blue-600 hover:bg-yimi-blue-700 text-white font-bold transition shadow-2xs cursor-pointer"
            >
              Konfirmasi Donasi Saya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
