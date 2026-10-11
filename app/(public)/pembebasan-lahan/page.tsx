import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import PembebasanLahanPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Wakaf Pembebasan Lahan',
  description:
    'Ikut wakaf pembebasan lahan untuk pusat dakwah dan pendidikan Islam YIMI di Karawang. Amal jariyah yang terus mengalir.',
  canonical: '/pembebasan-lahan',
});

export default function Page() {
  return <PembebasanLahanPage />;
}
