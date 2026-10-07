import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest, verifyPassword, hashPassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi Anda telah berakhir. Silakan masuk kembali.' }, { status: 401 });
    }

    const { passwordLama, passwordBaru } = await req.json();

    if (!passwordLama || !passwordBaru) {
      return NextResponse.json({ error: 'Password lama dan baru wajib diisi.' }, { status: 400 });
    }

    if (passwordBaru.length < 8) {
      return NextResponse.json({ error: 'Password baru minimal 8 karakter.' }, { status: 400 });
    }

    // Ambil user dari database
    const { data: user } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', session.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const isMatch = verifyPassword(passwordLama, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Password lama tidak sesuai.' }, { status: 400 });
    }

    const newHash = hashPassword(passwordBaru);
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newHash })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Gagal memperbarui password di database.' }, { status: 500 });
    }

    await createAuditLog(session.email, 'Akun', 'Ganti password berhasil', user.id);

    return NextResponse.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem.' }, { status: 500 });
  }
}
