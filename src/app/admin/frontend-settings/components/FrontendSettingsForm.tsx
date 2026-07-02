"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/ui/card";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Textarea } from "@/src/app/ui/textarea";
import { toast } from "sonner";

type FrontendSettingsPayload = {
  siteTitle: string;
  siteDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  ogImageUrl: string;
  footerText: string;
};

const initialState: FrontendSettingsPayload = {
  siteTitle: "",
  siteDescription: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  ogImageUrl: "",
  footerText: "",
};

export default function FrontendSettingsForm() {
  const [form, setForm] = useState<FrontendSettingsPayload>(initialState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/frontend-settings", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) {
          toast.error(payload?.error || "Gagal memuat frontend settings");
          return;
        }

        const data = payload?.data;
        if (!data) return;

        setForm({
          siteTitle: data.siteTitle || "",
          siteDescription: data.siteDescription || "",
          seoTitle: data.seoTitle || "",
          seoDescription: data.seoDescription || "",
          seoKeywords: data.seoKeywords || "",
          canonicalUrl: data.canonicalUrl || "",
          ogImageUrl: data.ogImageUrl || "",
          footerText: data.footerText || "",
        });
      } catch {
        toast.error("Terjadi kesalahan saat memuat data");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleChange = (field: keyof FrontendSettingsPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/frontend-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error || "Gagal menyimpan frontend settings");
        return;
      }

      toast.success("Frontend settings berhasil disimpan");
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Website Frontend Settings</CardTitle>
        <CardDescription>
          Konfigurasi title, SEO metadata, dan informasi global website frontend.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input id="siteTitle" value={form.siteTitle} onChange={(e) => handleChange("siteTitle", e.target.value)} disabled={loading || saving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea id="siteDescription" rows={3} value={form.siteDescription} onChange={(e) => handleChange("siteDescription", e.target.value)} disabled={loading || saving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input id="seoTitle" value={form.seoTitle} onChange={(e) => handleChange("seoTitle", e.target.value)} disabled={loading || saving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seoDescription">SEO Description</Label>
            <Textarea id="seoDescription" rows={3} value={form.seoDescription} onChange={(e) => handleChange("seoDescription", e.target.value)} disabled={loading || saving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seoKeywords">SEO Keywords (comma-separated)</Label>
            <Input id="seoKeywords" value={form.seoKeywords} onChange={(e) => handleChange("seoKeywords", e.target.value)} disabled={loading || saving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input id="canonicalUrl" value={form.canonicalUrl} onChange={(e) => handleChange("canonicalUrl", e.target.value)} disabled={loading || saving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ogImageUrl">OG Image URL</Label>
            <Input id="ogImageUrl" value={form.ogImageUrl} onChange={(e) => handleChange("ogImageUrl", e.target.value)} disabled={loading || saving} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Input id="footerText" value={form.footerText} onChange={(e) => handleChange("footerText", e.target.value)} disabled={loading || saving} />
          </div>

          <Button type="submit" disabled={loading || saving}>
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
