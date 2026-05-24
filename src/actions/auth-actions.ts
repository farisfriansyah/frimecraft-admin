// src/actions/auth-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { createSession, destroySession } from "@/src/lib/session";
import { verifyLogin } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * LOGIN ACTION
 * Menangani proses otentikasi, pembuatan sesi, dan update waktu login.
 */
export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi!" };
    }

    // 1. Verifikasi kredensial menggunakan helper verifyLogin
    // Fungsi ini sudah mengecek user ada, password benar, status aktif, dan role admin
    const user = await verifyLogin(email, password);

    if (!user) {
      return { 
        success: false, 
        message: "Email atau password salah, atau akun tidak memiliki akses administrator." 
      };
    }

    // 2. Hancurkan sesi lama (jika ada) sebelum membuat sesi baru
    // Ini krusial untuk mencegah akun tertukar
    await destroySession();

    // 3. Buat sesi baru (JWT di dalam cookie)
    await createSession(user.id);

    // 4. Update riwayat waktu login terakhir pengguna ke database PostgreSQL
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Bersihkan cache router agar data sesi baru terbaca instan di seluruh layout /admin
    revalidatePath("/admin", "layout");

    return { success: true, message: "Login berhasil, mengalihkan halaman..." };

  } catch (error) {
    console.error("[Fatal Login Action Error]:", error);
    return { success: false, message: "Terjadi kesalahan internal pada server." };
  }
}

/**
 * LOGOUT ACTION
 * Menghapus cookie sesi secara total.
 */
export async function logoutAction() {
  try {
    // Menghapus cookie 'session' dari browser user
    await destroySession();

    // Bersihkan cache router untuk memastikan redirect aman
    revalidatePath("/admin", "layout");
    
    return { success: true, message: "Anda telah keluar dari sistem." };
  } catch (error) {
    console.error("[Logout Action Error]:", error);
    return { success: false, message: "Gagal menghapus sesi login." };
  }
}