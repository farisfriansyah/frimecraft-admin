// src/lib/auth.ts
import { db } from '@/src/lib/prisma';
import bcrypt from 'bcryptjs';

export async function verifyLogin(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      include: { role: true }, // Pastikan menyertakan relasi role
    });

    if (!user) return null;

    // 1. Cek status aktif akun (PENTING untuk keamanan)
    if (!user.isActive) return null;

    // 2. Perbaikan Logika Role: Akses relasi 'role.name'
    // Asumsi: 'ADMIN' adalah nama peran yang diizinkan masuk dashboard
    if (user.role?.name !== 'ADMIN' && user.role?.name !== 'SUPER ADMIN') {
      return null;
    }

    // 3. Bandingkan password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    // 4. Kembalikan data user yang diperlukan
    return { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: user.role.name 
    };
  } catch (error) {
    console.error('verifyLogin error:', error);
    return null;
  }
}