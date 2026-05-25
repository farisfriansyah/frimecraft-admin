"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createSkillAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const canManage = await hasPermission(session.userId, "experience.manage");
  if (!canManage) return { success: false, error: "Akses ditolak" };

  try {
    await db.skill.create({
      data: {
        userId: session.userId,
        name: formData.get("name") as string,
        level: Number(formData.get("level")),
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/skills");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menyimpan skill" };
  }
}

export async function updateSkillAction(id: number, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  try {
    await db.skill.update({
      where: { id, userId: session.userId },
      data: {
        name: formData.get("name") as string,
        level: Number(formData.get("level")),
        notes: (formData.get("notes") as string) || null,
      },
    });
    revalidatePath("/admin/skills");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate skill" };
  }
}

export async function deleteSkillAction(id: number) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  await db.skill.delete({ where: { id, userId: session.userId } });
  revalidatePath("/admin/skills");
  return { success: true };
}