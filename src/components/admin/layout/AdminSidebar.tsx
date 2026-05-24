// src/components/admin/AdminSidebar.tsx
"use client";

import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  User,
  Award,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/portfolios", label: "Portfolios", icon: Briefcase },
  { href: "/admin/works", label: "Work Experience", icon: Briefcase },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/skills", label: "Skills", icon: Wrench },
  { href: "/admin/languages", label: "Languages", icon: Languages },
  { href: "/admin/users", label: "Users", icon: User },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // LOGIKA AKTIF YANG 100% AKURAT
  const isActive = (href: string): boolean => {
    // Exact match untuk /admin
    if (href === "/admin") {
      return pathname === "/admin";
    }

    // Untuk semua route lain: aktif jika pathname dimulai dengan href
    // Contoh: /admin/portfolios/123 → tetap aktifkan "Portfolios"
    return pathname.startsWith(href);
  };

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-5">
        <h2 className="text-2xl font-bold tracking-tight">Frimecraft</h2>
        <p className="text-sm text-muted-foreground">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", active && "text-primary-foreground")} />
              <span>{item.label}</span>

              {/* Active Indicator (titik kecil di kanan) */}
              {active && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground/20 rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <form action="/api/auth/logout" method="post">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-background h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden bg-background/90 backdrop-blur-sm hover:bg-accent"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-r">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}