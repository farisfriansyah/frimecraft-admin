// src/app/admin/portfolios/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { PortfolioDataTable } from "@/src/components/admin/portfolios/PortfolioDataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { hasPermission } from "@/src/lib/rbac"; // Impor helper RBAC pusat

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
    include: { workFor: true, workAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
          <p className="text-muted-foreground">Kelola semua project portfolio kamu</p>
        </div>
        
        {/* HANYA MUNCUL JIKA USER MEMILIKI IZIN portfolio.create ATAU all */}
        {canCreate && (
          <Button asChild size="lg">
            {/* PASTIKAN: Alamat href ini sama persis dengan lokasi folder fisik file create kamu */}
            <Link href="/admin/portfolios/create">
              <Plus className="mr-2 h-5 w-5" />
              Tambah Portfolio
            </Link>
          </Button>
        )}
      </div>

      {/* Oper data izin ke tabel agar tombol Edit/Delete menyesuaikan */}
      <PortfolioDataTable 
        data={portfolios} 
        permissions={{ canUpdate, canDelete }} 
      />
    </div>
  );
}