import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fallbackNews from '@/content/news/index.json';
import { parsePagination, publicCacheHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache publik singkat: konten berita boleh di-cache CDN 60 detik.
// Mengurangi beban database dan menahan lonjakan trafik tak wajar.
const CACHE_HEADERS = publicCacheHeaders(60);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePagination(searchParams);

  try {
    const { data, error, count } = await supabase
      .from('news_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'terbit')
      .order('terbit_pada', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error fetching public news_posts:', error);
    } else if (data && data.length > 0) {
      const formatted = data.map((post) => ({
        id: post.id,
        slug: post.slug,
        judul: post.judul,
        tanggal: post.terbit_pada || (post.created_at ? post.created_at.split('T')[0] : '2026-10-09'),
        penulis: post.penulis || 'Tim Dakwah YIMI',
        kategori: post.kategori || 'Umum',
        gambar:
          post.gambar_utama ||
          'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?q=80&w=1200&auto=format&fit=crop',
        ringkasan:
          post.ringkasan ||
          (post.isi ? post.isi.slice(0, 160) + '...' : 'Warta kegiatan dan dakwah Yayasan Insan Muslim Istiqomah.'),
        konten: post.isi
          ? post.isi.split('\n\n').map((p: string) => p.trim()).filter(Boolean)
          : [],
        ayatRujukan: '',
      }));

      return NextResponse.json(
        { news: formatted, pagination: { page, limit, total: count ?? data.length } },
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
