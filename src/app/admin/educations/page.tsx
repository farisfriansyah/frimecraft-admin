// src/app/admin/educations/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { EducationDataTable } from "@/src/app/admin/educations/components/EducationDataTable";
import { Button } from "@/src/app/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { hasPermission } from "@/src/lib/rbac";

export const metadata = {
  title: "Educations • Admin",
  description: "Kelola riwayat pendidikan",
};

export const dynamic = "force-dynamic";

export default async function EducationsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // Memastikan pemeriksaan izin dilakukan secara paralel untuk performa
  const [canCreate, canUpdate, canDelete] = await Promise.all([
    hasPermission(session.userId, "experience.manage"), // Sesuaikan dengan key permission kamu
    hasPermission(session.userId, "experience.manage"),
    hasPermission(session.userId, "experience.manage"),
  ]);

  const educations = await db.education.findMany({
    // where: { userId: session.userId }, // Aktifkan jika ingin filter per user
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Educations</h1>
        <p className="text-muted-foreground mt-2">
          Kelola riwayat pendidikan kamu
        </p>
      </div>

      {canCreate && (
        <Button asChild size="lg">
          <Link href="/admin/educations/create">
            <Plus className="mr-2 h-5 w-5" />
            Tambah Pendidikan
          </Link>
        </Button>
      )}

      <EducationDataTable
        data={educations}
        permissions={{ canUpdate, canDelete }}
      />
    </div>
  );
}