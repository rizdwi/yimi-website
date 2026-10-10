import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import galleryFallback from '@/content/gallery.json';

export const revalidate = 60;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
};

interface FallbackGalleryItem {
  id: string;
  judul: string;
  deskripsi: string;
  gambar: string;
  kategori: string;
  izinOrangTua: boolean;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const berandaOnly = searchParams.get('beranda') === 'true';

  try {
    let query = supabase
      .from('gallery_items')
      .select('*')
      .eq('tampil_publik', true)
      .order('urutan', { ascending: true })
      .order('created_at', { ascending: false });

    if (berandaOnly) {
      query = query.eq('tampil_beranda', true).limit(50);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const safeData = data.filter(
        (item) => !(item.kategori?.includes('TK') && !item.izin_orang_tua)
      );
      return NextResponse.json({ items: safeData }, { headers: CACHE_HEADERS });
    }
  } catch (err) {
    console.error('Error fetching gallery from Supabase:', err);
  }

  // Fallback to gallery.json
  const fallback = galleryFallback.filter((i) => i.izinOrangTua === true);
  return NextResponse.json(
    {
      items: fallback.map((f: FallbackGalleryItem) => ({
        id: f.id,
        judul: f.judul,
        keterangan: f.deskripsi,
        gambar: f.gambar,
        kategori: f.kategori,
        izin_orang_tua: f.izinOrangTua,
        tampil_publik: true,
        tampil_beranda: true,
      })),
    },
    { headers: CACHE_HEADERS }
  );
}
