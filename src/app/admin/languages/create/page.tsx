// src/app/admin/languages/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/src/lib/rbac";
import LanguageForm from "@/src/components/admin/languages/LanguageForm";

// Jaminan data selalu fresh
export const dynamic = "force-dynamic";

export const metadata = { 
  title: "Tambah Bahasa • Admin" 
};

export default async function CreateLanguagePage() {
  // 1. Proteksi Autentikasi
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. KUNCI HALAMAN: Proteksi Otorisasi Hak Akses (RBAC)
  // Pastikan user punya izin untuk membuat/mengelola data
  const canCreate = await hasPermission(session.userId, "experience.manage");
  if (!canCreate) {
    redirect("/admin/languages?error=unauthorized");
  }

  return (
    <div className="py-10">
      <LanguageForm mode="create" />
    </div>
  );
}