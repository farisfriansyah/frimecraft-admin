import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { guardApiAdmin } from "@/src/lib/security/guards";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

type AllowedListKey =
  | "all"
  | "articles"
  | "portfolios"
  | "experiences"
  | "educations"
  | "skills"
  | "languages"
  | "certifications";

const allowedKeys: AllowedListKey[] = [
  "all",
  "articles",
  "portfolios",
  "experiences",
  "educations",
  "skills",
  "languages",
  "certifications",
];

function clampLimit(value: string | null): number {
  const parsed = Number(value ?? "20");
  if (Number.isNaN(parsed)) return 20;
  return Math.min(Math.max(parsed, 1), 100);
}

async function authorizeDevListAccess(request: NextRequest) {
  const route = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIp(request);

  const isDevMode = process.env.NODE_ENV !== "production";
  const allowInProd = process.env.ALLOW_DEV_LISTS_IN_PRODUCTION === "true";

  if (!isDevMode && !allowInProd) {
    logSecurityEvent({
      event: "dev_lists.disabled_in_production",
      status: "deny",
      route,
      method,
      actorId: null,
      detail: { ip },
    });
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Endpoint disabled" }, { status: 404 }),
    };
  }

  const expectedApiKey = process.env.DEV_API_KEY;
  if (expectedApiKey) {
    const incomingApiKey = request.headers.get("x-dev-api-key");
    if (!incomingApiKey || incomingApiKey !== expectedApiKey) {
      logSecurityEvent({
        event: "dev_lists.invalid_api_key",
        status: "deny",
        route,
        method,
        actorId: null,
        detail: { ip },
      });
      return {
        ok: false as const,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
  }

  const guard = await guardApiAdmin();
  if (!guard.ok) {
    logSecurityEvent({
      event: "dev_lists.forbidden",
      status: "deny",
      route,
      method,
      actorId: null,
      detail: { ip, status: guard.response.status },
    });

    return {
      ok: false as const,
      response: guard.response,
    };
  }

  return { ok: true as const, userId: guard.userId };
}

export async function GET(request: NextRequest) {
  const auth = await authorizeDevListAccess(request);
  if (!auth.ok) return auth.response;

  const route = request.nextUrl.pathname;
  const method = request.method;
  const ip = getClientIp(request);

  const limiter = await checkRateLimit(`dev-lists:${auth.userId}:${ip}`, {
    windowMs: 60_000,
    max: 60,
  });

  if (!limiter.allowed) {
    const retryAfterSeconds = Math.ceil(limiter.retryAfterMs / 1000);
    logSecurityEvent({
      event: "dev_lists.rate_limited",
      status: "deny",
      route,
      method,
      actorId: auth.userId,
      detail: { ip, retryAfterSeconds },
    });

    return NextResponse.json(
      { error: "Too many requests", retryAfterSeconds },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const listParam = (searchParams.get("list") ?? "all").toLowerCase() as AllowedListKey;
  const limit = clampLimit(searchParams.get("limit"));

  if (!allowedKeys.includes(listParam)) {
    logSecurityEvent({
      event: "dev_lists.invalid_param",
      status: "deny",
      route,
      method,
      actorId: auth.userId,
      detail: { ip, listParam },
    });

    return NextResponse.json(
      {
        error: "Invalid list parameter",
        allowed: allowedKeys,
      },
      { status: 400 }
    );
  }

  const includeAll = listParam === "all";

  const result: Record<string, unknown> = {};

  if (includeAll || listParam === "articles") {
    result.articles = await db.article.findMany({
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        featuredImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  if (includeAll || listParam === "portfolios") {
    result.portfolios = await db.portfolio.findMany({
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        projectUrl: true,
        featured: true,
        isDisabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  if (includeAll || listParam === "experiences") {
    result.experiences = await db.workExperience.findMany({
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        position: true,
        slug: true,
        location: true,
        startMonth: true,
        startYear: true,
        endMonth: true,
        endYear: true,
        isCurrent: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  if (includeAll || listParam === "educations") {
    result.educations = await db.education.findMany({
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        institution: true,
        degree: true,
        slug: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  if (includeAll || listParam === "skills") {
    result.skills = await db.skill.findMany({
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
      },
    });
  }

  if (includeAll || listParam === "languages") {
    result.languages = await db.language.findMany({
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        proficiency: true,
      },
    });
  }

  if (includeAll || listParam === "certifications") {
    result.certifications = await db.certification.findMany({
      take: limit,
      orderBy: { id: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        issuer: true,
        issueDate: true,
        url: true,
      },
    });
  }

  logSecurityEvent({
    event: "dev_lists.success",
    status: "success",
    route,
    method,
    actorId: auth.userId,
    detail: { ip, listParam, limit },
  });

  return NextResponse.json({
    success: true,
    requestedList: listParam,
    limit,
    data: result,
  });
}
