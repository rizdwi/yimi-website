'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function AdminMediaPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const mediaFiles = [
    {
      id: 'logo-yimi',
      nama: 'logo-yimi.svg',
      kategori: 'Branding / Logo',
      ukuran: '4.2 KB',
      url: '/logo/logo-yimi.svg',
    },
    {
      id: 'qris-yimi',
      nama: 'qris-yimi.svg',
      kategori: 'Donasi / Finansial',
      ukuran: '12.8 KB',
      url: '/images/qris-yimi.svg',
    },
    {
      id: 'pattern-star8',
      nama: 'pattern-star8.svg',
      kategori: 'Ornamen Islami',
      ukuran: '1.8 KB',
      url: '/patterns/pattern-star8.svg',
    },
    {
      id: 'lahan-masjid',
      nama: 'pembebasan-lahan.jpg',
      kategori: 'Wakaf Lahan',
      ukuran: '240 KB',
      url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&q=80',
    },
    {
      id: 'kajian-sunnah',
      nama: 'kajian-ilmiah.jpg',
      kategori: 'Majelis Ilmu',
      ukuran: '310 KB',
      url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800&q=80',
    },
    {
      id: 'paud-santri',
      nama: 'santri-tk-paud.jpg',
      kategori: 'Pendidikan',
      ukuran: '280 KB',
      url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    },
  ];

  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Pustaka Berkas & Media</h2>
          <p className="text-xs text-[#6B7280]">
            Pustaka aset visual, vektor logo resmi, QRIS infak, dan foto kegiatan yayasan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {mediaFiles.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-xl border border-[#E3E7EE] overflow-hidden shadow-xs p-3 space-y-3"
          >
            <div className="aspect-16/9 bg-[#F5F7FA] rounded-lg overflow-hidden flex items-center justify-center border border-[#E3E7EE]/50">
              <img src={m.url} alt={m.nama} className="w-full h-full object-cover" />
            </div>

            <div>
              <span className="font-bold text-xs text-[#111827] block truncate">{m.nama}</span>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] mt-0.5">
                <span>{m.kategori}</span>
                <span className="font-mono">{m.ukuran}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E3E7EE] flex items-center justify-between">
              <button
                onClick={() => handleCopy(m.url, m.id)}
                className="inline-flex items-center space-x-1 text-xs text-[#3E5FD1] hover:underline font-semibold"
              >
                {copiedId === m.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#138A3A]" />
                    <span className="text-[#138A3A]">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin URL</span>
                  </>
                )}
              </button>

              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#6B7280] hover:text-[#111827]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
