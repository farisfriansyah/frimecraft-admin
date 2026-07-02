"use server";

import { db } from "@/src/lib/prisma";
import { guardActionPermission } from "@/src/lib/security/guards";
import { revalidatePath } from "next/cache";

export async function createCertificationAction(formData: FormData) {
  const guard = await guardActionPermission("certification.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const title = formData.get("title") as string;
    const issuer = formData.get("issuer") as string;
    const issueDate = new Date(formData.get("issueDate") as string);
    const url = formData.get("url") as string;

    await db.certification.create({
      data: { 
        userId: guard.userId,
        title, 
        issuer, 
        issueDate, 
        url 
      },
    });

    revalidatePath("/admin/certifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal membuat sertifikasi" };
  }
}

export async function updateCertificationAction(id: string, formData: FormData) {
  // PERBAIKAN: Konversi string ID ke number
  const certificationId = Number(id);
  if (isNaN(certificationId)) return { success: false, error: "ID tidak valid" };

  const guard = await guardActionPermission("certification.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    const title = formData.get("title") as string;
    const issuer = formData.get("issuer") as string;
    const issueDate = new Date(formData.get("issueDate") as string);
    const url = formData.get("url") as string;

    await db.certification.update({
      where: { 
        id: certificationId, // Gunakan variabel number
        userId: guard.userId 
      },
      data: { title, issuer, issueDate, url },
    });

    revalidatePath("/admin/certifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mengupdate sertifikasi" };
  }
}

export async function deleteCertificationAction(id: string) {
  // PERBAIKAN: Konversi string ID ke number
  const certificationId = Number(id);
  if (isNaN(certificationId)) return { success: false, error: "ID tidak valid" };

  const guard = await guardActionPermission("certification.manage");
  if (!guard.ok) return { success: false, error: guard.error };

  try {
    await db.certification.delete({ 
      where: { 
        id: certificationId, // Gunakan variabel number
        userId: guard.userId 
      } 
    });

    revalidatePath("/admin/certifications");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus sertifikasi" };
  }
}