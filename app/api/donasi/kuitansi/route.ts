import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { publicCacheHeaders } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const refParam = (searchParams.get('ref') || '').trim().slice(0, 60);

  if (!refParam) {
    return NextResponse.json(
      { error: 'Parameter ref wajib diisi' },
      { status: 400 }
    );
  }

  try {
    // Cari pesan di kontak_inbox yang memuat ref_id
    const { data, error } = await supabase
      .from('kontak_inbox')
      .select('id, nama, kategori, pesan, created_at, status')
      .like('pesan', `%"ref_id":"${refParam}"%`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error lookup kuitansi by ref:', error);
      return NextResponse.json(
        { error: 'Terjadi kesalahan sistem' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { found: false, message: 'Nomor registrasi tidak ditemukan' },
        { status: 404 }
      );
    }

    let parsed: Record<string, any> = {};
    try {
      if (data.pesan && data.pesan.startsWith('{')) {
        parsed = JSON.parse(data.pesan);
      }
    } catch {
      // fallback
    }

    const isAnon = !!parsed.is_anonim;
    const namaTampil = isAnon
      ? 'Hamba Allah'
      : (parsed.nama_asli || data.nama || 'Muhsinin YIMI').replace(/\s*\(Anonim.*?\)/i, '');

    return NextResponse.json(
      {
        found: true,
        receipt: {
          ref_id: parsed.ref_id || refParam,
          nama: namaTampil,
          program: parsed.program || data.kategori.replace('Konfirmasi Donasi: ', '') || 'Pembebasan Lahan Wakaf YIMI',
          nominal: Number(parsed.nominal) || 0,
          tanggal: parsed.tanggal_transfer || (data.created_at ? data.created_at.split('T')[0] : ''),
          bank: parsed.bank_tujuan || 'Bank Syariah Indonesia (BSI)',
          status: data.status === 'terverifikasi' ? 'terverifikasi' : 'menunggu',
        },
      },
      { headers: publicCacheHeaders(30) }
    );
  } catch (err) {
    console.error('Exception lookup kuitansi:', err);
    return NextResponse.json(
      { error: 'Gagal memproses pencarian kuitansi' },
      { status: 500 }
    );
  }
}
