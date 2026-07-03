import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function normalizeLang(value: string | null) {
  return value?.toLowerCase() === "en" ? "en" : "id";
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(`public:articles:${ip}`, {
    windowMs: 60_000,
    max: 120,
  });

  if (!rate.allowed) {
    logSecurityEvent({
      event: "public.articles.list",
      status: "deny",
      route: "/api/public/articles",
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
  const q = (searchParams.get("q") || "").trim();
  const tag = (searchParams.get("tag") || "").trim();
  const lang = normalizeLang(searchParams.get("lang"));
  const skip = (page - 1) * pageSize;

  const where = {
    isPublished: true,
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { titleEn: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
            { excerptEn: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
            { contentEn: { contains: q, mode: "insensitive" as const } },
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

  const [total, articles] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
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
        excerpt: true,
        excerptEn: true,
        featuredImage: true,
        seoTitle: true,
        seoTitleEn: true,
        seoDescription: true,
        seoDescriptionEn: true,
        tags: true,
        tagsEn: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const localizedArticles = articles.map((article) => ({
    id: article.id,
    title: lang === "en" ? article.titleEn || article.title : article.title,
    slug: article.slug,
    sortNumber: article.sortNumber,
    excerpt: lang === "en" ? article.excerptEn || article.excerpt : article.excerpt,
    featuredImage: article.featuredImage,
    seoTitle: lang === "en" ? article.seoTitleEn || article.seoTitle || article.titleEn || article.title : article.seoTitle,
    seoDescription: lang === "en" ? article.seoDescriptionEn || article.seoDescription || article.excerptEn || article.excerpt : article.seoDescription,
    tags: lang === "en" ? article.tagsEn || article.tags : article.tags,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  }));

  return NextResponse.json({
    success: true,
    data: localizedArticles,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  });
}
