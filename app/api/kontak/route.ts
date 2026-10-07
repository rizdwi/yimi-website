import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Anti-Spam Honeypot check
    if (body.website_trap || body._hp) {
      // Bot detected silently
      return NextResponse.json({ success: true, message: 'Pesan Anda telah diterima.' });
    }

    if (!body.nama || !body.kontak || !body.pesan) {
      return NextResponse.json(
        { error: 'Nama, kontak (WhatsApp/Email), dan pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || 'anon';

    const { error } = await supabase.from('kontak_inbox').insert({
      nama: body.nama.trim(),
      kontak: body.kontak.trim(),
      kategori: body.kategori || 'Umum',
      pesan: body.pesan.trim(),
      status: 'baru',
      dibaca: false,
      ip_address: ip,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to save contact message to Supabase:', error);
      return NextResponse.json({ error: 'Gagal mengirim pesan. Silakan coba lagi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Jazakallahu khairan. Pesan Anda telah kami terima dan akan segera ditindaklanjuti oleh pengurus yayasan.',
    });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
