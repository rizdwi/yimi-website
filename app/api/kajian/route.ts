import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import kajianFallback from '@/content/kajian.json';
import { saringKajianAktif } from '@/lib/kajian';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
  'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
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
      // Jadwal yang sudah terlewat disembunyikan dari web utama.
      // CMS (endpoint /api/admin/kajian) tetap menyimpan semuanya sebagai arsip.
      return NextResponse.json(
        { kajian: saringKajianAktif(data) },
        { headers: CACHE_HEADERS }
      );
    }
  } catch (err) {
    console.error('Failed to load public kajian from Supabase:', err);
  }

  return NextResponse.json(
    { kajian: saringKajianAktif(kajianFallback as { tanggal?: string }[]) },
    { headers: CACHE_HEADERS }
  );
}
