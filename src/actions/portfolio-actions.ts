// src/actions/portfolio-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";

// === CREATE PORTFOLIO ===
export async function createPortfolioAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Buat nama file unik
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "portfolio", filename);

    // Pastikan folder ada
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

// === DELETE PORTFOLIO (opsional, untuk nanti) ===
export async function deletePortfolioAction(id: number) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  await db.portfolio.delete({
    where: { id },
  });

  revalidatePath("/portfolios");
}