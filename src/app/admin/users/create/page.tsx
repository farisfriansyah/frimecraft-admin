import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import UserForm from "@/src/app/admin/users/components/UserForm";

export const metadata = { title: "Tambah Pengguna Baru • Admin" };

export default async function CreateUserPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");
  if (!(await hasPermission(session.userId, "user.create"))) redirect("/admin/users?error=unauthorized");

  const roles = await db.role.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="space-y-10">
      <UserForm roles={roles} mode="create" />
    </div>
  );
}