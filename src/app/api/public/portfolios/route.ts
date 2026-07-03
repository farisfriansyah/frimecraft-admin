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

function normalizeLang(value: string | null) {
  return value?.toLowerCase() === "en" ? "en" : "id";
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
  const lang = normalizeLang(searchParams.get("lang"));

  const where = {
    isDisabled: false,
    ...(featuredOnly ? { featured: true } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { titleEn: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { descriptionEn: { contains: q, mode: "insensitive" as const } },
            { tags: { contains: q, mode: "insensitive" as const } },
            { tagsEn: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(tag
      ? {
          OR: [
            { tags: { contains: tag, mode: "insensitive" as const } },
            { tagsEn: { contains: tag, mode: "insensitive" as const } },
          ],
        }
      : {}),
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
        titleEn: true,
        slug: true,
        sortNumber: true,
        description: true,
        descriptionEn: true,
        imageUrl: true,
        projectUrl: true,
        tags: true,
        tagsEn: true,
        featured: true,
        seoTitle: true,
        seoTitleEn: true,
        seoDescription: true,
        seoDescriptionEn: true,
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

  const localizedPortfolios = portfolios.map((portfolio) => ({
    id: portfolio.id,
    title: lang === "en" ? portfolio.titleEn || portfolio.title : portfolio.title,
    slug: portfolio.slug,
    sortNumber: portfolio.sortNumber,
    description: lang === "en" ? portfolio.descriptionEn || portfolio.description : portfolio.description,
    imageUrl: portfolio.imageUrl,
    projectUrl: portfolio.projectUrl,
    tags: lang === "en" ? portfolio.tagsEn || portfolio.tags : portfolio.tags,
    featured: portfolio.featured,
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
    workFor: portfolio.workFor,
    workAt: portfolio.workAt,
  }));

  return NextResponse.json({
    success: true,
    data: localizedPortfolios,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  });
}
