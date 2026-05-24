// src/app/actions/rbac.ts
"use server";

import { db } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache"; // <--- PERBAIKAN: Menggunakan 'next/cache' yang benar

// ==========================================
// 1) ACTIONS UNTUK MANAJEMEN USER
// ==========================================

export async function getUsers() {
  return await db.user.findMany({
    include: {
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(userId: number, roleId: number) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { roleId },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "Role berhasil diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui role" };
  }
}

export async function toggleUserStatus(userId: number, currentStatus: boolean) {
  try {
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
// 2) ACTIONS UNTUK MANAJEMEN ROLE & PERMISSION
// ==========================================

export async function getRolesWithPermissions() {
  return await db.role.findMany({
    include: {
      permissions: true,
    },
    orderBy: { id: "asc" },
  });
}

export async function getAllPermissions() {
  return await db.permission.findMany({
    orderBy: { name: "asc" },
  });
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]) {
  try {
    // Sinkronisasi relasi many-to-many antara Role dan Permission menggunakan 'set'
    await db.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
      },
    });
    revalidatePath("/admin/roles");
    return { success: true, message: "Hak akses role berhasil diperbarui" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui hak akses" };
  }
}