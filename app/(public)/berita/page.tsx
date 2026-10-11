import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import BeritaPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Warta & Artikel Dakwah',
  description:
    'Kabar kegiatan, kajian, dan artikel dakwah Yayasan Insan Muslim Istiqomah (YIMI) di Cikampek, Karawang — di atas sunnah sesuai pemahaman salafus shalih.',
  canonical: '/berita',
});

export default function Page() {
  return <BeritaPage />;
}
