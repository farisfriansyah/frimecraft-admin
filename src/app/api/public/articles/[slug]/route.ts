import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

type Context = {
  params: Promise<{
    slug: string;
  }>;
};

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

  const article = await db.article.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      sortNumber: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      seoTitle: true,
      seoDescription: true,
      keywords: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: article });
}
