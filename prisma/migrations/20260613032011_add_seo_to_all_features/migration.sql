-- AlterTable
ALTER TABLE "certifications" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT;

-- AlterTable
ALTER TABLE "educations" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT;

-- AlterTable
ALTER TABLE "languages" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT;

-- AlterTable
ALTER TABLE "portfolios" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tags" TEXT;

-- AlterTable
ALTER TABLE "work_experiences" ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "slug" TEXT;
