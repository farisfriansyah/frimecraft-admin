// src/app/admin/users/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import UserTable from "@/src/components/admin/users/UserTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = { title: "Users • Admin" };

export default async function UsersPage() {
  // 1. Proteksi Session murni sesuai template portfolio kamu
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. Ambil data users dan roles langsung dari PostgreSQL di sisi Server
  const users = await db.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  const roles = await db.role.findMany({
    orderBy: { id: "asc" },
  });

  return (
    <div className="container space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">Kelola semua akun administrator, status aktif, dan penugasan peran mereka</p>
        </div>
        
        {/* Slot Tombol Kanan: Menuju ke Halaman Pengaturan Matriks Izin */}
        <Button asChild size="lg">
          <Link href="/admin/roles">
            <Shield className="mr-2 h-5 w-5" />
            Matriks Peran & Izin
          </Link>
        </Button>
      </div>

      {/* Komponen Tabel Data Pengguna */}
      <UserTable users={users} roles={roles} />
    </div>
  );
}