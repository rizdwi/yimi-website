import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import kajianFallback from '@/content/kajian.json';
import { saringKajianAktif } from '@/lib/kajian';
import { parsePagination, publicCacheHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache publik singkat: jadwal boleh di-cache CDN 60 detik.
const CACHE_HEADERS = publicCacheHeaders(60);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const { page, limit, offset } = parsePagination(searchParams);

  // Jadwal disaring dulu (yang terlewat disembunyikan), baru dipaginasi.
  // Tabel jadwal kecil sehingga paginasi di memori aman dan tepat.
  const paginate = <T,>(items: T[]) => ({
    kajian: items.slice(offset, offset + limit),
    pagination: { page, limit, total: items.length },
  });

  try {
    const { data, error } = await supabase
      .from('jadwal_kajian')
      .select('*')
      .order('tanggal', { ascending: true })
      .limit(200); // batas aman sebelum filter

    if (error) {
      console.error('Supabase error fetching public jadwal_kajian:', error);
    } else if (data && data.length > 0) {
      // Jadwal yang sudah terlewat disembunyikan dari web utama.
      // CMS (endpoint /api/admin/kajian) tetap menyimpan semuanya sebagai arsip.
      return NextResponse.json(paginate(saringKajianAktif(data)), {
        headers: CACHE_HEADERS,
      });
    }
  } catch (err) {
    console.error('Failed to load public kajian from Supabase:', err);
  }

  return NextResponse.json(
    paginate(saringKajianAktif(kajianFallback as { tanggal?: string }[])),
    { headers: CACHE_HEADERS }
  );
}
