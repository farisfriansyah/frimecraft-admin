// src/app/dashboard/layout.tsx
import AdminLayout from "@/src/components/admin/layout/AdminLayout";
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  return <AdminLayout>{children}</AdminLayout>;
}