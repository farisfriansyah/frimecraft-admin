// src/lib/rbac.ts
import { db } from "@/src/lib/prisma";

/**
 * Memeriksa apakah user memiliki izin untuk melakukan aksi tertentu.
 * * Menggunakan 'select' untuk efisiensi database (hanya mengambil data yang diperlukan).
 * User yang tidak ditemukan atau isActive: false akan langsung ditolak.
 * * @param userId - ID unik pengguna dari sesi
 * @param requiredPermission - Nama izin yang dibutuhkan (misal: 'delete_portfolio')
 * @returns boolean - true jika diizinkan, false jika ditolak
 */
export async function hasPermission(userId: number, requiredPermission: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        isActive: true,
        role: {
          select: {
            permissions: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // 1. Keamanan: Jika user tidak ditemukan di DB, akses ditolak.
    // 2. Keamanan: Jika user dinonaktifkan (isActive: false), akses ditolak.
    if (!user || !user.isActive) {
      return false;
    }

    // Mengambil daftar nama permission dari relasi role
    const userPermissions = user.role?.permissions.map((p) => p.name) || [];

    // 3. Logika RBAC:
    // 'all' bertindak sebagai kunci master (Super Admin).
    // Jika tidak punya 'all', maka harus memiliki permission spesifik yang diminta.
    return (
      userPermissions.includes("all") || 
      userPermissions.includes(requiredPermission)
    );
  } catch (error) {
    console.error("RBAC Permission Check Error:", error);
    // Jika terjadi error database, secara default kita tolak akses (Fail-safe)
    return false;
  }
}