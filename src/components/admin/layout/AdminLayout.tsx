// src/components/admin/layout/AdminLayout.tsx
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex overflow-hidden flex-1 flex-col">
        <AdminNavbar />
        {/* <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6 lg:p-8"> */}
        <main className="flex-1 bg-muted/40 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}