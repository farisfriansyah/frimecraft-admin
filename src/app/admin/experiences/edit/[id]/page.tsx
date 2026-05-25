// src/app/admin/experiences/[id]/edit/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import ExperienceForm from "@/src/components/admin/experiences/ExperienceForm";

export const metadata = { title: "Edit Experience • Admin" };

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experienceId = Number(id);

  if (isNaN(experienceId)) notFound();

  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const experience = await db.workExperience.findFirst({
    where: { id: experienceId, userId: session.userId },
    include: { company: true },
  });

  if (!experience) notFound();

  const companies = await db.company.findMany({ orderBy: { name: "asc" } });

  return (
    <ExperienceForm
      experience={experience} // Sekarang tipenya sudah otomatis cocok!
      companies={companies}
      mode="edit"
    />
  );
}