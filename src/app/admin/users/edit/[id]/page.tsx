import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { deleteUserAction } from "@/src/actions/user-actions";
import UserForm from "@/src/components/admin/users/UserForm";

export const metadata = { title: "Edit Pengguna • Admin" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(id);
  if (isNaN(userId)) notFound();

  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const [canUpdate, canDelete] = await Promise.all([
    hasPermission(session.userId, "user.update"),
    hasPermission(session.userId, "user.delete"),
  ]);
  
  if (!canUpdate) redirect("/admin/users?error=unauthorized");

  const targetUser = await db.user.findUnique({ where: { id: userId } });
  if (!targetUser) notFound();

  const roles = await db.role.findMany({ orderBy: { id: "asc" } });

  async function handleDelete() {
    "use server";
    await deleteUserAction(userId);
    redirect("/admin/users");
  }

  return (
    <div className="space-y-10">
      <UserForm 
        user={targetUser} 
        roles={roles} 
        mode="edit"
        canDelete={canDelete && userId !== session.userId} 
        onDelete={handleDelete} 
      />
    </div>
  );
}