// src/lib/session.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { getSessionSecretBytes } from '@/src/lib/security/config';
import { getAdminCookiePath } from '@/src/lib/app-config';

const secret = getSessionSecretBytes();

/**
 * Membuat sesi dengan payload userId dan role.
 * Role disimpan di JWT untuk efisiensi pengecekan akses (RBAC).
 */
export async function createSession(userId: number, role: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: getAdminCookiePath(),
    sameSite: 'lax',
    expires,
  });
}

/**
 * Mendapatkan session yang sudah terverifikasi beserta role-nya.
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    
    // Validasi data payload
    const userId = Number(payload.userId);
    const role = payload.role as string;

    if (!userId || isNaN(userId) || !role) return null;

    return { userId, role };
  } catch (err) {
    // Token tidak valid atau kadaluarsa
    return null;
  }
}

/**
 * Menghapus sesi dengan menghapus cookie dari browser.
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: getAdminCookiePath(),
    sameSite: 'lax',
    expires: new Date(0),
  });
}