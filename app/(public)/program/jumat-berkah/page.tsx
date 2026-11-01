import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import JumatBerkahPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Jumat Berkah — Berbagi Kebaikan & Sedekah Makanan',
  description:
    'Program Jumat Berkah YIMI: berbagi makanan setiap Jumat di Cikampek, Karawang. Salurkan infaq Anda untuk sesama.',
  canonical: '/program/jumat-berkah',
});

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Program Kerja', item: '/program' },
          { name: 'Sedekah Jumat Berkah', item: '/program/jumat-berkah' },
        ]}
      />
      <JumatBerkahPage />
    </>
  );
}
