// src/app/admin/portfolios/edit/[id]/page.tsx
import { getSession } from "@/src/lib/session";
import { redirect, notFound } from "next/navigation";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac"; // <-- Wajib Impor Helper RBAC
import PortfolioForm from "@/src/components/admin/portfolios/PortfolioForm";

export const metadata = { title: "Edit Portfolio • Admin" };

interface EditProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioPage({ params }: EditProps) {
  // 1. Ambil ID dari Parameter URL (Next.js 15+ menggunakan await params)
  const { id } = await params;

  // 2. Proteksi Autentikasi Sesi Login
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // ==========================================
  // KUNCI UTAMA: Proteksi Otorisasi Hak Akses (RBAC)
  // ==========================================
  // Jika pengguna tidak punya izin 'portfolio.update' atau kunci master 'all',
  // PostgreSQL akan menolak render halaman dan melempar pengguna kembali ke halaman utama.
  const canUpdate = await hasPermission(session.userId, "portfolio.update");
  if (!canUpdate) {
    redirect("/admin/portfolios?error=unauthorized");
  }

  // 3. Pastikan ID adalah angka valid
  const portfolioId = Number(id);
  if (isNaN(portfolioId)) notFound();

  // 4. Ambil data portfolio spesifik milik user yang sedang login (keamanan berlapis)
  const portfolio = await db.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId: session.userId, // Jaminan keamanan agar user tidak bisa edit portfolio milik orang lain via tembak ID
    },
  });

  if (!portfolio) notFound();

  // 5. Ambil data master companies untuk dropdown form
  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <PortfolioForm
        portfolio={portfolio}
        companies={companies}
        mode="edit"
      />
      </div>
  );
}