import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import FrontendSettingsForm from "@/src/app/admin/frontend-settings/components/FrontendSettingsForm";

export const metadata = { title: "Frontend Settings • Admin" };

export default async function FrontendSettingsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const canManage = await hasPermission(session.userId, "frontend_settings.manage");
  if (!canManage) redirect("/admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Frontend Settings</h1>
        <p className="text-muted-foreground">
          Kelola title website, SEO metadata, dan konfigurasi global frontend.
        </p>
      </div>

      <FrontendSettingsForm />
    </div>
  );
}
