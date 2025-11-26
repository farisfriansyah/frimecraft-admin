// src/app/portfolios/create/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import PortfolioForm from "@/src/components/admin/portfolios/PortfolioForm";

export const metadata = { title: "Tambah Portfolio • Admin" };

export default async function CreatePortfolioPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return <PortfolioForm companies={companies} mode="create" />;
}