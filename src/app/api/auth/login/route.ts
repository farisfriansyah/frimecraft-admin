// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/src/lib/session"; // Menggunakan fungsi sesi yang sudah kita buat

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi!" }, { status: 400 });
    }

    // 1. Cari user dari PostgreSQL
    const user = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // 2. Keamanan: Gunakan dummy hash untuk Timing Attack
    if (!user || !user.isActive) {
      await bcrypt.compare(password, "$2a$10$NxwV16p5WzQ5b/KshwLdKOnqW8N.17p15M5v4WzQ5b/KshwLdKOnq");
      return NextResponse.json({ message: "Kredensial salah atau akun dinonaktifkan" }, { status: 401 });
    }

    // 3. Verifikasi Password (BACKDOOR "rahasia123" DIHAPUS)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    // 4. RBAC: Pastikan role adalah ADMIN atau SUPER ADMIN
    if (!user.role || (user.role.name !== "ADMIN" && user.role.name !== "SUPER ADMIN")) {
      return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
    }

    // 5. Update lastLogin
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 6. BUAT SESI menggunakan mekanisme JOSE (JWT) yang aman
    // Ini menggantikan response.cookies.set() yang tidak aman sebelumnya
    // Pastikan user.role.name tidak undefined dengan memberikan fallback "USER"
    const userRole = user.role?.name || "USER"; 
    
    // PERBAIKAN: Kirimkan userRole sebagai argumen kedua
    await createSession(user.id, userRole);

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: "Kesalahan server internal" }, { status: 500 });
  }
}