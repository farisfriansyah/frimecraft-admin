// src/components/admin/roles/RolePermissionsGrid.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useTransition } from "react";
import { updateRolePermissions, createRole, updateRole, deleteRole } from "@/src/actions/rbac";
import { Plus, Pencil, Trash2, X, FolderLock, CheckSquare, Square, Loader2, Save, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/src/app/ui/button";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Textarea } from "@/src/app/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/app/ui/card";

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
  article: "Modul Artikel",
  experience: "Modul Pengalaman Kerja",
  education: "Modul Pendidikan",
  language: "Modul Bahasa",
  skill: "Modul Keahlian",
  certification: "Modul Sertifikasi",
  company: "Modul Company",
  frontend_settings: "Modul Frontend Settings",
  user: "Modul Pengguna",
  role: "Modul Peran & Izin",
};

export default function RolePermissionsGrid({ roles, allPermissions }: RolePermissionsGridProps) {
  const [isPending, startTransition] = useTransition();
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [permissionSearch, setPermissionSearch] = useState(searchParams.get("perm") ?? "");
  const roleNameById = React.useMemo(() => {
    const map: Record<number, string> = {};
    roles.forEach((role) => {
      map[role.id] = role.name;
    });
    return map;
  }, [roles]);

  const visualPermissions = allPermissions.filter((p) => p.name !== "all");
  const masterAllPermission = allPermissions.find((p) => p.name === "all");
  const normalizedSearch = permissionSearch.trim().toLowerCase();

  useEffect(() => {
    const urlSearch = searchParams.get("perm") ?? "";
    if (urlSearch !== permissionSearch) {
      setPermissionSearch(urlSearch);
    }
  }, [searchParams, permissionSearch]);

  useEffect(() => {
    const current = searchParams.get("perm") ?? "";
    const next = permissionSearch.trim();
    if (current === next) return;

    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("perm", next);
    else params.delete("perm");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [permissionSearch, pathname, router, searchParams]);

  const filteredPermissions = React.useMemo(() => {
    if (!normalizedSearch) return visualPermissions;

    return visualPermissions.filter((permission) => {
      const inName = permission.name.toLowerCase().includes(normalizedSearch);
      const inDesc = (permission.description || "").toLowerCase().includes(normalizedSearch);
      return inName || inDesc;
    });
  }, [visualPermissions, normalizedSearch]);

  const [rolePerms, setRolePerms] = useState<Record<number, number[]>>(() => {
    const initial: Record<number, number[]> = {};
    roles.forEach((role) => {
      initial[role.id] = role.permissions.map((p) => p.id);
    });
    return initial;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");

  useEffect(() => {
    const updated: Record<number, number[]> = {};
    roles.forEach((role) => {
      updated[role.id] = role.permissions.map((p) => p.id);
    });
    setRolePerms(updated);
  }, [roles]);

  const getGroupedPermissions = () => {
    return filteredPermissions.reduce((groups, perm) => {
      const hasDot = perm.name.includes(".");
      const moduleKey = hasDot ? perm.name.split(".")[0] : "system";
      if (!groups[moduleKey]) groups[moduleKey] = [];
      groups[moduleKey].push(perm);
      return groups;
    }, {} as Record<string, Permission[]>);
  };

  const groupedPermissions = getGroupedPermissions();

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const highlightText = (text: string) => {
    if (!normalizedSearch) return text;

    const regex = new RegExp(`(${escapeRegExp(normalizedSearch)})`, "ig");
    return text.split(regex).map((part, idx) => {
      const isMatch = part.toLowerCase() === normalizedSearch;
      if (!isMatch) return <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>;

      return (
        <mark key={`${part}-${idx}`} className="rounded bg-amber-200 px-0.5 text-foreground">
          {part}
        </mark>
      );
    });
  };

  const handleTogglePermission = (roleId: number, permId: number) => {
    setRolePerms((prev) => {
      const isSuperAdminRole = roleNameById[roleId] === "SUPER ADMIN";
      const current = prev[roleId] || [];
      const isUnchecking = current.includes(permId);
      let updated = isUnchecking ? current.filter((id) => id !== permId) : [...current, permId];
      if (isUnchecking && masterAllPermission && !isSuperAdminRole) updated = updated.filter((id) => id !== masterAllPermission.id);
      const isAllVisualSelected = visualPermissions.every((p) => updated.includes(p.id));
      if (isAllVisualSelected && masterAllPermission && !updated.includes(masterAllPermission.id)) updated.push(masterAllPermission.id);
      if (isSuperAdminRole && masterAllPermission && !updated.includes(masterAllPermission.id)) {
        updated.push(masterAllPermission.id);
      }
      return { ...prev, [roleId]: updated };
    });
  };

  const handleSelectAllToggle = (roleId: number) => {
    const isSuperAdminRole = roleNameById[roleId] === "SUPER ADMIN";
    const currentSelected = rolePerms[roleId] || [];
    const isAllSelected = visualPermissions.length > 0 && visualPermissions.every((p) => currentSelected.includes(p.id));
    setRolePerms((prev) => {
      if (isAllSelected) {
        if (isSuperAdminRole && masterAllPermission) {
          return { ...prev, [roleId]: [masterAllPermission.id] };
        }
        return { ...prev, [roleId]: [] };
      }
      const allIds = visualPermissions.map((p) => p.id);
      if (masterAllPermission) allIds.push(masterAllPermission.id);
      return { ...prev, [roleId]: allIds };
    });
  };

  const handleMatrixSubmit = async (e: React.FormEvent, roleId: number) => {
    e.preventDefault();
    setSubmittingId(roleId);
    let checkedPermissionIds = rolePerms[roleId] || [];
    
    startTransition(async () => {
        const result = await updateRolePermissions(roleId, checkedPermissionIds);
        result.success ? toast.success(result.message) : toast.error(result.message);
        setSubmittingId(null);
    });
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return toast.error("Nama peran wajib diisi!");
    
    startTransition(async () => {
        let result;
        if (modalMode === "create") result = await createRole(formName, formDesc);
        else if (modalMode === "edit" && selectedRoleId !== null) result = await updateRole(selectedRoleId, formName, formDesc);
        
        if (result?.success) {
            toast.success(result.message);
            setIsModalOpen(false);
        } else {
            toast.error(result?.message || "Terjadi kesalahan");
        }
    });
  };

  const handleDelete = async (roleId: number, roleName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus peran "${roleName}"?`)) {
        startTransition(async () => {
            const result = await deleteRole(roleId);
            result.success ? toast.success(result.message) : toast.error(result.message);
        });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-start">
        <Button onClick={() => { setModalMode("create"); setFormName(""); setFormDesc(""); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Peran Baru
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <Label htmlFor="permission-search-global">Cari Permission</Label>
          <Input
            id="permission-search-global"
            value={permissionSearch}
            onChange={(e) => setPermissionSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau deskripsi permission"
          />
          <p className="text-xs text-muted-foreground">
            Menampilkan {filteredPermissions.length} dari {visualPermissions.length} permission.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => {
          const currentSelected = rolePerms[role.id] || [];
          const isAllSelected = visualPermissions.length > 0 && visualPermissions.every((p) => currentSelected.includes(p.id));
          const isSuperAdminRole = role.name === "SUPER ADMIN";
          const hasAllPermission = masterAllPermission ? currentSelected.includes(masterAllPermission.id) : false;

          return (
            <Card key={role.id} className="flex flex-col shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl uppercase">{role.name}</CardTitle>
                  <CardDescription>{role.description || "Tidak ada deskripsi peran."}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setModalMode("edit"); setSelectedRoleId(role.id); setFormName(role.name); setFormDesc(role.description || ""); setIsModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    {role.name !== "ADMIN" && role.name !== "SUPER ADMIN" && (
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(role.id, role.name)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                              {isSuperAdminRole && (
                                <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary flex items-start gap-2">
                                  <ShieldAlert className="h-4 w-4 mt-0.5" />
                                  <p>
                                    Role SUPER ADMIN wajib mempertahankan permission <strong>all</strong>. Checkbox dikunci sesuai proteksi backend.
                                  </p>
                                </div>
                              )}

                <div className="flex items-center justify-between bg-muted p-3 rounded-lg text-sm">
                    <span className="font-medium text-muted-foreground">Otorisasi</span>
                    <Button variant="link" className="h-auto p-0" onClick={() => handleSelectAllToggle(role.id)}>
                        {isAllSelected ? <><CheckSquare className="mr-2 h-4 w-4" /> Batal Semua</> : <><Square className="mr-2 h-4 w-4" /> Pilih Semua</>}
                    </Button>
                </div>

                <form onSubmit={(e) => handleMatrixSubmit(e, role.id)} className="space-y-6">
                    <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
                        {Object.entries(groupedPermissions).map(([moduleKey, permissions]) => (
                            <div key={moduleKey} className="space-y-3">
                                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary border-b pb-2">
                                    <FolderLock className="h-3 w-3" /> {MODULE_LABELS[moduleKey] || moduleKey}
                                </h4>
                                <div className="grid gap-2">
                                  {moduleKey === "system" && masterAllPermission && (
                                    <label className="flex items-start gap-3 p-2 rounded bg-primary/5 border border-primary/20 cursor-not-allowed">
                                      <input
                                        type="checkbox"
                                        checked={hasAllPermission}
                                        disabled={isSuperAdminRole}
                                        onChange={() => {
                                          if (!isSuperAdminRole) handleTogglePermission(role.id, masterAllPermission.id);
                                        }}
                                        className="mt-1 h-4 w-4"
                                      />
                                      <div>
                                        <p className="text-sm font-medium leading-none">{highlightText(masterAllPermission.name)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {isSuperAdminRole
                                          ? "Terkunci untuk SUPER ADMIN"
                                          : highlightText(masterAllPermission.description || "")}
                                        </p>
                                      </div>
                                    </label>
                                  )}
                                    {permissions.map(perm => (
                                        <label key={perm.id} className="flex items-start gap-3 p-2 rounded hover:bg-accent cursor-pointer transition-colors group">
                                            <input type="checkbox" checked={currentSelected.includes(perm.id)} onChange={() => handleTogglePermission(role.id, perm.id)} className="mt-1 h-4 w-4" />
                                            <div>
                                                <p className="text-sm font-medium leading-none">{highlightText(perm.name)}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{highlightText(perm.description || "")}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                          {Object.keys(groupedPermissions).length === 0 && (
                            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground text-center">
                              Tidak ada permission yang cocok dengan kata kunci pencarian.
                            </div>
                          )}
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={submittingId === role.id}>
                        {submittingId === role.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}
                    </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle>{modalMode === "create" ? "Tambah Peran" : "Edit Peran"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Peran</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} />
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={isPending}>{isPending ? "Memproses..." : "Simpan"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}