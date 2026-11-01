import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import PembebasanLahanPage from './content';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Wakaf Pembebasan Lahan Masjid & Sentra Dakwah',
  description:
    'Ikut wakaf pembebasan lahan untuk pusat dakwah dan pendidikan Islam YIMI di Karawang. Amal jariyah yang terus mengalir.',
  canonical: '/pembebasan-lahan',
});

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Wakaf Pembebasan Lahan', item: '/pembebasan-lahan' },
        ]}
      />
      <PembebasanLahanPage />
    </>
  );
}
