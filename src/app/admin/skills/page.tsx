// src/app/admin/skills/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { SkillDataTable } from "@/src/app/admin/skills/components/SkillDataTable";
import { Button } from "@/src/app/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Skills • Admin",
  description: "Kelola daftar keahlian teknis",
};

// Memastikan halaman selalu mengambil data terbaru dari database
export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // Pengecekan izin akses (RBAC) secara paralel
  const [canCreate, canUpdate, canDelete] = await Promise.all([
    hasPermission(session.userId, "experience.manage"),
    hasPermission(session.userId, "experience.manage"),
    hasPermission(session.userId, "experience.manage"),
  ]);

  const skills = await db.skill.findMany({
    // where: { userId: session.userId },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Skills</h1>
        <p className="text-muted-foreground mt-2">
          Kelola daftar keahlian teknis Anda
        </p>
      </div>

      {/* Tombol Tambah (Hanya muncul jika diizinkan) */}
      {canCreate && (
        <Button asChild size="lg">
          <Link href="/admin/skills/create">
            <Plus className="mr-2 h-5 w-5" />
            Tambah Skill
          </Link>
        </Button>
      )}

      {/* DataTable */}
      <SkillDataTable 
        data={skills} 
        permissions={{ canUpdate, canDelete }} 
      />
    </div>
  );
}