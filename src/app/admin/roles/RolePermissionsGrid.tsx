// src/app/admin/roles/RolePermissionsGrid.tsx
"use client";

import { useState } from "react";
import { updateRolePermissions } from "@/src/actions/rbac";

interface Permission {
  id: number;
  name: string;
  description: string | null;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: Permission[];
}

interface RolePermissionsGridProps {
  roles: Role[];
  allPermissions: Permission[];
}

export default function RolePermissionsGrid({ roles, allPermissions }: RolePermissionsGridProps) {
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, roleId: number) => {
    e.preventDefault();
    setSubmittingId(roleId);

    const formData = new FormData(e.currentTarget);
    
    // Menyaring checkbox mana saja yang bernilai "on" (dicentang)
    const checkedPermissionIds = allPermissions
      .filter((p) => formData.get(`perm-${p.id}`) === "on")
      .map((p) => p.id);

    const result = await updateRolePermissions(roleId, checkedPermissionIds);
    
    if (!result.success) {
      alert(result.message);
    } else {
      // Notifikasi sukses sederhana (bisa diganti toast bawaan jika ada)
      alert(`Hak akses untuk peran ${roles.find(r => r.id === roleId)?.name} berhasil diperbarui!`);
    }
    
    setSubmittingId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {roles.map((role) => {
        const activePermissionIds = role.permissions.map((p) => p.id);

        return (
          <div 
            key={role.id} 
            className="rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col justify-between p-6 transition-colors duration-200"
          >
            <div>
              {/* Bagian Header Kartu Peran */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold tracking-tight text-primary uppercase">{role.name}</h2>
                <span className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-md font-medium border border-border">
                  ID: {role.id}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {role.description || "Tidak ada deskripsi peran."}
              </p>
              <hr className="mb-4 border-border" />

              {/* Form Daftar Checkbox Hak Akses */}
              <form onSubmit={(e) => handleSubmit(e, role.id)}>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
                  {allPermissions.map((perm) => {
                    const isAssigned = activePermissionIds.includes(perm.id);
                    
                    return (
                      <label 
                        key={perm.id} 
                        className="flex items-start gap-3 p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <input
                          type="checkbox"
                          name={`perm-${perm.id}`}
                          defaultChecked={isAssigned}
                          className="mt-1 h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold text-foreground bg-muted border border-border px-2 py-0.5 rounded-md group-hover:bg-background transition-colors">
                            {perm.name}
                          </span>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            {perm.description || "Tidak ada deskripsi izin."}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Tombol Simpan Konfigurasi Peran */}
                <div className="mt-6 pt-4 border-t border-border text-right">
                  <button
                    type="submit"
                    disabled={submittingId === role.id}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 transition-all disabled:opacity-50"
                  >
                    {submittingId === role.id ? "Menyimpan..." : "Simpan Perubahan Izin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}