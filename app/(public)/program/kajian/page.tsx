import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import KajianProgramPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Tempat Kajian Sunnah Karawang, Cikampek & Jatisari',
  description:
    'Tempat kajian Sunnah di Karawang: Cikampek, Jatisari dan sekitarnya — jadwal kajian Islam rutin YIMI: aqidah, fiqih, dan adab di atas sunnah sesuai pemahaman salafus shalih.',
  canonical: '/program/kajian',
});

export default function Page() {
  return <KajianProgramPage />;
}
