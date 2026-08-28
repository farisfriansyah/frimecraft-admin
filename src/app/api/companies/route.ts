// src/app/api/companies/route.ts
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { getSession } from "@/src/lib/session";
import { logSecurityEvent } from "@/src/lib/security/audit";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { companyPayloadSchema } from "@/src/lib/security/validation";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

type CompaniesGuardResult =
  | { ok: true; userId: number }
  | { ok: false; userId: number | null; response: NextResponse };

async function guardCompaniesPermission(requiredPermissions: string[]): Promise<CompaniesGuardResult> {
  const session = await getSession();
  if (!session?.userId) {
    return {
      ok: false,
      userId: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const checks = await Promise.all(requiredPermissions.map((permission) => hasPermission(session.userId, permission)));
  if (!checks.some(Boolean)) {
    return {
      ok: false,
      userId: session.userId,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.userId };
}

export async function POST(req: NextRequest) {
  const route = req.nextUrl.pathname;
  const method = req.method;
  const ip = getClientIp(req);

  const guard = await guardCompaniesPermission([
    "company.manage",
    "experience.create",
    "experience.update",
    "portfolio.create",
    "portfolio.update",
  ]);
  if (!guard.ok) {
    logSecurityEvent({
      event: "companies.post.forbidden",
      status: "deny",
      route,
      method,
      actorId: guard.userId,
      detail: { ip, status: guard.response.status },
    });
    return guard.response;
  }

  const limiter = await checkRateLimit(`companies:post:${guard.userId}:${ip}`, {
    windowMs: 60_000,
    max: 20,
  });

  if (!limiter.allowed) {
    const retryAfterSeconds = Math.ceil(limiter.retryAfterMs / 1000);
    logSecurityEvent({
      event: "companies.post.rate_limited",
      status: "deny",
      route,
      method,
      actorId: guard.userId,
      detail: { ip, retryAfterSeconds },
    });
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    logSecurityEvent({
      event: "companies.post.invalid_payload",
      status: "deny",
      route,
      method,
      actorId: guard.userId,
      detail: { ip, reason: "invalid_json" },
    });
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }

  const parsed = companyPayloadSchema.safeParse(body);
  if (!parsed.success) {
    logSecurityEvent({
      event: "companies.post.invalid_payload",
      status: "deny",
      route,
      method,
      actorId: guard.userId,
      detail: { ip },
    });
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }

  const { name } = parsed.data;
  try {
    const company = await db.company.create({
      data: { name },
    });

    logSecurityEvent({
      event: "companies.post.success",
      status: "success",
      route,
      method,
      actorId: guard.userId,
      detail: { ip, companyId: company.id, existed: false },
    });

    return NextResponse.json({ company, existed: false });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await db.company.findUnique({ where: { name } });
      if (existing) {
        logSecurityEvent({
          event: "companies.post.success",
          status: "success",
          route,
          method,
          actorId: guard.userId,
          detail: { ip, companyId: existing.id, existed: true },
        });
        return NextResponse.json({ company: existing, existed: true });
      }
      return NextResponse.json({ error: "Perusahaan sudah ada" }, { status: 409 });
    }

    logSecurityEvent({
      event: "companies.post.error",
      status: "error",
      route,
      method,
      actorId: guard.userId,
      detail: { ip },
    });
    return NextResponse.json({ error: "Gagal menyimpan perusahaan" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const route = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIp(request);

  const guard = await guardCompaniesPermission([
    "company.manage",
    "experience.create",
    "experience.update",
    "portfolio.create",
    "portfolio.update",
  ]);
  if (!guard.ok) {
    logSecurityEvent({
      event: "companies.get.forbidden",
      status: "deny",
      route,
      method,
      actorId: guard.userId,
      detail: { ip, status: guard.response.status },
    });
    return guard.response;
  }

  const limiter = await checkRateLimit(`companies:get:${guard.userId}:${ip}`, {
    windowMs: 60_000,
    max: 60,
  });

  if (!limiter.allowed) {
    const retryAfterSeconds = Math.ceil(limiter.retryAfterMs / 1000);
    logSecurityEvent({
      event: "companies.get.rate_limited",
      status: "deny",
      route,
      method,
      actorId: guard.userId,
      detail: { ip, retryAfterSeconds },
    });
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  logSecurityEvent({
    event: "companies.get.success",
    status: "success",
    route,
    method,
    actorId: guard.userId,
    detail: { ip, count: companies.length },
  });

  return NextResponse.json(companies);
}