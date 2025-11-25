// src/lib/auth.ts
import { db } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function verifyLogin(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: true },
    });

    if (!user) return null;

    // hanya izinkan ADMIN (sesuai kebutuhanmu)
    if (user.role !== 'ADMIN') return null;

    // bandingkan password plain -> hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // kembalikan data minimal yang diperlukan
    return { id: user.id, email: user.email, name: user.name };
  } catch (error) {
    console.error('verifyLogin error:', error);
    return null;
  }
}
