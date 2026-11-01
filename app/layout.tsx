import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Amiri } from 'next/font/google';
import './globals.css';
import { constructMetadata } from '@/lib/seo';
import siteData from '@/content/site.json';

const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontArabic = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = constructMetadata();

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yimi.my.id';

const alamatYayasan = {
  '@type': 'PostalAddress',
  streetAddress:
    'Perum Bumi Cikampek Baru Blok B3 No. 10, RT 002/RW 007, Desa Balonggandu, Kecamatan Jatisari',
  addressLocality: 'Karawang',
  addressRegion: 'Jawa Barat',
  postalCode: '41373',
  addressCountry: 'ID',
};

// Koordinat pin Google Maps dari tautan yang dibagikan user (tempat
// "Yayasan Insan Muslim Istiqomah", Plus Code JG76+25 Balonggandu).
// Pin lama (-6.38651, 107.51168) TERBUKTI meleset ~175 m ke timur laut
// (mendarat di sekitar Jl. Mangga, bukan di gedung yayasan) — laporan
// user 2026-10-27 22:38.
const geoYayasan = {
  '@type': 'GeoCoordinates',
  latitude: -6.3874379,
  longitude: 107.510405,
};

const mapsUrl = 'https://maps.google.com/maps?q=-6.3874379,107.510405';

// Data terstruktur Schema.org untuk SEO lokal: membantu Google memahami
// YIMI sebagai yayasan dan sekolah Islam di Cikampek, Karawang, Jatisari, dan Cilamaya.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      // Nama situs resmi untuk tampilan hasil pencarian Google
      // (perintah user: ganti "yimi.my.id" jadi nama yayasan resmi di Google Site Name).
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: `${baseUrl}/`,
      name: siteData.namaLengkap,
      alternateName: [siteData.singkatan, 'Insan Muslim Istiqomah'],
      publisher: { '@id': `${baseUrl}/#yayasan` },
      inLanguage: 'id',
    },
    {
      '@type': ['NGO', 'Place', 'LocalBusiness'],
      '@id': `${baseUrl}/#yayasan`,
      name: siteData.namaLengkap,
      alternateName: siteData.singkatan,
      url: baseUrl,
      slogan: siteData.tagline,
      description: siteData.deskripsi,
      email: siteData.kontak.email,
      telephone: '+6281219362077',
      priceRange: 'Infaq / Sukarela',
      currenciesAccepted: 'IDR',
      paymentAccepted: 'Bank Transfer',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '17:00',
        },
      ],
      address: alamatYayasan,
      geo: geoYayasan,
      hasMap: mapsUrl,
      areaServed: [
        { '@type': 'City', name: 'Cikampek' },
        { '@type': 'City', name: 'Karawang' },
        { '@type': 'City', name: 'Jatisari' },
        { '@type': 'City', name: 'Cilamaya' },
        { '@type': 'AdministrativeArea', name: 'Jawa Barat' },
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+6281219362077',
        contactType: 'customer service',
        areaServed: 'ID',
        availableLanguage: ['Indonesian', 'Arabic'],
      },
      sameAs: [
        'https://www.instagram.com/yayasaninsanmuslimistiqamah',
        'https://facebook.com/yimi.official',
        'https://t.me/yimidakwah',
      ],
    },
    {
      '@type': 'EducationalOrganization',
      '@id': `${baseUrl}/program/tk-paud#sekolah`,
      name: 'TK Islam Insan Muslim Istiqomah',
      url: `${baseUrl}/program/tk-paud`,
      description:
        'TK Islam di Cikampek, Karawang: pendidikan anak usia dini dengan kurikulum dan adab islami.',
      parentOrganization: { '@id': `${baseUrl}/#yayasan` },
      address: alamatYayasan,
      geo: geoYayasan,
      hasMap: mapsUrl,
      areaServed: [
        { '@type': 'City', name: 'Cikampek' },
        { '@type': 'City', name: 'Karawang' },
        { '@type': 'City', name: 'Jatisari' },
        { '@type': 'City', name: 'Cilamaya' },
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
    <html
      lang="id"
      className={`scroll-smooth ${fontSans.variable} ${fontArabic.variable}`}
    >
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
