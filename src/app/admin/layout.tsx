// src/app/admin/layout.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import AdminNavbar from "@/src/components/admin/layout/AdminNavbar";
import AdminSidebar from "@/src/components/admin/layout/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.userId || session.userId <= 0) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      role: { select: { name: true } }
    }
  });

  if (!user) redirect("/login");

  // Pastikan role tidak null agar Navbar tidak error
  const currentUser = {
    name: user.name,
    email: user.email,
    role: { name: user.role?.name || "USER" }
  };

  return (
    <div className="flex bg-background">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        {/* Navbar menerima currentUser sebagai prop */}
        <AdminNavbar currentUser={currentUser} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}