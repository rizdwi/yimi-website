import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import JumatBerkahPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Jumat Berkah — Berbagi Kebaikan',
  description:
    'Program Jumat Berkah YIMI: berbagi makanan setiap Jumat di Cikampek, Karawang. Salurkan infaq Anda untuk sesama.',
  canonical: '/program/jumat-berkah',
});

export default function Page() {
  return <JumatBerkahPage />;
}
