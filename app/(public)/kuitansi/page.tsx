import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import KuitansiContent from './content';

export const metadata: Metadata = constructMetadata({
  title: 'Kuitansi Digital & Sertifikat Wakaf',
  description:
    'Verifikasi bukti tanda terima donasi, infaq, dan sertifikat wakaf resmi Yayasan Insan Muslim Istiqomah (YIMI).',
  canonical: '/kuitansi',
});

export default function KuitansiPage() {
  return <KuitansiContent />;
}
