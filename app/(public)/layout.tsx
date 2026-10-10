import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloating } from '@/components/layout/WhatsAppFloating';
import { VisitorTracker } from '@/components/analytics/VisitorTracker';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <VisitorTracker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloating />
    </>
  );
}
