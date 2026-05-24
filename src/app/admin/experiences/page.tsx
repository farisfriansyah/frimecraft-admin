// src/app/admin/experiences/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { PortfolioDataTable } from "@/src/components/admin/experiences/ExperienceDataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = { title: "Experiences • Admin" };

export default async function ExperiencesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const experiences = await db.portfolio.findMany({
    where: { userId: session.userId },
    include: { workFor: true, workAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    // <div className="container max-w-7xl py-10 space-y-8">
    <div className="container space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experiences</h1>
          <p className="text-muted-foreground">Kelola semua pengalaman kerja kamu</p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/experiences/create">
            <Plus className="mr-2 h-5 w-5" />
            Tambah Pengalaman Kerja
          </Link>
        </Button>
      </div>

      <ExperienceDataTable data={experiences} />
    </div>
  );
}