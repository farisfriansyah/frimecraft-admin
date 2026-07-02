-- CreateTable
CREATE TABLE "security_audit_logs" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "actorId" INTEGER,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_audit_logs_createdAt_idx" ON "security_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "security_audit_logs_event_idx" ON "security_audit_logs"("event");

-- CreateIndex
CREATE INDEX "security_audit_logs_status_idx" ON "security_audit_logs"("status");

-- CreateIndex
CREATE INDEX "security_audit_logs_actorId_idx" ON "security_audit_logs"("actorId");

-- AddForeignKey
ALTER TABLE "security_audit_logs" ADD CONSTRAINT "security_audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed granular permissions
INSERT INTO "permissions" ("name", "description") VALUES
  ('language.manage', 'Izin mengatur data bahasa'),
  ('skill.manage', 'Izin mengatur data skill'),
  ('certification.manage', 'Izin mengatur data sertifikasi')
ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description";

-- Grant new permissions to any role that already has experience.manage
INSERT INTO "_RolePermissions" ("A", "B")
SELECT p_new."id", rp."B"
FROM "_RolePermissions" rp
JOIN "permissions" p_existing ON p_existing."id" = rp."A"
JOIN "permissions" p_new ON p_new."name" IN ('language.manage', 'skill.manage', 'certification.manage')
WHERE p_existing."name" = 'experience.manage'
ON CONFLICT DO NOTHING;
