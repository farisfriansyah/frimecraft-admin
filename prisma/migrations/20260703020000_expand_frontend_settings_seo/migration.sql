-- Expand frontend SEO settings for metadata, verification, and structured data
ALTER TABLE "frontend_settings"
ADD COLUMN "ogImageAlt" TEXT,
ADD COLUMN "organizationName" TEXT,
ADD COLUMN "organizationLogoUrl" TEXT,
ADD COLUMN "defaultAuthorName" TEXT,
ADD COLUMN "defaultLocale" TEXT,
ADD COLUMN "twitterHandle" TEXT,
ADD COLUMN "socialProfileUrls" TEXT,
ADD COLUMN "googleSiteVerification" TEXT,
ADD COLUMN "bingSiteVerification" TEXT,
ADD COLUMN "themeColor" TEXT;
