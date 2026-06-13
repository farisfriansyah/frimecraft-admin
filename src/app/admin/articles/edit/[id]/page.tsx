// src/app/admin/articles/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import ArticleForm from "@/src/app/admin/articles/components/ArticleForm";

export const metadata = { title: "Edit Artikel • Admin" };

interface Props { params: Promise<{ id: string }>; }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const canUpdate = await hasPermission(session.userId, "article.update");
  if (!canUpdate) redirect("/admin/articles?error=unauthorized");

  const articleId = Number(id);
  if (isNaN(articleId)) notFound();

  const article = await db.article.findFirst({ where: { id: articleId } });
  if (!article) notFound();

  return (
    <div className="space-y-10">
      <ArticleForm article={article} mode="edit" />
    </div>
  );
}
