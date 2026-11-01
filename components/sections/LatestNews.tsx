import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
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
  ringkasan: string;
}

// Server Component: berita dari server (props halaman beranda, CMS via
// lib/home-data). Dulu client component yang fetch /api/berita setelah
// load — kartu muncul belakangan (SI & CLS) dan menambah blocking time.
export function LatestNews({ news }: { news: unknown[] }) {
  const newsList = news as NewsItem[];

  // Sembunyikan section jika CMS tidak punya berita
  if (newsList.length === 0) {
    return null;
  }

  const latestThree = newsList.slice(0, 3);

  return (
    <section className="py-20 md:py-24 bg-yimi-blue-50/40 relative">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-blue-700 mb-2">
              Kabar &amp; Faedah Ilmu
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight">
              Berita &amp; Artikel Terbaru
            </h2>
          </div>
          <Link
            href="/berita"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-yimi-blue-800 hover:text-yimi-blue-950 transition-colors"
          >
            <span>Semua Artikel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {latestThree.map((item) => (
            <Link key={item.id} href={`/berita/${item.slug}`} className="group block">
              <Card
                hoverEffect
                className="overflow-hidden h-full flex flex-col justify-between border-neutral-200/80 group-hover:border-yimi-blue-600/30"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-200">
                    <Image
                      src={item.gambar}
                      alt={item.judul}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 360px, (max-width: 1024px) 45vw, 380px"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="blue" className="bg-white/90 backdrop-blur-xs font-bold text-yimi-blue-800">
                        {item.kategori}
                      </Badge>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatTanggal(item.tanggal)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-yimi-blue-800 group-hover:text-yimi-blue-600 transition-colors line-clamp-2 leading-snug mb-3">
                      {item.judul}
                    </h3>

                    <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                      {item.ringkasan}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6 pt-0 flex items-center justify-between text-xs font-semibold text-yimi-blue-600 group-hover:text-yimi-blue-800">
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.penulis}</span>
                  </span>
                  <span className="flex items-center gap-1 font-bold group-hover:underline">
                    Baca Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
