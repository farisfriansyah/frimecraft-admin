// src/components/admin/users/UserTable.tsx
"use client";

import { useState, useEffect } from "react";
import { toggleUserStatus } from "@/src/actions/rbac";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  roleId: number;
  isActive: boolean;
  lastLogin: Date | null;
  role: Role;
}

interface UserTableProps {
  users: User[];
  currentAdminId: number;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export default function UserTable({ users: initialUsers, currentAdminId, permissions }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Sinkronisasikan state lokal jika ada pembaruan data dari sisi server (revalidate)
  useEffect(() => { 
    setUsers(initialUsers); 
  }, [initialUsers]);

  // Fungsi pengubah Status Akses Akun (Aktif / Nonaktif)
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    if (userId === currentAdminId) {
      return alert("Anda tidak bisa menonaktifkan akun Anda sendiri yang sedang dipakai!");
    }
    
    setLoadingId(userId);
    const result = await toggleUserStatus(userId, currentStatus);
    
    if (result.success) {
      setUsers((prev) => 
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } else {
      alert(result.message);
    }
    setLoadingId(null);
  };

  return (
    <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs font-medium uppercase tracking-wider">
              <th className="p-4 font-semibold">Nama & Email</th>
              <th className="p-4 font-semibold">Peran (Role)</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Login Terakhir</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                
                {/* Kolom Informasi Profil */}
                <td className="p-4">
                  <div className="font-medium text-foreground">{user.name || "Tanpa Nama"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                
                {/* Kolom Badge Peran (Role) */}
                <td className="p-4">
                  <span className="text-xs font-mono bg-muted border border-border/80 px-2.5 py-1 rounded-md text-foreground font-semibold uppercase">
                    {user.role?.name || "NO_ROLE"}
                  </span>
                </td>
                
                {/* Kolom Status Akun */}
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${
                    user.isActive 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" 
                      : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                  }`}>
                    {user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                
                {/* Kolom Riwayat Akses */}
                <td className="p-4 text-xs text-muted-foreground">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString("id-ID") : "Belum pernah"}
                </td>
                
                {/* Kolom Tombol Panel Aksi */}
                <td className="p-4 text-right space-x-2">
                  
                  {/* Tautan Navigasi ke Halaman Edit Mandiri */}
                  <Link
                    href={`/admin/users/edit/${user.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border border-input bg-background hover:bg-accent text-foreground transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>

                  {/* Tombol Cepat Nonaktifkan / Aktifkan Akun */}
                  {permissions.canUpdate && (
                    <button
                      type="button"
                      disabled={loadingId === user.id || user.id === currentAdminId}
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-md border transition-all ${
                        user.isActive 
                          ? "border-destructive/40 text-destructive hover:bg-destructive/10" 
                          : "border-primary/40 text-primary hover:bg-primary/10"
                      } disabled:opacity-30`}
                    >
                      {loadingId === user.id ? "..." : user.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}