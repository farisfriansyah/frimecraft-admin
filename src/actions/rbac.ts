// src/actions/rbac.ts
"use server";

import { db } from "@/src/lib/prisma";
import { guardActionPermission } from "@/src/lib/security/guards";
import { revalidatePath } from "next/cache";

// ==========================================
// 1) ACTIONS MANAJEMEN USER
// ==========================================

export async function getUsers() {
  const guard = await guardActionPermission("user.read");
  if (!guard.ok) return [];

  return await db.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(userId: number, roleId: number) {
  try {
    const guard = await guardActionPermission("user.update");
    if (!guard.ok) return { success: false, message: guard.error === "Unauthorized" ? "Unauthorized" : "Akses ditolak" };

    await db.user.update({
      where: { id: userId },
      data: { roleId },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "Peran pengguna berhasil diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui peran pengguna" };
  }
}

export async function toggleUserStatus(userId: number, currentStatus: boolean) {
  try {
    const guard = await guardActionPermission("user.update");
    if (!guard.ok) return { success: false, message: guard.error === "Unauthorized" ? "Unauthorized" : "Akses ditolak" };

    await db.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "Status pengguna berhasil diubah" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengubah status" };
  }
}

// ==========================================
// 2) ACTIONS MANAJEMEN ROLES & PERMISSIONS
// ==========================================

export async function getRolesWithPermissions() {
  const guard = await guardActionPermission("role.manage");
  if (!guard.ok) return [];

  return await db.role.findMany({
    include: { permissions: true },
    orderBy: { id: "asc" },
  });
}

export async function getAllPermissions() {
  const guard = await guardActionPermission("role.manage");
  if (!guard.ok) return [];

  return await db.permission.findMany({
    orderBy: { name: "asc" },
  });
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]) {
  try {
    const guard = await guardActionPermission("role.manage");
    if (!guard.ok) return { success: false, message: guard.error === "Unauthorized" ? "Unauthorized" : "Akses ditolak" };

    const role = await db.role.findUnique({
      where: { id: roleId },
      select: { id: true, name: true },
    });

    if (!role) {
      return { success: false, message: "Role tidak ditemukan" };
    }

    if (role.name === "SUPER ADMIN") {
      const allPermission = await db.permission.findUnique({
        where: { name: "all" },
        select: { id: true },
      });

      if (!allPermission) {
        return { success: false, message: "Permission all tidak ditemukan" };
      }

      if (!permissionIds.includes(allPermission.id)) {
        return { success: false, message: "Permission all wajib tetap ada untuk SUPER ADMIN" };
      }
    }

    await db.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
    });

    // SOLUSI SAKTI: Hancurkan seluruh cache payload halaman di bawah prefix /admin secara instan!
    revalidatePath("/admin", "layout"); 
    
    return { success: true, message: "Hak akses peran berhasil diperbarui secara global!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui hak akses" };
  }
}

// BARU: Membuat Peran Baru
export async function createRole(name: string, description: string) {
  try {
    const guard = await guardActionPermission("role.manage");
    if (!guard.ok) return { success: false, message: guard.error === "Unauthorized" ? "Unauthorized" : "Akses ditolak" };

    const cleanName = name.trim().toUpperCase();
    const existing = await db.role.findUnique({ where: { name: cleanName } });
    if (existing) {
      return { success: false, message: "Nama peran sudah terdaftar di sistem" };
    }

    await db.role.create({
      data: { name: cleanName, description },
    });
    revalidatePath("/admin/roles");
    return { success: true, message: "Peran baru berhasil dibuat" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal membuat peran baru" };
  }
}

// BARU: Mengubah Identitas Peran
export async function updateRole(id: number, name: string, description: string) {
  try {
    const guard = await guardActionPermission("role.manage");
    if (!guard.ok) return { success: false, message: guard.error === "Unauthorized" ? "Unauthorized" : "Akses ditolak" };

    const cleanName = name.trim().toUpperCase();
    const existing = await db.role.findFirst({
      where: { name: cleanName, NOT: { id } },
    });
    if (existing) {
      return { success: false, message: "Nama peran tersebut sudah digunakan oleh peran lain" };
    }

    await db.role.update({
      where: { id },
      data: { name: cleanName, description },
    });
    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
    return { success: true, message: "Informasi peran berhasil diubah" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengubah informasi peran" };
  }
}

// BARU: Menghapus Peran dengan Proteksi Referensi
export async function deleteRole(id: number) {
  try {
    const guard = await guardActionPermission("role.manage");
    if (!guard.ok) return { success: false, message: guard.error === "Unauthorized" ? "Unauthorized" : "Akses ditolak" };

    const role = await db.role.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!role) {
      return { success: false, message: "Peran tidak ditemukan" };
    }

    if (role.name === "SUPER ADMIN") {
      return { success: false, message: "Role SUPER ADMIN tidak boleh dihapus" };
    }

    // Validasi Keamanan: Cegah hapus jika ada user yang masih menggunakan role ini
    const userCount = await db.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      return { 
        success: false, 
        message: `Gagal menghapus. Peran ini masih digunakan oleh ${userCount} pengguna.` 
      };
    }

    await db.role.delete({ where: { id } });
    revalidatePath("/admin/roles");
    return { success: true, message: "Peran berhasil dihapus dari database" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus peran" };
  }
}