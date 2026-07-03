// prisma/seed.ts
import "dotenv/config";
import pkg from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const { PrismaClient } = pkg;

// Menginisialisasi driver koneksi PostgreSQL murni sesuai standar baru Prisma v7
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting dynamic RBAC database seeding...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@frimecraft.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "rahasia123";

  // ==========================================
  // 1) SEED PERMISSIONS
  // ==========================================
  const permissionsData = [
    { name: "all", description: "Akses penuh ke seluruh sistem" },
    { name: "role.manage", description: "Izin mengelola role dan permission" },
    { name: "user.read", description: "Izin melihat daftar pengguna" },
    { name: "user.create", description: "Izin membuat pengguna" },
    { name: "user.update", description: "Izin mengubah pengguna" },
    { name: "user.delete", description: "Izin menghapus pengguna" },
    { name: "portfolio.create", description: "Izin membuat portofolio" },
    { name: "portfolio.update", description: "Izin mengubah portofolio" },
    { name: "portfolio.delete", description: "Izin menghapus portofolio" },
    { name: "article.create", description: "Izin membuat artikel" },
    { name: "article.update", description: "Izin mengubah artikel" },
    { name: "article.delete", description: "Izin menghapus artikel" },
    { name: "experience.create", description: "Izin membuat riwayat kerja" },
    { name: "experience.update", description: "Izin mengubah riwayat kerja" },
    { name: "experience.delete", description: "Izin menghapus riwayat kerja" },
    { name: "education.manage", description: "Izin mengatur data pendidikan" },
    { name: "language.manage", description: "Izin mengatur data bahasa" },
    { name: "skill.manage", description: "Izin mengatur data skill" },
    { name: "certification.manage", description: "Izin mengatur data sertifikasi" },
    { name: "company.manage", description: "Izin mengelola data company" },
    { name: "frontend_settings.manage", description: "Izin mengatur konfigurasi website frontend" },
    { name: "experience.manage", description: "Izin legacy untuk kompatibilitas lama" },
    { name: "user.manage", description: "Izin legacy untuk manajemen pengguna admin" },
  ];

  console.log("├─ Seeding permissions...");
  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }

  // ==========================================
  // 2) SEED ROLES & ASSIGN PERMISSIONS
  // ==========================================
  console.log("├─ Seeding roles...");

  const allPermissions = await prisma.permission.findMany({
    select: { id: true, name: true },
  });

  const permissionIdByName = new Map(allPermissions.map((p) => [p.name, p.id]));

  const resolvePermissionIds = (names: string[]) => {
    return names
      .map((name) => permissionIdByName.get(name))
      .filter((id): id is number => typeof id === "number")
      .map((id) => ({ id }));
  };

  const allPermissionNames = allPermissions.map((p) => p.name);

  const roleDefinitions: Array<{ name: string; description: string; permissionNames: string[] }> = [
    {
      name: "SUPER ADMIN",
      description: "Akses penuh seluruh modul dan konfigurasi RBAC",
      permissionNames: allPermissionNames,
    },
    {
      name: "ADMIN",
      description: "Administrator operasional",
      permissionNames: [
        "user.read",
        "user.create",
        "user.update",
        "user.delete",
        "portfolio.create",
        "portfolio.update",
        "portfolio.delete",
        "article.create",
        "article.update",
        "article.delete",
        "experience.create",
        "experience.update",
        "experience.delete",
        "education.manage",
        "language.manage",
        "skill.manage",
        "certification.manage",
        "company.manage",
        "frontend_settings.manage",
      ],
    },
    {
      name: "EDITOR",
      description: "Editor konten tanpa akses manajemen user/role",
      permissionNames: [
        "portfolio.create",
        "portfolio.update",
        "article.create",
        "article.update",
        "experience.create",
        "experience.update",
        "education.manage",
        "language.manage",
        "skill.manage",
        "certification.manage",
        "frontend_settings.manage",
      ],
    },
  ];

  for (const roleDef of roleDefinitions) {
    const permissions = resolvePermissionIds(roleDef.permissionNames);
    await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        permissions: {
          set: permissions,
        },
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        permissions: {
          connect: permissions,
        },
      },
    });
  }

  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER ADMIN" },
    select: { id: true },
  });

  if (!superAdminRole) {
    throw new Error("SUPER ADMIN role gagal disiapkan saat seeding.");
  }

  // ==========================================
  // 3) SEED USER ADMIN (SINKRONISASI DATABASE)
  // ==========================================
  console.log("├─ Checking admin user configuration...");
  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashed,
      roleId: superAdminRole.id,
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: hashed,
      name: "Admin FrimeCraft",
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@frimecraft.com" },
    update: {
      roleId: superAdminRole.id,
      isActive: true,
    },
    create: {
      email: "admin@frimecraft.com",
      password: hashed,
      name: "Admin FrimeCraft",
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  console.log(`│  ✓ Admin account secured: ${adminEmail}`);

  const userId = admin.id;

  // ==========================================
  // 4) SEED WORK EXPERIENCES
  // ==========================================
  const weCount = await prisma.workExperience.count({ where: { userId } });

  if (weCount === 0) {
    // 1. Pastikan Perusahaan ada di database agar kita punya ID-nya
    const studio = await prisma.company.upsert({
      where: { name: "Frime Craft Studio" },
      update: {},
      create: { name: "Frime Craft Studio", website: "https://frimecraft.com" }
    });

    const startup = await prisma.company.upsert({
      where: { name: "StartupX" },
      update: {},
      create: { name: "StartupX", website: "https://startupx.com" }
    });

    // 2. Insert Data dengan skema baru
    await prisma.workExperience.createMany({
      data: [
        {
          userId,
          companyId: studio.id,
          position: "Lead UX/UI Designer",
          positionEn: "Lead UX/UI Designer",
          location: "Jakarta, Indonesia",
          startMonth: 1,
          startYear: 2020,
          isCurrent: true,
          endMonth: null,
          endYear: null,
          tags: ["UX", "UI", "Figma"],
          description: "Mendesain produk SaaS, dashboard, dan landing pages untuk klien enterprise.",
          descriptionEn: "Designing SaaS products, dashboards, and landing pages for enterprise clients."
        },
        {
          userId,
          companyId: startup.id,
          position: "Product Designer",
          positionEn: "Product Designer",
          location: "Remote",
          startMonth: 5,
          startYear: 2018,
          isCurrent: false,
          endMonth: 12,
          endYear: 2019,
          tags: ["Product", "Design"],
          description: "Membentuk alur pengguna, prototyping, dan desain visual.",
          descriptionEn: "Shaping user flows, prototyping, and visual design execution."
        }
      ],
    });
    console.log("├─ ✓ Work experiences populated.");
  } else {
    console.log("├─ ⚠ Work experiences already setup, skipping.");
  }

  // ==========================================
  // 5) SEED EDUCATIONS
  // ==========================================
  const eduCount = await prisma.education.count({ where: { userId } });
  if (eduCount === 0) {
    await prisma.education.createMany({
      data: [
        {
          userId,
          institution: "Institut Teknologi Contoh",
          institutionEn: "Example Institute of Technology",
          degree: "S1 Desain Komunikasi Visual",
          degreeEn: "Bachelor of Visual Communication Design",
          startDate: new Date("2013-08-01"),
          endDate: new Date("2017-06-01"),
          description: "Konsentrasi UI/UX dan multimedia.",
          descriptionEn: "Focused on UI/UX and multimedia."
        }
      ],
    });
    console.log("├─ ✓ Educations populated.");
  } else {
    console.log("├─ ⚠ Educations already setup, skipping.");
  }

  // ==========================================
  // 6) SEED SKILLS
  // ==========================================
  const skillsCount = await prisma.skill.count({ where: { userId } });
  if (skillsCount === 0) {
    await prisma.skill.createMany({
      data: [
        { userId, name: "Figma", nameEn: "Figma", level: 90 },
        { userId, name: "Wireframing", nameEn: "Wireframing", level: 85 },
        { userId, name: "Prototyping", nameEn: "Prototyping", level: 85 },
        { userId, name: "Framer", nameEn: "Framer", level: 75 },
        { userId, name: "HTML/CSS", nameEn: "HTML/CSS", level: 70 }
      ],
    });
    console.log("├─ ✓ Skills populated.");
  } else {
    console.log("├─ ⚠ Skills already setup, skipping.");
  }

  // ==========================================
  // 7) SEED LANGUAGES
  // ==========================================
  const langCount = await prisma.language.count({ where: { userId } });
  if (langCount === 0) {
    await prisma.language.createMany({
      data: [
        { userId, name: "Indonesian", proficiency: "Native" },
        { userId, name: "English", proficiency: "Fluent" }
      ],
    });
    console.log("├─ ✓ Languages populated.");
  } else {
    console.log("├─ ⚠ Languages already setup, skipping.");
  }

  // ==========================================
  // 8) SEED CERTIFICATIONS
  // ==========================================
  const certCount = await prisma.certification.count({ where: { userId } });
  if (certCount === 0) {
    await prisma.certification.createMany({
      data: [
        {
          userId,
          title: "Certified UX Designer",
          titleEn: "Certified UX Designer",
          issuer: "Design Institute",
          issuerEn: "Design Institute",
          issueDate: new Date("2021-06-01"),
          url: ""
        }
      ],
    });
    console.log("├─ ✓ Certifications populated.");
  } else {
    console.log("├─ ⚠ Certifications already setup, skipping.");
  }

  // ==========================================
  // 9) SEED PORTFOLIOS
  // ==========================================
  const portCount = await prisma.portfolio.count({ where: { userId } });
  if (portCount === 0) {
    await prisma.portfolio.createMany({
      data: [
        {
          userId,
          title: "Product Dashboard UI",
          titleEn: "Product Dashboard UI",
          description: "Redesign dashboard untuk SaaS manajemen tugas.",
          descriptionEn: "Dashboard redesign for a task management SaaS product.",
          imageUrl: null,
          projectUrl: "https://example.com/project/admin",
          tags: "dashboard,saas,ui",
          tagsEn: "dashboard,saas,ui",
          seoTitleEn: "Product Dashboard UI",
          seoDescriptionEn: "Dashboard redesign for a task management SaaS product.",
          keywordsEn: "dashboard, saas, ui",
          featured: true
        },
        {
          userId,
          title: "E-commerce Landing Page",
          titleEn: "E-commerce Landing Page",
          description: "Landing page konversi tinggi untuk brand FMCG.",
          descriptionEn: "A high-converting landing page for an FMCG brand.",
          imageUrl: null,
          projectUrl: "https://example.com/project/landing",
          tags: "landing,ecommerce,ui",
          tagsEn: "landing,ecommerce,ui",
          seoTitleEn: "E-commerce Landing Page",
          seoDescriptionEn: "A high-converting landing page for an FMCG brand.",
          keywordsEn: "landing page, ecommerce, ui",
          featured: false
        }
      ],
    });
    console.log("├─ ✓ Portfolios initialized.");
  } else {
    console.log("├─ ⚠ Portfolios already setup, skipping.");
  }

  // ==========================================
  // 10) SEED FRONTEND SETTINGS
  // ==========================================
  await prisma.frontendSetting.upsert({
    where: { key: "default" },
    update: {
      siteTitle: "Frimecraft",
      siteDescription: "Frimecraft digital profile, portfolio showcase, and journal.",
      seoTitle: "Frimecraft",
      seoDescription: "Frimecraft digital profile, portfolio showcase, and journal for product design and frontend execution.",
      seoKeywords: "frimecraft, portfolio, articles, frontend developer, ui ux, product design",
      canonicalUrl: "https://frimecraft.com",
      ogImageUrl: "https://frimecraft.com/assets/img/main/hero.svg",
      ogImageAlt: "Frimecraft hero visual",
      organizationName: "Frimecraft Studio",
      organizationLogoUrl: "https://frimecraft.com/assets/img/main/hero.svg",
      defaultAuthorName: "Faris Friansyah",
      defaultLocale: "id_ID",
      twitterHandle: "@frimecraft",
      socialProfileUrls: "https://www.linkedin.com,https://x.com/frimecraft",
      clarityProjectId: null,
      themeColor: "#2f55d4",
      footerText: "Frimecraft. Build clear products with sharp execution.",
    },
    create: {
      key: "default",
      siteTitle: "Frimecraft",
      siteDescription: "Frimecraft digital profile, portfolio showcase, and journal.",
      seoTitle: "Frimecraft",
      seoDescription: "Frimecraft digital profile, portfolio showcase, and journal for product design and frontend execution.",
      seoKeywords: "frimecraft, portfolio, articles, frontend developer, ui ux, product design",
      canonicalUrl: "https://frimecraft.com",
      ogImageUrl: "https://frimecraft.com/assets/img/main/hero.svg",
      ogImageAlt: "Frimecraft hero visual",
      organizationName: "Frimecraft Studio",
      organizationLogoUrl: "https://frimecraft.com/assets/img/main/hero.svg",
      defaultAuthorName: "Faris Friansyah",
      defaultLocale: "id_ID",
      twitterHandle: "@frimecraft",
      socialProfileUrls: "https://www.linkedin.com,https://x.com/frimecraft",
      clarityProjectId: null,
      themeColor: "#2f55d4",
      footerText: "Frimecraft. Build clear products with sharp execution.",
    },
  });
  console.log("├─ ✓ Frontend SEO settings ensured.");

  console.log("🌱 Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error encountered:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Menutup pool koneksi setelah selesai seeding
  });
