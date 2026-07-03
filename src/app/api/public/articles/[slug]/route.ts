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
  const rate = await checkRateLimit(`public:articles:detail:${ip}`, {
    windowMs: 60_000,
    max: 180,
  });

  if (!rate.allowed) {
    logSecurityEvent({
      event: "public.articles.detail",
      status: "deny",
      route: "/api/public/articles/[slug]",
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

  const article = await db.article.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      titleEn: true,
      slug: true,
      sortNumber: true,
      excerpt: true,
      excerptEn: true,
      content: true,
      contentEn: true,
      featuredImage: true,
      seoTitle: true,
      seoTitleEn: true,
      seoDescription: true,
      seoDescriptionEn: true,
      keywords: true,
      keywordsEn: true,
      tags: true,
      tagsEn: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: article.id,
      title: lang === "en" ? article.titleEn || article.title : article.title,
      slug: article.slug,
      sortNumber: article.sortNumber,
      excerpt: lang === "en" ? article.excerptEn || article.excerpt : article.excerpt,
      content: lang === "en" ? article.contentEn || article.content : article.content,
      featuredImage: article.featuredImage,
      seoTitle: lang === "en" ? article.seoTitleEn || article.seoTitle || article.titleEn || article.title : article.seoTitle,
      seoDescription: lang === "en" ? article.seoDescriptionEn || article.seoDescription || article.excerptEn || article.excerpt : article.seoDescription,
      keywords: lang === "en" ? article.keywordsEn || article.keywords : article.keywords,
      tags: lang === "en" ? article.tagsEn || article.tags : article.tags,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    },
  });
}
