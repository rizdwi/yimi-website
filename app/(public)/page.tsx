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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Metadata homepage dioptimasi untuk kata kunci target: yayasan sunnah salafiyah + lokal Cikampek/Karawang.
export const metadata: Metadata = constructMetadata({
  title: 'Yayasan Sunnah Salafiyah Cikampek & Karawang',
  description:
    'Yayasan Insan Muslim Istiqomah (YIMI) — yayasan dakwah sunnah bermanhaj salaf di Cikampek, Karawang. TK/PAUD Islam, kajian rutin, Jumat Berkah, dan wakaf pembebasan lahan.',
  canonical: '/',
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroVision />
      <ProgramCards />
      <LandBanner />
      <KajianSchedule />
      <LatestNews />
      <GalleryPreview />
      <ContactCta />
    </>
  );
}
