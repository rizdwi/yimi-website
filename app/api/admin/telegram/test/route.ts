import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const token = body.bot_token;
    const chatId = body.chat_id;

    const testMessage =
      `🔔 *Uji Coba Notifikasi Telegram YIMI*\n\n` +
      `Alhamdulillah, integrasi bot Telegram Yayasan Insan Muslim Istiqomah berhasil aktif!\n` +
      `• Penguji: ${session.email}\n` +
      `• Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n` +
      `Setiap pesan kontak masuk dan konfirmasi donasi baru akan otomatis dikirimkan ke ruang obrolan ini.`;

    const success = await sendTelegramNotification(testMessage, token, chatId);

    if (!success) {
      return NextResponse.json(
        { error: 'Gagal mengirim pesan uji coba. Periksa kembali token bot dan chat ID Anda.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Pesan uji coba berhasil dikirim!' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
