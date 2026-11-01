import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';
import ProgramIndexPage from './content';
import { getPrograms } from '@/lib/home-data';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: 'Program Dakwah & Pendidikan',
  description:
    'Program YIMI Cikampek Karawang: TK Islam, kajian sunnah rutin, Jumat Berkah, dan wakaf pembebasan lahan untuk dakwah.',
  canonical: '/program',
});

export default async function Page() {
  const programs = await getPrograms();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Program Kerja & Layanan Dakwah Yayasan YIMI Karawang',
    itemListElement: (programs as Array<{ judul: string; href: string }>).map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.judul,
      url: `${baseUrl}${p.href}`,
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', item: '/' },
          { name: 'Program Kerja', item: '/program' },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ProgramIndexPage initialPrograms={programs as any} />
    </>
  );
}
