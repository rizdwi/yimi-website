import { Hero } from '@/components/sections/Hero';
import { IntroVision } from '@/components/sections/IntroVision';
import { ProgramCards } from '@/components/sections/ProgramCards';
import { LandBanner } from '@/components/sections/LandBanner';
import { KajianSchedule } from '@/components/sections/KajianSchedule';
import { LatestNews } from '@/components/sections/LatestNews';
import { GalleryPreview } from '@/components/sections/GalleryPreview';
import { ContactCta } from '@/components/sections/ContactCta';

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
