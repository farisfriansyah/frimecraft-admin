// src/app/admin/languages/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import LanguageForm from "@/src/app/admin/languages/components/LanguageForm";

// Jaminan data selalu fresh (anti-cache) untuk halaman admin
export const dynamic = "force-dynamic"; 
export const metadata = { title: "Edit Language • Admin" };

interface EditProps {
  params: Promise<{ id: string }>;
}

export default async function EditLanguagePage({ params }: EditProps) {
  // 1. Ambil ID dari Parameter URL
  const { id } = await params;
  const languageId = Number(id);

  // 2. Proteksi Autentikasi Sesi Login
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 3. Pastikan ID adalah angka valid
  if (isNaN(languageId)) notFound();

  // ==========================================
  // KUNCI UTAMA: Proteksi Otorisasi Hak Akses (RBAC)
  // ==========================================
  const canUpdate = await hasPermission(session.userId, "experience.manage");
  if (!canUpdate) {
    redirect("/admin/languages?error=unauthorized");
  }

  // 4. Ambil data language milik user yang sedang login (keamanan berlapis)
  const language = await db.language.findFirst({
    where: { 
      id: languageId, 
      userId: session.userId, 
    },
  });

  if (!language) notFound();

  return (
    <div className="py-10">
      <LanguageForm 
        language={language} 
        mode="edit" 
      />
    </div>
  );
}