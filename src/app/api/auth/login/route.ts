// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { verifyLogin } from '@/src/lib/auth';
import { createSession } from '@/src/lib/session';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await verifyLogin(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // buat session (set cookie)
    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Login route error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
