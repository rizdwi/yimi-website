import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import DonasiPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Donasi, Infaq & Wakaf Resmi Yayasan YIMI',
  description:
    'Salurkan donasi, infaq, dan wakaf melalui Yayasan Insan Muslim Istiqomah (YIMI) — amanah untuk dakwah sunnah di Cikampek, Karawang.',
  canonical: '/donasi',
});

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Donasi & Infaq', item: '/donasi' },
        ]}
      />
      <DonasiPage />
    </>
  );
}
