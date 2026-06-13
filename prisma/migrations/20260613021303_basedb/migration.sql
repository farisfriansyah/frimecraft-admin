/*
  Warnings:

  - You are about to drop the column `company` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `work_experiences` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `work_experiences` table. All the data in the column will be lost.
  - Added the required column `position` to the `work_experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startMonth` to the `work_experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startYear` to the `work_experiences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "work_experiences" DROP COLUMN "company",
DROP COLUMN "endDate",
DROP COLUMN "role",
DROP COLUMN "startDate",
ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "endMonth" INTEGER,
ADD COLUMN     "endYear" INTEGER,
ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "startMonth" INTEGER NOT NULL,
ADD COLUMN     "startYear" INTEGER NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
