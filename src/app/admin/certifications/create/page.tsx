// src/app/admin/certifications/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/src/lib/rbac";
import CertificationForm from "@/src/app/admin/certifications/components/CertificationForm";

// Jaminan data selalu fresh dan tidak ter-cache saat build
export const dynamic = "force-dynamic";

export const metadata = { 
  title: "Tambah Sertifikasi • Admin" 
};

export default async function CreateCertificationPage() {
  // 1. Proteksi Autentikasi
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. KUNCI HALAMAN: Proteksi Otorisasi (RBAC)
  // Pastikan user memiliki izin untuk mengelola data
  const canCreate = await hasPermission(session.userId, "experience.manage");
  if (!canCreate) {
    redirect("/admin/certifications?error=unauthorized");
  }

  return (
    <div className="container py-10 max-w-7xl">
      <CertificationForm mode="create" />
    </div>
  );
}