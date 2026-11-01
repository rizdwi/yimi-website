import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import GaleriPage from './content';
import { supabase } from '@/lib/supabase';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: 'Galeri Kegiatan',
  description:
    'Dokumentasi kegiatan dakwah, kajian, dan program sosial Yayasan Insan Muslim Istiqomah (YIMI) di Cikampek, Karawang.',
  canonical: '/galeri',
});

async function getGalleryPhotos() {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('id, judul, gambar, kategori, keterangan, izin_orang_tua')
      .eq('tampil_publik', true)
      .order('urutan', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(36);

    if (!error && data) {
      return data
        .filter((i) => !(i.kategori?.includes('TK') && !i.izin_orang_tua))
        .map((i) => ({
          id: i.id,
          judul: i.judul,
          deskripsi: i.keterangan || '',
          gambar: i.gambar,
          kategori: i.kategori,
          izinOrangTua: i.izin_orang_tua ?? true,
        }));
    }
  } catch (err) {
    console.error('Failed to load gallery for SSR:', err);
  }
  return [];
}

export default async function Page() {
  const photos = await getGalleryPhotos();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';
  const imageGalleryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Dokumentasi & Galeri Kegiatan Yayasan YIMI Karawang',
    url: `${baseUrl}/galeri`,
    description:
      'Dokumentasi visual kegiatan syiar dakwah sunnah, kegiatan belajar santri TK Islam, dan bakti sosial di Karawang.',
    image: photos.slice(0, 15).map((p) => ({
      '@type': 'ImageObject',
      name: p.judul,
      contentUrl: p.gambar,
      caption: p.deskripsi || p.judul,
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Galeri Kegiatan', item: '/galeri' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGalleryJsonLd) }}
      />
      <GaleriPage initialPhotos={photos} />
    </>
  );
}
