// src/actions/user-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// === 1. CREATE USER ===
export async function createUserAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, message: "Sesi kedaluwarsa." };

    const canCreate = await hasPermission(session.userId, "user.create");
    if (!canCreate) return { success: false, message: "Akses ditolak. Anda tidak punya izin membuat user baru." };

    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;
    const roleId = Number(formData.get("roleId"));

    if (!password || password.length < 6) {
      return { success: false, message: "Password minimal harus berisi 6 karakter." };
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return { success: false, message: "Email tersebut sudah terdaftar di sistem." };

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        isActive: true,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User baru berhasil dibuat!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan saat membuat user." };
  }
}

// === 2. UPDATE PROFILE & ROLE USER ===
export async function updateUserAction(userId: number, formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, message: "Sesi kedaluwarsa." };

    const canUpdate = await hasPermission(session.userId, "user.update");
    if (!canUpdate) return { success: false, message: "Akses ditolak. Anda tidak punya izin mengubah data user." };

    const name = formData.get("name") as string;
    const email = (formData.get("email") as string).trim().toLowerCase();
    const roleId = Number(formData.get("roleId"));

    const existing = await db.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (existing) return { success: false, message: "Email sudah digunakan oleh pengguna lain." };

    await db.user.update({
      where: { id: userId },
      data: { name, email, roleId },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Informasi user berhasil diperbarui." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal memperbarui data user." };
  }
}

// === 3. CHANGE PASSWORD USER ===
export async function changeUserPasswordAction(userId: number, formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, message: "Sesi kedaluwarsa." };

    const canUpdate = await hasPermission(session.userId, "user.update");
    if (!canUpdate) return { success: false, message: "Akses ditolak. Anda tidak memiliki izin ganti password." };

    const newPassword = formData.get("newPassword") as string;
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: "Password minimal harus berisi 6 karakter." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password user berhasil diubah secara aman!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengubah password user." };
  }
}

// === 4. DELETE USER ===
export async function deleteUserAction(userId: number) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, message: "Sesi kedaluwarsa." };

    const canDelete = await hasPermission(session.userId, "user.delete");
    if (!canDelete) return { success: false, message: "Akses ditolak. Anda tidak punya izin menghapus user." };

    if (session.userId === userId) {
      return { success: false, message: "Tindakan ilegal! Anda tidak bisa menghapus akun Anda sendiri." };
    }

    await db.user.delete({ where: { id: userId } });

    revalidatePath("/admin/users");
    return { success: true, message: "Akun pengguna berhasil dihapus secara permanen." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menghapus user dari database." };
  }
}

// === 5. TOGGLE USER STATUS (AKTIF/NONAKTIF) ===
export async function toggleUserStatusAction(userId: number, currentStatus: boolean) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, message: "Sesi kedaluwarsa." };

    const canUpdate = await hasPermission(session.userId, "user.update");
    if (!canUpdate) return { success: false, message: "Akses ditolak." };

    // Mencegah admin menonaktifkan diri sendiri
    if (session.userId === userId) {
      return { success: false, message: "Anda tidak bisa mengubah status akun Anda sendiri." };
    }

    await db.user.update({
      where: { id: userId },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "Status akun berhasil diperbarui." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal mengubah status user." };
  }
}