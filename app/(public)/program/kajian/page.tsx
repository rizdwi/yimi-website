'use client';

import React from 'react';
import {
  BookOpen,
  Clock,
  MapPin,
  User,
  CalendarPlus,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { downloadIcsFile } from '@/lib/ics';
import kajianProgramData from '@/content/programs/kajian.json';
import kajianScheduleData from '@/content/kajian.json';

export default function KajianProgramPage() {
  const todayStr = new Date().toISOString().split('T')[0];

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
            <BookOpen className="w-3.5 h-3.5" />
            <span>Majelis Talabul &apos;Ilmi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            {kajianProgramData.judul}
          </h1>
          <p className="text-base text-blue-100 max-w-xl mx-auto">
            {kajianProgramData.subjudul}
          </p>
        </div>
      </section>

      {/* Deskripsi & Dalil */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800">
                Pentingnya Menuntut Ilmu Syar&apos;i yang Murni
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 leading-relaxed">
                {kajianProgramData.deskripsi}
              </p>
            </div>

            {/* Dalil Box */}
            <div className="lg:col-span-5 bg-yimi-blue-50/70 border border-yimi-blue-600/20 rounded-3xl p-8 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-yimi-blue-600 bg-white px-3 py-1 rounded-full border border-yimi-blue-600/20 mb-4 inline-block">
                Landasan Hadits Shahih
              </span>
              <p
                lang="ar"
                dir="rtl"
                className="font-arabic text-2xl sm:text-3xl text-yimi-blue-800 leading-[1.8] my-4 text-center"
              >
                {kajianProgramData.landasanDalil.arab}
              </p>
              <p className="text-sm text-neutral-700 italic leading-relaxed text-center mb-3">
                &ldquo;{kajianProgramData.landasanDalil.terjemahan}&rdquo;
              </p>
              <p className="text-xs font-bold text-center text-yimi-green-700">
                {kajianProgramData.landasanDalil.sumber}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seluruh Jadwal Kajian */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Jadwal Lengkap Majelis Ilmu
            </h2>
            <p className="text-sm text-neutral-600">
              Kajian diselenggarakan secara rutin terbuka untuk ikhwan dan akhwat dengan tempat terpisah.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {kajianScheduleData.map((item) => {
              const isToday = item.tanggal === todayStr;

              return (
                <Card
                  key={item.id}
                  hoverEffect
                  className="p-6 border-neutral-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left Date */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-20 md:w-24 py-3 bg-yimi-blue-50 rounded-2xl flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-bold uppercase text-yimi-blue-600">
                        {item.hari}
                      </span>
                      <span className="text-2xl md:text-3xl font-extrabold text-yimi-blue-800 font-mono my-1">
                        {new Date(item.tanggal).getDate()}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-500">
                        {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(
                          new Date(item.tanggal)
                        )}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 md:hidden">
                      {isToday && <Badge variant="green">Hari Ini</Badge>}
                      <Badge variant="blue" className="text-[10px]">
                        {item.kategori}
                      </Badge>
                    </div>
                  </div>

                  {/* Middle Info */}
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

                    <h3 className="text-lg md:text-xl font-bold text-yimi-blue-800">
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
                        <span>{item.tempat}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Download Button */}
                  <div className="w-full md:w-auto flex items-center justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => downloadIcsFile(item)}
                      className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>Simpan Jadwal (.ics)</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fasilitas & Tata Tertib Majelis */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Fasilitas */}
            <div className="p-8 rounded-3xl bg-neutral-50 border border-neutral-200/80">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck className="w-6 h-6 text-yimi-blue-600" />
                <h3 className="text-xl font-bold text-yimi-blue-800">
                  Fasilitas Majelis
                </h3>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-neutral-700">
                {kajianProgramData.fasilitas.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-yimi-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Adab Majelis */}
            <div className="p-8 rounded-3xl bg-yimi-blue-50/60 border border-yimi-blue-600/20">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-yimi-blue-600" />
                <h3 className="text-xl font-bold text-yimi-blue-800">
                  Adab &amp; Tata Tertib Majelis
                </h3>
              </div>
              <ul className="flex flex-col gap-3 text-sm text-neutral-700">
                {kajianProgramData.tataTertib.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-yimi-blue-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
