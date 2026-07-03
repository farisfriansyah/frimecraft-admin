"use server";

import { db } from "@/src/lib/prisma";
import { guardActionPermission } from "@/src/lib/security/guards";
import { revalidatePath } from "next/cache";

export async function createSkillAction(formData: FormData) {
  const guard = await guardActionPermission("skill.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await db.skill.create({
      data: {
        userId: guard.userId,
        name: formData.get("name") as string,
        nameEn: (formData.get("nameEn") as string) || null,
        slug: (formData.get("slug") as string) || null,
        level: Number(formData.get("level")),
        notes: (formData.get("notes") as string) || null,
        notesEn: (formData.get("notesEn") as string) || null,
        seoTitle: (formData.get("seoTitle") as string) || null,
        seoDescription: (formData.get("seoDescription") as string) || null,
        keywords: (formData.get("keywords") as string) || null,
        tags: (formData.get("tags") as string) || null,
      },
    });
    revalidatePath("/admin/skills");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menyimpan skill" };
  }
}

export async function updateSkillAction(id: number, formData: FormData) {
  const guard = await guardActionPermission("skill.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await db.skill.update({
      where: { id, userId: guard.userId },
      data: {
        name: formData.get("name") as string,
        nameEn: (formData.get("nameEn") as string) || null,
        slug: (formData.get("slug") as string) || null,
        level: Number(formData.get("level")),
        notes: (formData.get("notes") as string) || null,
        notesEn: (formData.get("notesEn") as string) || null,
        seoTitle: (formData.get("seoTitle") as string) || null,
        seoDescription: (formData.get("seoDescription") as string) || null,
        keywords: (formData.get("keywords") as string) || null,
        tags: (formData.get("tags") as string) || null,
      },
    });
    revalidatePath("/admin/skills");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate skill" };
  }
}

export async function deleteSkillAction(id: number) {
  const guard = await guardActionPermission("skill.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  await db.skill.delete({ where: { id, userId: guard.userId } });
  revalidatePath("/admin/skills");
  return { success: true };
}