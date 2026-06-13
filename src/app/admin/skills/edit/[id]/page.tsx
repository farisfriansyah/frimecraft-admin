// src/app/admin/skills/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import SkillForm from "@/src/app/admin/skills/components/SkillForm";

export const metadata = { title: "Edit Skill • Admin" };

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Validasi ID
  const { id } = await params;
  const skillId = Number(id);
  if (isNaN(skillId)) notFound();

  // 2. Proteksi Autentikasi
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 3. Proteksi Otorisasi (RBAC)
  const canManage = await hasPermission(session.userId, "experience.manage");
  if (!canManage) {
    redirect("/admin/skills?error=unauthorized");
  }

  // 4. Ambil data skill
  const skill = await db.skill.findUnique({ 
    where: { id: skillId } 
  });
  
  if (!skill) notFound();

  return (
    <div className="space-y-10">
      <SkillForm skill={skill} mode="edit" />
    </div>
  );
}