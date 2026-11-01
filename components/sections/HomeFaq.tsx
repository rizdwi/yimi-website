'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export interface FaqItem {
  q: string;
  a: string;
  tag?: string;
  linkText?: string;
  linkHref?: string;
}

const FAQS: FaqItem[] = [
  {
    tag: 'Yayasan Islam Karawang',
    q: 'Apa profil dan fokus dakwah Yayasan Insan Muslim Istiqomah (YIMI)?',
    a: 'Yayasan Insan Muslim Istiqomah (YIMI) adalah yayasan Islam di Karawang dan Cikampek yang berkhidmat dalam dakwah Islam bermanhaj Salafus Shalih, pendidikan anak usia dini (PAUD/TK Islam), serta aksi sosial kemanusiaan. Berpusat di Perum Bumi Cikampek Baru, Balonggandu, Jatisari, YIMI berupaya menyebarkan dakwah yang murni berlandaskan Al-Qur’an dan As-Sunnah sesuai pemahaman para sahabat Nabi.',
    linkText: 'Pelajari Profil Lengkap Yayasan',
    linkHref: '/tentang',
  },
  {
    tag: 'TK Islam Karawang',
    q: 'Bagaimana kurikulum dan pendaftaran TK Islam Insan Muslim Istiqomah di Karawang?',
    a: 'TK Islam Insan Muslim Istiqomah adalah TK Islam di Karawang yang fokus menanamkan aqidah shahihah, pembiasaan adab islami, hafalan Al-Qur’an (Juz 30), hafalan hadits dan doa harian, serta motorik anak usia dini dengan suasana belajar yang aman dan penuh kasih sayang. Pendaftaran dibuka untuk anak usia 3–6 tahun dengan infaq pendidikan terjangkau.',
    linkText: 'Lihat Program & Fasilitas TK Islam',
    linkHref: '/program/tk-paud',
  },
  {
    tag: 'Tempat Kajian Sunnah Karawang',
    q: 'Di mana tempat kajian sunnah di Karawang dan kapan jadwal rutinnya?',
    a: 'YIMI menyelenggarakan kajian ilmiah syar’i secara berkala di Sekretariat YIMI, Perum Bumi Cikampek Baru Blok B3 No. 10, Balonggandu, Jatisari, Karawang. Kajian rutin diadakan setiap Ahad (Pekan ke-2 & ke-4 ba’da Ashar) membahas Kitab Ushul Tsalatsah, Fiqih Ibadah, dan Aqidah bersama Ustadz Ahmad Tonarih Al-Atsary, terbuka gratis untuk umum (ikhwan dan akhwat).',
    linkText: 'Cek Jadwal Majelis Kajian',
    linkHref: '/program/kajian',
  },
  {
    tag: 'Wakaf Karawang',
    q: 'Bagaimana cara berpartisipasi dalam program wakaf pembebasan lahan di Karawang?',
    a: 'Program wakaf Karawang YIMI ditujukan untuk pembebasan tanah seluas 840 m² guna pembangunan Masjid Jami’ dan gedung representatif TK Islam di Cikampek–Jatisari. Muhsinin dapat menyalurkan wakaf tunai mulai Rp 50.000,- atau paket pembebasan lahan per meter (Rp 500.000,-/m²) ke rekening BSI 7182045556 a.n. Yayasan Insan Muslim Istiqomah dan langsung memperoleh kuitansi digital resmi.',
    linkText: 'Ikut Berwakaf Lahan Sekarang',
    linkHref: '/pembebasan-lahan',
  },
  {
    tag: 'Sosial & Infaq',
    q: 'Apa saja wilayah khidmah dan kegiatan sosial Yayasan Islam Cikampek ini?',
    a: 'Selain pendidikan dan dakwah, YIMI menyalurkan Sedekah Jumat Berkah dan bantuan sosial sembako kepada fakir miskin, janda, dan dhuafa di wilayah Cikampek, Jatisari, Kotabaru, Cilamaya, dan sekitarnya di Kabupaten Karawang.',
    linkText: 'Donasi & Program Sosial',
    linkHref: '/donasi',
  },
];

export function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-neutral-50/80 border-t border-neutral-200/70 relative">
      <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yimi-blue-100/70 text-yimi-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-yimi-blue-600" />
            <span>Tanya Jawab Seputar YIMI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-900 tracking-tight mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Informasi ringkas seputar dakwah sunnah, TK Islam Karawang, jadwal kajian ilmiah, dan program wakaf pembebasan lahan.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.q}
                className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden transition-all duration-200 hover:border-yimi-blue-300"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full px-5 sm:px-6 py-4.5 text-left flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yimi-blue-500"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1">
                    {faq.tag && (
                      <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-yimi-green-700 bg-yimi-green-50 px-2 py-0.5 rounded mb-1.5">
                        {faq.tag}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                      {faq.q}
                    </h3>
                  </div>
                  <div
                    className={`mt-1 w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-yimi-blue-100 text-yimi-blue-800' : 'text-neutral-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-neutral-700 leading-relaxed border-t border-neutral-100 animate-fadeIn">
                    <p className="mb-3.5">{faq.a}</p>
                    {faq.linkHref && faq.linkText && (
                      <Link
                        href={faq.linkHref}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-yimi-blue-700 hover:text-yimi-blue-900 hover:underline transition"
                      >
                        <span>{faq.linkText}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
