// src/app/admin/experiences/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { ExperienceDataTable } from "@/src/components/admin/experiences/ExperienceDataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { hasPermission } from "@/src/lib/rbac";

export const metadata = {
  title: "Experiences • Admin",
  description: "Kelola pengalaman kerja",
};

export const dynamic = "force-dynamic";

export default async function ExperiencesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const [canCreate, canUpdate, canDelete] = await Promise.all([
    hasPermission(session.userId, "experience.create"),
    hasPermission(session.userId, "experience.update"),
    hasPermission(session.userId, "experience.delete"),
  ]);

  const experiences = await db.workExperience.findMany({
    // where: { userId: session.userId },
    include: { company: true }, // ✅ valid — relasi ada di schema
    orderBy: [
      { startYear: "desc" },   // ✅ field ada di schema
      { startMonth: "desc" },  // ✅ field ada di schema
    ],
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Work Experiences</h1>
        <p className="text-muted-foreground mt-2">
          Kelola semua pengalaman kerja kamu
        </p>
      </div>

      {canCreate && (
        <Button asChild size="lg">
          <Link href="/admin/experiences/create">
            <Plus className="mr-2 h-5 w-5" />
            Tambah Pengalaman Kerja
          </Link>
        </Button>
      )}

      <ExperienceDataTable
        data={experiences}
        permissions={{ canUpdate, canDelete }}
      />
    </div>
  );
}