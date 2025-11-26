// src/app/dashboard/portfolios/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import PortfolioTable from "@/src/components/admin/portfolios/PortfolioTable";

export const metadata = { title: "Portfolios • Admin" };

export default function PortfoliosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
          <p className="text-muted-foreground">Kelola semua project portfolio kamu</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/portfolios/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Portfolio
          </Link>
        </Button>
      </div>

      <PortfolioTable />
    </div>
  );
}