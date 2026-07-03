// src/actions/experience-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { guardActionPermission } from "@/src/lib/security/guards";
import { revalidatePath } from "next/cache";

// === CREATE EXPERIENCE ===
export async function createExperienceAction(formData: FormData) {
  try {
    const guard = await guardActionPermission("experience.create");
    if (!guard.ok) {
      return {
        success: false,
        error: guard.error === "Akses ditolak" ? "Akses ditolak! Anda tidak memiliki izin." : guard.error,
      };
    }

    const isCurrent = formData.get("isCurrent") === "true";

    const data = {
      userId: guard.userId,
      position: formData.get("position") as string,
      positionEn: (formData.get("positionEn") as string) || null,
      slug: (formData.get("slug") as string) || null,
      companyId: formData.get("companyId") ? Number(formData.get("companyId")) : null,
      location: (formData.get("location") as string) || null,
      startMonth: Number(formData.get("startMonth")),
      startYear: Number(formData.get("startYear")),
      // LOGIKA AMAN: Jika kosong/null, kembalikan null, bukan 0
      endMonth: isCurrent || !formData.get("endMonth") ? null : Number(formData.get("endMonth")),
      endYear: isCurrent || !formData.get("endYear") ? null : Number(formData.get("endYear")),
      isCurrent,
      description: (formData.get("description") as string) || null,
      descriptionEn: (formData.get("descriptionEn") as string) || null,
      tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()).filter(Boolean) || [],
      seoTitle: (formData.get("seoTitle") as string) || null,
      seoDescription: (formData.get("seoDescription") as string) || null,
      keywords: (formData.get("keywords") as string) || null,
    };

    await db.workExperience.create({ data });

    revalidatePath("/admin/experiences");
    revalidatePath("/experiences"); // Sesuaikan jika ada route publik
    return { success: true };
  } catch (error) {
    console.error("Gagal membuat experience:", error);
    return { success: false, error: "Gagal menyimpan ke database." };
  }
}

// === UPDATE EXPERIENCE ===
export async function updateExperienceAction(id: number, formData: FormData) {
  try {
    const guard = await guardActionPermission("experience.update");
    if (!guard.ok) {
      return {
        success: false,
        error: guard.error === "Akses ditolak" ? "Akses ditolak! Anda tidak memiliki izin." : guard.error,
      };
    }

    const isCurrent = formData.get("isCurrent") === "true";

    await db.workExperience.update({
      where: { id },
      data: {
        position: formData.get("position") as string,
        positionEn: (formData.get("positionEn") as string) || null,
        slug: (formData.get("slug") as string) || null,
        companyId: formData.get("companyId") ? Number(formData.get("companyId")) : null,
        location: (formData.get("location") as string) || null,
        startMonth: Number(formData.get("startMonth")),
        startYear: Number(formData.get("startYear")),
        endMonth: isCurrent ? null : Number(formData.get("endMonth")),
        endYear: isCurrent ? null : Number(formData.get("endYear")),
        isCurrent,
        description: (formData.get("description") as string) || null,
        descriptionEn: (formData.get("descriptionEn") as string) || null,
        tags: (formData.get("tags") as string)?.split(",").map(t => t.trim()).filter(Boolean) || [],
        seoTitle: (formData.get("seoTitle") as string) || null,
        seoDescription: (formData.get("seoDescription") as string) || null,
        keywords: (formData.get("keywords") as string) || null,
      },
    });

    revalidatePath("/admin/experiences");
    revalidatePath("/experiences");
    return { success: true };
  } catch (error) {
    console.error("Gagal update experience:", error);
    return { success: false, error: "Gagal memperbarui data." };
  }
}

// === DELETE EXPERIENCE ===
export async function deleteExperienceAction(id: number | string) {
  try {
    const guard = await guardActionPermission("experience.delete");
    if (!guard.ok) {
      return {
        success: false,
        error: guard.error === "Akses ditolak" ? "Akses ditolak!" : guard.error,
      };
    }

    const experienceId = Number(id);
    if (isNaN(experienceId)) return { success: false, error: "ID tidak valid" };

    await db.workExperience.delete({
      where: { id: experienceId },
    });

    revalidatePath("/admin/experiences");
    revalidatePath("/experiences");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus experience:", error);
    return { success: false, error: "Gagal menghapus data." };
  }
}