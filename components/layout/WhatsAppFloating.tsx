'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import siteData from '@/content/site.json';

export function WhatsAppFloating() {
  const prefilledMessage = encodeURIComponent(
    'Assalamu\'alaikum warahmatullah. Saya ingin bertanya seputar kegiatan dan program Yayasan Insan Muslim Istiqomah (YIMI).'
  );
  const waUrl = `https://wa.me/${siteData.kontak.whatsapp}?text=${prefilledMessage}`;

  return (
    <aside
      aria-label="Kontak Cepat WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center group mb-[env(safe-area-inset-bottom)]"
    >
      <span className="hidden sm:inline-block mr-3 px-3.5 py-1.5 bg-white text-yimi-blue-800 text-xs font-bold rounded-full shadow-[0_4px_16px_rgba(31,47,107,0.12)] border border-yimi-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Tanya Pengurus via WhatsApp
      </span>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi kami melalui WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_6px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-yimi-green-500 focus-visible:ring-offset-2"
      >
        <MessageCircle className="w-7 h-7 fill-white text-white" />
      </a>
    </aside>
  );
}
