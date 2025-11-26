// src/app/dashboard/portfolios/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import PortfolioForm from "@/src/components/admin/portfolios/PortfolioForm";
import { notFound } from "next/navigation";

// TAMBAHKAN INI: await params!
export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>; // ← INI YANG PENTING!
}) {
  // UNWRAP params dengan await
  const { id } = await params;

  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // Pastikan id adalah angka valid
  const portfolioId = Number(id);
  if (isNaN(portfolioId)) notFound();

  const portfolio = await db.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId: session.userId,
    },
  });

  if (!portfolio) notFound();

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

export const metadata = { title: "Edit Portfolio • Admin" };