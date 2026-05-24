// src/components/admin/roles/RolePermissionsGrid.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { updateRolePermissions, createRole, updateRole, deleteRole } from "@/src/actions/rbac";
import { Plus, Pencil, Trash2, X, FolderLock, CheckSquare, Square } from "lucide-react";

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

const MODULE_LABELS: Record<string, string> = {
  system: "Akses Global & Sistem",
  portfolio: "Modul Portofolio",
  experience: "Modul Pengalaman Kerja",
  user: "Modul Pengguna & RBAC",
};

export default function RolePermissionsGrid({ roles, allPermissions }: RolePermissionsGridProps) {
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // Filter permission untuk kebutuhan visual dan master
  const visualPermissions = allPermissions.filter((p) => p.name !== "all");
  const masterAllPermission = allPermissions.find((p) => p.name === "all");

  // MASTER STATE: Otorisasi permission per ID Role
  const [rolePerms, setRolePerms] = useState<Record<number, number[]>>(() => {
    const initial: Record<number, number[]> = {};
    roles.forEach((role) => {
      initial[role.id] = role.permissions.map((p) => p.id);
    });
    return initial;
  });

  // State Kontrol Dialog Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");

  // Efek sinkronisasi props ke state lokal saat ada revalidasi data server
  useEffect(() => {
    const updated: Record<number, number[]> = {};
    roles.forEach((role) => {
      updated[role.id] = role.permissions.map((p) => p.id);
    });
    setRolePerms(updated);
  }, [roles]);

  // Fungsi pengelompokan permission berdasarkan modul
  const getGroupedPermissions = () => {
    return visualPermissions.reduce((groups, perm) => {
      const hasDot = perm.name.includes(".");
      const moduleKey = hasDot ? perm.name.split(".")[0] : "system";
      
      if (!groups[moduleKey]) {
        groups[moduleKey] = [];
      }
      groups[moduleKey].push(perm);
      return groups;
    }, {} as Record<string, Permission[]>);
  };

  const groupedPermissions = getGroupedPermissions();

  // ==========================================
  // HANDLER INTERAKSI DIALOG MODAL
  // ==========================================
  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedRoleId(null);
    setFormName("");
    setFormDesc("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setModalMode("edit");
    setSelectedRoleId(role.id);
    setFormName(role.name);
    setFormDesc(role.description || "");
    setIsModalOpen(true);
  };

  // ==========================================
  // HANDLER MANIPULASI MATRIKS IZIN (RBAC)
  // ==========================================
  const handleTogglePermission = (roleId: number, permId: number) => {
    setRolePerms((prev) => {
      const current = prev[roleId] || [];
      const isUnchecking = current.includes(permId);
      
      let updated = isUnchecking
        ? current.filter((id) => id !== permId)
        : [...current, permId];
      
      // Jika mencopot centang, pastikan izin master 'all' mutlak didepak dari state
      if (isUnchecking && masterAllPermission) {
        updated = updated.filter((id) => id !== masterAllPermission.id);
      }
      
      // Jika semua opsi visual penuh, otomatis suntik kembali ID 'all'
      const isAllVisualSelected = visualPermissions.every((p) => updated.includes(p.id));
      if (isAllVisualSelected && masterAllPermission && !updated.includes(masterAllPermission.id)) {
        updated.push(masterAllPermission.id);
      }

      return { ...prev, [roleId]: updated };
    });
  };

  const handleSelectAllToggle = (roleId: number) => {
    const currentSelected = rolePerms[roleId] || [];
    const isAllSelected = visualPermissions.length > 0 && visualPermissions.every((p) => currentSelected.includes(p.id));

    setRolePerms((prev) => {
      if (isAllSelected) {
        return { ...prev, [roleId]: [] };
      } else {
        const allIds = visualPermissions.map((p) => p.id);
        if (masterAllPermission) {
          allIds.push(masterAllPermission.id);
        }
        return { ...prev, [roleId]: allIds };
      }
    });
  };

  // ==========================================
  // HANDLER SUBMIT DATA KE SERVER ACTIONS
  // ==========================================
  const handleMatrixSubmit = async (e: React.FormEvent, roleId: number) => {
    e.preventDefault();
    setSubmittingId(roleId);
    
    let checkedPermissionIds = rolePerms[roleId] || [];
    const isAllSelected = visualPermissions.every((p) => checkedPermissionIds.includes(p.id));

    if (isAllSelected) {
      if (masterAllPermission && !checkedPermissionIds.includes(masterAllPermission.id)) {
        checkedPermissionIds = [...checkedPermissionIds, masterAllPermission.id];
      }
    } else {
      // Jaminan: Jika ada opsi visual kosong, 'all' dilarang keras ikut disimpan
      if (masterAllPermission) {
        checkedPermissionIds = checkedPermissionIds.filter((id) => id !== masterAllPermission.id);
      }
    }

    const result = await updateRolePermissions(roleId, checkedPermissionIds);
    alert(result.message);
    setSubmittingId(null);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return alert("Nama peran tidak boleh kosong!");

    let result;
    if (modalMode === "create") {
      result = await createRole(formName, formDesc);
    } else if (modalMode === "edit" && selectedRoleId !== null) {
      result = await updateRole(selectedRoleId, formName, formDesc);
    }

    if (result?.success) {
      setIsModalOpen(false);
    } else {
      alert(result?.message || "Terjadi kesalahan sistem");
    }
  };

  const handleDelete = async (roleId: number, roleName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus peran "${roleName}"?`)) {
      const result = await deleteRole(roleId);
      alert(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tombol Tambah Peran */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 transition-all"
        >
          <Plus className="h-4 w-4" />
          Tambah Peran Baru
        </button>
      </div>

      {/* Grid Utama Kartu Peran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => {
          const currentSelected = rolePerms[role.id] || [];
          const isAllSelected = visualPermissions.length > 0 && visualPermissions.every((p) => currentSelected.includes(p.id));

          return (
            <div 
              key={role.id} 
              className="rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col justify-between p-6 transition-colors duration-200"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">
                      {role.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {role.description || "Tidak ada deskripsi peran."}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(role)}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                      title="Ubah info nama peran"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {role.name !== "ADMIN" && role.name !== "SUPER ADMIN" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(role.id, role.name)}
                        className="p-1.5 rounded text-destructive/70 hover:text-destructive hover:bg-background transition-colors"
                        title="Hapus peran dari sistem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border border-border/60">
                  <span className="text-xs font-medium text-muted-foreground">Otorisasi Hak Akses</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAllToggle(role.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-all"
                  >
                    {isAllSelected ? (
                      <>
                        <CheckSquare className="h-4 w-4 text-primary" />
                        Hapus Semua Pilihan
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4 text-muted-foreground" />
                        Pilih Semua (Select All)
                      </>
                    )}
                  </button>
                </div>
                <hr className="my-4 border-border" />

                <form onSubmit={(e) => handleMatrixSubmit(e, role.id)}>
                  <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                    
                    {Object.entries(groupedPermissions).map(([moduleKey, permissions]) => (
                      <div key={moduleKey} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-wider uppercase bg-muted/60 px-2.5 py-1 rounded-md border border-border/40">
                          <FolderLock className="h-3.5 w-3.5 text-primary/70" />
                          {MODULE_LABELS[moduleKey] || `${moduleKey.toUpperCase()} MODULE`}
                        </div>
                        
                        <div className="space-y-1.5 pl-1">
                          {permissions.map((perm) => {
                            const isChecked = currentSelected.includes(perm.id);
                            
                            return (
                              <label 
                                key={perm.id} 
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/40 cursor-pointer transition-colors group"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(role.id, perm.id)}
                                  className="mt-1 h-4 w-4 rounded border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                />
                                <div className="space-y-0.5">
                                  <span className="text-xs font-mono font-bold text-foreground bg-muted border border-border/80 px-1.5 py-0.2 rounded group-hover:bg-background transition-colors">
                                    {perm.name}
                                  </span>
                                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                  </div>

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

      {/* Jendela Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-200 text-card-foreground">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight">
                {modalMode === "create" ? "Buat Peran Baru" : "Ubah Informasi Peran"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">Nama Peran</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: CONTENT_MANAGER"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">Deskripsi Tugas</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Tulis ringkasan cakupan wewenang peran ini..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 transition-all"
                >
                  {modalMode === "create" ? "Tambah Peran" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}