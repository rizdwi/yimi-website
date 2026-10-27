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
