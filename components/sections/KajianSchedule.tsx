'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, MapPin, User, CalendarPlus, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { downloadIcsFile } from '@/lib/ics';
import kajianScheduleData from '@/content/kajian.json';

export function KajianSchedule() {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section className="py-20 md:py-24 bg-white relative">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yimi-green-500" />
              Majelis Ilmu Syar&apos;i
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight">
              Jadwal Kajian Terdekat
            </h2>
          </div>
          <Link
            href="/program/kajian"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-yimi-blue-600 hover:text-yimi-blue-800 transition-colors"
          >
            <span>Lihat Semua Jadwal &amp; Kitab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Horizontal Schedule Cards */}
        <div className="flex flex-col gap-4">
          {kajianScheduleData.slice(0, 3).map((item) => {
            const isToday = item.tanggal === todayStr;

            return (
              <Card
                key={item.id}
                hoverEffect
                className="p-5 md:p-6 border-neutral-200/80 hover:border-yimi-blue-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
              >
                {/* Left: Date Block */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-20 md:w-24 py-3 bg-yimi-blue-50 group-hover:bg-yimi-blue-600 rounded-2xl flex flex-col items-center justify-center text-center transition-colors duration-300">
                    <span className="text-xs font-bold uppercase tracking-wider text-yimi-blue-600 group-hover:text-blue-100 transition-colors">
                      {item.hari}
                    </span>
                    <span className="text-2xl md:text-3xl font-extrabold text-yimi-blue-800 group-hover:text-white font-mono leading-none my-1 transition-colors">
                      {new Date(item.tanggal).getDate()}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-500 group-hover:text-blue-200 transition-colors">
                      {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(
                        new Date(item.tanggal)
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 md:hidden">
                    {isToday && (
                      <Badge variant="green" className="w-fit">
                        Hari Ini
                      </Badge>
                    )}
                    <Badge variant="blue" className="w-fit text-[10px]">
                      {item.kategori}
                    </Badge>
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="hidden md:flex items-center gap-2">
                    {isToday && <Badge variant="green">Hari Ini</Badge>}
                    <Badge variant="blue" className="text-[10px]">
                      {item.kategori}
                    </Badge>
                    <span className="text-xs text-neutral-500 font-medium">
                      {item.sifat}
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-yimi-blue-800 group-hover:text-yimi-blue-600 transition-colors leading-snug">
                    {item.tema}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs md:text-sm text-neutral-600">
                    <div className="flex items-center gap-1.5 text-yimi-blue-800 font-semibold">
                      <User className="w-4 h-4 text-yimi-green-700 shrink-0" />
                      <span>{item.pemateri}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{item.waktu}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="line-clamp-1">{item.tempat}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full md:w-auto flex items-center justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadIcsFile(item)}
                    className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs"
                    title="Simpan ke Google / Apple Calendar (.ics)"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>+ Kalender</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
