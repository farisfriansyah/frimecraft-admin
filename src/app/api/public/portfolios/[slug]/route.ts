import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

function normalizeLang(value: string | null) {
  return value?.toLowerCase() === "en" ? "en" : "id";
}

export async function GET(request: NextRequest, context: Context) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(`public:portfolios:detail:${ip}`, {
    windowMs: 60_000,
    max: 180,
  });

  if (!rate.allowed) {
    logSecurityEvent({
      event: "public.portfolios.detail",
      status: "deny",
      route: "/api/public/portfolios/[slug]",
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

  const { slug } = await context.params;
  const lang = normalizeLang(request.nextUrl.searchParams.get("lang"));

  const portfolio = await db.portfolio.findFirst({
    where: {
      slug,
      isDisabled: false,
    },
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
      keywords: true,
      keywordsEn: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          name: true,
        },
      },
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
  });

  if (!portfolio) {
    return NextResponse.json({ error: "Portfolio tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: portfolio.id,
      title: lang === "en" ? portfolio.titleEn || portfolio.title : portfolio.title,
      slug: portfolio.slug,
      sortNumber: portfolio.sortNumber,
      description: lang === "en" ? portfolio.descriptionEn || portfolio.description : portfolio.description,
      imageUrl: portfolio.imageUrl,
      projectUrl: portfolio.projectUrl,
      tags: lang === "en" ? portfolio.tagsEn || portfolio.tags : portfolio.tags,
      featured: portfolio.featured,
      seoTitle: lang === "en" ? portfolio.seoTitleEn || portfolio.seoTitle || portfolio.titleEn || portfolio.title : portfolio.seoTitle,
      seoDescription: lang === "en" ? portfolio.seoDescriptionEn || portfolio.seoDescription || portfolio.descriptionEn || portfolio.description : portfolio.seoDescription,
      keywords: lang === "en" ? portfolio.keywordsEn || portfolio.keywords : portfolio.keywords,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
      workFor: portfolio.workFor,
      workAt: portfolio.workAt,
      authorName: portfolio.user?.name || null,
    },
  });
}
