'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { GalleryItem } from '@/lib/content';
import galleryData from '@/content/gallery.json';

export function GalleryPreview() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [photos, setPhotos] = useState<GalleryItem[]>(
    galleryData.filter((item) => item.izinOrangTua === true).slice(0, 6)
  );

  useEffect(() => {
    async function fetchLivePhotos() {
      try {
        const res = await fetch('/api/galeri?beranda=true');
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setPhotos(
              data.items.map((i: { id: string; judul: string; keterangan?: string; deskripsi?: string; gambar: string; kategori: string; izin_orang_tua?: boolean; izinOrangTua?: boolean; tanggal?: string }) => ({
                id: i.id,
                judul: i.judul,
                deskripsi: i.keterangan || i.deskripsi || '',
                gambar: i.gambar,
                kategori: i.kategori,
                izinOrangTua: i.izin_orang_tua ?? i.izinOrangTua ?? true,
                tanggal: i.tanggal || new Date().toISOString().split('T')[0],
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load live gallery:', err);
      }
    }

    fetchLivePhotos();
  }, []);

  const safePhotos = photos.slice(0, 6);

  return (
    <section className="py-20 md:py-24 bg-white relative">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yimi-green-500" />
              Dokumentasi Kegiatan
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight">
              Galeri Jejak Langkah YIMI
            </h2>
          </div>
          <Link
            href="/galeri"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-yimi-blue-600 hover:text-yimi-blue-800 transition-colors"
          >
            <span>Buka Galeri Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Grid Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safePhotos.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={item.gambar}
                alt={item.judul}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-108"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-yimi-blue-800/85 via-yimi-blue-800/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

              {/* Category Pill Top Left */}
              <div className="absolute top-3.5 left-3.5 z-10">
                <Badge variant="blue" className="bg-white/95 text-yimi-blue-800 font-bold backdrop-blur-xs">
                  {item.kategori}
                </Badge>
              </div>

              {/* Quick View Icon Center (hover) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white/90 text-yimi-blue-800 flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6" />
                </div>
              </div>

              {/* Caption Bottom */}
              <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10">
                <h3 className="text-sm font-bold leading-snug line-clamp-2">
                  {item.judul}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan Foto Penuh"
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              aria-label="Tutup Tampilan Foto"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative aspect-16/10 w-full bg-neutral-950">
              <Image
                src={selectedPhoto.gambar}
                alt={selectedPhoto.judul}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <div className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="blue">{selectedPhoto.kategori}</Badge>
                <span className="text-xs text-neutral-500 font-medium">
                  {selectedPhoto.tanggal}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-yimi-blue-800 mb-2">
                {selectedPhoto.judul}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {selectedPhoto.deskripsi}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
