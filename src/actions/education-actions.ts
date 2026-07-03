"use server";

import { db } from "@/src/lib/prisma";
import { guardActionPermission } from "@/src/lib/security/guards";
import { revalidatePath } from "next/cache";

export async function createEducationAction(formData: FormData) {
  const guard = await guardActionPermission("education.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");

    await db.education.create({
      data: {
        userId: guard.userId,
        institution: formData.get("institution") as string,
        institutionEn: (formData.get("institutionEn") as string) || null,
        degree: (formData.get("degree") as string) || null,
        degreeEn: (formData.get("degreeEn") as string) || null,
        description: (formData.get("description") as string) || null,
        descriptionEn: (formData.get("descriptionEn") as string) || null,
        slug: (formData.get("slug") as string) || null,
        seoTitle: (formData.get("seoTitle") as string) || null,
        seoDescription: (formData.get("seoDescription") as string) || null,
        keywords: (formData.get("keywords") as string) || null,
        tags: (formData.get("tags") as string) || null,
        startDate: startDate ? new Date(startDate as string) : null,
        endDate: endDate ? new Date(endDate as string) : null,
      },
    });
    revalidatePath("/admin/educations");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan data pendidikan" };
  }
}

export async function updateEducationAction(id: number, formData: FormData) {
  const guard = await guardActionPermission("education.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");

    await db.education.update({
      where: { id, userId: guard.userId },
      data: {
        institution: formData.get("institution") as string,
        institutionEn: (formData.get("institutionEn") as string) || null,
        degree: (formData.get("degree") as string) || null,
        degreeEn: (formData.get("degreeEn") as string) || null,
        description: (formData.get("description") as string) || null,
        descriptionEn: (formData.get("descriptionEn") as string) || null,
        slug: (formData.get("slug") as string) || null,
        seoTitle: (formData.get("seoTitle") as string) || null,
        seoDescription: (formData.get("seoDescription") as string) || null,
        keywords: (formData.get("keywords") as string) || null,
        tags: (formData.get("tags") as string) || null,
        startDate: startDate ? new Date(startDate as string) : null,
        endDate: endDate ? new Date(endDate as string) : null,
      },
    });
    revalidatePath("/admin/educations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate data pendidikan" };
  }
}

// === DELETE EDUCATION ===
export async function deleteEducationAction(id: number) {
  const guard = await guardActionPermission("education.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    // Keamanan Berlapis: Filter dengan userId agar user tidak bisa 
    // menghapus data pendidikan orang lain hanya dengan menebak ID
    await db.education.delete({
      where: {
        id,
        userId: guard.userId,
      },
    });

    revalidatePath("/admin/educations");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus pendidikan:", error);
    return { success: false, error: "Gagal menghapus data pendidikan" };
  }
}