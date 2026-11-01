import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import BeritaPage from './content';
import { getAllNews } from '@/lib/news';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

// ISR 60 dtk: HTML di-cache di edge Vercel agar TTFB cepat,
// Googlebot langsung menerima konten lengkap (bukan HTML kosong).
export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: 'Warta & Artikel Dakwah',
  description:
    'Kabar kegiatan, kajian, dan artikel dakwah Yayasan Insan Muslim Istiqomah (YIMI) di Cikampek, Karawang — di atas sunnah sesuai pemahaman salafus shalih.',
  canonical: '/berita',
});

export default async function Page() {
  const news = await getAllNews();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Warta & Artikel Dakwah Yayasan YIMI Karawang',
    url: `${baseUrl}/berita`,
    description:
      'Kumpulan artikel ilmiah Islam, dokumentasi kegiatan santri TK, dan perkembangan dakwah Yayasan Insan Muslim Istiqomah di Karawang.',
    hasPart: news.slice(0, 10).map((item) => ({
      '@type': 'NewsArticle',
      headline: item.judul,
      url: `${baseUrl}/berita/${item.slug}`,
      datePublished: item.tanggal,
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Warta & Artikel', item: '/berita' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <BeritaPage initialNews={news} />
    </>
  );
}
