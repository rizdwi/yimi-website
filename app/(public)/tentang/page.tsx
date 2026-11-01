import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { ShieldCheck, BookOpen, Users, Compass, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHero } from '@/components/ui/PageHero';
import { StarOrnament } from '@/components/ui/StarOrnament';
import { constructMetadata } from '@/lib/seo';
import aboutData from '@/content/about.json';
import siteData from '@/content/site.json';
import { supabase } from '@/lib/supabase';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: 'Yayasan Islam Karawang: Profil & Legalitas YIMI Cikampek',
  description:
    'Profil resmi Yayasan Islam Karawang — Insan Muslim Istiqomah (YIMI): visi, misi dakwah sunnah salaf, susunan pengurus, legalitas SK Kemenkumham, dan kantor sekretariat di Cikampek.',
  canonical: '/tentang',
});

interface AboutContent {
  visi?: string;
  misi?: string[];
  manhaj?: {
    judul?: string;
    penjelasan?: string;
    dalilQuran?: {
      arab?: string;
      teksArab?: string;
      terjemahan?: string;
      sumber?: string;
    };
    dalilHadits?: {
      arab?: string;
      teksArab?: string;
      terjemahan?: string;
      sumber?: string;
    };
  };
  sejarah?: {
    teks?: string;
  };
  strukturPengurus?: Array<{
    jabatan: string;
    nama: string;
    peran: string;
  }>;
  maknaLambang?: Array<{
    elemen: string;
    makna: string;
  }>;
}

// Wilayah jangkauan dakwah & layanan YIMI. Sekretariat YIMI hanya ada satu,
// di Jatisari, Karawang — keempat wilayah ini adalah wilayah jangkauan,
// bukan kantor cabang.
const wilayahLayanan: Array<{ wilayah: string; deskripsi: string }> = [
  {
    wilayah: 'Cikampek',
    deskripsi:
      'Di Cikampek, YIMI menyelenggarakan pendidikan TK Islam serta menggalang wakaf pembebasan lahan untuk Masjid Jami\u2019 YIMI dan sentra dakwah.',
  },
  {
    wilayah: 'Karawang',
    deskripsi:
      'Sebagai yayasan yang berkedudukan di Kabupaten Karawang, YIMI melayani kaum muslimin Karawang melalui kajian rutin, TK Islam, dan program sosial Jumat Berkah.',
  },
  {
    wilayah: 'Jatisari',
    deskripsi:
      'Sekretariat YIMI berada di Desa Balonggandu, Kecamatan Jatisari, dan menjadi pusat layanan dakwah, pendidikan, serta sosial bagi warga Jatisari.',
  },
  {
    wilayah: 'Cilamaya',
    deskripsi:
      'Kaum muslimin di Cilamaya dapat mengikuti kajian rutin YIMI yang gratis dan terbuka untuk umum serta program sosial Jumat Berkah.',
  },
];

// Tanya jawab seputar YIMI — tampil sebagai teks di halaman dan sebagai
// FAQPage JSON-LD (dibangun dari array yang sama) agar Google dapat
// mengutipnya di hasil pencarian dan Ringkasan AI.
const faqItems: Array<{ pertanyaan: string; jawaban: string }> = [
  {
    pertanyaan: 'Yayasan Islam apa saja yang ada di Cikampek?',
    jawaban: `Salah satu yayasan Islam di Cikampek adalah Yayasan Insan Muslim Istiqomah (YIMI), yayasan dakwah dan pendidikan Islam bermanhaj salaf yang berkedudukan di ${siteData.kontak.alamat}. YIMI menyelenggarakan TK Islam, kajian rutin, program sosial Jumat Berkah, dan pembebasan lahan wakaf.`,
  },
  {
    pertanyaan: 'Di mana alamat Yayasan Insan Muslim Istiqomah (YIMI)?',
    jawaban: `Sekretariat Yayasan Insan Muslim Istiqomah (YIMI) beralamat di ${siteData.kontak.alamat}. Jam operasional ${siteData.kontak.jamOperasional}.`,
  },
  {
    pertanyaan: 'Apakah YIMI melayani warga Jatisari?',
    jawaban:
      'Ya. Sekretariat YIMI berada di Desa Balonggandu, Kecamatan Jatisari, sehingga warga Jatisari dapat mengikuti kajian rutin, mendaftarkan putra-putrinya ke TK Islam Insan Muslim Istiqomah, serta mengikuti program sosial Jumat Berkah.',
  },
  {
    pertanyaan: 'Apakah ada yayasan Islam di Cilamaya?',
    jawaban:
      'YIMI tidak berkantor di Cilamaya — satu-satunya sekretariat YIMI berada di Jatisari, Karawang — tetapi kaum muslimin di Cilamaya dapat mengikuti kajian rutin YIMI yang gratis dan terbuka untuk umum serta program sosial Jumat Berkah.',
  },
  {
    pertanyaan: 'Apa saja program Yayasan Insan Muslim Istiqomah di Karawang?',
    jawaban:
      'Program YIMI di Karawang meliputi pendidikan anak usia dini di TK Islam Insan Muslim Istiqomah, kajian ilmiah salaf yang gratis dan terbuka untuk umum, sedekah Jumat Berkah berupa makanan dan sembako untuk yatim piatu, dhuafa, dan jamaah shalat Jumat, serta pembebasan lahan wakaf untuk Masjid Jami\u2019 YIMI dan ruang kelas TK.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.pertanyaan,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.jawaban,
    },
  })),
};

export default async function TentangPage() {
  let content: AboutContent = aboutData;
  let logoUrl = '/logo/logo-yimi.svg';

  try {
    const [pageRes, settingsRes] = await Promise.all([
      supabase.from('static_pages').select('konten').eq('kunci', 'tentang').maybeSingle(),
      supabase.from('site_settings').select('logo_yayasan, foto_yayasan').limit(1).maybeSingle(),
    ]);

    if (pageRes.data?.konten) {
      content = {
        ...aboutData,
        ...(pageRes.data.konten as AboutContent),
      };
    }

    if (settingsRes.data) {
      logoUrl = settingsRes.data.logo_yayasan || settingsRes.data.foto_yayasan || '/logo/logo-yimi.svg';
    }
  } catch (err) {
    console.error('Failed to load static page dari Supabase:', err);
  }

  const visi = content.visi || aboutData.visi;
  const misi = Array.isArray(content.misi) ? content.misi : aboutData.misi;
  const manhaj = {
    judul: content.manhaj?.judul || aboutData.manhaj.judul,
    penjelasan: content.manhaj?.penjelasan || aboutData.manhaj.penjelasan,
    dalilQuran: {
      arab:
        content.manhaj?.dalilQuran?.teksArab ||
        content.manhaj?.dalilQuran?.arab ||
        aboutData.manhaj.dalilQuran.arab,
      terjemahan:
        content.manhaj?.dalilQuran?.terjemahan || aboutData.manhaj.dalilQuran.terjemahan,
      sumber: content.manhaj?.dalilQuran?.sumber || aboutData.manhaj.dalilQuran.sumber,
    },
    dalilHadits: {
      arab:
        content.manhaj?.dalilHadits?.teksArab ||
        content.manhaj?.dalilHadits?.arab ||
        aboutData.manhaj.dalilHadits.arab,
      terjemahan:
        content.manhaj?.dalilHadits?.terjemahan || aboutData.manhaj.dalilHadits.terjemahan,
      sumber: content.manhaj?.dalilHadits?.sumber || aboutData.manhaj.dalilHadits.sumber,
    },
  };
  const sejarah = content.sejarah || aboutData.sejarah;
  const strukturPengurus = Array.isArray(content.strukturPengurus)
    ? content.strukturPengurus
    : aboutData.strukturPengurus;
  const maknaLambang = content.maknaLambang || aboutData.maknaLambang;

  return (
    <div className="pt-[72px]">
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Tentang Yayasan & Manhaj', item: '/tentang' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Subpage Hero (Height 320px) */}
      <PageHero
        image="/images/banners/tentang.jpg"
        imageAlt="Al-Qur'an bercahaya dengan ornamen geometris Islami"
        badge={
          <>
            <Compass className="w-3.5 h-3.5" />
            <span>Mengenal YIMI</span>
          </>
        }
        title={<>Tentang Yayasan &amp; Manhaj</>}
        subtitle="Dakwah di atas sunnah berlandaskan Al-Qur'an dan As-Sunnah sesuai pemahaman Salafus Shalih."
      />

      {/* Visi & Misi Section (Dua Kolom) */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Visi Card */}
            <div className="lg:col-span-5 bg-yimi-blue-50/70 border border-yimi-blue-600/20 rounded-3xl p-8 shadow-xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-blue-600 mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Arah Visi</span>
              </div>
              <h2 className="text-2xl font-extrabold text-yimi-blue-800 mb-4">
                Visi Yayasan
              </h2>
              <p className="text-base sm:text-lg text-neutral-700 font-medium leading-relaxed italic">
                &ldquo;{visi}&rdquo;
              </p>
            </div>

            {/* Misi List */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-1">
                <CheckCircle2 className="w-4 h-4 text-yimi-green-500" />
                <span>Langkah Konkret</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 mb-2">
                Misi Utama
              </h2>
              <div className="flex flex-col gap-3">
                {misi.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-yimi-blue-600/20 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-xl bg-yimi-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed pt-0.5">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manhaj & Dalil Section */}
      <section className="py-20 bg-neutral-100/60 relative overflow-hidden">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <StarOrnament size={36} color="#567790" accentColor="#5eb2f2" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight mt-3 mb-4">
              {manhaj.judul}
            </h2>
            <p className="text-base text-neutral-600 leading-relaxed">
              {manhaj.penjelasan}
            </p>
          </div>

          {/* Dalil Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Dalil Quran */}
            <Card className="p-8 border-yimi-blue-600/15 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-yimi-blue-600 bg-yimi-blue-50 px-3 py-1 rounded-full border border-yimi-blue-600/20">
                  Landasan Al-Qur&apos;an
                </span>
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-arabic text-2xl sm:text-3xl text-yimi-blue-800 leading-[1.8] my-5 text-right"
                >
                  {manhaj.dalilQuran.arab}
                </p>
                <p className="text-sm text-neutral-700 italic leading-relaxed mb-4">
                  &ldquo;{manhaj.dalilQuran.terjemahan}&rdquo;
                </p>
              </div>
              <span className="text-xs font-bold text-yimi-green-700">
                {manhaj.dalilQuran.sumber}
              </span>
            </Card>

            {/* Dalil Hadits */}
            <Card className="p-8 border-yimi-blue-600/15 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-yimi-green-700 bg-emerald-50 px-3 py-1 rounded-full border border-yimi-green-500/30">
                  Landasan Hadits Sunnah
                </span>
                <p
                  lang="ar"
                  dir="rtl"
                  className="font-arabic text-2xl sm:text-3xl text-yimi-blue-800 leading-[1.8] my-5 text-right"
                >
                  {manhaj.dalilHadits.arab}
                </p>
                <p className="text-sm text-neutral-700 italic leading-relaxed mb-4">
                  &ldquo;{manhaj.dalilHadits.terjemahan}&rdquo;
                </p>
              </div>
              <span className="text-xs font-bold text-yimi-green-700">
                {manhaj.dalilHadits.sumber}
              </span>
            </Card>
          </div>
        </div>
      </section>

      {/* Sejarah Singkat */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <BookOpen className="w-4 h-4" />
              <span>Rekam Jejak</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-yimi-blue-800 tracking-tight mb-6">
              Sejarah Berdirinya Yayasan
            </h2>
            <div className="p-8 rounded-3xl bg-neutral-50 border border-neutral-200/80 text-neutral-700 leading-relaxed text-base">
              <p className="mb-4">
                {sejarah.teks}
              </p>
              <div className="border-t border-neutral-200/80 pt-4 mt-6 flex items-center justify-between text-xs text-neutral-500">
                <span>Legalitas Yayasan Terdaftar Resmi Kemenkumham RI</span>
                <span className="font-semibold text-yimi-blue-600">Kota Depok, Jawa Barat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Pengurus */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <Users className="w-4 h-4" />
              <span>Amanah Organisasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Susunan Pengurus Yayasan
            </h2>
            <p className="text-sm text-neutral-600">
              Pengurus dan asatidzah pembina yang mengemban amanah pengelolaan dakwah dan operasional yayasan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {strukturPengurus.map((item, idx) => (
              <Card key={idx} hoverEffect className="p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-yimi-blue-600 block mb-1">
                    {item.jabatan}
                  </span>
                  <h3 className="text-lg font-bold text-yimi-blue-800 mb-2">
                    {item.nama}
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.peran}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] text-yimi-green-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Amanah Aktif</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Makna Lambang (Design Spec 1 & PRD F-ABOUT-05) */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Filosofi &amp; Makna Logo YIMI
            </h2>
            <p className="text-sm text-neutral-600">
              Setiap elemen visual dalam lambang yayasan melambangkan nilai syar&apos;i, semangat dakwah, dan komitmen istiqomah.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Center Logo Showcase */}
            <div className="lg:col-span-5 flex items-center justify-center p-8 bg-yimi-blue-50/50 rounded-3xl border border-yimi-blue-600/15">
              <div className="w-56 h-56 relative drop-shadow-[0_8px_24px_rgba(0,40,70,0.12)] flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt="Logo Lengkap YIMI"
                  width={224}
                  height={224}
                  unoptimized={Boolean(logoUrl && logoUrl.endsWith('.svg'))}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Elements Description */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {maknaLambang.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-yimi-blue-600/20 transition-colors"
                >
                  <h3 className="text-sm font-bold text-yimi-blue-800 mb-1.5 flex items-center gap-2">
                    <span>{item.elemen}</span>
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.makna}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wilayah Dakwah & Layanan */}
      <section className="py-20 bg-neutral-100/60">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yimi-green-700 mb-2">
              <Compass className="w-4 h-4" />
              <span>Jangkauan Layanan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
              Wilayah Dakwah &amp; Layanan
            </h2>
            <p className="text-sm text-neutral-600">
              Sekretariat YIMI hanya ada satu, yaitu di Jatisari, Karawang.
              Keempat wilayah berikut adalah wilayah jangkauan dakwah dan
              layanan YIMI, bukan kantor cabang.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-10 p-6 rounded-3xl bg-white border border-yimi-blue-600/15 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-yimi-blue-600 mb-2">
              Alamat Sekretariat Yayasan
            </p>
            <p className="text-base sm:text-lg font-bold text-yimi-blue-800 leading-relaxed">
              {siteData.kontak.alamat}
            </p>
            <p className="text-sm text-neutral-600 mt-2">
              Jam operasional: {siteData.kontak.jamOperasional}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {wilayahLayanan.map((item) => (
              <div
                key={item.wilayah}
                className="p-6 rounded-2xl bg-white border border-neutral-100 hover:border-yimi-blue-600/20 transition-colors"
              >
                <h3 className="text-lg font-bold text-yimi-blue-800 mb-2">
                  {item.wilayah}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pertanyaan yang Sering Diajukan */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] w-full mx-auto px-5 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yimi-blue-800 tracking-tight mb-3">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-sm text-neutral-600">
                Jawaban seputar lokasi, wilayah layanan, dan program Yayasan
                Insan Muslim Istiqomah.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {faqItems.map((item) => (
                <div
                  key={item.pertanyaan}
                  className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100"
                >
                  <h3 className="text-base sm:text-lg font-bold text-yimi-blue-800 mb-2">
                    {item.pertanyaan}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
                    {item.jawaban}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
