import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fallbackNews from '@/content/news/index.json';

export const revalidate = 60;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('news_posts')
      .select('*')
      .eq('status', 'terbit')
      .order('terbit_pada', { ascending: false });

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

      return NextResponse.json({ news: formatted }, { headers: CACHE_HEADERS });
    }
  } catch (err) {
    console.error('Failed to load public news from Supabase:', err);
  }

  return NextResponse.json({ news: fallbackNews }, { headers: CACHE_HEADERS });
}
