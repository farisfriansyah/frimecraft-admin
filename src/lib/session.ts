// src/lib/session.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

// Pastikan SECRET ada, jika tidak, aplikasi akan error di production (seharusnya begitu agar aman)
const SECRET = process.env.SESSION_SECRET;
if (!SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: SESSION_SECRET must be set in production!');
}

const secret = new TextEncoder().encode(SECRET ?? 'dev-secret-key-yang-sangat-panjang-dan-unik');

// CREATE SESSION (LOGIN)
export async function createSession(userId: number) {
  // Waktu kadaluarsa 7 hari
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 'jose' bisa menerima string '7d' langsung, lebih rapi
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    expires,
  });
}

// src/lib/session.ts (Update di bagian getSession)
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    
    // VALIDASI TAMBAHAN: Pastikan userId ada dan berupa angka yang valid (> 0)
    const userId = Number(payload.userId);
    if (!userId || isNaN(userId)) return null;

    return { userId };
  } catch (err) {
    return null;
  }
}

// LOGOUT
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}