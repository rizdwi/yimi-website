import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// Pola bot/crawler: tidak dicatat (menghemat tulis database sia-sia).
// Bot baik maupun jahat tidak masuk statistik pengunjung manusia.
const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|mediapartners|baidu|yandex|duckduck|sogou|exabot|facebot|ia_archiver|semrush|ahrefs|mj12bot|dotbot|petalbot/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path : '/';
    const referrer = typeof body.referrer === 'string' ? body.referrer : '';

    // Abaikan kunjungan ke halaman internal admin atau API
    if (path.startsWith('/admin') || path.startsWith('/api') || path.includes('_next')) {
      return NextResponse.json({ ignored: true });
    }

    const userAgent = req.headers.get('user-agent') || '';

    // A. Abaikan bot/crawler agar tidak membebani database
    if (BOT_PATTERN.test(userAgent)) {
      return NextResponse.json({ ignored: true, reason: 'bot' });
    }

    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const realIp = req.headers.get('x-real-ip') || '';
    const cfIp = req.headers.get('cf-connecting-ip') || '';
    const rawIp = (forwardedFor.split(',')[0] || realIp || cfIp || '127.0.0.1').trim();

    // Sesuai aturan kepatuhan privasi (AGENTS.md line 98):
    // Jangan menyimpan IP polos, hash dengan SHA-256 + salt harian
    const todayUtc = new Date().toISOString().split('T')[0];
    const salt = todayUtc + '-yimi-privacy';
    const ipHash = crypto.createHash('sha256').update(rawIp + salt).digest('hex').substring(0, 16);

    // B. Deduplikasi harian: 1 baris per pengunjung per hari (bukan per pageview).
    // Mengurangi tulis database >90% tanpa mengubah makna statistik harian.
    const { data: sudahAda } = await supabase
      .from('visitor_logs')
      .select('id')
      .eq('ip_hash', ipHash)
      .gte('created_at', `${todayUtc}T00:00:00Z`)
      .limit(1)
      .maybeSingle();

    if (sudahAda) {
      return NextResponse.json({ ignored: true, reason: 'duplikat-harian' });
    }

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
