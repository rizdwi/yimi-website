import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import tkFallback from '@/content/programs/tk-paud.json';
import jumatFallback from '@/content/programs/jumat-berkah.json';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .eq('is_archived', false)
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({ program: data });
    }
  } catch (err) {
    console.error(`Error fetching program by slug (${slug}):`, err);
  }

  // Fallback
  if (slug === 'tk-paud') {
    return NextResponse.json({
      program: {
        slug: 'tk-paud',
        judul: tkFallback.judul,
        ringkasan: tkFallback.subjudul,
        deskripsi: tkFallback.deskripsi,
        metadata: {
          kategori: 'Pendidikan',
          biaya_pendaftaran: 'Rp 350.000',
          biaya_spp: 'Rp 250.000 / bulan',
          status_pendaftaran: tkFallback.pendaftaran.status,
          kontak_wa: tkFallback.pendaftaran.kontakPendaftaran,
          file_lampiran: '',
          file_lampiran_nama: '',
        },
      },
    });
  }

  if (slug === 'jumat-berkah') {
    return NextResponse.json({
      program: {
        slug: 'jumat-berkah',
        judul: jumatFallback.judul,
        ringkasan: jumatFallback.subjudul,
        deskripsi: jumatFallback.deskripsi,
        metadata: {
          kategori: 'Sosial',
          biaya_label: 'Mulai Rp 25.000 / Paket',
          paket_infaq: jumatFallback.paketInfaq,
          file_lampiran: '',
          file_lampiran_nama: '',
        },
      },
    });
  }

  return NextResponse.json({ error: 'Program tidak ditemukan' }, { status: 404 });
}
