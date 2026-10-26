import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { IntroVision } from '@/components/sections/IntroVision';
import { ProgramCards } from '@/components/sections/ProgramCards';
import { LandBanner } from '@/components/sections/LandBanner';
import { KajianSchedule } from '@/components/sections/KajianSchedule';
import { LatestNews } from '@/components/sections/LatestNews';
import { GalleryPreview } from '@/components/sections/GalleryPreview';
import { ContactCta } from '@/components/sections/ContactCta';
import { constructMetadata } from '@/lib/seo';
import { getHomeData } from '@/lib/home-data';

// ISR 60 dtk: HTML beranda di-cache di edge Vercel (TTFB cepat), konten CMS
// tetap segar (diperbarui maks 60 dtk setelah perubahan). Sebelumnya
// force-dynamic — setiap request me-render ulang & semua section fetch
// client-side, sehingga LCP 4,1 dtk & CLS 0,19 (PageSpeed 27 Okt 2026).
export const revalidate = 60;

// Metadata homepage dioptimasi untuk kata kunci target: yayasan sunnah salafiyah + lokal Karawang dulu (scope terbesar, termasuk pencari dari luar Karawang), lalu Cikampek & Jatisari.
export const metadata: Metadata = constructMetadata({
  title: 'Yayasan Sunnah Salafiyah Karawang, Cikampek & Jatisari',
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
