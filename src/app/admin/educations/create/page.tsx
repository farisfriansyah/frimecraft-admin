// src/app/admin/educations/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/src/lib/rbac";
import EducationForm from "@/src/app/admin/educations/components/EducationForm";

export const dynamic = "force-dynamic"; // Jaminan anti-cache server
export const metadata = { 
  title: "Tambah Pendidikan • Admin" 
};

export default async function CreateEducationPage() {
  // 1. Cek Sesi
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. KUNCI HALAMAN: Cek izin 'experience.manage' (sesuaikan dengan key permission kamu)
  const canCreate = await hasPermission(session.userId, "experience.manage");
  if (!canCreate) {
    redirect("/admin/educations?error=unauthorized");
  }

  // 3. Render Form
  return (
    <div className="py-10">
      <EducationForm mode="create" />
    </div>
  );
}