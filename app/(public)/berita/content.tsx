'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Calendar, User, Search, ArrowRight, Tag, Images, Eye, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHero } from '@/components/ui/PageHero';
import { Badge } from '@/components/ui/Badge';
import { formatTanggal } from '@/lib/format';

interface NewsItem {
  id: string;
  slug: string;
  judul: string;
  tanggal: string;
  penulis: string;
  kategori: string;
  gambar: string;
  galeri?: string[];
  views?: number;
  likes?: number;
  ringkasan: string;
}

export default function BeritaPage() {
  // CMS adalah sumber kebenaran: mulai kosong, isi dari API.
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/berita');
        if (res.ok) {
          const data = await res.json();
          // Hormati CMS: kosong → kosong (jangan fallback ke data lokal basi)
          setNewsList(Array.isArray(data.news) ? data.news : []);
        }
      } catch (err) {
        console.error('Gagal mengambil daftar berita live:', err);
      }
    }

    fetchNews();
  }, []);

  const categories = useMemo(() => {
    const list = Array.from(new Set(newsList.map((item) => item.kategori)));
    return ['Semua', ...list];
  }, [newsList]);

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchCat =
        selectedCategory === 'Semua' || item.kategori === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [newsList, selectedCategory, searchQuery]);

  return (
    <div className="pt-[72px]">
      {/* Subpage Hero */}
      <PageHero
        image="/images/banners/berita.jpg"
        imageAlt="Meja tulis dengan buku catatan dan pena, berita dakwah"
        badge={
          <>
            <Newspaper className="w-3.5 h-3.5" />
            <span>Kabar Dakwah &amp; Edukasi</span>
          </>
        }
        title={<>Warta &amp; Artikel YIMI</>}
        subtitle="Informasi kegiatan, artikel ilmiah ringkas, dan perkembangan dakwah Yayasan Insan Muslim Istiqomah."
      />

      {/* Filter & Content Section */}
      <section className="py-16 md:py-20 bg-neutral-100/60 min-h-[500px]">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          {/* Controls: Category Filter + Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-yimi-blue-600 text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200/90 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-yimi-blue-600 shadow-xs"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* News Grid */}
          {filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item) => (
                <Card
                  key={item.id}
                  hoverEffect
                  className="flex flex-col justify-between overflow-hidden border-neutral-200/80 group"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/9 w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={item.gambar}
                        alt={item.judul}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="blue" className="bg-white/90 backdrop-blur-xs">
                          {item.kategori}
                        </Badge>
                      </div>
                      {item.galeri && item.galeri.length > 1 && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                            <Images className="w-3 h-3" />
                            <span>{item.galeri.length} Foto</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-[11px] text-neutral-500 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatTanggal(item.tanggal)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{item.penulis}</span>
                        </div>
                      </div>

                      <h2 className="text-lg font-bold text-yimi-blue-800 leading-snug line-clamp-2 mb-3 group-hover:text-yimi-blue-600 transition-colors">
                        <Link href={`/berita/${item.slug}`}>
                          {item.judul}
                        </Link>
                      </h2>

                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                        {item.ringkasan}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-3 flex items-center justify-between border-t border-neutral-100">
                    <Link
                      href={`/berita/${item.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-yimi-blue-600 hover:text-yimi-blue-800 transition-colors"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Indikator Tayangan & Suka */}
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium">
                      <span className="inline-flex items-center gap-1 hover:text-neutral-600 transition-colors" title={`${item.views || 0} pembaca`}>
                        <Eye className="w-3.5 h-3.5" />
                        <span>{(item.views || 0).toLocaleString('id-ID')}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 hover:text-rose-600 transition-colors" title={`${item.likes || 0} suka`}>
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                        <span>{(item.likes || 0).toLocaleString('id-ID')}</span>
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 max-w-lg mx-auto">
              <Tag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-yimi-blue-800 mb-1">
                Artikel Tidak Ditemukan
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Tidak ada artikel yang cocok dengan kata kunci &ldquo;{searchQuery}&rdquo; pada kategori ini.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-yimi-blue-600 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
