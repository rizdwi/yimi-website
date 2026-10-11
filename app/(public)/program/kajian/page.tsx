import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import KajianProgramPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Jadwal Kajian Sunnah Rutin',
  description:
    'Jadwal kajian Islam rutin YIMI di Cikampek, Karawang — aqidah, fiqih, dan adab di atas sunnah sesuai pemahaman salafus shalih.',
  canonical: '/program/kajian',
});

export default function Page() {
  return <KajianProgramPage />;
}
