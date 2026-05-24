"use server";

import { db } from "@/src/lib/prisma";
import { createSession, destroySession } from "@/src/lib/session";
import { verifyLogin } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * LOGIN ACTION
 * Menggunakan Server Action untuk keamanan maksimal (built-in CSRF protection).
 */
export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi!" };
    }

    // 1. Verifikasi kredensial
    const user = await verifyLogin(email, password);

    if (!user) {
      return { 
        success: false, 
        message: "Email atau password salah, atau akun tidak memiliki akses administrator." 
      };
    }

    // 2. Hancurkan sesi lama
    await destroySession();

    // 3. Buat sesi baru DENGAN ROLE
    // Pastikan user.role.name tersedia di objek user hasil verifyLogin
    const role = (user.role as any)?.name || "USER";
    await createSession(user.id, role);

    // 4. Update waktu login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    revalidatePath("/admin", "layout");

    return { success: true, message: "Login berhasil." };

  } catch (error) {
    console.error("[Login Action Error]:", error);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

/**
 * LOGOUT ACTION
 */
export async function logoutAction() {
  try {
    await destroySession();
    // Redirect ke root atau login setelah logout dilakukan di sisi klien
    revalidatePath("/", "layout");
    return { success: true, message: "Logout berhasil." };
  } catch (error) {
    console.error("[Logout Action Error]:", error);
    return { success: false, message: "Gagal memproses logout." };
  }
}