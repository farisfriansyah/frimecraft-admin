// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET || 'dev-secret'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin/*
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify JWT di middleware (Edge-safe)
    try {
      await jwtVerify(token, SECRET);
      // valid → boleh lanjut
      return NextResponse.next();
    } catch (err) {
      // Token expired atau invalid
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Route lain biarkan lewat
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
