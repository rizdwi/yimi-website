'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Jangan lacak rute admin atau saat path belum berubah
    if (!pathname || pathname.startsWith('/admin') || lastTrackedPathRef.current === pathname) {
      return;
    }

    lastTrackedPathRef.current = pathname;

    // Catat kunjungan ke endpoint analitik secara asinkron tanpa membebani browser
    const payload = JSON.stringify({
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Abaikan error jaringan pelacakan agar tidak mengganggu pengunjung
      });
    }
  }, [pathname]);

  return null;
}
