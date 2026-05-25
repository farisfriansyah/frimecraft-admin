"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createLanguageAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  const canManage = await hasPermission(session.userId, "experience.manage");
  if (!canManage) return { success: false, error: "Akses ditolak" };

  try {
    await db.language.create({
      data: {
        userId: session.userId,
        name: formData.get("name") as string,
        proficiency: (formData.get("proficiency") as string) || null,
      },
    });
    revalidatePath("/admin/languages");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menyimpan bahasa" };
  }
}

export async function updateLanguageAction(id: number, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  try {
    await db.language.update({
      where: { id, userId: session.userId },
      data: {
        name: formData.get("name") as string,
        proficiency: (formData.get("proficiency") as string) || null,
      },
    });
    revalidatePath("/admin/languages");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate bahasa" };
  }
}

export async function deleteLanguageAction(id: number) {
  const session = await getSession();
  if (!session?.userId) return { success: false, error: "Unauthorized" };

  try {
    await db.language.delete({ where: { id, userId: session.userId } });
    revalidatePath("/admin/languages");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus bahasa" };
  }
}