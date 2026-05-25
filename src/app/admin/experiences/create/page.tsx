import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import ExperienceForm  from "@/src/components/admin/experiences/ExperienceForm";

export const metadata = { title: "Tambah Experience • Admin" };

export default async function CreateExperiencePage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <ExperienceForm companies={companies} mode="create" />
    </div>
  );
}