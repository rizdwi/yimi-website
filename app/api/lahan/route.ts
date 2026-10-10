import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import landFallback from '@/content/land-campaign.json';

export const revalidate = 60;

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
};

export async function GET() {
  try {
    const { data: campaignData, error: campaignError } = await supabase
      .from('wakaf_lahan')
      .select('*')
      .limit(1)
      .maybeSingle();

    const { data: updatesData, error: updatesError } = await supabase
      .from('land_updates')
      .select('*')
      .order('tanggal', { ascending: false });

    if (campaignError) {
      console.error('Error fetching wakaf_lahan from Supabase:', campaignError);
    }
    if (updatesError) {
      console.error('Error fetching land_updates from Supabase:', updatesError);
    }

    if (campaignData) {
      const updates = (updatesData || []).map((u) => ({
        id: u.id,
        tanggal: u.tanggal,
        nominal: Number(u.nominal) || 0,
        catatan: u.catatan || '',
        gambarUrl: u.gambar_url || null,
        createdBy: u.created_by || '',
      }));

      // Total dana terkumpul
      const terkumpul = Number(campaignData.terkumpul) || 0;
      const targetDana = Number(campaignData.target_dana) || landFallback.targetDana;
      const luasTargetM2 = Number(campaignData.luas_target_m2) || landFallback.luasTargetM2;
      const hargaPerMeter = Number(campaignData.harga_per_meter) || landFallback.hargaPerMeter;

      return NextResponse.json(
        {
          campaign: {
            id: campaignData.id,
            judul: campaignData.judul || landFallback.judul,
            subjudul: landFallback.subjudul,
            lokasi: campaignData.lokasi || landFallback.lokasi,
            luasTargetM2,
            hargaPerMeter,
            targetDana,
            terkumpul,
            diperbaruiPada: campaignData.diperbarui_pada || new Date().toISOString().split('T')[0],
          },
          updates,
        },
        { headers: CACHE_HEADERS }
      );
    }
  } catch (err) {
    console.error('Failed to load public land data:', err);
  }

  // Fallback ke data JSON lokal jika database belum terisi atau koneksi gagal
  return NextResponse.json(
    {
      campaign: {
        judul: landFallback.judul,
        subjudul: landFallback.subjudul,
        lokasi: landFallback.lokasi,
        luasTargetM2: landFallback.luasTargetM2,
        hargaPerMeter: landFallback.hargaPerMeter,
        targetDana: landFallback.targetDana,
        terkumpul: landFallback.terkumpul,
        diperbaruiPada: landFallback.diperbaruiPada,
      },
      updates: [],
    },
    { headers: CACHE_HEADERS }
  );
}
