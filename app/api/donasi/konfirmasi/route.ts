import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/telegram';
import { formatRupiah } from '@/lib/format';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Anti-Spam Honeypot check
    if (body.website_trap || body._hp) {
      return NextResponse.json({
        success: true,
        ref_id: 'YIMI-REF-0000',
        message: 'Konfirmasi donasi Anda telah kami terima.',
      });
    }

    const nama = (body.nama || '').trim();
    const isAnonim = !!body.is_anonim;
    const whatsapp = (body.whatsapp || '').trim();
    const program = (body.program || 'Umum').trim();
    const nominal = Number(body.nominal);
    const bankTujuan = (body.bank_tujuan || 'BSI').trim();
    const tanggalTransfer = (body.tanggal_transfer || new Date().toISOString().split('T')[0]).trim();
    const buktiTransferUrl = (body.bukti_transfer_url || '').trim();
    const doa = (body.doa || '').trim();

    if (!nama) {
      return NextResponse.json({ error: 'Nama donatur wajib diisi.' }, { status: 400 });
    }

    if (!whatsapp) {
      return NextResponse.json({ error: 'Nomor WhatsApp wajib diisi untuk konfirmasi.' }, { status: 400 });
    }

    if (isNaN(nominal) || nominal <= 0) {
      return NextResponse.json({ error: 'Nominal donasi harus lebih dari Rp 0.' }, { status: 400 });
    }

    // Buat nomor registrasi referensi unik
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const refId = `YIMI-${dateStr}-${randomSuffix}`;

    const ip = req.headers.get('x-forwarded-for') || 'anon';

    // 1. Catat ke tabel kontak_inbox agar admin dapat membaca dan mengelola secara penuh
    const payloadPesan = JSON.stringify({
      ref_id: refId,
      nama_asli: nama,
      is_anonim: isAnonim,
      nama_tampil: isAnonim ? 'Hamba Allah' : nama,
      whatsapp,
      program,
      nominal,
      bank_tujuan: bankTujuan,
      tanggal_transfer: tanggalTransfer,
      bukti_transfer_url: buktiTransferUrl || null,
      doa: doa || null,
    });

    const { error: inboxError } = await supabase.from('kontak_inbox').insert({
      nama: isAnonim ? `${nama} (Anonim: Hamba Allah)` : nama,
      kontak: whatsapp,
      kategori: `Konfirmasi Donasi: ${program}`,
      pesan: payloadPesan,
      status: 'baru',
      dibaca: false,
      ip_address: ip,
      created_at: new Date().toISOString(),
    });

    if (inboxError) {
      console.warn('Gagal menyimpan konfirmasi ke kontak_inbox:', inboxError);
    }

    // 2. Catat ke tabel donasi_konfirmasi Supabase
    try {
      await supabase.from('donasi_konfirmasi').insert({
        nama_donatur: isAnonim ? `${nama} (Hamba Allah)` : nama,
        nomor_whatsapp: whatsapp,
        program,
        nominal,
        bank_tujuan: bankTujuan,
        tanggal_transfer: tanggalTransfer,
        bukti_transfer_url: buktiTransferUrl || null,
        catatan: doa ? `Doa: ${doa} [Ref: ${refId}]` : `[Ref: ${refId}]`,
        status_verifikasi: 'menunggu',
      });
    } catch (e) {
      console.warn('Gagal menyimpan ke donasi_konfirmasi:', e);
    }

    // 3. Notifikasi instan ke Telegram pengurus (non-blocking)
    const formattedNominal = formatRupiah(nominal);
    const donorDisplay = isAnonim ? `${escapeHtml(nama)} (<i>Tampil sebagai Hamba Allah</i>)` : escapeHtml(nama);
    
    let tgMsg = `💰 <b>Konfirmasi Donasi Baru Masuk!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `<b>No. Registrasi:</b> <code>${refId}</code>\n` +
      `<b>Nama Donatur:</b> ${donorDisplay}\n` +
      `<b>WhatsApp:</b> ${escapeHtml(whatsapp)}\n` +
      `<b>Program:</b> <b>${escapeHtml(program)}</b>\n` +
      `<b>Nominal:</b> <b>${formattedNominal}</b>\n` +
      `<b>Bank Tujuan:</b> ${escapeHtml(bankTujuan)}\n` +
      `<b>Tanggal Transfer:</b> ${escapeHtml(tanggalTransfer)}\n`;

    if (doa) {
      tgMsg += `\n<b>Doa / Titipan Pesan:</b>\n<i>"${escapeHtml(doa)}"</i>\n`;
    }

    if (buktiTransferUrl) {
      tgMsg += `\n📎 <b>Bukti Transfer:</b> <a href="${escapeHtml(buktiTransferUrl)}">Lihat Foto Bukti</a>\n`;
    }

    tgMsg += `\n📅 <i>${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;

    sendTelegramNotification(tgMsg).catch(() => {});

    return NextResponse.json({
      success: true,
      ref_id: refId,
      data: {
        ref_id: refId,
        nama: isAnonim ? 'Hamba Allah' : nama,
        nama_asli: nama,
        is_anonim: isAnonim,
        whatsapp,
        program,
        nominal,
        bank_tujuan: bankTujuan,
        tanggal_transfer: tanggalTransfer,
        doa,
      },
      message: 'Jazakallahu khairan. Konfirmasi donasi Anda telah kami terima dan tercatat di sistem yayasan.',
    });
  } catch (error) {
    console.error('Donasi konfirmasi error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat memproses konfirmasi donasi.' }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
