// src/app/admin/users/UserTable.tsx
"use client";

import { useState } from "react";
import { updateUserRole, toggleUserStatus } from "@/src/actions/rbac";

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
  roles: any[];
}

export default function UserTable({ users: initialUsers, roles }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Fungsi pengubah Peran Pengguna (Sudah Diperbaiki & Sinkron)
  const handleRoleChange = async (userId: number, roleId: number) => {
    setLoadingId(userId);
    const result = await updateUserRole(userId, roleId);
    
    if (result.success) {
      // Perbarui state lokal agar data roleId terbaru terkunci di memori client
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, roleId: roleId } : u))
      );
    } else {
      // Jika gagal, dropdown otomatis kembali ke nilai semula karena menggunakan controlled 'value'
      alert(result.message);
    }
    setLoadingId(null);
  };

  // Fungsi pengubah Status Hak Akses Akun
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setLoadingId(userId);
    const result = await toggleUserStatus(userId, currentStatus);
    
    if (result.success) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
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
                {/* Kolom Profil */}
                <td className="p-4">
                  <div className="font-medium text-foreground">{user.name || "Tanpa Nama"}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                
                {/* Kolom Seleksi Peran (Controlled & Anti-Spam) */}
                <td className="p-4">
                  <select
                    value={user.roleId} // PERBAIKAN: Menggunakan 'value' agar tersinkronisasi penuh dengan state React
                    disabled={loadingId === user.id} // Mengunci dropdown saat proses penyimpanan sedang berlangsung
                    onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                    className="bg-background border border-input text-foreground text-xs rounded-md p-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-all"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id} className="bg-background text-foreground">
                        {role.name}
                      </option>
                    ))}
                  </select>
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
                
                {/* Kolom Tombol Aksi Kendali */}
                <td className="p-4 text-right">
                  <button
                    type="button"
                    disabled={loadingId === user.id}
                    onClick={() => handleToggleStatus(user.id, user.isActive)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                      user.isActive 
                        ? "border-destructive/40 text-destructive hover:bg-destructive/10" 
                        : "border-primary/40 text-primary hover:bg-primary/10"
                    } disabled:opacity-50`}
                  >
                    {loadingId === user.id ? "Memproses..." : user.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}