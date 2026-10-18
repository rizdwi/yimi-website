import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';

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

    // Notifikasi instan ke Telegram pengurus (non-blocking)
    const tgMsg = `📬 <b>Pesan Silaturahim Baru Masuk!</b>\n\n` +
      `<b>Nama:</b> ${escapeHtml(body.nama)}\n` +
      `<b>Kontak:</b> ${escapeHtml(body.kontak)}\n` +
      `<b>Kategori:</b> ${escapeHtml(body.kategori || 'Umum')}\n\n` +
      `<b>Isi Pesan:</b>\n<i>${escapeHtml(body.pesan)}</i>\n\n` +
      `📅 <i>${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;

    sendTelegramNotification(tgMsg).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Jazakallahu khairan. Pesan Anda telah kami terima dan akan segera ditindaklanjuti oleh pengurus yayasan.',
    });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
