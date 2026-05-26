// src/app/admin/skills/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/src/lib/rbac";
import SkillForm from "@/src/components/admin/skills/SkillForm";

export const metadata = { title: "Tambah Skill • Admin" };

export default async function CreateSkillPage() {
  // 1. Proteksi Autentikasi
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. Proteksi Otorisasi
  // Pastikan permission key sesuai dengan yang ada di sistem RBAC kamu
  const canManage = await hasPermission(session.userId, "experience.manage");
  if (!canManage) {
    redirect("/admin/skills?error=unauthorized");
  }

  return (
    <div className="space-y-10">
      <SkillForm mode="create" />
    </div>
  );
}