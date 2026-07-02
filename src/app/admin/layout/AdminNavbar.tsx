"use client";

import { ModeToggle } from "@/src/app/mode-toggle";
import { Avatar, AvatarFallback } from "@/src/app/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/app/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { logoutAction } from "@/src/actions/auth-actions";
import Link from "next/link";

// Gunakan interface yang lebih ketat agar tidak ada error undefined di UI
interface UserProfile {
  name: string | null;
  email: string;
  role: { name: string } | null;
}

interface AdminNavbarProps {
  currentUser: UserProfile | null;
}

export default function AdminNavbar({ currentUser }: AdminNavbarProps) {
  
  const getInitials = (name: string | null, email: string) => {
    if (!name) return email.substring(0, 2).toUpperCase();
    return name
      .split(" ")
      .filter(Boolean) // Menghindari error jika ada spasi ganda
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleLogout = async () => {
    // Gunakan confirm yang lebih user-friendly
    if (window.confirm("Apakah Anda yakin ingin keluar dari panel admin?")) {
      try {
        const result = await logoutAction();
        if (result.success) {
          // window.location.href adalah cara paling ampuh untuk memaksa 
          // browser membersihkan cache memori Next.js saat logout
          window.location.href = "/login";
        } else {
          console.error("Logout gagal:", result);
        }
      } catch (err) {
        console.error("Logout error:", err);
      }
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 items-center justify-end px-6 gap-4">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-offset-2 ring-primary/10 select-none transition-all hover:ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold tracking-wider">
                {getInitials(currentUser?.name ?? null, currentUser?.email ?? "AD")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60 shadow-lg">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">
                  {currentUser?.name ?? "Administrator"}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {currentUser?.email ?? "admin@frimecraft.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <div className="px-2 py-1.5">
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                {currentUser?.role?.name ?? "USER"}
              </span>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Profil Saya</span>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin/frontend-settings">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Frontend Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-medium"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar Sesi</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}