"use server";

import { db } from "@/src/lib/prisma";
import { guardActionPermission } from "@/src/lib/security/guards";
import { revalidatePath } from "next/cache";

export async function createLanguageAction(formData: FormData) {
  const guard = await guardActionPermission("language.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await db.language.create({
      data: {
        userId: guard.userId,
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
  const guard = await guardActionPermission("language.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await db.language.update({
      where: { id, userId: guard.userId },
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
  const guard = await guardActionPermission("language.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await db.language.delete({ where: { id, userId: guard.userId } });
    revalidatePath("/admin/languages");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus bahasa" };
  }
}