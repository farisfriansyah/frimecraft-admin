// src/app/admin/roles/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import RolePermissionsGrid from "@/src/components/admin/roles/RolePermissionsGrid"; // PERBAIKAN: Impor lurus ke folder components yang valid
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";

export const metadata = { title: "Roles • Admin" };

export default async function RolesManagementPage() {
  // 1. Proteksi Session murni sesuai template portfolio & users kamu
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. Ambil data master Roles beserta relasi Permissions & daftar seluruh izin dari database
  const roles = await db.role.findMany({
    include: {
      permissions: true,
    },
    orderBy: { id: "asc" },
  });

  const allPermissions = await db.permission.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Sesuaikan izin akses sistem secara dinamis untuk setiap level peran pengguna</p>
        </div>
        
        {/* Slot Tombol Kanan: Pintasan Navigasi kembali ke Manajemen Users */}
        <Button asChild size="lg" variant="outline">
          <Link href="/admin/users">
            <Users className="mr-2 h-5 w-5" />
            Manajemen Pengguna
          </Link>
        </Button>
      </div>

      {/* Komponen Grid Matriks Kontrol Hak Akses */}
      <RolePermissionsGrid roles={roles} allPermissions={allPermissions} />
    </div>
  );
}