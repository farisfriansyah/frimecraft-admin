// File: src/components/admin/layout/AdminLayout.tsx
import { getSession } from "@/src/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/src/lib/prisma";
import AdminNavbar from "@/src/components/admin/layout/AdminNavbar";

export const dynamic = "force-dynamic"; // TAMBAHKAN INI

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Validasi keamanan: Jika tidak ada session atau userId bernilai 0/negatif, tendang!
  if (!session?.userId || session.userId <= 0) {
    redirect("/login");
  }

  // Ambil data user TERBARU dari database berdasarkan ID di session
  const currentUser = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      role: { select: { name: true } }
    }
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Navbar akan menerima currentUser yang selalu fresh dari database */}
        <AdminNavbar currentUser={currentUser} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}