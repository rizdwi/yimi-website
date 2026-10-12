import type { NextRequest } from 'next/server';

// ============================================================
// Utilitas keamanan terpusat: pagination, rate limiting,
// deteksi bot jahat, dan header cache untuk endpoint publik.
// ============================================================

// ---------- Pagination ----------
// Batas aman agar satu request tidak bisa menguras database / memori
// dengan meminta data tak terbatas (salah satu vektor DoS sederhana).
export const PAGINATION_DEFAULT_LIMIT = 50;
export const PAGINATION_MAX_LIMIT = 50;

export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number = PAGINATION_DEFAULT_LIMIT
): { page: number; limit: number; offset: number } {
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const rawLimit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(PAGINATION_MAX_LIMIT, Math.floor(rawLimit))
    : defaultLimit;
  return { page, limit, offset: (page - 1) * limit };
}

// ---------- Rate limiting (sliding window, in-memory) ----------
// Melindungi dari brute-force, scraping agresif, dan DDoS lapisan aplikasi.
// Catatan: di serverless, state ini per-instance; untuk proteksi penuh
// Vercel WAF / edge rate limiting tetap disarankan.
interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
}

const rateLimitStore = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 20000;

function pruneStore(): void {
  if (rateLimitStore.size <= MAX_TRACKED_KEYS) return;
  // Hapus key terlama dulu agar memori tidak tumbuh tanpa batas
  const keys = rateLimitStore.keys();
  const toDelete = rateLimitStore.size - MAX_TRACKED_KEYS;
  for (let i = 0; i < toDelete; i++) {
    const k = keys.next();
    if (!k.done) rateLimitStore.delete(k.value);
  }
}

export function checkApiRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((valid[0] + windowMs - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  valid.push(now);
  rateLimitStore.set(key, valid);
  pruneStore();
  return { allowed: true };
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

// ---------- Deteksi bot jahat ----------
// Pola user-agent dari tool pemindai / serangan yang umum.
// Bot baik (Googlebot, Bingbot, dll.) TIDAK diblokir agar SEO tetap jalan.
const MALICIOUS_BOT_PATTERNS: RegExp[] = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /hydra/i,
  /medusa/i,
  /metasploit/i,
  /burpcollaborator/i,
  /zgrab/i,
  /shodan/i,
  /censys/i,
];

export function isMaliciousBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.trim().length === 0) return true; // API tanpa UA = mencurigakan
  return MALICIOUS_BOT_PATTERNS.some((p) => p.test(userAgent));
}

// ---------- Header cache untuk konten publik ----------
// Konten publik (berita, kajian, galeri) boleh di-cache singkat di CDN:
// mengurangi beban database dan menahan lonjakan trafik (DDoS ringan).
export function publicCacheHeaders(maxAgeSec: number = 60): Record<string, string> {
  const value = `public, s-maxage=${maxAgeSec}, stale-while-revalidate=300`;
  return {
    'Cache-Control': value,
    'CDN-Cache-Control': value,
    'Vercel-CDN-Cache-Control': value,
  };
}
