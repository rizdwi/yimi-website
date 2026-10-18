import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function hashIp(rawIp: string): string {
  const salt = process.env.ANALYTICS_SALT || 'yimi-secret-salt-2026';
  return crypto.createHash('sha256').update(rawIp + salt).digest('hex').slice(0, 16);
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const list = forwarded.split(',');
    if (list[0]) return list[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

async function getStatsForSlug(slug: string, ipHash?: string) {
  const path = `/berita/${slug}`;
  const likePath = `like:/berita/${slug}`;
  const unlikePath = `unlike:/berita/${slug}`;

  const [viewsRes, likesRes, unlikesRes, userLogRes] = await Promise.all([
    supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).eq('path', path),
    supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).eq('path', likePath),
    supabase.from('visitor_logs').select('*', { count: 'exact', head: true }).eq('path', unlikePath),
    ipHash
      ? supabase
          .from('visitor_logs')
          .select('path')
          .in('path', [likePath, unlikePath])
          .eq('ip_hash', ipHash)
          .order('created_at', { ascending: false })
          .limit(1)
      : Promise.resolve({ data: [] }),
  ]);

  const views = viewsRes.count || 0;
  const rawLikes = likesRes.count || 0;
  const rawUnlikes = unlikesRes.count || 0;
  const netLikes = Math.max(0, rawLikes - rawUnlikes);

  const latestUserLog = userLogRes.data?.[0]?.path;
  const userLiked = latestUserLog === likePath;

  return { views, likes: netLikes, userLiked };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug warta wajib diisi' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);

    const stats = await getStatsForSlug(slug, ipHash);

    return NextResponse.json(
      { slug, ...stats },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching news stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { slug, action, referrer } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Slug warta tidak valid' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const userAgent = (req.headers.get('user-agent') || '').slice(0, 255);
    const path = `/berita/${slug}`;
    const likePath = `like:/berita/${slug}`;
    const unlikePath = `unlike:/berita/${slug}`;

    if (action === 'view') {
      // Cek apakah IP yang sama sudah mencatat kunjungan dalam 30 menit terakhir
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recentVisits } = await supabase
        .from('visitor_logs')
        .select('id')
        .eq('path', path)
        .eq('ip_hash', ipHash)
        .gte('created_at', thirtyMinutesAgo)
        .limit(1);

      if (!recentVisits || recentVisits.length === 0) {
        await supabase.from('visitor_logs').insert({
          path,
          referrer: typeof referrer === 'string' ? referrer.slice(0, 255) : '',
          user_agent: userAgent,
          ip_hash: ipHash,
          device_type: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
        });
      }
    } else if (action === 'like') {
      // Cek interaksi terakhir pengguna
      const { data: latestInteractions } = await supabase
        .from('visitor_logs')
        .select('path')
        .in('path', [likePath, unlikePath])
        .eq('ip_hash', ipHash)
        .order('created_at', { ascending: false })
        .limit(1);

      const alreadyLiked = latestInteractions?.[0]?.path === likePath;

      if (!alreadyLiked) {
        await supabase.from('visitor_logs').insert({
          path: likePath,
          referrer: 'client-like',
          user_agent: userAgent,
          ip_hash: ipHash,
          device_type: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
        });
      }
    } else if (action === 'unlike') {
      // Cek interaksi terakhir pengguna
      const { data: latestInteractions } = await supabase
        .from('visitor_logs')
        .select('path')
        .in('path', [likePath, unlikePath])
        .eq('ip_hash', ipHash)
        .order('created_at', { ascending: false })
        .limit(1);

      const currentlyLiked = latestInteractions?.[0]?.path === likePath;

      if (currentlyLiked) {
        await supabase.from('visitor_logs').insert({
          path: unlikePath,
          referrer: 'client-unlike',
          user_agent: userAgent,
          ip_hash: ipHash,
          device_type: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
        });
      }
    } else {
      return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 });
    }

    const updatedStats = await getStatsForSlug(slug, ipHash);

    return NextResponse.json(
      { success: true, slug, ...updatedStats },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error handling news interaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
