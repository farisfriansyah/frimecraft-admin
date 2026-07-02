import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseBoolean(value: string | null, fallback = true) {
  if (value === null) return fallback;
  return value === "true";
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(`public:portfolios:${ip}`, {
    windowMs: 60_000,
    max: 120,
  });

  if (!rate.allowed) {
    logSecurityEvent({
      event: "public.portfolios.list",
      status: "deny",
      route: "/api/public/portfolios",
      method: "GET",
      detail: { ip, reason: "rate_limit", retryAfterMs: rate.retryAfterMs },
    });

    return NextResponse.json(
      { error: "Terlalu banyak request" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
        },
      },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const pageSize = Math.min(parsePositiveInt(searchParams.get("pageSize"), 9), 30);
  const featuredOnly = parseBoolean(searchParams.get("featured"), true);
  const q = (searchParams.get("q") || "").trim();
  const tag = (searchParams.get("tag") || "").trim();

  const where = {
    isDisabled: false,
    ...(featuredOnly ? { featured: true } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(tag ? { tags: { contains: tag, mode: "insensitive" as const } } : {}),
  };

  const skip = (page - 1) * pageSize;

  const [total, portfolios] = await Promise.all([
    db.portfolio.count({ where }),
    db.portfolio.findMany({
      where,
      orderBy: [{ sortNumber: "asc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        sortNumber: true,
        description: true,
        imageUrl: true,
        projectUrl: true,
        tags: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        workFor: {
          select: {
            name: true,
          },
        },
        workAt: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: portfolios,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  });
}
