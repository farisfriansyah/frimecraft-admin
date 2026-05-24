// src/lib/rbac.ts
import { db } from "@/src/lib/prisma";

export async function hasPermission(userId: number, requiredPermission: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  // Jika user tidak ditemukan atau dinonaktifkan, blokir langsung
  if (!user || !user.isActive) return false;

  const userPermissions = user.role?.permissions.map((p) => p.name) || [];

  // Berikan akses jika memiliki kunci master 'all' ATAU izin spesifik yang diminta
  return userPermissions.includes("all") || userPermissions.includes(requiredPermission);
}