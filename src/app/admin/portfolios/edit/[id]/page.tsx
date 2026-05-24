// src/app/admin/portfolios/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/src/lib/rbac"; // Impor helper RBAC pusat
import { db } from "@/src/lib/prisma";
import PortfolioForm from "@/src/components/admin/portfolios/PortfolioForm";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Portfolio • Admin" };

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. UNWRAP params di awal sesuai standar Node/Next.js terbaru
  const { id } = await params;

  // 2. Proteksi Autentikasi Sesi Login
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // 3. PROTEKSI SERVER (RBAC): Tendang jika user tidak punya izin 'portfolio.update' atau 'all'
  const canUpdate = await hasPermission(session.userId, "portfolio.update");
  if (!canUpdate) {
    redirect("/admin/portfolios?error=unauthorized");
  }

  // 4. Pastikan ID parameter adalah angka valid
  const portfolioId = Number(id);
  if (isNaN(portfolioId)) notFound();

  // 5. Ambil data portfolio milik user yang sedang login
  const portfolio = await db.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId: session.userId,
    },
  });

  if (!portfolio) notFound();

  // 6. Ambil data master perusahaan relasi untuk keperluan dropdown form
  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <PortfolioForm
      portfolio={portfolio}
      companies={companies}
      mode="edit"
    />
  );
}