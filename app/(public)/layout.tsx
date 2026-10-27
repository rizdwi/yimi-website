import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloating } from '@/components/layout/WhatsAppFloating';
import { VisitorTracker } from '@/components/analytics/VisitorTracker';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/lib/types';

// ISR 60 dtk: HTML di-cache di edge agar TTFB cepat. Cache dijaga tetap
// hangat oleh warmer cron `yimi-warm` (tiap 5 mnt, seperti MajelisKu) —
// jadi 60 dtk cukup dan perubahan CMS tampil dalam hitungan menit, tanpa
// perlu menaikkan revalidate ke 1 jam.
export const revalidate = 60;

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialSettings: Partial<SiteSettings> | null = null;
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (data) {
      initialSettings = data;
    }
  } catch (err) {
    console.error('Failed to load initial site settings:', err);
  }

  // URL logo untuk preload: SAMA PERSIS dengan logika logoUrl di
  // SiteSettingsContext (logo_yayasan -> foto_yayasan -> SVG fallback).
  // URL preload harus identik dengan src <img> hero agar browser memakai
  // satu unduhan yang sama, bukan dua kali. Preload di head membuat browser
  // mulai mengunduh logo (elemen LCP) sebelum parser HTML sampai ke hero —
  // perbaikan audit "Penemuan permintaan LCP" PageSpeed 27 Okt 2026
  // (LCP 4,9 dtk, tanpa preload logo). React 19 menaikkan <link> ini ke
  // <head> dokumen.
  const logoUrl =
    initialSettings?.logo_yayasan ||
    initialSettings?.foto_yayasan ||
    '/logo/logo-yimi.svg';

  return (
    <>
      <link rel="preload" as="image" href={logoUrl} fetchPriority="high" />
      <SiteSettingsProvider initialSettings={initialSettings}>
        <VisitorTracker />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloating />
      </SiteSettingsProvider>
    </>
  );
}
