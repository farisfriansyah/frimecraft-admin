import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(`public:frontend-settings:${ip}`, {
    windowMs: 60_000,
    max: 120,
  });

  if (!rate.allowed) {
    logSecurityEvent({
      event: "public.frontend_settings.get",
      status: "deny",
      route: "/api/public/frontend-settings",
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

  const setting = await db.frontendSetting.findUnique({
    where: { key: "default" },
    select: {
      siteTitle: true,
      siteDescription: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      canonicalUrl: true,
      ogImageUrl: true,
      footerText: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: setting,
  });
}
