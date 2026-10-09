import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import galleryFallback from '@/content/gallery.json';

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
      query = query.eq('tampil_beranda', true).limit(6);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      // Filter out TK/PAUD without parental consent
      const safeData = data.filter(
        (item) => !(item.kategori?.includes('TK') && !item.izin_orang_tua)
      );
      return NextResponse.json({ items: safeData });
    }
  } catch (err) {
    console.error('Error fetching gallery from Supabase:', err);
  }

  // Fallback to gallery.json
  const fallback = galleryFallback.filter((i) => i.izinOrangTua === true);
  const items = berandaOnly ? fallback.slice(0, 6) : fallback;
  return NextResponse.json({
    items: items.map((f) => ({
      id: f.id,
      judul: f.judul,
      keterangan: f.deskripsi,
      gambar: f.gambar,
      kategori: f.kategori,
      izin_orang_tua: f.izinOrangTua,
      tampil_publik: true,
      tampil_beranda: true,
    })),
  });
}
