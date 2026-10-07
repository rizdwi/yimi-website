import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import programsData from '@/content/programs/index.json';

const iconMap = {
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Landmark,
};

export function ProgramCards() {
  return (
    <section className="py-20 md:py-24 bg-neutral-100/60 relative">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yimi-green-500" />
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

        {/* 4 Program Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {programsData.map((item) => {
            const IconComponent =
              iconMap[item.icon as keyof typeof iconMap] || BookOpen;

            return (
              <Card
                key={item.id}
                hoverEffect
                className="flex flex-col justify-between p-6 border-neutral-200/80 hover:border-yimi-blue-600/30 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-yimi-blue-50 text-yimi-green-700 flex items-center justify-center group-hover:bg-yimi-blue-600 group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <Badge variant="blue" className="text-[10px]">
                      {item.kategori}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-yimi-blue-800 mb-2 group-hover:text-yimi-blue-600 transition-colors line-clamp-2">
                    {item.judul}
                  </h3>

                  <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed mb-4">
                    {item.ringkasan}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">
                    {item.highlight}
                  </span>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-sm font-bold text-yimi-blue-600 group-hover:text-yimi-blue-800 transition-colors"
                  >
                    <span>Detail</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
