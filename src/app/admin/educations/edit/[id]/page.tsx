// src/app/admin/educations/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import EducationForm from "@/src/components/admin/educations/EducationForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Education • Admin" };

interface EditProps {
  params: Promise<{ id: string }>;
}

export default async function EditEducationPage({ params }: EditProps) {
  // 1. Ambil ID dari Parameter URL
  const { id } = await params;
  const educationId = Number(id);

  if (isNaN(educationId)) notFound();

  // 2. Proteksi Autentikasi
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // ==========================================
  // KUNCI UTAMA: Proteksi Otorisasi Hak Akses (RBAC)
  // ==========================================
  const canUpdate = await hasPermission(session.userId, "experience.manage");
  if (!canUpdate) {
    redirect("/admin/educations?error=unauthorized");
  }

  // 3. Ambil data pendidikan milik user yang sedang login
  const education = await db.education.findFirst({
    where: { 
      id: educationId, 
      userId: session.userId 
    },
  });

  if (!education) notFound();

  return (
    <div className="py-10">
      <EducationForm 
        education={education} 
        mode="edit" 
      />
    </div>
  );
}