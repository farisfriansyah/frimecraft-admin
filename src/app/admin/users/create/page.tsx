// src/app/admin/users/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { createUserAction } from "@/src/actions/user-actions";
import Link from "next/link";

export const metadata = { title: "Tambah Pengguna Baru • Admin" };

export default async function CreateUserPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const canCreate = await hasPermission(session.userId, "user.create");
  if (!canCreate) redirect("/admin/users?error=unauthorized");

  const roles = await db.role.findMany({ orderBy: { id: "asc" } });

  async function handleSubmit(formData: FormData) {
    "use server";
    const result = await createUserAction(formData);
    if (result.success) {
      redirect("/admin/users");
    }
  }

  return (
    <div className="container max-w-xl py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Pengguna Baru</h1>
        <p className="text-sm text-muted-foreground">Daftarkan akun administrator baru ke dalam sistem</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input type="text" name="name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Alamat Email</label>
            <input type="email" name="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Password Awal</label>
            <input type="password" name="password" placeholder="Minimal 6 karakter" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Otorisasi Peran (Role)</label>
            <select name="roleId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-card">
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Link href="/admin/users" className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium border border-input rounded-md hover:bg-accent transition-colors">
              Batal
            </Link>
            <button type="submit" className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all">
              Buat Akun
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}