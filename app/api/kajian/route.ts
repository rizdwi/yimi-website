import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import kajianFallback from '@/content/kajian.json';

export const revalidate = 60;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('jadwal_kajian')
      .select('*')
      .order('tanggal', { ascending: true });

    if (error) {
      console.error('Supabase error fetching public jadwal_kajian:', error);
    } else if (data && data.length > 0) {
      return NextResponse.json({ kajian: data }, { headers: CACHE_HEADERS });
    }
  } catch (err) {
    console.error('Failed to load public kajian from Supabase:', err);
  }

  return NextResponse.json({ kajian: kajianFallback }, { headers: CACHE_HEADERS });
}
