// src/actions/experience-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
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

// === CREATE Experience ===
export async function createExperienceAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "experience", filename);

    // INI YANG PENTING: AUTO BUAT FOLDER KALAU BELUM ADA!
    await ensureDirectoryExists(filepath);

    await writeFile(filepath, buffer);
    imageUrl = `/uploads/experience/${filename}`;
  }

  const newExperience = await db.workExperience.create({
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

  revalidatePath("/experiences");
  return newExperience;
}

// === UPDATE PORTFOLIO ===
export async function updateExperienceAction(id: number, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const imageFile = formData.get("image") as File | null;

  let imageUrl: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "experience", filename);

    // AUTO CREATE FOLDER
    await ensureDirectoryExists(filepath);

    await writeFile(filepath, buffer);
    imageUrl = `/uploads/experience/${filename}`;
  }

  const updatedExperience = await db.workExperience.update({
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

  revalidatePath("/experiences");
  return updatedExperience;
}

// TAMBAHKAN INI — DELETE PORTFOLIO ACTION!
export async function deleteExperienceAction(id: number) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  await db.workExperience.delete({
    where: { 
      id,
      userId: session.userId 
    },
  });

  revalidatePath("/admin/experiences");
}