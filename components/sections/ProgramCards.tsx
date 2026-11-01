import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  Utensils,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/** Banner tematik per slug program (halaman detail program). */
const programBanner: Record<string, string> = {
  'tk-paud': '/images/banners/tk-paud.webp',
  'tk': '/images/banners/tk-paud.webp',
  'kajian': '/images/banners/kajian.webp',
  'jumat-berkah': '/images/banners/jumat-berkah.webp',
  'pembebasan-lahan': '/images/banners/pembebasan-lahan.webp',
  'wakaf': '/images/banners/pembebasan-lahan.webp',
};

const iconMap = {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  Utensils,
  Heart,
};

interface ProgramCardItem {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  kategori: string;
  ikon?: string;
  icon?: string;
  highlight: string;
  href: string;
  tampil_beranda?: boolean;
}

// Server Component: daftar program dari server (props halaman beranda, CMS
// via lib/home-data). Dulu client component yang fetch /api/programs setelah
// load — kartu muncul belakangan (SI & CLS) dan menambah blocking time.
export function ProgramCards({ programs }: { programs: unknown[] }) {
  const list = programs as ProgramCardItem[];

  // Sembunyikan section jika CMS tidak punya program
  if (list.length === 0) {
    return null;
  }

  const programsToShow = list;

  return (
    <section className="py-20 md:py-24 bg-neutral-100/60 relative">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              Layanan &amp; Khidmah Umat
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight">
              Program Unggulan YIMI
            </h2>
          </div>
          <p className="text-sm md:text-base text-neutral-600 max-w-md">
            Wadah amal shalih, pendidikan anak usia dini, dan kajian ilmu syar&apos;i yang terstruktur dan berkelanjutan.
          </p>
        </div>

        {/* 4 Program Cards Grid — kartu bergambar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programsToShow.map((item) => {
            const iconKey = (item.ikon || item.icon || 'BookOpen') as keyof typeof iconMap;
            const IconComponent = iconMap[iconKey] || BookOpen;
            const banner = programBanner[item.slug] || programBanner[item.slug?.split('-')[0]];

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yimi-blue-500 rounded-2xl"
                aria-label={`Program ${item.judul} - ${item.highlight}`}
              >
                <Card
                  hoverEffect
                  className="h-full flex flex-col overflow-hidden p-0 border-neutral-200/80 hover:border-yimi-blue-600/30"
                >
                  {/* Gambar banner tematik */}
                  {banner ? (
                    <div className="relative h-44 overflow-hidden shrink-0">
                      <Image
                        src={banner}
                        alt={item.judul}
                        fill
                        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 280px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 bg-linear-to-t from-yimi-blue-950/60 via-transparent to-transparent"
                        aria-hidden="true"
                      />
                      <Badge variant="blue" className="absolute top-3 left-3 text-[10px] backdrop-blur-xs bg-white/85">
                        {item.kategori}
                      </Badge>
                    </div>
                  ) : null}

                  <div className="flex flex-col justify-between flex-1 p-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-yimi-blue-50 text-yimi-green-700 flex items-center justify-center group-hover:bg-yimi-blue-600 group-hover:text-white transition-colors duration-300 shrink-0">
                          <IconComponent className="w-5 h-5 stroke-[1.75]" />
                        </div>
                        <h3 className="text-lg font-bold text-yimi-blue-800 leading-snug group-hover:text-yimi-blue-600 transition-colors line-clamp-2">
                          {item.judul}
                        </h3>
                      </div>

                      <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed mb-4">
                        {item.ringkasan}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-500 truncate max-w-[140px]">
                        {item.highlight}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-sm font-bold text-yimi-blue-600 group-hover:text-yimi-blue-800 transition-colors shrink-0"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
