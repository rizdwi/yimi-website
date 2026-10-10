import { Metadata } from 'next';
import siteData from '@/content/site.json';

export function constructMetadata({
  title,
  description = siteData.deskripsi,
  image = '/logo/logo-yimi.svg',
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${siteData.singkatan} - ${siteData.namaLengkap}`
    : `${siteData.namaLengkap} (${siteData.singkatan}) | ${siteData.tagline}`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.or.id';

  return {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      siteName: siteData.namaLengkap,
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: `${siteData.namaLengkap} - Logo`,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    icons: {
      icon: '/logo/logo-yimi.svg',
      apple: '/logo/logo-yimi.svg',
    },
  };
}
