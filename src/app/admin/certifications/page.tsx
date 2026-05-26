// src/app/admin/certifications/page.tsx
import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/src/lib/rbac";
import { CertificationDataTable } from "@/src/components/admin/certifications/CertificationDataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Sertifikasi • Admin",
  description: "Kelola daftar sertifikasi profesional",
};

export const dynamic = "force-dynamic";

export default async function CertificationsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // Pengecekan izin akses (RBAC) secara paralel
  const [canCreate, canUpdate, canDelete] = await Promise.all([
    hasPermission(session.userId, "experience.manage"),
    hasPermission(session.userId, "experience.manage"),
    hasPermission(session.userId, "experience.manage"),
  ]);

  const data = await db.certification.findMany({
    // where: { userId: session.userId },
    orderBy: { issueDate: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Sertifikasi</h1>
        <p className="text-muted-foreground mt-2">
          Kelola daftar sertifikasi profesional Anda
        </p>
      </div>

      {/* Tombol Tambah (Conditional Rendering) */}
      {canCreate && (
        <Button asChild size="lg">
          <Link href="/admin/certifications/create">
            <Plus className="mr-2 h-5 w-5" />
            Tambah Sertifikat
          </Link>
        </Button>
      )}

      {/* Data Table */}
      <CertificationDataTable 
        data={data} 
        permissions={{ canUpdate, canDelete }} 
      />
    </div>
  );
}