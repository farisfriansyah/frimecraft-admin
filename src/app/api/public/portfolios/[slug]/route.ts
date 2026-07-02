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

  const portfolio = await db.portfolio.findFirst({
    where: {
      slug,
      isDisabled: false,
    },
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
      seoTitle: true,
      seoDescription: true,
      keywords: true,
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
      ...portfolio,
      authorName: portfolio.user?.name || null,
    },
  });
}
