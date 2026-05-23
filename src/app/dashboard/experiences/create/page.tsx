// src/app/portfolios/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import PortfolioForm from "@/src/components/admin/experiences/ExperienceForm";

export const metadata = { title: "Tambah Portfolio • Admin" };

export default async function CreateExperiencePage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return <ExperienceForm companies={companies} mode="create" />;
}