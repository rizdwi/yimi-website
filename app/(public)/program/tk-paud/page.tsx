import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import TkPaudPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'TK Islam Karawang & PAUD Cikampek: Insan Muslim Istiqomah',
  description:
    'TK Islam Karawang & Cikampek — TK Islam Insan Muslim Istiqomah (YIMI): kurikulum tauhid, hafalan Al-Qur’an & hadits, adab islami anak usia dini, dan lingkungan belajar sunnah terjangkau.',
  canonical: '/program/tk-paud',
});

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Program Kerja', item: '/program' },
          { name: 'TK Islam Insan Muslim Istiqomah', item: '/program/tk-paud' },
        ]}
      />
      <FaqJsonLd
        faqs={[
          {
            question: 'Di mana TK Islam yang bagus di Karawang?',
            answer:
              'TK Islam Insan Muslim Istiqomah adalah TK Islam di Karawang (Cikampek, Jatisari dan sekitarnya) yang menanamkan adab islami sejak dini dengan kurikulum bermanhaj salaf.',
          },
          {
            question: 'Apa keunggulan TK Islam Insan Muslim Istiqomah Karawang?',
            answer:
              'Keunggulan TK Islam YIMI: penanaman adab dan akhlak islami sejak dini, pembiasaan ibadah harian, serta lingkungan belajar yang aman dan islami untuk anak usia dini di Karawang.',
          },
          {
            question: 'Bagaimana cara mendaftar TK Islam YIMI Karawang?',
            answer:
              'Pendaftaran TK Islam Insan Muslim Istiqomah Karawang dapat dilakukan dengan menghubungi WhatsApp YIMI di +62 812-1936-2077 atau melalui halaman Kontak website ini.',
          },
        ]}
      />
      <TkPaudPage />
    </>
  );
}
