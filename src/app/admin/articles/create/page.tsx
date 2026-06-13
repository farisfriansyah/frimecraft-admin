// src/app/admin/articles/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/src/lib/rbac";
import ArticleForm from "@/src/app/admin/articles/components/ArticleForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tambah Artikel • Admin" };

export default async function CreateArticlePage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const canCreate = await hasPermission(session.userId, "article.create");
  if (!canCreate) redirect("/admin/articles?error=unauthorized");

  return (
    <div className="space-y-10">
      <ArticleForm mode="create" />
    </div>
  );
}
