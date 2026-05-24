// src/actions/portfolio-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs/promises"; 
import path from "path";

// === HELPER: Pastikan folder ada ===
async function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") throw error;
  }
}

// === CREATE PORTFOLIO ===
export async function createPortfolioAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  // PROTEKSI MUTLAK SERVER: Validasi hak akses 'portfolio.create'
  const canCreate = await hasPermission(session.userId, "portfolio.create");
  if (!canCreate) {
    throw new Error("Akses ditolak! Anda tidak memiliki izin untuk membuat portfolio.");
  }

  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "portfolio", filename);

    await ensureDirectoryExists(filepath);
    await writeFile(filepath, buffer);
    imageUrl = `/uploads/portfolio/${filename}`;
  }

  const newPortfolio = await db.portfolio.create({
    data: {
      userId: session.userId, // Tetap simpan siapa yang membuat, tapi jangan jadikan filter akses
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      imageUrl,
      projectUrl: (formData.get("projectUrl") as string) || null,
      workForId: formData.get("workForId") ? Number(formData.get("workForId")) : null,
      workAtId: formData.get("workAtId") ? Number(formData.get("workAtId")) : null,
      tags: (formData.get("tags") as string) || null,
      featured: formData.get("featured") === "true",
      isDisabled: formData.get("isDisabled") === "true",
    },
  });

  revalidatePath("/admin/portfolios");
  revalidatePath("/portfolios");
  return newPortfolio;
}

// === UPDATE PORTFOLIO ===
export async function updatePortfolioAction(id: number, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  // PROTEKSI MUTLAK SERVER: Validasi hak akses 'portfolio.update'
  const canUpdate = await hasPermission(session.userId, "portfolio.update");
  if (!canUpdate) {
    throw new Error("Akses ditolak! Anda tidak memiliki izin untuk memperbarui portfolio.");
  }

  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "portfolio", filename);

    await ensureDirectoryExists(filepath);
    await writeFile(filepath, buffer);
    imageUrl = `/uploads/portfolio/${filename}`;
  }

  const updatedPortfolio = await db.portfolio.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      imageUrl: imageUrl ?? undefined,
      projectUrl: (formData.get("projectUrl") as string) || null,
      workForId: formData.get("workForId") ? Number(formData.get("workForId")) : null,
      workAtId: formData.get("workAtId") ? Number(formData.get("workAtId")) : null,
      tags: (formData.get("tags") as string) || null,
      featured: formData.get("featured") === "true",
      isDisabled: formData.get("isDisabled") === "true",
    },
  });

  revalidatePath("/admin/portfolios");
  revalidatePath("/portfolios");
  return updatedPortfolio;
}

// === HELPER: Hapus File Gambar Fisik ===
async function deletePhysicalFile(imageUrl: string | null) {
  if (!imageUrl) return;
  try {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    await fs.access(filePath).catch(() => null); 
    await fs.unlink(filePath);
  } catch (err) {
    console.error("⚠ Gagal menghapus gambar fisik:", err);
  }
}

// === DELETE PORTFOLIO ACTION ===
export async function deletePortfolioAction(id: string | number) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized" };
    }

    // PROTEKSI MUTLAK SERVER: Validasi hak akses 'portfolio.delete'
    const canDelete = await hasPermission(session.userId, "portfolio.delete");
    if (!canDelete) {
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