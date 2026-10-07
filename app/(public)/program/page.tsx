import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { constructMetadata } from '@/lib/seo';
import programsData from '@/content/programs/index.json';

export const metadata: Metadata = constructMetadata({
  title: 'Program Dakwah, Pendidikan, & Sosial',
  description:
    'Rangkaian program Yayasan Insan Muslim Istiqomah: TK/PAUD Islam Istiqomah, Jumat Berkah, Kajian Islam Ilmiah, dan Pembebasan Lahan Wakaf.',
});

const iconMap = {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
};

export default function ProgramIndexPage() {
  return (
    <div className="pt-[72px]">
      {/* Hero 320px */}
      <section className="relative h-80 min-h-[320px] bg-yimi-blue-800 text-white flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-star8-pattern opacity-[0.06] pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-yimi-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Khidmah Yayasan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Program Kerja &amp; Dakwah YIMI
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            Menebar kebaikan dan membina umat melalui pendidikan sunnah, majelis ilmu syar&apos;i, dan kepedulian sosial.
          </p>
        </div>
      </section>

      {/* Program Detailed Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programsData.map((item) => {
              const IconComponent =
                iconMap[item.icon as keyof typeof iconMap] || BookOpen;

              return (
                <Card
                  key={item.id}
                  hoverEffect
                  className="p-8 flex flex-col justify-between border-neutral-200/80 hover:border-yimi-blue-600/30 group"
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
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-yimi-blue-600 group-hover:text-yimi-blue-800 transition-colors"
                    >
                      <span>Lihat Selengkapnya</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
