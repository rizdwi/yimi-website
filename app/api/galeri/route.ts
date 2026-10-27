import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parsePagination, publicCacheHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Galeri jarang berubah: cache CDN 5 menit.
const CACHE_HEADERS = publicCacheHeaders(300);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const berandaOnly = searchParams.get('beranda') === 'true';
  const { page, limit, offset } = parsePagination(searchParams);

  try {
    let query = supabase
      .from('gallery_items')
      .select('*', { count: 'exact' })
      .eq('tampil_publik', true)
      .order('urutan', { ascending: true })
      .order('created_at', { ascending: false });

    if (berandaOnly) {
      query = query.eq('tampil_beranda', true);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    // Bedakan "database error" vs "database kosong":
    // - Error (Supabase down) → pakai fallback agar situs tidak rusak.
    // - Kosong tanpa error → hormati CMS (user memang menghapus semua);
    //   JANGAN tampilkan data cadangan basi.
    if (error) {
      console.error('Error fetching gallery from Supabase:', error);
    } else {
      const safeData = (data || []).filter(
        (item) => !(item.kategori?.includes('TK') && !item.izin_orang_tua)
      );
      return NextResponse.json(
        { items: safeData, pagination: { page, limit, total: count ?? safeData.length } },
        { headers: CACHE_HEADERS }
      );
    }
  } catch (err) {
    console.error('Error fetching gallery from Supabase:', err);
  }

  // TANPA fallback hardcoded (dihapus 2026-10-27 atas perintah user):
  // galeri hanya dari database. Query gagal / DB kosong → items kosong.
  return NextResponse.json(
    { items: [], pagination: { page, limit, total: 0 } },
    { headers: CACHE_HEADERS }
  );
}
