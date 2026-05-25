// src/app/admin/portfolios/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import PortfolioForm from "@/src/components/admin/portfolios/PortfolioForm";

export const dynamic = "force-dynamic"; // Jaminan anti-cache server
export const metadata = { title: "Tambah Portfolio • Admin" };

export default async function CreatePortfolioPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // KUNCI HALAMAN: Jika tidak punya izin 'portfolio.create', tendang balik!
  const canCreate = await hasPermission(session.userId, "portfolio.create");
  if (!canCreate) {
    redirect("/admin/portfolios?error=unauthorized");
  }

  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <PortfolioForm companies={companies} mode="create" />
    </div>
  );
}