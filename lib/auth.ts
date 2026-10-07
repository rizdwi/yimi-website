import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'yimi_super_secret_jwt_key_2026_istiqomah_secure_token'
);

export const COOKIE_NAME = 'yimi_admin_session';

// Rate Limiting In-Memory (5 gagal per 15 menit)
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 menit
  const maxAttempts = 5;

  const entry = rateLimitMap.get(identifier);
  if (!entry) {
    return { allowed: true };
  }

  if (now - entry.firstAttempt > windowMs) {
    rateLimitMap.delete(identifier);
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    const remainingSeconds = Math.ceil((entry.firstAttempt + windowMs - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true };
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry) {
    rateLimitMap.set(identifier, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

// Password Helpers
export function verifyPassword(plain: string, hashed: string): boolean {
  try {
    return bcrypt.compareSync(plain, hashed);
  } catch {
    return false;
  }
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

// JWT Helpers
export async function createSessionToken(user: { id: string; email: string; nama: string; role: string }): Promise<string> {
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    nama: user.nama,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // 8 jam sesi aktif
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; email: string; nama: string; role: string };
  } catch {
    return null;
  }
}

export async function getAdminSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function getAdminSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return await verifySessionToken(token);
}
