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
    { name: "portfolio.create", description: "Izin membuat portofolio" },
    { name: "portfolio.update", description: "Izin mengubah portofolio" },
    { name: "portfolio.delete", description: "Izin menghapus portofolio" },
    { name: "experience.manage", description: "Izin mengatur riwayat kerja" },
    { name: "user.manage", description: "Izin manajemen pengguna admin" },
  ];

  console.log("├─ Seeding permissions...");
  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // ==========================================
  // 2) SEED ROLES & ASSIGN PERMISSIONS
  // ==========================================
  console.log("├─ Seeding roles...");

  const allPermission = await prisma.permission.findUnique({
    where: { name: "all" },
  });

  const connectPermission = allPermission ? [{ id: allPermission.id }] : [];

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {
      permissions: {
        set: connectPermission,
      },
    },
    create: {
      name: "ADMIN",
      description: "Administrator utama dengan kendali penuh",
      permissions: {
        connect: connectPermission,
      },
    },
  });

  // ==========================================
  // 3) SEED USER ADMIN (SINKRONISASI DATABASE)
  // ==========================================
  console.log("├─ Checking admin user configuration...");
  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashed,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      email: adminEmail,
      password: hashed,
      name: "Admin FrimeCraft",
      roleId: adminRole.id,
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
          location: "Jakarta, Indonesia",
          startMonth: 1,
          startYear: 2020,
          isCurrent: true,
          endMonth: null,
          endYear: null,
          tags: ["UX", "UI", "Figma"],
          description: "Mendesain produk SaaS, dashboard, dan landing pages untuk klien enterprise."
        },
        {
          userId,
          companyId: startup.id,
          position: "Product Designer",
          location: "Remote",
          startMonth: 5,
          startYear: 2018,
          isCurrent: false,
          endMonth: 12,
          endYear: 2019,
          tags: ["Product", "Design"],
          description: "Membentuk alur pengguna, prototyping, dan desain visual."
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
          degree: "S1 Desain Komunikasi Visual",
          startDate: new Date("2013-08-01"),
          endDate: new Date("2017-06-01"),
          description: "Konsentrasi UI/UX dan multimedia."
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
        { userId, name: "Figma", level: 90 },
        { userId, name: "Wireframing", level: 85 },
        { userId, name: "Prototyping", level: 85 },
        { userId, name: "Framer", level: 75 },
        { userId, name: "HTML/CSS", level: 70 }
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
          issuer: "Design Institute",
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
          description: "Redesign dashboard untuk SaaS manajemen tugas.",
          imageUrl: null,
          projectUrl: "https://example.com/project/admin",
          tags: "dashboard,saas,ui",
          featured: true
        },
        {
          userId,
          title: "E-commerce Landing Page",
          description: "Landing page konversi tinggi untuk brand FMCG.",
          imageUrl: null,
          projectUrl: "https://example.com/project/landing",
          tags: "landing,ecommerce,ui",
          featured: false
        }
      ],
    });
    console.log("├─ ✓ Portfolios initialized.");
  } else {
    console.log("├─ ⚠ Portfolios already setup, skipping.");
  }

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