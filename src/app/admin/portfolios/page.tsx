// src/app/admin/portfolios/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { PortfolioDataTable } from "@/src/app/admin/portfolios/components/PortfolioDataTable";
import { Button } from "@/src/app/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { hasPermission } from "@/src/lib/rbac"; // Impor helper RBAC pusat
import { ImportPortfoliosButton } from "@/src/app/admin/portfolios/components/ImportPortfoliosButton";

export const metadata = { title: "Portfolios • Admin" };

export const dynamic = "force-dynamic";

export default async function PortfoliosPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 1. Cek Hak Akses secara paralel menggunakan Helper RBAC
  const canCreate = await hasPermission(session.userId, "portfolio.create");
  const canUpdate = await hasPermission(session.userId, "portfolio.update");
  const canDelete = await hasPermission(session.userId, "portfolio.delete");

  // 2. Ambil data portfolio spesifik milik user yang sedang login dari PostgreSQL
  const portfolios = await db.portfolio.findMany({
    // where: { userId: session.userId },
    select: {
      id: true,
      title: true,
      sortNumber: true,
      imageUrl: true,
      featured: true,
      isDisabled: true,
      createdAt: true,
      tags: true,
      workFor: { select: { name: true } },
      workAt: { select: { name: true } },
    },
    orderBy: [{ sortNumber: "asc" }, { createdAt: "desc" }],
  });

  return (


    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Portfolios</h1>
        <p className="text-muted-foreground mt-2">Kelola semua project portfolio kamu</p>
      </div>

      {canCreate && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/admin/portfolios/create">
                <Plus className="mr-2 h-5 w-5" />
                Tambah Portfolio
              </Link>
            </Button>
            <ImportPortfoliosButton />
          </div>
          <p className="text-sm text-muted-foreground">
            JSON berupa array (atau object dengan properti <code>portfolios</code>); setiap item wajib memiliki <code>title</code>. Field lain mengikuti skema portfolio, sedangkan gambar diabaikan.
          </p>
        </div>
      )}

      {/* Oper data izin ke tabel agar tombol Edit/Delete menyesuaikan */}
      <PortfolioDataTable
        data={portfolios}
        permissions={{ canUpdate, canDelete }}
      />
    </div>
  );
}