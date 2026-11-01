'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  Utensils,
  Heart,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHero } from '@/components/ui/PageHero';

const iconMap = {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  Utensils,
  Heart,
};

interface ProgramDetailItem {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  kategori: string;
  tag: string;
  ikon?: string;
  icon?: string;
  targetUsia: string;
  highlight: string;
  href: string;
}

export default function ProgramIndexPage({ initialPrograms }: { initialPrograms?: ProgramDetailItem[] }) {
  // Jika server sudah memberikan initialPrograms (SSR untuk Googlebot & fast load), langsung gunakan
  const [programs, setPrograms] = useState<ProgramDetailItem[]>(initialPrograms || []);

  useEffect(() => {
    async function fetchLivePrograms() {
      try {
        const res = await fetch('/api/programs', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.programs)) {
            setPrograms(data.programs);
          }
        }
      } catch (err) {
        console.error('Gagal mengambil daftar program:', err);
      }
    }

    fetchLivePrograms();
  }, []);

  return (
    <div className="pt-[72px]">
      {/* Hero 320px */}
      <PageHero
        image="/images/banners/program.jpg"
        imageAlt="Simbol program dakwah dan sosial: buku, sekolah, dan kubah masjid saat matahari terbit"
        badge={
          <>
            <Layers className="w-3.5 h-3.5" />
            <span>Khidmah Yayasan</span>
          </>
        }
        title={<>Program Kerja &amp; Dakwah YIMI</>}
        subtitle="Menebar kebaikan dan membina umat melalui pendidikan sunnah, majelis ilmu syar'i, dan kepedulian sosial."
      />

      {/* Program Detailed Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((item) => {
              const iconKey = (item.ikon || item.icon || 'BookOpen') as keyof typeof iconMap;
              const IconComponent = iconMap[iconKey] || BookOpen;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yimi-blue-500 rounded-2xl"
                  aria-label={`Program ${item.judul} - ${item.highlight}`}
                >
                  <Card
                    hoverEffect
                    className="p-8 h-full flex flex-col justify-between border-neutral-200/80 hover:border-yimi-blue-600/30"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-yimi-blue-50 text-yimi-green-700 flex items-center justify-center group-hover:bg-yimi-blue-600 group-hover:text-white transition-colors duration-300">
                          <IconComponent className="w-7 h-7 stroke-[1.75]" />
                        </div>
                        <Badge variant="blue">{item.kategori}</Badge>
                      </div>

                      <h2 className="text-2xl font-bold text-yimi-blue-800 mb-3 group-hover:text-yimi-blue-600 transition-colors">
                        {item.judul}
                      </h2>

                      <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
                        {item.ringkasan}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                          Fokus:
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-700">
                          {item.targetUsia}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-yimi-green-700">
                          {item.highlight}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-500">
                        {item.tag}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-yimi-blue-600 group-hover:text-yimi-blue-800 transition-colors"
                      >
                        <span>Lihat Selengkapnya</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
