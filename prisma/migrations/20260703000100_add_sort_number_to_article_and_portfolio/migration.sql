-- Add manual ordering field for public/admin listing priorities
ALTER TABLE "articles"
ADD COLUMN "sortNumber" INTEGER;

ALTER TABLE "portfolios"
ADD COLUMN "sortNumber" INTEGER;
