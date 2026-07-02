"use client";

import { useMemo, useState } from "react";
import { Button } from "@/src/app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/ui/card";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";

type EffectivePermissionItem = {
  userId: number;
  email: string;
  name: string | null;
  isActive: boolean;
  role: {
    id: number;
    name: string;
  };
  effectivePermissions: {
    hasAllPermission: boolean;
    permissions: string[];
  };
};

export default function EffectivePermissionsPanel() {
  const [userIdInput, setUserIdInput] = useState("");
  const [items, setItems] = useState<EffectivePermissionItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalPermissions = useMemo(
    () => items.reduce((acc, item) => acc + item.effectivePermissions.permissions.length, 0),
    [items]
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = userIdInput.trim();
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
      const res = await fetch(`/api/admin/rbac/effective-permissions${query}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = await res.json();
      if (!res.ok) {
        setItems([]);
        setError(payload?.error || "Gagal memuat data permission.");
        return;
      }

      setItems(Array.isArray(payload?.data) ? payload.data : []);
    } catch {
      setItems([]);
      setError("Terjadi kesalahan saat menghubungi API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Effective Permissions Checker</CardTitle>
        <CardDescription>
          Gunakan panel ini untuk memverifikasi hasil akhir permission per user tanpa membuka database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 max-w-sm">
          <Label htmlFor="userId">Filter User ID (opsional)</Label>
          <Input
            id="userId"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            placeholder="contoh: 12"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchData} disabled={loading}>
            {loading ? "Memuat..." : "Muat Effective Permissions"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Total user: {items.length} | Total permission baris: {totalPermissions}
          </span>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">has all</th>
                <th className="text-left p-2">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.userId} className="border-t align-top">
                  <td className="p-2">
                    <div className="font-medium">{item.name || "(tanpa nama)"}</div>
                    <div className="text-xs text-muted-foreground">{item.email} | ID: {item.userId}</div>
                  </td>
                  <td className="p-2">{item.role.name}</td>
                  <td className="p-2">{item.isActive ? "Active" : "Inactive"}</td>
                  <td className="p-2">{item.effectivePermissions.hasAllPermission ? "Yes" : "No"}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1 max-w-3xl">
                      {item.effectivePermissions.permissions.map((permission) => (
                        <span
                          key={`${item.userId}-${permission}`}
                          className="rounded border px-2 py-0.5 text-xs bg-background"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    Belum ada data. Klik tombol muat untuk mengambil data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
