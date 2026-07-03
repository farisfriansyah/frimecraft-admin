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
  ogImageAlt: z.string().trim().max(160).nullable().optional(),
  organizationName: z.string().trim().max(160).nullable().optional(),
  organizationLogoUrl: z.string().trim().url().max(300).nullable().optional(),
  defaultAuthorName: z.string().trim().max(120).nullable().optional(),
  defaultLocale: z.string().trim().max(20).nullable().optional(),
  twitterHandle: z.string().trim().max(50).nullable().optional(),
  socialProfileUrls: z.string().trim().max(1000).nullable().optional(),
  clarityProjectId: z.string().trim().max(100).nullable().optional(),
  googleSiteVerification: z.string().trim().max(255).nullable().optional(),
  bingSiteVerification: z.string().trim().max(255).nullable().optional(),
  themeColor: z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Theme color harus hex seperti #0f172a").nullable().optional(),
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
      ogImageAlt: normalizeNullable(data.ogImageAlt),
      organizationName: normalizeNullable(data.organizationName),
      organizationLogoUrl: normalizeNullable(data.organizationLogoUrl),
      defaultAuthorName: normalizeNullable(data.defaultAuthorName),
      defaultLocale: normalizeNullable(data.defaultLocale),
      twitterHandle: normalizeNullable(data.twitterHandle),
      socialProfileUrls: normalizeNullable(data.socialProfileUrls),
      clarityProjectId: normalizeNullable(data.clarityProjectId),
      googleSiteVerification: normalizeNullable(data.googleSiteVerification),
      bingSiteVerification: normalizeNullable(data.bingSiteVerification),
      themeColor: normalizeNullable(data.themeColor),
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
      ogImageAlt: normalizeNullable(data.ogImageAlt) ?? null,
      organizationName: normalizeNullable(data.organizationName) ?? null,
      organizationLogoUrl: normalizeNullable(data.organizationLogoUrl) ?? null,
      defaultAuthorName: normalizeNullable(data.defaultAuthorName) ?? null,
      defaultLocale: normalizeNullable(data.defaultLocale) ?? null,
      twitterHandle: normalizeNullable(data.twitterHandle) ?? null,
      socialProfileUrls: normalizeNullable(data.socialProfileUrls) ?? null,
      clarityProjectId: normalizeNullable(data.clarityProjectId) ?? null,
      googleSiteVerification: normalizeNullable(data.googleSiteVerification) ?? null,
      bingSiteVerification: normalizeNullable(data.bingSiteVerification) ?? null,
      themeColor: normalizeNullable(data.themeColor) ?? null,
      footerText: normalizeNullable(data.footerText) ?? null,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
