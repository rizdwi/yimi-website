import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import TkPaudPage from './content';

// Metadata unik per halaman (wajib: satu title & description unik, canonical).
export const metadata: Metadata = constructMetadata({
  title: 'TK Islam Cikampek & Karawang',
  description:
    'TK Islam Insan Muslim Istiqomah — pendidikan anak usia dini di Cikampek, Karawang dengan adab islami dan kurikulum bermanhaj salaf.',
  canonical: '/program/tk-paud',
});

export default function Page() {
  return <TkPaudPage />;
}
