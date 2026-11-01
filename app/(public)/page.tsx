import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/sections/Hero';
import { IntroVision } from '@/components/sections/IntroVision';
import { ProgramCards } from '@/components/sections/ProgramCards';
import { LandBanner } from '@/components/sections/LandBanner';
import { LatestNews } from '@/components/sections/LatestNews';
import { HomeFaq } from '@/components/sections/HomeFaq';
import { constructMetadata } from '@/lib/seo';
import { getHomeData } from '@/lib/home-data';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';

const KajianSchedule = dynamic(() =>
  import('@/components/sections/KajianSchedule').then((m) => m.KajianSchedule)
);
const GalleryPreview = dynamic(() =>
  import('@/components/sections/GalleryPreview').then((m) => m.GalleryPreview)
);
const ContactCta = dynamic(() =>
  import('@/components/sections/ContactCta').then((m) => m.ContactCta)
);

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: 'Yayasan Islam Karawang & Cikampek',
  description:
    'Yayasan Insan Muslim Istiqomah (YIMI) — yayasan dakwah Islam bermanhaj Salafus Shalih di Karawang & Cikampek. Pusat kajian sunnah, TK Islam Karawang, dan wakaf pembebasan lahan.',
  canonical: '/',
});

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <FaqJsonLd
        faqs={[
          {
            question:
              'Apa profil dan fokus dakwah Yayasan Insan Muslim Istiqomah (YIMI)?',
            answer:
              'Yayasan Insan Muslim Istiqomah (YIMI) adalah yayasan Islam di Karawang dan Cikampek yang berkhidmat dalam dakwah Islam bermanhaj Salafus Shalih, pendidikan anak usia dini (PAUD/TK Islam), serta aksi sosial kemanusiaan. Berpusat di Perum Bumi Cikampek Baru, Balonggandu, Jatisari, YIMI berupaya menyebarkan dakwah yang murni berlandaskan Al-Qur’an dan As-Sunnah.',
          },
          {
            question:
              'Bagaimana kurikulum dan pendaftaran TK Islam Insan Muslim Istiqomah di Karawang?',
            answer:
              'TK Islam Insan Muslim Istiqomah adalah TK Islam di Karawang yang fokus menanamkan aqidah shahihah, pembiasaan adab islami, hafalan Al-Qur’an (Juz 30), hafalan hadits dan doa harian, serta motorik anak usia dini dengan suasana belajar yang aman dan penuh kasih sayang.',
          },
          {
            question:
              'Di mana tempat kajian sunnah di Karawang dan kapan jadwal rutinnya?',
            answer:
              'YIMI menyelenggarakan tempat kajian sunnah di Karawang secara berkala di Sekretariat YIMI, Perum Bumi Cikampek Baru Blok B3 No. 10, Balonggandu, Jatisari, Karawang. Kajian rutin diadakan setiap Ahad (Pekan ke-2 & ke-4 ba’da Ashar) membahas Kitab Ushul Tsalatsah dan Fiqih Ibadah bersama Ustadz Ahmad Tonarih Al-Atsary, terbuka gratis untuk umum.',
          },
          {
            question:
              'Bagaimana cara berpartisipasi dalam program wakaf pembebasan lahan di Karawang?',
            answer:
              'Program wakaf Karawang YIMI ditujukan untuk pembebasan tanah seluas 840 m² guna pembangunan Masjid Jami’ dan gedung representatif TK Islam di Cikampek–Jatisari. Muhsinin dapat menyalurkan wakaf tunai mulai Rp 50.000,- atau paket pembebasan lahan per meter (Rp 500.000,-/m²) ke rekening BSI 7182045556 a.n. Yayasan Insan Muslim Istiqomah.',
          },
          {
            question:
              'Apa saja wilayah khidmah dan kegiatan sosial Yayasan Islam Cikampek ini?',
            answer:
              'Selain pendidikan dan dakwah, YIMI menyalurkan Sedekah Jumat Berkah dan bantuan sosial sembako kepada fakir miskin, janda, dan dhuafa di wilayah Cikampek, Jatisari, Kotabaru, Cilamaya, dan sekitarnya di Kabupaten Karawang.',
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
      <HomeFaq />
      <ContactCta />
    </>
  );
}
