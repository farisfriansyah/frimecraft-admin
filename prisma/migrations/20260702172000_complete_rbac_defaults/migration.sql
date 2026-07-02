-- Seed and normalize RBAC permissions
INSERT INTO "permissions" ("name", "description") VALUES
  ('all', 'Akses penuh ke seluruh sistem'),
  ('role.manage', 'Izin mengelola role dan permission'),
  ('user.read', 'Izin melihat daftar pengguna'),
  ('user.create', 'Izin membuat pengguna'),
  ('user.update', 'Izin mengubah pengguna'),
  ('user.delete', 'Izin menghapus pengguna'),
  ('portfolio.create', 'Izin membuat portofolio'),
  ('portfolio.update', 'Izin mengubah portofolio'),
  ('portfolio.delete', 'Izin menghapus portofolio'),
  ('article.create', 'Izin membuat artikel'),
  ('article.update', 'Izin mengubah artikel'),
  ('article.delete', 'Izin menghapus artikel'),
  ('experience.create', 'Izin membuat riwayat kerja'),
  ('experience.update', 'Izin mengubah riwayat kerja'),
  ('experience.delete', 'Izin menghapus riwayat kerja'),
  ('education.manage', 'Izin mengatur data pendidikan'),
  ('language.manage', 'Izin mengatur data bahasa'),
  ('skill.manage', 'Izin mengatur data skill'),
  ('certification.manage', 'Izin mengatur data sertifikasi'),
  ('company.manage', 'Izin mengelola data company'),
  ('frontend_settings.manage', 'Izin mengatur konfigurasi website frontend'),
  ('experience.manage', 'Izin legacy untuk kompatibilitas lama'),
  ('user.manage', 'Izin legacy untuk manajemen pengguna admin')
ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description";

-- Ensure default roles exist
INSERT INTO "roles" ("name", "description", "createdAt", "updatedAt") VALUES
  ('SUPER ADMIN', 'Akses penuh seluruh modul dan konfigurasi RBAC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ADMIN', 'Administrator operasional', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('EDITOR', 'Editor konten tanpa akses manajemen user/role', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "updatedAt" = CURRENT_TIMESTAMP;

-- SUPER ADMIN gets all permissions
INSERT INTO "_RolePermissions" ("A", "B")
SELECT p."id", r."id"
FROM "permissions" p
JOIN "roles" r ON r."name" = 'SUPER ADMIN'
ON CONFLICT DO NOTHING;

-- ADMIN permission set
INSERT INTO "_RolePermissions" ("A", "B")
SELECT p."id", r."id"
FROM "permissions" p
JOIN "roles" r ON r."name" = 'ADMIN'
WHERE p."name" IN (
  'user.read',
  'user.create',
  'user.update',
  'user.delete',
  'portfolio.create',
  'portfolio.update',
  'portfolio.delete',
  'article.create',
  'article.update',
  'article.delete',
  'experience.create',
  'experience.update',
  'experience.delete',
  'education.manage',
  'language.manage',
  'skill.manage',
  'certification.manage',
  'company.manage',
  'frontend_settings.manage'
)
ON CONFLICT DO NOTHING;

-- EDITOR permission set
INSERT INTO "_RolePermissions" ("A", "B")
SELECT p."id", r."id"
FROM "permissions" p
JOIN "roles" r ON r."name" = 'EDITOR'
WHERE p."name" IN (
  'portfolio.create',
  'portfolio.update',
  'article.create',
  'article.update',
  'experience.create',
  'experience.update',
  'education.manage',
  'language.manage',
  'skill.manage',
  'certification.manage',
  'frontend_settings.manage'
)
ON CONFLICT DO NOTHING;

-- Backfill new granular permissions to roles that already had experience.manage
INSERT INTO "_RolePermissions" ("A", "B")
SELECT p_new."id", rp."B"
FROM "_RolePermissions" rp
JOIN "permissions" p_existing ON p_existing."id" = rp."A"
JOIN "permissions" p_new ON p_new."name" IN ('language.manage', 'skill.manage', 'certification.manage')
WHERE p_existing."name" = 'experience.manage'
ON CONFLICT DO NOTHING;
