'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Images,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { GalleryItem } from '@/lib/content';
import galleryData from '@/content/gallery.json';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop';

interface PublicGalleryApiItem {
  id: string;
  judul: string;
  keterangan?: string;
  deskripsi?: string;
  gambar: string;
  kategori: string;
  izin_orang_tua?: boolean;
  izinOrangTua?: boolean;
  tanggal?: string;
}

function GalleryCardItem({
  item,
  index,
  onSelect,
}: {
  item: GalleryItem;
  index: number;
  onSelect: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(item.gambar || FALLBACK_IMAGE);
  const isSupabase = Boolean(imgSrc && imgSrc.includes('supabase.co'));

  return (
    <div
      onClick={onSelect}
      className="group relative rounded-2xl md:rounded-3xl overflow-hidden aspect-4/3 bg-neutral-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-200/80"
    >
      <Image
        src={imgSrc}
        alt={item.judul}
        fill
        unoptimized={isSupabase}
        onError={() => setImgSrc(FALLBACK_IMAGE)}
        className="object-cover transition-transform duration-700 group-hover:scale-108"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={index < 3}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-yimi-blue-800/90 via-yimi-blue-800/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Category Pill Top Left */}
      <div className="absolute top-3.5 left-3.5 z-10">
        <Badge
          variant="blue"
          className="bg-white/95 text-yimi-blue-800 font-bold backdrop-blur-xs shadow-xs"
        >
          {item.kategori}
        </Badge>
      </div>

      {/* Quick View Icon Center (hover) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-white/90 text-yimi-blue-800 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
          <Eye className="w-6 h-6 stroke-[2]" />
        </div>
      </div>

      {/* Caption Bottom */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white z-10">
        <h3 className="text-sm sm:text-base font-bold leading-snug line-clamp-2 drop-shadow-xs mb-1">
          {item.judul}
        </h3>
        {item.deskripsi && (
          <p className="text-xs text-blue-100 line-clamp-1 opacity-90">
            {item.deskripsi}
          </p>
        )}
      </div>
    </div>
  );
}

export function GalleryPreview() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<GalleryItem[]>(
    galleryData.filter((item) => item.izinOrangTua === true)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Responsif jumlah kartu yang tampak di slider
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch live photos dari database
  useEffect(() => {
    async function fetchLivePhotos() {
      try {
        const res = await fetch('/api/galeri?beranda=true');
        if (res.ok) {
          const data = await res.json();
          if (data.items && data.items.length > 0) {
            setPhotos(
              data.items.map((i: PublicGalleryApiItem) => ({
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
        console.error('Failed to load live gallery for preview slider:', err);
      }
    }

    fetchLivePhotos();
  }, []);

  const totalPhotos = photos.length;
  const maxIndex = Math.max(0, totalPhotos - visibleCount);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Otomatis sliding timer (3.5 detik per transisi, jeda hanya saat hover)
  useEffect(() => {
    if (isHovered || totalPhotos <= visibleCount) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [isHovered, totalPhotos, visibleCount, nextSlide]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev + 1) % totalPhotos : null
        );
      } else if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) =>
          prev !== null ? (prev - 1 + totalPhotos) % totalPhotos : null
        );
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, totalPhotos]);

  // Touch Swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.targetTouches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndXRef.current = e.targetTouches[0].clientX;
  }

  function handleTouchEnd() {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const diff = touchStartXRef.current - touchEndXRef.current;
      if (diff > 50) {
        nextSlide();
      } else if (diff < -50) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  }

  const selectedPhoto =
    selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <section className="py-20 md:py-24 bg-neutral-100/60 relative overflow-hidden">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yimi-green-500 animate-pulse" />
              Dokumentasi &amp; Jejak Langkah
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight">
              Galeri Jejak Langkah YIMI
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1">
              Rekaman syiar dakwah, pendidikan sunnah santri, dan penyaluran infaq umat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-Slide Navigation Arrows (Tanpa Tombol Jeda) */}
            {totalPhotos > visibleCount && (
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-neutral-200/80 shadow-xs">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center transition-colors border border-neutral-200 cursor-pointer"
                  title="Foto Sebelumnya"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 flex items-center justify-center transition-colors border border-neutral-200 cursor-pointer"
                  title="Foto Selanjutnya"
                  aria-label="Foto Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <Link
              href="/galeri"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-yimi-blue-600 hover:bg-yimi-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
            >
              <Images className="w-4 h-4" />
              <span>Semua Foto ({totalPhotos})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel Slider Container */}
        <div
          className="relative overflow-hidden rounded-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {photos.map((item, idx) => (
              <div
                key={item.id || idx}
                className="shrink-0 px-2 sm:px-3"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <GalleryCardItem
                  item={item}
                  index={idx}
                  onSelect={() => setSelectedPhotoIndex(idx)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Slider Indicator Dots & Status */}
        {totalPhotos > visibleCount && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200/60">
            <div className="text-xs font-semibold text-neutral-500">
              Menampilkan {currentIndex + 1} -{' '}
              {Math.min(currentIndex + visibleCount, totalPhotos)} dari{' '}
              <span className="text-yimi-blue-800 font-bold">{totalPhotos}</span> foto kegiatan
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-yimi-green-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-yimi-green-500 animate-ping" />
                Auto-slide aktif
              </span>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === dotIdx
                      ? 'w-6 bg-yimi-blue-600'
                      : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  aria-label={`Pindah ke slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal with Next & Prev */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedPhotoIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Tampilan Foto Penuh"
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Navigation Buttons */}
            {totalPhotos > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null ? (prev - 1 + totalPhotos) % totalPhotos : null
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="Foto Sebelumnya"
                  title="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhotoIndex((prev) =>
                      prev !== null ? (prev + 1) % totalPhotos : null
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
                  aria-label="Foto Selanjutnya"
                  title="Foto Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
              aria-label="Tutup Tampilan Foto"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Large Image Frame */}
            <div className="relative aspect-16/10 w-full bg-neutral-950">
              <Image
                src={selectedPhoto.gambar || FALLBACK_IMAGE}
                alt={selectedPhoto.judul}
                fill
                unoptimized={Boolean(
                  selectedPhoto.gambar && selectedPhoto.gambar.includes('supabase.co')
                )}
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1000px"
                priority
              />
            </div>

            {/* Info Footer */}
            <div className="p-5 sm:p-6 bg-white">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{selectedPhoto.kategori}</Badge>
                  <span className="text-xs text-neutral-500 font-medium">
                    {selectedPhoto.tanggal}
                  </span>
                </div>
                <span className="text-xs font-bold text-neutral-400">
                  Foto {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : 1} dari{' '}
                  {totalPhotos}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-yimi-blue-800 mb-1">
                {selectedPhoto.judul}
              </h3>
              {selectedPhoto.deskripsi && (
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {selectedPhoto.deskripsi}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
