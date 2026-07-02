// src/app/admin/articles/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import Link from "next/link";
import { Button } from "@/src/app/ui/button";
import { Plus } from "lucide-react";
import { hasPermission } from "@/src/lib/rbac";
import { ArticleDataTable } from "@/src/app/admin/articles/components/ArticleTable";

export const metadata = { title: "Articles • Admin" };
export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const canCreate = await hasPermission(session.userId, "article.create");
  const canUpdate = await hasPermission(session.userId, "article.update");
  const canDelete = await hasPermission(session.userId, "article.delete");

  const articles = await db.article.findMany({
    include: { author: { select: { name: true } } },
    orderBy: [{ sortNumber: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Artikel & Blog</h1>
        <p className="text-muted-foreground mt-2">Kelola semua artikel blog dan konten terkait</p>
      </div>

      {canCreate && (
        <Button asChild size="lg">
          <Link href="/admin/articles/create">
            <Plus className="mr-2 h-5 w-5" />
            Tambah Artikel
          </Link>
        </Button>
      )}

      <ArticleDataTable data={articles} permissions={{ canUpdate, canDelete }} />
    </div>
  );
}

