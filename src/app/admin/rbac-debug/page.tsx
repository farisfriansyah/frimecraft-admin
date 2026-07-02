import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import EffectivePermissionsPanel from "@/src/app/admin/rbac-debug/components/EffectivePermissionsPanel";

export const metadata = { title: "RBAC Debug • Admin" };

export default async function RbacDebugPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const canManageRoles = await hasPermission(session.userId, "role.manage");
  if (!canManageRoles) redirect("/admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RBAC Debug</h1>
        <p className="text-muted-foreground">
          Cek effective permissions per user secara langsung dari endpoint admin internal.
        </p>
      </div>

      <EffectivePermissionsPanel />
    </div>
  );
}
