import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import landFallback from '@/content/land-campaign.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CACHE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
  'Vercel-CDN-Cache-Control': 'no-cache, no-store, must-revalidate',
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
      const meta = (campaignData.metadata || {}) as Record<string, unknown>;
      const paketWakaf = Array.isArray(meta.paket_wakaf) ? meta.paket_wakaf : landFallback.paketWakaf;
      const paketJudul = typeof meta.paket_judul === 'string' && meta.paket_judul.trim() ? meta.paket_judul : 'Pilihan Paket Wakaf Tanah';
      const paketSubjudul = typeof meta.paket_subjudul === 'string' && meta.paket_subjudul.trim() ? meta.paket_subjudul : 'Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.';
      const rencanaPenggunaan = Array.isArray(meta.rencana_penggunaan) ? meta.rencana_penggunaan : landFallback.rencanaPenggunaan;
      const tahapan = Array.isArray(meta.tahapan) ? meta.tahapan : landFallback.tahapan;
      const faq = Array.isArray(meta.faq) ? meta.faq : landFallback.faq;
      const subjudul = typeof meta.subjudul === 'string' && meta.subjudul.trim() ? meta.subjudul : landFallback.subjudul;

      return NextResponse.json(
        {
          campaign: {
            id: campaignData.id,
            judul: campaignData.judul || landFallback.judul,
            subjudul,
            lokasi: campaignData.lokasi || landFallback.lokasi,
            luasTargetM2,
            hargaPerMeter,
            targetDana,
            terkumpul,
            diperbaruiPada: campaignData.diperbarui_pada || new Date().toISOString().split('T')[0],
            paketWakaf,
            paketJudul,
            paketSubjudul,
            rencanaPenggunaan,
            tahapan,
            faq,
            metadata: meta,
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
        paketWakaf: landFallback.paketWakaf,
        paketJudul: 'Pilihan Paket Wakaf Tanah',
        paketSubjudul: 'Pahala jariyah yang abadi untuk Anda dan orang tua tercinta.',
        rencanaPenggunaan: landFallback.rencanaPenggunaan,
        tahapan: landFallback.tahapan,
        faq: landFallback.faq,
      },
      updates: [],
    },
    { headers: CACHE_HEADERS }
  );
}
