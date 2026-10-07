import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  verifyPassword,
  createSessionToken,
  COOKIE_NAME,
} from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'local';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const rateCheck = checkRateLimit(`${ip}:${email}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(
            (rateCheck.remainingSeconds || 900) / 60
          )} menit.`,
        },
        { status: 429 }
      );
    }

    // Ambil data user dari Supabase
    const { data: user, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    let validUser = user;
    // Fallback jika database belum ada user tapi cocok dengan akun awal
    if (dbError || !user) {
      if (
        email.trim().toLowerCase() === 'admin@yimi.or.id' &&
        password === 'AdminYimi2026!'
      ) {
        validUser = {
          id: 'admin-default',
          email: 'admin@yimi.or.id',
          nama: 'Rizz (Pengelola YIMI)',
          role: 'admin',
          password_hash: '',
        };
      } else {
        recordFailedAttempt(`${ip}:${email}`);
        return NextResponse.json(
          { error: 'Email atau password salah.' },
          { status: 401 }
        );
      }
    } else {
      const isMatch = verifyPassword(password, user.password_hash);
      if (!isMatch) {
        recordFailedAttempt(`${ip}:${email}`);
        return NextResponse.json(
          { error: 'Email atau password salah.' },
          { status: 401 }
        );
      }
    }

    resetRateLimit(`${ip}:${email}`);

    const token = await createSessionToken({
      id: validUser.id,
      email: validUser.email,
      nama: validUser.nama,
      role: validUser.role || 'admin',
    });

    await createAuditLog(
      validUser.email,
      'Autentikasi',
      `Login berhasil dari IP ${ip}`,
      validUser.id
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: validUser.id,
        email: validUser.email,
        nama: validUser.nama,
        role: validUser.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 jam
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
