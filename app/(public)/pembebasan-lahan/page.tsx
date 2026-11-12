import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import PembebasanLahanPage from './content';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';

export const metadata: Metadata = constructMetadata({
  title: 'Wakaf Pembebasan Lahan Karawang',
  description:
    'Program wakaf Karawang pembebasan lahan 840 m² untuk Masjid Jami’ dan TK Islam YIMI di Cikampek & Jatisari. Pahala jariyah abadi untuk Anda dan keluarga.',
  canonical: '/pembebasan-lahan',
});

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Wakaf Pembebasan Lahan', item: '/pembebasan-lahan' },
        ]}
      />
      <FaqJsonLd
        faqs={[
          {
            question: 'Berapa harga paket wakaf tanah Karawang di YIMI?',
            answer:
              'Paket wakaf Karawang YIMI dibuka mulai Rp 50.000,- (Paket Semen/Batu), Rp 100.000,-, Rp 250.000,- (0,5 m²), hingga Rp 500.000,- per 1 meter persegi tanah wakaf.',
          },
          {
            question: 'Di mana lokasi lahan wakaf masjid YIMI di Karawang?',
            answer:
              'Lahan yang dibebaskan berlokasi strategis di Desa Balonggandu, Kecamatan Jatisari, Kabupaten Karawang (Cikampek Timur), Jawa Barat.',
          },
          {
            question: 'Ke mana dana wakaf Karawang ini ditransfer?',
            answer:
              'Wakaf dapat ditransfer langsung ke rekening resmi Bank Syariah Indonesia (BSI): 7182045556 a.n. Yayasan Insan Muslim Istiqomah.',
          },
        ]}
      />
      <PembebasanLahanPage />
    </>
  );
}
