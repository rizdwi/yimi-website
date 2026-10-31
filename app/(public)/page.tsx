import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero';
import { IntroVision } from '@/components/sections/IntroVision';
import { ProgramCards } from '@/components/sections/ProgramCards';
import { LandBanner } from '@/components/sections/LandBanner';
import { LatestNews } from '@/components/sections/LatestNews';
import { constructMetadata } from '@/lib/seo';
import { getHomeData } from '@/lib/home-data';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';

// Section client di bawah fold di-split dari bundle awal (next/dynamic,
// tetap SSR) agar JS awal lebih ringan — parser & eksekusi JS tidak
// berebut bandwidth/CPU dengan logo (elemen LCP) di slow 4G. Section
// server (IntroVision, ProgramCards, LandBanner, LatestNews) tidak punya
// JS, jadi tidak perlu di-split.
const KajianSchedule = dynamic(() =>
  import('@/components/sections/KajianSchedule').then((m) => m.KajianSchedule)
);
const GalleryPreview = dynamic(() =>
  import('@/components/sections/GalleryPreview').then((m) => m.GalleryPreview)
);
const ContactCta = dynamic(() =>
  import('@/components/sections/ContactCta').then((m) => m.ContactCta)
);

// ISR 60 dtk: HTML beranda di-cache di edge Vercel (TTFB cepat), konten CMS
// tetap segar (diperbarui maks 60 dtk setelah perubahan). Sebelumnya
// force-dynamic — setiap request me-render ulang & semua section fetch
// client-side, sehingga LCP 4,1 dtk & CLS 0,19 (PageSpeed 27 Okt 2026).
export const revalidate = 60;

// Metadata homepage — perintah user 2026-10-31: title = nama resmi yayasan.
export const metadata: Metadata = constructMetadata({
  title: 'Yayasan Insan Muslim Istiqomah',
  description:
    'Yayasan Insan Muslim Istiqomah (YIMI) — yayasan dakwah sunnah bermanhaj salaf di Karawang: Cikampek, Jatisari dan sekitarnya. TK Islam, tempat kajian Sunnah, Jumat Berkah, dan wakaf pembebasan lahan.',
  canonical: '/',
});

export default async function HomePage() {
  // Ambil SEMUA data beranda di server (paralel) — section menerima data
  // sebagai props dan me-render di HTML awal, bukan fetch client-side.
  const data = await getHomeData();

  return (
    <>
      <FaqJsonLd
        faqs={[
          {
            question: 'Apa itu Yayasan Insan Muslim Istiqomah (YIMI)?',
            answer:
              'Yayasan Insan Muslim Istiqomah (YIMI) adalah yayasan Islam di Karawang yang bergerak di bidang dakwah, pendidikan, dan sosial kemanusiaan — mengajak kepada pemurnian aqidah dan ibadah berlandaskan Al-Qur\u2019an dan As-Sunnah sesuai pemahaman Salafus Shalih.',
          },
          {
            question: 'Di mana lokasi Yayasan Insan Muslim Istiqomah?',
            answer:
              'YIMI beralamat di Perum Bumi Cikampek Baru Blok B3 No. 10, Desa Balonggandu, Kecamatan Jatisari, Kabupaten Karawang, Jawa Barat 41373 — melayani Cikampek, Jatisari, dan sekitarnya.',
          },
          {
            question: 'Apa saja program unggulan YIMI?',
            answer:
              'Program unggulan YIMI meliputi TK Islam Insan Muslim Istiqomah di Karawang, tempat kajian Sunnah rutin di Karawang, Sedekah Jumat Berkah, dan program wakaf pembebasan lahan untuk masjid dan sentra dakwah di Karawang.',
          },
          {
            question: 'Bagaimana cara berwakaf melalui YIMI Karawang?',
            answer:
              'Wakaf untuk pembebasan lahan masjid dan sentra dakwah YIMI di Karawang dapat disalurkan melalui halaman Donasi di website ini atau menghubungi WhatsApp YIMI di +62 812-1936-2077.',
          },
        ]}
      />
      <Hero tagline={data.hero.tagline} subtitle={data.hero.subtitle} />
      <IntroVision dalil={data.dalil} />
      <ProgramCards programs={data.programs} />
      <LandBanner campaign={data.campaign} />
      <KajianSchedule kajian={data.kajian} />
      <LatestNews news={data.news} />
      <GalleryPreview items={data.gallery} />
      <ContactCta />
    </>
  );
}
