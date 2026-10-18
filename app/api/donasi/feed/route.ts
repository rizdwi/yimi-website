import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kontak_inbox')
      .select('id, nama, kategori, pesan, created_at')
      .like('kategori', 'Konfirmasi Donasi%')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('Gagal memuat feed donasi:', error);
      return NextResponse.json({ feed: [] });
    }

    const feed = (data || []).map((item) => {
      let parsed = {
        nama_tampil: item.nama.replace(/\s*\(Anonim.*?\)/i, ''),
        is_anonim: item.nama.includes('(Anonim'),
        program: item.kategori.replace('Konfirmasi Donasi: ', ''),
        nominal: 0,
        doa: '',
        tanggal: item.created_at ? item.created_at.split('T')[0] : '',
      };

      try {
        if (item.pesan && item.pesan.startsWith('{')) {
          const obj = JSON.parse(item.pesan);
          parsed.nama_tampil = obj.is_anonim ? 'Hamba Allah' : maskName(obj.nama_asli || item.nama);
          parsed.is_anonim = !!obj.is_anonim;
          parsed.program = obj.program || parsed.program;
          parsed.nominal = Number(obj.nominal) || 0;
          parsed.doa = obj.doa || '';
          parsed.tanggal = obj.tanggal_transfer || parsed.tanggal;
        }
      } catch {
        // fallback
      }

      return {
        id: item.id,
        nama: parsed.nama_tampil,
        is_anonim: parsed.is_anonim,
        program: parsed.program,
        nominal: parsed.nominal,
        doa: parsed.doa,
        tanggal: parsed.tanggal,
        waktu: item.created_at,
      };
    });

    return NextResponse.json({ feed });
  } catch (error) {
    console.error('Feed donasi error:', error);
    return NextResponse.json({ feed: [] });
  }
}

function maskName(name: string): string {
  if (!name) return 'Hamba Allah';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    if (parts[0].length <= 3) return parts[0];
    return parts[0].slice(0, 3) + '***';
  }
  return parts[0] + ' ' + parts.slice(1).map((p) => p[0] + '.').join(' ');
}
