import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import KontakPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'Hubungi Kami',
  description:
    'Hubungi YIMI: alamat sekretariat, WhatsApp, dan email untuk donasi, pendaftaran TK Islam, dan kerja sama dakwah di Cikampek, Karawang.',
  canonical: '/kontak',
});

export default function Page() {
  return <KontakPage />;
}
