// src/app/admin/certifications/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import CertificationForm from "@/src/app/admin/certifications/components/CertificationForm";

// Pastikan halaman selalu mengambil data terbaru dari database
export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Sertifikasi • Admin" };

interface EditProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificationPage({ params }: EditProps) {
  // 1. Ambil dan konversi ID dari string ke number
  const { id } = await params;
  const certificationId = Number(id);

  // Jika ID bukan angka yang valid, tampilkan 404
  if (isNaN(certificationId)) notFound();

  // 2. Proteksi Autentikasi
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 3. Proteksi Otorisasi (RBAC)
  const canUpdate = await hasPermission(session.userId, "experience.manage");
  if (!canUpdate) {
    redirect("/admin/certifications?error=unauthorized");
  }

  // 4. Ambil data sertifikasi menggunakan ID yang sudah berbentuk number
  const cert = await db.certification.findUnique({
    where: { id: certificationId },
  });

  // Jika data tidak ditemukan, tampilkan 404
  if (!cert) notFound();

  return (
    <div className="container py-10 max-w-7xl">
      <CertificationForm 
        certification={cert} 
        mode="edit" 
      />
    </div>
  );
}