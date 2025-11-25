// src/lib/session.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = process.env.NEXTAUTH_SECRET || process.env.SESSION_SECRET;
if (!SECRET) {
  console.warn('WARNING: NEXTAUTH_SECRET / SESSION_SECRET not set. Using fallback.');
}
const secret = new TextEncoder().encode(SECRET ?? 'dev-secret');

// CREATE SESSION (LOGIN)
export async function createSession(userId: number) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expSec = Math.floor(expires.getTime() / 1000);

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expSec)
    .sign(secret);

  const cookieStore = await cookies(); // ← FIX: wajib pakai await
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    expires,
  });
}

// GET SESSION
export async function getSession() {
  try {
    const cookieStore = await cookies(); // ← FIX
    const token = cookieStore.get('session')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number };
  } catch {
    return null;
  }
}

// LOGOUT
export async function destroySession() {
  const cookieStore = await cookies(); // ← FIX
  cookieStore.delete('session');
}
