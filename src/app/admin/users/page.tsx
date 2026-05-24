// src/app/admin/users/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import UserTable from "@/src/components/admin/users/UserTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Plus } from "lucide-react"; // <-- Menambahkan ikon Plus untuk tombol halaman baru
import { hasPermission } from "@/src/lib/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users Management • Admin" };

export default async function UsersPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 1. Ambil data izin akses khusus modul user secara paralel
  const canCreate = await hasPermission(session.userId, "user.create");
  const canUpdate = await hasPermission(session.userId, "user.update");
  const canDelete = await hasPermission(session.userId, "user.delete");

  // 2. Tarik live-data users dari PostgreSQL (Query roles dihapus karena sudah di-handle di page edit)
  const users = await db.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Users Management</h1>
          <p className="text-muted-foreground">Kelola semua akun administrator, status aktif, dan penugasan peran mereka</p>
        </div>
        
        {/* Sisi Kanan: Panel Navigasi Berbasis Halaman Terpisah */}
        <div className="flex items-center gap-2">
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/roles">
              <Shield className="mr-2 h-5 w-5" />
              Matriks Peran & Izin
            </Link>
          </Button>

          {/* IMPLEMENTASI PAGE-BASED ROUTING: Tombol tambah user diletakkan di header layout */}
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

      {/* Oper data ke komponen tabel sesuai dengan interface prop yang baru */}
      <UserTable 
        users={users} 
        currentAdminId={session.userId}
        permissions={{ canUpdate, canDelete }} 
      />
    </div>
  );
}