'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Images, Eye, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import galleryData from '@/content/gallery.json';

interface GalleryPhotoItemLocal {
  id: string;
  judul: string;
  kategori: string;
  gambar: string;
  deskripsi: string;
  izinOrangTua: boolean;
  tanggal?: string;
}

export default function GaleriPage() {
  const [photos, setPhotos] = useState<GalleryPhotoItemLocal[]>(
    galleryData.map((g) => ({
      ...g,
      deskripsi: g.deskripsi || '',
      izinOrangTua: g.izinOrangTua ?? true,
    }))
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activePhoto, setActivePhoto] = useState<GalleryPhotoItemLocal | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch('/api/galeri');
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
                tanggal: i.tanggal,
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load photos:', err);
      }
    }

    fetchPhotos();
  }, []);

  // Filter only items with parental consent flag (respect privacy rule in AGENTS.md)
  const approvedPhotos = useMemo(() => {
    return photos.filter((item) => item.izinOrangTua === true);
  }, [photos]);

  const categories = useMemo(() => {
    const list = Array.from(new Set(approvedPhotos.map((item) => item.kategori)));
    return ['Semua', ...list];
  }, [approvedPhotos]);

  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'Semua') return approvedPhotos;
    return approvedPhotos.filter((item) => item.kategori === selectedCategory);
  }, [selectedCategory, approvedPhotos]);

  return (
    <div className="pt-[72px]">
      {/* Subpage Hero */}
      <section className="relative h-80 min-h-[320px] bg-yimi-blue-800 text-white flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-star8-pattern opacity-[0.06] pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-yimi-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Images className="w-3.5 h-3.5" />
            <span>Dokumentasi Kegiatan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Galeri Dakwah &amp; Sosial
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            Arsip rekaman jejak syiar ilmu, kebersamaan jamaah, dan bakti sosial Yayasan Insan Muslim Istiqomah.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-20 bg-neutral-100/60 min-h-[500px]">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-yimi-blue-600 text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative aspect-4/3 rounded-3xl overflow-hidden bg-neutral-200 cursor-pointer border border-neutral-200/80 shadow-xs"
              >
                <Image
                  src={photo.gambar}
                  alt={photo.judul}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-yimi-blue-800/90 via-yimi-blue-800/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                  <div className="self-end">
                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </span>
                  </div>

                  <div>
                    <Badge variant="yellow" className="mb-2">
                      {photo.kategori}
                    </Badge>
                    <h3 className="text-white text-base font-bold leading-snug drop-shadow-xs">
                      {photo.judul}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-neutral-900/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-neutral-900/60 hover:bg-neutral-900 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup pratinjau foto"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative aspect-16/10 w-full bg-neutral-950">
              <Image
                src={activePhoto.gambar}
                alt={activePhoto.judul}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-contain"
              />
            </div>

            {/* Modal Caption */}
            <div className="p-6 sm:p-8 bg-white flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="blue">{activePhoto.kategori}</Badge>
              </div>
              <h2 className="text-xl font-bold text-yimi-blue-800">
                {activePhoto.judul}
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {activePhoto.deskripsi}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
