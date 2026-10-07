'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, Calendar, User, Search, ArrowRight, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTanggal } from '@/lib/format';
import newsData from '@/content/news/index.json';

export default function BeritaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const list = Array.from(new Set(newsData.map((item) => item.kategori)));
    return ['Semua', ...list];
  }, []);

  const filteredNews = useMemo(() => {
    return newsData.filter((item) => {
      const matchCat =
        selectedCategory === 'Semua' || item.kategori === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

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
            <Newspaper className="w-3.5 h-3.5" />
            <span>Kabar Dakwah &amp; Edukasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Warta &amp; Artikel YIMI
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            Informasi kegiatan, artikel ilmiah ringkas, dan perkembangan dakwah Yayasan Insan Muslim Istiqomah.
          </p>
        </div>
      </section>

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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200/90 rounded-2xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-hidden focus:border-yimi-blue-600 shadow-xs"
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

                  <div className="px-6 pb-6 pt-0">
                    <Link
                      href={`/berita/${item.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-yimi-blue-600 hover:text-yimi-blue-800 transition-colors"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
