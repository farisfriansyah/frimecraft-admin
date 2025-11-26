// src/app/portfolios/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import PortfolioForm from "@/src/components/admin/portfolios/PortfolioForm";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Portfolio • Admin" };

export default async function EditPortfolioPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const portfolio = await db.portfolio.findFirst({
    where: { id: Number(params.id), userId: session.userId },
  });

  if (!portfolio) notFound();

  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return <PortfolioForm portfolio={portfolio} companies={companies} mode="edit" />;
}