import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import siteFallback from '@/content/site.json';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        settings: {
          nama_lengkap: siteFallback.namaLengkap,
          singkatan: siteFallback.singkatan,
          tagline: siteFallback.tagline,
          whatsapp: siteFallback.kontak.whatsapp,
          email: siteFallback.kontak.email,
          alamat: siteFallback.kontak.alamat,
          maps_embed: siteFallback.kontak.mapsEmbed,
          jam_operasional: siteFallback.kontak.jamOperasional,
          logo_yayasan: '/logo/logo-yimi.svg',
          foto_yayasan: null,
          sosmed: siteFallback.sosmed,
          bank_1_nama: siteFallback.donasi.bank,
          bank_1_rekening: siteFallback.donasi.noRekening,
          bank_1_an: siteFallback.donasi.atasNama,
          bank_2_nama: siteFallback.donasi.rekeningLain.bank,
          bank_2_rekening: siteFallback.donasi.rekeningLain.noRekening,
          bank_2_an: siteFallback.donasi.rekeningLain.atasNama,
          qris_image: siteFallback.donasi.qrisImage,
        },
      });
    }

    // Prioritaskan logo_yayasan, fallback ke foto_yayasan atau logo lokal
    const activeLogo = data.logo_yayasan || data.foto_yayasan || '/logo/logo-yimi.svg';

    return NextResponse.json({
      settings: {
        ...data,
        logo_yayasan: activeLogo,
      },
    });
  } catch (err) {
    console.error('Error in public site-settings API:', err);
    return NextResponse.json({
      settings: {
        nama_lengkap: siteFallback.namaLengkap,
        singkatan: siteFallback.singkatan,
        tagline: siteFallback.tagline,
        logo_yayasan: '/logo/logo-yimi.svg',
      },
    });
  }
}
