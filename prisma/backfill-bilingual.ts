import "dotenv/config";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { PrismaClient } = pkg;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting bilingual backfill...");

  const articles = await prisma.article.findMany();
  for (const article of articles) {
    await prisma.article.update({
      where: { id: article.id },
      data: {
        titleEn: article.titleEn ?? article.title,
        excerptEn: article.excerptEn ?? article.excerpt,
        contentEn: article.contentEn ?? article.content,
        seoTitleEn: article.seoTitleEn ?? article.seoTitle ?? article.title,
        seoDescriptionEn: article.seoDescriptionEn ?? article.seoDescription ?? article.excerpt,
        keywordsEn: article.keywordsEn ?? article.keywords,
        tagsEn: article.tagsEn ?? article.tags,
      },
    });
  }

  const portfolios = await prisma.portfolio.findMany();
  for (const portfolio of portfolios) {
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        titleEn: portfolio.titleEn ?? portfolio.title,
        descriptionEn: portfolio.descriptionEn ?? portfolio.description,
        seoTitleEn: portfolio.seoTitleEn ?? portfolio.seoTitle ?? portfolio.title,
        seoDescriptionEn: portfolio.seoDescriptionEn ?? portfolio.seoDescription ?? portfolio.description,
        keywordsEn: portfolio.keywordsEn ?? portfolio.keywords,
        tagsEn: portfolio.tagsEn ?? portfolio.tags,
      },
    });
  }

  const experiences = await prisma.workExperience.findMany();
  for (const experience of experiences) {
    await prisma.workExperience.update({
      where: { id: experience.id },
      data: {
        positionEn: experience.positionEn ?? experience.position,
        descriptionEn: experience.descriptionEn ?? experience.description,
      },
    });
  }

  const educations = await prisma.education.findMany();
  for (const education of educations) {
    await prisma.education.update({
      where: { id: education.id },
      data: {
        institutionEn: education.institutionEn ?? education.institution,
        degreeEn: education.degreeEn ?? education.degree,
        descriptionEn: education.descriptionEn ?? education.description,
      },
    });
  }

  const skills = await prisma.skill.findMany();
  for (const skill of skills) {
    await prisma.skill.update({
      where: { id: skill.id },
      data: {
        nameEn: skill.nameEn ?? skill.name,
        notesEn: skill.notesEn ?? skill.notes,
      },
    });
  }

  const certifications = await prisma.certification.findMany();
  for (const certification of certifications) {
    await prisma.certification.update({
      where: { id: certification.id },
      data: {
        titleEn: certification.titleEn ?? certification.title,
        issuerEn: certification.issuerEn ?? certification.issuer,
      },
    });
  }

  console.log("Bilingual backfill completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
