import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloating } from '@/components/layout/WhatsAppFloating';
import { VisitorTracker } from '@/components/analytics/VisitorTracker';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/lib/types';

// ISR 60 dtk (dulu force-dynamic): HTML di-cache di edge agar TTFB cepat.
// Site settings jarang berubah; SiteSettingsContext tetap me-refresh
// client-side, jadi perubahan CMS tetap tampil tanpa menunggu revalidasi.
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

  return (
    <SiteSettingsProvider initialSettings={initialSettings}>
      <VisitorTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloating />
    </SiteSettingsProvider>
  );
}
