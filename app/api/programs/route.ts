import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fallbackPrograms from '@/content/programs/index.json';
import landFallback from '@/content/land-campaign.json';
import { formatRupiah } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
  'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
};

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

/**
 * Label tarif program Pembebasan Lahan Wakaf, selalu mengikuti tarif resmi
 * dari CMS (tabel wakaf_lahan.harga_per_meter). Fallback ke content statis
 * bila CMS tidak terjangkau. Mengembalikan '' bila tarif tidak diketahui.
 */
async function getTarifLahanLabel(): Promise<string> {
  try {
    const query = supabase
      .from('wakaf_lahan')
      .select('harga_per_meter')
      .limit(1)
      .maybeSingle();
    const { data, error } = await Promise.race([
      query,
      new Promise<never>((_, tolak) =>
        setTimeout(() => tolak(new Error('Timeout 8 detik mengambil wakaf_lahan')), 8000)
      ),
    ]);
    const dariCms =
      !error && data
        ? Number((data as { harga_per_meter?: unknown }).harga_per_meter)
        : 0;
    const perMeter =
      dariCms > 0 ? dariCms : Number(landFallback.hargaPerMeter) || 0;
    if (perMeter > 0) return `${formatRupiah(perMeter)} / m²`;
  } catch {
    /* abaikan — panggil fallback di bawah */
  }
  const cadangan = Number(landFallback.hargaPerMeter) || 0;
  return cadangan > 0 ? `${formatRupiah(cadangan)} / m²` : '';
}

/** Paksa kartu pembebasan-lahan memakai tarif resmi CMS (bukan biaya_label basi). */
function terapkanTarifLahan<T extends { slug?: string; highlight?: string }>(
  list: T[],
  tarifLabel: string
): T[] {
  if (!tarifLabel) return list;
  return list.map((p) =>
    p.slug === 'pembebasan-lahan' ? { ...p, highlight: tarifLabel } : p
  );
}

export async function GET() {
  try {
    const tarifLabel = await getTarifLahanLabel();

    const { data: programs, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_archived', false)
      .order('urutan', { ascending: true });

    if (error || !programs || programs.length === 0) {
      return NextResponse.json(
        {
          programs: terapkanTarifLahan(
            fallbackPrograms as { slug?: string; highlight?: string }[],
            tarifLabel
          ),
          source: 'local-fallback',
        },
        { headers: CACHE_HEADERS }
      );
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

    return NextResponse.json(
      {
        programs: terapkanTarifLahan(list, tarifLabel),
        source: 'database',
      },
      { headers: CACHE_HEADERS }
    );
  } catch (err) {
    console.error('Error fetching programs API:', err);
    const tarifLabel = await getTarifLahanLabel();
    return NextResponse.json(
      {
        programs: terapkanTarifLahan(
          fallbackPrograms as { slug?: string; highlight?: string }[],
          tarifLabel
        ),
        source: 'fallback-error',
      },
      { headers: CACHE_HEADERS }
    );
  }
}
