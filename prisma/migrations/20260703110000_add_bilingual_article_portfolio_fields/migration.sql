-- Add bilingual English fields for article and portfolio content
ALTER TABLE "articles"
ADD COLUMN "titleEn" TEXT,
ADD COLUMN "excerptEn" TEXT,
ADD COLUMN "contentEn" TEXT,
ADD COLUMN "seoTitleEn" TEXT,
ADD COLUMN "seoDescriptionEn" TEXT,
ADD COLUMN "keywordsEn" TEXT,
ADD COLUMN "tagsEn" TEXT;

ALTER TABLE "portfolios"
ADD COLUMN "titleEn" TEXT,
ADD COLUMN "descriptionEn" TEXT,
ADD COLUMN "seoTitleEn" TEXT,
ADD COLUMN "seoDescriptionEn" TEXT,
ADD COLUMN "keywordsEn" TEXT,
ADD COLUMN "tagsEn" TEXT;
