-- CreateTable
CREATE TABLE "frontend_settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "siteTitle" TEXT,
    "siteDescription" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    "footerText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frontend_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "frontend_settings_key_key" ON "frontend_settings"("key");

-- Seed frontend settings permission
INSERT INTO "permissions" ("name", "description") VALUES
  ('frontend_settings.manage', 'Izin mengatur konfigurasi website frontend')
ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description";

-- Grant permission to SUPER ADMIN and ADMIN
INSERT INTO "_RolePermissions" ("A", "B")
SELECT p."id", r."id"
FROM "permissions" p
JOIN "roles" r ON r."name" IN ('SUPER ADMIN', 'ADMIN')
WHERE p."name" = 'frontend_settings.manage'
ON CONFLICT DO NOTHING;

-- Ensure admin@frimecraft.com is SUPER ADMIN
UPDATE "users"
SET "roleId" = r."id", "isActive" = true
FROM "roles" r
WHERE r."name" = 'SUPER ADMIN'
  AND "users"."email" = 'admin@frimecraft.com';
