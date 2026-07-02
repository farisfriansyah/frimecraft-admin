// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession } from "@/src/lib/session"; // Menggunakan fungsi sesi yang sudah kita buat
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";
import { loginPayloadSchema } from "@/src/lib/security/validation";

export async function POST(request: NextRequest) {
  const route = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIp(request);

  const ipLimiter = await checkRateLimit(`auth-login:ip:${ip}`, {
    windowMs: 60_000,
    max: 20,
  });

  if (!ipLimiter.allowed) {
    const retryAfterSeconds = Math.ceil(ipLimiter.retryAfterMs / 1000);
    logSecurityEvent({
      event: "auth.login.rate_limited",
      status: "deny",
      route,
      method,
      actorId: null,
      detail: { ip, retryAfterSeconds },
    });

    return NextResponse.json(
      { message: "Terlalu banyak percobaan login" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginPayloadSchema.safeParse(body);
    if (!parsed.success) {
      logSecurityEvent({
        event: "auth.login.invalid_payload",
        status: "deny",
        route,
        method,
        actorId: null,
        detail: { ip },
      });
      return NextResponse.json({ message: "Email dan password wajib diisi!" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const emailLimiter = await checkRateLimit(`auth-login:email:${String(email).toLowerCase()}:${ip}`, {
      windowMs: 10 * 60_000,
      max: 10,
    });

    if (!emailLimiter.allowed) {
      const retryAfterSeconds = Math.ceil(emailLimiter.retryAfterMs / 1000);
      logSecurityEvent({
        event: "auth.login.email_rate_limited",
        status: "deny",
        route,
        method,
        actorId: null,
        detail: { ip, email: String(email).toLowerCase(), retryAfterSeconds },
      });

      return NextResponse.json(
        { message: "Terlalu banyak percobaan login untuk akun ini" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        }
      );
    }

    // 1. Cari user dari PostgreSQL
    const user = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    // 2. Keamanan: Gunakan dummy hash untuk Timing Attack
    if (!user || !user.isActive) {
      await bcrypt.compare(password, "$2a$10$NxwV16p5WzQ5b/KshwLdKOnqW8N.17p15M5v4WzQ5b/KshwLdKOnq");
      logSecurityEvent({
        event: "auth.login.rejected_user",
        status: "deny",
        route,
        method,
        actorId: user?.id ?? null,
        detail: { ip, email: String(email).toLowerCase() },
      });
      return NextResponse.json({ message: "Kredensial salah atau akun dinonaktifkan" }, { status: 401 });
    }

    // 3. Verifikasi Password (BACKDOOR "rahasia123" DIHAPUS)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logSecurityEvent({
        event: "auth.login.invalid_password",
        status: "deny",
        route,
        method,
        actorId: user.id,
        detail: { ip, email: user.email },
      });
      return NextResponse.json({ message: "Email atau password salah" }, { status: 401 });
    }

    // 4. RBAC: Pastikan role adalah ADMIN atau SUPER ADMIN
    if (!user.role || (user.role.name !== "ADMIN" && user.role.name !== "SUPER ADMIN")) {
      logSecurityEvent({
        event: "auth.login.forbidden_role",
        status: "deny",
        route,
        method,
        actorId: user.id,
        detail: { ip, role: user.role?.name ?? null },
      });
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

    logSecurityEvent({
      event: "auth.login.success",
      status: "success",
      route,
      method,
      actorId: user.id,
      detail: { ip, role: userRole },
    });

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
    logSecurityEvent({
      event: "auth.login.error",
      status: "error",
      route,
      method,
      actorId: null,
      detail: { ip },
    });
    return NextResponse.json({ message: "Kesalahan server internal" }, { status: 500 });
  }
}