-- Add bilingual English fields for profile-related entities
ALTER TABLE "work_experiences"
ADD COLUMN "positionEn" TEXT,
ADD COLUMN "descriptionEn" TEXT;

ALTER TABLE "educations"
ADD COLUMN "institutionEn" TEXT,
ADD COLUMN "degreeEn" TEXT,
ADD COLUMN "descriptionEn" TEXT;

ALTER TABLE "skills"
ADD COLUMN "nameEn" TEXT,
ADD COLUMN "notesEn" TEXT;

ALTER TABLE "certifications"
ADD COLUMN "titleEn" TEXT,
ADD COLUMN "issuerEn" TEXT;
