// src/app/admin/users/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { updateUserAction, changeUserPasswordAction, deleteUserAction } from "@/src/actions/user-actions";
import Link from "next/link";
import { KeyRound, UserRoundX, Settings2 } from "lucide-react";
import { DeleteButton } from "@/src/components/admin/common/DeleteButton"; // Import komponen baru

interface EditProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Edit Pengguna • Admin" };

export default async function EditUserPage({ params }: EditProps) {
  const { id } = await params;
  const userId = Number(id);
  if (isNaN(userId)) notFound();

  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const canUpdate = await hasPermission(session.userId, "user.update");
  const canDelete = await hasPermission(session.userId, "user.delete");
  if (!canUpdate) redirect("/admin/users?error=unauthorized");

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) notFound();

  const roles = await db.role.findMany({ orderBy: { id: "asc" } });

  async function handleInfoSubmit(formData: FormData) {
    "use server";
    const result = await updateUserAction(userId, formData);
    if (result.success) redirect("/admin/users");
  }

  async function handlePasswordSubmit(formData: FormData) {
    "use server";
    await changeUserPasswordAction(userId, formData);
    redirect("/admin/users");
  }

  async function handleDeleteSubmit() {
    "use server";
    const result = await deleteUserAction(userId);
    if (result.success) redirect("/admin/users");
  }

  return (
    <div className="container max-w-xl py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Detail Akun</h1>
        </div>
        <Link href="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-foreground"> Kembali </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ubah Data Informasi Profil</h4>
        <form action={handleInfoSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <input type="text" name="name" defaultValue={targetUser.name || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Alamat Email</label>
            <input type="email" name="email" defaultValue={targetUser.email} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Penugasan Peran (Role)</label>
            <select name="roleId" defaultValue={targetUser.roleId} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-card">
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="text-right pt-2">
            <button type="submit" className="inline-flex items-center justify-center h-9 px-4 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 shadow">
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-card-foreground space-y-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <KeyRound className="h-4 w-4 text-amber-500" /> Pengaturan Ulang Kata Sandi
        </h4>
        <form action={handlePasswordSubmit} className="flex gap-2 items-end">
          <div className="space-y-1.5 flex-1">
            <input type="password" name="newPassword" placeholder="Masukkan password baru..." className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>
          <button type="submit" className="inline-flex items-center justify-center h-10 px-4 text-xs font-medium border border-amber-500/30 bg-amber-500/10 text-amber-600 rounded-md hover:bg-amber-500/20 transition-colors">
            Terapkan Password
          </button>
        </form>
      </div>

      {canDelete && userId !== session.userId && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
            <UserRoundX className="h-4 w-4" /> Area Bahaya
          </h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Menghapus user akan mencabut semua hak miliknya dan menghapusnya secara permanen.
            </p>
            {/* Panggil komponen DeleteButton disini */}
            <DeleteButton action={handleDeleteSubmit} />
          </div>
        </div>
      )}
    </div>
  );
}