import { Metadata } from 'next';
import siteData from '@/content/site.json';

export function constructMetadata({
  title,
  description = siteData.deskripsi,
  image = '/images/og-default.jpg',
  noIndex = false,
  canonical,
  ogType = 'website',
  publishedTime,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  /** Path kanonis, mis. '/berita'. Dibangun menjadi URL absolut. */
  canonical?: string;
  ogType?: 'website' | 'article';
  /** Tanggal terbit ISO untuk artikel, mis. '2026-10-11'. */
  publishedTime?: string;
} = {}): Metadata {
  // Judul halaman memakai sufiks pendek agar tidak terpotong di hasil pencarian (±60 karakter).
  const fullTitle = title
    ? `${title} | ${siteData.singkatan}`
    : `${siteData.namaLengkap} (${siteData.singkatan}) | ${siteData.tagline}`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';
  const canonicalUrl = canonical ? `${baseUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}` : undefined;

  return {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    authors: [{ name: siteData.namaLengkap, url: baseUrl }],
    creator: siteData.namaLengkap,
    publisher: siteData.namaLengkap,
    openGraph: {
      title: fullTitle,
      description,
      siteName: siteData.namaLengkap,
      url: canonicalUrl,
      images: [
        {
          url: image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'id_ID',
      type: ogType,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: [
        'ckxxJLgzLrzcG9WpwYR1TNKsmQtoOdsbDXsutddyC1U',
        '1GeKB4zQj9o8YrbhCd606JEbzUCXZ9DaMmy4Z5yzBps',
      ],
    },
    other: {
      'geo.region': 'ID-JB',
      'geo.placename': 'Kabupaten Karawang, Cikampek, Jatisari',
      'geo.position': '-6.3874379;107.510405',
      'ICBM': '-6.3874379, 107.510405',
    },
    icons: {
      icon: '/icon.png',
      apple: '/apple-icon.png',
    },
  };
}
