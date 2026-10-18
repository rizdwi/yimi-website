import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fallbackNews from '@/content/news/index.json';
import { parsePagination, publicCacheHeaders } from '@/lib/security';
import { extractGalleryFromPost } from '@/lib/news';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache publik singkat: konten berita boleh di-cache CDN 60 detik.
// Mengurangi beban database dan menahan lonjakan trafik tak wajar.
const CACHE_HEADERS = publicCacheHeaders(60);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePagination(searchParams);

  try {
    const [newsRes, statsRes] = await Promise.all([
      supabase
        .from('news_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'terbit')
        .order('terbit_pada', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('visitor_logs')
        .select('path')
        .or('path.ilike./berita/%,path.ilike.like:/berita/%'),
    ]);

    const { data, error, count } = newsRes;
    const statsLogs = statsRes.data || [];

    const viewsMap: Record<string, number> = {};
    const likesMap: Record<string, number> = {};

    statsLogs.forEach((l) => {
      if (!l.path) return;
      if (l.path.startsWith('like:/berita/')) {
        const s = l.path.replace('like:/berita/', '').split('?')[0].split('/')[0];
        if (s) likesMap[s] = (likesMap[s] || 0) + 1;
      } else if (l.path.startsWith('/berita/')) {
        const s = l.path.replace('/berita/', '').split('?')[0].split('/')[0];
        if (s) viewsMap[s] = (viewsMap[s] || 0) + 1;
      }
    });

    // Bedakan "database error" vs "database kosong": error → fallback,
    // kosong → hormati CMS (jangan tampilkan data cadangan basi).
    if (error) {
      console.error('Supabase error fetching public news_posts:', error);
    } else {
      const formatted = (data || []).map((post) => {
        const { cleanIsi, galeri } = extractGalleryFromPost(post.gambar_utama, post.isi);
        return {
          id: post.id,
          slug: post.slug,
          judul: post.judul,
          tanggal: post.terbit_pada || (post.created_at ? post.created_at.split('T')[0] : '2026-10-09'),
          penulis: post.penulis || 'Tim Dakwah YIMI',
          kategori: post.kategori || 'Umum',
          gambar:
            galeri[0] ||
            post.gambar_utama ||
            'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop',
          galeri,
          views: viewsMap[post.slug] || 0,
          likes: likesMap[post.slug] || 0,
          ringkasan:
            post.ringkasan ||
            (cleanIsi ? cleanIsi.slice(0, 160) + '...' : 'Warta kegiatan dan dakwah Yayasan Insan Muslim Istiqomah.'),
          konten: cleanIsi
            ? cleanIsi.split('\n\n').map((p: string) => p.trim()).filter(Boolean)
            : [],
          ayatRujukan: '',
        };
      });

      return NextResponse.json(
        { news: formatted, pagination: { page, limit, total: count ?? formatted.length } },
        { headers: CACHE_HEADERS }
      );
    }
  } catch (err) {
    console.error('Failed to load public news from Supabase:', err);
  }

  const pagedFallback = fallbackNews.slice(offset, offset + limit);
  return NextResponse.json(
    { news: pagedFallback, pagination: { page, limit, total: fallbackNews.length } },
    { headers: CACHE_HEADERS }
  );
}
