// src/components/admin/portfolios/PortfolioTable.tsx
import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { revalidatePath } from "next/cache";

export default async function PortfolioTable() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const portfolios = await db.portfolio.findMany({
    where: { userId: session.userId },
    include: {
      workFor: true,
      workAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Image</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-40">Client</TableHead>
            <TableHead className="w-40">Employer</TableHead>
            <TableHead className="w-24 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portfolios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                Belum ada portfolio. Yuk buat yang pertama!
              </TableCell>
            </TableRow>
          ) : (
            portfolios.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/50">
                <TableCell>
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      width={80}
                      height={60}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="bg-muted border-2 border-dashed rounded-md w-20 h-16" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div>
                    <p className="text-sm font-semibold">{p.title}</p>
                    {p.featured && <Badge className="mt-1">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={p.isDisabled ? "secondary" : "default"}>
                    {p.isDisabled ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {p.isDisabled ? "Disabled" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>{p.workFor?.name || "-"}</TableCell>
                <TableCell>{p.workAt?.name || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-center">
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/dashboard/portfolios/${p.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteConfirmDialog portfolioId={p.id} title={p.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}