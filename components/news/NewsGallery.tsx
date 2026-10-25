'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Images, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface NewsGalleryProps {
  images: string[];
  judul: string;
}

export function NewsGallery({ images = [], judul }: NewsGalleryProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Keyboard navigation untuk lightbox modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
      }
    },
    [activeIdx, images.length]
  );

  useEffect(() => {
    if (activeIdx !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeIdx, handleKeyDown]);

  // Jika tidak ada gambar atau hanya 1 gambar (yang sudah jadi sampul utama),
  // kita tidak perlu menampilkan galeri dokumentasi tambahan.
  if (!images || images.length <= 1) {
    return null;
  }

  return (
    <section className="my-12 pt-8 border-t border-neutral-200/90">
      {/* Header Galeri Dokumentasi Kegiatan */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-yimi-blue-50 text-yimi-blue-700">
            <Images className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-yimi-blue-800 tracking-tight">
              Dokumentasi Foto Kegiatan
            </h3>
            <p className="text-xs text-neutral-500">
              Total {images.length} foto liputan kegiatan ini. Klik foto untuk melihat ukuran penuh.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Foto Dokumentasi */}
      <div
        className={`grid gap-4 ${
          images.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : images.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        }`}
      >
        {images.map((imgUrl, idx) => {
          const isCover = idx === 0;
          return (
            <div
              key={`${imgUrl}-${idx}`}
              onClick={() => setActiveIdx(idx)}
              className="group relative aspect-4/3 rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-100 cursor-pointer shadow-xs hover:shadow-md transition-all duration-300"
            >
              <Image
                src={imgUrl}
                alt={`${judul} - Foto ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Overlay Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  {isCover ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yimi-gold-500 text-yimi-blue-900 shadow-xs">
                      Foto Sampul
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-neutral-800 backdrop-blur-xs">
                      Foto {idx + 1}
                    </span>
                  )}
                  <div className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-white/95 text-center">
                  Klik untuk perbesar
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal Fullscreen */}
      {activeIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-90 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveIdx(null)}
        >
          {/* Top Bar Lightbox */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                {activeIdx + 1} / {images.length}
              </span>
              <span className="text-xs text-white/80 line-clamp-1 max-w-[200px] sm:max-w-md">
                {judul}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveIdx(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
              aria-label="Tutup foto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tombol Sebelumnya */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition cursor-pointer z-10"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Area Gambar Tengah */}
          <div
            className="relative w-full max-w-4xl max-h-[82vh] aspect-16/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIdx]}
              alt={`${judul} - Foto ${activeIdx + 1}`}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Tombol Selanjutnya */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition cursor-pointer z-10"
              aria-label="Foto selanjutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail Bar Bawah */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 max-w-[90vw] overflow-x-auto p-2 rounded-2xl bg-black/50 backdrop-blur-md z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((thumb, tIdx) => (
              <button
                key={`thumb-${tIdx}`}
                type="button"
                onClick={() => setActiveIdx(tIdx)}
                className={`relative w-12 h-9 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                  activeIdx === tIdx
                    ? 'border-yimi-gold-400 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={thumb}
                  alt={`Thumbnail ${tIdx + 1}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
