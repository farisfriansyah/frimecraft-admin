// src/actions/portfolio-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { guardActionPermission } from "@/src/lib/security/guards";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs/promises"; 
import path from "path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getLegacyPortfolioUploadDirectory, getPortfolioUploadDirectory } from "@/src/lib/portfolio-storage";
import { convertPortfolioImageToWebp } from "@/src/lib/portfolio-image-conversion";
import { MAX_PORTFOLIO_IMAGE_SIZE } from "@/src/lib/portfolio-image";

const importedPortfolioSchema = z.object({
  title: z.string().trim().min(3, "judul minimal 3 karakter"),
  titleEn: z.string().nullable().optional(),
  slug: z.string().trim().nullable().optional(),
  sortNumber: z.number().int().nullable().optional(),
  description: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  projectUrl: z.union([z.string().url(), z.literal("")]).nullable().optional(),
  workForId: z.number().int().positive().nullable().optional(),
  workAtId: z.number().int().positive().nullable().optional(),
  workFor: z.string().trim().min(1).nullable().optional(),
  workAt: z.string().trim().min(1).nullable().optional(),
  tags: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  tagsEn: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  featured: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
  seoTitle: z.string().nullable().optional(),
  seoTitleEn: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoDescriptionEn: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(),
  keywordsEn: z.string().nullable().optional(),
}).strip();

function normalizeImportedTags(tags: string | string[] | null | undefined) {
  if (Array.isArray(tags)) return tags.map((tag) => tag.trim()).filter(Boolean).join(", ") || null;
  return tags?.trim() || null;
}

export async function importPortfoliosAction(jsonContent: string) {
  const guard = await guardActionPermission("portfolio.create");
  if (!guard.ok) return { success: false as const, error: guard.error };

  if (typeof jsonContent !== "string") {
    return { success: false as const, error: "Konten JSON tidak valid." };
  }

  if (Buffer.byteLength(jsonContent, "utf8") > 5 * 1024 * 1024) {
    return { success: false as const, error: "Ukuran file JSON maksimal 5 MB." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    return { success: false as const, error: "Format JSON tidak valid." };
  }

  const entries = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && "portfolios" in parsed
      ? parsed.portfolios
      : null;

  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      success: false as const,
      error: 'JSON harus berupa array portfolio atau object dengan properti "portfolios" berisi array.',
    };
  }

  if (entries.length > 500) {
    return { success: false as const, error: "Maksimal 500 portfolio dapat diimpor sekaligus." };
  }

  const validation = z.array(importedPortfolioSchema).safeParse(entries);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    const [index, ...fieldPath] = issue.path;
    const itemLabel = typeof index === "number" ? `Data ke-${index + 1}` : "Data portfolio";
    const fieldLabel = fieldPath.length ? ` (${fieldPath.join(".")})` : "";
    return {
      success: false as const,
      error: `${itemLabel}${fieldLabel}: ${issue.message}.`,
    };
  }

  const companyNames = new Set<string>();
  for (const portfolio of validation.data) {
    if (portfolio.workFor) companyNames.add(portfolio.workFor);
    if (portfolio.workAt) companyNames.add(portfolio.workAt);
  }

  const result = await db.$transaction(async (tx) => {
    const companyIds = new Map<string, number>();
    for (const name of companyNames) {
      const company = await tx.company.upsert({
        where: { name },
        create: { name },
        update: {},
        select: { id: true },
      });
      companyIds.set(name, company.id);
    }

    const getCompanyId = (name: string | null | undefined, id: number | null | undefined) => {
      if (!name) return id ?? null;
      const companyId = companyIds.get(name);
      if (companyId === undefined) {
        throw new Error(`Perusahaan "${name}" tidak berhasil dipetakan.`);
      }
      return companyId;
    };

    const portfolios = validation.data.map((portfolio) => ({
      userId: guard.userId,
      title: portfolio.title,
      titleEn: portfolio.titleEn || null,
      slug: portfolio.slug || null,
      sortNumber: portfolio.sortNumber ?? null,
      description: portfolio.description || null,
      descriptionEn: portfolio.descriptionEn || null,
      imageUrl: null,
      projectUrl: portfolio.projectUrl || null,
      workForId: getCompanyId(portfolio.workFor, portfolio.workForId),
      workAtId: getCompanyId(portfolio.workAt, portfolio.workAtId),
      tags: normalizeImportedTags(portfolio.tags),
      tagsEn: normalizeImportedTags(portfolio.tagsEn),
      featured: portfolio.featured ?? false,
      isDisabled: portfolio.isDisabled ?? false,
      seoTitle: portfolio.seoTitle || null,
      seoTitleEn: portfolio.seoTitleEn || null,
      seoDescription: portfolio.seoDescription || null,
      seoDescriptionEn: portfolio.seoDescriptionEn || null,
      keywords: portfolio.keywords || null,
      keywordsEn: portfolio.keywordsEn || null,
    }));

    return tx.portfolio.createMany({ data: portfolios });
  });

  revalidatePath("/admin/portfolios");
  revalidatePath("/portfolios");

  return { success: true as const, count: result.count };
}

function parseOptionalSortNumber(value: FormDataEntryValue | null): number | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return Math.floor(parsed);
}

// === HELPER: Pastikan folder ada ===
async function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") throw error;
  }
}

async function savePortfolioImage(imageFile: File) {
  if (imageFile.size > MAX_PORTFOLIO_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  const image = Buffer.from(await imageFile.arrayBuffer());
  const webpImage = await convertPortfolioImageToWebp(image);
  const filename = `${randomUUID()}.webp`;
  const filepath = path.join(getPortfolioUploadDirectory(), filename);

  await ensureDirectoryExists(filepath);
  await writeFile(filepath, webpImage);

  return `/uploads/portfolio/${filename}`;
}

function getOptionalPortfolioImageFile(formData: FormData) {
  const image = formData.get("image");
  if (image === null) return null;
  if (typeof image === "string") {
    throw new Error("File gambar tidak valid.");
  }
  if (image.size === 0) return null;
  if (image.size > MAX_PORTFOLIO_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 5 MB.");
  }

  return image;
}

// === CREATE PORTFOLIO ===
export async function createPortfolioAction(formData: FormData) {
  const guard = await guardActionPermission("portfolio.create");
  if (!guard.ok) {
    throw new Error("Akses ditolak! Anda tidak memiliki izin untuk membuat portfolio.");
  }

  const imageFile = getOptionalPortfolioImageFile(formData);

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await savePortfolioImage(imageFile);
  }

  const newPortfolio = await db.portfolio.create({
    data: {
      userId: guard.userId, // Tetap simpan siapa yang membuat, tapi jangan jadikan filter akses
      title: formData.get("title") as string,
      titleEn: (formData.get("titleEn") as string) || null,
      slug: (formData.get("slug") as string) || null,
      sortNumber: parseOptionalSortNumber(formData.get("sortNumber")),
      description: (formData.get("description") as string) || null,
      descriptionEn: (formData.get("descriptionEn") as string) || null,
      imageUrl,
      projectUrl: (formData.get("projectUrl") as string) || null,
      workForId: formData.get("workForId") ? Number(formData.get("workForId")) : null,
      workAtId: formData.get("workAtId") ? Number(formData.get("workAtId")) : null,
      tags: (formData.get("tags") as string) || null,
      tagsEn: (formData.get("tagsEn") as string) || null,
      featured: formData.get("featured") === "true",
      isDisabled: formData.get("isDisabled") === "true",
      seoTitle: (formData.get("seoTitle") as string) || null,
      seoTitleEn: (formData.get("seoTitleEn") as string) || null,
      seoDescription: (formData.get("seoDescription") as string) || null,
      seoDescriptionEn: (formData.get("seoDescriptionEn") as string) || null,
      keywords: (formData.get("keywords") as string) || null,
      keywordsEn: (formData.get("keywordsEn") as string) || null,
    },
  });

  revalidatePath("/admin/portfolios");
  revalidatePath("/portfolios");
  return newPortfolio;
}

// === UPDATE PORTFOLIO ===
export async function updatePortfolioAction(id: number, formData: FormData) {
  const guard = await guardActionPermission("portfolio.update");
  if (!guard.ok) {
    throw new Error("Akses ditolak! Anda tidak memiliki izin untuk memperbarui portfolio.");
  }

  const imageFile = getOptionalPortfolioImageFile(formData);
  const removeImage = formData.get("removeImage") === "true";
  const previousPortfolio = imageFile?.size || removeImage
    ? await db.portfolio.findUnique({
        where: { id },
        select: { imageUrl: true },
      })
    : null;

  let imageUrl: string | null | undefined;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await savePortfolioImage(imageFile);
  } else if (removeImage) {
    imageUrl = null;
  }

  const updatedPortfolio = await db.portfolio.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      titleEn: (formData.get("titleEn") as string) || null,
      slug: (formData.get("slug") as string) || null,
      sortNumber: parseOptionalSortNumber(formData.get("sortNumber")),
      description: (formData.get("description") as string) || null,
      descriptionEn: (formData.get("descriptionEn") as string) || null,
      imageUrl: imageUrl ?? undefined,
      projectUrl: (formData.get("projectUrl") as string) || null,
      workForId: formData.get("workForId") ? Number(formData.get("workForId")) : null,
      workAtId: formData.get("workAtId") ? Number(formData.get("workAtId")) : null,
      tags: (formData.get("tags") as string) || null,
      tagsEn: (formData.get("tagsEn") as string) || null,
      featured: formData.get("featured") === "true",
      isDisabled: formData.get("isDisabled") === "true",
      seoTitle: (formData.get("seoTitle") as string) || null,
      seoTitleEn: (formData.get("seoTitleEn") as string) || null,
      seoDescription: (formData.get("seoDescription") as string) || null,
      seoDescriptionEn: (formData.get("seoDescriptionEn") as string) || null,
      keywords: (formData.get("keywords") as string) || null,
      keywordsEn: (formData.get("keywordsEn") as string) || null,
    },
  });

  if (previousPortfolio?.imageUrl && updatedPortfolio.imageUrl !== previousPortfolio.imageUrl) {
    await deletePhysicalFile(previousPortfolio.imageUrl);
  }

  revalidatePath("/admin/portfolios");
  revalidatePath("/portfolios");
  return updatedPortfolio;
}

// === HELPER: Hapus File Gambar Fisik ===
async function deletePhysicalFile(imageUrl: string | null) {
  const uploadPrefix = "/uploads/portfolio/";
  if (!imageUrl || !imageUrl.startsWith(uploadPrefix)) return;

  const filename = imageUrl.slice(uploadPrefix.length);
  if (!filename || path.basename(filename) !== filename) {
    console.error("⚠ Path gambar portfolio tidak valid:", imageUrl);
    return;
  }

  const uploadDirectories = new Set([
    getPortfolioUploadDirectory(),
    getLegacyPortfolioUploadDirectory(),
  ]);
  for (const uploadDirectory of uploadDirectories) {
    const filePath = path.resolve(uploadDirectory, filename);
    if (path.dirname(filePath) !== uploadDirectory) {
      console.error("⚠ Path gambar portfolio tidak valid:", imageUrl);
      continue;
    }

    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error("⚠ Gagal menghapus gambar fisik:", err);
      }
    }
  }
}

// === DELETE PORTFOLIO ACTION ===
export async function deletePortfolioAction(id: string | number) {
  try {
    const guard = await guardActionPermission("portfolio.delete");
    if (!guard.ok) {
      return { success: false, error: "Akses ditolak! Anda tidak memiliki izin menghapus." };
    }

    const portfolioId = Number(id);
    if (isNaN(portfolioId)) {
      return { success: false, error: "ID Portfolio tidak valid." };
    }

    // Ambil data hanya untuk kebutuhan hapus file gambar
    const portfolio = await db.portfolio.findUnique({
      where: { id: portfolioId },
      select: { imageUrl: true } // Tidak perlu lagi cek userId di sini
    });

    if (!portfolio) {
      return { success: false, error: `Portfolio dengan ID ${portfolioId} tidak ditemukan.` };
    }

    if (portfolio.imageUrl) {
      await deletePhysicalFile(portfolio.imageUrl);
    }

    await db.portfolio.delete({
      where: { id: portfolioId },
    });

    revalidatePath("/admin/portfolios");
    revalidatePath("/portfolios");
    
    return { success: true };
    
  } catch (error) {
    console.error(`Gagal menghapus portfolio ID ${id}:`, error);
    return { success: false, error: "Gagal menghapus data dari database." };
  }
}