import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@frimecraft.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "rahasia123";

  // 1) create admin user if not exists
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: "Admin FrimeCraft",
        role: "ADMIN",
      },
    });
    console.log("✓ Admin user created:", adminEmail);
  } else {
    console.log("✓ Admin already exists:", adminEmail);
  }

  const userId = admin.id;

  // 2) Work experiences (sample)
  const weCount = await prisma.workExperience.count({ where: { userId } });
  if (weCount === 0) {
    await prisma.workExperience.createMany({
      data: [
        {
          userId,
          company: "Frime Craft Studio",
          role: "Lead UX/UI Designer",
          location: "Jakarta, Indonesia",
          startDate: new Date("2020-01-01"),
          endDate: null,
          description: "Mendesain produk SaaS, dashboard, dan landing pages untuk klien enterprise."
        },
        {
          userId,
          company: "StartupX",
          role: "Product Designer",
          location: "Remote",
          startDate: new Date("2018-05-01"),
          endDate: new Date("2019-12-31"),
          description: "Membentuk alur pengguna, prototyping, dan desain visual."
        }
      ],
    });
    console.log("✓ Work experiences seeded.");
  } else {
    console.log("✓ Work experiences already present, skip.");
  }

  // 3) Educations (sample)
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
    console.log("✓ Educations seeded.");
  } else {
    console.log("✓ Educations already present, skip.");
  }

  // 4) Skills
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
    console.log("✓ Skills seeded.");
  } else {
    console.log("✓ Skills already present, skip.");
  }

  // 5) Languages
  const langCount = await prisma.language.count({ where: { userId } });
  if (langCount === 0) {
    await prisma.language.createMany({
      data: [
        { userId, name: "Indonesian", proficiency: "Native" },
        { userId, name: "English", proficiency: "Fluent" }
      ],
    });
    console.log("✓ Languages seeded.");
  } else {
    console.log("✓ Languages already present, skip.");
  }

  // 6) Certifications
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
    console.log("✓ Certifications seeded.");
  } else {
    console.log("✓ Certifications already present, skip.");
  }

  // 7) Portfolios (with image paths)
  const portCount = await prisma.portfolio.count({ where: { userId } });
  if (portCount === 0) {
    await prisma.portfolio.createMany({
      data: [
        {
          userId,
          title: "Product Dashboard UI",
          description: "Redesign dashboard untuk SaaS manajemen tugas.",
          imageUrl: "/mnt/data/1440w default.jpg", // <-- path of uploaded image
          projectUrl: "https://example.com/project/dashboard",
          tags: "dashboard,saas,ui",
          featured: true
        },
        {
          userId,
          title: "E-commerce Landing Page",
          description: "Landing page konversi tinggi untuk brand FMCG.",
          imageUrl: "/mnt/data/1440w default.jpg", // reuse uploaded image as placeholder
          projectUrl: "https://example.com/project/landing",
          tags: "landing,ecommerce,ui",
          featured: false
        }
      ],
    });
    console.log("✓ Portfolios seeded (with image paths).");
  } else {
    console.log("✓ Portfolios already present, skip.");
  }

  console.log("🌱 Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
