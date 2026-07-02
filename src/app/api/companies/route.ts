// src/app/api/companies/route.ts
import { db } from "@/src/lib/prisma";
import { guardApiPermission } from "@/src/lib/security/guards";
import { logSecurityEvent } from "@/src/lib/security/audit";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { companyPayloadSchema } from "@/src/lib/security/validation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const route = req.nextUrl.pathname;
  const method = req.method;
  const ip = getClientIp(req);

  const guard = await guardApiPermission("company.manage");
  if (!guard.ok) {
    logSecurityEvent({
      event: "companies.post.forbidden",
      status: "deny",
      route,
      method,
      actorId: null,
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

  const body = await req.json();
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
  const company = await db.company.create({
    data: { name },
  });

  logSecurityEvent({
    event: "companies.post.success",
    status: "success",
    route,
    method,
    actorId: guard.userId,
    detail: { ip, companyId: company.id },
  });

  return NextResponse.json(company);
}

export async function GET(request: NextRequest) {
  const route = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIp(request);

  const guard = await guardApiPermission("company.manage");
  if (!guard.ok) {
    logSecurityEvent({
      event: "companies.get.forbidden",
      status: "deny",
      route,
      method,
      actorId: null,
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