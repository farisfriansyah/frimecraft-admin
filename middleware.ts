// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'dev-secret-key-yang-sangat-panjang-dan-unik'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteksi /admin/*
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // 2. Verify JWT
      const { payload } = await jwtVerify(token, SECRET);
      
      // 3. Tambahan Keamanan: Cek apakah userId valid (> 0)
      // Ini mencegah user yang sudah logout (userId=0) masuk kembali
      const userId = Number(payload.userId);
      if (!userId || userId <= 0) {
        throw new Error("Invalid User ID");
      }

      return NextResponse.next();
    } catch (err) {
      // Jika token expired, rusak, atau userId <= 0, arahkan ke login
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Hapus cookie rusak agar browser bersih
      response.cookies.delete('session');
      return response;
    }
  }

  // 4. Mencegah user login mengakses halaman /login lagi (Opsional tapi disarankan)
  if (pathname === '/login') {
    const token = request.cookies.get('session')?.value;
    if (token) {
      try {
        await jwtVerify(token, SECRET);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};