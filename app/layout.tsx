import type { Metadata } from 'next';
import './globals.css';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-[#F5F7FA] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
