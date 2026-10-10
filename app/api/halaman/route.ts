import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import aboutFallback from '@/content/about.json';
import siteFallback from '@/content/site.json';

export const revalidate = 60;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kunci = searchParams.get('kunci');

  try {
    let query = supabase.from('static_pages').select('*').eq('status', 'terbit');

    if (kunci) {
      query = query.eq('kunci', kunci);
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return NextResponse.json({ page: data }, { headers: CACHE_HEADERS });
      }
    } else {
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ pages: data }, { headers: CACHE_HEADERS });
      }
    }
  } catch (err) {
    console.error('Error fetching static pages from Supabase:', err);
  }

  // Fallback defaults
  if (kunci === 'tentang') {
    return NextResponse.json(
      {
        page: {
          kunci: 'tentang',
          judul: 'Tentang Yayasan & Manhaj Dakwah',
          konten: aboutFallback,
        },
      },
      { headers: CACHE_HEADERS }
    );
  }

  if (kunci === 'beranda') {
    return NextResponse.json(
      {
        page: {
          kunci: 'beranda',
          judul: 'Pengantar Beranda & Tagline',
          konten: {
            heroTagline: 'Dakwah di Atas Sunnah Sesuai Pemahaman Salafus Shalih',
            heroSubtitle:
              'Mengajak kaum muslimin kepada pemurnian aqidah dan ibadah, menyemai generasi Qur\'ani, serta menebar kemaslahatan umat berlandaskan Al-Qur\'an dan As-Sunnah.',
          },
        },
      },
      { headers: CACHE_HEADERS }
    );
  }

  return NextResponse.json(
    {
      pages: [
        { kunci: 'tentang', judul: 'Tentang Yayasan', konten: aboutFallback },
        { kunci: 'kontak', judul: 'Kontak Yayasan', konten: siteFallback },
      ],
    },
    { headers: CACHE_HEADERS }
  );
}
