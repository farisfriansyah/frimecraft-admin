// src/app/dashboard/portfolios/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import PortfolioForm from "@/src/components/admin/experience/ExperienceForm";
import { notFound } from "next/navigation";

// TAMBAHKAN INI: await params!
export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>; // ← INI YANG PENTING!
}) {
  // UNWRAP params dengan await
  const { id } = await params;

  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // Pastikan id adalah angka valid
  const experienceId = Number(id);
  if (isNaN(experienceId)) notFound();

  const experience = await db.work_experiences.findFirst({
    where: {
      id: experienceId,
      userId: session.userId,
    },
  });

  if (!experience) notFound();

  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <ExperienceForm
      experience={experience}
      companies={companies}
      mode="edit"
    />
  );
}

export const metadata = { title: "Edit Pengalaman Kerja • Admin" };