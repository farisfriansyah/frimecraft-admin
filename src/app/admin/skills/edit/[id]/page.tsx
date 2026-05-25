import { db } from "@/src/lib/prisma";
import { notFound } from "next/navigation";
import SkillForm from "@/src/components/admin/skills/SkillForm";

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const skill = await db.skill.findUnique({ where: { id: Number(id) } });
  if (!skill) notFound();
  return <div className="py-10"><SkillForm skill={skill} mode="edit" /></div>;
}