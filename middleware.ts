import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkApiRateLimit, getClientIp, isMaliciousBot } from './lib/security';

// Header keamanan untuk semua respons (lapisan pertahanan XSS, clickjacking, dll.)
const SECURITY_HEADERS: Record<string, string> = {
  // Mencegah browser menebak tipe konten (XSS via file upload)
  'X-Content-Type-Options': 'nosniff',
  // Mencegah situs di-embed dalam iframe (clickjacking)
  'X-Frame-Options': 'DENY',
  // Kebijakan referrer yang ketat
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Matikan API browser yang tidak dipakai
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // Content Security Policy: batasi sumber skrip/gambar/frame.
  // 'unsafe-inline' dibutuhkan oleh skrip inline Next.js & JSON-LD;
  // React tetap meng-escape semua konten dinamis (pertahanan utama XSS).
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co",
    "frame-src https://maps.google.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- Proteksi API: rate limit + blokir bot jahat (anti DDoS / scraping) ----
  if (pathname.startsWith('/api/')) {
    const userAgent = request.headers.get('user-agent');
    if (isMaliciousBot(userAgent)) {
      return applySecurityHeaders(new NextResponse('Forbidden', { status: 403 }));
    }

    const ip = getClientIp(request);
    // Batas seragam 25 request/menit per IP untuk semua API (keputusan user).
    const { allowed, retryAfterSec } = checkApiRateLimit(
      `api:${ip}`,
      25,
      60_000
    );
    if (!allowed) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Terlalu banyak permintaan. Coba lagi beberapa saat.' },
          {
            status: 429,
            headers: { 'Retry-After': String(retryAfterSec || 60) },
          }
        )
      );
    }
  }

  // ---- Proteksi halaman admin (logika lama, dipertahankan) ----
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('yimi_admin_session');

    // Jika sedang di halaman login dan sudah ada session cookie, arahkan ke dashboard
    if (pathname === '/admin/login') {
      if (sessionCookie && sessionCookie.value) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL('/admin', request.url))
        );
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // Jika bukan halaman login dan tidak ada cookie session, tendang ke login
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/admin/login', request.url);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
