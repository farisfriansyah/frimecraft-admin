import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { LanguageDataTable } from "@/src/app/admin/languages/components/LanguageDataTable";
import { Button } from "@/src/app/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LanguagesPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");
  // const data = await db.language.findMany({ 
  //   where: { userId: session.userId }, 
  //   orderBy: { id: "asc" } 
  // });
   const data = await db.language.findMany({ 
    // where: { userId: session.userId }, // Aktifkan jika ingin filter per user
    orderBy: { id: "desc" },
  });
  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold">Languages</h1>
      <Button asChild size="lg"><Link href="/admin/languages/create"><Plus className="mr-2 h-4 w-4" /> Tambah Bahasa</Link></Button>
      <LanguageDataTable data={data} permissions={{ canUpdate: true, canDelete: true }} />
    </div>
  );
}