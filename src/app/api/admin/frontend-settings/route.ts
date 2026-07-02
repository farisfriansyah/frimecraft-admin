import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { guardApiPermission } from "@/src/lib/security/guards";
import { z } from "zod";

const frontendSettingsSchema = z.object({
  siteTitle: z.string().trim().max(160).nullable().optional(),
  siteDescription: z.string().trim().max(300).nullable().optional(),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  seoDescription: z.string().trim().max(300).nullable().optional(),
  seoKeywords: z.string().trim().max(500).nullable().optional(),
  canonicalUrl: z.string().trim().url().max(300).nullable().optional(),
  ogImageUrl: z.string().trim().url().max(300).nullable().optional(),
  footerText: z.string().trim().max(300).nullable().optional(),
});

function normalizeNullable(value?: string | null) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.length > 0 ? value : null;
}

export async function GET() {
  const guard = await guardApiPermission("frontend_settings.manage");
  if (!guard.ok) return guard.response;

  const setting = await db.frontendSetting.findUnique({
    where: { key: "default" },
  });

  return NextResponse.json({
    success: true,
    data: setting,
  });
}

export async function PUT(request: NextRequest) {
  const guard = await guardApiPermission("frontend_settings.manage");
  if (!guard.ok) return guard.response;

  const body = await request.json();
  const parsed = frontendSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }

  const data = parsed.data;

  const updated = await db.frontendSetting.upsert({
    where: { key: "default" },
    update: {
      siteTitle: normalizeNullable(data.siteTitle),
      siteDescription: normalizeNullable(data.siteDescription),
      seoTitle: normalizeNullable(data.seoTitle),
      seoDescription: normalizeNullable(data.seoDescription),
      seoKeywords: normalizeNullable(data.seoKeywords),
      canonicalUrl: normalizeNullable(data.canonicalUrl),
      ogImageUrl: normalizeNullable(data.ogImageUrl),
      footerText: normalizeNullable(data.footerText),
    },
    create: {
      key: "default",
      siteTitle: normalizeNullable(data.siteTitle) ?? null,
      siteDescription: normalizeNullable(data.siteDescription) ?? null,
      seoTitle: normalizeNullable(data.seoTitle) ?? null,
      seoDescription: normalizeNullable(data.seoDescription) ?? null,
      seoKeywords: normalizeNullable(data.seoKeywords) ?? null,
      canonicalUrl: normalizeNullable(data.canonicalUrl) ?? null,
      ogImageUrl: normalizeNullable(data.ogImageUrl) ?? null,
      footerText: normalizeNullable(data.footerText) ?? null,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
