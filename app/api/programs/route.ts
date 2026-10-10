import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fallbackPrograms from '@/content/programs/index.json';

interface ProgramDbRow {
  id: string;
  slug: string;
  judul: string;
  ringkasan?: string;
  deskripsi?: string;
  ikon?: string;
  gambar?: string;
  urutan?: number;
  tampil_beranda?: boolean;
  metadata?: {
    kategori?: string;
    biaya_label?: string;
    target_usia?: string;
    [key: string]: unknown;
  };
}

export async function GET() {
  try {
    const { data: programs, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_archived', false)
      .order('urutan', { ascending: true });

    if (error || !programs || programs.length === 0) {
      return NextResponse.json({
        programs: fallbackPrograms,
        source: 'local-fallback',
      });
    }

    const list = (programs as ProgramDbRow[]).map((p) => {
      const meta = p.metadata || {};
      const href =
        p.slug === 'pembebasan-lahan'
          ? '/pembebasan-lahan'
          : `/program/${p.slug}`;

      return {
        id: p.id,
        slug: p.slug,
        judul: p.judul,
        ringkasan: p.ringkasan || '',
        deskripsi: p.deskripsi || '',
        kategori: meta.kategori || 'Program',
        ikon: p.ikon || 'BookOpen',
        icon: p.ikon || 'BookOpen',
        gambar: p.gambar || '',
        highlight: meta.biaya_label || p.ringkasan?.slice(0, 30) || 'Program YIMI',
        targetUsia: meta.target_usia || 'Semua Usia',
        tag: meta.kategori || 'Dakwah & Sosial',
        href,
        tampil_beranda: p.tampil_beranda !== false,
        metadata: meta,
      };
    });

    return NextResponse.json({
      programs: list,
      source: 'database',
    });
  } catch (err) {
    console.error('Error fetching programs API:', err);
    return NextResponse.json(
      { programs: fallbackPrograms, source: 'fallback-error' },
      { status: 500 }
    );
  }
}
