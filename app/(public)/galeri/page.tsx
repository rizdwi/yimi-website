import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import GaleriPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Galeri Kegiatan',
  description:
    'Dokumentasi kegiatan dakwah, kajian, dan program sosial Yayasan Insan Muslim Istiqomah (YIMI) di Cikampek, Karawang.',
  canonical: '/galeri',
});

export default function Page() {
  return <GaleriPage />;
}
