import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya periksa rute halaman admin
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('yimi_admin_session');

    // Jika sedang di halaman login dan sudah ada session cookie, arahkan ke dashboard
    if (pathname === '/admin/login') {
      if (sessionCookie && sessionCookie.value) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Jika bukan halaman login dan tidak ada cookie session, tendang ke login
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
