// src/app/admin/users/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { UserDataTable } from "@/src/components/admin/users/UserDataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Plus } from "lucide-react";
import { hasPermission } from "@/src/lib/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users Management • Admin" };

export default async function UsersPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 1. Ambil data izin akses khusus modul user secara paralel
  const [canCreate, canUpdate, canDelete] = await Promise.all([
    hasPermission(session.userId, "user.create"),
    hasPermission(session.userId, "user.update"),
    hasPermission(session.userId, "user.delete"),
  ]);

  // 2. Tarik live-data users dari PostgreSQL
  const users = await db.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Users Management</h1>
          <p className="text-muted-foreground">Kelola semua akun administrator, status aktif, dan penugasan peran mereka</p>
        </div>
        
        {/* Sisi Kanan: Panel Navigasi */}
        <div className="flex items-center gap-2">
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/roles">
              <Shield className="mr-2 h-5 w-5" />
              Matriks Peran & Izin
            </Link>
          </Button>

          {canCreate && (
            <Button asChild size="lg">
              <Link href="/admin/users/create">
                <Plus className="mr-2 h-5 w-5" />
                Tambah User
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabel Data yang ditingkatkan */}
      <UserDataTable 
        data={users} 
        currentAdminId={session.userId}
        permissions={{ canUpdate, canDelete }} 
      />
    </div>
  );
}