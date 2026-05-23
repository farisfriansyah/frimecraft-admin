// src/actions/portfolio-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
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

  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "portfolio", filename);

    // INI YANG PENTING: AUTO BUAT FOLDER KALAU BELUM ADA!
    await ensureDirectoryExists(filepath);

    await writeFile(filepath, buffer);
    imageUrl = `/uploads/portfolio/${filename}`;
  }

  const newPortfolio = await db.portfolio.create({
    data: {
      userId: session.userId,
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

  revalidatePath("/portfolios");
  return newPortfolio;
}

// === UPDATE PORTFOLIO ===
export async function updatePortfolioAction(id: number, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "portfolio", filename);

    // AUTO CREATE FOLDER
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

  revalidatePath("/portfolios");
  return updatedPortfolio;
}

// === HELPER: Hapus File Gambar Fisik (Gunakan fungsi pembantu agar bersih) ===
async function deletePhysicalFile(imageUrl: string | null) {
  if (!imageUrl) return;
  try {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    // Cek ketersediaan file sebelum dihapus agar tidak terjadi crash/error
    await fs.access(filePath).catch(() => null); 
    await fs.unlink(filePath);
    console.log(`✓ Berhasil menghapus file gambar fisik: ${filePath}`);
  } catch (err) {
    console.error("⚠ Gagal menghapus gambar fisik (file kemungkinan tidak ada):", err);
  }
}

// === DELETE PORTFOLIO ACTION (Mendukung Single Row & Bulk Delete) ===
export async function deletePortfolioAction(id: string | number) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Pastikan ID dikonversi menjadi tipe data Number agar sesuai dengan skema database
    const portfolioId = Number(id);
    if (isNaN(portfolioId)) {
      return { success: false, error: "ID Portfolio tidak valid." };
    }

    // 1. Ambil data untuk mengecek hak milik user dan mengambil URL gambar
    const portfolio = await db.portfolio.findUnique({
      where: { id: portfolioId },
      select: { imageUrl: true, userId: true }
    });

    if (!portfolio) {
      return { success: false, error: `Portfolio dengan ID ${portfolioId} tidak ditemukan.` };
    }

    // Keamanan: Validasi kepemilikan data sebelum mengizinkan penghapusan
    if (portfolio.userId !== session.userId) {
      return { success: false, error: "Akses ditolak. Anda bukan pemilik portfolio ini." };
    }

    // 2. Hapus file gambar fisik dari folder public/uploads/portfolio
    if (portfolio.imageUrl) {
      await deletePhysicalFile(portfolio.imageUrl);
    }

    // 3. Hapus baris data dari database secara permanen menggunakan id unik
    await db.portfolio.delete({
      where: { id: portfolioId },
    });

    // Revalidasi halaman agar data terbaru langsung tampil tanpa reload manual
    revalidatePath("/dashboard/portfolios");
    revalidatePath("/portfolios");
    
    return { success: true };
    
  } catch (error) {
    console.error(`Gagal menghapus portfolio ID ${id}:`, error);
    return { success: false, error: "Gagal menghapus data dari database." };
  }
}