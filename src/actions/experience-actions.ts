// src/actions/experience-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import { revalidatePath } from "next/cache";

// === CREATE EXPERIENCE ===
export async function createExperienceAction(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    // Proteksi RBAC
    const canCreate = await hasPermission(session.userId, "experience.create");
    if (!canCreate) return { success: false, error: "Akses ditolak! Anda tidak memiliki izin." };

    const isCurrent = formData.get("isCurrent") === "true";

    const data = {
      userId: session.userId,
      position: formData.get("position") as string,
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
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    // Proteksi RBAC
    const canUpdate = await hasPermission(session.userId, "experience.update");
    if (!canUpdate) return { success: false, error: "Akses ditolak! Anda tidak memiliki izin." };

    const isCurrent = formData.get("isCurrent") === "true";

    await db.workExperience.update({
      where: { id },
      data: {
        position: formData.get("position") as string,
        slug: (formData.get("slug") as string) || null,
        companyId: formData.get("companyId") ? Number(formData.get("companyId")) : null,
        location: (formData.get("location") as string) || null,
        startMonth: Number(formData.get("startMonth")),
        startYear: Number(formData.get("startYear")),
        endMonth: isCurrent ? null : Number(formData.get("endMonth")),
        endYear: isCurrent ? null : Number(formData.get("endYear")),
        isCurrent,
        description: (formData.get("description") as string) || null,
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
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    // Proteksi RBAC
    const canDelete = await hasPermission(session.userId, "experience.delete");
    if (!canDelete) return { success: false, error: "Akses ditolak!" };

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