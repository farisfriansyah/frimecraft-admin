// src/app/admin/portfolios/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import PortfolioForm from "@/src/components/admin/portfolios/PortfolioForm";

export const metadata = { title: "Tambah Portfolio • Admin" };

export default async function CreatePortfolioPage() {
  // 1. Proteksi Autentikasi Sesi Login
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 2. PROTEKSI SERVER (RBAC): Tendang ke halaman utama portofolio jika tidak punya izin 'portfolio.create' atau 'all'
  const canCreate = await hasPermission(session.userId, "portfolio.create");
  if (!canCreate) {
    redirect("/admin/portfolios?error=unauthorized");
  }

  // 3. Ambil data master perusahaan jika lolos validasi hak akses
  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return <PortfolioForm companies={companies} mode="create" />;
}