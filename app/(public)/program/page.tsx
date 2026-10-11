import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import ProgramIndexPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Program Dakwah & Pendidikan',
  description:
    'Program YIMI Cikampek Karawang: TK/PAUD Islam, kajian sunnah rutin, Jumat Berkah, dan wakaf pembebasan lahan untuk dakwah.',
  canonical: '/program',
});

export default function Page() {
  return <ProgramIndexPage />;
}
