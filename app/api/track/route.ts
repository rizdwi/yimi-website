import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path : '/';
    const referrer = typeof body.referrer === 'string' ? body.referrer : '';

    // Abaikan kunjungan ke halaman internal admin atau API
    if (path.startsWith('/admin') || path.startsWith('/api') || path.includes('_next')) {
      return NextResponse.json({ ignored: true });
    }

    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    const cfIp = req.headers.get('cf-connecting-ip') || '';
    const rawIp = (forwardedFor.split(',')[0] || realIp || cfIp || '127.0.0.1').trim();

    // Sesuai aturan kepatuhan privasi (AGENTS.md line 98):
    // Jangan menyimpan IP polos, hash dengan SHA-256 + salt harian
    const salt = new Date().toISOString().split('T')[0] + '-yimi-privacy';
    const ipHash = crypto.createHash('sha256').update(rawIp + salt).digest('hex').substring(0, 16);

    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    // Bersihkan rujukan URL
    let cleanReferrer = 'Langsung (Direct)';
    if (referrer) {
      try {
        const refUrl = new URL(referrer);
        cleanReferrer = refUrl.hostname.replace('www.', '');
      } catch {
        cleanReferrer = referrer.substring(0, 50);
      }
    }

    await supabase.from('visitor_logs').insert([
      {
        path,
        referrer: cleanReferrer,
        ip_hash: ipHash,
        device_type: deviceType,
        user_agent: userAgent.substring(0, 150),
        created_at: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Visitor track error:', err);
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 });
  }
}
