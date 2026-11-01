import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import KajianProgramPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Tempat Kajian Sunnah Karawang, Cikampek & Jatisari',
  description:
    'Tempat kajian Sunnah di Karawang: Cikampek, Jatisari dan sekitarnya — jadwal kajian Islam rutin YIMI: aqidah, fiqih, dan adab di atas sunnah sesuai pemahaman salafus shalih.',
  canonical: '/program/kajian',
});

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Program Kerja', item: '/program' },
          { name: 'Tempat Kajian Sunnah', item: '/program/kajian' },
        ]}
      />
      <FaqJsonLd
        faqs={[
          {
            question: 'Di mana tempat kajian Sunnah di Karawang?',
            answer:
              'Yayasan Insan Muslim Istiqomah (YIMI) rutin mengadakan tempat kajian Sunnah di Karawang (Cikampek, Jatisari dan sekitarnya) — membahas aqidah, fiqih, dan adab di atas sunnah sesuai pemahaman salafus shalih.',
          },
          {
            question: 'Kapan jadwal kajian rutin YIMI Karawang?',
            answer:
              'Jadwal kajian rutin YIMI di Karawang diperbarui berkala dan dapat dilihat di halaman Program Kajian website ini.',
          },
          {
            question: 'Apakah kajian YIMI terbuka untuk umum?',
            answer:
              'Ya. Kajian yang diadakan YIMI di Karawang terbuka untuk umum — muslimin dan muslimat dipersilakan hadir sesuai jadwal yang diumumkan.',
          },
        ]}
      />
      <KajianProgramPage />
    </>
  );
}
