import type { Metadata } from 'next';
import './globals.css';
import { constructMetadata } from '@/lib/seo';
import siteData from '@/content/site.json';

export const metadata: Metadata = constructMetadata();

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';

const alamatYayasan = {
  '@type': 'PostalAddress',
  streetAddress:
    'Perum Bumi Cikampek Baru Blok B3 No 10, RT002/RW007, Desa Balonggandu, Kecamatan Jatisari',
  addressLocality: 'Karawang',
  addressRegion: 'Jawa Barat',
  postalCode: '41374',
  addressCountry: 'ID',
};

// Data terstruktur Schema.org untuk SEO lokal: membantu Google memahami
// YIMI sebagai yayasan dan sekolah Islam di Cikampek, Karawang.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'NGO',
      '@id': `${baseUrl}/#yayasan`,
      name: siteData.namaLengkap,
      alternateName: siteData.singkatan,
      url: baseUrl,
      slogan: siteData.tagline,
      description: siteData.deskripsi,
      email: siteData.kontak.email,
      telephone: siteData.kontak.whatsapp,
      address: alamatYayasan,
      areaServed: [
        { '@type': 'City', name: 'Cikampek' },
        { '@type': 'City', name: 'Karawang' },
      ],
      sameAs: [
        siteData.sosmed.instagram,
        siteData.sosmed.youtube,
        siteData.sosmed.facebook,
        siteData.sosmed.telegram,
      ],
    },
    {
      '@type': 'EducationalOrganization',
      '@id': `${baseUrl}/program/tk-paud#sekolah`,
      name: 'TK Islam Insan Muslim Istiqomah',
      url: `${baseUrl}/program/tk-paud`,
      description:
        'TK/PAUD Islam di Cikampek, Karawang: pendidikan anak usia dini dengan kurikulum dan adab islami.',
      parentOrganization: { '@id': `${baseUrl}/#yayasan` },
      address: alamatYayasan,
      areaServed: [
        { '@type': 'City', name: 'Cikampek' },
        { '@type': 'City', name: 'Karawang' },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-[#F5F7FA] text-[#111827]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
