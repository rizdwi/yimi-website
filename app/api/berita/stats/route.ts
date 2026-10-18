import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Pola bot/crawler yang tidak dicatat
const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|mediapartners|baidu|yandex|duckduck|sogou|exabot|facebot|ia_archiver|semrush|ahrefs|mj12bot|dotbot|petalbot/i;

function getClientIpHash(req: NextRequest): { ipHash: string; rawIp: string } {
  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  const realIp = req.headers.get('x-real-ip') || '';
  const cfIp = req.headers.get('cf-connecting-ip') || '';
  const rawIp = (forwardedFor.split(',')[0] || realIp || cfIp || '127.0.0.1').trim();

  // Hash konsisten untuk identifikasi suka / tayangan unik tanpa menyimpan IP polos
  const salt = 'yimi-article-stats-salt';
  const ipHash = crypto.createHash('sha256').update(rawIp + salt).digest('hex').substring(0, 16);

  return { ipHash, rawIp };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const slugsParam = searchParams.get('slugs');

    const { ipHash } = getClientIpHash(req);

    // Kasus 1: Batch request untuk beberapa slug
    if (slugsParam) {
      const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (slugs.length === 0) {
        return NextResponse.json({ stats: {} });
      }

      // Ambil log yang relevan
      const { data: logs } = await supabase
        .from('visitor_logs')
        .select('path')
        .or('path.ilike./berita/%,path.ilike.like:/berita/%');

      const statsMap: Record<string, { views: number; likes: number }> = {};
      slugs.forEach((s) => {
        statsMap[s] = { views: 0, likes: 0 };
      });

      (logs || []).forEach((l) => {
        if (!l.path) return;
        if (l.path.startsWith('like:/berita/')) {
          const s = l.path.replace('like:/berita/', '').split('?')[0].split('/')[0];
          if (statsMap[s]) statsMap[s].likes += 1;
        } else if (l.path.startsWith('/berita/')) {
          const s = l.path.replace('/berita/', '').split('?')[0].split('/')[0];
          if (statsMap[s]) statsMap[s].views += 1;
        }
      });

      return NextResponse.json({ stats: statsMap });
    }

    // Kasus 2: Single slug
    if (!slug) {
      return NextResponse.json({ error: 'Parameter slug wajib diisi' }, { status: 400 });
    }

    const cleanSlug = slug.trim();
    const viewPath = `/berita/${cleanSlug}`;
    const likePath = `like:/berita/${cleanSlug}`;

    // Hitung tayangan
    const { count: viewCount } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .eq('path', viewPath);

    // Hitung likes
    const { count: likeCount } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .eq('path', likePath);

    // Cek apakah pengunjung saat ini sudah menyukai artikel
    const { data: userLike } = await supabase
      .from('visitor_logs')
      .select('id')
      .eq('path', likePath)
      .eq('ip_hash', ipHash)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      slug: cleanSlug,
      views: viewCount ?? 0,
      likes: likeCount ?? 0,
      userLiked: Boolean(userLike),
    });
  } catch (err) {
    console.error('Error in GET /api/berita/stats:', err);
    return NextResponse.json({ error: 'Gagal memuat statistik warta' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent') || '';
    if (BOT_PATTERN.test(userAgent)) {
      return NextResponse.json({ ignored: true, reason: 'bot' });
    }

    const body = await req.json().catch(() => ({}));
    const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const action = body.action; // 'view' | 'like' | 'unlike'
    const referrer = typeof body.referrer === 'string' ? body.referrer : '';

    if (!slug) {
      return NextResponse.json({ error: 'Slug artikel wajib diisi' }, { status: 400 });
    }

    const { ipHash } = getClientIpHash(req);
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    const viewPath = `/berita/${slug}`;
    const likePath = `like:/berita/${slug}`;

    if (action === 'view') {
      // Deduplikasi tayangan: 1 tayangan per IP per artikel dalam 30 menit
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: existingView } = await supabase
        .from('visitor_logs')
        .select('id')
        .eq('path', viewPath)
        .eq('ip_hash', ipHash)
        .gte('created_at', thirtyMinutesAgo)
        .limit(1)
        .maybeSingle();

      if (!existingView) {
        await supabase.from('visitor_logs').insert([
          {
            path: viewPath,
            referrer: referrer ? referrer.slice(0, 100) : 'Langsung',
            ip_hash: ipHash,
            device_type: deviceType,
            user_agent: userAgent.slice(0, 150),
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } else if (action === 'like') {
      // Cek apakah sudah like
      const { data: existingLike } = await supabase
        .from('visitor_logs')
        .select('id')
        .eq('path', likePath)
        .eq('ip_hash', ipHash)
        .limit(1)
        .maybeSingle();

      if (!existingLike) {
        await supabase.from('visitor_logs').insert([
          {
            path: likePath,
            referrer: 'like',
            ip_hash: ipHash,
            device_type: deviceType,
            user_agent: 'like-reaction',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } else if (action === 'unlike') {
      await supabase
        .from('visitor_logs')
        .delete()
        .eq('path', likePath)
        .eq('ip_hash', ipHash);
    }

    // Ambil nilai terbaru
    const [{ count: viewCount }, { count: likeCount }, { data: currentUserLike }] =
      await Promise.all([
        supabase
          .from('visitor_logs')
          .select('*', { count: 'exact', head: true })
          .eq('path', viewPath),
        supabase
          .from('visitor_logs')
          .select('*', { count: 'exact', head: true })
          .eq('path', likePath),
        supabase
          .from('visitor_logs')
          .select('id')
          .eq('path', likePath)
          .eq('ip_hash', ipHash)
          .limit(1)
          .maybeSingle(),
      ]);

    return NextResponse.json({
      success: true,
      slug,
      views: viewCount ?? 0,
      likes: likeCount ?? 0,
      userLiked: Boolean(currentUserLike),
    });
  } catch (err) {
    console.error('Error in POST /api/berita/stats:', err);
    return NextResponse.json({ error: 'Gagal memperbarui reaksi warta' }, { status: 500 });
  }
}
